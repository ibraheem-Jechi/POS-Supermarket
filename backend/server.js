require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// basic health-check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// TODO: mount routes here

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);



const cartsRoute = require("./routes/carts");
app.use("/api/carts", cartsRoute);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/supermarket_pos';

const saleRoutes = require('./routes/saleRoutes');
app.use('/api/sales', saleRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/categories", categoryRoutes);



mongoose.connect(MONGO)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

