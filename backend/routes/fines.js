const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getFines, payFine } = require('../controllers/fineController');

// Everyone can view fines (the controller filters whose fines they see)
router.get('/', protect, getFines);

// ONLY Admins and Librarians can mark a fine as paid
router.put('/:id/pay', protect, authorize('Admin', 'Librarian'), payFine);

module.exports = router;