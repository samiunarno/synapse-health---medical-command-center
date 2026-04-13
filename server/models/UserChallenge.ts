import mongoose from 'mongoose';

const userChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  currentValue: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Completed', 'Failed'], default: 'Active' },
  startDate: { type: Date, default: Date.now },
  completedDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('UserChallenge', userChallengeSchema);
