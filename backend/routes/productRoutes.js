const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");


// GET /api/products
router.get("/", async (req, res) => {
  const items = await Product.find().lean();
  res.json(items);
});

module.exports = router;
