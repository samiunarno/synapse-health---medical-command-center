import express from 'express';
import { getCommissions, withdrawCommission } from '../controllers/commissionController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, authorize(['Doctor', 'Pharmacy', 'Hospital', 'Lab', 'Admin']), getCommissions);
router.post('/withdraw', authenticate, authorize(['Doctor', 'Pharmacy', 'Hospital', 'Lab']), withdrawCommission);

export default router;
