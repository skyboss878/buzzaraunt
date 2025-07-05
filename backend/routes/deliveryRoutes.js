// ~/buzzaraunt/backend/routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkPlan = require('../middleware/plan');
const deliveryController = require('../controllers/deliveryController');

// All delivery settings routes require authentication
router.use(authMiddleware);

// Update delivery settings
router.post('/update', checkPlan(['enterprise']), deliveryController.updateDeliverySettings); // Delivery is Enterprise/Agency exclusive

// Get delivery settings
router.get('/', checkPlan(['enterprise']), deliveryController.getDeliverySettings);


module.exports = router;
