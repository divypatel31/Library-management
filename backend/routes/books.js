// backend/routes/books.js
const express = require('express');
const router = express.Router();
const { getAllBooks, addBook, updateBook, deleteBook } = require('../controllers/bookController'); // Logic moved here
const { protect, authorize } = require('../middleware/auth');

// Simplified Routes pointing to Controller functions
router.route('/')
  .get(protect, getAllBooks)
  .post(protect, authorize('Admin', 'Librarian'), addBook);

router.route('/:id')
  .put(protect, authorize('Admin', 'Librarian'), updateBook)
  .delete(protect, authorize('Admin', 'Librarian'), deleteBook);

module.exports = router;