import express from 'express';
import { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
