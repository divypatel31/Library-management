const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
// Import the new delete controllers
const { getAnnouncements, createAnnouncement, deleteAnnouncement, deleteAnnouncementsByDate } = require('../controllers/announcementController');

router.get('/', protect, getAnnouncements);
router.post('/', protect, authorize('Admin', 'Librarian'), createAnnouncement);

// NEW routes for deletion
router.delete('/:id', protect, authorize('Admin', 'Librarian'), deleteAnnouncement);
router.post('/bulk-delete', protect, authorize('Admin', 'Librarian'), deleteAnnouncementsByDate);

module.exports = router;