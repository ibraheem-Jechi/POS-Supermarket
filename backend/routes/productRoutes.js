// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");

// ✅ Get all products (with optional category filter)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.productCategory = req.query.category;
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Add product
router.post("/", async (req, res) => {
  try {
  const payload = { ...req.body };
  console.log('POST /api/products incoming payload:', JSON.stringify(payload));
    // Normalize expiryDate: ignore empty strings and invalid dates
    if (payload.expiryDate) {
      const d = new Date(payload.expiryDate);
      if (!isNaN(d.getTime())) payload.expiryDate = d; else delete payload.expiryDate;
    } else {
      delete payload.expiryDate;
    }
    const product = new Product(payload);
    const saved = await product.save();
  console.log('POST /api/products saved:', JSON.stringify(saved));
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Update product
router.put("/:id", async (req, res) => {
  try {
  const payload = { ...req.body };
  console.log(`PUT /api/products/${req.params.id} incoming payload:`, JSON.stringify(payload));
    if (payload.expiryDate) {
      const d = new Date(payload.expiryDate);
      if (!isNaN(d.getTime())) payload.expiryDate = d; else delete payload.expiryDate;
    } else {
      delete payload.expiryDate;
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
  console.log(`PUT /api/products/${req.params.id} updated:`, JSON.stringify(updated));
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Delete product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ NEW: Decrease quantity after sale
router.post("/decrease-stock", async (req, res) => {
  try {
    const { items } = req.body; // items = [{ productId, qty }]

    let warnings = [];
    let errors = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        errors.push(`❌ Product not found: ${item.productId}`);
        continue;
      }

      // 🔴 Check if enough stock
      if (product.quantity < item.qty) {
        errors.push(`❌ Not enough stock for ${product.productName} (Available: ${product.quantity}, Tried to sell: ${item.qty})`);
        continue;
      }

      // ✅ Decrease stock
      product.quantity -= item.qty;
      await product.save();

      // ⚠️ Check if low stock
      if (product.quantity <= product.minStockLevel) {
        warnings.push(`⚠️ ${product.productName} is low in stock (only ${product.quantity} left).`);
      }

      // 🔴 Check if out of stock
      if (product.quantity === 0) {
        warnings.push(`❗ ${product.productName} is now OUT OF STOCK!`);
      }
    }

    res.json({
      message: "Stock updated successfully",
      warnings,
      errors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;