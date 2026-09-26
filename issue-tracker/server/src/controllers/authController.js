const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const { sendPasswordResetEmail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_temporary_key_2026';
const JWT_EXPIRES_IN = '15m';

exports.register = (req, res) => {
    const { email, password, role = 'viewer' } = req.body;

    if (!email || !password || password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Email and password (minimum 6 characters) are required.'
        });
    }

    const validRoles = ['admin', 'developer', 'viewer'];
    const assignedRole = validRoles.includes(role) ? role : 'viewer';

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)";
    db.run(sql, [email.toLowerCase(), hashedPassword, assignedRole], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ success: false, message: 'User with this email already exists.' });
            }
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { id: this.lastID, email, role: assignedRole }
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        db.run(
            "INSERT INTO sessions (user_id, refresh_token, ip_address, user_agent) VALUES (?, ?, ?, ?)",
            [user.id, token, ipAddress, userAgent],
            function (sessionErr) {
                if (sessionErr) console.error('Session logging error:', sessionErr.message);

                res.status(200).json({
                    success: true,
                    message: 'Authentication successful',
                    token: token,
                    expiresIn: JWT_EXPIRES_IN,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    });
};

exports.getProfile = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};

exports.getSessions = (req, res) => {
    db.all(
        "SELECT id, ip_address, user_agent, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC",
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.status(200).json({ success: true, count: rows.length, data: rows });
        }
    );
};

exports.terminateSession = (req, res) => {
    const sessionId = req.params.id;
    db.run(
        "DELETE FROM sessions WHERE id = ? AND user_id = ?",
        [sessionId, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Session not found or already terminated.' });
            }
            res.status(200).json({ success: true, message: 'Session terminated successfully.' });
        }
    );
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], async (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If the email is registered, a password reset link has been sent.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        
        const sql = `
            INSERT INTO password_resets (user_id, token, expires_at)
            VALUES (?, ?, datetime('now', '+15 minutes'))
        `;

        db.run(sql, [user.id, resetToken], async function (insertErr) {
            if (insertErr) return res.status(500).json({ success: false, message: 'Database error' });

            try {
                const previewUrl = await sendPasswordResetEmail(user.email, resetToken);

                res.status(200).json({
                    success: true,
                    message: 'Password reset link sent to your email.',
                    previewUrl: previewUrl
                });
            } catch (mailErr) {
                console.error('Mail error:', mailErr);
                res.status(500).json({ success: false, message: 'Failed to send email.' });
            }
        });
    });
};

exports.resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Token and new password (minimum 6 characters) are required.'
        });
    }

    const sql = `
        SELECT * FROM password_resets
        WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `;

    db.get(sql, [token], (err, resetRecord) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token.'
            });
        }

        const newHash = bcrypt.hashSync(newPassword, 10);

        db.run("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, resetRecord.user_id], (updateErr) => {
            if (updateErr) return res.status(500).json({ success: false, message: 'Failed to update password' });

            db.run("UPDATE password_resets SET used = 1 WHERE id = ?", [resetRecord.id], () => {

                db.run("DELETE FROM sessions WHERE user_id = ?", [resetRecord.user_id], function (delErr) {
                    console.log(`>>> [SECURITY] Password reset: deleted ${this.changes} active sessions for user ID ${resetRecord.user_id}`);

                    res.status(200).json({
                        success: true,
                        message: 'Password has been reset successfully. All active sessions have been terminated. Please sign in with your new password.'
                    });
                });
            });
        });
    });
};