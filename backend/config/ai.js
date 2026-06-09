import dotenv from 'dotenv';
dotenv.config();

const aiConfig = {
  // Provider selection: 'gemini' or 'claude'
  aiProvider: process.env.AI_PROVIDER || 'gemini',

  // Gemini API
  geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY,
  geminiModel: process.env.AI_MODEL || 'gemini-2.0-flash',
  geminiFallbackModel: 'gemini-2.5-flash-lite',

  // Claude API
  claudeApiKey: process.env.ANTHROPIC_API_KEY,
  claudeModel: process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',

  serviceEnabled: process.env.AI_SERVICE_ENABLED === 'true' || true,
  responseTimeout: parseInt(process.env.AI_RESPONSE_TIMEOUT || '30000', 10),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048', 10),

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
};

export const validateAIConfig = () => {
  if (!aiConfig.geminiApiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set');
  }
};

export default aiConfig;
