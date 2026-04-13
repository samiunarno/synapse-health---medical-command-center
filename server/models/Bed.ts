import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  ward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Bed', bedSchema);
