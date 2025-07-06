require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 🔗 Import routes
const promoRoutes = require('./routes/promos');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS: Explicit configuration
app.use(cors({
  origin: [
    'http://localhost:37517',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://buzzaraunt.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Handle preflight requests explicitly
app.options('*', cors());

// ✅ Middleware
app.use(express.json({ limit: '10mb' })); // Removed redundant bodyParser

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/protected', protectedRoutes);

// ✅ Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Buzzaraunt backend is running - Updated CORS',
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
