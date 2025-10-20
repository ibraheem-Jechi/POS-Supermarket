const express = require('express');
const router = express.Router();
const Cart = require('../models/cart'); // correct model

// GET all sales (all carts)
router.get('/', async (req, res) => {
  try {
    const carts = await Cart.find().sort({ createdAt: -1 }); // newest first
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new sale/cart
router.post('/', async (req, res) => {
  try {
    const { lines, subtotal, tax, total, cashier } = req.body;
    const cart = new Cart({ lines, subtotal, tax, total, cashier });
    await cart.save();
    res.status(201).json({ message: 'Sale recorded', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
