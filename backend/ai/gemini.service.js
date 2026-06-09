/**
 * Gemini Service
 * Handles AI response generation using Google Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import aiConfig from '../config/ai.js';
import responseCache from './responseCache.js';

let geminiClient = null;

const initializeGemini = () => {
  if (!geminiClient) {
    if (!aiConfig.geminiApiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }
    geminiClient = new GoogleGenerativeAI(aiConfig.geminiApiKey);
  }
  return geminiClient;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isQuotaError = (error) => error?.status === 429;

const isDailyQuotaExhausted = (error) => {
  const violations = error?.errorDetails?.find((d) =>
    d['@type']?.includes('QuotaFailure')
  )?.violations || [];
  return violations.some((v) => v.quotaId?.includes('PerDay'));
};

const getRetryDelayMs = (error) => {
  const retryInfo = error?.errorDetails?.find((d) =>
    d['@type']?.includes('RetryInfo')
  );
  if (retryInfo?.retryDelay) {
    return (parseInt(retryInfo.retryDelay) + 1) * 1000;
  }
  return 20000;
};

const generateWithModel = async (modelName, combinedPrompt) => {
  const client = initializeGemini();
  const model = client.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(combinedPrompt);
  return { text: result.response.text(), tokens: result.response.usageMetadata || null };
};

const generateResponse = async (systemPrompt, userPrompt) => {
  // Return cached response if available — saves quota
  const cached = responseCache.get(systemPrompt, userPrompt);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
  const primaryModel = aiConfig.geminiModel;
  const fallbackModel = aiConfig.geminiFallbackModel;

  // Try primary model first
  try {
    const { text, tokens } = await generateWithModel(primaryModel, combinedPrompt);
    const result = { success: true, response: text, model: primaryModel, tokens };
    responseCache.set(systemPrompt, userPrompt, result);
    return result;
  } catch (primaryError) {
    const quotaFailed = isQuotaError(primaryError);

    // If quota error and fallback model is different, try fallback
    if (quotaFailed && fallbackModel && fallbackModel !== primaryModel) {
      console.warn(`Quota exhausted on ${primaryModel}, switching to fallback model ${fallbackModel}...`);
      try {
        const { text, tokens } = await generateWithModel(fallbackModel, combinedPrompt);
        const result = { success: true, response: text, model: fallbackModel, tokens };
        responseCache.set(systemPrompt, userPrompt, result);
        return result;
      } catch (fallbackError) {
        console.error('Error generating response with fallback Gemini model:', fallbackError);
        if (isQuotaError(fallbackError)) {
          const retryMs = getRetryDelayMs(fallbackError);
          return {
            success: false,
            isQuotaError: true,
            isDailyLimit: isDailyQuotaExhausted(fallbackError),
            retryAfterSeconds: Math.ceil(retryMs / 1000),
            error: fallbackError.message,
            response: isDailyQuotaExhausted(fallbackError)
              ? 'AI ka aaj ka quota khatam ho gaya. Kal dobara try karein ya Google AI plan upgrade karein.'
              : `AI quota khatam. ${Math.ceil(retryMs / 1000)} second baad try karein.`,
          };
        }
      }
    }

    console.error('Error generating response with Gemini:', primaryError);

    if (quotaFailed) {
      const retryMs = getRetryDelayMs(primaryError);
      return {
        success: false,
        isQuotaError: true,
        isDailyLimit: isDailyQuotaExhausted(primaryError),
        retryAfterSeconds: Math.ceil(retryMs / 1000),
        error: primaryError.message,
        response: isDailyQuotaExhausted(primaryError)
          ? 'AI ka aaj ka quota khatam ho gaya. Kal dobara try karein ya Google AI plan upgrade karein.'
          : `AI quota khatam. ${Math.ceil(retryMs / 1000)} second baad try karein.`,
      };
    }

    return {
      success: false,
      error: primaryError.message,
      response: 'I encountered an error while processing your request. Please try again.',
    };
  }
};

const streamResponse = async (systemPrompt, userPrompt) => {
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
  const tryStream = async (modelName) => {
    const client = initializeGemini();
    const model = client.getGenerativeModel({ model: modelName });
    return model.generateContentStream(combinedPrompt);
  };

  try {
    const result = await tryStream(aiConfig.geminiModel);
    return { success: true, stream: result.stream };
  } catch (primaryError) {
    if (isQuotaError(primaryError) && aiConfig.geminiFallbackModel !== aiConfig.geminiModel) {
      console.warn(`Stream quota exhausted on ${aiConfig.geminiModel}, switching to ${aiConfig.geminiFallbackModel}...`);
      try {
        const result = await tryStream(aiConfig.geminiFallbackModel);
        return { success: true, stream: result.stream };
      } catch (fallbackError) {
        console.error('Error streaming with fallback model:', fallbackError);
      }
    }
    console.error('Error streaming response with Gemini:', primaryError);
    return {
      success: false,
      isQuotaError: isQuotaError(primaryError),
      error: isQuotaError(primaryError)
        ? 'AI quota exhausted. Please try again tomorrow or upgrade your plan.'
        : primaryError.message,
    };
  }
};

const generateContextualResponse = async (userQuery, data, intentType, intentDetails, promptService) => {
  try {
    // Build complete prompt
    const promptObj = promptService.buildCompletePrompt(
      userQuery,
      data,
      intentType,
      intentDetails
    );

    // Generate response
    const result = await generateResponse(
      promptObj.systemPrompt,
      promptObj.userPrompt
    );

    if (!result.success) {
      return {
        success: false,
        response: result.response,
        error: result.error,
      };
    }

    return {
      success: true,
      response: result.response,
      model: result.model,
      intentType,
      hasData: !!data,
    };
  } catch (error) {
    console.error('Error generating contextual response:', error);
    return {
      success: false,
      response: 'Unable to generate response. Please try again.',
      error: error.message,
    };
  }
};

const generateFollowUpResponse = async (
  conversationHistory,
  newQuery,
  systemPrompt
) => {
  try {
    const client = initializeGemini();
    const model = client.getGenerativeModel({ model: aiConfig.geminiModel });

    // Build conversation context
    let prompt = systemPrompt + '\n\n';
    prompt += 'Previous conversation:\n';
    conversationHistory.forEach((msg, idx) => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    prompt += `\nNew question: ${newQuery}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return {
      success: true,
      response,
      model: aiConfig.geminiModel,
    };
  } catch (error) {
    console.error('Error generating follow-up response:', error);
    const quotaError = isQuotaError(error);
    return {
      success: false,
      isQuotaError: quotaError,
      error: error.message,
      response: quotaError
        ? (isDailyQuotaExhausted(error)
            ? 'AI daily quota exhausted. Please try again tomorrow or upgrade your plan.'
            : 'AI quota exceeded. Please wait a moment and try again.')
        : 'I encountered an error. Please rephrase your question.',
    };
  }
};

const validateApiKey = async () => {
  try {
    const client = initializeGemini();
    const model = client.getGenerativeModel({ model: aiConfig.geminiModel });

    // Simple test to verify API key works
    const result = await model.generateContent('Say "OK"');
    return {
      valid: true,
      message: 'API key is valid',
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      message: 'Invalid or expired API key',
    };
  }
};

export {
  initializeGemini,
  generateResponse,
  streamResponse,
  generateContextualResponse,
  generateFollowUpResponse,
  validateApiKey,
};
