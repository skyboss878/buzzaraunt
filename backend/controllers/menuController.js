const { OpenAI } = require('openai');
require('dotenv').config();
const pool = require('../db');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.addMenuItem = async (req, res) => {
  const userId = req.user.id;
  const { restaurantId, item, price, description } = req.body;

  if (!restaurantId || !item || !price) {
    return res.status(400).json({ success: false, message: 'Missing required menu item details' });
  }

  try {
    const client = await pool.connect();

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
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Server error adding menu item.", error: err.message });
  }
};

exports.generateMenuItem = async (req, res) => {
  const { baseText, restaurantId, price } = req.body;
  const userId = req.user.id;

  if (!baseText || !restaurantId || !price) {
    return res.status(400).json({ success: false, message: 'Missing required fields: baseText, restaurantId or price' });
  }

  try {
    const client = await pool.connect();

    const restaurantCheck = await client.query('SELECT user_id FROM restaurants WHERE id = $1', [restaurantId]);
    if (restaurantCheck.rows.length === 0 || restaurantCheck.rows[0].user_id !== userId) {
      client.release();
      return res.status(403).json({ success: false, message: 'Not authorized to add menu item to this restaurant.' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative chef generating unique menu items." },
        { role: "user", content: `Create a creative menu item name and description based on this: "${baseText}"` }
      ],
      max_tokens: 150,
    });

    const generatedText = response.choices[0].message.content;
    let itemName = baseText;
    let description = generatedText;

    const colonIndex = generatedText.indexOf(':');
    if (colonIndex > 0) {
      itemName = generatedText.slice(0, colonIndex).trim();
      description = generatedText.slice(colonIndex + 1).trim();
    }

    const insertQuery = `
      INSERT INTO menu_items (restaurant_id, item_name, price, description)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const result = await client.query(insertQuery, [restaurantId, itemName, price, description]);
    client.release();

    res.status(201).json({ success: true, message: 'Menu item generated and added successfully!', item: result.rows[0] });
  } catch (err) {
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: 'Failed to generate menu item.', error: err.message });
  }
};

exports.getMenuItems = async (req, res) => {
  const restaurantId = req.params.restaurantId;

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: 'Restaurant ID is required.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY item_name', [restaurantId]);
    client.release();

    res.json({ success: true, items: result.rows });
  } catch (err) {
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: 'Server error fetching menu items.', error: err.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const itemId = req.params.itemId;
  const userId = req.user.id;

  try {
    const client = await pool.connect();

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
        console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Server error deleting menu item.", error: err.message });
  }
};
