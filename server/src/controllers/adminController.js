const SellerProfile = require('../models/SellerProfile');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.listSellers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { kycStatus: status } : {};
    const sellers = await SellerProfile.find(filter).populate('user', 'name email');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sellers', error: error.message });
  }
};

exports.getSellerDetails = async (req, res) => {
  try {
    const seller = await SellerProfile.findById(req.params.id).populate('user', 'name email');
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch seller', error: error.message });
  }
};

exports.approveSeller = async (req, res) => {
  try {
    const seller = await SellerProfile.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    seller.kycStatus = 'approved';
    seller.approvedAt = new Date();
    seller.approvedBy = req.user._id;
    await seller.save();
    res.json({ message: 'Seller approved', seller });
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error: error.message });
  }
};

exports.rejectSeller = async (req, res) => {
  try {
    const { reason } = req.body;
    const seller = await SellerProfile.findById(req.params.id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });
    seller.kycStatus = 'rejected';
    seller.rejectionReason = reason;
    seller.rejectedAt = new Date();
    seller.rejectedBy = req.user._id;
    await seller.save();
    res.json({ message: 'Seller rejected', seller });
  } catch (error) {
    res.status(500).json({ message: 'Rejection failed', error: error.message });
  }
};

exports.adminDashboard = async (req, res) => {
  try {
    const sellers = await SellerProfile.countDocuments();
    const pending = await SellerProfile.countDocuments({ kycStatus: 'pending' });
    const approved = await SellerProfile.countDocuments({ kycStatus: 'approved' });
    const orders = await Order.countDocuments();
    const products = await Product.countDocuments();
    const totalSales = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    res.json({
      sellers,
      pendingSellers: pending,
      approvedSellers: approved,
      orders,
      products,
      totalSales: totalSales[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Dashboard fetch failed', error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, limit } = req.query;
    const filter = status ? { status } : {};
    
    let query = Order.find(filter)
      .populate('seller', 'name email')
      .populate('customer', 'name email')
      .populate({
        path: 'items.product',
        select: 'name sku price images',
        options: { lean: true }
      })
      .lean()
      .sort({ createdAt: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const orders = await query;

    // Handle null products and populate seller business name from SellerProfile
    const SellerProfile = require('../models/SellerProfile');
    const ordersWithValidData = await Promise.all(
      orders.map(async (order) => {
        // Get seller business name from SellerProfile if available
        let sellerBusinessName = null;
        let sellerEmail = null;
        if (order.seller) {
          const sellerProfile = await SellerProfile.findOne({ user: order.seller._id });
          sellerBusinessName = sellerProfile?.businessName;
          sellerEmail = order.seller.email;
        }

        return {
          ...order,
          seller: order.seller ? {
            ...order.seller,
            businessName: sellerBusinessName,
            email: sellerEmail,
          } : null,
          items: order.items.map((item) => ({
            ...item,
            product: item.product || { name: 'Product Deleted', sku: 'N/A', price: item.price },
          })),
        };
      })
    );

    res.json(ordersWithValidData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};


