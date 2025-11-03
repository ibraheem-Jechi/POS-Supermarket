const mongoose = require('mongoose');
const Order = require('../models/saleModel');  // use your actual sales model name
const Product = require('../models/productModel');  // match your file’s exact name

// const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/top-products/monthly', /* requireAuth, requireAdmin, */ getTopProductsByMonth);

module.exports = router;
