# 🐘 PostgreSQL Setup Guide for TeleTabib

This guide will help you set up PostgreSQL database for the TeleTabib application.

## 📋 Prerequisites

### 1. Install PostgreSQL on Windows

#### Option A: Download from Official Website
1. Go to [PostgreSQL Official Download](https://www.postgresql.org/download/windows/)
2. Download the Windows installer
3. Run the installer and follow these steps:
   - Choose installation directory (default is fine)
   - Select components (keep all selected)
   - Set data directory (default is fine)
   - **Set password for postgres user**: `Medical@Booking123!`
   - Set port: `5432` (default)
   - Choose locale (default is fine)
   - Complete installation

#### Option B: Using Chocolatey (if you have it)
```powershell
choco install postgresql
```

#### Option C: Using Docker (Alternative)
```bash
docker run --name postgres-teletabib -e POSTGRES_PASSWORD=Medical@Booking123! -p 5432:5432 -d postgres:15
```

### 2. Verify PostgreSQL Installation

Open Command Prompt or PowerShell and run:
```bash
psql --version
```

If you see version information, PostgreSQL is installed correctly.

## 🚀 Quick Setup

### 1. Setup Environment Variables
```bash
# Navigate to backend folder
cd backend

# Copy environment template
copy .env.example .env
```

### 2. Update .env file
Open `.env` file and update these values:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=MedicalApp
DB_USER=postgres
DB_PASSWORD=Medical@Booking123!

# Add your email credentials for OTP
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Add a secure JWT secret
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Database (Automated)
```bash
npm run db:setup
```

This command will:
- ✅ Create the database if it doesn't exist
- ✅ Create all required tables
- ✅ Insert sample data
- ✅ Test the connection

## 🔧 Manual Setup (Alternative)

If automated setup fails, you can set up manually:

### 1. Connect to PostgreSQL
```bash
psql -U postgres -h localhost
```
Enter password: `Medical@Booking123!`

### 2. Create Database
```sql
CREATE DATABASE MedicalApp;
\q
```

### 3. Run Individual Setup Commands
```bash
# Create database only
npm run db:create

# Create tables only
npm run db:migrate

# Test connection
npm run db:test
```

## 📊 Database Schema

The setup creates these tables:

### Core Tables
- **users** - Patient and doctor accounts
- **doctors** - Doctor-specific information
- **appointments** - Appointment bookings
- **doctor_availability** - Doctor working hours
- **doctor_reviews** - Patient reviews for doctors

### Support Tables
- **notifications** - System notifications
- **feedback** - User feedback and complaints
- **feedback_categories** - Feedback classification
- **doctor_ratings** - Rating aggregations

### Error Tracking
- **notification_errors** - Failed notification tracking
- **job_errors** - Background job error logs

## 🔍 Verify Setup

### Check Database Connection
```bash
npm run db:test
```

### Check Tables Created
Connect to PostgreSQL:
```bash
psql -U postgres -d MedicalApp
```

List tables:
```sql
\dt
```

You should see all tables listed.

### Check Sample Data
```sql
SELECT * FROM feedback_categories;
SELECT COUNT(*) FROM users;
```

## 🚀 Start Application

### Backend Only
```bash
cd backend
npm run dev
```

### Full Stack (Frontend + Backend)
```bash
# From root directory
npm run dev
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "postgres role does not exist"
```bash
# Create postgres user (if missing)
createuser -s postgres
```

#### 2. "password authentication failed"
- Check your password in .env file
- Try resetting postgres password:
```bash
sudo -u postgres psql
\password postgres
```

#### 3. "database does not exist"
```bash
# Create database manually
createdb -U postgres MedicalApp
```

#### 4. "connection refused"
- Make sure PostgreSQL service is running
- Check if port 5432 is open
- Verify host and port in .env file

#### 5. Windows Service Issues
```bash
# Start PostgreSQL service
net start postgresql-x64-15

# or through Services.msc
# Find "PostgreSQL" service and start it
```

## 🎯 Production Setup

For production deployment:

### 1. Use Environment Variables
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

### 2. Enable SSL
```env
DB_SSL=true
```

### 3. Connection Pooling
```env
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
```

## 🔒 Security Best Practices

1. **Change Default Passwords**: Never use default passwords in production
2. **Use SSL**: Always enable SSL in production
3. **Limit Connections**: Set appropriate pool limits
4. **Regular Backups**: Schedule automated backups
5. **Monitor Logs**: Set up log monitoring

## 📱 Database Tools (Optional)

### GUI Tools
- **pgAdmin** (Free) - Web-based PostgreSQL admin
- **DBeaver** (Free) - Universal database tool
- **DataGrip** (Paid) - JetBrains database IDE

### Command Line Tools
- **psql** - Built-in PostgreSQL client
- **pg_dump** - Database backup utility
- **pg_restore** - Database restore utility

## ✅ Next Steps

After successful setup:

1. ✅ Database is running on `postgresql://localhost:5432/MedicalApp`
2. ✅ Backend API will be available on `http://localhost:5000`
3. ✅ Frontend will be available on `http://localhost:3000`
4. ✅ All tables are created and ready for use
5. ✅ Sample data is inserted for testing

Your TeleTabib application is now ready with PostgreSQL database! 🎉