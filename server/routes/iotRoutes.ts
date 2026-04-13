import express from 'express';
import { getDevices, getMyDevices, updateDeviceReading, seedDevices } from '../controllers/iotController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getDevices);
router.get('/me', authenticate, getMyDevices);
router.post('/reading', authenticate, updateDeviceReading);
router.post('/seed', authenticate, seedDevices);

export default router;
