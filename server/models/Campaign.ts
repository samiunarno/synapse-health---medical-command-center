import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  title: string;
  description: string;
  goal: number;
  raised: number;
  investors: number;
  image: string;
  status: 'Active' | 'Completed' | 'Cancelled';
}

const CampaignSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  goal: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  investors: { type: Number, default: 0 },
  image: { type: String },
  status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
