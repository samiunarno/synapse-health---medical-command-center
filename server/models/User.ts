import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'Admin' | 'Doctor' | 'Patient' | 'Staff' | 'Lab' | 'Driver' | 'Rider' | 'Hospital' | 'Pharmacy' | 'Pharmacist' | 'LabTechnician';
  fullName?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
  address?: string;
  phone?: string;
  patientType?: string;
  doctorType?: string;
  department_id?: string;
  isBanned: boolean;
  ratings: { raterId: string; rating: number; comment?: string; createdAt: Date }[];
  averageRating: number;
  reference_id?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Banned';
  verificationDocuments: { url: string; type: string; uploadedAt: Date }[];
  aiVerificationReport?: string;
  banReason?: string;
  id_card_url?: string;
  id_card_uploaded_at?: Date;
  account_request: 'none' | 'deactivate' | 'delete';
  account_request_status: 'none' | 'pending' | 'approved' | 'rejected';
  emergencyContacts: { name: string; phone: string; email?: string; relation: string }[];
  qrLoginToken?: string;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Doctor', 'Patient', 'Staff', 'Lab', 'Driver', 'Rider', 'Hospital', 'Pharmacy', 'Pharmacist', 'LabTechnician'], required: true },
  fullName: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  age: { type: Number },
  address: { type: String },
  phone: { type: String },
  patientType: { type: String },
  doctorType: { type: String },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isBanned: { type: Boolean, default: false },
  ratings: [{
    raterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  reference_id: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Banned'], default: 'Pending' },
  verificationDocuments: [{
    url: { type: String, required: true },
    type: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  aiVerificationReport: { type: String },
  banReason: { type: String },
  id_card_url: { type: String },
  id_card_uploaded_at: { type: Date },
  account_request: { type: String, enum: ['none', 'deactivate', 'delete'], default: 'none' },
  account_request_status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    relation: { type: String, required: true }
  }],
  qrLoginToken: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre<IUser>('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
