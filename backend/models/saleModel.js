const express = require('express');
const router = express.Router();
const Cart = require('../models/cart'); // your cart model

// GET all sales (admin sees all, cashier sees only their own)
router.get('/', async (req, res) => {
  const { role, username } = req.query;

  try {
    let carts;
    if (role === 'admin') {
      carts = await Cart.find().sort({ createdAt: -1 });
    } else {
      carts = await Cart.find({ cashier: username }).sort({ createdAt: -1 });
    }

    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
