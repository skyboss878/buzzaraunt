// ~/buzzaraunt/backend/routes/storeRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkPlan = require('../middleware/plan');
const storeController = require('../controllers/storeController');

// All store settings routes require authentication
router.use(authMiddleware);

// Update store settings
router.post('/update', checkPlan(['pro', 'enterprise']), storeController.updateStoreSettings);

// Get store settings (for pre-filling form, etc.)
router.get('/', checkPlan(['pro', 'enterprise']), storeController.getStoreSettings);


module.exports = router;
