const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, createUser, deleteUser } = require('../controllers/userController');

router.get('/', protect, authorize('Admin', 'Librarian'), getUsers);
router.post('/', protect, authorize('Admin', 'Librarian'), createUser);
router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;