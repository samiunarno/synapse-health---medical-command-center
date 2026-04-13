import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  status: { type: String, enum: ['Waiting', 'In Progress', 'Completed', 'Cancelled'], default: 'Waiting' },
  token_number: { type: String },
  priority: { type: String, enum: ['Normal', 'Urgent', 'Emergency'], default: 'Normal' },
  estimated_time: { type: Date },
  position: { type: Number }
}, { timestamps: true });

export default mongoose.model('Queue', queueSchema);
