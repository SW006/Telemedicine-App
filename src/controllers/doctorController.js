const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/db');
const { generateOTP } = require('../utils/otpGenerator');
const { sendOTPEmail } = require('../utils/emailSender');
const { getTempUserData, saveTempUserData, deleteTempUserData } = require('../utils/tempStorage');

const doctorController = {
  // Doctor signup that stores data temporarily and sends OTP
  signUp: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        city, 
        speciality, 
        pmdc, 
        experience, 
        message,
        password 
      } = req.body;
      
      // Check if user already exists in DATABASE
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      // Check if there's already a pending registration
      const existingTempData = await getTempUserData(email);
      if (existingTempData) {
        return res.status(400).json({
          success: false,
          error: 'Registration already in progress. Please verify your OTP or wait for it to expire.'
        });
      }

      // Generate OTP with 3-minute expiry
      const otp = generateOTP();
      const otpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Store doctor data temporarily (NOT in database yet)
      const tempDoctor = {
        email,
        password_hash: hashedPassword,
        name: `${firstName} ${lastName}`,
        contact_number: phone,
        phone,
        city,
        speciality,
        pmdc,
        experience: experience || 0,
        message,
        otp,
        otpExpiry,
        createdAt: new Date()
      };
      
      // Save to temporary storage
      await saveTempUserData(email, tempDoctor);

      // Send OTP via email
      await sendOTPEmail(email, otp);

      // DEBUG LOG
      console.log('=== DOCTOR SIGN UP (TEMP STORAGE) ===');
      console.log('Email:', email);
      console.log('OTP:', otp);
      console.log('Expires at:', new Date(otpExpiry).toISOString());
      console.log('=====================');

      return res.json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete doctor registration.',
        email: email,
        expiresIn: 3 // minutes
      });

    } catch (error) {
      console.error('Doctor signup error:', error);
      return res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  },

  // OTP verification that creates both user and doctor records
  verifyOTP: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      
      // Check if we have temp data for this email
      const tempDoctorData = await getTempUserData(email);
      if (!tempDoctorData) {
        return res.status(400).json({
          success: false,
          error: 'No pending registration found or OTP expired'
        });
      }
      
      // Check if OTP is expired
      if (Date.now() > tempDoctorData.otpExpiry) {
        await deleteTempUserData(email);
        return res.status(400).json({
          success: false,
          error: 'OTP expired. Please request a new one.'
        });
      }
      
      // Verify OTP
      if (tempDoctorData.otp !== otp) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OTP'
        });
      }

      console.log('Doctor OTP verified successfully');

      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Create user in database
        const newUser = await client.query(
          `INSERT INTO users (email, password_hash, name, contact_number, phone, verified)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, email, name, contact_number, phone`,
          [tempDoctorData.email, tempDoctorData.password_hash, tempDoctorData.name, 
           tempDoctorData.contact_number, tempDoctorData.phone, true]
        );

        const userId = newUser.rows[0].id;

        // Create doctor record
        const newDoctor = await client.query(
          `INSERT INTO doctors (user_id, specialty, experience, license_number, verified, consultation_fee)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, specialty, experience, license_number, verified`,
          [userId, tempDoctorData.speciality, tempDoctorData.experience, 
           tempDoctorData.pmdc, true, 1500.00] // Default consultation fee
        );

        await client.query('COMMIT');

        // Clean up temporary data
        await deleteTempUserData(email);

        // Generate JWT token
        const token = jwt.sign(
          { userId: userId, email: tempDoctorData.email, userType: 'doctor' },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        return res.status(201).json({
          success: true,
          message: 'Doctor registration successful',
          token: token,
          user: {
            id: userId,
            email: tempDoctorData.email,
            name: tempDoctorData.name,
            contact_number: tempDoctorData.contact_number,
            phone: tempDoctorData.phone,
            verified: true,
            userType: 'doctor',
            doctorId: newDoctor.rows[0].id,
            specialty: newDoctor.rows[0].specialty
          },
          redirectTo: '/doctor'
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.error('Doctor OTP verification error:', error);
      
      // Handle unique constraint violation (in case user was created elsewhere)
      if (error.code === '23505') { // PostgreSQL unique violation
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email or PMDC number'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Verification failed'
      });
    }
  },

  // Resend OTP for pending doctor registrations
  resendOTP: async (req, res, next) => {
    try {
      const { email } = req.body;
      
      // Check if we have temp data for this email
      const tempDoctorData = await getTempUserData(email);
      if (!tempDoctorData) {
        return res.status(400).json({
          success: false,
          error: 'No pending registration found'
        });
      }
      
      // Generate new OTP
      const newOtp = generateOTP();
      const newOtpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
      
      // Update temp data
      tempDoctorData.otp = newOtp;
      tempDoctorData.otpExpiry = newOtpExpiry;
      await saveTempUserData(email, tempDoctorData);
      
      // Send new OTP
      await sendOTPEmail(email, newOtp);
      
      console.log('Doctor resent OTP:', newOtp); // For testing
      
      return res.json({
        success: true,
        message: 'New OTP sent to your email',
        email: email,
        expiresIn: 3 // minutes
      });
      
    } catch (error) {
      console.error('Resend doctor OTP error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to resend OTP'
      });
    }
  },

  // Get all doctors with pagination and filters
  getAllDoctors: async (req, res, next) => {
    try {
      const { page = 1, limit = 20, specialty, city } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT d.id, d.specialty, d.experience, d.consultation_fee, d.rating, d.total_reviews,
               u.name, u.email, u.phone, d.city, d.location, d.bio, d.languages, d.certifications
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        WHERE d.verified = true AND u.deleted = false
      `;
      
      const queryParams = [];
      let paramCount = 0;

      if (specialty) {
        paramCount++;
        query += ` AND d.specialty ILIKE $${paramCount}`;
        queryParams.push(`%${specialty}%`);
      }

      if (city) {
        paramCount++;
        query += ` AND d.city ILIKE $${paramCount}`;
        queryParams.push(`%${city}%`);
      }

      // Count total records
      const countQuery = query.replace(
        'SELECT d.id, d.specialty, d.experience, d.consultation_fee, d.rating, d.total_reviews, u.name, u.email, u.phone, d.city, d.location, d.bio, d.languages, d.certifications',
        'SELECT COUNT(*)'
      );
      
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      // Add ordering and pagination
      query += ` ORDER BY d.rating DESC, d.total_reviews DESC 
                 LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      
      queryParams.push(limit, offset);
      
      const result = await pool.query(query, queryParams);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all doctors error:', error);
      next(error);
    }
  },

  // Get doctor by ID
  getDoctorById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await pool.query(`
        SELECT d.id, d.specialty, d.experience, d.consultation_fee, d.rating, d.total_reviews,
               u.name, u.email, u.phone, d.city, d.location, d.bio, d.languages, d.certifications
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        WHERE d.id = $1 AND d.verified = true AND u.deleted = false
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Get doctor by ID error:', error);
      next(error);
    }
  },

  // Search doctors
  searchDoctors: async (req, res, next) => {
    try {
      const { q, filter = 'all', page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      let query = `
        SELECT d.id, d.specialty, d.experience, d.consultation_fee, d.rating, d.total_reviews,
               u.name, u.email, u.phone, d.city, d.location, d.bio, d.languages, d.certifications
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        WHERE d.verified = true AND u.deleted = false AND (
      `;
      
      const queryParams = [];
      let paramCount = 0;
      const searchTerm = `%${q.trim()}%`;

      switch (filter) {
        case 'specialization':
          paramCount++;
          query += `d.specialty ILIKE $${paramCount}`;
          queryParams.push(searchTerm);
          break;
        case 'city':
          paramCount++;
          query += `d.city ILIKE $${paramCount}`;
          queryParams.push(searchTerm);
          break;
        case 'all':
        default:
          paramCount++;
          query += `(u.name ILIKE $${paramCount} OR d.specialty ILIKE $${paramCount} OR d.city ILIKE $${paramCount})`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
          break;
      }

      query += ')';

      // Count total records
      const countQuery = query.replace(
        'SELECT d.id, d.specialty, d.experience, d.consultation_fee, d.rating, d.total_reviews, u.name, u.email, u.phone, d.city, d.location, d.bio, d.languages, d.certifications',
        'SELECT COUNT(*)'
      );
      
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      // Add ordering and pagination
      query += ` ORDER BY d.rating DESC, d.total_reviews DESC 
                 LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      
      queryParams.push(limit, offset);
      
      const result = await pool.query(query, queryParams);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Search doctors error:', error);
      next(error);
    }
  },

  // Get all specializations
  getSpecializations: async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT DISTINCT specialty
        FROM doctors
        WHERE verified = true
        ORDER BY specialty
      `);

      const specializations = result.rows.map(row => row.specialty);

      res.json({
        success: true,
        data: specializations
      });
    } catch (error) {
      console.error('Get specializations error:', error);
      next(error);
    }
  },

  // Get all cities
  getCities: async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT DISTINCT city
        FROM doctors
        WHERE verified = true AND city IS NOT NULL
        ORDER BY city
      `);

      const cities = result.rows.map(row => row.city);

      res.json({
        success: true,
        data: cities
      });
    } catch (error) {
      console.error('Get cities error:', error);
      next(error);
    }
  }
};

module.exports = doctorController;
