const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    notes: { type: String },
    // you can add a "balance" later if you want supplier accounting
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
