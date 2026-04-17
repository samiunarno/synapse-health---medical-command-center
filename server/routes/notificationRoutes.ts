import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import Notification from '../models/Notification';
import User from '../models/User';

const router = express.Router();

// Get all notifications for logged-in user
router.get('/', authenticate, async (req: any, res: any) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req: any, res: any) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error marking read' });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req: any, res: any) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error marking all read' });
  }
});

// Create a notification (Internal or Admin/System usage usually, but we expose for triggers)
// Protect this or limit to specific roles if needed. Here we allow logged in users (e.g. SOS from patient)
router.post('/', authenticate, async (req: any, res: any) => {
  try {
    const { title, message, type, link, recipientId } = req.body;
    
    let recipients: string[] = [];

    // If SOS, we want to notify all doctors and admins in the hospital maybe, 
    // or specifically the primary doctor. Assuming broadcast or specific:
    if (type === 'sos') {
      const doctors = await User.find({ role: { $in: ['doctor', 'hospital_admin'] } }).select('_id');
      recipients = doctors.map(d => d._id.toString());
    } else {
      if (!recipientId) return res.status(400).json({ message: 'Recipient is required unless type is sos' });
      recipients = [recipientId];
    }

    const notifications = recipients.map(rec => ({
      recipient: rec,
      title,
      message,
      type,
      link
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      createdNotifications.forEach((n) => {
        io.to(n.recipient.toString()).emit('new_notification', n);
      });
      // if sos, emit global emergency alert as well
      if (type === 'sos') {
         io.emit('emergency_alert', { title, message, link, patientId: req.user._id });
      }
    }

    res.status(201).json(createdNotifications);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error creating notification' });
  }
});

export default router;
