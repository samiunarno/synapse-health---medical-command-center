import express from 'express';
import MembershipRequest from '../models/MembershipRequest';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Create a membership request
router.post('/request', authenticate, async (req: any, res) => {
  try {
    const { planName, amount, paymentMethod } = req.body;
    const newRequest = new MembershipRequest({
      userId: req.user.id,
      planName,
      amount,
      paymentMethod
    });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all pending requests
router.get('/requests', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const requests = await MembershipRequest.find().populate('userId', 'username email fullName');
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Approve request
router.post('/approve/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const request = await MembershipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'Approved';
    await request.save();

    // Update user membership
    await User.findByIdAndUpdate(request.userId, { membership: request.planName });

    res.json({ message: 'Membership approved', request });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Reject request
router.post('/reject/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const request = await MembershipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'Rejected';
    await request.save();

    res.json({ message: 'Membership rejected', request });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
