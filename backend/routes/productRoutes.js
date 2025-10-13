const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');

router.post('/', controller.createProduct);
router.get('/', controller.listProducts);
router.get('/:id', controller.getProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
