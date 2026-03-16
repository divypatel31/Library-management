const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin/Librarian
router.get('/', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  try {
    let query = 'SELECT user_id AS _id, full_name AS name, email, role, roll_no, department, created_at AS createdAt FROM users';
    
    // If the requesting user is a Librarian, only show Students and Professors
    if (req.user.role === 'Librarian') {
       query += " WHERE role IN ('student', 'professor')";
    }
    
    const [users] = await db.query(query);
    
    const mapped = users.map(u => ({
      ...u,
      role: u.role.charAt(0).toUpperCase() + u.role.slice(1)
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private/Admin/Librarian
router.post('/', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  const { name, email, password, role, roll_no, department } = req.body;

  try {
    if (req.user.role === 'Librarian' && (role === 'Admin' || role === 'Librarian')) {
      return res.status(403).json({ message: 'Librarians can only create Student or Professor accounts' });
    }

    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const dbRole = role.toLowerCase();

    // Determine final values to insert based on rules
    const finalRollNo = dbRole === 'student' ? (roll_no || null) : null;
    const finalDepartment = (dbRole === 'student' || dbRole === 'professor') ? (department || null) : null;

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, role, roll_no, department) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, dbRole, finalRollNo, finalDepartment]
    );

    res.status(201).json({
      _id: result.insertId,
      name,
      email,
      role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
