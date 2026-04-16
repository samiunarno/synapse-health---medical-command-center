import express from 'express';
import { 
  register, 
  login, 
  getPendingUsers, 
  approveUser, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  uploadIdCard, 
  requestAccountAction, 
  handleAccountRequest,
  banUser,
  rateDoctor,
  updateProfile,
  getQrToken,
  qrLogin,
  getProfile
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/qr-login', qrLogin);

// User Routes
router.get('/profile', authenticate, getProfile);
router.get('/qr-token', authenticate, getQrToken);
router.post('/upload-id', authenticate, uploadIdCard);
router.post('/request-account-action', authenticate, requestAccountAction);
router.put('/profile', authenticate, updateProfile);
router.post('/rate-doctor', authenticate, rateDoctor);
router.get('/users', authenticate, getAllUsers);

export default router;
