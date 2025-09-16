const { Server } = require('socket.io');
const { authenticateSocketToken } = require('../middleware/auth');
const { pool } = require('../db/pool');

let io = null;

// Initialize Socket.IO server
const initializeSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      const user = await authenticateSocketToken(token);
      socket.user = user;
      console.log(`Socket authenticated for user: ${user.email}`);
      next();
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.id})`);
    
    // Join user to their personal room
    socket.join(`user_${socket.user.userId}`);
    
    // Video consultation handlers
    setupVideoHandlers(socket);
    
    // Emergency alerts handlers
    setupEmergencyHandlers(socket);
    
    // General chat and notifications
    setupGeneralHandlers(socket);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email} (${socket.id})`);
      handleUserDisconnect(socket);
    });
  });

  console.log('✅ Socket.IO server initialized');
  return io;
};

// Video consultation WebRTC signaling handlers
const setupVideoHandlers = (socket) => {
  const userId = socket.user.userId;
  
  // Join video session room
  socket.on('join-video-session', async (data) => {
    try {
      const { sessionId } = data;
      
      // Verify user has access to this session
      const accessCheck = await pool.query(`
        SELECT vs.id, a.patient_id, a.doctor_id 
        FROM video_sessions vs
        JOIN appointments a ON vs.appointment_id = a.id
        WHERE vs.id = $1 AND (a.patient_id = $2 OR a.doctor_id = $2)
      `, [sessionId, userId]);
      
      if (accessCheck.rows.length === 0) {
        socket.emit('video-error', { error: 'Access denied to video session' });
        return;
      }
      
      const session = accessCheck.rows[0];
      const roomName = `video_session_${sessionId}`;
      
      // Join the session room
      socket.join(roomName);
      
      // Determine user role
      const userRole = userId === session.patient_id ? 'patient' : 'doctor';
      
      // Notify others in the room
      socket.to(roomName).emit('user-joined-session', {
        userId: userId,
        userRole: userRole,
        socketId: socket.id
      });
      
      // Send current room participants to the new user
      const sockets = await io.in(roomName).fetchSockets();
      const participants = sockets.map(s => ({
        userId: s.user.userId,
        userRole: s.user.userId === session.patient_id ? 'patient' : 'doctor',
        socketId: s.id
      }));
      
      socket.emit('session-joined', {
        sessionId: sessionId,
        userRole: userRole,
        participants: participants
      });
      
      console.log(`User ${userId} joined video session ${sessionId}`);
      
    } catch (error) {
      console.error('Error joining video session:', error);
      socket.emit('video-error', { error: 'Failed to join video session' });
    }
  });
  
  // Leave video session room
  socket.on('leave-video-session', (data) => {
    const { sessionId } = data;
    const roomName = `video_session_${sessionId}`;
    
    socket.leave(roomName);
    socket.to(roomName).emit('user-left-session', {
      userId: userId,
      socketId: socket.id
    });
    
    console.log(`User ${userId} left video session ${sessionId}`);
  });
  
  // WebRTC signaling - offer
  socket.on('webrtc-offer', (data) => {
    const { sessionId, targetUserId, offer } = data;
    const roomName = `video_session_${sessionId}`;
    
    socket.to(roomName).emit('webrtc-offer', {
      fromUserId: userId,
      offer: offer,
      socketId: socket.id
    });
    
    console.log(`WebRTC offer sent from ${userId} in session ${sessionId}`);
  });
  
  // WebRTC signaling - answer
  socket.on('webrtc-answer', (data) => {
    const { sessionId, targetUserId, answer } = data;
    const roomName = `video_session_${sessionId}`;
    
    socket.to(roomName).emit('webrtc-answer', {
      fromUserId: userId,
      answer: answer,
      socketId: socket.id
    });
    
    console.log(`WebRTC answer sent from ${userId} in session ${sessionId}`);
  });
  
  // WebRTC signaling - ICE candidate
  socket.on('webrtc-ice-candidate', (data) => {
    const { sessionId, candidate } = data;
    const roomName = `video_session_${sessionId}`;
    
    socket.to(roomName).emit('webrtc-ice-candidate', {
      fromUserId: userId,
      candidate: candidate,
      socketId: socket.id
    });
  });
  
  // Media controls
  socket.on('toggle-video', (data) => {
    const { sessionId, enabled } = data;
    const roomName = `video_session_${sessionId}`;
    
    socket.to(roomName).emit('user-video-toggle', {
      userId: userId,
      videoEnabled: enabled
    });
  });
  
  socket.on('toggle-audio', (data) => {
    const { sessionId, enabled } = data;
    const roomName = `video_session_${sessionId}`;
    
    socket.to(roomName).emit('user-audio-toggle', {
      userId: userId,
      audioEnabled: enabled
    });
  });
  
  // Screen sharing
  socket.on('start-screen-share', (data) => {
    const { sessionId } = data;
    const roomName = `video_session_${sessionId}`;
    
    socket.to(roomName).emit('user-screen-share-start', {
      userId: userId
    });
  });
  
  socket.on('stop-screen-share', (data) => {
    const { sessionId } = data;
    const roomName = `video_session_${sessionId}`;
    
    socket.to(roomName).emit('user-screen-share-stop', {
      userId: userId
    });
  });
  
  // Session quality updates
  socket.on('quality-update', (data) => {
    const { sessionId, quality, networkStats } = data;
    const roomName = `video_session_${sessionId}`;
    
    socket.to(roomName).emit('session-quality-update', {
      userId: userId,
      quality: quality,
      networkStats: networkStats
    });
  });
};

// Emergency alert handlers
const setupEmergencyHandlers = (socket) => {
  const userId = socket.user.userId;
  
  // Join emergency notifications room
  socket.join(`emergency_${userId}`);
  
  // Handle emergency alert broadcasts
  socket.on('emergency-alert-created', async (data) => {
    try {
      const { emergencyId } = data;
      
      // Get emergency contacts for the user
      const contactsResult = await pool.query(`
        SELECT user_id FROM emergency_contacts 
        WHERE user_id IN (
          SELECT DISTINCT user_id FROM emergency_contacts 
          WHERE user_id != $1
        )
      `, [userId]);
      
      // Notify emergency contacts via socket
      contactsResult.rows.forEach(contact => {
        socket.to(`user_${contact.user_id}`).emit('emergency-alert-received', {
          emergencyId: emergencyId,
          patientId: userId,
          timestamp: new Date().toISOString()
        });
      });
      
    } catch (error) {
      console.error('Error handling emergency alert:', error);
    }
  });
  
  // Handle emergency status updates
  socket.on('emergency-status-update', (data) => {
    const { emergencyId, status } = data;
    
    // Broadcast status update to relevant users
    io.emit('emergency-status-updated', {
      emergencyId: emergencyId,
      status: status,
      updatedBy: userId,
      timestamp: new Date().toISOString()
    });
  });
};

// General handlers for notifications and messaging
const setupGeneralHandlers = (socket) => {
  const userId = socket.user.userId;
  
  // Join user to notification rooms based on role
  if (socket.user.role === 'doctor') {
    socket.join('doctors');
  } else if (socket.user.role === 'patient') {
    socket.join('patients');
  }
  
  // Handle real-time notifications
  socket.on('mark-notification-read', async (data) => {
    try {
      const { notificationId } = data;
      
      await pool.query(`
        UPDATE notifications 
        SET is_read = true, read_at = NOW()
        WHERE id = $1 AND user_id = $2
      `, [notificationId, userId]);
      
      socket.emit('notification-marked-read', { notificationId });
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });
  
  // Handle typing indicators for chat
  socket.on('typing-start', (data) => {
    const { appointmentId } = data;
    socket.to(`appointment_${appointmentId}`).emit('user-typing', {
      userId: userId,
      typing: true
    });
  });
  
  socket.on('typing-stop', (data) => {
    const { appointmentId } = data;
    socket.to(`appointment_${appointmentId}`).emit('user-typing', {
      userId: userId,
      typing: false
    });
  });
  
  // Handle appointment updates
  socket.on('appointment-updated', (data) => {
    const { appointmentId, patientId, doctorId } = data;
    
    // Notify both patient and doctor
    socket.to(`user_${patientId}`).emit('appointment-update-received', data);
    socket.to(`user_${doctorId}`).emit('appointment-update-received', data);
  });
};

// Handle user disconnect
const handleUserDisconnect = async (socket) => {
  const userId = socket.user.userId;
  
  try {
    // Update user's last seen
    await pool.query(`
      UPDATE users 
      SET last_seen = NOW()
      WHERE id = $1
    `, [userId]);
    
    // Notify active video sessions
    const activeSessionsResult = await pool.query(`
      SELECT vs.id as session_id
      FROM video_sessions vs
      JOIN appointments a ON vs.appointment_id = a.id
      WHERE (a.patient_id = $1 OR a.doctor_id = $1)
        AND vs.status = 'active'
    `, [userId]);
    
    activeSessionsResult.rows.forEach(session => {
      const roomName = `video_session_${session.session_id}`;
      socket.to(roomName).emit('user-disconnected', {
        userId: userId,
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('Error handling user disconnect:', error);
  }
};

// Utility functions for external use
const sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification-received', notification);
  }
};

const sendEmergencyAlert = (contactIds, alertData) => {
  if (io) {
    contactIds.forEach(contactId => {
      io.to(`user_${contactId}`).emit('emergency-alert-received', alertData);
    });
  }
};

const broadcastToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

const getConnectedUsers = async () => {
  if (io) {
    const sockets = await io.fetchSockets();
    return sockets.map(socket => ({
      userId: socket.user.userId,
      email: socket.user.email,
      socketId: socket.id,
      connectedAt: socket.handshake.time
    }));
  }
  return [];
};

module.exports = {
  initializeSocketServer,
  sendNotificationToUser,
  sendEmergencyAlert,
  broadcastToRoom,
  getConnectedUsers,
  getIO: () => io
};