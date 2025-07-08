// ~/buzzaraunt/backend/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_this_in_production';

exports.register = async (req, res) => {
  const { email, password, restaurantName, planType } = req.body;
  console.log('📥 Register attempt:', { email, restaurantName, planType });

  if (!email || !password || !restaurantName || !planType) {
    console.log('❌ Missing fields in register');
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    const client = await pool.connect();
    
    // Check if user already exists
    const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      client.release();
      console.log('❌ User already exists:', email);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = `
      INSERT INTO users (email, password_hash, restaurant_name, plan_type)
      VALUES ($1, $2, $3, $4) RETURNING id, email, restaurant_name, plan_type
    `;
    const result = await client.query(insertQuery, [email, hashedPassword, restaurantName, planType]);
    client.release();

    const user = result.rows[0];
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      plan_type: user.plan_type 
    }, JWT_SECRET, { expiresIn: '24h' });

    console.log('✅ Registered user:', user.email);
    res.json({
      success: true,
      token,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        restaurantName: user.restaurant_name,
        planType: user.plan_type
      }
    });
  } catch (err) {
        console.error("❌ Error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration', 
      error: err.message 
    });
  }
};

exports.login = async (req, res) => {
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
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      console.log('❌ Password did not match for user:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      plan_type: user.plan_type 
    }, JWT_SECRET, { expiresIn: '24h' });

    console.log('✅ Login success for:', user.email);
    res.json({
      success: true,
      token,
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        restaurantName: user.restaurant_name,
        planType: user.plan_type
      }
    });
  } catch (err) {
        console.error("❌ Error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login', 
      error: err.message 
    });
  }
};
