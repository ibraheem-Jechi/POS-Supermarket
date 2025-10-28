// routes/saleRoutes.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const User = require('../models/userModel'); // for tracking points per user

// === GET sales statistics ===
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

    const sum = arr => arr.reduce((acc, s) => acc + (s.total || 0), 0);

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

// === GET all sales ===
router.get('/', async (req, res) => {
  try {
    const carts = await Cart.find().sort({ createdAt: -1 });
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === GET single sale by ID ===
router.get('/:id', async (req, res) => {
  try {
    const sale = await Cart.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === POST new sale ===
router.post('/', async (req, res) => {
  try {
  console.log('POST /api/sales incoming body:', req.body);
  const { lines, subtotal, tax, total, cashier } = req.body;

    // Generate incremental invoice number
    const last = await Cart.findOne().sort({ invoiceNumber: -1 }).limit(1).exec();
    const nextInvoice = last && typeof last.invoiceNumber === 'number' ? last.invoiceNumber + 1 : 1;

  // === Calculate loyalty points ===
  const subtotalNum = Number(subtotal) || 0;
  const taxNum = Number(tax) || 0;
  const totalNum = Number(total) || +(subtotalNum + taxNum).toFixed(2) || 0;
  const pointsEarned = Math.floor(totalNum / 10); // 1 point per $10 spent
  console.log('Loyalty calc: subtotal=', subtotalNum, 'tax=', taxNum, 'total=', totalNum, 'points=', pointsEarned);

    // Save sale with loyalty points
    const cart = new Cart({ 
      invoiceNumber: nextInvoice, 
      lines, 
      subtotal: subtotalNum, 
      tax: taxNum, 
      total: totalNum, 
      cashier, 
      loyaltyPoints: pointsEarned 
    });
    await cart.save();
    console.log('POST /api/sales saved cart:', cart);

    // Optional: update user/customer accumulated points
    if (cashier) {
      const user = await User.findOne({ username: cashier });
      if (user) {
        user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsEarned;
        await user.save();
      }
    }

    res.status(201).json({
      message: 'Sale recorded',
      cart,
      invoiceNumber: nextInvoice,
      loyaltyPoints: pointsEarned
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === UPDATE sale ===
router.put('/:id', async (req, res) => {
  try {
    const updated = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Sale not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === DELETE sale ===
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
