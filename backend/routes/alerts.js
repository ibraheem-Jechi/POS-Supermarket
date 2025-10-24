const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    const alerts = [];

    const today = new Date();

    products.forEach((product) => {
      if (product.quantity <= 0) {
        alerts.push({
          type: 'Out of Stock',
          message: `${product.productName} is out of stock.`,
          productId: product._id,
        });
      } else if (product.quantity < product.minStockLevel) {
        alerts.push({
          type: 'Low Stock',
          message: `${product.productName} has low stock (${product.quantity} left).`,
          productId: product._id,
        });
      }

      // Expiry handling (if your schema includes expiryDate)
      if (product.expiryDate) {
        const expiry = new Date(product.expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          alerts.push({
            type: 'Expired',
            message: `${product.productName} has expired on ${expiry.toLocaleDateString()}.`,
            productId: product._id,
          });
        } else if (diffDays <= 7) {
          alerts.push({
            type: 'Expiring Soon',
            message: `${product.productName} will expire in ${diffDays} days.`,
            productId: product._id,
          });
        }
      }
    });

    res.json({ count: alerts.length, alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;
