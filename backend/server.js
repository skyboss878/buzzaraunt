const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://buzzaraunt.netlify.app', // YOUR DEPLOYED NETLIFY FRONTEND URL IS HERE
    // 'https://your-custom-domain.com', // Uncomment and add if you have a custom domain for your frontend
    'http://localhost:5173',            // For your local Vite dev server (frontend)
    'http://localhost:3000'             // For your local backend development
  ],
  credentials: true, // Set to true if you are handling cookies/sessions (e.g., for authentication)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware to parse JSON request bodies

// Optional: Add request logging for debugging (Add this after app.use(express.json()))
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Your API routes

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

