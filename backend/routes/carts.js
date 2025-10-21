const express = require("express");
const router = express.Router();
const Cart = require("../models/cart"); // ✅ استعمل cart.js الموحد

// POST /api/carts
router.post("/", async (req, res) => {
  try {
    // آخر فاتورة مسجلة
    const lastCart = await Cart.findOne().sort({ invoiceNumber: -1 });

    // إذا ما فيه فواتير قبل، يبدأ من 1
    const nextInvoice = lastCart && lastCart.invoiceNumber 
      ? lastCart.invoiceNumber + 1 
      : 1;

    const cart = new Cart({
      ...req.body,
      invoiceNumber: nextInvoice
    });

    const saved = await cart.save();

    res.status(201).json({
      id: saved._id,
      invoiceNumber: saved.invoiceNumber,
      message: "Cart saved",
      cart: saved
    });
  } catch (err) {
    console.error("❌ Error saving cart:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
