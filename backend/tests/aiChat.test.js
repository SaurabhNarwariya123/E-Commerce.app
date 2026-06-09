/**
 * AI Chatbot API Testing Examples
 * Use these examples to test the AI chatbot endpoints
 * 
 * Location: backend/tests/aiChat.test.js
 * Or use with Postman/Thunder Client
 */

/**
 * ============================================
 * 1. BASIC CHAT REQUEST
 * ============================================
 */

// curl example
const curlBasicChat = `
curl -X POST http://localhost:4000/api/ai/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "message": "Show my orders from today",
    "userId": "user123"
  }'
`;

// fetch example
async function testBasicChat() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: 'Show my orders from today',
      userId: 'user123',
    }),
  });

  const data = await response.json();
  console.log('Response:', data);
  /*
  Expected Response:
  {
    "success": true,
    "response": "You have 5 orders today totaling $250.50...",
    "type": "ORDERS",
    "confidence": 95,
    "processingTime": 1234,
    "metadata": {
      "intent": "ORDERS",
      "dateRange": {...},
      "status": null,
      "dataFetched": true
    }
  }
  */
}

/**
 * ============================================
 * 2. STREAM CHAT REQUEST (Server-Sent Events)
 * ============================================
 */

async function testStreamChat() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:4000/api/ai/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: 'What are my total sales this month?',
      userId: 'user123',
    }),
  });

  // Handle Server-Sent Events
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        
        if (data.chunk) {
          console.log('Stream chunk:', data.chunk);
          // Update UI with streaming text
        }
        
        if (data.complete) {
          console.log('Complete:', data.result);
        }
      }
    }
  }
}

/**
 * ============================================
 * 3. GET AVAILABLE INTENTS
 * ============================================
 */

async function testGetIntents() {
  const response = await fetch('http://localhost:4000/api/ai/intents');
  const data = await response.json();
  
  console.log('Available intents:', data);
  /*
  Expected Response:
  {
    "success": true,
    "data": [
      {
        "name": "ORDERS",
        "keywords": ["order", "orders", "purchase", ...],
        "supportsTimeFilter": true
      },
      {
        "name": "SALES",
        "keywords": ["sales", "revenue", ...],
        "supportsTimeFilter": true
      },
      ...
    ]
  }
  */
}

/**
 * ============================================
 * 4. GET EXAMPLE QUERIES
 * ============================================
 */

async function testGetExamples() {
  const response = await fetch('http://localhost:4000/api/ai/examples');
  const data = await response.json();
  
  console.log('Example queries:', data);
  /*
  Expected Response:
  {
    "success": true,
    "data": [
      {
        "category": "Orders",
        "examples": [
          "Show my orders from today",
          "What are my pending orders?",
          ...
        ]
      },
      ...
    ]
  }
  */
}

/**
 * ============================================
 * 5. HEALTH CHECK
 * ============================================
 */

async function testHealthCheck() {
  const response = await fetch('http://localhost:4000/api/ai/health');
  const data = await response.json();
  
  console.log('Health check:', data);
  /*
  Expected Response:
  {
    "success": true,
    "status": "AI service is operational",
    "message": "API key is valid"
  }
  */
}

/**
 * ============================================
 * 6. TEST DIFFERENT QUERY TYPES
 * ============================================
 */

// Order queries
const orderQueries = [
  'Show my orders today',
  'What are my pending orders?',
  'How many orders this month?',
  'Show my last 5 orders',
  'Orders from this week',
  'Cancelled orders',
];

// Sales queries
const salesQueries = [
  'What are my total sales today?',
  'Compare this month vs last month',
  'Show my revenue by category',
  'What is my average order value?',
  'Sales trend this year',
];

// Product queries
const productQueries = [
  'Show best selling products',
  'What products are in stock?',
  'List products in category X',
  'What is the price range?',
  'Top 5 products by revenue',
];

// Customer queries
const customerQueries = [
  'How many new customers this week?',
  'Show active users',
  'Total customers added today',
  'Customer registration trend',
];

// Analytics queries
const analyticsQueries = [
  'Give me a business summary',
  'Show performance metrics',
  'Analyze my sales trends',
  'What are my top metrics?',
];

/**
 * ============================================
 * 7. ERROR HANDLING TESTS
 * ============================================
 */

// Invalid input
async function testInvalidInput() {
  const token = localStorage.getItem('token');
  
  // Empty message
  let response = await fetch('http://localhost:4000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message: '', userId: 'user123' }),
  });
  console.log('Empty message:', await response.json());
  // Expected: 400 - Query must be at least 3 characters long

  // Too long message
  response = await fetch('http://localhost:4000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: 'a'.repeat(600),
      userId: 'user123',
    }),
  });
  console.log('Long message:', await response.json());
  // Expected: 400 - Query must be less than 500 characters

  // Missing userId
  response = await fetch('http://localhost:4000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message: 'Show my orders' }),
  });
  console.log('Missing userId:', await response.json());
  // Expected: 400 - Message and userId are required
}

/**
 * ============================================
 * 8. PERFORMANCE TESTING
 * ============================================
 */

async function testPerformance() {
  const token = localStorage.getItem('token');
  const queries = ['Show my orders', 'What are my sales?', 'Best products'];
  
  for (const query of queries) {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:4000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message: query, userId: 'user123' }),
    });
    
    const data = await response.json();
    const responseTime = data.processingTime || (Date.now() - startTime);
    
    console.log(`Query: "${query}"`);
    console.log(`Response time: ${responseTime}ms`);
    console.log(`Confidence: ${data.confidence}%`);
    console.log('---');
  }
}

/**
 * ============================================
 * 9. BATCH TESTING
 * ============================================
 */

async function testBatch() {
  const token = localStorage.getItem('token');
  const queries = [
    'Show my orders today',
    'What are my total sales?',
    'Show best selling products',
    'How many customers?',
    'Give me a summary',
  ];

  const results = [];

  for (const query of queries) {
    try {
      const response = await fetch('http://localhost:4000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: query, userId: 'user123' }),
      });

      const data = await response.json();
      
      results.push({
        query,
        success: data.success,
        type: data.type,
        confidence: data.confidence,
        time: data.processingTime,
      });
    } catch (error) {
      results.push({
        query,
        success: false,
        error: error.message,
      });
    }
  }

  console.table(results);
  
  // Calculate stats
  const successful = results.filter(r => r.success).length;
  const avgTime = results
    .filter(r => r.time)
    .reduce((sum, r) => sum + r.time, 0) / results.filter(r => r.time).length;

  console.log(`\nSummary:`);
  console.log(`Success rate: ${(successful / results.length * 100).toFixed(2)}%`);
  console.log(`Average response time: ${avgTime.toFixed(0)}ms`);
}

/**
 * ============================================
 * 10. POSTMAN COLLECTION EXAMPLE
 * ============================================
 */

const postmanCollection = {
  info: {
    name: 'AI Chatbot API',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [
    {
      name: 'Chat',
      request: {
        method: 'POST',
        header: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Authorization', value: 'Bearer {{token}}' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            { message: 'Show my orders today', userId: 'user123' },
            null,
            2
          ),
        },
        url: { raw: '{{baseUrl}}/api/ai/chat', path: ['api', 'ai', 'chat'] },
      },
    },
    {
      name: 'Get Intents',
      request: {
        method: 'GET',
        url: { raw: '{{baseUrl}}/api/ai/intents', path: ['api', 'ai', 'intents'] },
      },
    },
    {
      name: 'Get Examples',
      request: {
        method: 'GET',
        url: { raw: '{{baseUrl}}/api/ai/examples', path: ['api', 'ai', 'examples'] },
      },
    },
    {
      name: 'Health Check',
      request: {
        method: 'GET',
        url: { raw: '{{baseUrl}}/api/ai/health', path: ['api', 'ai', 'health'] },
      },
    },
  ],
  variable: [
    { key: 'baseUrl', value: 'http://localhost:4000' },
    { key: 'token', value: 'YOUR_JWT_TOKEN_HERE' },
  ],
};

/**
 * ============================================
 * RUN ALL TESTS
 * ============================================
 */

async function runAllTests() {
  console.log('🚀 Starting AI Chatbot API Tests...\n');

  try {
    console.log('1. Testing health check...');
    await testHealthCheck();

    console.log('\n2. Testing intents...');
    await testGetIntents();

    console.log('\n3. Testing examples...');
    await testGetExamples();

    console.log('\n4. Testing basic chat...');
    await testBasicChat();

    console.log('\n5. Testing performance...');
    await testPerformance();

    console.log('\n6. Testing batch queries...');
    await testBatch();

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for testing
export {
  testBasicChat,
  testStreamChat,
  testGetIntents,
  testGetExamples,
  testHealthCheck,
  testInvalidInput,
  testPerformance,
  testBatch,
  runAllTests,
};
