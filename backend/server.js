require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// --------------------------
// Middleware
// --------------------------
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// --------------------------
// Health-check route
// --------------------------
app.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// --------------------------
// API Routes
// --------------------------
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const cartsRoute = require("./routes/carts");
app.use("/api/carts", cartsRoute);

const saleRoutes = require('./routes/saleRoutes');
app.use('/api/sales', saleRoutes); // frontend fetches all carts

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// --------------------------
// Server & Database Setup
// --------------------------
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/supermarket_pos';
const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/categories", categoryRoutes);



mongoose.connect(MONGO)
  .then(() => {
    console.log('✅ MongoDB connected');

    // Automatic one-time patch: populate `categoryName` from `name` for existing categories
    try {
      const Category = require('./models/categoryModel');
      Category.updateMany(
        { $or: [{ categoryName: { $exists: false } }, { categoryName: null }] },
        [{ $set: { categoryName: '$name' } }]
      )
        .then((result) => {
          if (result.modifiedCount && result.modifiedCount > 0) {
            console.log(`✅ Patched ${result.modifiedCount} category documents to set categoryName`);
          } else {
            console.log('✅ No category documents needed patching');
          }
        })
        .catch((err) => {
          console.error('Error patching categories on startup:', err.message || err);
        });
    } catch (e) {
      console.error('Could not run startup patch for categories:', e.message || e);
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
