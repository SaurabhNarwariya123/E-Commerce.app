import * as aiRouter from '../ai/aiRouter.service.js';
import * as geminiService from '../ai/gemini.service.js';
import * as claudeService from '../ai/claude.service.js';
import aiConfig, { validateAIConfig } from '../config/ai.js';
import responseCache from '../ai/responseCache.js';

// Per-user rate limiting: max 8 requests per minute
const userRequestLog = new Map();
const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const isRateLimited = (userId) => {
  const now = Date.now();
  const timestamps = (userRequestLog.get(userId) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  userRequestLog.set(userId, timestamps);
  return false;
};

const getAIService = () =>
  aiConfig.aiProvider === 'claude' ? claudeService : geminiService;

const chat = async (req, res) => {
  try {
    const { message, userId } = req.body;

    // Validate input
    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Message and userId are required',
      });
    }

    // Rate limit check
    if (isRateLimited(userId)) {
      return res.status(429).json({
        success: false,
        error: 'Aap bahut zyada requests bhej rahe hain. 1 minute baad try karein.',
        retryAfterSeconds: 60,
      });
    }

    // Validate query
    const validation = aiRouter.validateQuery(message);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Process query
    const result = await aiRouter.processQuery(validation.query, userId);

    // Return response
    const statusCode = result.success ? 200 : (result.isQuotaError ? 503 : 500);
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred processing your request',
      message: error.message,
    });
  }
};

const streamChat = async (req, res) => {
  try {
    const { message, userId } = req.body;

    // Validate input
    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Message and userId are required',
      });
    }

    // Validate query
    const validation = aiRouter.validateQuery(message);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Process query with streaming
    const result = await aiRouter.processQueryStream(
      validation.query,
      userId,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    );

    // Send completion event
    res.write(`data: ${JSON.stringify({ complete: true, result })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Stream chat endpoint error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

/**
 * Get available intents
 */
const getIntents = async (req, res) => {
  try {
    const intents = aiRouter.getAvailableIntents();
    return res.status(200).json({
      success: true,
      data: intents,
    });
  } catch (error) {
    console.error('Get intents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch intents',
    });
  }
};

/**
 * Get example queries
 */
const getExamples = async (req, res) => {
  try {
    const examples = aiRouter.getExampleQueries();
    return res.status(200).json({
      success: true,
      data: examples,
    });
  } catch (error) {
    console.error('Get examples error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch examples',
    });
  }
};

/**
 * Health check for AI service
 */
const healthCheck = async (req, res) => {
  try {
    const validation = await getAIService().validateApiKey();

    return res.status(validation.valid ? 200 : 503).json({
      success: validation.valid,
      status: validation.valid ? 'AI service is operational' : 'AI service is unavailable',
      message: validation.message,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(503).json({
      success: false,
      status: 'AI service check failed',
      error: error.message,
    });
  }
};

const cacheStats = async (req, res) => {
  return res.status(200).json({
    success: true,
    cache: responseCache.stats(),
  });
};

export {
  chat,
  streamChat,
  getIntents,
  getExamples,
  healthCheck,
  cacheStats,
};
