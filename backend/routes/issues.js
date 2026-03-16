const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getIssues, issueBook, returnBook } = require('../controllers/issueController');

router.get('/', protect, getIssues);
router.post('/', protect, authorize('Admin', 'Librarian'), issueBook);
router.put('/:id/return', protect, authorize('Admin', 'Librarian'), returnBook);

module.exports = router;