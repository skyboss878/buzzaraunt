// ~/buzzaraunt/backend/routes/storeRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkPlan = require('../middleware/plan');
const storeController = require('../controllers/storeController');

// All store settings routes require authentication
router.use(verifyToken);

// Update store settings
router.post('/update', checkPlan(['pro', 'enterprise']), storeController.updateStoreSettings);

// Get store settings (for pre-filling form, etc.)
router.get('/', checkPlan(['pro', 'enterprise']), storeController.getStoreSettings);


module.exports = router;
