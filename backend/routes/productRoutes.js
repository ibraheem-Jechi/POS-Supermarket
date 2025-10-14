const express = require('express'); // must be express
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

const { authenticate, authorize } = require('../middleware/authMiddleware');

// Only admin or cashier can create products
router.post('/', authenticate, authorize('admin', 'cashier'), createProduct);

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
