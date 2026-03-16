// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  // ... your implementation
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };
};

module.exports = { protect, authorize }; // Ensure this line exists