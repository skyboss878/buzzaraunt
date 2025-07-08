// backend/routes/protected.js
const express = require('express');
const router = express.Router();

// Example protected route, you can add your real handlers here
router.get('/', (req, res) => {
  res.json({ message: 'This is a protected route placeholder' });
});

module.exports = router;
