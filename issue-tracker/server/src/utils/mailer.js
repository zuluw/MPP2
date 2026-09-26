const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
    if (!transporter) {
        try {
            const testAccount = await Promise.race([
                nodemailer.createTestAccount(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP timeout')), 3000))
            ]);

            transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: { user: testAccount.user, pass: testAccount.pass }
            });
            console.log('>>> Test SMTP Server (Ethereal) ready.');
        } catch (err) {
            console.warn('>>> Ethereal SMTP unavailable, using resilient local mail logger.');
            transporter = nodemailer.createTransport({
                streamTransport: true,
                newline: 'windows'
            });
        }
    }
    return transporter;
}

async function sendPasswordResetEmail(toEmail, resetToken) {
    const mailClient = await getTransporter();
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    const info = await mailClient.sendMail({
        from: '"Issue Tracker Security" <security@tracker.com>',
        to: toEmail,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Your single-use temporary token: <code>${resetToken}</code></p>
                <p><a href="${resetLink}">Reset Password Link</a></p>
            </div>
        `
    });

    let previewUrl = nodemailer.getTestMessageUrl(info);
    if (!previewUrl) {
        previewUrl = resetLink;
    }

    console.log(`>>> [PASSWORD RESET TOKEN]: ${resetToken}`);
    console.log(`>>> [PASSWORD RESET LINK]: ${previewUrl}`);
    return previewUrl;
}

module.exports = { sendPasswordResetEmail };