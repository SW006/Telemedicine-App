const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { sendOTPEmail } = require('../utils/emailSender');
const { generateOTP } = require('../utils/otpGenerator');
const { 
  saveTempUserData, 
  getTempUserData, 
  deleteTempUserData
} = require('../utils/tempStorage');

// // Temporary storage for registration data (use Redis in production)
// const tempUserStorage = new Map();

// // Helper functions for temporary storage
// const saveTempUserData = (email, data) => {
//   tempUserStorage.set(email, data);
//   // Set expiration (3 minutes)
//   setTimeout(() => {
//     if (tempUserStorage.has(email)) {
//       tempUserStorage.delete(email);
//       console.log(`Temp data for ${email} expired`);
//     }
//   }, 3 * 60 * 1000);
// };

// const getTempUserData = (email) => {
//   return tempUserStorage.get(email);
// };

// const deleteTempUserData = (email) => {
//   tempUserStorage.delete(email);
// };

// NEW: Sign-Up function that stores data temporarily
const signUp = async (req, res) => {
  try {
    const { email, password, name, contact_number, phone } = req.body;
    
    // Add request logging for debugging
    console.log(`=== REGISTRATION REQUEST ===`);
    console.log(`Email: ${email}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`============================`);
    
    // Check if user already exists in DATABASE
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log(`User already exists in database: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Check if there's already a pending registration
    const existingTempData = await getTempUserData(email);
    if (existingTempData) {
      console.log(`Found existing temp data for: ${email}`);
      console.log(`OTP expires at: ${new Date(existingTempData.otpExpiry).toISOString()}`);
      console.log(`Current time: ${new Date().toISOString()}`);
      console.log(`Is expired: ${Date.now() > existingTempData.otpExpiry}`);
      
      // Check if the existing OTP is still valid
      if (Date.now() > existingTempData.otpExpiry) {
        // OTP expired, clean up and allow new registration
        console.log(`OTP expired, cleaning up temp data for: ${email}`);
        await deleteTempUserData(email);
      } else {
        // Valid pending registration exists
        console.log(`Valid pending registration exists for: ${email}`);
        return res.status(400).json({
          success: false,
          error: 'Registration already in progress. Please verify your OTP or wait for it to expire.',
          message: 'A registration is already in progress for this email. Please check your email for the OTP or wait for it to expire before trying again.'
        });
      }
    }

    // Generate OTP with 3-minute expiry
    const otp = generateOTP();
    const otpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Store user data temporarily (NOT in database yet)
    const tempUser = {
      email,
      password_hash: hashedPassword,
      name,
      contact_number,
      phone,
      otp,
      otpExpiry,
      createdAt: new Date()
    };
    
    // Save to temporary storage
    await saveTempUserData(email, tempUser);

    // Send OTP via email
    await sendOTPEmail(email, otp);

    // DEBUG LOG
    console.log('=== NEW USER SIGN UP (TEMP STORAGE) ===');
    console.log('Email:', email);
    console.log('OTP:', otp);
    console.log('Expires at:', new Date(otpExpiry).toISOString());
    console.log('=====================');

    return res.json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: email,
      expiresIn: 3 // 3 minutes
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process registration'
    });
  }
};

// MODIFIED: OTP Verification that creates user after verification
const verifyOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array(),
      message: 'Validation failed'
    });
  }

  try {
    const { email, otp } = req.body;
    
    console.log('=== OTP VERIFICATION DEBUG ===');
    console.log('Request received at:', new Date().toISOString());
    console.log('Email:', email);
    console.log('Input OTP:', otp);
    
    // Retrieve temporary user data
    const tempUserData = await getTempUserData(email);
    
    if (!tempUserData) {
      console.log('No pending registration found for email:', email);
      return res.status(400).json({
        success: false,
        error: 'No pending registration found or OTP expired'
      });
    }
    
    console.log('Temp user data found:', {
      storedOTP: tempUserData.otp,
      otpExpiry: new Date(tempUserData.otpExpiry).toISOString(),
      currentTime: new Date().toISOString(),
      isExpired: Date.now() > tempUserData.otpExpiry,
      otpMatches: tempUserData.otp === otp
    });

    // Check if OTP is expired
    if (Date.now() > tempUserData.otpExpiry) {
      console.log('OTP expired');
      await deleteTempUserData(email);
      return res.status(400).json({
        success: false,
        error: 'OTP expired. Please request a new one.'
      });
    }
    
    // Verify OTP
    if (tempUserData.otp !== otp) {
      console.log('OTP mismatch');
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    console.log('OTP verified successfully');

    // OTP verified - NOW create the actual user in database
    const newUser = await pool.query(
      `INSERT INTO users (email, password_hash, name, contact_number, phone, verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, contact_number, phone`,
      [tempUserData.email, tempUserData.password_hash, tempUserData.name, 
       tempUserData.contact_number, tempUserData.phone, true]
    );

    // Clean up temporary data
    deleteTempUserData(email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: token,
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        name: newUser.rows[0].name,
        contact_number: newUser.rows[0].contact_number,
        phone: newUser.rows[0].phone,
        verified: true,
        role: 'patient' // Regular signup creates patient users
      },
      redirectTo: '/patient'
    });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    
    // Handle unique constraint violation (in case user was created elsewhere)
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
};

// MODIFIED: Resend OTP for pending registrations
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if we have temp data for this email
    const tempUserData = await getTempUserData(email);
    if (!tempUserData) {
      return res.status(400).json({
        success: false,
        error: 'No pending registration found'
      });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    const newOtpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
    
    // Update temp data
    tempUserData.otp = newOtp;
    tempUserData.otpExpiry = newOtpExpiry;
    await saveTempUserData(email, tempUserData);
    
    // Send new OTP
    await sendOTPEmail(email, newOtp);
    
    console.log('=== RESEND OTP ===');
    console.log('Email:', email);
    console.log('New OTP:', newOtp);
    console.log('Expires at:', new Date(newOtpExpiry).toISOString());
    console.log('==================');

    return res.json({
      success: true,
      message: 'New verification code sent',
      expiresIn: 3 // 3 minutes
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to resend OTP'
    });
  }
};

// Debug endpoint to check temporary storage
const debugTempStorage = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.json({
      message: 'Debug endpoint not available in production'
    });
  }

  try {
    // For in-memory storage, we need to access the internal Map
    // This is a simplified debug function - in production with Redis, 
    // you'd need to implement a different approach
    res.json({
      message: 'Debug endpoint available - check server logs for temp storage details',
      note: 'For detailed inspection, check the server console logs during registration'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve debug information'
    });
  }
};

// Clear all temporary data (for testing)
const clearTempStorage = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.json({
      message: 'Debug endpoint not available in production'
    });
  }

  try {
    // Note: This is a simplified implementation
    // In a real scenario, you'd need to implement a way to clear all temp data
    res.json({
      success: true,
      message: 'Clear temp storage - check server logs for confirmation',
      note: 'Temp data will expire automatically after 10 minutes'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear temporary storage'
    });
  }
};

// Manually set test data (for testing)
const setTestData = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.json({
      message: 'Debug endpoint not available in production'
    });
  }

  try {
    const { email, otp = '123456', name = 'Test User' } = req.body;
    
    await saveTempUserData(email, {
      email: email,
      password_hash: '$2b$10$examplehashedpassword',
      name: name,
      contact_number: '+1234567890',
      phone: '+1234567890',
      otp: otp,
      otpExpiry: Date.now() + 180000, // 3 minutes
      createdAt: new Date()
    });
    
    const data = await getTempUserData(email);
    res.json({
      success: true,
      message: `Test data set for ${email}`,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to set test data'
    });
  }
};

module.exports = {
  signUp,
  verifyOTP,
  resendOTP,
  debugTempStorage,
  clearTempStorage,
  setTestData,
  // tempUserStorage
};