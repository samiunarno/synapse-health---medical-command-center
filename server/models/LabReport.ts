import mongoose, { Document } from 'mongoose';

export interface ILabReport extends Document {
  patient_id: mongoose.Types.ObjectId;
  lab_technician_id: mongoose.Types.ObjectId;
  test_name: string;
  test_date: Date;
  result_details: string;
  status: 'Pending' | 'Completed';
  report_url?: string;
  ai_interpretation?: string;
  createdAt: Date;
}

const labReportSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lab_technician_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test_name: { type: String, required: true },
  test_date: { type: Date, default: Date.now },
  result_details: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  report_url: { type: String },
  ai_interpretation: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILabReport>('LabReport', labReportSchema);
