const { Pool } = require('pg');
const { getConfig } = require('../config/database');
require('dotenv').config();

// Use the centralized database configuration
const poolConfig = getConfig();

const pool = new Pool(poolConfig);

// Connection test with retries
async function testConnection(retries = 3) {
  while (retries > 0) {
    try {
      const res = await pool.query('SELECT NOW()');
      console.log('✅ Database connected at:', res.rows[0].now);
      return true;
    } catch (err) {
      retries--;
      console.error(`Connection failed, ${retries} retries left...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (retries === 0) throw err;
    }
  }
}

// Event listeners
pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
  // Optionally: send alert to monitoring system
});

pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('remove', () => {
  console.log('Database connection closed');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});

// Test connection on startup
testConnection()
  .catch(err => {
    console.error('❌ Failed to connect to database after retries:', err);
    process.exit(1);
  });

module.exports = { pool, testConnection };