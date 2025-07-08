require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuRoutes = require('./routes/menuRoutes');
const promoRoutes = require('./routes/promoRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');const storeRoutes = require('./routes/storeRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const routePolicy = require('./middleware/routePolicy');
const helmet = require('helmet');
app.use(helmet());
app.use(routePolicy); // <-- apply before your route declarations
const protectedRoutes = require('./routes/protected');
// CORS configuration
const corsOptions = {
  origin: [
    'https://buzzaraunt.netlify.app', // YOUR DEPLOYED NETLIFY FRONTEND URL IS HERE
'https://buzzaraunt.onrender.com', // ✅ Clean, correct origin
    'http://localhost:5173',            // For your local Vite dev server (frontend)
    'http://localhost:3000'             // For your local backend development
  ],
  credentials: true, // Set to true if you are handling cookies/sessions (e.g., for authentication)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
};

app.use(cors(corsOptions));

// Debug incoming requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} from origin: ${req.get("origin") || "no origin"}`);
  console.log("Headers:", req.headers);
  next();
});
app.use(express.json()); // Middleware to parse JSON request bodies

// Optional: Add request logging for debugging (Add this after app.use(express.json()))
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Your API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/protected', protectedRoutes);
// Add a root endpoint for basic health checks (Add this after your /api/test route)
app.get('/', (req, res) => {
  res.json({
    message: 'Buzzaraunt API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// This is your test endpoint to verify backend connectivity
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully!', timestamp: new Date().toISOString() });
});

// Example: A route for handling orders (uncomment and implement when ready)
// app.post('/api/orders', (req, res) => {
//   console.log('Received new order:', req.body);
//   // In a real application, you would save this order to a database
//   // and perform validation.
//   res.status(201).json({
//     message: 'Order placed successfully!',
//     orderId: 'ORDER_ABC_123', // Example ID
//     receivedData: req.body
//   });
// });

// Example: A route for getting all promotions (uncomment and implement when ready)
// app.get('/api/promotions', (req, res) => {
//   // In a real application, you would fetch promotions from a database
//   const promotions = [
//     { id: 'p1', name: 'Summer Special', discount: '20%' },
//     { id: 'p2', name: 'Weekend Brunch', offer: 'Free Mimosa' }
//   ];

//   res.status(200).json(promotions);
// });


// --- Error Handling Middleware (Add this before app.listen()) ---

// Handle 404 routes (must be after all other routes)
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Generic error handling middleware (must be last middleware before app.listen)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({ message: 'Something went wrong!' }); // Send a generic error message to client
});

// --- End Error Handling Middleware ---


// Start server
const PORT = process.env.PORT || 3000; // Use port from environment variable (for Render) or 3000 locally
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS origins configured:', corsOptions.origin.join(', '));
});

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
