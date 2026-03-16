const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAnnouncements, createAnnouncement } = require('../controllers/announcementController');

router.get('/', protect, getAnnouncements);
router.post('/', protect, authorize('Admin', 'Librarian'), createAnnouncement);

module.exports = router;