import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'sos' | 'lab' | 'appointment' | 'system' | 'general';
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['sos', 'lab', 'appointment', 'system', 'general'], default: 'general' },
  isRead: { type: Boolean, default: false },
  link: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
