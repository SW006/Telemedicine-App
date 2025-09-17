const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration
const createDbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'Medical@Booking123!',
  port: parseInt(process.env.DB_PORT) || 5432,
};

const dbConfig = {
  ...createDbConfig,
  database: process.env.DB_NAME || 'MedicalApp'
};

/**
 * Create database if it doesn't exist
 */
async function createDatabase() {
  const pool = new Pool(createDbConfig);
  
  try {
    console.log('🔍 Checking if database exists...');
    
    // Check if database exists
    const result = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbConfig.database]
    );
    
    if (result.rows.length === 0) {
      console.log('📦 Creating database...');
      await pool.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log(`✅ Database "${dbConfig.database}" created successfully!`);
    } else {
      console.log(`✅ Database "${dbConfig.database}" already exists.`);
    }
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Setup database tables and schema
 */
async function setupTables() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🏗️ Setting up database tables...');
    console.log('📊 Creating 30+ tables for complete healthcare platform...');
    
    await pool.query('BEGIN');
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        phone VARCHAR(20),
        verified BOOLEAN DEFAULT false,
        otp VARCHAR(6),
        otp_expiry TIMESTAMP,
        otp_resend_attempts INT DEFAULT 0,
        last_otp_resend TIMESTAMP,
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Doctors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        specialty VARCHAR(100) NOT NULL,
        experience INTEGER NOT NULL,
        license_number VARCHAR(100) UNIQUE NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        consultation_fee DECIMAL(10,2) NOT NULL,
        languages TEXT[] DEFAULT '{"English"}',
        rating DECIMAL(3,2) DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Doctor Availability
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_availability (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(doctor_id, day_of_week)
      );
    `);

    // Appointments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled' 
          CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
        consultation_type VARCHAR(20) DEFAULT 'video' 
          CHECK (consultation_type IN ('video', 'voice', 'chat')),
        notes TEXT,
        queue_position INT,
        estimated_wait_time INTERVAL,
        check_in_time TIMESTAMP,
        called_time TIMESTAMP,
        completed_time TIMESTAMP,
        notification_sent BOOLEAN DEFAULT false,
        notification_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(doctor_id, appointment_date, start_time)
      );
    `);

    // Doctor Reviews
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_reviews (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(patient_id, doctor_id)
      );
    `);

    // Notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        related_entity_type VARCHAR(50),
        related_entity_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Feedback Categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Feedback
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id),
        patient_id INTEGER REFERENCES users(id),
        doctor_id INTEGER REFERENCES users(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        category_id INTEGER REFERENCES feedback_categories(id),
        is_anonymous BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Doctor Ratings Summary
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_ratings (
        doctor_id INTEGER PRIMARY KEY REFERENCES users(id),
        average_rating DECIMAL(3,2) DEFAULT 0,
        total_ratings INTEGER DEFAULT 0,
        rating_1 INTEGER DEFAULT 0,
        rating_2 INTEGER DEFAULT 0,
        rating_3 INTEGER DEFAULT 0,
        rating_4 INTEGER DEFAULT 0,
        rating_5 INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Error Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_errors (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id),
        user_id INTEGER REFERENCES users(id),
        error_type VARCHAR(50) NOT NULL,
        error_message TEXT,
        context JSONB,
        retry_count INTEGER DEFAULT 0,
        last_attempt TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(appointment_id, error_type)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_errors (
        id SERIAL PRIMARY KEY,
        job_name VARCHAR(100) NOT NULL,
        error_message TEXT,
        stack_trace TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Load and execute the extended schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'database-schema-extended.sql');
    
    if (fs.existsSync(schemaPath)) {
      console.log('📋 Loading extended database schema...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('✅ Extended schema applied successfully!');
    } else {
      console.log('⚠️  Extended schema file not found, using basic schema only');
    }

    await pool.query('COMMIT');
    console.log('✅ All database tables created successfully!');
    console.log('📊 Healthcare platform ready with 30+ tables!');
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error setting up tables:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Insert sample data for testing
 */
async function insertSampleData() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('📝 Inserting sample data...');
    
    // Insert feedback categories
    await pool.query(`
      INSERT INTO feedback_categories (name, description) VALUES
      ('Service Quality', 'Feedback about overall service quality'),
      ('Doctor Behavior', 'Feedback about doctor professional behavior'),
      ('Technical Issues', 'Feedback about app/platform technical problems'),
      ('Appointment Scheduling', 'Feedback about booking and scheduling process')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Sample data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔌 Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connection successful!');
    console.log(`📅 Current Time: ${result.rows[0].current_time}`);
    console.log(`🐘 PostgreSQL Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Main setup function
 */
async function setupPostgreSQL() {
  try {
    console.log('🚀 Starting PostgreSQL setup for TeleTabib...\n');
    
    await createDatabase();
    await setupTables();
    await insertSampleData();
    await testConnection();
    
    console.log('\n🎉 PostgreSQL setup completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Copy .env.example to .env and update your credentials');
    console.log('2. Run: npm run dev to start the application');
    console.log('3. Your database is ready at: postgresql://localhost:5432/MedicalApp');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is installed and running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Ensure the postgres user has database creation privileges');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupPostgreSQL();
}

module.exports = {
  setupPostgreSQL,
  createDatabase,
  setupTables,
  insertSampleData,
  testConnection
};