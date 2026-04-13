import mongoose from 'mongoose';

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['General', 'ICU', 'Private'], required: true },
  associated_department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Ward', wardSchema);
