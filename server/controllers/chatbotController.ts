// chatbotController.ts (Express Controller for AI Chat)
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Endpoint for chatbot
router.post('/chat', async (req, res) => {
  const { message, systemPrompt } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key missing or invalid.' });
  }

  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt || 'You are a healthcare assistant.' },
        { role: 'user', content: message },
      ],
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,  // Make sure the key is passed here
      },
    });

    res.json({ response: response.data.response });
  } catch (error) {
    console.error('Error calling DeepSeek API:', error.message);
    res.status(500).json({ error: 'Failed to get response from AI service' });
  }
});

export default router;