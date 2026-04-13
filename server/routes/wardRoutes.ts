import express from 'express';
import { getWards, createWard, createBed, getWardBedStats } from '../controllers/wardController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getWards);
router.get('/stats', authenticate, getWardBedStats);
router.post('/', authenticate, authorize(['Admin']), createWard);
router.post('/beds', authenticate, authorize(['Admin']), createBed);

export default router;
