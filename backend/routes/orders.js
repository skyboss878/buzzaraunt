const express = require('express');
const checkPlan = require('../middleware/plan');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

let orders = [];
router.post('/', verifyToken, checkPlan(["basic", "pro", "enterprise"]), (req, res) => {
  const { cart, total, customerName, address, method } = req.body;
  if (!cart || !total || !customerName || !method) {
    return res.status(400).json({ success: false, message: 'Missing order data' });
  }
  const order = {
    id: Date.now(),
    user: req.user.email,
    cart,
    total,
    customerName,
    address,
    method,
    status: 'pending',
    createdAt: new Date(),
  };
  orders.push(order);
  res.json({ success: true, order });
});
router.get('/', verifyToken, checkPlan(["basic", "pro", "enterprise"]), (req, res) => {
  const userOrders = orders.filter(o => o.user === req.user.email);
  res.json({ success: true, orders: userOrders });
module.exports = router;
