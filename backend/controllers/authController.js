const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login logic
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    // If user doesn't exist
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Generate Token
      const token = jwt.sign(
        { id: user.user_id, role: user.role }, 
        process.env.JWT_SECRET || 'secret123', 
        { expiresIn: '30d' }
      );
      
      // Send response matching what frontend expects
      res.json({
        _id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Registration logic
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await db.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role ? role.toLowerCase() : 'student']
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};