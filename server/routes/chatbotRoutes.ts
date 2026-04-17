import express from 'express';
import { 
  chat,
  getHealthInsights,
  analyzeMood,
  generateNutritionPlan,
  checkSymptoms,
  analyzeLab,
  analyzePrescription,
  suggestDoctor
} from '../controllers/chatbotController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public route for the landing page chatbot
router.post('/chat', chat);

// Protected routes for patient-specific data
router.post('/health-insights', authenticate, getHealthInsights);
router.post('/analyze-mood', authenticate, analyzeMood);
router.post('/nutrition-plan', authenticate, generateNutritionPlan);
router.post('/check-symptoms', authenticate, checkSymptoms);
router.post('/analyze-lab', authenticate, analyzeLab);
router.post('/analyze-prescription', authenticate, analyzePrescription);
router.post('/suggest-doctor', authenticate, suggestDoctor);

export default router;
