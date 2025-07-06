const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'https://buzzaraunt.onrender.com', // Your DEPLOYED BACKEND URL
  changeOrigin: true, // Needed for virtual hosted sites
  pathRewrite: {
    '^/api': '', // Rewrite /api requests to target's root
  },
}));

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});
