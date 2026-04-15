import { getAIResponse } from './aiService';

export interface ConsultationSummary {
  summary: string;
  diagnosis: string;
  prescribedMedications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
}

export const generateConsultationSummary = async (notes: string, chatHistory: any[]): Promise<ConsultationSummary> => {
  try {
    const chatContext = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    const prompt = `
      You are an AI Medical Scribe for Synapse Health. 
      Based on the following doctor's notes and chat history from a TeleHealth consultation, generate a professional summary.
      
      Doctor's Notes:
      ${notes || 'No specific notes provided.'}
      
      Chat History:
      ${chatContext || 'No chat history.'}
      
      Please provide:
      1. A concise summary of the consultation.
      2. A probable diagnosis based on the information.
      3. A list of prescribed medications with dosage, frequency, and duration.
      
      Return a JSON object with keys: summary, diagnosis, prescribedMedications (array of {name, dosage, frequency, duration}).
    `;

    const response = await getAIResponse(prompt, "You are a professional medical scribe. Return ONLY a JSON object.");
    return JSON.parse(response);
  } catch (error) {
    console.error("Error generating consultation summary:", error);
    throw error;
  }
};
