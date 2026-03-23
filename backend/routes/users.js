const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
// 1. IMPORT updateUser here:
const { getUsers, createUser, deleteUser, getUserByIdentifier, updateUser , getWalletBalance , addDummyFunds} = require('../controllers/userController');

router.get('/', protect, authorize('Admin', 'Librarian'), getUsers);
router.post('/', protect, authorize('Admin', 'Librarian'), createUser);

// 2. ADD THIS NEW ROUTE FOR EDITING:
router.put('/:id', protect, authorize('Admin', 'Librarian'), updateUser);

// FIX: Added 'Librarian' to the authorized roles for deleting
router.delete('/:id', protect, authorize('Admin', 'Librarian'), deleteUser);

// Fetch single user for the Issue Book auto-fill
router.get('/find/:identifier', protect, authorize('Admin', 'Librarian'), getUserByIdentifier);

router.get('/wallet', protect, getWalletBalance);

router.post('/wallet/add', protect, addDummyFunds);

module.exports = router;