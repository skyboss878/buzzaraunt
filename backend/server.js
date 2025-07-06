// ~/buzzaraunt/backend/server.js
require('dotenv').config(); // CRITICAL: Load environment variables
const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser'); // No longer needed with express.json()

// 🔗 Import all necessary routes
const authRoutes = require('./routes/authRoutes');           // Corrected name
const restaurantRoutes = require('./routes/restaurantRoutes'); // NEW
const menuRoutes = require('./routes/menuRoutes');           // NEW
const promoRoutes = require('./routes/promoRoutes');         // Corrected name
const storeRoutes = require('./routes/storeRoutes');         // NEW
const deliveryRoutes = require('./routes/deliveryRoutes');   // NEW
const paymentRoutes = require('./routes/paymentRoutes');     // NEW
const orderRoutes = require('./routes/orderRoutes');         // NEW
const protectedRoutes = require('./routes/protected');       // Keep if you use this explicitly, otherwise can remove

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS: Explicit configuration with multiple origins
app.use(cors({
  origin: [
    'http://localhost:37517',  // Common dev port for some frameworks
    'http://localhost:3000',   // Common dev port for React/Vite
    'http://127.0.0.1:3000',   // Another common localhost variant
    'https://buzzaraunt.netlify.app' // Your deployed frontend URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Ensure all methods are allowed
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // Allow Authorization header for tokens
}));

// ✅ Handle preflight requests explicitly (needed for complex CORS scenarios)
app.options('*', cors());

// ✅ Middleware
app.use(express.json({ limit: '10mb' })); // Correct: Use express.json() for body parsing
// app.use(bodyParser.json({ limit: '10mb' })); // REMOVE: Redundant if using express.json()

// ✅ Routes - Mount all your route handlers
app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/protected', protectedRoutes); // Keep if you explicitly use it, otherwise remove this line too


// ✅ Health check
app.get('/', (req, res) => {
  res.json({ // Send JSON response for better API practice
    message: 'Buzzaraunt backend is running and all routes configured ✅',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Global error handler - CRITICAL for debugging and graceful responses
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.stack); // Log the full stack trace for debugging
  res.status(500).json({
    error: 'Something went wrong on the server!',
    message: err.message, // Provide error message to client (useful in dev, consider less in prod)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Only send stack in dev
  });
});

// ✅ 404 handler - For any routes not matched by the above
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Buzzaraunt backend running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ✅ Graceful shutdown - Best practice for clean server exits
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
