// ~/buzzaraunt/backend/controllers/storeController.js
const pool = require('../db');

exports.updateStoreSettings = async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  const { restaurantId, name, address, openTime, closeTime, phone, delivery } = req.body;

  if (!restaurantId || !name || !address || !openTime || !closeTime || !phone || delivery === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required store settings fields.' });
  }

  try {
    const client = await pool.connect();
    // Update existing restaurant's store settings
    const updateQuery = `
      UPDATE restaurants
      SET
        name = $1,
        address = $2,
        open_time = $3,
        close_time = $4,
        phone = $5,
        delivery_enabled = $6
      WHERE id = $7 AND user_id = $8
      RETURNING *;
    `;
    const result = await client.query(updateQuery, [
      name,
      address,
      openTime,
      closeTime,
      phone,
      delivery === 'yes', // Convert 'yes'/'no' to boolean
      restaurantId,
      userId
    ]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or not owned by user.' });
    }

    res.json({ success: true, message: 'Store settings updated successfully!', updatedRestaurant: result.rows[0] });
  } catch (err) {
        console.error("❌ Error:", err);
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Server error.", error: err.message, error: err.message, error: err.message });
    res.status(500).json({ success: false, message: 'Server error updating store settings.', error: err.message, error: err.message });
  }
};

exports.getStoreSettings = async (req, res) => {
  const userId = req.user.id;
  const restaurantId = req.query.restaurantId; // Assuming restaurantId is passed as query param

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: 'Restaurant ID is required to fetch store settings.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT name, address, open_time, close_time, phone, delivery_enabled FROM restaurants WHERE id = $1 AND user_id = $2', [restaurantId, userId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store settings not found or not authorized.' });
    }

    res.json({ success: true, settings: result.rows[0] });
  } catch (err) {
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Server error.", error: err.message, error: err.message, error: err.message });
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: 'Server error fetching store settings.', error: err.message, error: err.message });
  }
};
