const db = require('../config/db');

exports.getAllBooks = async (req, res) => {
  try {
    const [books] = await db.query('SELECT * FROM books');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books' });
  }
};

exports.addBook = async (req, res) => {
  const { title, author, isbn, category, quantity, coverImage } = req.body;
  try {
    await db.query(
      'INSERT INTO books (title, author, isbn, category, quantity, available_quantity, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, author, isbn, category, quantity, quantity, coverImage]
    );
    res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
