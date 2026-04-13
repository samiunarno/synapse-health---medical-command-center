import express from 'express';
import { 
  getMedicines, 
  createMedicine, 
  getPrescriptions, 
  dispensePrescription, 
  updateStock, 
  updateMedicine,
  createMedicineOrder,
  getMyMedicineOrders,
  getAllMedicineOrders,
  updateMedicineOrderStatus,
  checkInteractions,
  simulateRider
} from '../controllers/pharmacyController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/medicines', authenticate, getMedicines);
router.post('/medicines', authenticate, authorize(['Admin', 'Staff']), createMedicine);
router.put('/medicines/:id', authenticate, authorize(['Admin', 'Staff']), updateMedicine);
router.put('/medicines/:id/stock', authenticate, authorize(['Admin', 'Staff']), updateStock);
router.get('/prescriptions', authenticate, getPrescriptions);
router.post('/prescriptions/:id/dispense', authenticate, authorize(['Admin', 'Staff']), dispensePrescription);
router.post('/check-interactions', authenticate, checkInteractions);

// Medicine Orders
router.post('/orders', authenticate, authorize(['Patient']), createMedicineOrder);
router.get('/orders/me', authenticate, authorize(['Patient', 'Hospital']), getMyMedicineOrders);
router.get('/orders/all', authenticate, authorize(['Admin', 'Staff', 'Pharmacist', 'Rider', 'Pharmacy']), getAllMedicineOrders);
router.put('/orders/:id/status', authenticate, authorize(['Admin', 'Staff', 'Pharmacist', 'Rider', 'Pharmacy']), updateMedicineOrderStatus);
router.post('/orders/:id/simulate', authenticate, simulateRider);

export default router;
