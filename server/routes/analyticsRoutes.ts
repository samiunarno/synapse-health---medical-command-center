import express from 'express';
import { getStats, getInpatientTrends, getPredictiveData, getSystemMonitor, getActivityStream, getAIInsights, getPublicStats, getPatientAIInsights } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/public-stats', getPublicStats);
router.get('/stats', authenticate, authorize(['Admin', 'Staff']), getStats);
router.get('/inpatient-trends', authenticate, authorize(['Admin', 'Staff']), getInpatientTrends);
router.get('/predictive-data', authenticate, authorize(['Admin', 'Staff']), getPredictiveData);
router.get('/system-monitor', authenticate, authorize(['Admin', 'Staff']), getSystemMonitor);
router.get('/activity-stream', authenticate, authorize(['Admin', 'Staff']), getActivityStream);
router.get('/ai-insights', authenticate, authorize(['Admin', 'Staff']), getAIInsights);
router.get('/system-insights', authenticate, authorize(['Admin', 'Staff']), getAIInsights);
router.get('/patient-ai-insights', authenticate, authorize(['Patient']), getPatientAIInsights);

export default router;
