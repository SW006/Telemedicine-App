// Test script to verify backend setup and database
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

async function testBackendSetup() {
  console.log('🧪 Testing Backend Setup...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);

    // Test 2: Database connection
    console.log('\n2. Testing database connection...');
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'medical_booking',
      password: process.env.DB_PASSWORD || 'Medical@Booking123!',
      port: parseInt(process.env.DB_PORT) || 5432,
    });

    const dbResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected at:', dbResult.rows[0].current_time);

    // Test 3: Check if tables exist
    console.log('\n3. Checking database tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    console.log('📊 Found tables:', tableNames);

    const requiredTables = ['users', 'doctors', 'appointments', 'availability', 'feedback', 'queue'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables);
      console.log('💡 Run: cd backend && node src/db/setup.js');
    } else {
      console.log('✅ All required tables exist');
    }

    // Test 4: Test API endpoints
    console.log('\n4. Testing API endpoints...');
    
    // Test doctors endpoint
    try {
      const doctorsResponse = await axios.get(`${API_BASE_URL}/doctors`);
      console.log('✅ Doctors endpoint working:', doctorsResponse.data.data?.length || 0, 'doctors found');
    } catch (error) {
      console.log('❌ Doctors endpoint failed:', error.response?.data?.error || error.message);
    }

    // Test specializations endpoint
    try {
      const specializationsResponse = await axios.get(`${API_BASE_URL}/doctors/specializations`);
      console.log('✅ Specializations endpoint working:', specializationsResponse.data.data?.length || 0, 'specializations found');
    } catch (error) {
      console.log('❌ Specializations endpoint failed:', error.response?.data?.error || error.message);
    }

    // Test cities endpoint
    try {
      const citiesResponse = await axios.get(`${API_BASE_URL}/doctors/cities`);
      console.log('✅ Cities endpoint working:', citiesResponse.data.data?.length || 0, 'cities found');
    } catch (error) {
      console.log('❌ Cities endpoint failed:', error.response?.data?.error || error.message);
    }

    await pool.end();

    console.log('\n🎉 Backend setup test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If tables are missing, run: cd backend && node src/db/setup.js');
    console.log('2. Start the backend: cd backend && npm start');
    console.log('3. Start the frontend: cd front-end && npm run dev');
    console.log('4. Test the complete flow: signup → login → book appointment');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm start');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Check your database connection settings in .env file');
    }
  }
}

// Run the test
testBackendSetup();
