import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  patient_id: mongoose.Types.ObjectId;
  doctor_id: mongoose.Types.ObjectId;
  appointment_id?: mongoose.Types.ObjectId;
  date: Date;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  diagnosis: string;
  notes?: string;
  digital_signature?: string;
}

const PrescriptionSchema: Schema = new Schema({
  patient_id: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment_id: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  date: { type: Date, default: Date.now },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String }
  }],
  diagnosis: { type: String, required: true },
  notes: { type: String },
  digital_signature: { type: String }
}, { timestamps: true });

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
