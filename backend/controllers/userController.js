const db = require('../config/db');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    let query = 'SELECT user_id AS _id, full_name AS name, email, role, roll_no, department FROM users';
    if (req.user.role === 'Librarian') query += " WHERE role IN ('student', 'professor')";
    const [users] = await db.query(query);
    res.json(users.map(u => ({ ...u, role: u.role.charAt(0).toUpperCase() + u.role.slice(1) })));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};