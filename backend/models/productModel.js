// models/productModel.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productCategory: { type: String, required: true },
  barcode: { type: String },
  productImage: { type: String },
  quantity: { type: Number, required: true, default: 0 }, // ✅ NEW: Inventory quantity
  minStockLevel: { type: Number, default: 10 } // ✅ NEW: Alert threshold (optional)
});

module.exports = mongoose.model("Product", productSchema);