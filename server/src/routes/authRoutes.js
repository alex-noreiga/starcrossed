const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Registration and login
router.post('/register', authController.register);
router.post('/login', authController.login);

// User profile
router.get('/profile', authMiddleware.authenticate, authController.getUserProfile);
router.put('/profile', authMiddleware.authenticate, authController.updateProfile);
router.put('/change-password', authMiddleware.authenticate, authController.changePassword);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

// Password reset
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Social logins
router.post('/google', authController.googleLogin);
router.post('/facebook', authController.facebookLogin);

module.exports = router;
