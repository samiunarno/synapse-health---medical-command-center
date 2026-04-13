import OpenAI from "openai";

// Initialize the Kimi AI client (Moonshot AI)
const client = new OpenAI({
  apiKey: (import.meta as any).env.VITE_KIMI_API_KEY || "",
  baseURL: "https://api.moonshot.cn/v1",
  dangerouslyAllowBrowser: true
});

export const getHealthInsights = async (patientData: any) => {
  try {
    const prompt = `
      Analyze the following patient data and provide 3 personalized health insights and 3 actionable recommendations.
      Return the response in JSON format.
      
      Patient Data:
      ${JSON.stringify(patientData, null, 2)}
    `;

    const response = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        { role: "system", content: "You are a professional medical AI assistant. Provide empathetic, accurate, and helpful health insights based on patient data. Always include a disclaimer that this is not a substitute for professional medical advice. Return ONLY a JSON object." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from Kimi AI");
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Kimi Health Insights Error:", error);
    throw error;
  }
};

export const suggestDoctor = async (symptoms: string, doctors: any[]) => {
  try {
    const prompt = `
      Based on the following symptoms, suggest the most appropriate doctor from the provided list.
      Explain why this doctor is the best fit.
      Return the response in JSON format.
      
      Symptoms: ${symptoms}
      
      Available Doctors:
      ${JSON.stringify(doctors.map(d => ({ id: d._id, name: d.name, specialization: d.specialization })), null, 2)}
    `;

    const response = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        { role: "system", content: "You are a medical triage assistant. Match patient symptoms to the correct medical specialty. Return ONLY a JSON object." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from Kimi AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("Kimi Doctor Suggestion Error:", error);
    throw error;
  }
};

export const createChatSession = () => {
  // Kimi doesn't have a direct "chat session" object like the old Gemini SDK, 
  // so we'll return a helper that manages history if needed, 
  // or just use the client directly in components.
  return {
    sendMessage: async (message: string, history: any[] = []) => {
      const response = await client.chat.completions.create({
        model: "moonshot-v1-8k",
        messages: [
          { role: "system", content: "You are a helpful and professional healthcare assistant. You can answer general health questions, explain medical terms, and provide wellness tips. Always state that you are an AI and not a doctor. If a user describes an emergency, tell them to call emergency services immediately." },
          ...history,
          { role: "user", content: message }
        ]
      });
      return response.choices[0].message.content;
    }
  };
};
