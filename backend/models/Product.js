const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barcode: { type: String, index: true, unique: true, sparse: true },
  category: { type: String },
  price: { type: Number, required: true, default: 0 },
  costPrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
