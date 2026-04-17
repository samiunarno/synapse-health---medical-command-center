# JWT Setup & AI Configuration Guide

To secure your application and enable the AI features, follow these steps to configure your JWT (JSON Web Token) secret and AI settings.

## 1. Generate a JWT Secret

Your application requires a secure `JWT_SECRET` to sign authentication tokens.

### Option A: Use the built-in script (Recommended)
Run the following command in your terminal:
```bash
npm run generate-secret
```
This will print a secure random string for you.

### Option B: Manual Node.js command
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 2. Configure Environment Variables

Create a file named `.env` in the root directory (or use the AI Studio Settings menu) and add the following:

```env
# Secure secret for authentication
JWT_SECRET="your_generated_secret_here"

# AI Configuration (BigModel / Zhipu AI)
ZHIPU_API_KEY="your_actual_zhipu_api_key_here"
ZHIPU_MODEL="glm-4.7-flash"
ZHIPU_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
```

## 3. Why is my AI not running?

If you see "AI Service is not configured" or 401 errors:
1. **Missing API Key**: Ensure `ZHIPU_API_KEY` is correctly set in your environment variables.
2. **Missing JWT Secret**: Ensure `JWT_SECRET` is set. Without it, the backend uses an insecure fallback, but it's best to set a real one for development.
3. **Invalid Token**: If you are logged in, try logging out and back in to refresh your token using the new secret.

## 4. Troubleshooting Data Localization

If you entered data in English but see it in Chinese on the dashboard:
- **Labels vs Data**: Static UI labels (like "Patient Name") are translated via `i18n.ts`. 
- **AI Analysis**: The system now instructs the AI to respond in your selected language. If your UI is set to Chinese, the AI will translate your English clinical data into Chinese insights. This is to ensure a consistent experience for Chinese-speaking medical staff.
- **Raw Data**: Personal names and raw records are intended to stay in their original language. If you see a patient name being translated, please check if the name matches an existing translation key in `src/i18n.ts`.
