const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_temporary_key_2026';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No temporary authentication token provided.'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired temporary token. Please log in again.'
            });
        }

        db.get("SELECT * FROM sessions WHERE user_id = ? AND refresh_token = ?", [decodedUser.id, token], (dbErr, session) => {
            if (dbErr) return res.status(500).json({ success: false, message: 'Database error' });

            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: 'Session has been revoked or terminated. Please sign in again.'
                });
            }

            req.user = decodedUser;
            next();
        });
    });
};

const checkRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        if (allowedRoles.includes(req.user.role)) {
            return next(); 
        }

        return res.status(403).json({
            success: false,
            message: `Forbidden. Role '${req.user.role}' does not have permission to perform this action.`
        });
    };
};

module.exports = { authenticateToken, checkRole };