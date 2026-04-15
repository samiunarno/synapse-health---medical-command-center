import mongoose from 'mongoose';

const medicineOrderSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicines: [{
    medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  total_price: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  service_type: { type: String, enum: ['Standard', 'Fast', 'Express'], default: 'Standard' },
  rider_status: { type: String, enum: ['Idle', 'GoingToPharmacy', 'AtPharmacy', 'PickedUp', 'Delivering', 'Arrived'], default: 'Idle' },
  delivery_address: { type: String, required: true },
  rider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rider_location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  payment_status: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  payment_method: { type: String, enum: ['Cash', 'WeChat', 'Alipay'], default: 'Cash' }
}, { timestamps: true });

export default mongoose.model('MedicineOrder', medicineOrderSchema);
