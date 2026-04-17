import OpenAI from 'openai';

let aiClient: OpenAI | null = null;

const getAIClient = () => {
  // Use Zhipu AI (智谱) for native Chinese language capabilities and free GLM-4-Flash
  if (!aiClient) {
    const key = process.env.ZHIPU_API_KEY;
    if (key) {
      aiClient = new OpenAI({
        apiKey: key,
        baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
      });
    }
  }
  return aiClient;
};

// Robust helper to extract JSON from markdown or verbose responses
const extractJSON = (content: string): string => {
  if (!content) return '{}';
  
  // Try to find markdown json block first
  const match = content.match(/```(?:json|JSON)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    content = match[1];
  }

  const startObj = content.indexOf('{');
  const endObj = content.lastIndexOf('}');
  const startArr = content.indexOf('[');
  const endArr = content.lastIndexOf(']');

  let start = Infinity;
  let end = -1;

  if (startObj !== -1 && startObj < start) {
    start = startObj;
    end = endObj;
  }
  if (startArr !== -1 && startArr < start) {
    start = startArr;
    end = endArr;
  }

  if (start !== Infinity && end !== -1 && start < end) {
    return content.substring(start, end + 1);
  }

  // Fallback
  return content.trim();
};

export const getAIResponse = async (message: string, systemPrompt?: string, jsonMode: boolean = false, lang: string = 'zh') => {
  try {
    const ai = getAIClient();
    if (!ai) {
      console.error('❌ AI Configuration Error: ZHIPU_API_KEY is missing');
      throw new Error('AI Service is not configured. Please add ZHIPU_API_KEY to environment variables.');
    }

    const languageInstruction = lang === 'en' ? ' IMPORTANT: Respond in English.' : ' IMPORTANT: Respond in Chinese (Simplified).';
    const jsonInstruction = jsonMode ? ' You MUST respond with ONLY a valid JSON object or array, without any markdown formatting, explanations, or surrounding text.' : '';
    const finalSystemPrompt = (systemPrompt || 'You are Synapse Health AI assistant.') + languageInstruction + jsonInstruction;

    const response = await ai.chat.completions.create({
      model: 'glm-4-flash', // glm-4-flash is Zhipu's highly capable, 100% free model
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: message }
      ],
      // Zhipu's GLM-4-flash doesn't inherently enforce json_object response format the same way, but it follows system prompts well.
      // We will explicitly prompt it to return json if xml fails fallback.
    });

    let content = response.choices[0].message.content || '';
    
    // Robust JSON extraction
    if (jsonMode) {
      content = extractJSON(content);
    }
    
    return content;
  } catch (error: any) {
    console.error('❌ Zhipu API Error:', error.message || error);
    
    if (!process.env.ZHIPU_API_KEY) {
       return jsonMode ? '{"summary": "系统未检测到AI密钥", "suggestions": [], "alerts": [], "insights": [], "recommendations": [], "potentialCauses": [], "abnormalValues": [], "medicines": [], "interactions": [], "suggestedDoctorId": "123", "reasoning": "AI 配置缺失", "specialtyRecommended": "通科"}' : "AI 服务未配置。";
    }

    throw new Error(`AI Service Error: ${error.message || 'Unknown error'}`);
  }
};


export const getCDSSInsights = async (patientData: any, medicalRecords: any[], labReports: any[], lang: string = 'en') => {
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

  const response = await getAIResponse(prompt, 'You are a Clinical Decision Support System (CDSS). Return ONLY a JSON object.', true, lang);
  return JSON.parse(response || '{}');
};

export const suggestDoctorAI = async (symptoms: string, doctors: any[], lang: string = 'en') => {
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

  const response = await getAIResponse(prompt, 'You are a medical triage assistant. Match patient symptoms to the correct medical specialty. Return ONLY a JSON object.', true, lang);
  return JSON.parse(response || '{}');
};

export const analyzePrescriptionAI = async (imageData: string, lang: string = 'zh') => {
  try {
    const ai = getAIClient();
    if (!ai) throw new Error('No AI API Key configured');

    const languageInstruction = lang === 'en' ? ' IMPORTANT: Respond in English.' : ' IMPORTANT: Respond in Chinese (Simplified).';
    
    // We expect imageData to be a base64 Data URL
    let imageUrl = imageData;
    if (!imageData.startsWith('data:')) {
      // Zhipu requires base64 images to be fully formatted with data URLs
      imageUrl = `data:image/jpeg;base64,${imageData}`;
    }

    const response = await ai.chat.completions.create({
      model: 'glm-4v', // Zhipu's Vision Model
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract the medicine names, dosages, and instructions from this prescription image. Also, provide a simplified explanation of what each medicine is for and check for any potential common drug-drug interactions if multiple medicines are listed. Return the result in a structured JSON format with keys: medicines (array of {name, dosage, instructions, purpose}), interactions (array of {severity, description}), and summary (string).' + languageInstruction },
            { type: 'image_url', image_url: { url: imageUrl } }
          ] as any,
        },
      ]
    });

    let content = response.choices[0].message.content || '{}';
    content = extractJSON(content);
    
    return JSON.parse(content);
  } catch (error: any) {
    console.error('Prescription Analysis Error:', error.message);
    if (!process.env.ZHIPU_API_KEY) {
        return { summary: "AI未配置", medicines: [], interactions: [] };
    }
    // Fallback for models that don't support vision
    if (error.message.includes('vision') || error.message.includes('image')) {
      throw new Error('Current AI model does not support image analysis. Please use a vision-capable model.');
    }
    throw error;
  }
};

export const analyzeMoodAI = async (journal: string, mood: number, lang: string = 'en') => {
  const prompt = `Perform sentiment analysis on this journal entry: "${journal}". The user rated their mood as ${mood}/3 (1=Frown, 2=Meh, 3=Smile). 
  Provide a structured analysis including:
  1. Emotional tone
  2. Key stressors or positives identified
  3. Actionable advice for mental well-being
  4. A recommendation on whether they should consult a specialist (if signs of high stress/depression are present).
  Return in JSON format with keys: tone, insights (array), advice (array), specialistNeeded (boolean), recommendation (string).`;

  const response = await getAIResponse(prompt, 'You are a compassionate mental health assistant.', true, lang);
  return JSON.parse(response || '{}');
};

export const generateNutritionPlanAI = async (conditions: string[], preferences: string[], lang: string = 'en') => {
  const prompt = `Generate a personalized 1-day meal plan for a user with these conditions: ${conditions.join(', ')}. 
  Preferences: ${preferences.join(', ')}. 
  Focus on healthy options.
  Include Breakfast, Lunch, Dinner, and Snacks. 
  Provide nutritional focus for each meal.
  Return in JSON format with keys: dailyFocus, meals (array of {type, name, ingredients, nutritionalValue}), tips (array).`;

  const response = await getAIResponse(prompt, 'You are a professional clinical nutritionist.', true, lang);
  return JSON.parse(response || '{}');
};

export const checkSymptomsAI = async (symptoms: string, lang: string = 'en') => {
  const prompt = `The patient reports the following symptoms: "${symptoms}". 
  Provide a structured analysis including:
  1. Potential causes (disclaimer: not a diagnosis)
  2. Recommended specialist doctor type (e.g., Cardiologist, Neurologist)
  3. Urgency level (Low, Medium, High)
  4. Immediate advice or first aid (if applicable)
  Return in JSON format with keys: potentialCauses (array), recommendedSpecialist (string), urgency (string), advice (string).`;

  const response = await getAIResponse(prompt, 'You are a professional medical triage assistant.', true, lang);
  return JSON.parse(response || '{}');
};

export const analyzeLabReport = async (reportDetails: string, lang: string = 'en') => {
  const prompt = `Analyze the following lab report results: "${reportDetails}". 
  Identify which values are outside the normal range (High or Low). 
  Explain in simple terms what these results mean for the patient's health.
  Provide actionable advice (e.g., dietary changes, lifestyle adjustments).
  Return in JSON format with keys: abnormalValues (array of {parameter, value, range, status, meaning}), summary (string), advice (array).`;

  const response = await getAIResponse(prompt, 'You are a professional medical lab report interpreter.', true, lang);
  return JSON.parse(response || '{}');
};

export const getHealthInsightsAI = async (patientData: any, lang: string = 'en') => {
  const prompt = `
    Analyze the following patient data and provide 3 personalized health insights and 3 actionable recommendations.
    Return the response in JSON format with keys: insights (array of {category, title, description}), recommendations (array of {priority, title, description}), and disclaimer (string).
    
    Patient Data:
    ${JSON.stringify(patientData, null, 2)}
  `;

  const response = await getAIResponse(prompt, 'You are a professional medical AI assistant. Provide empathetic, accurate, and helpful health insights based on patient data.', true, lang);
  return JSON.parse(response || '{}');
};
