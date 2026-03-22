const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getCustomRequests, createCustomRequest, getRequests, createRequest, 
  processRequest, processCustomRequest, getMyRequests, deleteMyRequest 
} = require('../controllers/requestController');

// MUST BE AT THE TOP!!!
router.get('/my-history', protect, getMyRequests);
router.delete('/my-history/:type/:id', protect, deleteMyRequest);

// Middle routes
router.post('/custom', protect, createCustomRequest);
router.post('/', protect, createRequest);
router.get('/custom', protect, authorize('Admin', 'Librarian'), getCustomRequests);
router.get('/', protect, authorize('Admin', 'Librarian'), getRequests);

// MUST BE AT THE BOTTOM!!!
router.put('/:id/:action', protect, authorize('Admin', 'Librarian'), processRequest);
router.put('/custom/:id/:action', protect, authorize('Admin', 'Librarian'), processCustomRequest);

module.exports = router;