const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    let query = 'SELECT user_id AS _id, full_name AS name, email, role, roll_no, department, created_at AS createdAt FROM users';
    if (req.user.role === 'Librarian') query += " WHERE role IN ('student', 'professor')";
    const [users] = await db.query(query);
    const mapped = users.map(u => ({ ...u, role: u.role.charAt(0).toUpperCase() + u.role.slice(1) }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role, roll_no, department } = req.body;
  try {
    if (req.user.role === 'Librarian' && (role === 'Admin' || role === 'Librarian')) {
      return res.status(403).json({ message: 'Librarians can only create Student or Professor accounts' });
    }
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const dbRole = role.toLowerCase();
    const finalRollNo = dbRole === 'student' ? (roll_no || null) : null;
    const finalDepartment = (dbRole === 'student' || dbRole === 'professor') ? (department || null) : null;

    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, role, roll_no, department) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, dbRole, finalRollNo, finalDepartment]
    );
    res.status(201).json({ _id: result.insertId, name, email, role });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    const requesterRole = req.user.role; // This will be 'Admin' or 'Librarian'

    // 1. Find the user being deleted to check their role
    const [targetUsers] = await db.query('SELECT role FROM users WHERE user_id = ?', [userIdToDelete]);

    if (targetUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetRole = targetUsers[0].role;

    // 2. SMART SECURITY CHECK: 
    // If the requester is a Librarian, block them from deleting Admins or other Librarians
    if (requesterRole === 'Librarian' && (targetRole === 'Admin' || targetRole === 'Librarian')) {
      return res.status(403).json({ message: 'Access Denied: Librarians can only delete Students and Professors.' });
    }

    // 3. If they pass the check (or if they are an Admin), delete the user
    await db.query('DELETE FROM users WHERE user_id = ?', [userIdToDelete]);
    res.json({ message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};  
// Add this at the bottom of userController.js
exports.getUserByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Search by email, roll_no, or exact user_id
    const [users] = await db.query(
      'SELECT user_id AS _id, full_name AS name, email, role, roll_no, department FROM users WHERE email = ? OR roll_no = ? OR user_id = ?',
      [identifier, identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found. Please check the Email or Roll No.' });
    }

    const user = users[0];
    
    // Optional: Prevent issuing books to Admins
    if (user.role.toLowerCase() === 'admin') {
      return res.status(403).json({ message: 'Cannot issue books to Admin accounts.' });
    }

    res.json({ ...user, role: user.role.charAt(0).toUpperCase() + user.role.slice(1) });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Bulletproof Update User Function
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // We also accept 'name' just in case the frontend sends it instead of 'full_name'
    const { full_name, name, email, role, department, roll_no } = req.body;

    // 1. Check if user exists
    const [user] = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. THE FIX: Force the role to lowercase so MySQL accepts it!
    const dbRole = role ? role.toLowerCase() : user[0].role;
    const finalName = full_name || name || user[0].full_name;

    // 3. Clean up data (Admins don't need roll numbers or departments)
    const finalRollNo = dbRole === 'student' ? (roll_no || null) : null;
    const finalDepartment = (dbRole === 'student' || dbRole === 'professor') ? (department || null) : null;

    // 4. Update the record
    await db.query(
      `UPDATE users 
       SET full_name = ?, email = ?, role = ?, department = ?, roll_no = ? 
       WHERE user_id = ?`,
      [finalName, email, dbRole, finalDepartment, finalRollNo, id]
    );

    res.json({ message: 'User updated successfully!' });
  } catch (error) {
    console.error('🔥 Update User Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};