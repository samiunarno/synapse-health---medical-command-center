import express from 'express';
import { bookLabAppointment, getMyLabAppointments, getAllLabAppointments, updateLabAppointmentStatus } from '../controllers/labAppointmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/book', authenticate, bookLabAppointment);
router.get('/me', authenticate, getMyLabAppointments);
router.get('/all', authenticate, authorize(['Admin', 'LabTechnician', 'Lab']), getAllLabAppointments);
router.put('/:id/status', authenticate, authorize(['Admin', 'LabTechnician', 'Lab']), updateLabAppointmentStatus);

export default router;
