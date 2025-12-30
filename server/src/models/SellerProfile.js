const mongoose = require('mongoose');

const SellerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true },
    businessType: { type: String },
    gstNumber: { type: String },
    panNumber: { type: String },
    bankAccount: { type: String },
    documents: {
      panUrl: String,
      gstUrl: String,
      bankUrl: String,
    },
    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    kycNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellerProfile', SellerProfileSchema);


