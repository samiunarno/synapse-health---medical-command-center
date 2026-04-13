import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { publishReport, getMyReports, getAllReports, updateReportStatus } from '../controllers/labReportController';

const router = express.Router();

router.post('/publish', authenticate, authorize(['Lab', 'Admin']), publishReport);
router.get('/my-reports', authenticate, authorize(['Patient']), getMyReports);
router.get('/all', authenticate, authorize(['Lab', 'Admin']), getAllReports);
router.patch('/update-status/:id', authenticate, authorize(['Lab', 'Admin']), updateReportStatus);
router.put('/:id', authenticate, authorize(['Lab', 'Admin']), updateReportStatus);

export default router;
