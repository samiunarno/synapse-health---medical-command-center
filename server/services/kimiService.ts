import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY || "",
  baseURL: "https://api.moonshot.cn/v1",
});

export const getChatResponse = async (message: string, history: { role: string, content: string }[]) => {
  try {
    const response = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: "You are Synapse Health, a helpful virtual assistant for a modern hospital management system. You can help with hospital services, appointments, policies, and patient records. Keep your responses concise and professional.",
        },
        ...history.map(h => ({
          role: (h.role === "model" ? "assistant" : h.role) as "user" | "assistant" | "system",
          content: h.content
        })),
        { role: "user", content: message }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Kimi API Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

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
      
      Please provide a structured response in JSON format with the following fields:
      - suggestions: An array of objects with { title, description, type (Diagnosis Suggestion, Treatment Guideline, Preventive Care) }
      - alerts: An array of objects with { title, description, severity (Low, Medium, High) }
      - summary: A brief clinical summary of the patient's current state.
      
      Keep the suggestions practical, evidence-based (e.g., mention guidelines like ADA, AHA, etc.), and professional.
      Return ONLY the JSON object.
    `;

    const response = await client.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        { role: "system", content: "You are a Clinical Decision Support System (CDSS). Return ONLY a JSON object." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (content) {
      return JSON.parse(content);
    }
    throw new Error("Invalid JSON response from Kimi AI");
  } catch (error) {
    console.error("CDSS Kimi Error:", error);
    return {
      suggestions: [
        { title: "Review Patient Profile", description: "Insufficient data for detailed clinical analysis.", type: "Preventive Care" }
      ],
      alerts: [],
      summary: "Clinical decision support is currently limited due to technical issues or insufficient data."
    };
  }
};
