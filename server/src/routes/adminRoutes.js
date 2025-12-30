const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  listSellers,
  getSellerDetails,
  approveSeller,
  rejectSeller,
  adminDashboard,
  getAllOrders,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/dashboard', adminDashboard);
router.get('/sellers', listSellers);
router.get('/sellers/:id', getSellerDetails);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/reject', rejectSeller);
router.get('/orders', getAllOrders);

module.exports = router;


