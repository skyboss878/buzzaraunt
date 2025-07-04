require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const promoRoutes = require('./routes/promos');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

const app = express();
const cors = require("cors");
app.use(cors({ origin: "https://buzzaraunt.netlify.app", credentials: true }));
const cors = require("cors");
app.use(cors({ origin: "https://buzzaraunt.netlify.app", credentials: true }));
const PORT = process.env.PORT || 4000;

// ✅ Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// ✅ Route setup (only once each)
app.use('/api/auth', authRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/protected', protectedRoutes);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('Buzzaraunt backend is running');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Buzzaraunt backend running at http://localhost:${PORT}`);
});
