import OpenAI from 'openai';

// DeepSeek API Configuration
const getBaseURL = () => {
  const key = process.env.DEEPSEEK_API_KEY || '';
  if (key.startsWith('nvapi-')) return 'https://integrate.api.nvidia.com/v1';
  if (process.env.DEEPSEEK_BASE_URL) return process.env.DEEPSEEK_BASE_URL;
  return 'https://api.deepseek.com';
};

let deepseekClient: OpenAI | null = null;

const getDeepseekClient = () => {
  if (!deepseekClient) {
    deepseekClient = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: getBaseURL(),
    });
  }
  return deepseekClient;
};

// Helper to get the active AI client
const getAIClient = () => {
  const key = process.env.DEEPSEEK_API_KEY;
  if (key) {
    const isNvidia = key.startsWith('nvapi-');
    return { 
      type: 'openai',
      client: getDeepseekClient(), 
      model: isNvidia ? 'deepseek-ai/deepseek-r1' : (process.env.DEEPSEEK_MODEL || 'deepseek-chat')
    };
  }
  return null;
};

export const getAIResponse = async (message: string, systemPrompt?: string, jsonMode: boolean = false) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      console.error('❌ AI Configuration Error: DEEPSEEK_API_KEY is missing');
      throw new Error('AI Service is not configured. Please add DEEPSEEK_API_KEY to environment variables.');
    }

    console.log(`🤖 AI Request: Model=${ai.model}, BaseURL=${getBaseURL()}`);
    if (!process.env.DEEPSEEK_API_KEY) {
      console.warn('⚠️ DEEPSEEK_API_KEY is not set in environment variables.');
    }

    const isNvidia = process.env.DEEPSEEK_API_KEY?.startsWith('nvapi-');
    try {
      const response = await (ai.client as OpenAI).chat.completions.create({
        model: ai.model!,
        messages: [
          { role: 'system', content: systemPrompt || 'You are Synapse Health AI assistant.' },
          { role: 'user', content: message },
        ],
        ...(jsonMode && !isNvidia ? { response_format: { type: 'json_object' } } : {}),
      });

      let content = response.choices[0].message.content || '';
      console.log('✅ AI Response received successfully');
      
      if (jsonMode) {
        content = content.replace(/```json\n?|```\n?/g, '').trim();
        
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          content = content.substring(firstBrace, lastBrace + 1);
        }
      }
      
      return content;
    } catch (apiError: any) {
      console.error('❌ OpenAI/DeepSeek API Call Failed:', {
        status: apiError.status,
        message: apiError.message,
        data: apiError.response?.data
      });
      throw apiError;
    }
  } catch (error: any) {
    console.error('❌ DeepSeek API Error:', error.response?.data || error.message || error);
    
    // Graceful fallback for development if key is missing
    if (!process.env.DEEPSEEK_API_KEY) {
      return jsonMode ? '{"summary": "根据患者数据分析，目前状态稳定，但需关注血压波动。", "suggestions": [{"title": "复查建议", "description": "建议一周后复查心电图和血压。", "type": "Preventive Care"}], "alerts": [{"title": "轻度高血压", "description": "患者近期血压偏高，请注意饮食控制。", "severity": "Medium"}], "insights": [], "recommendations": [], "potentialCauses": [], "abnormalValues": [], "medicines": [], "interactions": [], "suggestedDoctorId": "123", "reasoning": "根据症状，建议咨询心内科专家。", "specialtyRecommended": "心内科"}' : "AI 服务未配置。请在环境变量中添加 DEEPSEEK_API_KEY。";
    }

    if (error.status === 401) throw new Error('Invalid DeepSeek API Key');
    if (error.status === 402) throw new Error('DeepSeek API Insufficient Balance');
    if (error.status === 429) throw new Error('DeepSeek API Rate Limit Exceeded');
    throw new Error(`AI Service Error: ${error.message || 'Unknown error'}`);
  }
};

export const getCDSSInsights = async (patientData: any, medicalRecords: any[], labReports: any[]) => {
  const prompt = `
    You are a Clinical Decision Support System (CDSS) for Synapse Health.
    Your goal is to provide evidence-based clinical insights, suggestions, and alerts for a doctor based on patient data.
    
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

  const response = await getAIResponse(prompt, 'You are a Clinical Decision Support System (CDSS). Return ONLY a JSON object.', true);
  return JSON.parse(response || '{}');
};

export const suggestDoctorAI = async (symptoms: string, doctors: any[]) => {
  const prompt = `
    Based on the following symptoms, suggest the most appropriate doctor from the provided list.
    Explain why this doctor is the best fit.
    
    Symptoms: ${symptoms}
    
    Available Doctors:
    ${JSON.stringify(doctors.map(d => ({ id: d._id, name: d.fullName || d.username, specialization: d.doctorType || d.specialization })), null, 2)}
    
    Return a JSON object with:
    - suggestedDoctorId: string (the ID of the doctor)
    - reasoning: string
    - specialtyRecommended: string
  `;

  const response = await getAIResponse(prompt, 'You are a medical triage assistant. Match patient symptoms to the correct medical specialty. Return ONLY a JSON object.', true);
  return JSON.parse(response || '{}');
};

export const analyzePrescriptionAI = async (imageData: string) => {
  try {
    const ai = getAIClient();
    if (!ai) throw new Error('No AI API Key configured');

    // Note: Standard DeepSeek models (chat/reasoner) do not support vision yet.
    // If using Nvidia NIM with a vision model, this might work.
    // Otherwise, we fallback to a text-based prompt or warn the user.
    
    const response = await (ai.client as OpenAI).chat.completions.create({
      model: ai.model!,
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
    console.error('Prescription Analysis Error:', error.message);
    // Fallback for models that don't support vision
    if (error.message.includes('vision') || error.message.includes('image')) {
      throw new Error('Current AI model does not support image analysis. Please use a vision-capable model.');
    }
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

  const response = await getAIResponse(prompt, 'You are a compassionate mental health assistant.', true);
  return JSON.parse(response || '{}');
};

export const generateNutritionPlanAI = async (conditions: string[], preferences: string[]) => {
  const prompt = `Generate a personalized 1-day meal plan for a user with these conditions: ${conditions.join(', ')}. 
  Preferences: ${preferences.join(', ')}. 
  Focus on healthy options.
  Include Breakfast, Lunch, Dinner, and Snacks. 
  Provide nutritional focus for each meal.
  Return in JSON format with keys: dailyFocus, meals (array of {type, name, ingredients, nutritionalValue}), tips (array).`;

  const response = await getAIResponse(prompt, 'You are a professional clinical nutritionist.', true);
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

  const response = await getAIResponse(prompt, 'You are a professional medical triage assistant.', true);
  return JSON.parse(response || '{}');
};

export const analyzeLabReport = async (reportDetails: string) => {
  const prompt = `Analyze the following lab report results: "${reportDetails}". 
  Identify which values are outside the normal range (High or Low). 
  Explain in simple terms what these results mean for the patient's health.
  Provide actionable advice (e.g., dietary changes, lifestyle adjustments).
  Return in JSON format with keys: abnormalValues (array of {parameter, value, range, status, meaning}), summary (string), advice (array).`;

  const response = await getAIResponse(prompt, 'You are a professional medical lab report interpreter.', true);
  return JSON.parse(response || '{}');
};

export const getHealthInsightsAI = async (patientData: any) => {
  const prompt = `
    Analyze the following patient data and provide 3 personalized health insights and 3 actionable recommendations.
    Return the response in JSON format with keys: insights (array of {category, title, description}), recommendations (array of {priority, title, description}), and disclaimer (string).
    
    Patient Data:
    ${JSON.stringify(patientData, null, 2)}
  `;

  const response = await getAIResponse(prompt, 'You are a professional medical AI assistant. Provide empathetic, accurate, and helpful health insights based on patient data.', true);
  return JSON.parse(response || '{}');
};
