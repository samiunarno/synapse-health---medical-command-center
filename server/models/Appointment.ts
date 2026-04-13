import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['Virtual', 'In-Person'], required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  
  // Payment workflow
  payment_status: { type: String, enum: ['Pending', 'Paid', 'Held', 'Released'], default: 'Pending' },
  payment_method: { type: String, enum: ['Alipay', 'WeChat', 'None'], default: 'None' },
  fee: { type: Number, required: true },
  platform_fee: { type: Number, default: 0 },
  
  // Completion workflow
  doctor_done: { type: Boolean, default: false },
  patient_done: { type: Boolean, default: false },

  // Telemedicine link
  meeting_link: { type: String },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Appointment', appointmentSchema);
