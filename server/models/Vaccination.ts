import mongoose, { Schema, Document } from 'mongoose';

export interface IVaccination extends Document {
  patientId: mongoose.Types.ObjectId;
  vaccineName: string;
  doseNumber: number;
  dateAdministered?: Date;
  dueDate: Date;
  status: 'Scheduled' | 'Administered' | 'Overdue';
  provider?: string;
  notes?: string;
}

const VaccinationSchema: Schema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vaccineName: { type: String, required: true },
  doseNumber: { type: Number, required: true },
  dateAdministered: { type: Date },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Administered', 'Overdue'], default: 'Scheduled' },
  provider: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IVaccination>('Vaccination', VaccinationSchema);
