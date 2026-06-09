import * as intentDetection from './intentDetection.service.js';
import * as mongoQuery from './mongoQuery.service.js';
import * as promptService from './prompt.service.js';
import * as geminiService from './gemini.service.js';
import * as claudeService from './claude.service.js';
import * as responseFormatter from './responseFormatter.service.js';
import * as geminiQueries from './geminiQueries.service.js';
import aiConfig from '../config/ai.js';

const getAIService = () =>
  aiConfig.aiProvider === 'claude' ? claudeService : geminiService;

const processQuery = async (userQuery, userId) => {
  const startTime = Date.now();

  try {
    // Step 1: Analyze Intent
    const intentAnalysis = intentDetection.analyzeQuery(userQuery);

    if (!intentAnalysis.intent) {
      return {
        success: false,
        response: responseFormatter.formatErrorResponse(intentAnalysis.error),
        type: 'ERROR',
        processingTime: Date.now() - startTime,
      };
    }

    // Step 2: Fetch relevant data
    const data = await mongoQuery.fetchDataByIntent(userId, intentAnalysis);

    // Step 3: Optimize query for Gemini
    const dateRange = intentAnalysis.dateRange?.matchedPhrase || 'today';
    const optimizedQuery = geminiQueries.createGeminiOptimizedQuery(
      intentAnalysis.intent.intent,
      userQuery,
      dateRange,
      Object.keys(intentAnalysis.status || {}).find(k => intentAnalysis.status[k])
    );

    // Step 4: Build optimized prompt
    const promptObj = promptService.buildCompletePrompt(
      optimizedQuery,
      data,
      intentAnalysis.intent.intent,
      intentAnalysis
    );

    // Step 5: Generate AI response
    const aiService = getAIService();
    const geminiResult = await aiService.generateResponse(
      promptObj.systemPrompt,
      promptObj.userPrompt
    );

    if (!geminiResult.success) {
      return {
        success: false,
        isQuotaError: geminiResult.isQuotaError || false,
        response: geminiResult.isQuotaError
          ? geminiResult.response
          : responseFormatter.formatErrorResponse(geminiResult.error),
        type: 'ERROR',
        processingTime: Date.now() - startTime,
      };
    }

    // Step 6: Format response
    const formattedResponse = responseFormatter.formatResponse(
      geminiResult.response,
      {
        includeMetadata: true,
        metadata: {
          intentType: intentAnalysis.intent.intent,
          confidence: intentAnalysis.intent.confidence,
          dataSource: 'MongoDB + Gemini AI',
          timestamp: new Date(),
        },
      }
    );

    return {
      success: true,
      response: formattedResponse,
      type: intentAnalysis.intent.intent,
      confidence: intentAnalysis.intent.confidence,
      processingTime: Date.now() - startTime,
      metadata: {
        intent: intentAnalysis.intent.intent,
        dateRange: intentAnalysis.dateRange,
        status: intentAnalysis.status,
        dataFetched: !!data,
      },
    };
  } catch (error) {
    console.error('Error in AI query processing:', error);
    return {
      success: false,
      response: responseFormatter.formatErrorResponse(
        'An unexpected error occurred. Please try again.'
      ),
      type: 'ERROR',
      error: error.message,
      processingTime: Date.now() - startTime,
    };
  }
};

const processQueryStream = async (userQuery, userId, onChunk) => {
  const startTime = Date.now();

  try {
    // Analyze Intent
    const intentAnalysis = intentDetection.analyzeQuery(userQuery);

    if (!intentAnalysis.intent) {
      return {
        success: false,
        error: intentAnalysis.error,
        processingTime: Date.now() - startTime,
      };
    }

    // Fetch data
    const data = await mongoQuery.fetchDataByIntent(userId, intentAnalysis);

    // Optimize query for Gemini
    const dateRange = intentAnalysis.dateRange?.matchedPhrase || 'today';
    const optimizedQuery = geminiQueries.createGeminiOptimizedQuery(
      intentAnalysis.intent.intent,
      userQuery,
      dateRange,
      Object.keys(intentAnalysis.status || {}).find(k => intentAnalysis.status[k])
    );

    // Build prompt
    const promptObj = promptService.buildCompletePrompt(
      optimizedQuery,
      data,
      intentAnalysis.intent.intent,
      intentAnalysis
    );

    // Stream response
    const streamResult = await geminiService.streamResponse(
      promptObj.systemPrompt,
      promptObj.userPrompt
    );

    if (!streamResult.success) {
      return {
        success: false,
        error: streamResult.error,
        processingTime: Date.now() - startTime,
      };
    }

    // Handle stream chunks
    let fullResponse = '';
    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text?.();
      if (chunkText) {
        fullResponse += chunkText;
        if (onChunk) {
          onChunk(chunkText);
        }
      }
    }

    return {
      success: true,
      response: fullResponse,
      type: intentAnalysis.intent.intent,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Error in streaming AI query:', error);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime,
    };
  }
};

const validateQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return {
      valid: false,
      error: 'Query must be a non-empty string',
    };
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 3) {
    return {
      valid: false,
      error: 'Query must be at least 3 characters long',
    };
  }

  if (trimmedQuery.length > 500) {
    return {
      valid: false,
      error: 'Query must be less than 500 characters',
    };
  }

  return {
    valid: true,
    query: trimmedQuery,
  };
};

const getAvailableIntents = () => {
  return Object.entries(intentDetection.INTENT_MAP).map(([name, data]) => ({
    name,
    keywords: data.keywords,
    supportsTimeFilter: data.timeFilters,
  }));
};

const getExampleQueries = () => {
  return [
    {
      category: 'Orders',
      examples: [
        'Show my orders from today',
        'What are my pending orders?',
        'How many orders did I place this month?',
        'Show my last 5 orders',
      ],
    },
    {
      category: 'Sales',
      examples: [
        'What are my total sales this month?',
        'How much revenue did I make today?',
        'Compare this month sales vs last month',
        'What is my average order value?',
      ],
    },
    {
      category: 'Products',
      examples: [
        'Show my best selling products',
        'What products are in stock?',
        'List all products in category X',
        'What is the price range of my products?',
      ],
    },
    {
      category: 'Customers',
      examples: [
        'How many new customers were added this week?',
        'Show me active users',
        'How many total customers do I have?',
        'List recent customer registrations',
      ],
    },
    {
      category: 'Analytics',
      examples: [
        'Give me a business summary',
        'Show me performance metrics',
        'What are my top metrics?',
        'Analyze my business performance',
      ],
    },
  ];
};

export {
  processQuery,
  processQueryStream,
  validateQuery,
  getAvailableIntents,
  getExampleQueries,
};
