// backend/models/cart.js
const mongoose = require('mongoose');

// ✅ تفاصيل كل منتج بالخط
const lineItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
   productCategory: { type: String }
});

// ✅ نموذج الفاتورة / السلة
const cartSchema = new mongoose.Schema({
  invoiceNumber: { type: Number, required: true, unique: true }, // رقم الفاتورة
  lines: { type: [lineItemSchema], default: [] },
  subtotal: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true, default: 0 },
  cashier: { type: String }, // اسم الكاشير (من POSPage)
  createdAt: { type: Date, default: Date.now },
  
shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", default: null },

  // loyalty points awarded for the sale
  loyaltyPoints: { type: Number, default: 0 },
  
   paymentMethod: { type: String, default: "cash" },  
});

cartSchema.index({ createdAt: 1 }); // لتحسين البحث حسب التاريخ

module.exports = mongoose.model('Cart', cartSchema);
