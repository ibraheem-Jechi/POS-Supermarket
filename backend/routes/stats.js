<<<<<<< HEAD
const mongoose = require('mongoose');
const Order = require('../models/saleModel');  // use your actual sales model name
const Product = require('../models/productModel');  // match your file’s exact name

// const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/top-products/monthly', /* requireAuth, requireAdmin, */ getTopProductsByMonth);
=======
const express = require('express');
const router = express.Router();
const {
  getTopProductsByMonth,
  getTopCashiersByMonth,
  getTopCategoriesByMonth,
} = require('../controllers/statsController');

router.get('/top-products/monthly', getTopProductsByMonth);
router.get('/top-cashiers/monthly', getTopCashiersByMonth);
router.get('/top-categories/monthly', getTopCategoriesByMonth);
>>>>>>> origin/dev

module.exports = router;
