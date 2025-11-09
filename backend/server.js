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

// Simple request logger to help debug 404s/misrouted requests
app.use((req, res, next) => {
  console.log(`--> ${req.method} ${req.originalUrl}`);
  next();
});

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
const productRoutes = require('./routes/productRoutes');
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

// Debug route to see all registered routes
app.get('/api/debug/routes', (req, res) => {
  try {
    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        routes.push({ path: middleware.route.path, methods: middleware.route.methods });
      } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
        middleware.handle.stack.forEach((handler) => {
          const route = handler.route;
          if (route) routes.push({ path: route.path, methods: route.methods });
        });
      }
    });
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW: Stats route (for top products etc.)
const statsRoutes = require('./routes/stats');
app.use('/api/stats', statsRoutes);

const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);

const profitRoutes = require('./routes/profitRoutes');
app.use('/api/profit', profitRoutes);

const shiftRoutes = require("./routes/shiftRoutes");
app.use("/api/shifts", shiftRoutes);

const supplierRoutes = require("./routes/supplierRoutes");
app.use("/api/suppliers", supplierRoutes);

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

// ✅ Improved Mongoose connection with timeout handling
mongoose
  .connect(MONGO, {
    serverSelectionTimeoutMS: 30000, // ⏱️ 30s connection timeout
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4, // ✅ Use IPv4 to avoid DNS issues
  })
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
