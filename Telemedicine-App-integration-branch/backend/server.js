const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const { createServer } = require('http');
require('dotenv').config();

// Import socket server
const { initializeSocketServer } = require('./src/services/socketServer');

// Import routes
const authRoutes = require('./src/routes/auth');
const appointmentRoutes = require('./src/routes/appointments');
const doctorRoutes = require('./src/routes/doctors');
const userRoutes = require('./src/routes/users');
const availabilityRoutes = require('./src/routes/availability');
const passwordResetRoutes = require('./src/routes/passwordReset');
const queueRoutes = require('./src/routes/queue');
const feedbackRoutes = require('./src/routes/feedback');
const emergencyRoutes = require('./src/routes/emergency');
const geocodingRoutes = require('./src/routes/geocoding');
const videoRoutes = require('./src/routes/video');
const pharmaciesRoutes = require('./src/routes/pharmacies');
const labsRoutes = require('./src/routes/labs');

// Initialize Express app
const app = express();

// 1. Environment Validation
const requiredEnvVars = ['PORT', 'JWT_SECRET', 'SMTP_USER', 'SMTP_PASS'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.log('💡 Please check your .env file');
  process.exit(1);
}

console.log('✅ Configuration validated successfully');

// 2. Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 3. Body Parsing Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Rate Limiting - Disabled for development
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api/', limiter);
} else {
  console.log('⚠️  Rate limiting disabled for development environment');
}

// 5. Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/pharmacies', pharmaciesRoutes);
app.use('/api/labs', labsRoutes);

// 6. Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 7. Static Files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// 8. 404 Handler - ALTERNATIVE VERSION
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// 9. Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 10. Start Server
const PORT = 5001;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initializeSocketServer(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 WebSocket server initialized`);
});

module.exports = app;