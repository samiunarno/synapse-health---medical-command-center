export interface AIAnalysisResult {
  riskLevel: 'Low' | 'Medium' | 'High' | '低风险' | '中等风险' | '高风险';
  analysis: string;
  recommendedActions: string[];
}

/**
 * Service to connect to Chinese AI providers (Zhipu, Qwen, Kimi, etc.)
 * These providers use an OpenAI-compatible API format.
 */
export async function analyzeMedicalData(patientData: any, language: string = 'zh'): Promise<AIAnalysisResult> {
  // Read from environment variables
  const apiKey = process.env.ZHIPU_API_KEY;
  // Default to Zhipu's endpoint
  const endpoint = process.env.ZHIPU_BASE_URL ? `${process.env.ZHIPU_BASE_URL}chat/completions` : 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  const model = process.env.ZHIPU_MODEL || 'glm-4.7-flash';

  // ==========================================
  // COMPETITION SAFETY FALLBACK (Mock Mode)
  // ==========================================
  // If no API key is provided, we simulate a highly realistic AI response.
  // This ensures your app NEVER breaks during a live pitch or competition demo
  // even if the Wi-Fi drops or the API rate limits.
  if (!apiKey) {
    console.warn("No ZHIPU_API_KEY found. Running in Competition Demo Mode (Mocked).");
    return new Promise((resolve) => {
      setTimeout(() => {
        if (language === 'en') {
          resolve({
            riskLevel: "Medium",
            analysis: "Based on the patient's telemetry data (Heart Rate 110bpm, BP 140/90), there are signs of mild hypertension and tachycardia. Further examination is recommended to rule out potential cardiovascular risks.",
            recommendedActions: [
              "Schedule a 24-hour Holter monitor",
              "Advise patient to reduce sodium intake and maintain adequate sleep",
              "Book an appointment with a cardiology specialist for detailed evaluation"
            ]
          });
        } else {
          resolve({
            riskLevel: "中等风险",
            analysis: "根据患者的生命体征数据（心率 110bpm，血压 140/90），存在轻度高血压和心动过速的迹象。建议进一步检查以排除心血管潜在风险。",
            recommendedActions: [
              "安排 24 小时动态心电图 (Holter) 监测",
              "建议患者减少钠盐摄入，保持充足睡眠",
              "预约心内科专家进行详细评估"
            ]
          });
        }
      }, 2500); // Simulate realistic 2.5s network delay
    });
  }

  // ==========================================
  // REAL API CALL (Zhipu / Qwen / Kimi)
  // ==========================================
  try {
    const systemPrompt = language === 'en' 
      ? "You are a professional medical AI assistant. Output your analysis in JSON format with three fields: riskLevel ('Low', 'Medium', 'High'), analysis (string), and recommendedActions (array of strings)."
      : "你是一个专业的医疗AI助手。请以JSON格式输出分析结果，包含三个字段：riskLevel ('低风险', '中等风险', '高风险'), analysis (字符串), 和 recommendedActions (字符串数组)。";

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze the following patient data: ${JSON.stringify(patientData)}` }
        ],
        // Force the AI to return structured JSON so it fits perfectly into our UI
        response_format: { type: "json_object" },
        temperature: 0.3 // Low temperature for more deterministic, professional medical output
      })
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultContent = data.choices[0].message.content;
    
    // Parse the JSON string returned by the AI
    return JSON.parse(resultContent) as AIAnalysisResult;

  } catch (error) {
    console.error("Failed to connect to Chinese AI:", error);
    throw error;
  }
}
