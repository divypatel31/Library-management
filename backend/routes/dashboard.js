const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics based on role
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const role = req.user.role;
    
    // Default base stats
    let totalUsers = 0;
    let totalBooks = 0;
    let totalIssued = 0;
    let pendingFinesCount = 0;
    let pendingRequestsCount = 0;

    if (role === 'Admin' || role === 'Librarian') {
       const [users] = await db.query('SELECT COUNT(*) as count FROM users');
       totalUsers = users[0].count;

       const [books] = await db.query('SELECT COUNT(*) as count FROM books');
       totalBooks = books[0].count;

       const [issued] = await db.query('SELECT COUNT(*) as count FROM issued_books WHERE status = "issued"');
       totalIssued = issued[0].count;

       const [fines] = await db.query('SELECT COUNT(*) as count FROM fines WHERE status = "pending" AND amount > 0');
       pendingFinesCount = fines[0].count;

       const [requests] = await db.query('SELECT COUNT(*) as count FROM book_requests WHERE status = "pending"');
       pendingRequestsCount = requests[0].count;
    }

    if (role === 'Student' || role === 'Professor') {
       const [issued] = await db.query('SELECT COUNT(*) as count FROM issued_books WHERE user_id = ? AND status = "issued"', [req.user.id]);
       totalIssued = issued[0].count;

       const [fines] = await db.query('SELECT COUNT(*) as count FROM fines WHERE user_id = ? AND status = "pending" AND amount > 0', [req.user.id]);
       pendingFinesCount = fines[0].count;
    }

    res.json({
      role,
      totalUsers,
      totalBooks,
      totalIssued,
      pendingFinesCount,
      pendingRequestsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/dashboard/chart
// @desc    Get chart data (Mock data for charts on frontend)
// @access  Private
router.get('/chart', protect, async (req, res) => {
   try {
     // A mock structure of 7 days issues vs returns
     res.json({
       labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
       datasets: [
         {
           label: 'Books Issued',
           data: [12, 19, 3, 5, 2, 3, 10], // Mocked integers
         },
         {
           label: 'Books Returned',
           data: [5, 12, 1, 2, 6, 4, 8],
         }
       ]
     })
   } catch (error) {
     res.status(500).json({ message: 'Server error' });
   }
});

module.exports = router;
