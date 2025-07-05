// ~/buzzaraunt/backend/controllers/restaurantController.js
const pool = require('../db');

exports.createRestaurant = async (req, res) => {
  // Ensure req.user.id is available from authMiddleware
  const userId = req.user.id;
  const { name, description, hours, website } = req.body;
  // For logo, you'd handle file uploads (e.g., multer + S3/Cloudinary)
  // For now, assume logo is handled client-side or sent as a URL if needed

  if (!name || !description || !hours || !userId) {
    return res.status(400).json({ success: false, message: 'Missing required restaurant fields' });
  }

  try {
    const client = await pool.connect();
    // Check if user already has a restaurant (optional, depending on your business logic)
    const existingRestaurant = await client.query('SELECT id FROM restaurants WHERE user_id = $1', [userId]);
    if (existingRestaurant.rows.length > 0) {
      client.release();
      return res.status(409).json({ success: false, message: 'User already has a restaurant profile.' });
    }

    const insertQuery = `
      INSERT INTO restaurants (user_id, name, description, hours, website)
      VALUES ($1, $2, $3, $4, $5) RETURNING id, name
    `;
    const result = await client.query(insertQuery, [userId, name, description, hours, website]);
    client.release();

    const restaurant = result.rows[0];
    res.status(201).json({ success: true, message: 'Restaurant created successfully!', restaurantId: restaurant.id, restaurantName: restaurant.name });
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res.status(500).json({ success: false, message: 'Server error creating restaurant.' });
  }
};

exports.getRestaurant = async (req, res) => {
  const userId = req.user.id;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM restaurants WHERE user_id = $1', [userId]);
    client.release();
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found for this user.' });
    }
    res.json({ success: true, restaurant: result.rows[0] });
  } catch (err) {
    console.error('Error fetching restaurant:', err);
    res.status(500).json({ success: false, message: 'Server error fetching restaurant.' });
  }
};

exports.updateRestaurant = async (req, res) => {
  const userId = req.user.id;
  const { restaurantId, name, description, hours, website } = req.body;
  // Handle logo update separately if it's a file upload
  if (!restaurantId || !name || !description || !hours) {
    return res.status(400).json({ success: false, message: 'Missing required update fields.' });
  }

  try {
    const client = await pool.connect();
    const updateQuery = `
      UPDATE restaurants
      SET name = $1, description = $2, hours = $3, website = $4
      WHERE id = $5 AND user_id = $6 RETURNING *
    `;
    const result = await client.query(updateQuery, [name, description, hours, website, restaurantId, userId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or not owned by user.' });
    }
    res.json({ success: true, message: 'Restaurant updated successfully!', restaurant: result.rows[0] });
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({ success: false, message: 'Server error updating restaurant.' });
  }
};
