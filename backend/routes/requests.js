const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/requests/custom
// @desc    Get all pending custom book requests (Admin/Librarian)
// @access  Private
router.get('/custom', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  try {
    let query = `
      SELECT 
        c.id AS _id, c.title, c.author, c.edition, c.status, c.request_date AS requestDate,
        u.user_id AS userId, u.full_name AS userName, u.email, u.role, u.roll_no AS rollNo, u.department
      FROM custom_book_requests c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.status = 'pending'
    `;

    // Wait, the requirement says "in admin no student and professor book reuest only librarian send book reuest see"
    // Meaning Admins ONLY see Librarian requests.
    if (req.user.role === 'Admin') {
       query += ` AND u.role = 'Librarian'`;
    }

    query += ` ORDER BY c.request_date ASC`;

    const [requests] = await db.query(query);

    const formatted = requests.map(r => ({
       _id: r._id,
       status: r.status,
       requestDate: r.requestDate,
       book: {
          title: r.title,
          author: r.author,
          edition: r.edition,
          coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300'
       },
       user: {
          _id: r.userId,
          name: r.userName,
          email: r.email,
          role: r.role.charAt(0).toUpperCase() + r.role.slice(1),
          rollNo: r.rollNo,
          department: r.department
       },
       isCustom: true
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/requests/custom
// @desc    Create a new custom book request (Student/Professor)
// @access  Private
router.post('/custom', protect, async (req, res) => {
  try {
    const { title, author, edition } = req.body;
    const userId = req.user.id;
    
    if (!title || !author) {
       return res.status(400).json({ message: 'Title and author are required' });
    }

    // Check if user already requested this generic combo and it is pending
    const [existing] = await db.query(
      'SELECT id FROM custom_book_requests WHERE title = ? AND author = ? AND user_id = ? AND status = "pending"', 
      [title, author, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You already have a pending request for this book' });
    }

    const [result] = await db.query(
      'INSERT INTO custom_book_requests (user_id, title, author, edition) VALUES (?, ?, ?, ?)',
      [userId, title, author, edition || null]
    );

    res.status(201).json({
      _id: result.insertId,
      message: 'Custom request submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   GET /api/requests
// @desc    Get all pending book requests (Admin/Librarian)
// @access  Private
router.get('/', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  try {
    let query = `
      SELECT 
        r.id AS _id, r.status, r.request_date AS requestDate,
        b.book_id AS bookId, b.title, b.author,
        u.user_id AS userId, u.full_name AS userName, u.email, u.role, u.roll_no AS rollNo, u.department
      FROM book_requests r
      JOIN books b ON r.book_id = b.book_id
      JOIN users u ON r.user_id = u.user_id
      WHERE r.status = 'pending'
    `;

    // Filter requests so Admins only see exact Librarian requests
    if (req.user.role === 'Admin') {
       query += ` AND u.role = 'Librarian'`;
    }

    query += ` ORDER BY r.request_date ASC`;

    const [requests] = await db.query(query);

    // Format response to match frontend expectations
    const formatted = requests.map(r => ({
       _id: r._id,
       status: r.status,
       requestDate: r.requestDate,
       book: {
          _id: r.bookId,
          title: r.title,
          author: r.author,
          coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300'
       },
       user: {
          _id: r.userId,
          name: r.userName,
          email: r.email,
          role: r.role.charAt(0).toUpperCase() + r.role.slice(1),
          rollNo: r.rollNo,
          department: r.department
       }
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/requests
// @desc    Create a new book request (Student/Professor)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    // Check if book exists
    const [books] = await db.query('SELECT * FROM books WHERE book_id = ?', [bookId]);
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if already requested and pending
    const [existing] = await db.query(
      'SELECT id FROM book_requests WHERE book_id = ? AND user_id = ? AND status = "pending"', 
      [bookId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You already have a pending request for this book' });
    }

    const [result] = await db.query(
      'INSERT INTO book_requests (book_id, user_id) VALUES (?, ?)',
      [bookId, userId]
    );

    res.status(201).json({
      _id: result.insertId,
      message: 'Request submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PUT /api/requests/:id/:action
// @desc    Approve or reject a book request (Admin/Librarian)
// @access  Private
router.put('/:id/:action', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id, action } = req.params; // action = 'approve' or 'reject'
    
    if (action !== 'approve' && action !== 'reject') {
       await connection.rollback();
       return res.status(400).json({ message: 'Invalid action parameter' });
    }

    // Get the request details
    const [requests] = await connection.query('SELECT * FROM book_requests WHERE id = ? FOR UPDATE', [id]);
    
    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requests[0];

    if (request.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    if (action === 'reject') {
       await connection.query('UPDATE book_requests SET status = "rejected" WHERE id = ?', [id]);
       await connection.commit();
       return res.json({ message: 'Request rejected' });
    }

    if (action === 'approve') {
       // Validate stock availability
       const [books] = await connection.query('SELECT available_quantity FROM books WHERE book_id = ? FOR UPDATE', [request.book_id]);
       if (books.length === 0 || books[0].available_quantity <= 0) {
         await connection.rollback();
         return res.status(400).json({ message: 'Book is out of stock. Cannot approve.' });
       }

       // Update Request Status
       await connection.query('UPDATE book_requests SET status = "approved" WHERE id = ?', [id]);
       // Fetch the requesting user's role to determine issue length
       const [tUsers] = await connection.query('SELECT role FROM users WHERE user_id = ?', [request.user_id]);
       let days = 7; // Default
       if (tUsers.length > 0) {
          if (tUsers[0].role === 'student') days = 30;
          else if (tUsers[0].role === 'professor') days = 60;
       }

       // Create Issue Record
       const dueDate = new Date();
       dueDate.setDate(dueDate.getDate() + days);

       const [issueResult] = await connection.query(
         'INSERT INTO issued_books (book_id, user_id, issued_by, issue_date, due_date, status) VALUES (?, ?, ?, NOW(), ?, ?)',
         [request.book_id, request.user_id, req.user.id, dueDate, 'issued']
       );

       // Decrease Availability
       await connection.query('UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = ?', [request.book_id]);

       await connection.commit();
       return res.json({ 
          message: 'Request approved and book issued',
          issueId: issueResult.insertId
       });
    }

  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
    if (connection) connection.release();
  }
});

// @route   PUT /api/requests/custom/:id/:action
// @desc    Approve or reject a custom book request (Admin/Librarian)
// @access  Private
router.put('/custom/:id/:action', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  try {
    const { id, action } = req.params; // action = 'approve' or 'reject'
    
    if (action !== 'approve' && action !== 'reject') {
       return res.status(400).json({ message: 'Invalid action parameter' });
    }

    const [requests] = await db.query('SELECT * FROM custom_book_requests WHERE id = ?', [id]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requests[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    if (action === 'reject') {
       await db.query('UPDATE custom_book_requests SET status = "rejected" WHERE id = ?', [id]);
       return res.json({ message: 'Custom request rejected' });
    }

    if (action === 'approve') {
       await db.query('UPDATE custom_book_requests SET status = "approved" WHERE id = ?', [id]);
       return res.json({ message: 'Custom request approved' });
    }

  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
