import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  brand_name: { type: String, required: true },
  generic_name: { type: String, required: true },
  aliases: { type: [String] },
  stock_quantity: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  associated_department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Medicine', medicineSchema);
