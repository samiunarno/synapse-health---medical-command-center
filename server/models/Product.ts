import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., 'Medicine', 'Equipment', 'Supplies'
  image_url: { type: String },
  stock_quantity: { type: Number, required: true, default: 0 },
  manufacturer: { type: String },
  specifications: { type: Map, of: String }, // Flexible specs
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
