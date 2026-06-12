const express = require('express');
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, getCustomerBills } = require('../controllers/customerController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getCustomers);
router.get('/:id', protect, getCustomerById);
router.post('/', protect, adminOnly, createCustomer);
router.put('/:id', protect, adminOnly, updateCustomer);
router.delete('/:id', protect, adminOnly, deleteCustomer);
router.get('/:id/bills', protect, getCustomerBills);

module.exports = router;