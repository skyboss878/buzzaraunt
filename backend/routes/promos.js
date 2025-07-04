const express = require('express');
const checkPlan = require('../middleware/plan');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

let promos = []; // In-memory store – replace with DB later

// POST /api/promos – save promo
router.post('/', checkPlan(['pro','enterprise']), verifyToken, (req, res) => {
  const { caption, imageSrc, voiceLink, music, time } = req.body;
  if (!caption || !imageSrc || !voiceLink || !time) {
    return res.status(400).json({ success: false, message: 'Missing promo data' });
  }

  const promo = {
    user: req.user.email,
    caption,
    imageSrc,
    voiceLink,
    music,
    time,
    id: Date.now()
  };

  promos.push(promo);
  res.json({ success: true, promo });
});

// GET /api/promos – get all promos for user
router.get('/', checkPlan(['pro','enterprise']), verifyToken, (req, res) => {
  const userPromos = promos.filter(p => p.user === req.user.email);
  res.json({ success: true, promos: userPromos });
});

module.exports = router;


