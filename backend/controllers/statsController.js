// controllers/statsController.js
const mongoose = require('mongoose');
const Cart = require('../models/cart'); // ✅ your actual sales model
const Product = require('../models/productModel'); // ✅ match your file name

// Helper: parse ?month=YYYY-MM
function getMonthRange(query) {
  let y, m;
  if (query.month && /^\d{4}-\d{2}$/.test(query.month)) {
    [y, m] = query.month.split('-').map(Number);
  } else {
    y = Number(query.year) || new Date().getFullYear();
    m = Number(query.month) || (new Date().getMonth() + 1);
  }
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 1, 0, 0, 0)); // first day of next month
  return { start, end, y, m };
}

// GET /api/stats/top-products/monthly
exports.getTopProductsByMonth = async (req, res) => {
  try {
    const { start, end, y, m } = getMonthRange(req.query);

    // Adapted to your Cart schema
    const pipeline = [
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $unwind: '$lines' }, // 'lines' holds each sold product
      {
        $group: {
          _id: '$lines.product', // adjust if product field differs
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
