const express = require('express');
const router = express.Router();
const { loginUser, registerUser, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');

// Standard Auth
router.post('/login', loginUser);
router.post('/register', registerUser);

// Password Reset Flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;