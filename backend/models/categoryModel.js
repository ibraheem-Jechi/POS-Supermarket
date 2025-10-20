const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }  // ✅ Added description field
});

module.exports = mongoose.model("Category", categorySchema);
