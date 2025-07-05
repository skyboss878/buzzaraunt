const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

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
app.use(bodyParser.json());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/protected', protectedRoutes);

// ✅ Health check
app.get('/', (req, res) => {
  res.send('Buzzaraunt backend is running - Updated CORS');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Buzzaraunt backend running at http://localhost:${PORT}`);
});
