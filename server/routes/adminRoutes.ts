import express from 'express';
import { 
  getPendingUsers, 
  approveUser, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  handleAccountRequest,
  banUser
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/pending-users', authenticate, authorize(['Admin']), getPendingUsers);
router.post('/approve-user/:id', authenticate, authorize(['Admin']), approveUser);
router.get('/users', authenticate, authorize(['Admin', 'Staff', 'Doctor', 'Lab']), getAllUsers);
router.post('/users', authenticate, authorize(['Admin']), createUser);
router.put('/users/:id', authenticate, authorize(['Admin']), updateUser);
router.delete('/users/:id', authenticate, authorize(['Admin']), deleteUser);
router.post('/handle-account-request/:id', authenticate, authorize(['Admin']), handleAccountRequest);
router.post('/ban-user/:id', authenticate, authorize(['Admin']), banUser);

export default router;
