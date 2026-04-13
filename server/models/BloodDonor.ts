import mongoose, { Schema, Document } from 'mongoose';

export interface IBloodDonor extends Document {
  userId: mongoose.Types.ObjectId;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  location: {
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  lastDonationDate?: Date;
  isAvailable: boolean;
  contactNumber: string;
}

const BloodDonorSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  location: {
    address: { type: String, required: true },
    coordinates: { type: [Number], required: true },
  },
  lastDonationDate: { type: Date },
  isAvailable: { type: Boolean, default: true },
  contactNumber: { type: String, required: true },
}, { timestamps: true });

BloodDonorSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model<IBloodDonor>('BloodDonor', BloodDonorSchema);
