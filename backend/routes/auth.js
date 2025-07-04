const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

// 🔐 JWT secret fallback
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// ✅ Register
router.post('/register', async (req, res) => {
  const { email, password, restaurantName, planType } = req.body;

  if (!email || !password || !restaurantName || !planType) {
    return res.status(400).json({ success: false, message: 'Please provide all fields' });
  }

  try {
    const client = await pool.connect();

    // Check if user already exists
    const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      client.release();
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const insertQuery = `
      INSERT INTO users (email, password, restaurant_name, plan)
      VALUES ($1, $2, $3, $4) RETURNING id, email, restaurant_name, plan
    `;
    const result = await client.query(insertQuery, [email, hashedPassword, restaurantName, planType]);
    client.release();

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, plan: user.plan }, JWT_SECRET);

    res.json({ success: true, token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, plan: user.plan }, JWT_SECRET);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        restaurantName: user.restaurant_name,
        plan: user.plan
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
