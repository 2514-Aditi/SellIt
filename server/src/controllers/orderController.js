const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { items, customerInfo } = req.body;
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      product.quantity -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      seller: items[0]?.sellerId || req.user._id,
      items: orderItems,
      customerInfo,
      total,
      status: 'placed',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Order creation failed', error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'seller') {
      filter.seller = req.user._id;
    } else if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    }

    const orders = await Order.find(filter)
      .populate({
        path: 'items.product',
        select: 'name sku price images',
        options: { lean: true }
      })
      .populate('seller', 'name email')
      .populate('customer', 'name email')
      .lean();
    
    // Filter out null products and handle gracefully
    const ordersWithValidProducts = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: item.product || { name: 'Product Deleted', sku: 'N/A', price: item.price }
      }))
    }));
    
    res.json(ordersWithValidProducts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOne({ _id: req.params.id, seller: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Status update failed', error: error.message });
  }
};


