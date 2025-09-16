const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const { validateEmergencyAlert } = require('../validators/emergency');
const { sendEmergencyNotification } = require('../services/notifications');
const { findNearbyServices } = require('../services/location');

// Create emergency alert
router.post('/alert', authMiddleware, validateEmergencyAlert, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      alertType,
      severity,
      locationData,
      vitalData,
      alertMessage
    } = req.body;
    
    const userId = req.user.id;
    
    // Create emergency alert
    const alertResult = await client.query(`
      INSERT INTO emergency_alerts (
        patient_id, alert_type, severity, location_data, 
        vital_data, alert_message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING id, created_at
    `, [userId, alertType, severity, JSON.stringify(locationData), 
        JSON.stringify(vitalData), alertMessage]);
    
    const emergencyId = alertResult.rows[0].id;
    
    // Get user's emergency contacts
    const contactsResult = await client.query(`
      SELECT * FROM emergency_contacts 
      WHERE user_id = $1 AND is_primary = true
      ORDER BY is_primary DESC
    `, [userId]);
    
    // Get nearby emergency services
    let nearbyServices = [];
    if (locationData && locationData.latitude && locationData.longitude) {
      nearbyServices = await findNearbyServices(
        locationData.latitude, 
        locationData.longitude
      );
    }
    
    // Send notifications to emergency contacts
    if (contactsResult.rows.length > 0) {
      for (const contact of contactsResult.rows) {
        await sendEmergencyNotification({
          emergencyId,
          contactPhone: contact.phone,
          contactEmail: contact.email,
          patientName: req.user.name,
          alertType,
          severity,
          location: locationData?.address || 'Location not available',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Log the emergency alert creation
    await client.query(`
      INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, 
        request_data, compliance_category
      ) VALUES ($1, 'emergency_alert_created', 'emergency_alert', $2, $3, 'safety')
    `, [userId, emergencyId, JSON.stringify(req.body)]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      emergencyId: emergencyId.toString(),
      timestamp: alertResult.rows[0].created_at,
      contactsNotified: contactsResult.rows.length,
      nearbyServicesFound: nearbyServices.length,
      message: 'Emergency alert created and notifications sent'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating emergency alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create emergency alert'
    });
  } finally {
    client.release();
  }
});

// Get nearby emergency services
router.post('/services/nearby', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, radius = 25 } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    // Query for nearby emergency services using PostGIS
    const servicesResult = await pool.query(`
      SELECT 
        id, name, type, phone, address, city,
        ST_Distance(
          ST_Point($1, $2)::geography,
          coordinates::geography
        ) / 1000 as distance_km,
        response_time_avg,
        specialties
      FROM emergency_services 
      WHERE is_active = true 
        AND ST_DWithin(
          ST_Point($1, $2)::geography,
          coordinates::geography,
          $3 * 1000
        )
      ORDER BY distance_km ASC
      LIMIT 10
    `, [longitude, latitude, radius]);
    
    const services = servicesResult.rows.map(service => ({
      id: service.id,
      name: service.name,
      type: service.type,
      phone: service.phone,
      address: service.address,
      city: service.city,
      distance: parseFloat(service.distance_km).toFixed(1),
      responseTime: service.response_time_avg,
      specialties: service.specialties
    }));
    
    res.json({
      success: true,
      services,
      location: { latitude, longitude },
      searchRadius: radius
    });
    
  } catch (error) {
    console.error('Error finding nearby services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find nearby emergency services'
    });
  }
});

// Update emergency alert status
router.put('/alert/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, responderId } = req.body;
    
    const validStatuses = ['active', 'acknowledged', 'resolved', 'false_alarm'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    // Update the emergency alert
    const result = await pool.query(`
      UPDATE emergency_alerts 
      SET status = $1, 
          resolution_notes = $2, 
          responder_id = $3,
          response_time = CASE 
            WHEN status = 'active' AND $1 = 'acknowledged' 
            THEN EXTRACT(EPOCH FROM (NOW() - created_at))
            ELSE response_time
          END
      WHERE id = $4 AND (patient_id = $5 OR $6 = true)
      RETURNING *
    `, [status, resolutionNotes, responderId, id, req.user.id, req.user.role === 'admin']);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Emergency alert not found or access denied'
      });
    }
    
    // Log the status update
    await pool.query(`
      INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, 
        request_data, compliance_category
      ) VALUES ($1, 'emergency_status_updated', 'emergency_alert', $2, $3, 'safety')
    `, [req.user.id, id, JSON.stringify({ status, resolutionNotes })]);
    
    res.json({
      success: true,
      alert: result.rows[0],
      message: `Emergency alert ${status}`
    });
    
  } catch (error) {
    console.error('Error updating emergency alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update emergency alert'
    });
  }
});

// Report false alarm
router.post('/:id/false-alarm', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE emergency_alerts 
      SET status = 'false_alarm', 
          resolution_notes = 'Reported as false alarm by user',
          response_time = EXTRACT(EPOCH FROM (NOW() - created_at))
      WHERE id = $1 AND patient_id = $2
      RETURNING *
    `, [id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Emergency alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Emergency alert marked as false alarm'
    });
    
  } catch (error) {
    console.error('Error marking false alarm:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark as false alarm'
    });
  }
});

// Get user's emergency contacts
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, relationship, phone, email, is_primary
      FROM emergency_contacts 
      WHERE user_id = $1 
      ORDER BY is_primary DESC, name ASC
    `, [req.user.id]);
    
    res.json({
      success: true,
      contacts: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emergency contacts'
    });
  }
});

// Add emergency contact
router.post('/contacts', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      relationship,
      phone,
      email,
      isPrimary = false,
      canMakeMedicalDecisions = false,
      address
    } = req.body;
    
    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone are required'
      });
    }
    
    const result = await pool.query(`
      INSERT INTO emergency_contacts (
        user_id, name, relationship, phone, email, 
        is_primary, can_make_medical_decisions, address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      req.user.id, name, relationship, phone, email,
      isPrimary, canMakeMedicalDecisions, address
    ]);
    
    res.status(201).json({
      success: true,
      contact: result.rows[0],
      message: 'Emergency contact added successfully'
    });
    
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add emergency contact'
    });
  }
});

// Update emergency contact
router.put('/contacts/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      relationship,
      phone,
      email,
      isPrimary,
      canMakeMedicalDecisions,
      address
    } = req.body;
    
    const result = await pool.query(`
      UPDATE emergency_contacts 
      SET name = $1, relationship = $2, phone = $3, email = $4,
          is_primary = $5, can_make_medical_decisions = $6, address = $7
      WHERE id = $8 AND user_id = $9
      RETURNING *
    `, [
      name, relationship, phone, email, isPrimary,
      canMakeMedicalDecisions, address, id, req.user.id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Emergency contact not found'
      });
    }
    
    res.json({
      success: true,
      contact: result.rows[0],
      message: 'Emergency contact updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update emergency contact'
    });
  }
});

// Delete emergency contact
router.delete('/contacts/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM emergency_contacts 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Emergency contact not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete emergency contact'
    });
  }
});

// Get emergency alerts (for admin/monitoring)
router.get('/alerts', authMiddleware, async (req, res) => {
  try {
    let query = `
      SELECT 
        ea.*,
        u.name as patient_name,
        u.phone as patient_phone,
        resp.name as responder_name
      FROM emergency_alerts ea
      LEFT JOIN users u ON ea.patient_id = u.id
      LEFT JOIN users resp ON ea.responder_id = resp.id
    `;
    
    let params = [];
    let whereClause = [];
    
    // If not admin, only show user's own alerts
    if (req.user.role !== 'admin') {
      whereClause.push('ea.patient_id = $1');
      params.push(req.user.id);
    }
    
    // Status filter
    if (req.query.status) {
      whereClause.push(`ea.status = $${params.length + 1}`);
      params.push(req.query.status);
    }
    
    // Date range filter
    if (req.query.from) {
      whereClause.push(`ea.created_at >= $${params.length + 1}`);
      params.push(req.query.from);
    }
    
    if (req.query.to) {
      whereClause.push(`ea.created_at <= $${params.length + 1}`);
      params.push(req.query.to);
    }
    
    if (whereClause.length > 0) {
      query += ' WHERE ' + whereClause.join(' AND ');
    }
    
    query += ' ORDER BY ea.created_at DESC LIMIT 50';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      alerts: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching emergency alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emergency alerts'
    });
  }
});

module.exports = router;