const express = require('express');
const { createBill, getBills, getBillById } = require('../controllers/billController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createBill);
router.get('/', protect, getBills);
router.get('/:id', protect, getBillById);

module.exports = router;