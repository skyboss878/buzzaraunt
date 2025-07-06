// ~/buzzaraunt/backend/routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkPlan = require('../middleware/plan');
const menuController = require('../controllers/menuController');

// All menu routes require authentication
router.use(authMiddleware);

// Add a new menu item
router.post('/add', checkPlan(['basic', 'pro', 'enterprise']), menuController.addMenuItem);

// Get menu items for a specific restaurant (can be public or protected, depending on use-case)
// For internal admin view (restauraunt.html, store.html)
router.get('/:restaurantId', checkPlan(['basic', 'pro', 'enterprise']), menuController.getMenuItems);

// Delete a menu item
router.delete('/:itemId', checkPlan(['pro', 'enterprise']), menuController.deleteMenuItem);

module.exports = router;
