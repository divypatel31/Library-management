const express = require('express');
const router = express.Router();
const { getBooks, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getBooks);
router.post('/', protect, authorize('Admin', 'Librarian'), createBook);
router.put('/:id', protect, authorize('Admin', 'Librarian'), updateBook);
router.delete('/:id', protect, authorize('Admin', 'Librarian'), deleteBook);

module.exports = router;