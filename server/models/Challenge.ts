import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Steps', 'Water', 'Meditation', 'Sleep'], required: true },
  targetValue: { type: Number, required: true },
  unit: { type: String, required: true },
  points: { type: Number, default: 10 },
  durationDays: { type: Number, default: 1 },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Challenge', challengeSchema);
