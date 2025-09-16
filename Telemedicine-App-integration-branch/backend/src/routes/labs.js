const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// Get all lab facilities
router.get('/facilities', async (req, res) => {
  try {
    const { city } = req.query;
    
    let query = `
      SELECT 
        id, name, address, city, phone, email,
        service_hours, home_collection, processing_time, 
        specialties, created_at
      FROM lab_facilities 
      WHERE is_active = true
    `;
    
    const params = [];
    
    if (city) {
      query += ` AND LOWER(city) = LOWER($${params.length + 1})`;
      params.push(city);
    }
    
    query += ` ORDER BY name ASC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      facilities: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching lab facilities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lab facilities'
    });
  }
});

// Get available lab tests
router.get('/tests', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = `
      SELECT 
        id, name, category, price, description,
        preparation_needed, processing_time, report_format
      FROM lab_tests 
      WHERE is_active = true
    `;
    
    const params = [];
    
    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }
    
    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${params.length + 1}) OR LOWER(description) LIKE LOWER($${params.length + 1}))`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY category ASC, name ASC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      tests: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lab tests'
    });
  }
});

// Get test categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category 
      FROM lab_tests 
      WHERE is_active = true 
      ORDER BY category ASC
    `);
    
    res.json({
      success: true,
      categories: result.rows.map(row => row.category)
    });
    
  } catch (error) {
    console.error('Error fetching test categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch test categories'
    });
  }
});

// Create lab booking
router.post('/bookings', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      facilityId,
      testIds,
      preferredDate,
      preferredTime,
      homeCollection,
      patientAddress,
      specialInstructions,
      emergencyContact
    } = req.body;
    
    const userId = req.user.userId;
    
    // Validate facility exists
    const facilityResult = await client.query(
      'SELECT * FROM lab_facilities WHERE id = $1 AND is_active = true',
      [facilityId]
    );
    
    if (facilityResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Lab facility not found'
      });
    }
    
    const facility = facilityResult.rows[0];
    
    // Get test details and calculate total cost
    const testsResult = await client.query(
      'SELECT * FROM lab_tests WHERE id = ANY($1) AND is_active = true',
      [testIds]
    );
    
    if (testsResult.rows.length !== testIds.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Some tests are not valid'
      });
    }
    
    const tests = testsResult.rows;
    const totalAmount = tests.reduce((sum, test) => sum + test.price, 0);
    
    // Add home collection fee if applicable
    const homeCollectionFee = homeCollection ? 500 : 0;
    const finalAmount = totalAmount + homeCollectionFee;
    
    // Create lab booking
    const bookingResult = await client.query(`
      INSERT INTO lab_bookings (
        patient_id, facility_id, test_ids, total_amount,
        preferred_date, preferred_time, home_collection,
        patient_address, special_instructions, emergency_contact,
        status, home_collection_fee, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
        'pending', $11, NOW()
      ) RETURNING *
    `, [
      userId,
      facilityId,
      testIds,
      finalAmount,
      preferredDate,
      preferredTime,
      homeCollection,
      patientAddress,
      specialInstructions,
      JSON.stringify(emergencyContact),
      homeCollectionFee
    ]);
    
    await client.query('COMMIT');
    
    // Return booking details with test information
    res.status(201).json({
      success: true,
      booking: {
        ...bookingResult.rows[0],
        facility: facility,
        tests: tests,
        testDetails: tests.map(test => ({
          name: test.name,
          category: test.category,
          price: test.price,
          preparationNeeded: test.preparation_needed
        }))
      },
      message: 'Lab booking created successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating lab booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lab booking'
    });
  } finally {
    client.release();
  }
});

// Get user's lab bookings
router.get('/bookings/my-bookings', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        lb.*,
        lf.name as facility_name,
        lf.address as facility_address,
        lf.phone as facility_phone
      FROM lab_bookings lb
      JOIN lab_facilities lf ON lb.facility_id = lf.id
      WHERE lb.patient_id = $1
    `;
    
    const params = [userId];
    
    if (status) {
      query += ` AND lb.status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY lb.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    // Get test details for each booking
    const bookingsWithTests = await Promise.all(
      result.rows.map(async (booking) => {
        const testsResult = await pool.query(
          'SELECT id, name, category, price FROM lab_tests WHERE id = ANY($1)',
          [booking.test_ids]
        );
        
        return {
          ...booking,
          tests: testsResult.rows
        };
      })
    );
    
    res.json({
      success: true,
      bookings: bookingsWithTests,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching lab bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lab bookings'
    });
  }
});

// Update booking status
router.put('/bookings/:bookingId/status', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, scheduledDate, scheduledTime, collectionTime, reportUrl } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'sample_collected', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    const result = await pool.query(`
      UPDATE lab_bookings 
      SET status = $1, 
          scheduled_date = $2,
          scheduled_time = $3,
          collection_time = $4,
          report_url = $5,
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [status, scheduledDate, scheduledTime, collectionTime, reportUrl, bookingId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      booking: result.rows[0],
      message: 'Booking status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status'
    });
  }
});

// Get popular tests
router.get('/tests/popular', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        lt.id, lt.name, lt.category, lt.price, lt.description,
        COUNT(lb.id) as booking_count
      FROM lab_tests lt
      LEFT JOIN lab_bookings lb ON lt.id = ANY(lb.test_ids)
      WHERE lt.is_active = true
      GROUP BY lt.id
      ORDER BY booking_count DESC, lt.name ASC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      tests: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching popular tests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular tests'
    });
  }
});

// Get test packages (common test combinations)
router.get('/packages', async (req, res) => {
  try {
    // Define common test packages
    const packages = [
      {
        id: 'basic_health',
        name: 'Basic Health Package',
        description: 'Essential tests for general health checkup',
        tests: ['Complete Blood Count (CBC)', 'Lipid Profile', 'Urinalysis'],
        originalPrice: 4200,
        packagePrice: 3500,
        savings: 700
      },
      {
        id: 'diabetes_screening',
        name: 'Diabetes Screening',
        description: 'Tests to monitor blood sugar levels',
        tests: ['HbA1c', 'Complete Blood Count (CBC)'],
        originalPrice: 3000,
        packagePrice: 2500,
        savings: 500
      },
      {
        id: 'liver_function',
        name: 'Liver Function Package',
        description: 'Comprehensive liver health assessment',
        tests: ['Liver Function Test (LFT)', 'Complete Blood Count (CBC)'],
        originalPrice: 3700,
        packagePrice: 3200,
        savings: 500
      }
    ];
    
    res.json({
      success: true,
      packages: packages
    });
    
  } catch (error) {
    console.error('Error fetching test packages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch test packages'
    });
  }
});

// Get lab facilities by city
router.get('/facilities/cities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT city 
      FROM lab_facilities 
      WHERE is_active = true 
      ORDER BY city ASC
    `);
    
    res.json({
      success: true,
      cities: result.rows.map(row => row.city)
    });
    
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities'
    });
  }
});

// Get lab reports
router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 10, offset = 0 } = req.query;
    
    const result = await pool.query(`
      SELECT 
        lb.id as booking_id,
        lb.scheduled_date,
        lb.report_url,
        lb.collection_time,
        lf.name as facility_name
      FROM lab_bookings lb
      JOIN lab_facilities lf ON lb.facility_id = lf.id
      WHERE lb.patient_id = $1 
        AND lb.status = 'completed'
        AND lb.report_url IS NOT NULL
      ORDER BY lb.collection_time DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      reports: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lab reports'
    });
  }
});

module.exports = router;