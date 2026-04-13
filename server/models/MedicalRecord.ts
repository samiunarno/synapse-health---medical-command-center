import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  title: { type: String },
  type: { type: String, enum: ['Diagnosis', 'Treatment', 'Lab Result', 'Surgery'], required: true },
  date: { type: Date, default: Date.now },
  details: { type: String, required: true },
  blockchain_hash: { type: String },
  blockchain_tx: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('MedicalRecord', medicalRecordSchema);
