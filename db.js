// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: {
    rejectUnauthorized: false // Required for Render-hosted PostgreSQL
  }
=======
require('dotenv').config(); // ✅ Load environment variables

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // ✅ Required for most cloud PostgreSQL (e.g. Render, Heroku)
  },
});

module.exports = pool;
