const mongoose = require('mongoose');
const Category = require('../models/categoryModel');

(async function(){
  try{
    const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/supermarket_pos';
    await mongoose.connect(MONGO);
    const docs = await Category.find({ $or: [{ categoryName: { $exists: false } }, { categoryName: null }] });
    for(const d of docs){ d.categoryName = d.name; await d.save(); console.log('patched', d._id); }
    console.log('patchedCount', docs.length);
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
