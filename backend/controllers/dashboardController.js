const db = require('../config/db');

exports.getStats = async (req, res) => {
  console.log(`[DASHBOARD] Fetching stats for role: ${req.user.role}`);
  try {
    const role = req.user.role;
    let totalUsers = 0, totalBooks = 0, totalIssued = 0, pendingFinesCount = 0, pendingRequestsCount = 0;

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
    } else if (role === 'Student' || role === 'Professor') {
       const [issued] = await db.query('SELECT COUNT(*) as count FROM issued_books WHERE user_id = ? AND status = "issued"', [req.user.id]);
       totalIssued = issued[0].count;
       const [fines] = await db.query('SELECT COUNT(*) as count FROM fines WHERE user_id = ? AND status = "pending" AND amount > 0', [req.user.id]);
       pendingFinesCount = fines[0].count;
    }

    console.log(`[DASHBOARD] Stats successfully calculated. Sending response.`);
    return res.json({ role, totalUsers, totalBooks, totalIssued, pendingFinesCount, pendingRequestsCount });
  } catch (error) {
    console.error(`[DASHBOARD ERROR]:`, error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

exports.getChartData = async (req, res) => {
   console.log(`[DASHBOARD] Fetching chart data`);
   try {
     return res.json({
       labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
       datasets: [
         { label: 'Books Issued', data: [12, 19, 3, 5, 2, 3, 10] },
         { label: 'Books Returned', data: [5, 12, 1, 2, 6, 4, 8] }
       ]
     });
   } catch (error) {
     return res.status(500).json({ message: 'Server error' });
   }
};