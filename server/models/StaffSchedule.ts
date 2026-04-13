import mongoose from 'mongoose';

const staffScheduleSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  shift_start: { type: Date, required: true },
  shift_end: { type: Date, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'Active', 'Completed', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

export default mongoose.model('StaffSchedule', staffScheduleSchema);
