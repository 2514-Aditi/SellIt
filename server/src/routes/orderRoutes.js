const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { sellerOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.put('/:id/status', protect, sellerOnly, updateOrderStatus);

module.exports = router;


