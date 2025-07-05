require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const promoRoutes = require('./routes/promos');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS setup for Netlify frontend
app.use(cors({
  origin: 'https://buzzaraunt.netlify.app',
  credentials: true
}));

// ✅ Middleware
app.use(bodyParser.json());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/protected', protectedRoutes);

// ✅ Health check
app.get('/', (req, res) => {
  res.send('Buzzaraunt backend is running ✅');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
