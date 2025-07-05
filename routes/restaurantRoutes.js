// ~/buzzaraunt/backend/routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Import the consolidated middleware
const checkPlan = require('../middleware/plan'); // Import plan middleware
const restaurantController = require('../controllers/restaurantController');

// All restaurant routes require authentication
router.use(authMiddleware);

// Create a new restaurant (first step after registration)
// Basic plan users should be able to create their restaurant
router.post('/create', checkPlan(['basic', 'pro', 'enterprise']), restaurantController.createRestaurant);

// Get user's restaurant profile
router.get('/', checkPlan(['basic', 'pro', 'enterprise']), restaurantController.getRestaurant);

// Update restaurant details (used by store.html)
router.put('/:restaurantId', checkPlan(['pro', 'enterprise']), restaurantController.updateRestaurant);


module.exports = router;
