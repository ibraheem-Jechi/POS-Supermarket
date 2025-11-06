const Sale = require('../models/saleModel');
const Product = require('../models/productModel');

exports.createSale = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({ error: 'No products in sale' });
    }

    let totalAmount = 0;
    const updatedProducts = [];

    // ✅ Update product quantity and calculate total
    for (let item of products) {
      const prod = await Product.findById(item.product);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${item.name}` });
      }

      // ✅ Use "quantity" instead of "stock"
      if (prod.quantity < item.quantity) {
        return res
          .status(400)
          .json({ error: `Not enough stock for ${prod.productName}` });
      }

      prod.quantity -= item.quantity;
      await prod.save();

      totalAmount += item.price * item.quantity;
      updatedProducts.push({
        name: prod.productName,
        quantitySold: item.quantity,
        remainingStock: prod.quantity,
      });
    }

    // ✅ Create sale record
    const sale = await Sale.create({
      products,
      totalAmount,
      date: new Date(),
    });

    res.status(201).json({
      message: 'Sale recorded successfully and stock updated',
      sale,
      updatedProducts,
    });
  } catch (err) {
    console.error('❌ Sale Error:', err);
    res.status(500).json({ error: 'Server error while processing sale' });
  }
};
