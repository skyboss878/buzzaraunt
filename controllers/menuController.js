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
const { OpenAI } = require('openai');
require('dotenv').config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateMenuItem = async (req, res) => {
  try {
    const { baseText, restaurantId, price } = req.body;
    const userId = req.user.id;

    if (!baseText || !restaurantId || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields: baseText, restaurantId or price' });
    }

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

  } catch (error) {
    console.error('Error generating menu item:', error);
    res.status(500).json({ success: false, message: 'Failed to generate menu item' });
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
// ~/buzzaraunt/backend/controllers/menuController.js


exports.generateMenuItem = async (req, res) => {
  const { baseText } = req.body;
  const userId = req.user?.id;

  if (!baseText) {
    return res.status(400).json({ success: false, message: 'Base text is required (e.g., description or ingredients).' });
  }

  try {
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates restaurant menu items.',
        },
        {
          role: 'user',
          content: `Create a creative menu item based on this: "${baseText}". Respond in JSON format with: name, description, price (USD), and type (breakfast, lunch, dinner, drink, dessert).`,
        },
      ],
    });

    const raw = aiResponse.choices[0]?.message?.content || '';
    const jsonStart = raw.indexOf('{');
    const jsonString = raw.slice(jsonStart).trim();

    const item = JSON.parse(jsonString);

    res.status(200).json({
      success: true,
      generated: item,
    });
  } catch (err) {
    console.error('AI Menu Generation Error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate menu item.' });
  }
};
