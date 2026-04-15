import express from 'express';
import { 
  getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor, 
  getApprovedDoctors, updateDoctorProfile, getDoctorProfile, 
  getDoctorDashboardData, createPrescription, getPrescriptions, getMyPrescriptions,
  getCommissions, withdrawCommission
} from '../controllers/doctorController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getDoctors);
router.get('/approved', authenticate, getApprovedDoctors);
router.get('/profile', authenticate, authorize(['Doctor']), getDoctorProfile);
router.get('/dashboard-data', authenticate, authorize(['Doctor']), getDoctorDashboardData);
router.get('/commissions', authenticate, authorize(['Doctor']), getCommissions);
router.post('/withdraw', authenticate, authorize(['Doctor']), withdrawCommission);
router.get('/:id', authenticate, getDoctor);
router.put('/profile', authenticate, authorize(['Doctor']), updateDoctorProfile);

// Prescription Routes
router.post('/prescriptions', authenticate, authorize(['Doctor']), createPrescription);
router.get('/prescriptions', authenticate, authorize(['Doctor', 'Admin']), getPrescriptions);
router.get('/prescriptions/me', authenticate, authorize(['Patient']), getMyPrescriptions);

router.post('/', authenticate, authorize(['Admin']), createDoctor);
router.put('/:id', authenticate, authorize(['Admin']), updateDoctor);
router.delete('/:id', authenticate, authorize(['Admin']), deleteDoctor);

export default router;
