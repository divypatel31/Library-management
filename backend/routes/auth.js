const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/authController');

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   POST /api/auth/register
router.post('/register', registerUser);

module.exports = router;