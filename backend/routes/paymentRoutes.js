// ~/buzzaraunt/backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // For user context if needed
const checkPlan = require('../middleware/plan');
const paymentController = require('../controllers/paymentController');

// These payment routes might be called from both logged-in users (for plan upgrade)
// and unauthenticated customers (for ordering food).
// Decide if `authMiddleware` is always needed here.
// For `create-paypal-order` and `create-stripe-checkout-session` for customer orders,
// authentication of the *customer* might not be required, but payment processing usually requires *some* form of ID.
// For simplicity, for these payment routes related to actual orders, I will NOT add authMiddleware here.
// But for `update-plan`, authentication IS required.

// Payment routes for food orders (might be unauthenticated if guest checkout is allowed)
router.post('/create-stripe-checkout-session', paymentController.createStripeCheckoutSession);
router.post('/create-paypal-order', paymentController.createPayPalOrder);

// Route for updating user's plan (requires authentication)
router.post('/update-user-plan', authMiddleware, paymentController.updateUserPlan);

module.exports = router;
