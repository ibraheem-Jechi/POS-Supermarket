require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// --------------------------
// Middleware
// --------------------------
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
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

// Product Routes
const expressRouter = require('express').Router;
const Product = require('./models/productModel'); // adjust path if needed
const productRoutes = expressRouter();

// GET all products
productRoutes.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // fetch all products
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to load products' });
  }
});
app.use('/api/products', productRoutes);

// Other existing routes
const cartsRoute = require('./routes/carts');
app.use('/api/carts', cartsRoute);

const saleRoutes = require('./routes/saleRoutes');
app.use('/api/sales', saleRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const alertsRoute = require('./routes/alerts');
app.use('/api/alerts', alertsRoute);

// --------------------------
// Optional: Patch categoryName field on startup
// --------------------------
const patchCategories = async () => {
  try {
    const Category = require('./models/categoryModel');
    const result = await Category.updateMany(
      { $or: [{ categoryName: { $exists: false } }, { categoryName: null }] },
      [{ $set: { categoryName: '$name' } }]
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ Patched ${result.modifiedCount} category documents to set categoryName`);
    } else {
      console.log('✅ No category documents needed patching');
    }
  } catch (err) {
    console.error('Error patching categories on startup:', err.message || err);
  }
};

// --------------------------
// Server & Database Setup
// --------------------------
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/supermarket_pos';

mongoose
  .connect(MONGO)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Run category patch
    await patchCategories();

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
