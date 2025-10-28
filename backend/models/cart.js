const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
   productCategory: { type: String }
});

const cartSchema = new mongoose.Schema({
  invoiceNumber: { type: Number, required: true, unique: true }, // رقم الفاتورة
  lines: { type: [lineItemSchema], default: [] },
  subtotal: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  // loyalty points awarded for the sale
  loyaltyPoints: { type: Number, default: 0 },
  cashier: { type: String }, // اسم الكاشير (من POSPage)
  createdAt: { type: Date, default: Date.now }
});
cartSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Cart', cartSchema);
