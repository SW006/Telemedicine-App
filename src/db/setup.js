const { Pool } = require('pg');
require('dotenv').config();

// Database setup script for TeleTabib
const setupDatabase = async () => {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'medical_booking',
    password: process.env.DB_PASSWORD || 'Medical@Booking123!',
    port: parseInt(process.env.DB_PORT) || 5432,
  });

  try {
    console.log('🔧 Setting up TeleTabib database...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20),
        phone VARCHAR(20),
        verified BOOLEAN DEFAULT FALSE,
        deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create doctors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        specialty VARCHAR(255) NOT NULL,
        experience INTEGER DEFAULT 0,
        license_number VARCHAR(255) UNIQUE NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        consultation_fee DECIMAL(10,2) DEFAULT 100.00,
        bio TEXT,
        location VARCHAR(255),
        city VARCHAR(255),
        languages TEXT[],
        certifications TEXT[],
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_reviews INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create appointments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        type VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create availability table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create feedback table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create queue table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS queue (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'waiting',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        called_at TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);

    // Create password reset tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_doctors_city ON doctors(city)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_feedback_doctor_id ON feedback(doctor_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_queue_doctor_id ON queue(doctor_id)');

    // Insert sample data
    await insertSampleData(pool);

    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created: users, doctors, appointments, availability, feedback, queue, password_reset_tokens');
    console.log('🔍 Indexes created for optimal performance');
    console.log('📝 Sample data inserted');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

const insertSampleData = async (pool) => {
  try {
    // Insert sample doctors
    const sampleDoctors = [
      {
        email: 'dr.fatima@teletabib.com',
        password_hash: '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV',
        name: 'Dr. Fatima Malik',
        phone: '+92-333-987-6543',
        specialty: 'Cardiology',
        experience: 15,
        license_number: 'PMDC-12345',
        city: 'Lahore',
        location: 'Medical Center Downtown'
      },
      {
        email: 'dr.imran@teletabib.com',
        password_hash: '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV',
        name: 'Dr. Imran Siddiqui',
        phone: '+92-300-123-4567',
        specialty: 'Dermatology',
        experience: 10,
        license_number: 'PMDC-67890',
        city: 'Karachi',
        location: 'Skin Care Clinic'
      },
      {
        email: 'dr.ayesha@teletabib.com',
        password_hash: '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV',
        name: 'Dr. Ayesha Rahman',
        phone: '+92-301-234-5678',
        specialty: 'Orthopedics',
        experience: 12,
        license_number: 'PMDC-11111',
        city: 'Islamabad',
        location: 'Orthopedic Institute'
      }
    ];

    for (const doctor of sampleDoctors) {
      // Insert user
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, name, contact_number, phone, verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [doctor.email, doctor.password_hash, doctor.name, doctor.phone, doctor.phone, true]
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        // Insert doctor profile
        await pool.query(
          `INSERT INTO doctors (user_id, specialty, experience, license_number, verified, consultation_fee, city, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (license_number) DO NOTHING`,
          [userId, doctor.specialty, doctor.experience, doctor.license_number, true, 100.00, doctor.city, doctor.location]
        );
      }
    }

    // Insert sample availability
    const doctors = await pool.query('SELECT id FROM doctors');
    for (const doctor of doctors.rows) {
      // Monday to Friday, 9 AM to 5 PM
      for (let day = 1; day <= 5; day++) {
        await pool.query(
          `INSERT INTO availability (doctor_id, day_of_week, start_time, end_time)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [doctor.id, day, '09:00:00', '17:00:00']
        );
      }
    }

    console.log('📝 Sample data inserted successfully');

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Database setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };