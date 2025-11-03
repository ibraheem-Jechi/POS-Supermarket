// models/shiftModel.js
const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  cashier: { type: String, required: true },        // username
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  totalSales: { type: Number, default: 0 },         // optional accumulator
}, { timestamps: true });

module.exports = mongoose.model("Shift", shiftSchema);


