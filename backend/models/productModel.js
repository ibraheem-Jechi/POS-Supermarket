// models/productModel.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productCategory: { type: String, required: true },
  barcode: { type: String },
  productImage: { type: String },
  quantity: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, default: 10 },
  expiryDate: { type: Date }   // ✅ NEW: Expiry date field
});

module.exports = mongoose.model("Product", productSchema);
