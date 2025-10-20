const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
  lines: { type: [lineItemSchema], default: [] },
  subtotal: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  cashier: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);
