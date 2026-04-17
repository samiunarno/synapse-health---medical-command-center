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
    const { message, systemPrompt, lang } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const response = await getAIResponse(message, systemPrompt, false, lang);
    res.json({ response });
  } catch (error: any) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get AI response' });
  }
};

export const getHealthInsights = async (req: Request, res: Response) => {
  try {
    const { patientData, lang } = req.body;
    const response = await getHealthInsightsAI(patientData, lang);
    res.json(response);
  } catch (error: any) {
    console.error('Health Insights Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const analyzeMood = async (req: Request, res: Response) => {
  try {
    const { journal, mood, lang } = req.body;
    const response = await analyzeMoodAI(journal, mood, lang);
    res.json(response);
  } catch (error: any) {
    console.error('Mood Analysis Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const generateNutritionPlan = async (req: Request, res: Response) => {
  try {
    const { conditions, preferences, lang } = req.body;
    const response = await generateNutritionPlanAI(conditions, preferences, lang);
    res.json(response);
  } catch (error: any) {
    console.error('Nutrition Plan Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const checkSymptoms = async (req: Request, res: Response) => {
  try {
    const { symptoms, lang } = req.body;
    const response = await checkSymptomsAI(symptoms, lang);
    res.json(response);
  } catch (error: any) {
    console.error('Symptom Check Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const analyzeLab = async (req: Request, res: Response) => {
  try {
    const { reportDetails, lang } = req.body;
    const response = await analyzeLabReport(reportDetails, lang);
    res.json(response);
  } catch (error: any) {
    console.error('Lab Analysis Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const analyzePrescription = async (req: Request, res: Response) => {
  try {
    const { imageData, lang } = req.body;
    const response = await analyzePrescriptionAI(imageData, lang);
    res.json(response);
  } catch (error: any) {
    console.error('Prescription Analysis Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const suggestDoctor = async (req: Request, res: Response) => {
  try {
    const { symptoms, doctors, lang } = req.body;
    const response = await suggestDoctorAI(symptoms, doctors, lang);
    res.json(response);
  } catch (error: any) {
    console.error('Doctor Suggestion Controller Error:', error);
    res.status(500).json({ error: error.message });
  }
};
