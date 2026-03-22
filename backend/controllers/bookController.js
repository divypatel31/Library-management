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

// Bulletproof Add Book Function
exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;

    // 1. SMART CHECK: Does this ISBN already exist?
    // We only check if an ISBN was actually provided
    if (isbn && isbn.trim() !== '') {
      const [existingBook] = await db.query('SELECT title FROM books WHERE isbn = ?', [isbn]);
      
      // If the array has anything in it, the book exists!
      if (existingBook.length > 0) {
        return res.status(400).json({ 
          message: `A book with this ISBN already exists ("${existingBook[0].title}"). Please update its quantity instead of adding a new entry.` 
        });
      }
    }

    // 2. If it doesn't exist, proceed with adding it
    // Note: The 'available' copies should equal the total 'quantity' when first added
    const [result] = await db.query(
      'INSERT INTO books (title, author, isbn, category, quantity, available) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, isbn, category, quantity, quantity] 
    );

    res.status(201).json({ 
      message: 'Book added successfully!', 
      bookId: result.insertId 
    });

  } catch (error) {
    console.error('🔥 Add Book Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
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

// Delete a book and its history safely
exports.deleteBook = async (req, res) => {
  const { id } = req.params;
  
  try {
    // 1. SAFETY CHECK: Is the book currently in someone's hands?
    const [activeIssues] = await db.query(
      'SELECT * FROM issued_books WHERE book_id = ? AND status = "issued"', 
      [id]
    );
    
    if (activeIssues.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete book. There are copies currently issued to users. Please have them returned first.' 
      });
    }

    // 2. CLEANUP: Delete child records to satisfy MySQL Foreign Key constraints
    // Delete any pending or past requests for this book
    await db.query('DELETE FROM book_requests WHERE book_id = ?', [id]);
    
    // Delete the borrowing history for this book
    await db.query('DELETE FROM issued_books WHERE book_id = ?', [id]);

    // 3. Finally, delete the book itself
    const [result] = await db.query('DELETE FROM books WHERE book_id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book and its history deleted successfully' });
    
  } catch (error) {
    console.error('Delete Book Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};