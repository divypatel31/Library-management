const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStats, getChartData } = require('../controllers/dashboardController');

router.get('/stats', protect, getStats);
router.get('/chart', protect, getChartData);

module.exports = router;