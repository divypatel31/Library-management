const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, createUser, deleteUser, getUserByIdentifier } = require('../controllers/userController');

router.get('/', protect, authorize('Admin', 'Librarian'), getUsers);
router.post('/', protect, authorize('Admin', 'Librarian'), createUser);

// FIX: Added 'Librarian' to the authorized roles for deleting
router.delete('/:id', protect, authorize('Admin', 'Librarian'), deleteUser);

// Fetch single user for the Issue Book auto-fill
router.get('/find/:identifier', protect, authorize('Admin', 'Librarian'), getUserByIdentifier);

module.exports = router;