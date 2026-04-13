import express from 'express';
import { createAppointment, getMyAppointments, payAppointment, markDone } from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createAppointment);
router.get('/my', authenticate, getMyAppointments);
router.post('/:id/pay', authenticate, payAppointment);
router.post('/:id/done', authenticate, markDone);

export default router;
