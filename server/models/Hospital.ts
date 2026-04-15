import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  hospital_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  registration_number: { type: String, required: true },
  capacity: { type: Number, default: 0 },
  commissionBalance: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Hospital', hospitalSchema);
