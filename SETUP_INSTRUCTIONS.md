# TeleTabib Setup Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- Git

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd TeleTabib

# Run the automated setup script
node setup-teletabib.js
```

### 2. Manual Setup (if automated setup fails)

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your database credentials
# Update DB_HOST, DB_USER, DB_PASSWORD, etc.

# Setup database
node src/db/setup.js

# Start backend server
npm start
```

#### Frontend Setup
```bash
cd front-end

# Install dependencies
npm install

# Create environment file
cp env.local.example .env.local

# Start frontend development server
npm run dev
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medical_booking
DB_USER=postgres
DB_PASSWORD=your-password
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=TeleTabib
```

## 🗄️ Database Setup

### PostgreSQL Setup
1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE medical_booking;
   CREATE USER medical_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE medical_booking TO medical_user;
   ```

### Run Database Setup
```bash
cd backend
node src/db/setup.js
```

This will create all necessary tables and insert sample data.

## 🧪 Testing

### Test Backend
```bash
cd backend
node test-backend-setup.js
```

### Test Frontend
```bash
cd front-end
npm run dev
# Open http://localhost:3000
```

## 📱 Application Features

### Patient Features
- User registration and login
- Doctor search and filtering
- Appointment booking
- Appointment management
- Doctor reviews and ratings

### Doctor Features
- Doctor registration and verification
- Profile management
- Availability setting
- Appointment management
- Patient management

### Admin Features
- User management
- Doctor verification
- System monitoring

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/doctor-signup` - Doctor registration

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/search` - Search doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/specializations` - Get all specializations
- `GET /api/doctors/cities` - Get all cities

### Appointments
- `POST /api/appointments/book` - Book appointment
- `GET /api/appointments/my-appointments` - Get user appointments
- `PATCH /api/appointments/:id/cancel` - Cancel appointment

### Availability
- `GET /api/availability/:doctorId` - Get doctor availability
- `GET /api/availability/:doctorId/slots` - Get available time slots

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
- Check PostgreSQL is running
- Verify database credentials in .env
- Ensure database exists

#### Backend Won't Start
- Check if port 5000 is available
- Verify all environment variables are set
- Check Node.js version (16+ required)

#### Frontend Won't Start
- Check if port 3000 is available
- Verify Node.js version
- Clear node_modules and reinstall

#### API Calls Failing
- Check backend is running on port 5000
- Verify CORS settings
- Check network connectivity

### Debug Mode
```bash
# Backend with debug logs
cd backend
DEBUG=* npm start

# Frontend with debug logs
cd front-end
DEBUG=* npm run dev
```

## 📊 Database Schema

### Tables
- `users` - User accounts
- `doctors` - Doctor profiles
- `appointments` - Appointment records
- `availability` - Doctor availability
- `feedback` - Patient feedback
- `queue` - Virtual waiting room
- `password_reset_tokens` - Password reset tokens

### Sample Data
The setup script includes sample doctors and availability data for testing.

## 🚀 Production Deployment

### Environment Variables
Update all environment variables for production:
- Use strong JWT secrets
- Set up production database
- Configure email service
- Set up proper CORS origins

### Database
- Use connection pooling
- Set up database backups
- Configure proper indexes

### Security
- Enable HTTPS
- Set up rate limiting
- Configure proper CORS
- Use environment variables for secrets

## 📞 Support

If you encounter issues:
1. Check the console output for errors
2. Verify all prerequisites are installed
3. Check the troubleshooting section
4. Review the API documentation

## 🔄 Updates

To update the application:
1. Pull latest changes
2. Run `npm install` in both directories
3. Run database migrations if any
4. Restart both servers

---

**Happy coding! 🎉**
