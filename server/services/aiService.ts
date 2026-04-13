import OpenAI from 'openai';

// DeepSeek API Configuration
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.DEEPSEEK_API_KEY?.startsWith('nvapi-') 
    ? 'https://integrate.api.nvidia.com/v1' 
    : 'https://api.deepseek.com',
});

// Kimi (Moonshot) API Configuration
const kimi = new OpenAI({
  apiKey: process.env.KIMI_API_KEY || '',
  baseURL: 'https://api.moonshot.cn/v1',
});

// Helper to get the active AI client
const getAIClient = () => {
  if (process.env.DEEPSEEK_API_KEY) {
    const isNvidia = process.env.DEEPSEEK_API_KEY.startsWith('nvapi-');
    return { 
      client: deepseek, 
      model: isNvidia ? 'deepseek-ai/deepseek-r1' : 'deepseek-chat' 
    };
  }
  if (process.env.KIMI_API_KEY) return { client: kimi, model: 'moonshot-v1-8k' };
  return null;
};

export const getAIResponse = async (message: string, systemPrompt?: string) => {
  try {
    const ai = getAIClient();
    if (!ai) throw new Error('No AI API Key configured (DeepSeek or Kimi)');

    const isNvidia = process.env.DEEPSEEK_API_KEY?.startsWith('nvapi-');

    const response = await ai.client.chat.completions.create({
      model: ai.model,
      messages: [
        { role: 'system', content: systemPrompt || 'You are Synapse Health AI assistant. Always respond in valid JSON if requested.' },
        { role: 'user', content: message },
      ],
      // NVIDIA NIM might not support response_format: { type: 'json_object' } for all models
      ...(isNvidia ? {} : { response_format: { type: 'json_object' } }),
    });

    let content = response.choices[0].message.content || '';
    
    // Clean up potential markdown code blocks if the model returns them
    if (content.includes('```json')) {
      content = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      content = content.split('```')[1].split('```')[0].trim();
    }

    return content;
  } catch (error: any) {
    console.error('AI Service Error:', error);
    throw error;
  }
};

export const analyzePrescriptionAI = async (imageData: string) => {
  try {
    const ai = getAIClient();
    if (!ai) throw new Error('No AI API Key configured');

    // Note: DeepSeek-V3/R1 might not support vision via OpenAI SDK in the same way yet, 
    // but some models do. If vision is not supported, we might need to use a different approach.
    // However, for this task, we will assume a text-based extraction if vision fails or use a vision-capable model if available.
    
    const response = await ai.client.chat.completions.create({
      model: ai.model, // Use vision model if available, e.g., 'deepseek-vision'
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract the medicine names, dosages, and instructions from this prescription image. Also, provide a simplified explanation of what each medicine is for and check for any potential common drug-drug interactions if multiple medicines are listed. Return the result in a structured JSON format with keys: medicines (array of {name, dosage, instructions, purpose}), interactions (array of {severity, description}), and summary (string).' },
            { type: 'image_url', image_url: { url: imageData } }
          ] as any,
        },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error: any) {
    console.error('Prescription Analysis Error:', error);
    throw error;
  }
};

export const analyzeMoodAI = async (journal: string, mood: number) => {
  const prompt = `Perform sentiment analysis on this journal entry: "${journal}". The user rated their mood as ${mood}/3 (1=Frown, 2=Meh, 3=Smile). 
  Provide a structured analysis including:
  1. Emotional tone
  2. Key stressors or positives identified
  3. Actionable advice for mental well-being
  4. A recommendation on whether they should consult a specialist (if signs of high stress/depression are present).
  Return in JSON format with keys: tone, insights (array), advice (array), specialistNeeded (boolean), recommendation (string).`;

  const response = await getAIResponse(prompt, 'You are a compassionate mental health assistant.');
  return JSON.parse(response || '{}');
};

export const generateNutritionPlanAI = async (conditions: string[], preferences: string[]) => {
  const prompt = `Generate a personalized 1-day meal plan for a user with these conditions: ${conditions.join(', ')}. 
  Preferences: ${preferences.join(', ')}. 
  Focus on healthy options.
  Include Breakfast, Lunch, Dinner, and Snacks. 
  Provide nutritional focus for each meal.
  Return in JSON format with keys: dailyFocus, meals (array of {type, name, ingredients, nutritionalValue}), tips (array).`;

  const response = await getAIResponse(prompt, 'You are a professional clinical nutritionist.');
  return JSON.parse(response || '{}');
};

export const checkSymptomsAI = async (symptoms: string) => {
  const prompt = `The patient reports the following symptoms: "${symptoms}". 
  Provide a structured analysis including:
  1. Potential causes (disclaimer: not a diagnosis)
  2. Recommended specialist doctor type (e.g., Cardiologist, Neurologist)
  3. Urgency level (Low, Medium, High)
  4. Immediate advice or first aid (if applicable)
  Return in JSON format with keys: potentialCauses (array), recommendedSpecialist (string), urgency (string), advice (string).`;

  const response = await getAIResponse(prompt, 'You are a professional medical triage assistant.');
  return JSON.parse(response || '{}');
};

export const analyzeLabReport = async (reportDetails: string) => {
  const prompt = `Analyze the following lab report results: "${reportDetails}". 
  Identify which values are outside the normal range (High or Low). 
  Explain in simple terms what these results mean for the patient's health.
  Provide actionable advice (e.g., dietary changes, lifestyle adjustments).
  Return in JSON format with keys: abnormalValues (array of {parameter, value, range, status, meaning}), summary (string), advice (array).`;

  const response = await getAIResponse(prompt, 'You are a professional medical lab report interpreter.');
  return JSON.parse(response || '{}');
};
