// ~/buzzaraunt/backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization'); // Use .header() for consistency
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing or malformed' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret'); // Use a stronger default secret
    req.user = decoded; // Attach decoded user payload to request
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message); // Log actual error for debugging
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};
