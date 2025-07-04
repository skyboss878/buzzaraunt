const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Dummy user for testing
const user = {
  email: 'test@test.com',
  password: 'test123',
  plan: 'enterprise'
};
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email !== user.email || password !== user.password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const token = jwt.sign({ email: user.email, plan: user.plan }, process.env.JWT_SECRET || 'secretkey');
  res.json({ success: true, token });
});
const bcrypt = require('bcryptjs');
const users = [];

router.post('/register', async (req, res) => {

  const { email, password, restaurantName, planType } = req.body;

  if (!email || !password || !restaurantName || !planType) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { email, password: hashedPassword, restaurantName, plan: planType };
  users.push(user);

  const token = jwt.sign({ email: user.email, plan: user.plan }, process.env.JWT_SECRET || 'secretkey');

  res.json({ success: true, token, user: { email, restaurantName, plan: planType } });
});

module.exports = router;
