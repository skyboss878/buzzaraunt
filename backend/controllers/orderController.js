// ~/buzzaraunt/backend/controllers/orderController.js
const pool = require('../db');

exports.createOrder = async (req, res) => {
  const userId = req.user.id; // User who placed the order
  const { restaurantId, cart, total, customerName, customerPhone, customerEmail, deliveryMethod, deliveryAddress } = req.body;

  if (!restaurantId || !cart || !total || !customerName || !deliveryMethod) {
    return res.status(400).json({ success: false, message: 'Missing required order data' });
  }

  try {
    const client = await pool.connect();
    const insertQuery = `
      INSERT INTO orders (user_id, restaurant_id, items, total_amount, customer_name, customer_phone, customer_email, delivery_method, delivery_address, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `;
    const result = await client.query(insertQuery, [
      userId,
      restaurantId,
      JSON.stringify(cart), // Store cart as JSONB
      total,
      customerName,
      customerPhone,
      customerEmail,
      deliveryMethod,
      deliveryAddress,
      'pending'
    ]);
    client.release();

    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, message: 'Server error creating order.' });
  }
};

exports.getUserOrders = async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    client.release();
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ success: false, message: 'Server error fetching orders.' });
  }
};

exports.getOrderStatus = async (req, res) => {
  const orderId = req.query.orderId; // Assuming orderId is a query parameter
  // For security, you might want to ensure only the order owner or restaurant owner can check status
  // For this "public" tracking link, we won't add auth, but for admin view, you would.

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT status, delivery_method, driver_name, created_at FROM orders WHERE id = $1', [orderId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = result.rows[0];
    res.json({
      success: true,
      status: order.status,
      method: order.delivery_method,
      driverName: order.driver_name, // Assuming driver_name column exists
      updatedAt: order.created_at // Use created_at as last updated for simplicity if no 'updated_at'
    });
  } catch (err) {
    console.error('Error fetching order status:', err);
    res.status(500).json({ success: false, message: 'Server error fetching order status.' });
  }
};
