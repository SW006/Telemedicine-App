const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// Get all pharmacies
router.get('/', async (req, res) => {
  try {
    const { city, hasInsurance } = req.query;
    
    let query = `
      SELECT 
        id, name, address, city, phone, email, 
        delivery_fee, eta_minutes, operating_hours, 
        payment_methods, has_insurance_partnership,
        created_at, updated_at
      FROM pharmacies 
      WHERE is_active = true
    `;
    
    const params = [];
    
    if (city) {
      query += ` AND LOWER(city) = LOWER($${params.length + 1})`;
      params.push(city);
    }
    
    if (hasInsurance === 'true') {
      query += ` AND has_insurance_partnership = true`;
    }
    
    query += ` ORDER BY name ASC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      pharmacies: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching pharmacies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pharmacies'
    });
  }
});

// Get pharmacy by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM pharmacies WHERE id = $1 AND is_active = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
    }
    
    res.json({
      success: true,
      pharmacy: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching pharmacy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pharmacy'
    });
  }
});

// Get nearby pharmacies based on location
router.post('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    // For now, we'll just return pharmacies by city (later can implement PostGIS)
    const result = await pool.query(`
      SELECT 
        id, name, address, city, phone, email,
        delivery_fee, eta_minutes, operating_hours,
        payment_methods, has_insurance_partnership
      FROM pharmacies 
      WHERE is_active = true
      ORDER BY delivery_fee ASC, eta_minutes ASC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      pharmacies: result.rows,
      location: { latitude, longitude }
    });
    
  } catch (error) {
    console.error('Error finding nearby pharmacies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find nearby pharmacies'
    });
  }
});

// Create pharmacy order
router.post('/orders', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      pharmacyId,
      prescriptionId,
      medications,
      deliveryAddress,
      paymentMethod,
      specialInstructions
    } = req.body;
    
    const userId = req.user.userId;
    
    // Validate pharmacy exists
    const pharmacyResult = await client.query(
      'SELECT * FROM pharmacies WHERE id = $1 AND is_active = true',
      [pharmacyId]
    );
    
    if (pharmacyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found'
      });
    }
    
    const pharmacy = pharmacyResult.rows[0];
    
    // Calculate total amount (simplified)
    let totalAmount = pharmacy.delivery_fee;
    const medicationDetails = [];
    
    for (const med of medications) {
      // In a real system, you'd fetch actual medication prices
      const estimatedPrice = med.quantity * (med.estimatedUnitPrice || 50);
      totalAmount += estimatedPrice;
      
      medicationDetails.push({
        name: med.name,
        dosage: med.dosage,
        quantity: med.quantity,
        estimatedPrice: estimatedPrice
      });
    }
    
    // Create pharmacy order
    const orderResult = await client.query(`
      INSERT INTO pharmacy_orders (
        patient_id, pharmacy_id, prescription_id, 
        medications, total_amount, delivery_address,
        payment_method, special_instructions, 
        status, estimated_delivery_time, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'pending',
        NOW() + INTERVAL '${pharmacy.eta_minutes} minutes', NOW()
      ) RETURNING *
    `, [
      userId,
      pharmacyId,
      prescriptionId,
      JSON.stringify(medicationDetails),
      totalAmount,
      deliveryAddress,
      paymentMethod,
      specialInstructions
    ]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      order: orderResult.rows[0],
      message: 'Pharmacy order created successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating pharmacy order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create pharmacy order'
    });
  } finally {
    client.release();
  }
});

// Get user's pharmacy orders
router.get('/orders/my-orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        po.*,
        p.name as pharmacy_name,
        p.phone as pharmacy_phone,
        p.address as pharmacy_address
      FROM pharmacy_orders po
      JOIN pharmacies p ON po.pharmacy_id = p.id
      WHERE po.patient_id = $1
    `;
    
    const params = [userId];
    
    if (status) {
      query += ` AND po.status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY po.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      orders: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching pharmacy orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pharmacy orders'
    });
  }
});

// Update order status (for pharmacy staff)
router.put('/orders/:orderId/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingInfo, estimatedDeliveryTime } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    const result = await pool.query(`
      UPDATE pharmacy_orders 
      SET status = $1, 
          tracking_info = $2,
          estimated_delivery_time = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [status, trackingInfo, estimatedDeliveryTime, orderId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      order: result.rows[0],
      message: 'Order status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// Get available cities
router.get('/data/cities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT city FROM pharmacies 
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

module.exports = router;