const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/books
// @desc    Get all books
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const [books] = await db.query(
      'SELECT book_id AS _id, title, author, isbn, category, quantity, available_quantity AS available, created_at AS createdAt FROM books'
    );
    const mapped = books.map(b => ({
       ...b,
       coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300'
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   POST /api/books
// @desc    Create a book
// @access  Private/Librarian/Admin
router.post('/', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;

    const [existing] = await db.query('SELECT book_id FROM books WHERE isbn = ?', [isbn]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO books (title, author, isbn, category, quantity, available_quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, isbn, category, quantity, quantity]
    );

    res.status(201).json({
      _id: result.insertId,
      title,
      author,
      isbn,
      category,
      quantity,
      available: quantity,
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private/Librarian/Admin
router.put('/:id', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;
    const bookId = req.params.id;

    const [books] = await db.query('SELECT quantity, available_quantity FROM books WHERE book_id = ?', [bookId]);
    
    if (books.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const currentBook = books[0];
    const difference = quantity - currentBook.quantity;
    const newAvailable = currentBook.available_quantity + difference;

    await db.query(
      'UPDATE books SET title = COALESCE(?, title), author = COALESCE(?, author), isbn = COALESCE(?, isbn), category = COALESCE(?, category), quantity = COALESCE(?, quantity), available_quantity = ? WHERE book_id = ?',
      [title, author, isbn, category, quantity, newAvailable, bookId]
    );

    const [updated] = await db.query(
      'SELECT book_id AS _id, title, author, isbn, category, quantity, available_quantity AS available, created_at AS createdAt FROM books WHERE book_id = ?',
      [bookId]
    );

    res.json({
       ...updated[0],
       coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private/Librarian/Admin
router.delete('/:id', protect, authorize('Admin', 'Librarian'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE book_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
