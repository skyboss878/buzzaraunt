// ~/buzzaraunt/backend/routes/menuRoutes.js

const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');
const checkPlan = require('../middleware/plan');
const menuController = require('../controllers/menuController');

/**
 * All menu routes require a valid authenticated user.
 * Apply verifyToken middleware globally for this router.
 */
router.use(verifyToken);

/**
 * Add a new menu item.
 * Accessible for plans: basic, pro, enterprise.
 */
router.post(
  '/add',
  checkPlan(['basic', 'pro', 'enterprise']),
  menuController.addMenuItem
);

/**
 * Get menu items by restaurant ID.
 * Accessible for plans: basic, pro, enterprise.
 */
router.get(
  '/:restaurantId',
  checkPlan(['basic', 'pro', 'enterprise']),
  menuController.getMenuItems
);

/**
 * Delete a menu item by item ID.
 * Accessible for plans: pro, enterprise only.
 */
router.delete(
  '/:itemId',
  checkPlan(['pro', 'enterprise']),
  menuController.deleteMenuItem
);

/**
 * Generate a menu item using AI.
 * Accessible for plans: basic, pro, enterprise.
 */
router.post(
  '/generate',
  checkPlan(['basic', 'pro', 'enterprise']),
  menuController.generateMenuItem
);

module.exports = router;
