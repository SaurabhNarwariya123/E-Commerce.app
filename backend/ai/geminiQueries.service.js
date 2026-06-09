import aiConfig from '../config/ai.js';

const GEMINI_OPTIMIZED_QUERIES = {
  ORDERS: {
    templates: [
      'List all {{status}} orders from {{dateRange}} with details including order ID, amount, status, and customer info',
      'Summarize {{status}} orders for {{dateRange}}: total count, total value, average order value, and trend',
      'Analyze {{status}} orders from {{dateRange}}: show breakdown by status, payment status, and delivery status',
      'Compare orders: {{status}} orders from {{dateRange}} vs previous period - show growth metrics',
    ],
    followUp: [
      'What payment methods were used for these orders?',
      'Are there any delayed or problematic orders?',
      'Which customers made these orders?',
    ],
  },

  SALES: {
    templates: [
      'Calculate total sales revenue for {{dateRange}}: include gross sales, net sales, average transaction value',
      'Analyze sales performance for {{dateRange}}: show daily/weekly trend, top revenue days, revenue by product category',
      'Compare sales: {{dateRange}} vs {{previousPeriod}} - show percentage change, growth rate, best/worst performing items',
      'Generate sales summary for {{dateRange}}: total transactions, total revenue, average order value, top products sold',
    ],
    followUp: [
      'Which products generated the most revenue?',
      'What was the conversion rate during this period?',
      'How do sales compare to previous months?',
    ],
  },

  PRODUCTS: {
    templates: [
      'List top selling products from {{dateRange}}: show product name, sales count, revenue, profit margin',
      'Analyze product performance: which products are trending, which need improvement, inventory status',
      'Show product inventory status: stock levels, fast-moving items, slow-moving items, reorder recommendations',
      'Compare product categories for {{dateRange}}: category-wise sales, profit, average selling price',
    ],
    followUp: [
      'Which products have low inventory?',
      'What are the profit margins by product?',
      'Which categories are underperforming?',
    ],
  },

  CUSTOMERS: {
    templates: [
      'Analyze customer data for {{dateRange}}: new customers added, active customers, customer retention rate',
      'Customer segmentation: high-value customers, regular buyers, one-time buyers, inactive customers',
      'Track customer growth: monthly new customers, customer churn rate, customer lifetime value trends',
      'List top customers for {{dateRange}}: by purchase frequency, total spend, average order value',
    ],
    followUp: [
      'Who are our most valuable customers?',
      'What is the customer retention rate?',
      'How many customers did we lose this period?',
    ],
  },

  ANALYTICS: {
    templates: [
      'Generate comprehensive business analytics for {{dateRange}}: sales metrics, customer metrics, product performance, operational metrics',
      'Compare business performance: {{dateRange}} vs {{previousPeriod}} - show KPIs, growth rates, trending metrics',
      'Identify business trends for {{dateRange}}: what\'s working, what needs improvement, recommendations for growth',
      'Executive summary for {{dateRange}}: key achievements, challenges, opportunities, metrics summary',
    ],
    followUp: [
      'What are our key performance indicators?',
      'Where should we focus our efforts?',
      'What opportunities exist for growth?',
    ],
  },
};

const createGeminiOptimizedQuery = (intent, userQuery, dateRange, status = null) => {
  const templates = GEMINI_OPTIMIZED_QUERIES[intent]?.templates || [];
  if (templates.length === 0) return userQuery;

  const template = templates[Math.floor(Math.random() * templates.length)];
  
  let optimized = template
    .replace('{{dateRange}}', dateRange || 'today')
    .replace('{{previousPeriod}}', getPreviousPeriod(dateRange))
    .replace('{{status}}', status || 'all');

  return optimized;
};

const getPreviousPeriod = (period) => {
  const mapping = {
    today: 'yesterday',
    'this week': 'last week',
    'this month': 'last month',
    'this year': 'last year',
  };
  return mapping[period] || 'previous period';
};

const enhanceGeminiPrompt = (userQuery, intent, data, dateRange) => {
  return `${userQuery}

Data Context:
- Time Period: ${dateRange}
- Intent Type: ${intent}
- Data Available: Yes
- Records Count: ${data?.count || 0}

Please provide:
1. Direct answer to the question
2. Key metrics and statistics
3. Trends or patterns if applicable
4. Actionable insights
5. Any recommendations

Format: Clear, concise, professional`;
};

export {
  GEMINI_OPTIMIZED_QUERIES,
  createGeminiOptimizedQuery,
  enhanceGeminiPrompt,
  getPreviousPeriod,
};
