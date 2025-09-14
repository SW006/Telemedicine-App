const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

// Get all doctors with pagination and filters
router.get('/', doctorController.getAllDoctors);

// Search doctors
router.get('/search', doctorController.searchDoctors);

// Get all specializations
router.get('/specializations', doctorController.getSpecializations);

// Get all cities
router.get('/cities', doctorController.getCities);

// Get doctor by ID
router.get('/:id', doctorController.getDoctorById);

module.exports = router;