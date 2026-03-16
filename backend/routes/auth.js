const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); //

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // 1. Hash password manually since Mongoose hooks are gone
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Use MySQL query
    await db.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'student']
    );

    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;