import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  pharmacy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  payment_method: { type: String, enum: ['Card', 'UPI', 'Cash', 'Insurance', 'Wallet'], default: 'Card' },
  transaction_id: { type: String },
  insurance_claim_id: { type: String }
}, { timestamps: true });

export default mongoose.model('Billing', billingSchema);
