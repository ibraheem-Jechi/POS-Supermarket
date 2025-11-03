// models/expenseModel.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    category: { type: String, required: true }, // e.g. "Salary", "Utilities"
    description: { type: String },
    amount: { type: Number, required: true },
    addedBy: { type: String }, // username or userId
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
