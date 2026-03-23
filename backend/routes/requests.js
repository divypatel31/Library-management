const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getCustomRequests, createCustomRequest, getRequests, createRequest, 
  processRequest, processCustomRequest, getMyRequests, deleteMyRequest 
} = require('../controllers/requestController');

// ----------------------------------------------------------------------
// 1. SPECIFIC USER HISTORY ROUTES
// These MUST be at the top so Express matches them before dynamic :id routes
// ----------------------------------------------------------------------
router.get('/my-history', protect, getMyRequests);

// Ensure the method is DELETE and the path matches /my-history/standard/12
router.delete('/my-history/:type/:id', protect, deleteMyRequest);


// ----------------------------------------------------------------------
// 2. CREATE/POST ROUTES
// ----------------------------------------------------------------------
router.post('/custom', protect, createCustomRequest);
router.post('/', protect, createRequest);


// ----------------------------------------------------------------------
// 3. ADMIN/LIBRARIAN FETCH ROUTES
// ----------------------------------------------------------------------
router.get('/custom', protect, authorize('Admin', 'Librarian'), getCustomRequests);
router.get('/', protect, authorize('Admin', 'Librarian'), getRequests);


// ----------------------------------------------------------------------
// 4. ACTION ROUTES (Dynamic :id matching)
// These MUST be at the bottom so they don't catch specific named routes
// ----------------------------------------------------------------------
router.put('/:id/:action', protect, authorize('Admin', 'Librarian'), processRequest);
router.put('/custom/:id/:action', protect, authorize('Admin', 'Librarian'), processCustomRequest);

module.exports = router;