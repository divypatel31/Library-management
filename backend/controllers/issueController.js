const db = require('../config/db');

exports.issueBook = async (req, res) => {
  const { bookId, userId, days } = req.body;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (days || 7));
  
  try {
    await db.query(
      'INSERT INTO issued_books (book_id, user_id, issued_by, issue_date, due_date, status) VALUES (?, ?, ?, NOW(), ?, ?)',
      [bookId, userId, req.user.id, dueDate, 'issued']
    );
    await db.query('UPDATE books SET available_quantity = available_quantity - 1 WHERE book_id = ?', [bookId]);
    res.status(201).json({ message: 'Book issued' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};