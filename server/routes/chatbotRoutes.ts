import express from 'express';
import { 
  getAIResponse, 
  analyzeMoodAI, 
  generateNutritionPlanAI, 
  checkSymptomsAI, 
  analyzeLabReport,
  analyzePrescriptionAI
} from '../services/aiService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;
    const response = await getAIResponse(message, systemPrompt);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-mood', async (req, res) => {
  try {
    const { journal, mood } = req.body;
    const response = await analyzeMoodAI(journal, mood);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/nutrition-plan', async (req, res) => {
  try {
    const { conditions, preferences } = req.body;
    const response = await generateNutritionPlanAI(conditions, preferences);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/check-symptoms', async (req, res) => {
  try {
    const { symptoms } = req.body;
    const response = await checkSymptomsAI(symptoms);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-lab', async (req, res) => {
  try {
    const { reportDetails } = req.body;
    const response = await analyzeLabReport(reportDetails);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-prescription', async (req, res) => {
  try {
    const { imageData } = req.body;
    const response = await analyzePrescriptionAI(imageData);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
