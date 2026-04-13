import express from 'express';
import { getPatientInsights } from '../controllers/cdssController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// CDSS Routes
router.get('/insights/:patientId', authenticate, authorize(['Admin', 'Doctor']), getPatientInsights);

export default router;
