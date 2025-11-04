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

// ✅ DAILY SUMMARY with per-cashier shift info
router.get("/daily-summary", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().substring(0, 10);
    const cashier = req.query.cashier || null;
    const start = new Date(date + "T00:00:00.000Z");
    const end = new Date(date + "T23:59:59.999Z");

    const match = cashier
      ? { createdAt: { $gte: start, $lte: end }, cashier }
      : { createdAt: { $gte: start, $lte: end } };

    // All invoices (sorted)
    const invoices = await Cart.find(match).sort({ createdAt: 1 });

    // If no invoices, return empty
    if (!invoices.length) {
      return res.json({
        date,
        storeName: "Supermarket POS",
        invoices: [],
        totals: { subtotal: 0, tax: 0, total: 0, invoices: 0 },
        products: [],
        cashiers: [],
      });
    }

    // 🔸 Group invoices by cashier manually
    const cashierMap = {};
    invoices.forEach((inv) => {
      const c = inv.cashier || "Unknown";
      if (!cashierMap[c]) {
        cashierMap[c] = {
          cashier: c,
          invoices: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          startTime: inv.createdAt,
          endTime: inv.createdAt,
        };
      }

      cashierMap[c].invoices.push(inv);
      cashierMap[c].subtotal += inv.subtotal || 0;
      cashierMap[c].tax += inv.tax || 0;
      cashierMap[c].total += inv.total || 0;

      if (new Date(inv.createdAt) < new Date(cashierMap[c].startTime))
        cashierMap[c].startTime = inv.createdAt;
      if (new Date(inv.createdAt) > new Date(cashierMap[c].endTime))
        cashierMap[c].endTime = inv.createdAt;
    });

    const cashiers = Object.values(cashierMap).map((c) => {
      const durationMs = new Date(c.endTime) - new Date(c.startTime);
      const h = Math.floor(durationMs / 3600000);
      const m = Math.floor((durationMs % 3600000) / 60000);
      return {
        ...c,
        duration: `${h}h ${m}m`,
        invoiceCount: c.invoices.length,
      };
    });

    // 🔹 Aggregate all products (whole day)
    const productAgg = await Cart.aggregate([
      { $match: match },
      { $unwind: "$lines" },
      {
        $group: {
          _id: "$lines.name",
          totalQty: { $sum: "$lines.qty" },
          totalSales: { $sum: { $multiply: ["$lines.qty", "$lines.price"] } },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // 🔹 Totals for the day
    const totals = cashiers.reduce(
      (acc, c) => {
        acc.subtotal += c.subtotal;
        acc.tax += c.tax;
        acc.total += c.total;
        acc.invoices += c.invoiceCount;
        return acc;
      },
      { subtotal: 0, tax: 0, total: 0, invoices: 0 }
    );

    res.json({
      date,
      storeName: "Supermarket POS",
      invoices,
      products: productAgg,
      cashiers,
      totals,
    });
  } catch (err) {
    console.error("Daily summary error:", err);
    res.status(500).json({ message: err.message });
  }
});





module.exports = router;
