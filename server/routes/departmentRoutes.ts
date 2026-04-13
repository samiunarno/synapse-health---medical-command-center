import express from 'express';
import { getDepartments, createDepartment } from '../controllers/departmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getDepartments);
router.post('/', authenticate, authorize(['Admin']), createDepartment);

export default router;
