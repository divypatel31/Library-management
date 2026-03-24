const db = require('../config/db');

exports.getStats = async (req, res) => {
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

    return res.json({ role, totalUsers, totalBooks, totalIssued, pendingFinesCount, pendingRequestsCount });
  } catch (error) {
    console.error(`[DASHBOARD ERROR]:`, error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

exports.getChartData = async (req, res) => {
   try {
     const labels = [];
     const dates = [];
     const issuedData = [0, 0, 0, 0, 0, 0, 0];
     const returnedData = [0, 0, 0, 0, 0, 0, 0];

     // 1. Generate the last 7 days (Labels and SQL-friendly date strings)
     for (let i = 6; i >= 0; i--) {
       const d = new Date();
       d.setDate(d.getDate() - i);
       
       // E.g. "Mon", "Tue"
       labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

       // E.g. "2024-03-20" to match MySQL format
       const year = d.getFullYear();
       const month = String(d.getMonth() + 1).padStart(2, '0');
       const day = String(d.getDate()).padStart(2, '0');
       dates.push(`${year}-${month}-${day}`);
     }

     // 2. Fetch Issues from the last 7 days
     const [issuedResults] = await db.query(`
       SELECT DATE_FORMAT(issue_date, '%Y-%m-%d') as dateStr, COUNT(*) as count
       FROM issued_books
       WHERE issue_date >= DATE(NOW() - INTERVAL 6 DAY)
       GROUP BY dateStr
     `);

     // 3. Fetch Returns from the last 7 days
     const [returnedResults] = await db.query(`
       SELECT DATE_FORMAT(return_date, '%Y-%m-%d') as dateStr, COUNT(*) as count
       FROM issued_books
       WHERE return_date IS NOT NULL AND return_date >= DATE(NOW() - INTERVAL 6 DAY)
       GROUP BY dateStr
     `);

     // 4. Map the DB results into our arrays
     issuedResults.forEach(row => {
       const idx = dates.indexOf(row.dateStr);
       if (idx !== -1) issuedData[idx] = row.count;
     });

     returnedResults.forEach(row => {
       const idx = dates.indexOf(row.dateStr);
       if (idx !== -1) returnedData[idx] = row.count;
     });

     // 5. Send to frontend
     return res.json({
       labels: labels,
       datasets: [
         { label: 'Books Issued', data: issuedData },
         { label: 'Books Returned', data: returnedData }
       ]
     });
   } catch (error) {
     console.error(`[CHART ERROR]:`, error);
     return res.status(500).json({ message: 'Server error: ' + error.message });
   }
};