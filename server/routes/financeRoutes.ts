import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import RechargeRequest from '../models/RechargeRequest';
import User from '../models/User';

const router = express.Router();

// Get balance
router.get('/balance', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id).select('balance');
    res.json({ balance: user?.balance || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Request recharge
router.post('/recharge', authenticate, async (req: AuthRequest, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  try {
    const recharge = new RechargeRequest({
      userId: req.user?.id,
      amount,
    });
    await recharge.save();
    res.status(201).json({ message: 'Recharge request submitted for admin approval', recharge });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit recharge request' });
  }
});

// Admin view requests
router.get('/admin/recharge-requests', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const requests = await RechargeRequest.find().populate('userId', 'username fullName email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recharge requests' });
  }
});

// Admin action
router.post('/admin/recharge-action/:id', authenticate, authorize(['Admin']), async (req: AuthRequest, res) => {
  const { action } = req.body;
  const { id } = req.params;

  try {
    const request = await RechargeRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ error: 'Request already processed' });

    const finalStatus = action === 'approve' || action === 'Approved' ? 'Approved' : 'Rejected';

    request.status = finalStatus;
    request.adminActionBy = req.user?.id as any;
    await request.save();

    if (finalStatus === 'Approved') {
      await User.updateOne({ _id: request.userId }, { $inc: { balance: Number(request.amount) } });
    }

    res.json({ message: `Recharge request ${finalStatus.toLowerCase()}`, request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process recharge request' });
  }
});

export default router;
