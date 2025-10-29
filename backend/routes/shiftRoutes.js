// routes/shiftRoutes.js
const express = require("express");
const router = express.Router();
const Shift = require("../models/shiftModel");
const Cart = require("../models/cart"); // to update totals on end if you want

// Start shift
router.post("/start", async (req, res) => {
  try {
    const { cashier } = req.body;
    if (!cashier) return res.status(400).json({ message: "cashier required" });

    const existing = await Shift.findOne({ cashier, endTime: null });
    if (existing) return res.json(existing); // already active

    const shift = await Shift.create({ cashier });
    res.status(201).json(shift);
  } catch (err) {
    console.error("Start shift error:", err);
    res.status(500).json({ message: err.message });
  }
});

// End shift (and optionally compute total sales)
router.post("/end", async (req, res) => {
  try {
    const { cashier } = req.body;
    if (!cashier) return res.status(400).json({ message: "cashier required" });

    const shift = await Shift.findOne({ cashier, endTime: null });
    if (!shift) return res.status(404).json({ message: "No active shift" });

    // optional: compute total sales for this shift via Cart.shiftId
    const sales = await Cart.aggregate([
      { $match: { cashier, createdAt: { $gte: shift.startTime }, ...(shift.endTime ? { $lte: shift.endTime } : {}) } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const total = sales[0]?.total || 0;

    shift.endTime = new Date();
    shift.totalSales = total;
    await shift.save();

    res.json(shift);
  } catch (err) {
    console.error("End shift error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get active shift for a cashier
router.get("/active", async (req, res) => {
  try {
    const { cashier } = req.query;
    if (!cashier) return res.status(400).json({ message: "cashier required" });
    const shift = await Shift.findOne({ cashier, endTime: null });
    res.json(shift || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
