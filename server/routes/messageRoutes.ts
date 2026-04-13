import express from 'express';
import { Message } from '../models/Message';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get messages between current user and another user
router.get('/:otherUserId', authenticate, async (req: any, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.user.id, receiver_id: req.params.otherUserId },
        { sender_id: req.params.otherUserId, receiver_id: req.user.id }
      ]
    }).sort({ created_at: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { receiver_id, content } = req.body;
    const newMessage = new Message({
      sender_id: req.user.id,
      receiver_id,
      content
    });
    await newMessage.save();
    
    // Emit socket event
    req.app.get('io')?.emit('new_message', newMessage);
    
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
