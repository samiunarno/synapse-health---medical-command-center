import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  lab_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  accreditation_number: { type: String, required: true },
  commissionBalance: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Lab', labSchema);
