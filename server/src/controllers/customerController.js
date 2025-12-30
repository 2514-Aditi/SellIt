const Product = require('../models/Product');
const Order = require('../models/Order');

// Get all active products from all sellers
exports.browseProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, seller } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (seller) {
      filter.seller = seller;
    }

    const products = await Product.find(filter)
      .populate('seller', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Get single product details
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email')
      .select('-__v');

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

// Place order (customer)
exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, customerInfo } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // First, validate all products and group by seller
    const sellerGroups = new Map();
    const products = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      products.push({ product, item });
      const sellerId = product.seller.toString();
      
      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, { items: [], total: 0 });
      }
      
      const group = sellerGroups.get(sellerId);
      group.items.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
      group.total += product.price * item.quantity;
    }

    // Reduce inventory for all products
    for (const { product, item } of products) {
      product.quantity -= item.quantity;
      await product.save();
    }

    // Create orders for each seller
    const orders = [];
    for (const [sellerId, group] of sellerGroups) {
      const order = await Order.create({
        seller: sellerId,
        customer: req.user._id,
        items: group.items,
        total: group.total,
        status: 'placed',
        shippingAddress,
        customerInfo: customerInfo || {
          name: req.user.name,
          email: req.user.email,
        },
        placedAt: new Date(),
      });
      orders.push(order);
    }

    // Return the first order (or all orders if you want to change the response)
    res.status(201).json(orders.length === 1 ? orders[0] : { orders, message: 'Multiple orders created' });
  } catch (error) {
    res.status(500).json({ message: 'Order placement failed', error: error.message });
  }
};

// Get customer's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('seller', 'name email')
      .populate({
        path: 'items.product',
        select: 'name sku price images',
        options: { lean: true }
      })
      .lean()
      .sort({ createdAt: -1 });

    // Handle null products gracefully
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

// Get single order details
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    })
      .populate('seller', 'name email')
      .populate({
        path: 'items.product',
        select: 'name sku price images',
        options: { lean: true }
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Handle null products gracefully
    order.items = order.items.map(item => ({
      ...item,
      product: item.product || { name: 'Product Deleted', sku: 'N/A', price: item.price }
    }));

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// Cancel order (customer)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ message: 'Cancellation failed', error: error.message });
  }
};

