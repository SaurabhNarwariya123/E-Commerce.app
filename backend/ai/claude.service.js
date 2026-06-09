import Anthropic from '@anthropic-ai/sdk';
import aiConfig from '../config/ai.js';

let claudeClient = null;

const initializeClaude = () => {
  if (!claudeClient) {
    if (!aiConfig.claudeApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    claudeClient = new Anthropic({ apiKey: aiConfig.claudeApiKey });
  }
  return claudeClient;
};

const generateResponse = async (systemPrompt, userPrompt) => {
  try {
    const client = initializeClaude();

    const message = await client.messages.create({
      model: aiConfig.claudeModel,
      max_tokens: aiConfig.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = message.content[0]?.text || '';

    return {
      success: true,
      response: text,
      model: aiConfig.claudeModel,
      tokens: {
        inputTokens: message.usage?.input_tokens,
        outputTokens: message.usage?.output_tokens,
      },
    };
  } catch (error) {
    console.error('Error generating response with Claude:', error);
    return {
      success: false,
      error: error.message,
      response: 'I encountered an error while processing your request. Please try again.',
    };
  }
};

const validateApiKey = async () => {
  try {
    const client = initializeClaude();
    await client.messages.create({
      model: aiConfig.claudeModel,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say OK' }],
    });
    return { valid: true, message: 'Claude API key is valid' };
  } catch (error) {
    return { valid: false, error: error.message, message: 'Invalid Claude API key' };
  }
};

export { initializeClaude, generateResponse, validateApiKey };
