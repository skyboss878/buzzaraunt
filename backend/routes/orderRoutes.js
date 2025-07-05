// ~/buzzaraunt/backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkPlan = require('../middleware/plan');
const orderController = require('../controllers/orderController');

// Route for creating a new order (from checkout page)
// A customer might not be logged in, but the user_id on the order should refer to the restaurant owner (or be null for guest)
// Assuming orders are placed by customers, not necessarily logged-in users of the Buzzaraunt platform itself.
// However, to tie orders to a restaurant owner, the restaurantId passed in the payload is key.
router.post('/', orderController.createOrder); // No authMiddleware for customer checkout

// Route to get all orders for a logged-in restaurant owner
router.get('/', authMiddleware, checkPlan(["basic", "pro", "enterprise"]), orderController.getUserOrders);

// Route to get a specific order's status (for tracking page)
router.get('/status', orderController.getOrderStatus); // No authMiddleware for public tracking link

module.exports = router;
