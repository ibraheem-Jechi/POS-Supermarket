// backend/models/cart.js
const mongoose = require('mongoose');

// ✅ تفاصيل كل منتج بالخط
const lineItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true }
});

// ✅ نموذج الفاتورة / السلة
const cartSchema = new mongoose.Schema({
  invoiceNumber: { type: Number, required: true, unique: true }, // رقم الفاتورة التسلسلي
  cashier: { type: String, required: true },                     // اسم الكاشير
  lines: { type: [lineItemSchema], default: [] },               // المنتجات بالفاتورة
  subtotal: { type: Number, required: true, default: 0 },       // المجموع قبل الضريبة
  tax: { type: Number, required: true, default: 0 },            // قيمة الضريبة
  total: { type: Number, required: true, default: 0 },          // المجموع بعد الضريبة
  paymentMethod: { type: String, default: "cash" },             // طريقة الدفع
  saleDate: { type: Date, default: Date.now },                  // تاريخ ووقت الفاتورة
});

cartSchema.index({ createdAt: 1 }); // لتحسين البحث حسب التاريخ

module.exports = mongoose.model('Cart', cartSchema);
