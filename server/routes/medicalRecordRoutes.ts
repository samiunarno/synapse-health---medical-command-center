import express from 'express';
import { getMedicalRecords, createMedicalRecord, deleteMedicalRecord } from '../controllers/medicalRecordController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getMedicalRecords);
router.post('/', authenticate, authorize(['Admin', 'Doctor']), createMedicalRecord);
router.delete('/:id', authenticate, authorize(['Admin', 'Doctor']), deleteMedicalRecord);

export default router;
