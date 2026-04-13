import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
      
      If information is missing, use your medical knowledge to suggest the most likely diagnosis and standard medications for the symptoms described, but mark them as "Suggested".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            prescribedMedications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  duration: { type: Type.STRING }
                },
                required: ["name", "dosage", "frequency", "duration"]
              }
            }
          },
          required: ["summary", "diagnosis", "prescribedMedications"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating consultation summary:", error);
    throw error;
  }
};
