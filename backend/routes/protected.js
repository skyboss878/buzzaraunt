// ~/buzzaraunt/backend/routes/protected.js
const express = require('express');
const checkPlan = require('../middleware/plan'); // Assuming this middleware might be used here eventually
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // CORRECTED: Use the consolidated authMiddleware

router.get('/secure-data', authMiddleware, (req, res) => { // CORRECTED: Use authMiddleware
  res.json({ success: true, message: `Welcome ${req.user.email}, here's your protected data!` });
});

// You might add other protected routes here later
// router.post('/some-other-protected-action', authMiddleware, checkPlan(['pro']), (req, res) => { ... });

module.exports = router;
