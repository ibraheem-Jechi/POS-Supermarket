const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");

// ✅ GET /api/alerts — Returns all stock and expiry alerts
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    const alerts = [];
    const now = new Date();

    products.forEach((product) => {
      const baseAlert = {
        productId: product._id,
        productName: product.productName,
        createdAt: now.toISOString(), // ✅ Proper ISO timestamp
      };

      // ✅ Out of Stock
      if (product.quantity <= 0) {
        alerts.push({
          ...baseAlert,
          type: "Out of Stock",
          message: `${product.productName} is out of stock.`,
        });
      }
      // ✅ Low Stock
      else if (product.quantity < product.minStockLevel) {
        alerts.push({
          ...baseAlert,
          type: "Low Stock",
          message: `${product.productName} has low stock (${product.quantity} left).`,
        });
      }

      // ✅ Expiry handling
      if (product.expiryDate) {
        const expiry = new Date(product.expiryDate);
        const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          alerts.push({
            ...baseAlert,
            type: "Expired",
            message: `${product.productName} expired on ${expiry.toLocaleDateString()}.`,
          });
        } else if (diffDays <= 7) {
          alerts.push({
            ...baseAlert,
            type: "Expiring Soon",
            message: `${product.productName} will expire in ${diffDays} days.`,
          });
        }
      }
    });

    // ✅ Sort newest first
    alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

module.exports = router;
