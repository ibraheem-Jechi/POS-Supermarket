const mongoose = require('mongoose');
const path = require('path');

async function run() {
  try {
    const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/supermarket_pos';
    await mongoose.connect(MONGO);
    const Category = require(path.join(__dirname, '..', 'backend', 'models', 'categoryModel'));

    const docs = await Category.find({ $or: [{ categoryName: { $exists: false } }, { categoryName: null }] });
    for (const d of docs) {
      d.categoryName = d.name;
      await d.save();
      console.log('patched', d._id);
    }
    console.log('patchedCount', docs.length);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
