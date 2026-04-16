import mongoose from 'mongoose';

const labAppointmentSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test_type: { type: String, required: true },
  appointment_date: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('LabAppointment', labAppointmentSchema);
