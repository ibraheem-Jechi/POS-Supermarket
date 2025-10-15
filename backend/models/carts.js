const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  lines: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    price: Number,
    qty: Number
  }],
  subtotal: Number,
  tax: Number,
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Cart", cartSchema);
