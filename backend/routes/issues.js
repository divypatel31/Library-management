const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/issues
// @desc    Get all issues
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = `
      SELECT 
        i.issue_id AS _id, i.issue_date AS issueDate, i.due_date AS dueDate, 
        i.return_date AS returnDate, i.status,
        b.book_id AS bookId, b.title, b.author,
        u.user_id AS userId, u.full_name AS name, u.email, u.role, u.roll_no AS rollNo, u.department,
        (SELECT SUM(amount) FROM fines f WHERE f.issue_id = i.issue_id AND f.status = 'pending') AS fineAmount
      FROM issued_books i
      JOIN books b ON i.book_id = b.book_id
      JOIN users u ON i.user_id = u.user_id
    `;
    
    let params = [];
    
    // If Student/Professor, only return their issues
    if (req.user.role === 'Student' || req.user.role === 'Professor') {
      query += ` WHERE i.user_id = ?`;
      params.push(req.user.id);
    }
    
    query += ` ORDER BY i.issue_date DESC`;

    const [issues] = await db.query(query, params);
    
    // Format response to match frontend expectations
    const formatted = issues.map(issue => ({
       _id: issue._id,
       issueDate: issue.issueDate,
       dueDate: issue.dueDate,
       returnDate: issue.returnDate,
       status: issue.status.charAt(0).toUpperCase() + issue.status.slice(1),
       fineAmount: issue.fineAmount || 0,
       book: {
          _id: issue.bookId,
          title: issue.title,
          author: issue.author,
          coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300'
       },
       user: {
          _id: issue.userId,
          name: issue.name,
          email: issue.email,
          role: issue.role.charAt(0).toUpperCase() + issue.role.slice(1),
          rollNo: issue.rollNo,
          department: issue.department
       }
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/issues
// @desc    Issue a book
// @access  Private/Librarian/Admin
router.post('/', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { bookId, userId, durationDays } = req.body;

    const [books] = await connection.query('SELECT available_quantity FROM books WHERE book_id = ? FOR UPDATE', [bookId]);
    if (books.length === 0 || books[0].available_quantity <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Determine issue duration based on target user's role
    const [targetUsers] = await connection.query('SELECT role FROM users WHERE user_id = ?', [userId]);
    if (targetUsers.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User not found' });
    }
    
    let days = durationDays || 7; // Default fallback
    if (targetUsers[0].role === 'student') {
       days = 30;
    } else if (targetUsers[0].role === 'professor') {
       days = 60;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const [result] = await connection.query(
      'INSERT INTO issued_books (book_id, user_id, issued_by, issue_date, due_date, status) VALUES (?, ?, ?, NOW(), ?, ?)',
      [bookId, userId, req.user.id, dueDate, 'issued']
    );

    await connection.query('UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = ?', [bookId]);

    await connection.commit();

    res.status(201).json({
      _id: result.insertId,
      book: bookId,
      user: userId,
      dueDate,
      status: 'Issued'
    });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
    if (connection) connection.release();
  }
});

// @route   PUT /api/issues/:id/return
// @desc    Return a book and calculate fine
// @access  Private/Librarian/Admin
router.put('/:id/return', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const issueId = req.params.id;

    const [issues] = await connection.query('SELECT * FROM issued_books WHERE issue_id = ? FOR UPDATE', [issueId]);

    if (issues.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Issue record not found' });
    }

    const issue = issues[0];

    if (issue.status === 'returned') {
      await connection.rollback();
      return res.status(400).json({ message: 'Book already returned' });
    }

    const returnDate = new Date();
    
    await connection.query(
      'UPDATE issued_books SET status = ?, return_date = ? WHERE issue_id = ?',
      ['returned', returnDate, issueId]
    );

    // Calculate Fines (2 per day late)
    let fine = 0;
    const dueDate = new Date(issue.due_date);
    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fine = diffDays * 2;

      await connection.query(
         'INSERT INTO fines (issue_id, user_id, amount, status) VALUES (?, ?, ?, ?)',
         [issueId, issue.user_id, fine, 'pending']
      );
    }

    // Increase book availability
    await connection.query('UPDATE books SET available_quantity = available_quantity + 1 WHERE book_id = ?', [issue.book_id]);

    await connection.commit();

    res.json({ message: 'Book returned successfully', fine });
  } catch (error) {
     if (connection) await connection.rollback();
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
     if (connection) connection.release();
  }
});

module.exports = router;
