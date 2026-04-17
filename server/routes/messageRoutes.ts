import express from 'express';
import { 
  getConversations, 
  getMessagesBetweenUsers, 
  sendMessage,
  getSupportAdmin
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/support-admin', authenticate, getSupportAdmin);
router.get('/:otherUserId', authenticate, getMessagesBetweenUsers);
router.post('/', authenticate, sendMessage);

export default router;
