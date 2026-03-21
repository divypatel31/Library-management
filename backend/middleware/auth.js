const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Get user from the database
      const [users] = await db.query('SELECT user_id AS id, full_name AS name, email, role FROM users WHERE user_id = ?', [decoded.id]);
      
      if (users.length === 0) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach the user to the request object
      req.user = users[0];
      
      // Standardize the role capitalization so authorize() works correctly
      req.user.role = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);

      return next(); // CRITICAL: This tells the server to move to the dashboard controller
    } catch (error) {
      console.error('Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'User role not authorized' });
    }
    return next();
  };
};

module.exports = { protect, authorize };