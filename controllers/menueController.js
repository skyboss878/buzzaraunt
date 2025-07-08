// ~/buzzaraunt/backend/controllers/menuController.js
const pool = require('../db');

exports.addMenuItem = async (req, res) => {
  const userId = req.user.id; // User who owns the restaurant
  const { restaurantId, item, price, description } = req.body;

  if (!restaurantId || !item || !price) {
    return res.status(400).json({ success: false, message: 'Missing required menu item details' });
  }

  try {
    const client = await pool.connect();
    // Optional: Verify that restaurantId belongs to userId if you want strict ownership check for every menu item add
    const restaurantCheck = await client.query('SELECT user_id FROM restaurants WHERE id = $1', [restaurantId]);
    if (restaurantCheck.rows.length === 0 || restaurantCheck.rows[0].user_id !== userId) {
      client.release();
      return res.status(403).json({ success: false, message: 'Not authorized to add menu item to this restaurant.' });
    }

    const insertQuery = `
      INSERT INTO menu_items (restaurant_id, item_name, price, description)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const result = await client.query(insertQuery, [restaurantId, item, price, description]);
    client.release();

    res.status(201).json({ success: true, message: 'Menu item added successfully!', item: result.rows[0] });
  } catch (err) {
    console.error('Error adding menu item:', err);
    res.status(500).json({ success: false, message: 'Server error adding menu item.' });
  }
};

exports.getMenuItems = async (req, res) => {
  const restaurantId = req.params.restaurantId; // Assuming restaurantId is in URL params
  // Or if getting all for user's restaurant: const userId = req.user.id;

  if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY item_name', [restaurantId]);
    client.release();
    res.json({ success: true, items: result.rows });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ success: false, message: 'Server error fetching menu items.' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const itemId = req.params.itemId;
  const userId = req.user.id; // Ensure user owns the item's restaurant

  try {
    const client = await pool.connect();
    // Verify item ownership via restaurant_id and user_id
    const deleteQuery = `
      DELETE FROM menu_items mi
      USING restaurants r
      WHERE mi.id = $1 AND mi.restaurant_id = r.id AND r.user_id = $2
      RETURNING mi.id
    `;
    const result = await client.query(deleteQuery, [itemId, userId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found or not authorized to delete.' });
    }
    res.json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ success: false, message: 'Server error deleting menu item.' });
  }
};
