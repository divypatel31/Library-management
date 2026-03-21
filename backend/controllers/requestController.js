const db = require('../config/db');

exports.getCustomRequests = async (req, res) => {
  try {
    let query = `
      SELECT c.id AS _id, c.title, c.author, c.edition, c.status, c.request_date AS requestDate,
             u.user_id AS userId, u.full_name AS userName, u.email, u.role, u.roll_no AS rollNo, u.department
      FROM custom_book_requests c JOIN users u ON c.user_id = u.user_id WHERE c.status = 'pending'
    `;
    if (req.user.role === 'Admin') query += ` AND u.role = 'Librarian'`;
    query += ` ORDER BY c.request_date ASC`;

    const [requests] = await db.query(query);
    const formatted = requests.map(r => ({
       _id: r._id, status: r.status, requestDate: r.requestDate,
       book: { title: r.title, author: r.author, edition: r.edition, coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300' },
       user: { _id: r.userId, name: r.userName, email: r.email, role: r.role.charAt(0).toUpperCase() + r.role.slice(1), rollNo: r.rollNo, department: r.department }, isCustom: true
    }));
    res.json(formatted);
  } catch (error) { res.status(500).json({ message: 'Server error: ' + error.message }); }
};

exports.createCustomRequest = async (req, res) => {
  try {
    const { title, author, edition } = req.body;
    if (!title || !author) return res.status(400).json({ message: 'Title and author are required' });
    const [existing] = await db.query('SELECT id FROM custom_book_requests WHERE title = ? AND author = ? AND user_id = ? AND status = "pending"', [title, author, req.user.id]);
    if (existing.length > 0) return res.status(400).json({ message: 'You already have a pending request' });

    const [result] = await db.query('INSERT INTO custom_book_requests (user_id, title, author, edition) VALUES (?, ?, ?, ?)', [req.user.id, title, author, edition || null]);
    res.status(201).json({ _id: result.insertId, message: 'Custom request submitted successfully' });
  } catch (error) { res.status(500).json({ message: 'Server error: ' + error.message }); }
};

exports.getRequests = async (req, res) => {
  try {
    let query = `
      SELECT r.id AS _id, r.status, r.request_date AS requestDate, b.book_id AS bookId, b.title, b.author,
             u.user_id AS userId, u.full_name AS userName, u.email, u.role, u.roll_no AS rollNo, u.department
      FROM book_requests r JOIN books b ON r.book_id = b.book_id JOIN users u ON r.user_id = u.user_id WHERE r.status = 'pending'
    `;
    if (req.user.role === 'Admin') query += ` AND u.role = 'Librarian'`;
    query += ` ORDER BY r.request_date ASC`;

    const [requests] = await db.query(query);
    const formatted = requests.map(r => ({
       _id: r._id, status: r.status, requestDate: r.requestDate,
       book: { _id: r.bookId, title: r.title, author: r.author, coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300' },
       user: { _id: r.userId, name: r.userName, email: r.email, role: r.role.charAt(0).toUpperCase() + r.role.slice(1), rollNo: r.rollNo, department: r.department }
    }));
    res.json(formatted);
  } catch (error) { res.status(500).json({ message: 'Server error: ' + error.message }); }
};

exports.createRequest = async (req, res) => {
  try {
    const { bookId } = req.body;
    const [books] = await db.query('SELECT * FROM books WHERE book_id = ?', [bookId]);
    if (books.length === 0) return res.status(404).json({ message: 'Book not found' });
    const [existing] = await db.query('SELECT id FROM book_requests WHERE book_id = ? AND user_id = ? AND status = "pending"', [bookId, req.user.id]);
    if (existing.length > 0) return res.status(400).json({ message: 'You already have a pending request' });

    const [result] = await db.query('INSERT INTO book_requests (book_id, user_id) VALUES (?, ?)', [bookId, req.user.id]);
    res.status(201).json({ _id: result.insertId, message: 'Request submitted successfully' });
  } catch (error) { res.status(500).json({ message: 'Server error: ' + error.message }); }
};

exports.processRequest = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id, action } = req.params;
    if (action !== 'approve' && action !== 'reject') { await connection.rollback(); return res.status(400).json({ message: 'Invalid action parameter' }); }
    
    const [requests] = await connection.query('SELECT * FROM book_requests WHERE id = ? FOR UPDATE', [id]);
    if (requests.length === 0) { await connection.rollback(); return res.status(404).json({ message: 'Request not found' }); }
    const request = requests[0];
    if (request.status !== 'pending') { await connection.rollback(); return res.status(400).json({ message: 'Already processed' }); }

    if (action === 'reject') {
       await connection.query('UPDATE book_requests SET status = "rejected" WHERE id = ?', [id]);
       await connection.commit(); return res.json({ message: 'Request rejected' });
    }

    if (action === 'approve') {
       const [books] = await connection.query('SELECT available_quantity FROM books WHERE book_id = ? FOR UPDATE', [request.book_id]);
       if (books.length === 0 || books[0].available_quantity <= 0) { await connection.rollback(); return res.status(400).json({ message: 'Book is out of stock' }); }

       await connection.query('UPDATE book_requests SET status = "approved" WHERE id = ?', [id]);
       const [tUsers] = await connection.query('SELECT role FROM users WHERE user_id = ?', [request.user_id]);
       let days = 7; if (tUsers.length > 0) { if (tUsers[0].role === 'student') days = 30; else if (tUsers[0].role === 'professor') days = 60; }
       
       const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + days);
       const [issueResult] = await connection.query(
         'INSERT INTO issued_books (book_id, user_id, issued_by, issue_date, due_date, status) VALUES (?, ?, ?, NOW(), ?, ?)',
         [request.book_id, request.user_id, req.user.id, dueDate, 'issued']
       );
       await connection.query('UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = ?', [request.book_id]);
       await connection.commit();
       return res.json({ message: 'Request approved and book issued', issueId: issueResult.insertId });
    }
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.processCustomRequest = async (req, res) => {
  try {
    const { id, action } = req.params;
    if (action !== 'approve' && action !== 'reject') return res.status(400).json({ message: 'Invalid action' });
    const [requests] = await db.query('SELECT * FROM custom_book_requests WHERE id = ?', [id]);
    if (requests.length === 0) return res.status(404).json({ message: 'Request not found' });
    if (requests[0].status !== 'pending') return res.status(400).json({ message: 'Already processed' });

    if (action === 'reject') { await db.query('UPDATE custom_book_requests SET status = "rejected" WHERE id = ?', [id]); return res.json({ message: 'Custom request rejected' }); }
    if (action === 'approve') { await db.query('UPDATE custom_book_requests SET status = "approved" WHERE id = ?', [id]); return res.json({ message: 'Custom request approved' }); }
  } catch (error) { res.status(500).json({ message: 'Server error: ' + error.message }); }
};

// Fetch only the requests made by the logged-in user
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user_id;

    // Fixed: Changed r.request_id to r.id
    const [myRequests] = await db.query(`
      SELECT 
        r.id AS _id,
        r.status,
        r.request_date,
        b.title,
        b.author
      FROM book_requests r
      JOIN books b ON r.book_id = b.book_id
      WHERE r.user_id = ?
      ORDER BY r.request_date DESC
    `, [userId]);

    // Format the requests for the frontend
    const formattedRequests = myRequests.map(req => ({
      _id: req._id,
      status: req.status,
      request_date: req.request_date,
      title: req.title,
      author: req.author,
      reason: req.reason || 'Requested from library catalog' // Fallback text
    }));

    res.json(formattedRequests);
    
  } catch (error) {
    console.error('🔥 SQL ERROR IN MY REQUESTS:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};