import mongoose from 'mongoose';

const organDonorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organs: [{ type: String, required: true }], // e.g., ['Kidney', 'Liver', 'Eyes']
  bloodGroup: { type: String, required: true },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  status: { type: String, enum: ['Registered', 'Active', 'Inactive'], default: 'Registered' },
  registrationDate: { type: Date, default: Date.now },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('OrganDonor', organDonorSchema);
