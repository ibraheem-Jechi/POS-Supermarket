const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  // primary name shown in UI
  name: { type: String, required: true, unique: true },
  // legacy / indexed field used previously by the app and DB
  // keep this field so route code that writes `categoryName` will persist it
  categoryName: { type: String },
  description: { type: String }  // ✅ Added description field
});

module.exports = mongoose.model("Category", categorySchema);
