const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getCustomRequests, createCustomRequest, getRequests, createRequest, processRequest, processCustomRequest, getMyRequests } = require('../controllers/requestController');

router.get('/custom', protect, authorize('Admin', 'Librarian'), getCustomRequests);
router.post('/custom', protect, createCustomRequest);
router.get('/', protect, authorize('Admin', 'Librarian'), getRequests);
router.post('/', protect, createRequest);
router.put('/:id/:action', protect, authorize('Admin', 'Librarian'), processRequest);
router.put('/custom/:id/:action', protect, authorize('Admin', 'Librarian'), processCustomRequest);
router.get('/my-history', protect,authorize('Librarian','Student','Professor'), getMyRequests);

module.exports = router;