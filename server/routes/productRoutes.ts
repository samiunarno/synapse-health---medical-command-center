import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only routes
router.post('/', authenticate, authorize(['Admin']), createProduct);
router.put('/:id', authenticate, authorize(['Admin']), updateProduct);
router.delete('/:id', authenticate, authorize(['Admin']), deleteProduct);

export default router;
