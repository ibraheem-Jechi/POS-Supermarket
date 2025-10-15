const express = require("express");
const router = express.Router();
const Cart = require("../models/carts");


// POST /api/carts
// Body: { lines:[{productId,name,price,qty}], subtotal, tax, total }
router.post("/", async (req, res) => {
  const cart = await Cart.create(req.body);
  res.status(201).json({ id: cart._id, message: "Cart saved", cart });
});

module.exports = router;
