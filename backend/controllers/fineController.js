const db = require('../config/db');

// 1. Fetch Fines (Role-based)
exports.getFines = async (req, res) => {
  try {
    const { role, id } = req.user;

    let query = `
      SELECT 
        f.fine_id AS _id, 
        f.amount, 
        f.status, 
        f.created_at AS dateIssued,
        
        u.user_id AS userId, 
        u.full_name AS userName, 
        u.email AS userEmail, 
        u.roll_no AS userRollNo,
        
        b.title AS bookTitle
      FROM fines f
      JOIN users u ON f.user_id = u.user_id
      JOIN issued_books i ON f.issue_id = i.issue_id
      JOIN books b ON i.book_id = b.book_id
    `;

    const queryParams = [];

    // SMART SECURITY: Students and Professors only see their own fines!
    if (role === 'Student' || role === 'Professor') {
      query += ` WHERE f.user_id = ?`;
      queryParams.push(id);
    }

    // Sort so unpaid/pending fines show up at the top
    query += ` ORDER BY f.status ASC, f.created_at DESC`;

    const [rows] = await db.query(query, queryParams);

    // Format the data cleanly for your React frontend
    const formattedFines = rows.map(row => ({
      _id: row._id,
      amount: row.amount,
      status: row.status,
      date: row.dateIssued,
      bookTitle: row.bookTitle,
      user: {
        _id: row.userId,
        name: row.userName,
        email: row.userEmail,
        rollNo: row.userRollNo
      }
    }));

    res.json(formattedFines);
  } catch (error) {
    console.error('🔥 Fetch Fines Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// 2. Mark a Fine as Paid (Staff Only)
exports.payFine = async (req, res) => {
  try {
    const fineId = req.params.id;

    // Optional: You could record a `paid_date` here if your table has that column
    const [result] = await db.query(
      'UPDATE fines SET status = "paid" WHERE fine_id = ?',
      [fineId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Fine record not found' });
    }

    res.json({ message: 'Fine successfully marked as paid!' });
  } catch (error) {
    console.error('🔥 Pay Fine Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};