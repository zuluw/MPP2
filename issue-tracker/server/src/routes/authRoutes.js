const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
        });
    }
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/profile', authenticateToken, authController.getProfile);

router.get('/sessions', authenticateToken, authController.getSessions);
router.delete('/sessions/:id', authenticateToken, authController.terminateSession);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;