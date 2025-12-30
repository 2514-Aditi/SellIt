const express = require('express');
const router = express.Router();
const { protect, customerOnly } = require('../middleware/auth');
const {
  browseProducts,
  getProduct,
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
} = require('../controllers/customerController');

// Public product browsing
router.get('/products', browseProducts);
router.get('/products/:id', getProduct);

// Protected customer routes
router.use(protect, customerOnly);

router.post('/orders', placeOrder);
router.get('/orders', getMyOrders);
router.get('/orders/:id', getOrder);
router.put('/orders/:id/cancel', cancelOrder);

module.exports = router;

