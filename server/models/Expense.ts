import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ['Hospital Bill', 'Medicine', 'Lab Test', 'Consultation', 'Other'], required: true },
  date: { type: Date, default: Date.now },
  receiptUrl: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Expense', expenseSchema);
