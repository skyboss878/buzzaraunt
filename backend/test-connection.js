require('dotenv').config();
const pool = require('./db');

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query result:', result.rows[0]);
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }
  process.exit(0);
}

testConnection();
