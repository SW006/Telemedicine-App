# Emergency Services & Video Consultation Systems Documentation

## Overview

This document provides comprehensive information about the Emergency Services and Video Consultation systems implemented in the TeleTabib telemedicine platform. These systems provide critical functionality for patient safety and remote healthcare delivery.

## Table of Contents

1. [Emergency Services System](#emergency-services-system)
2. [Video Consultation System](#video-consultation-system)
3. [WebSocket Implementation](#websocket-implementation)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Configuration](#configuration)
8. [Security Considerations](#security-considerations)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Emergency Services System

### Features

- **Emergency Button**: One-tap emergency alert activation
- **GPS Location Tracking**: Automatic location detection and address resolution
- **Multi-Channel Notifications**: SMS, Email, and Push notifications
- **Emergency Contacts Management**: Primary and secondary emergency contacts
- **Nearby Services Lookup**: Find nearby hospitals, ambulances, and emergency services
- **False Alarm Reporting**: Ability to cancel accidental alerts
- **Real-time Status Updates**: Track emergency alert progression
- **Audit Logging**: Complete audit trail for compliance

### Core Components

#### 1. Emergency Alert Creation

```javascript
// POST /api/emergency/alert
{
  "alertType": "medical|fire|police|general|fall_detected|vitals_critical|panic",
  "severity": "low|medium|high|critical",
  "locationData": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10,
    "address": "123 Main St, New York, NY",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "vitalData": {
    "heartRate": 120,
    "bloodPressure": { "systolic": 140, "diastolic": 90 },
    "oxygenSaturation": 95,
    "temperature": 99.5
  },
  "alertMessage": "Patient experiencing chest pain"
}
```

#### 2. Emergency Contacts Management

```javascript
// POST /api/emergency/contacts
{
  "name": "John Doe",
  "relationship": "spouse|parent|child|sibling|relative|friend|caregiver|doctor|other",
  "phone": "+1234567890",
  "email": "john@example.com",
  "isPrimary": true,
  "canMakeMedicalDecisions": false,
  "address": "456 Oak Ave, New York, NY"
}
```

#### 3. Nearby Services Lookup

```javascript
// POST /api/emergency/services/nearby
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 25 // kilometers
}
```

### Notification System

The emergency notification system supports multiple channels:

#### SMS Notifications (Twilio)
- Immediate SMS alerts to emergency contacts
- Rich formatted messages with location and severity
- Delivery status tracking

#### Email Notifications
- HTML formatted emergency alerts
- Professional email templates
- High priority email headers

#### Push Notifications
- Browser push notifications
- Mobile app notifications (if applicable)
- Real-time WebSocket notifications

### Location Services

#### Geocoding Support
- **Google Maps API**: High accuracy, paid service
- **Mapbox API**: Good accuracy, paid service  
- **Nominatim (OpenStreetMap)**: Free service, moderate accuracy

#### Reverse Geocoding
```javascript
// POST /api/geocoding/reverse
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

#### Forward Geocoding
```javascript
// POST /api/geocoding/forward
{
  "address": "123 Main St, New York, NY"
}
```

## Video Consultation System

### Features

- **WebRTC Video/Audio**: Peer-to-peer communication
- **Real-time Signaling**: Socket.IO based signaling server
- **Session Management**: Start, join, and end video sessions
- **Media Controls**: Toggle video/audio, screen sharing
- **Quality Management**: Adaptive quality based on network conditions
- **Session Recording**: Optional session recording capability
- **Multi-participant Support**: Support for multiple participants
- **Mobile Responsive**: Works on desktop and mobile browsers

### WebRTC Implementation

#### 1. Session Initiation

```javascript
// POST /api/video/session/start
{
  "appointmentId": "uuid"
}
```

#### 2. Join Session

```javascript
// POST /api/video/session/:sessionId/join
// WebSocket: join-video-session
{
  "sessionId": "uuid"
}
```

#### 3. WebRTC Signaling

```javascript
// Offer
socket.emit('webrtc-offer', {
  sessionId: 'uuid',
  offer: rtcSessionDescription
});

// Answer
socket.emit('webrtc-answer', {
  sessionId: 'uuid', 
  answer: rtcSessionDescription
});

// ICE Candidates
socket.emit('webrtc-ice-candidate', {
  sessionId: 'uuid',
  candidate: rtcIceCandidate
});
```

### Session Management

#### Video Session States
- **waiting**: Session created, waiting for participants
- **active**: Both participants connected
- **ended**: Session completed

#### Quality Levels
- **low**: 240p video, optimized for slow connections
- **medium**: 480p video, balanced quality/bandwidth
- **high**: 720p+ video, best quality

## WebSocket Implementation

### Connection Management

```javascript
// Client connection with authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: 'jwt-token-here'
  }
});
```

### Room Management

- **Personal Rooms**: `user_${userId}` for notifications
- **Video Sessions**: `video_session_${sessionId}` for WebRTC signaling
- **Emergency Alerts**: `emergency_${userId}` for emergency notifications
- **Role-based Rooms**: `doctors`, `patients` for broadcasts

### Event Handling

#### Video Events
- `join-video-session`
- `leave-video-session`
- `webrtc-offer`
- `webrtc-answer`
- `webrtc-ice-candidate`
- `toggle-video`
- `toggle-audio`
- `start-screen-share`
- `stop-screen-share`

#### Emergency Events
- `emergency-alert-created`
- `emergency-status-update`
- `emergency-alert-received`

## Database Schema

### Emergency Tables

```sql
-- Emergency alerts
CREATE TABLE emergency_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id),
    alert_type emergency_alert_type NOT NULL,
    severity emergency_severity NOT NULL,
    status emergency_status DEFAULT 'active',
    location_data JSONB,
    vital_data JSONB,
    alert_message TEXT,
    response_time INTEGER,
    resolution_notes TEXT,
    responder_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Emergency contacts
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    relationship contact_relationship,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    can_make_medical_decisions BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Emergency services
CREATE TABLE emergency_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type service_type,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    city VARCHAR(100),
    state VARCHAR(100),
    response_time_avg INTEGER,
    specialties TEXT[],
    is_24_7 BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    capacity_info JSONB,
    contact_person VARCHAR(100),
    emergency_line VARCHAR(20)
);
```

### Video Tables

```sql
-- Video sessions
CREATE TABLE video_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id),
    status session_status DEFAULT 'waiting',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    duration INTEGER,
    quality video_quality DEFAULT 'medium',
    recording_enabled BOOLEAN DEFAULT false,
    recording_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Session logs
CREATE TABLE video_session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_sessions(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);
```

## API Endpoints

### Emergency Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emergency/alert` | Create emergency alert |
| POST | `/api/emergency/services/nearby` | Find nearby services |
| PUT | `/api/emergency/alert/:id/status` | Update alert status |
| POST | `/api/emergency/:id/false-alarm` | Report false alarm |
| GET | `/api/emergency/contacts` | Get emergency contacts |
| POST | `/api/emergency/contacts` | Add emergency contact |
| PUT | `/api/emergency/contacts/:id` | Update contact |
| DELETE | `/api/emergency/contacts/:id` | Delete contact |
| GET | `/api/emergency/alerts` | Get alerts history |

### Video Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/video/session/:sessionId` | Get session details |
| POST | `/api/video/session/start` | Start video session |
| POST | `/api/video/session/:sessionId/join` | Join session |
| POST | `/api/video/session/:sessionId/end` | End session |
| GET | `/api/video/session/:sessionId/logs` | Get session logs |
| PUT | `/api/video/session/:sessionId/quality` | Update quality |
| GET | `/api/video/sessions` | Get user sessions |

### Geocoding Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/geocoding/reverse` | Coordinates to address |
| POST | `/api/geocoding/forward` | Address to coordinates |
| POST | `/api/geocoding/location-info` | Get location details |
| POST | `/api/geocoding/validate` | Validate coordinates |
| POST | `/api/geocoding/batch/forward` | Batch geocoding |
| GET | `/api/geocoding/status` | Service status |

## Frontend Components

### Emergency Button Component

```jsx
import { EmergencyButton } from './components/EmergencyButton';

<EmergencyButton 
  userId={user.id}
  onAlertCreated={(alertId) => console.log('Alert created:', alertId)}
  onError={(error) => console.error('Emergency error:', error)}
/>
```

### Video Consultation Component

```jsx
import { VideoConsultation } from './components/VideoConsultation';

<VideoConsultation 
  appointmentId="uuid"
  userId={user.id}
  onSessionStart={(sessionId) => console.log('Session started')}
  onSessionEnd={() => console.log('Session ended')}
/>
```

## Configuration

### Environment Variables

```bash
# Emergency Services
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token  
TWILIO_PHONE_NUMBER=+1234567890

# Geocoding Services
GEOCODING_SERVICE=google|mapbox|nominatim
GOOGLE_MAPS_API_KEY=your_google_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_email@domain.com

# Email (already configured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# WebSocket
FRONTEND_URL=http://localhost:3000
```

### Required Dependencies

```json
{
  "twilio": "^5.3.2",
  "axios": "^1.7.7", 
  "joi": "^17.13.3",
  "web-push": "^3.6.7",
  "socket.io": "^4.8.1",
  "nodemailer": "^7.0.6"
}
```

## Security Considerations

### Authentication
- All API endpoints require JWT authentication
- WebSocket connections require token authentication
- Emergency alerts are user-scoped

### Data Protection
- Location data is encrypted in transit
- Personal health information follows HIPAA guidelines
- Emergency contacts are access-controlled

### Rate Limiting
- Emergency alerts: 10 per hour per user
- Geocoding requests: 100 per hour per user
- Video sessions: 5 concurrent per user

### Input Validation
- All input validated using Joi schemas
- Coordinates validated for reasonable ranges
- Phone numbers validated for format

## Testing

### Emergency System Tests

```bash
# Test emergency alert creation
curl -X POST http://localhost:5000/api/emergency/alert \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alertType": "medical",
    "severity": "high",
    "locationData": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'
```

### Video System Tests

```bash
# Test session creation
curl -X POST http://localhost:5000/api/video/session/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "uuid-here"}'
```

### WebSocket Testing

```javascript
// Test WebSocket connection
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Test video session join
  socket.emit('join-video-session', { sessionId: 'uuid' });
});
```

## Troubleshooting

### Common Issues

#### 1. Emergency Notifications Not Sending
- Check Twilio credentials and phone number format
- Verify SMTP settings for email notifications
- Ensure emergency contacts have valid phone/email

#### 2. Video Sessions Not Connecting
- Check WebSocket connection status
- Verify STUN/TURN server configuration
- Ensure browser has camera/microphone permissions

#### 3. Location Services Not Working
- Check geocoding API keys and rate limits
- Verify browser geolocation permissions
- Test with different geocoding providers

#### 4. Database Connection Issues
- Ensure PostgreSQL with PostGIS extension
- Check connection pool configuration
- Verify table creation and indexes

### Performance Optimization

#### Emergency System
- Cache geocoding results for 24 hours
- Batch notification sending
- Use database indexes on emergency_alerts(patient_id, created_at)

#### Video System  
- Implement connection pooling for WebSocket
- Use Redis for session state management (optional)
- Monitor and optimize video quality based on network

### Monitoring

#### Key Metrics
- Emergency alert response times
- Video session connection success rate  
- Notification delivery rates
- API response times

#### Logging
- All emergency alerts logged with audit trail
- Video session events tracked
- WebSocket connection/disconnection events
- API access logs with user identification

## Future Enhancements

### Emergency System
- Integration with local 911 dispatch systems
- Wearable device integration (Apple Watch, Fitbit)
- Machine learning for fall detection
- Geofencing for high-risk patients

### Video System
- Recording and playback functionality
- AI-powered health assessments during calls
- Multi-party consultations (patient + family + doctor)
- Virtual waiting room with queue management

### Integration
- EHR system integration
- Insurance claim automation
- Prescription management during video calls
- Real-time vital sign monitoring integration

---

For additional support or questions, please contact the development team or refer to the main TeleTabib documentation.