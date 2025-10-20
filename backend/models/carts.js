// routes/saleRoutes.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/carts'); // use your existing cart model

// GET all sales (all carts)
router.get('/', async (req, res) => {
  try {
    const carts = await Cart.find().sort({ createdAt: -1 }); // newest first
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
