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

module.exports = router;
