const db = require('../config/db');

exports.getBooks = async (req, res) => {
  try {
    const [books] = await db.query(
      'SELECT book_id AS _id, title, author, isbn, category, quantity, available_quantity AS available FROM books'
    );
    res.json(books.map(b => ({ ...b, coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300' })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;
    const [result] = await db.query(
      'INSERT INTO books (title, author, isbn, category, quantity, available_quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, isbn, category, quantity, quantity]
    );
    res.status(201).json({ _id: result.insertId, title });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD THESE TWO MISSING FUNCTIONS:

exports.updateBook = async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;
    const bookId = req.params.id;

    const [books] = await db.query('SELECT quantity, available_quantity FROM books WHERE book_id = ?', [bookId]);
    if (books.length === 0) return res.status(404).json({ message: 'Book not found' });

    const currentBook = books[0];
    const difference = quantity - currentBook.quantity;
    const newAvailable = currentBook.available_quantity + difference;

    await db.query(
      'UPDATE books SET title = COALESCE(?, title), author = COALESCE(?, author), isbn = COALESCE(?, isbn), category = COALESCE(?, category), quantity = COALESCE(?, quantity), available_quantity = ? WHERE book_id = ?',
      [title, author, isbn, category, quantity, newAvailable, bookId]
    );

    const [updated] = await db.query('SELECT book_id AS _id, title, author, isbn, category, quantity, available_quantity AS available FROM books WHERE book_id = ?', [bookId]);
    res.json({ ...updated[0], coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM books WHERE book_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};  