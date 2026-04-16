import express from 'express';
import { getMyInventory, addMedicineToInventory, updateInventoryStock, deleteFromInventory } from '../controllers/medicineInventoryController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/me', authenticate, getMyInventory);
router.post('/add', authenticate, addMedicineToInventory);
router.patch('/:id/stock', authenticate, updateInventoryStock);
router.delete('/:id', authenticate, deleteFromInventory);

export default router;
