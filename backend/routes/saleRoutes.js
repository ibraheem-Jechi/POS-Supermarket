// routes/saleRoutes.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');

// ✅ GET sales statistics (today, week, month, total)
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const all = await Cart.find();
    const today = all.filter(s => new Date(s.createdAt) >= startOfDay);
    const week = all.filter(s => new Date(s.createdAt) >= startOfWeek);
    const month = all.filter(s => new Date(s.createdAt) >= startOfMonth);

    const sum = (arr) => arr.reduce((acc, s) => acc + (s.total || 0), 0);

    res.json({
      totalReceipts: all.length,
      totalSales: sum(all),
      today: { receipts: today.length, total: sum(today) },
      week: { receipts: week.length, total: sum(week) },
      month: { receipts: month.length, total: sum(month) },
      averageSale: all.length > 0 ? sum(all) / all.length : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET all sales
router.get('/', async (req, res) => {
  try {
    const carts = await Cart.find().sort({ createdAt: -1 }); // newest first
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET single sale by ID
router.get('/:id', async (req, res) => {
  try {
    const sale = await Cart.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST new sale
router.post('/', async (req, res) => {
  try {
    const { lines, subtotal, tax, total, cashier } = req.body;
    const cart = new Cart({ lines, subtotal, tax, total, cashier });
    await cart.save();
    res.status(201).json({ message: 'Sale recorded', cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE sale
router.put('/:id', async (req, res) => {
  try {
    const updated = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Sale not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE sale
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Cart.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Sale not found' });
    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
