// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");

router.get("/daily", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().substring(0, 10);
    const start = new Date(date + "T00:00:00.000Z");
    const end = new Date(date + "T23:59:59.999Z");

    const match = { createdAt: { $gte: start, $lte: end } };

    // كل الفواتير
    const invoices = await Cart.find(match);

    // التجميع حسب الفئات
    const categoryAgg = await Cart.aggregate([
      { $match: match },
      { $unwind: "$lines" },
      {
        $group: {
          _id: "$lines.productCategory",
          totalQty: { $sum: "$lines.qty" },
          totalSales: { $sum: { $multiply: ["$lines.qty", "$lines.price"] } }
        }
      }
    ]);

    // ✅ التجميع حسب المنتجات
    const productAgg = await Cart.aggregate([
      { $match: match },
      { $unwind: "$lines" },
      {
        $group: {
          _id: "$lines.name",
          totalQty: { $sum: "$lines.qty" },
          totalSales: { $sum: { $multiply: ["$lines.qty", "$lines.price"] } }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Totals
    const totals = await Cart.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          subtotal: { $sum: "$subtotal" },
          tax: { $sum: "$tax" },
          total: { $sum: "$total" },
          invoices: { $sum: 1 }
        }
      }
    ]);

    res.json({
      date,
      invoices,
      categories: categoryAgg,
      products: productAgg,
      totals: totals[0] || { subtotal: 0, tax: 0, total: 0, invoices: 0 }
    });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
