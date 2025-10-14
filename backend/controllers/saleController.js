const Sale = require('../models/saleModel');
const Product = require('../models/productModel');

exports.createSale = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({ error: 'No products in sale' });
    }

    let totalAmount = 0;

    // Update product stock and calculate total
    for (let item of products) {
      const prod = await Product.findById(item.product);
      if (!prod || prod.stock < item.quantity) {
        return res.status(400).json({ error: `Product ${item.name} out of stock` });
      }

      prod.stock -= item.quantity;
      await prod.save();

      totalAmount += item.price * item.quantity;
    }

    const sale = await Sale.create({
      products,
      totalAmount,
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error('Sale Error:', err);
    res.status(500).json({ error: 'Server error while processing sale' });
  }
};
