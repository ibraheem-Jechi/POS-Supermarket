const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productCategory: { type: String, required: true },   // simple string for now
  barcode: { type: String },                            // optional
  productImage: { type: String }
});

module.exports = mongoose.model("Product", productSchema);
