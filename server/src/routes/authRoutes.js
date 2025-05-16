const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware.authenticate, authController.getUserProfile);

module.exports = router;
