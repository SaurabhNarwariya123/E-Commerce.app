/**
 * AI Chat Routes
 * Defines endpoints for AI chatbot functionality
 */

import express from 'express';
import * as aiChatController from '../controllers/aiChat.controller.js';
import auth from '../middleware/auth.js'; // Assuming you have auth middleware

const router = express.Router();

/**
 * POST /api/ai/chat
 * Process user query and get AI response
 * Body: { message: string, userId: string }
 */
router.post('/chat', auth, aiChatController.chat);

/**
 * POST /api/ai/chat/stream
 * Process query and stream response (SSE)
 * Body: { message: string, userId: string }
 */
router.post('/chat/stream', auth, aiChatController.streamChat);

/**
 * GET /api/ai/intents
 * Get available intent categories
 */
router.get('/intents', aiChatController.getIntents);

/**
 * GET /api/ai/examples
 * Get example queries for each category
 */
router.get('/examples', aiChatController.getExamples);

/**
 * GET /api/ai/health
 * Health check for AI service
 */
router.get('/health', aiChatController.healthCheck);
router.get('/cache/stats', aiChatController.cacheStats);

export default router;
