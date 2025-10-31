// backend/routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/cart"); // ✅ صححت اسم الملف ليكون cart.js الصغير

// POST /api/carts
router.post("/", async (req, res) => {
  try {
    // آخر فاتورة مسجلة
    const lastCart = await Cart.findOne().sort({ invoiceNumber: -1 });

    // إذا ما فيه فواتير قبل، يبدأ من 1
    const nextInvoice = lastCart && lastCart.invoiceNumber 
      ? lastCart.invoiceNumber + 1 
      : 1;

    const {
      lines = [],
      subtotal = 0,
      tax = 0,
      total = 0,
      grandTotal = total + tax,         // ✅ افتراضياً لو ما أرسل grandTotal
      cashier = "unknown",
      paymentMethod = "cash",           // ✅ جديد
      saleDate = new Date()             // ✅ جديد
    } = req.body;

    const cart = new Cart({
      invoiceNumber: nextInvoice,
      lines,
      subtotal,
      tax,
      total,
      grandTotal,
      cashier,
      paymentMethod,
      saleDate
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
