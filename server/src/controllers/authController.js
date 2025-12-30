const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

exports.registerSeller = async (req, res) => {
  try {
    const { name, email, password, businessName, businessType, gstNumber, panNumber, bankAccount } =
      req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'seller' });

    const documents = {
      panUrl: req.files?.pan?.[0]?.path,
      gstUrl: req.files?.gst?.[0]?.path,
      bankUrl: req.files?.bank?.[0]?.path,
    };

    await SellerProfile.create({
      user: user._id,
      businessName,
      businessType,
      gstNumber,
      panNumber,
      bankAccount,
      documents,
      kycStatus: 'pending',
    });

    const token = generateToken(user);
    res.status(201).json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'customer' });

    const token = generateToken(user);
    res.status(201).json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};


