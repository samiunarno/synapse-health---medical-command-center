import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { analyzeDocumentWithAI } from '../services/verificationService';

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'synapse-verification',
    allowed_formats: ['jpg', 'png', 'pdf']
  } as any
});

const upload = multer({ storage: storage });

// Upload Verification Document
router.post('/upload', authenticate, upload.single('document'), async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const documentUrl = req.file.path;
    const documentType = req.body.type || 'License';

    user.verificationDocuments.push({
      url: documentUrl,
      type: documentType,
      uploadedAt: new Date()
    });

    user.status = 'Pending'; // Reset to pending if it was rejected or banned
    await user.save();

    // Trigger AI Analysis asynchronously
    analyzeDocumentWithAI(documentUrl, user.role).then(async (report) => {
      user.aiVerificationReport = JSON.stringify(report);
      await user.save();
    });

    res.json({ message: 'Document uploaded successfully. AI analysis in progress.', url: documentUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get User Verification Status
router.get('/status', authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select('status verificationDocuments aiVerificationReport banReason createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const registrationDate = new Date(user.createdAt);
    const deadline = new Date(registrationDate.getTime() + 24 * 60 * 60 * 1000);
    const isPastDeadline = new Date() > deadline;

    res.json({
      status: user.status,
      documents: user.verificationDocuments,
      aiReport: user.aiVerificationReport ? JSON.parse(user.aiVerificationReport) : null,
      banReason: user.banReason,
      deadline: deadline.toISOString(),
      isPastDeadline
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Admin: Get All Pending Verifications
router.get('/admin/pending', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const pendingUsers = await User.find({
      role: { $in: ['Hospital', 'Pharmacy', 'Rider', 'Lab', 'Driver'] },
      $or: [
        { verificationDocuments: { $not: { $size: 0 } }, status: 'Pending' },
        { status: 'Banned' }
      ]
    }).select('username email role status verificationDocuments aiVerificationReport createdAt');
    
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
});

// Admin: Approve/Reject Verification
router.post('/admin/verify/:userId', authenticate, authorize(['Admin']), async (req, res) => {
  const { status, reason } = req.body; // status: 'Approved' | 'Rejected' | 'Banned'
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.status = status;
    if (status === 'Banned' || status === 'Rejected') {
      user.isBanned = status === 'Banned';
      user.banReason = reason;
    } else {
      user.isBanned = false;
      user.banReason = undefined;
    }

    await user.save();
    res.json({ message: `User verification ${status.toLowerCase()} successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update verification status' });
  }
});

export default router;
