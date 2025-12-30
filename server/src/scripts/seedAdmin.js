require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB } = require('../config/db');

const createAdmin = async () => {
  try {
    await connectDB();
    
    const adminEmail = process.argv[2] || 'admin@example.com';
    const adminPassword = process.argv[3] || 'admin123';
    
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    
    console.log('Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();


