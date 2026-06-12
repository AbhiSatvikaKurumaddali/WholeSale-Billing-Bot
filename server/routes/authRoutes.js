const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.register);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', authController.logout);

// Admin only routes
router.get('/pending-users', protect, adminOnly, authController.getPendingUsers);
router.put('/user-status', protect, adminOnly, authController.updateUserStatus);
router.get('/all-staff', protect, adminOnly, authController.getAllStaff);

module.exports = router;