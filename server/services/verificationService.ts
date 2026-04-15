import cron from 'node-cron';
import User from '../models/User';
import { getAIResponse } from './aiService';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const initVerificationCron = () => {
  // Run every hour to check for users who haven't submitted documents within 24 hours
  cron.schedule('0 * * * *', async () => {
    console.log('Running verification check cron job...');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    try {
      const usersToBan = await User.find({
        role: { $in: ['Hospital', 'Pharmacy', 'Rider', 'Lab', 'Driver'] },
        status: 'Pending',
        verificationDocuments: { $size: 0 },
        createdAt: { $lt: twentyFourHoursAgo },
        isBanned: false
      });

      for (const user of usersToBan) {
        user.isBanned = true;
        user.status = 'Banned';
        user.banReason = 'Failed to submit verification documents within 24 hours of registration.';
        await user.save();
        console.log(`User ${user.username} has been automatically banned due to missing documents.`);
      }
    } catch (error) {
      console.error('Error in verification cron job:', error);
    }
  });
};

export const analyzeDocumentWithAI = async (documentUrl: string, role: string) => {
  try {
    const prompt = `
      You are an expert document verification AI for Synapse Health.
      Analyze the document at this URL: ${documentUrl}
      The user is applying for the role of: ${role}.
      
      Tasks:
      1. Determine if the document is a real, official medical/business license or ID relevant to the role.
      2. Check for signs of forgery, tampering, or fake information.
      3. Extract key information: Organization Name, License Number, Expiry Date.
      4. Provide a verdict: "Authentic", "Suspicious", or "Fake".
      5. Provide a detailed reasoning.
      
      Return the result as a JSON object with fields: verdict, organizationName, licenseNumber, expiryDate, reasoning.
    `;

    const response = await getAIResponse(prompt, 'You are an expert document verification AI. Return ONLY a JSON object.', true);
    return JSON.parse(response || '{}');
  } catch (error) {
    console.error('AI Document Analysis Error:', error);
    return { verdict: 'Error', reasoning: 'AI analysis failed due to technical error.' };
  }
};
