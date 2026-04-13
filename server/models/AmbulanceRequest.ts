import mongoose from 'mongoose';

const ambulanceRequestSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickup_location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  destination_location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  status: { type: String, enum: ['Pending', 'Accepted', 'Dispatched', 'Arrived', 'Completed', 'Cancelled'], default: 'Pending' },
  service_type: { type: String, enum: ['Standard', 'Fast', 'Express'], default: 'Standard' },
  ambulance_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('AmbulanceRequest', ambulanceRequestSchema);
