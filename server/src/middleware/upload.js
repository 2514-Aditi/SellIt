const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  // For product images, only allow images
  if (file.fieldname === 'images') {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Invalid file type. Only images are allowed for products.'), false);
  }
  // For KYC docs, allow images and PDFs
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('Invalid file type'), false);
};

const upload = multer({ storage, fileFilter });

const uploadKycDocs = upload.fields([
  { name: 'pan', maxCount: 1 },
  { name: 'gst', maxCount: 1 },
  { name: 'bank', maxCount: 1 },
]);

const uploadProductImages = upload.fields([
  { name: 'images', maxCount: 5 }, // Allow up to 5 product images
]);

module.exports = { upload, uploadKycDocs, uploadProductImages };


