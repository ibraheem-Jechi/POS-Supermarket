// controllers/statsController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product'); // only to resolve collection name

// Accepts ?month=YYYY-MM (preferred) or ?year=YYYY&month=MM
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

exports.getTopProductsByMonth = async (req, res) => {
  try {
    const { start, end, y, m } = getMonthRange(req.query);

    const pipeline = [
      { $match: { status: 'paid', createdAt: { $gte: start, $lt: end } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',                     // change if your field names differ
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: mongoose.model('Product').collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$product.name',
          sku: '$product.sku',
          unitsSold: 1,
          revenue: 1
        }
      }
    ];

    const topProducts = await Order.aggregate(pipeline);
    res.json({ month: `${y}-${String(m).padStart(2, '0')}`, topProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compute monthly top products' });
  }
};
