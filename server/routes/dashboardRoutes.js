const express = require('express');
const { getStats, getSalesWeek } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, getStats);
router.get('/sales-week', protect, getSalesWeek);

module.exports = router;