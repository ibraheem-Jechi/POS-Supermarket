// controllers/statsController.js
const mongoose = require('mongoose');
const Cart = require('../models/cart'); // your sales model
const Product = require('../models/productModel');

// === Helper ===
function getMonthRange(query) {
  let y, m;
  if (query.month && /^\d{4}-\d{2}$/.test(query.month)) {
    [y, m] = query.month.split('-').map(Number);
  } else {
    y = Number(query.year) || new Date().getFullYear();
    m = Number(query.month) || new Date().getMonth() + 1;
  }
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  return { start, end, y, m };
}

// ======================================
// 🥇 Top Products
// ======================================
exports.getTopProductsByMonth = async (req, res) => {
  try {
    const { start, end, y, m } = getMonthRange(req.query);
    const pipeline = [
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $unwind: '$lines' },
      {
        $group: {
          _id: '$lines.product',
          unitsSold: { $sum: '$lines.quantity' },
          revenue: { $sum: { $multiply: ['$lines.quantity', '$lines.price'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: mongoose.model('Product').collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$product.name',
          sku: '$product.sku',
          unitsSold: 1,
          revenue: 1,
        },
      },
    ];
    const topProducts = await Cart.aggregate(pipeline);
    res.json({ month: `${y}-${String(m).padStart(2, '0')}`, topProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compute monthly top products' });
  }
};

// ======================================
// 💰 Top Cashiers
// ======================================
exports.getTopCashiersByMonth = async (req, res) => {
  try {
    const { start, end, y, m } = getMonthRange(req.query);
    const sales = await Cart.find({ createdAt: { $gte: start, $lt: end } });
    const totals = {};
    sales.forEach((s) => {
      const cashier = s.cashier || 'Unknown';
      totals[cashier] = (totals[cashier] || 0) + (s.total || 0);
    });
    const topCashiers = Object.entries(totals)
      .map(([cashier, total]) => ({ cashier, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
    res.json({ month: `${y}-${String(m).padStart(2, '0')}`, topCashiers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compute monthly top cashiers' });
  }
};

// ======================================
// 📦 Top Categories
// ======================================
exports.getTopCategoriesByMonth = async (req, res) => {
  try {
    const { start, end, y, m } = getMonthRange(req.query);
    const pipeline = [
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $unwind: '$lines' },
      {
        $lookup: {
          from: mongoose.model('Product').collection.name,
          localField: 'lines.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$product.categoryName',
          totalRevenue: {
            $sum: { $multiply: ['$lines.quantity', '$lines.price'] },
          },
          totalUnits: { $sum: '$lines.quantity' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalRevenue: 1,
          totalUnits: 1,
        },
      },
    ];
    const topCategories = await Cart.aggregate(pipeline);
    res.json({
      month: `${y}-${String(m).padStart(2, '0')}`,
      topCategories,
    });
  } catch (err) {
    console.error('Error fetching top categories:', err);
    res.status(500).json({ message: 'Failed to compute top categories' });
  }
};
