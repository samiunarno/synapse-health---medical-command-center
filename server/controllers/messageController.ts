import { Request, Response } from 'express';
import { Message } from '../models/Message';
import User from '../models/User';
import mongoose from 'mongoose';

export const getConversations = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Find all users who have sent or received messages with the current user
    const sentMessages = await Message.distinct('receiver_id', { sender_id: userId });
    const receivedMessages = await Message.distinct('sender_id', { receiver_id: userId });
    
    // Union of both lists
    const contactIds = [...new Set([...sentMessages, ...receivedMessages])];
    
    const contacts = await User.find({ _id: { $in: contactIds } })
      .select('username fullName role status isBanned');

    // For each contact, get the last message
    const conversations = await Promise.all(contacts.map(async (contact) => {
      const lastMessage = await Message.findOne({
        $or: [
          { sender_id: userId, receiver_id: contact._id },
          { sender_id: contact._id, receiver_id: userId }
        ]
      }).sort({ created_at: -1 });

      const unreadCount = await Message.countDocuments({
        sender_id: contact._id,
        receiver_id: userId,
        read: false
      });

      return {
        contact,
        lastMessage,
        unreadCount
      };
    }));

    res.json(conversations.sort((a, b) => {
      const dateA = a.lastMessage?.created_at || 0;
      const dateB = b.lastMessage?.created_at || 0;
      return (dateB as any) - (dateA as any);
    }));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessagesBetweenUsers = async (req: any, res: Response) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;
    const { orderId } = req.query;

    const query: any = {
      $or: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId }
      ]
    };

    if (orderId) {
      query.order_id = orderId;
    }

    const messages = await Message.find(query).sort({ created_at: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { sender_id: otherUserId, receiver_id: userId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { receiver_id, content, order_id, order_type } = req.body;
    const sender_id = req.user.id;

    const newMessage = await Message.create({
      sender_id,
      receiver_id,
      content,
      order_id,
      order_type
    });

    // Populate sender info for the real-time update
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender_id', 'username fullName role');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      // Emit to the specific receiver's "room" or just broadcast and let clients filter
      // For simplicity, broadcast a global 'new_message' but in production use private rooms
      io.emit('new_message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSupportAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await User.findOne({ role: 'Admin' }).select('_id username fullName');
    if (!admin) return res.status(404).json({ error: 'No admin available for support' });
    res.json(admin);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
