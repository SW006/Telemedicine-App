const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const { Server } = require('socket.io');

// Get video session details
router.get('/session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    
    // Get session details and verify user access
    const sessionResult = await pool.query(`
      SELECT 
        vs.*,
        a.patient_id,
        a.doctor_id,
        a.scheduled_time,
        p.name as patient_name,
        d.name as doctor_name
      FROM video_sessions vs
      JOIN appointments a ON vs.appointment_id = a.id
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      WHERE vs.id = $1 
        AND (a.patient_id = $2 OR a.doctor_id = $2)
    `, [sessionId, userId]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Video session not found or access denied'
      });
    }
    
    const session = sessionResult.rows[0];
    
    res.json({
      success: true,
      session: {
        id: session.id,
        appointmentId: session.appointment_id,
        status: session.status,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        duration: session.duration,
        quality: session.quality,
        recordingEnabled: session.recording_enabled,
        recordingUrl: session.recording_url,
        patientId: session.patient_id,
        doctorId: session.doctor_id,
        patientName: session.patient_name,
        doctorName: session.doctor_name,
        scheduledTime: session.scheduled_time
      }
    });
    
  } catch (error) {
    console.error('Error fetching video session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video session'
    });
  }
});

// Start video session
router.post('/session/start', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.userId;
    
    // Verify appointment exists and user has access
    const appointmentResult = await pool.query(`
      SELECT * FROM appointments 
      WHERE id = $1 AND (patient_id = $2 OR doctor_id = $2)
      AND status = 'confirmed'
    `, [appointmentId, userId]);
    
    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found or access denied'
      });
    }
    
    const appointment = appointmentResult.rows[0];
    
    // Check if session already exists
    let sessionResult = await pool.query(`
      SELECT * FROM video_sessions 
      WHERE appointment_id = $1
    `, [appointmentId]);
    
    let session;
    
    if (sessionResult.rows.length === 0) {
      // Create new session
      const insertResult = await pool.query(`
        INSERT INTO video_sessions (
          appointment_id, status, started_at, quality
        ) VALUES ($1, 'waiting', NOW(), 'high')
        RETURNING *
      `, [appointmentId]);
      
      session = insertResult.rows[0];
      
      // Update appointment status
      await pool.query(`
        UPDATE appointments 
        SET status = 'in_progress', updated_at = NOW()
        WHERE id = $1
      `, [appointmentId]);
      
    } else {
      session = sessionResult.rows[0];
      
      // Update session status if it was ended
      if (session.status === 'ended') {
        await pool.query(`
          UPDATE video_sessions 
          SET status = 'waiting', started_at = NOW()
          WHERE id = $1
        `, [session.id]);
        
        session.status = 'waiting';
        session.started_at = new Date();
      }
    }
    
    res.json({
      success: true,
      session: {
        id: session.id,
        appointmentId: session.appointment_id,
        status: session.status,
        startedAt: session.started_at,
        quality: session.quality
      }
    });
    
  } catch (error) {
    console.error('Error starting video session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start video session'
    });
  }
});

// Join video session
router.post('/session/:sessionId/join', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    
    // Verify session exists and user has access
    const sessionResult = await pool.query(`
      SELECT 
        vs.*,
        a.patient_id,
        a.doctor_id
      FROM video_sessions vs
      JOIN appointments a ON vs.appointment_id = a.id
      WHERE vs.id = $1 
        AND (a.patient_id = $2 OR a.doctor_id = $2)
    `, [sessionId, userId]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Video session not found or access denied'
      });
    }
    
    const session = sessionResult.rows[0];
    
    // Update session status to active if both parties are joining
    if (session.status === 'waiting') {
      await pool.query(`
        UPDATE video_sessions 
        SET status = 'active'
        WHERE id = $1
      `, [sessionId]);
    }
    
    // Log the join event
    await pool.query(`
      INSERT INTO video_session_logs (
        session_id, user_id, action, timestamp
      ) VALUES ($1, $2, 'joined', NOW())
    `, [sessionId, userId]);
    
    res.json({
      success: true,
      message: 'Successfully joined video session',
      sessionId: sessionId,
      userRole: userId === session.patient_id ? 'patient' : 'doctor'
    });
    
  } catch (error) {
    console.error('Error joining video session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join video session'
    });
  }
});

// End video session
router.post('/session/:sessionId/end', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { sessionId } = req.params;
    const { duration, quality } = req.body;
    const userId = req.user.userId;
    
    // Verify session exists and user has access
    const sessionResult = await client.query(`
      SELECT 
        vs.*,
        a.patient_id,
        a.doctor_id,
        a.id as appointment_id
      FROM video_sessions vs
      JOIN appointments a ON vs.appointment_id = a.id
      WHERE vs.id = $1 
        AND (a.patient_id = $2 OR a.doctor_id = $2)
    `, [sessionId, userId]);
    
    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Video session not found or access denied'
      });
    }
    
    const session = sessionResult.rows[0];
    
    // Update session
    await client.query(`
      UPDATE video_sessions 
      SET status = 'ended', 
          ended_at = NOW(),
          duration = $2,
          quality = $3
      WHERE id = $1
    `, [sessionId, duration, quality]);
    
    // Update appointment status
    await client.query(`
      UPDATE appointments 
      SET status = 'completed', 
          updated_at = NOW()
      WHERE id = $1
    `, [session.appointment_id]);
    
    // Log the end event
    await client.query(`
      INSERT INTO video_session_logs (
        session_id, user_id, action, timestamp
      ) VALUES ($1, $2, 'ended', NOW())
    `, [sessionId, userId]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Video session ended successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error ending video session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end video session'
    });
  } finally {
    client.release();
  }
});

// Get session logs
router.get('/session/:sessionId/logs', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;
    
    // Verify user has access to session
    const accessCheck = await pool.query(`
      SELECT 1 FROM video_sessions vs
      JOIN appointments a ON vs.appointment_id = a.id
      WHERE vs.id = $1 
        AND (a.patient_id = $2 OR a.doctor_id = $2 OR $3 = 'admin')
    `, [sessionId, userId, req.user.role]);
    
    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to session logs'
      });
    }
    
    const logsResult = await pool.query(`
      SELECT 
        vsl.*,
        u.name as user_name,
        u.role as user_role
      FROM video_session_logs vsl
      JOIN users u ON vsl.user_id = u.id
      WHERE vsl.session_id = $1
      ORDER BY vsl.timestamp ASC
    `, [sessionId]);
    
    res.json({
      success: true,
      logs: logsResult.rows
    });
    
  } catch (error) {
    console.error('Error fetching session logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session logs'
    });
  }
});

// Update session quality
router.put('/session/:sessionId/quality', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { quality } = req.body;
    const userId = req.user.userId;
    
    const validQualities = ['low', 'medium', 'high'];
    if (!validQualities.includes(quality)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quality setting'
      });
    }
    
    // Verify session exists and user has access
    const sessionResult = await pool.query(`
      SELECT vs.id FROM video_sessions vs
      JOIN appointments a ON vs.appointment_id = a.id
      WHERE vs.id = $1 
        AND (a.patient_id = $2 OR a.doctor_id = $2)
    `, [sessionId, userId]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Video session not found or access denied'
      });
    }
    
    // Update quality
    await pool.query(`
      UPDATE video_sessions 
      SET quality = $1
      WHERE id = $2
    `, [quality, sessionId]);
    
    res.json({
      success: true,
      message: 'Video quality updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating video quality:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update video quality'
    });
  }
});

// Get user's video sessions
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        vs.*,
        a.patient_id,
        a.doctor_id,
        a.scheduled_time,
        p.name as patient_name,
        d.name as doctor_name
      FROM video_sessions vs
      JOIN appointments a ON vs.appointment_id = a.id
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      WHERE (a.patient_id = $1 OR a.doctor_id = $1)
    `;
    
    const params = [userId];
    
    if (status) {
      query += ` AND vs.status = $${params.length + 1}`;
      params.push(status);
    }
    
    query += ` ORDER BY vs.started_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      sessions: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching video sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video sessions'
    });
  }
});

// WebRTC signaling endpoints will be handled via Socket.IO
// This is a placeholder for the signaling server setup

module.exports = router;