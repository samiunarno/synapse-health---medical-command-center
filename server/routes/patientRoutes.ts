import express from 'express';
import { getPatients, createPatient, updatePatient, deletePatient, getPatientByUserId } from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getPatients);
router.get('/me', authenticate, getPatientByUserId);
router.post('/', authenticate, authorize(['Admin', 'Staff']), createPatient);
router.put('/:id', authenticate, authorize(['Admin', 'Staff', 'Doctor']), updatePatient);
router.delete('/:id', authenticate, authorize(['Admin']), deletePatient);

export default router;
