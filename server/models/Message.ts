import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  order_id: { type: String },
  order_type: { type: String, enum: ['Pharmacy', 'Ambulance', 'Lab', 'Appointment', 'Support'] },
  created_at: { type: Date, default: Date.now }
});

export const Message = mongoose.model('Message', messageSchema);
