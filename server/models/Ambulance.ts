import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  vehicle_number: { type: String, required: true, unique: true },
  driver_name: { type: String, required: true },
  driver_phone: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Dispatched', 'Returning', 'Maintenance'], default: 'Available' },
  current_location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  destination: {
    lat: { type: Number },
    lng: { type: Number }
  },
  eta: { type: Number } // in minutes
}, { timestamps: true });

export default mongoose.model('Ambulance', ambulanceSchema);
