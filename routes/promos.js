// ~/buzzaraunt/backend/routes/promos.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // CORRECT: Use the consolidated verifyToken
const checkPlan = require('../middleware/plan');
const promoController = require('../controllers/promoController');

// Apply authentication middleware to all routes in this router
router.use(verifyToken); // All promo routes will now require a valid token

// POST to generate and save a new promo
// Frontend calls /api/promos/generate
router.post('/generate', checkPlan(['pro', 'enterprise']), promoController.generatePromo);

// GET all promos for the authenticated user
// Frontend calls /api/promos
router.get('/', checkPlan(['basic', 'pro', 'enterprise']), promoController.getPromos);

// DELETE a specific promo by ID
// Frontend calls /api/promos/:id
router.delete('/:id', checkPlan(['pro', 'enterprise']), promoController.deletePromo);

module.exports = router;
