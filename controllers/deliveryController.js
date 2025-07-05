// ~/buzzaraunt/backend/controllers/deliveryController.js
const pool = require('../db');

exports.updateDeliverySettings = async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  const { restaurantId, radius, fee, timeEstimate, enabled } = req.body;

  if (!restaurantId || !radius || !fee || !timeEstimate || enabled === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required delivery settings fields.' });
  }

  try {
    const client = await pool.connect();
    // Assuming delivery settings are part of the 'restaurants' table or a separate 'delivery_settings' table
    // For simplicity, let's assume they are columns in the 'restaurants' table
    const updateQuery = `
      UPDATE restaurants
      SET
        delivery_radius = $1,
        delivery_fee = $2,
        delivery_time_estimate = $3,
        delivery_enabled = $4
      WHERE id = $5 AND user_id = $6
      RETURNING *;
    `;
    const result = await client.query(updateQuery, [
      radius,
      fee,
      timeEstimate,
      enabled === 'yes', // Convert 'yes'/'no' to boolean
      restaurantId,
      userId
    ]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or not owned by user.' });
    }

    res.json({ success: true, message: 'Delivery settings updated successfully!', updatedRestaurant: result.rows[0] });
  } catch (err) {
    console.error('Error updating delivery settings:', err);
    res.status(500).json({ success: false, message: 'Server error updating delivery settings.' });
  }
};

exports.getDeliverySettings = async (req, res) => {
  const userId = req.user.id;
  const restaurantId = req.query.restaurantId;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: 'Restaurant ID is required to fetch delivery settings.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT delivery_radius, delivery_fee, delivery_time_estimate, delivery_enabled FROM restaurants WHERE id = $1 AND user_id = $2', [restaurantId, userId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Delivery settings not found or not authorized.' });
    }

    res.json({ success: true, settings: result.rows[0] });
  } catch (err) {
    console.error('Error fetching delivery settings:', err);
    res.status(500).json({ success: false, message: 'Server error fetching delivery settings.' });
  }
};
