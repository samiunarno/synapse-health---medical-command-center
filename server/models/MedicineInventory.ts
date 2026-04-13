import mongoose from 'mongoose';

const medicineInventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicineName: { type: String, required: true },
  currentStock: { type: Number, required: true },
  minStockLevel: { type: Number, default: 5 },
  dosage: { type: String },
  frequency: { type: String },
  expiryDate: { type: Date },
  autoRefill: { type: Boolean, default: false },
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to a pharmacist user
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('MedicineInventory', medicineInventorySchema);
