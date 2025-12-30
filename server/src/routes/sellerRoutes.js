const express = require('express');
const router = express.Router();
const { protect, sellerOnly } = require('../middleware/auth');
const {
  getProfile,
  updateKycDocs,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  dashboard,
  lowStock,
} = require('../controllers/sellerController');
const { uploadKycDocs, uploadProductImages } = require('../middleware/upload');

router.use(protect, sellerOnly);

router.get('/profile', getProfile);
router.put('/kyc', uploadKycDocs, updateKycDocs);
router.get('/dashboard', dashboard);
router.get('/products', listProducts);
router.post('/products', uploadProductImages, createProduct);
router.put('/products/:id', uploadProductImages, updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/low-stock', lowStock);

module.exports = router;


