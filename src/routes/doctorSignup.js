const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { body } = require('express-validator');

// Validation middleware for doctor signup
const doctorSignupValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('speciality').trim().notEmpty().withMessage('Speciality is required'),
  body('pmdc').trim().notEmpty().withMessage('PMDC number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a valid number')
];

// Validation middleware for OTP verification
const otpValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

// Routes for doctor signup
router.post('/signup', doctorSignupValidation, doctorController.signUp);
router.post('/verify-otp', otpValidation, doctorController.verifyOTP);
router.post('/resend-otp', [body('email').isEmail().normalizeEmail()], doctorController.resendOTP);

module.exports = router;
