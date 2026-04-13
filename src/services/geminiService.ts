import axios from 'axios';

const API_URL = '/api/chatbot';

export const getCDSSInsights = async (patientData: any, medicalRecords: any[], labReports: any[]) => {
  try {
    const prompt = `
      You are a Clinical Decision Support System (CDSS) for Synapse Health.
      Your goal is to provide evidence-based clinical insights, suggestions, and alerts for a doctor based on patient data.
      
      Patient Data:
      ${JSON.stringify(patientData, null, 2)}
      
      Medical Records:
      ${JSON.stringify(medicalRecords, null, 2)}
      
      Lab Reports:
      ${JSON.stringify(labReports, null, 2)}
    `;

    const response = await axios.post(`${API_URL}/chat`, { 
      message: prompt,
      systemPrompt: "You are a professional medical triage assistant. Return ONLY a JSON object."
    });

    return JSON.parse(response.data.response);
  } catch (error) {
    console.error("AI CDSS Error:", error);
    throw error;
  }
};

export const analyzeMood = async (journal: string, mood: number) => {
  try {
    const response = await axios.post(`${API_URL}/analyze-mood`, { journal, mood });
    return response.data;
  } catch (error) {
    console.error("AI Mood Analysis Error:", error);
    throw error;
  }
};

export const generateNutritionPlan = async (conditions: string[], preferences: string[]) => {
  try {
    const response = await axios.post(`${API_URL}/nutrition-plan`, { conditions, preferences });
    return response.data;
  } catch (error) {
    console.error("AI Nutrition Plan Error:", error);
    throw error;
  }
};

export const analyzeLabReport = async (reportDetails: string) => {
  try {
    const response = await axios.post(`${API_URL}/analyze-lab`, { reportDetails });
    return response.data;
  } catch (error) {
    console.error("AI Lab Report Error:", error);
    throw error;
  }
};
