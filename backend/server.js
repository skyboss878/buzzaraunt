// ~/buzzaraunt/backend/server.js
require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors'); // Ensure cors is imported only once

// 🔗 Import all necessary routes (ensure these match your file names)
const authRoutes = require('./routes/authRoutes');           // Matches authRoutes.js
const restaurantRoutes = require('./routes/restaurantRoutes'); // Matches restaurantRoutes.js
const menuRoutes = require('./routes/menuRoutes');           // Matches menuRoutes.js (ensure this file exists and is named correctly)
const promoRoutes = require('./routes/promoRoutes');         // Matches promoRoutes.js
const storeRoutes = require('./routes/storeRoutes');         // Matches storeRoutes.js
const deliveryRoutes = require('./routes/deliveryRoutes');   // Matches deliveryRoutes.js
const paymentRoutes = require('./routes/paymentRoutes');     // Matches paymentRoutes.js
const orderRoutes = require('./routes/orderRoutes');         // Matches orderRoutes.js
const protectedRoutes = require('./routes/protected');       // Matches protected.js (keep if you use this explicitly)

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS: Explicit and comprehensive configuration (THIS IS THE ONLY CORS BLOCK YOU NEED)
app.use(cors({
  origin: [
    'http://localhost:37517',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173', // THIS LINE MUST BE PRESENT FOR YOUR LOCAL FRONTEND
    'https://buzzaraunt.netlify.app', // Your Netlify frontend URL
    'https://buzzaraunt.onrender.com' // Your Render frontend URL (if applicable)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Handle preflight requests explicitly
app.options('*', cors());

// ✅ Middleware
app.use(express.json({ limit: '10mb' })); // Correct JSON body parsing, no bodyParser needed

// ✅ Routes - Mount all your route handlers
app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/protected', protectedRoutes); // Keep if you use it, otherwise remove this line


// ✅ Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Buzzaraunt backend is running and all routes configured ✅',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.stack);
  res.status(500).json({
    error: 'Something went wrong on the server!',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Buzzaraunt backend running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ✅ Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
