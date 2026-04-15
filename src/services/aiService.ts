import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getAIResponse = async (message: string, systemPrompt?: string) => {
  try {
    const response = await axios.post('/api/chatbot/chat', {
      message,
      systemPrompt
    }, getAuthHeaders());
    return response.data.response;
  } catch (error) {
    console.error('AI Response Error:', error);
    throw error;
  }
};

export const getCDSSInsights = async (patientData: any, medicalRecords: any[], labReports: any[]) => {
  try {
    // Note: The backend doesn't have a specific CDSS endpoint in chatbotRoutes, 
    // but we can use the chat endpoint with a specific prompt, or if there's another endpoint we can use it.
    // For now, we'll use the chat endpoint to simulate CDSS.
    const prompt = `
      Patient Data:
      ${JSON.stringify(patientData, null, 2)}
      
      Medical Records:
      ${JSON.stringify(medicalRecords, null, 2)}
      
      Lab Reports:
      ${JSON.stringify(labReports, null, 2)}
      
      Return a JSON object with:
      - suggestions: Array of { title, description, type (Diagnosis Suggestion, Treatment Guideline, Preventive Care) }
      - alerts: Array of { title, description, severity (Low, Medium, High) }
      - summary: A brief clinical summary of the patient's current state.
    `;
    const response = await axios.post('/api/chatbot/chat', {
      message: prompt,
      systemPrompt: "You are a Clinical Decision Support System (CDSS). Return ONLY a JSON object."
    }, getAuthHeaders());
    
    let content = response.data.response;
    content = content.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(content || '{}');
  } catch (error) {
    console.error("AI CDSS Error:", error);
    throw error;
  }
};

export const analyzeMood = async (journal: string, mood: number) => {
  try {
    const response = await axios.post('/api/chatbot/analyze-mood', {
      journal,
      mood
    }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("AI Mood Analysis Error:", error);
    throw error;
  }
};

export const generateNutritionPlan = async (conditions: string[], preferences: string[]) => {
  try {
    const response = await axios.post('/api/chatbot/nutrition-plan', {
      conditions,
      preferences
    }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("AI Nutrition Plan Error:", error);
    throw error;
  }
};

export const analyzeLabReport = async (reportDetails: string) => {
  try {
    const response = await axios.post('/api/chatbot/analyze-lab', {
      reportDetails
    }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("AI Lab Report Error:", error);
    throw error;
  }
};

export const getHealthInsights = async (patientData: any) => {
  try {
    const response = await axios.post('/api/chatbot/health-insights', {
      patientData
    }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("AI Health Insights Error:", error);
    return null;
  }
};

export const suggestDoctor = async (symptoms: string, doctors: any[]) => {
  try {
    const response = await axios.post('/api/chatbot/suggest-doctor', {
      symptoms,
      doctors
    }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("AI Doctor Suggestion Error:", error);
    return null;
  }
};

export const analyzePrescription = async (imageData: string) => {
  try {
    const response = await axios.post('/api/chatbot/analyze-prescription', {
      imageData
    }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("AI Prescription Analysis Error:", error);
    throw error;
  }
};
