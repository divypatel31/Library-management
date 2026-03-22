const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
// 1. Add deleteIssueRecord here:
const { getIssues, issueBook, returnBook, deleteIssueRecord } = require('../controllers/issueController');

router.get('/', protect, getIssues);
router.post('/', protect, authorize('Admin', 'Librarian'), issueBook);
router.put('/:id/return', protect, authorize('Admin', 'Librarian'), returnBook);

// 2. Add the new delete route here:
router.delete('/:id', protect, authorize('Admin', 'Librarian'), deleteIssueRecord);

module.exports = router;