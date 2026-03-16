const db = require('../config/db');
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      const [users] = await db.query('SELECT user_id, full_name, email, role FROM users WHERE user_id = ?', [decoded.id]);
      
      if (users.length === 0) {
         return res.status(401).json({ message: 'User not found' });
      }

      const user = users[0];
      req.user = {
         id: user.user_id,
         name: user.full_name,
         email: user.email,
         role: user.role.charAt(0).toUpperCase() + user.role.slice(1)
      };
      
      // Let the req user contain the lowercase role too just in case it's needed for DB queries
      req.user.dbRole = user.role; 

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
