import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTDevice extends Document {
  deviceId: string;
  name: string;
  type: 'Vital Monitor' | 'Room Sensor' | 'Asset Tracker' | 'Smart Bed';
  status: 'Active' | 'Warning' | 'Error' | 'Offline';
  location: string;
  patient_id?: mongoose.Types.ObjectId;
  lastReading: any;
  updatedAt: Date;
}

const IoTDeviceSchema: Schema = new Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Vital Monitor', 'Room Sensor', 'Asset Tracker', 'Smart Bed'], required: true },
  status: { type: String, enum: ['Active', 'Warning', 'Error', 'Offline'], default: 'Active' },
  location: { type: String, required: true },
  patient_id: { type: Schema.Types.ObjectId, ref: 'Patient' },
  lastReading: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model<IIoTDevice>('IoTDevice', IoTDeviceSchema);
