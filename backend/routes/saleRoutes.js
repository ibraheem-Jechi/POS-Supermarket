const express = require('express');
const router = express.Router();
const { createSale } = require('../controllers/saleController');

router.post('/', createSale);

module.exports = router;
