// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");

// 🔹 Helper function (reduce duplication)
async function generateReport(match) {
  const invoices = await Cart.find(match);

  // Category aggregation
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

  // Product aggregation
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

  // Cashier aggregation
  const cashierAgg = await Cart.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$cashier",
        totalSales: { $sum: "$total" },
        invoices: { $sum: 1 }
      }
    }
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

  return {
    invoices,
    categories: categoryAgg,
    products: productAgg,
    cashiers: cashierAgg,
    totals: totals[0] || { subtotal: 0, tax: 0, total: 0, invoices: 0 }
  };
}

// 🔹 Daily Report
router.get("/daily", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().substring(0, 10);
    const start = new Date(date + "T00:00:00.000Z");
    const end = new Date(date + "T23:59:59.999Z");

    const match = { createdAt: { $gte: start, $lte: end } };

    const data = await generateReport(match);
    res.json({ date, ...data });
  } catch (err) {
    console.error("Daily report error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Monthly Report
router.get("/monthly", async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const start = new Date(month + "-01T00:00:00.000Z");
    const end = new Date(new Date(start).setMonth(start.getMonth() + 1));

    const match = { createdAt: { $gte: start, $lt: end } };

    const data = await generateReport(match);
    res.json({ month, ...data });
  } catch (err) {
    console.error("Monthly report error:", err);
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Yearly Report
router.get("/yearly", async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);

    const match = { createdAt: { $gte: start, $lt: end } };

    const data = await generateReport(match);
    res.json({ year, ...data });
  } catch (err) {
    console.error("Yearly report error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
