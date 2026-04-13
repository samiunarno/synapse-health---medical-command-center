import express from 'express';
import { getBeds, assignBed, dischargePatient, reassignBed } from '../controllers/bedController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getBeds);
router.post('/assign', authenticate, authorize(['Admin', 'Staff']), assignBed);
router.post('/discharge', authenticate, authorize(['Admin', 'Staff', 'Doctor']), dischargePatient);
router.post('/reassign', authenticate, authorize(['Admin', 'Staff']), reassignBed);

export default router;
