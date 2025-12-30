const Product = require('../models/Product');
const Order = require('../models/Order');
const SellerProfile = require('../models/SellerProfile');

const ensureApproved = async (userId) => {
  const profile = await SellerProfile.findOne({ user: userId });
  if (!profile || profile.kycStatus !== 'approved') {
    const error = new Error('Seller not approved');
    error.status = 403;
    throw error;
  }
  return profile;
};

exports.getProfile = async (req, res) => {
  const profile = await SellerProfile.findOne({ user: req.user._id });
  res.json(profile);
};

exports.updateKycDocs = async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const docs = {
      panUrl: req.files?.pan?.[0]?.path || profile.documents.panUrl,
      gstUrl: req.files?.gst?.[0]?.path || profile.documents.gstUrl,
      bankUrl: req.files?.bank?.[0]?.path || profile.documents.bankUrl,
    };

    profile.documents = docs;
    profile.kycStatus = 'pending';
    await profile.save();
    res.json({ message: 'KYC submitted', profile });
  } catch (error) {
    res.status(500).json({ message: 'KYC update failed', error: error.message });
  }
};

exports.listProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
};

exports.createProduct = async (req, res) => {
  try {
    await ensureApproved(req.user._id);
    
    // Extract image paths from uploaded files - store relative path
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const images = req.files?.images?.map((file) => {
      // Store as uploads/filename for serving via static middleware
      // Normalize path separators (Windows uses backslashes)
      const normalizedPath = `${uploadDir}/${file.filename}`.replace(/\\/g, '/');
      console.log('Storing image path:', normalizedPath, 'from file:', file.filename);
      return normalizedPath;
    }) || [];
    
    const productData = {
      ...req.body,
      seller: req.user._id,
      images,
    };
    
    // Parse numeric fields
    if (productData.price) productData.price = parseFloat(productData.price);
    if (productData.quantity) productData.quantity = parseInt(productData.quantity);
    if (productData.lowStockThreshold) productData.lowStockThreshold = parseInt(productData.lowStockThreshold);
    
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Create failed' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    await ensureApproved(req.user._id);
    
    const updateData = { ...req.body };
    
    // Handle image uploads - add new images to existing ones or replace
    if (req.files?.images && req.files.images.length > 0) {
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      const newImages = req.files.images.map((file) => {
        // Store as uploads/filename for serving via static middleware
        // Normalize path separators (Windows uses backslashes)
        const normalizedPath = `${uploadDir}/${file.filename}`.replace(/\\/g, '/');
        return normalizedPath;
      });
      const existingProduct = await Product.findById(req.params.id);
      
      if (req.body.replaceImages === 'true') {
        // Replace all images
        updateData.images = newImages;
      } else {
        // Add to existing images
        updateData.images = [...(existingProduct?.images || []), ...newImages];
      }
    }
    
    // Parse numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.quantity) updateData.quantity = parseInt(updateData.quantity);
    if (updateData.lowStockThreshold) updateData.lowStockThreshold = parseInt(updateData.lowStockThreshold);
    
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      updateData,
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Update failed' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await ensureApproved(req.user._id);
    await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Delete failed' });
  }
};

exports.dashboard = async (req, res) => {
  const orders = await Order.find({ seller: req.user._id });
  const products = await Product.find({ seller: req.user._id });

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const placed = orders.filter((o) => o.status === 'placed').length;
  const lowStock = products.filter((p) => p.quantity <= p.lowStockThreshold).length;

  res.json({
    sales: totalSales,
    orders: orders.length,
    openOrders: placed,
    products: products.length,
    lowStock,
  });
};

exports.lowStock = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user._id,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch low stock products', error: error.message });
  }
};


