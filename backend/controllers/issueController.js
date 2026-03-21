const db = require('../config/db');

exports.getIssues = async (req, res) => {
  try {
    const { role, id } = req.user; 

    // REMOVED fine_amount and cover_image to prevent 500 crash
    let query = `
      SELECT 
        i.issue_id AS _id, 
        i.issue_date AS issueDate, 
        i.due_date AS dueDate, 
        i.return_date AS returnDate, 
        i.status, 
        
        b.book_id AS bookId, 
        b.title AS bookTitle, 
        b.author AS bookAuthor, 
        b.isbn AS bookIsbn, 
        
        u.user_id AS userId, 
        u.full_name AS userName, 
        u.email AS userEmail, 
        u.roll_no AS userRollNo, 
        u.department AS userDepartment, 
        u.role AS userRole
      FROM issued_books i
      JOIN books b ON i.book_id = b.book_id
      JOIN users u ON i.user_id = u.user_id
    `;

    let queryParams = [];

    // SMART SECURITY: If they are a Student/Professor, only show their own history
    if (role === 'Student' || role === 'Professor') {
      query += ` WHERE i.user_id = ?`;
      queryParams.push(id);
    }

    // Sort by most recently issued first
    query += ` ORDER BY i.issue_date DESC`;

    const [rows] = await db.query(query, queryParams);

    // Format the flat SQL rows into nested JSON objects
    const formattedIssues = rows.map(row => ({
      _id: row._id,
      issueDate: row.issueDate,
      dueDate: row.dueDate,
      returnDate: row.returnDate,
      status: row.status,
      // Default fine to 0 for the frontend (since it's in another table)
      fineAmount: 0, 
      
      book: {
        _id: row.bookId,
        title: row.bookTitle,
        author: row.bookAuthor,
        isbn: row.bookIsbn
      },
      
      user: {
        _id: row.userId,
        name: row.userName, 
        email: row.userEmail,
        rollNo: row.userRollNo,
        department: row.userDepartment,
        role: row.userRole
      }
    }));

    res.json(formattedIssues);

  } catch (error) {
    // This logs the EXACT SQL error to your backend terminal so we can see what went wrong!
    console.error('Fetch Issues SQL Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching issue history: ' + error.message });
  }
};

exports.issueBook = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { bookId, userId, durationDays } = req.body;
    const [books] = await connection.query('SELECT available_quantity FROM books WHERE book_id = ? FOR UPDATE', [bookId]);
    if (books.length === 0 || books[0].available_quantity <= 0) {
      await connection.rollback(); return res.status(400).json({ message: 'Book is not available' });
    }
    const [targetUsers] = await connection.query('SELECT role FROM users WHERE user_id = ?', [userId]);
    if (targetUsers.length === 0) {
      await connection.rollback(); return res.status(404).json({ message: 'User not found' });
    }
    
    let days = durationDays || 7;
    if (targetUsers[0].role === 'student') days = 30;
    else if (targetUsers[0].role === 'professor') days = 60;

    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + days);
    const [result] = await connection.query(
      'INSERT INTO issued_books (book_id, user_id, issued_by, issue_date, due_date, status) VALUES (?, ?, ?, NOW(), ?, ?)',
      [bookId, userId, req.user.id, dueDate, 'issued']
    );
    await connection.query('UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = ?', [bookId]);
    await connection.commit();
    res.status(201).json({ _id: result.insertId, book: bookId, user: userId, dueDate, status: 'Issued' });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
    if (connection) connection.release();
  }
};

// Return a book and calculate fines safely
exports.returnBook = async (req, res) => {
  const connection = await db.getConnection(); 
  
  try {
    await connection.beginTransaction();
    
    const issueId = req.params.id;

    // 1. Get the issue details
    const [issues] = await connection.query(
      'SELECT book_id, user_id, due_date, status FROM issued_books WHERE issue_id = ? FOR UPDATE',
      [issueId]
    );

    if (issues.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Issue record not found' });
    }

    const issue = issues[0];
    if (issue.status === 'returned') {
      await connection.rollback();
      return res.status(400).json({ message: 'This book has already been returned.' });
    }

    // 2. CALCULATE FINES LOGIC
    const dueDate = new Date(issue.due_date);
    const today = new Date();
    
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    let fineAmount = 0;
    const FINE_PER_DAY = 10; // ₹10 per day late

    if (today > dueDate) {
      const diffTime = Math.abs(today - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fineAmount = diffDays * FINE_PER_DAY;
    }

    // 3. Update the issued_books record (This automatically makes the book available again!)
    await connection.query(
      'UPDATE issued_books SET status = "returned", return_date = NOW() WHERE issue_id = ?',
      [issueId]
    );

    // Step 4 (updating the books table directly) was removed because 'available' is calculated dynamically!

    // 5. If they are late, create a fine record
    if (fineAmount > 0) {
      await connection.query(
        'INSERT INTO fines (user_id, issue_id, amount, status) VALUES (?, ?, ?, "pending")',
        [issue.user_id, issueId, fineAmount]
      );
    }

    // 6. Success!
    await connection.commit();
    res.json({ message: 'Book returned successfully', fine: fineAmount });

  } catch (error) {
    await connection.rollback();
    console.error('🔥 Return Book Error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  } finally {
    connection.release();
  }
};