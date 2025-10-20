const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }  // ✅ هذا الحقل اختياري
});

module.exports = mongoose.model("Category", categorySchema);
