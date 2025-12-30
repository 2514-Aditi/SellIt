const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema(
  {
    size: String,
    color: String,
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    variants: [VariantSchema],
    lowStockThreshold: { type: Number, default: 5 },
    images: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);


