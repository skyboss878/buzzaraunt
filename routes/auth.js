const express = require('express');
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

// 🔐 JWT secret fallback
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// ✅ Register
router.post('/register', async (req, res) => {
  const { email, password, restaurantName, planType } = req.body;
  console.log('📥 Register attempt:', { email, restaurantName, planType });

  if (!email || !password || !restaurantName || !planType) {
    console.log('❌ Missing fields in register');
    return res.status(400).json({ success: false, message: 'Please provide all fields' });
  }

  try {
    const client = await pool.connect();

    const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      client.release();
      console.log('❌ User already exists:', email);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (email, password, restaurant_name, plan)
      VALUES ($1, $2, $3, $4) RETURNING id, email, restaurant_name, plan
    `;
    const result = await client.query(insertQuery, [email, hashedPassword, restaurantName, planType]);
    client.release();

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, plan: user.plan }, JWT_SECRET);

    console.log('✅ Registered user:', user);
    res.json({ success: true, token, user });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('📥 Login attempt:', { email });

  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    client.release();

    if (result.rows.length === 0) {
      console.log('❌ No user found with email:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('🔍 Found user in DB:', user);

    const match = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match result:', match);

    if (!match) {
      console.log('❌ Password did not match');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, plan: user.plan }, JWT_SECRET);
    console.log('✅ Login success for:', user.email);

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
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
