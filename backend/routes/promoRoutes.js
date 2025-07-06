// ~/buzzaraunt/backend/routes/promoRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkPlan = require('../middleware/plan');
const promoController = require('../controllers/promoController');

// All promo generation and management requires authentication
router.use(authMiddleware); // Apply authentication middleware to all routes in this router

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
