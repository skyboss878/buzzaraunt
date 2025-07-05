const express = require('express');
const checkPlan = require('../middleware/plan');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

router.get('/secure-data', verifyToken, (req, res) => {
  res.json({ success: true, message: `Welcome ${req.user.email}, here's your protected data!` });
});
module.exports = router;
