// backend/controllers/productController.js
const Product = require('../models/productModel');
const Alert = require('../models/alertModel'); // ✅ Import Alert model

// Helper: Create alert if not already existing
const createAlertIfNeeded = async (type, message) => {
  const exists = await Alert.findOne({ type, message });
  if (!exists) {
    await Alert.create({ type, message, date: new Date(), status: 'unread' });
  }
};

// Helper: Check and trigger alerts for a product
const checkProductAlerts = async (product) => {
  const today = new Date();

  // ✅ Expired Product
  if (product.expiry && new Date(product.expiry) < today) {
    await createAlertIfNeeded(
      'Expired',
      `${product.productName} expired on ${new Date(product.expiry).toLocaleDateString()}.`
    );
  }

  // ✅ Out of Stock
  else if (product.quantity === 0) {
    await createAlertIfNeeded('Out of Stock', `${product.productName} is out of stock.`);
  }

  // ✅ Low Stock
  else if (product.quantity > 0 && product.quantity <= 10) {
    await createAlertIfNeeded(
      'Low Stock',
      `${product.productName} has low stock (${product.quantity} left).`
    );
  }
};

// ✅ Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new product
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // Check alerts when new product added
    await checkProductAlerts(product);

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // After update, re-check stock and expiry alerts
    await checkProductAlerts(product);

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete product
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
