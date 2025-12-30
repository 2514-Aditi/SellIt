const express = require('express');
const router = express.Router();
const { registerSeller, registerCustomer, login } = require('../controllers/authController');
const { uploadKycDocs } = require('../middleware/upload');

router.post('/register/seller', uploadKycDocs, registerSeller);
router.post('/register/customer', registerCustomer);
router.post('/login', login);

module.exports = router;


