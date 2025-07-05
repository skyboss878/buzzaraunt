require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser'); // Typically not needed with express.json()

// 🔗 Import routes
const authRoutes = require('./routes/authRoutes'); // Updated name
const restaurantRoutes = require('./routes/restaurantRoutes'); // NEW
const menuRoutes = require('./routes/menuRoutes');         // NEW
const promoRoutes = require('./routes/promoRoutes');       // Updated name
const storeRoutes = require('./routes/storeRoutes');       // NEW
const deliveryRoutes = require('./routes/deliveryRoutes'); // NEW
const paymentRoutes = require('./routes/paymentRoutes');   // NEW
const orderRoutes = require('./routes/orderRoutes');       // NEW (from orders.js)
// const userRoutes = require('./routes/userRoutes'); // If you add more general user ops

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS: Explicit configuration
app.use(cors({
  origin: [
    'http://localhost:37517',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://buzzaraunt.netlify.app' // Ensure your deployed frontend URL is here
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Handle preflight requests explicitly
app.options('*', cors());

// ✅ Middleware
app.use(express.json({ limit: '10mb' })); // Handles JSON body parsing

// app.use(bodyParser.json({ limit: '10mb' })); // Redundant if using express.json()
// app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes); // Mount new restaurant routes
app.use('/api/menu', menuRoutes);             // Mount new menu routes
app.use('/api/promos', promoRoutes);          // Mount promo routes
app.use('/api/store', storeRoutes);           // Mount new store routes
app.use('/api/delivery', deliveryRoutes);     // Mount new delivery routes
app.use('/api/payments', paymentRoutes);      // Mount new payment routes
app.use('/api/orders', orderRoutes);          // Mount new order routes
// app.use('/api/user', userRoutes); // If you add general user routes

// You had a '/api/protected' route. You can keep it or integrate its functionality
// into other specific routes. For now, it's not being imported or used in this `server.js`.
// If you want to keep it:
// const protectedRoutes = require('./routes/protected');
// app.use('/api/protected', protectedRoutes);


// ✅ Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Buzzaraunt backend is running - All routes configured',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
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
