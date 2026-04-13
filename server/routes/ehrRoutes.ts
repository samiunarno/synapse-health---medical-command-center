import express from 'express';
import { ehrService } from '../services/ehrService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/fhir/patient', authenticate, async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Patient name is required' });
    }

    const data = await ehrService.getPatientData(name);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
