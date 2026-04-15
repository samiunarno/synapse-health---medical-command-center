import { Request, Response } from 'express';
import { 
  getAIResponse, 
  analyzeMoodAI, 
  generateNutritionPlanAI, 
  checkSymptomsAI, 
  analyzeLabReport,
  analyzePrescriptionAI,
  getHealthInsightsAI,
  suggestDoctorAI
} from '../services/aiService';

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, systemPrompt } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const response = await getAIResponse(message, systemPrompt);
    res.json({ response });
  } catch (error: any) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get AI response' });
  }
};

export const getHealthInsights = async (req: Request, res: Response) => {
  try {
    const { patientData } = req.body;
    const response = await getHealthInsightsAI(patientData);
    res.json(response);
  } catch (error: any) {
    console.error('Health Insights Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const analyzeMood = async (req: Request, res: Response) => {
  try {
    const { journal, mood } = req.body;
    const response = await analyzeMoodAI(journal, mood);
    res.json(response);
  } catch (error: any) {
    console.error('Mood Analysis Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const generateNutritionPlan = async (req: Request, res: Response) => {
  try {
    const { conditions, preferences } = req.body;
    const response = await generateNutritionPlanAI(conditions, preferences);
    res.json(response);
  } catch (error: any) {
    console.error('Nutrition Plan Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const checkSymptoms = async (req: Request, res: Response) => {
  try {
    const { symptoms } = req.body;
    const response = await checkSymptomsAI(symptoms);
    res.json(response);
  } catch (error: any) {
    console.error('Symptom Check Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const analyzeLab = async (req: Request, res: Response) => {
  try {
    const { reportDetails } = req.body;
    const response = await analyzeLabReport(reportDetails);
    res.json(response);
  } catch (error: any) {
    console.error('Lab Analysis Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const analyzePrescription = async (req: Request, res: Response) => {
  try {
    const { imageData } = req.body;
    const response = await analyzePrescriptionAI(imageData);
    res.json(response);
  } catch (error: any) {
    console.error('Prescription Analysis Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const suggestDoctor = async (req: Request, res: Response) => {
  try {
    const { symptoms, doctors } = req.body;
    const response = await suggestDoctorAI(symptoms, doctors);
    res.json(response);
  } catch (error: any) {
    console.error('Doctor Suggestion Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};
