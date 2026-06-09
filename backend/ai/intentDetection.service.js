/**
 * Intent Detection Service
 * Identifies what the user is asking about and maps to appropriate MongoDB model
 */

const INTENT_MAP = {
  // Order-related intents
  ORDERS: {
    keywords: ['order', 'orders', 'purchase', 'bought', 'delivery', 'shipped', 'canceled', 'cancelled', 'pending', 'placed', 'invoice'],
    collections: ['Order'],
    aggregations: ['orderCount', 'orderStatus', 'orderDetails', 'ordersByDate', 'orderValue'],
    timeFilters: true,
  },

  // Sales-related intents
  SALES: {
    keywords: ['sales', 'revenue', 'earning', 'earnings', 'income', 'profit', 'total amount', 'sold', 'sold out', 'bestseller'],
    collections: ['Order', 'Product'],
    aggregations: ['totalSales', 'monthlySales', 'weeklySales', 'dailySales', 'productSales', 'categoryRevenue'],
    timeFilters: true,
  },

  // Product-related intents
  PRODUCTS: {
    keywords: ['product', 'products', 'item', 'items', 'inventory', 'stock', 'category', 'price', 'best selling', 'top'],
    collections: ['Product'],
    aggregations: ['productCount', 'productDetails', 'topProducts', 'categoryProducts', 'priceRange', 'inventoryStatus'],
    timeFilters: false,
  },

  // Customer-related intents
  CUSTOMERS: {
    keywords: ['customer', 'customers', 'user', 'users', 'new customer', 'customer added', 'active users', 'registered', 'accounts'],
    collections: ['User'],
    aggregations: ['userCount', 'newUsers', 'activeUsers', 'userDetails', 'userRegistrationTrend'],
    timeFilters: true,
  },

  // Notification-related intents
  NOTIFICATIONS: {
    keywords: ['notification', 'notifications', 'alert', 'alerts', 'message', 'messages', 'update', 'updates'],
    collections: ['Notification'],
    aggregations: ['notificationCount', 'recentNotifications', 'unreadNotifications'],
    timeFilters: true,
  },

  // Analytics intents
  ANALYTICS: {
    keywords: ['analytics', 'report', 'reports', 'statistics', 'stats', 'compare', 'comparison', 'trend', 'performance', 'month vs', 'vs last'],
    collections: ['Order', 'User', 'Product'],
    aggregations: ['comparison', 'trend', 'metrics', 'performance'],
    timeFilters: true,
  },

  // Employee-related intents (for admin use)
  EMPLOYEES: {
    keywords: ['employee', 'employees', 'staff', 'team', 'absent', 'attendance', 'present', 'work'],
    collections: ['Employee'],
    aggregations: ['employeeCount', 'attendanceStatus', 'absentEmployees'],
    timeFilters: true,
  },

  // Delivery-related intents
  DELIVERIES: {
    keywords: ['delivery', 'deliveries', 'delivered', 'shipping', 'shipped', 'delayed', 'delay', 'pending delivery'],
    collections: ['Order'],
    aggregations: ['deliveryStatus', 'delayedDeliveries', 'deliveryStats'],
    timeFilters: true,
  },

  // Traffic/Visits intents
  VISITS: {
    keywords: ['visit', 'visits', 'traffic', 'page view', 'views', 'engagement', 'clicks', 'visitor'],
    collections: ['Visit'],
    aggregations: ['visitCount', 'dailyVisits', 'visitTrend', 'pageAnalytics'],
    timeFilters: true,
  },
};

const TIME_FILTERS = {
  today: { name: 'today', days: 0 },
  yesterday: { name: 'yesterday', days: 1 },
  'this week': { name: 'thisWeek', days: 7 },
  'this month': { name: 'thisMonth', days: 30 },
  'last month': { name: 'lastMonth', days: 60 },
  'this year': { name: 'thisYear', days: 365 },
  'last 7 days': { name: 'last7Days', days: 7 },
  'last 30 days': { name: 'last30Days', days: 30 },
  'last 90 days': { name: 'last90Days', days: 90 },
};

const detectIntent = (userQuery) => {
  const query = userQuery.toLowerCase();
  const intents = [];

  // Detect all matching intents
  Object.entries(INTENT_MAP).forEach(([intentName, intentData]) => {
    const keywordMatches = intentData.keywords.filter((keyword) =>
      query.includes(keyword)
    );

    if (keywordMatches.length > 0) {
      intents.push({
        intent: intentName,
        confidence: Math.min((keywordMatches.length / intentData.keywords.length) * 100, 100),
        collections: intentData.collections,
        aggregations: intentData.aggregations,
        supportsTimeFilter: intentData.timeFilters,
        matchedKeywords: keywordMatches,
      });
    }
  });

  // Sort by confidence
  intents.sort((a, b) => b.confidence - a.confidence);

  return intents.length > 0 ? intents[0] : null;
};

const detectTimeFilter = (userQuery) => {
  const query = userQuery.toLowerCase();
  let timeFilter = null;
  let matchedPhrase = '';

  Object.entries(TIME_FILTERS).forEach(([phrase, filter]) => {
    if (query.includes(phrase)) {
      timeFilter = filter;
      matchedPhrase = phrase;
    }
  });

  return { timeFilter, matchedPhrase };
};

const detectStatus = (userQuery) => {
  const query = userQuery.toLowerCase();
  const statuses = {
    pending: ['pending', 'waiting', 'not completed', 'yet to'],
    completed: ['completed', 'done', 'finished', 'delivered', 'confirmed'],
    cancelled: ['cancelled', 'canceled', 'cancel'],
    processing: ['processing', 'in progress', 'preparing'],
    failed: ['failed', 'error', 'issue'],
  };

  const detectedStatuses = {};
  Object.entries(statuses).forEach(([status, keywords]) => {
    const matches = keywords.filter((kw) => query.includes(kw));
    if (matches.length > 0) {
      detectedStatuses[status] = true;
    }
  });

  return detectedStatuses;
};

const detectDateRange = (userQuery) => {
  const { timeFilter, matchedPhrase } = detectTimeFilter(userQuery);

  if (!timeFilter) {
    return {
      from: new Date(new Date().setHours(0, 0, 0, 0)),
      to: new Date(),
      filter: null,
      matchedPhrase: null,
    };
  }

  const now = new Date();
  let from;

  switch (timeFilter.name) {
    case 'today':
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      from = new Date(now);
      from.setDate(from.getDate() - 1);
      from.setHours(0, 0, 0, 0);
      break;
    case 'thisWeek':
      from = new Date(now);
      from.setDate(from.getDate() - now.getDay());
      from.setHours(0, 0, 0, 0);
      break;
    case 'thisMonth':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'lastMonth':
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case 'thisYear':
      from = new Date(now.getFullYear(), 0, 1);
      break;
    case 'last7Days':
      from = new Date(now);
      from.setDate(from.getDate() - 7);
      break;
    case 'last30Days':
      from = new Date(now);
      from.setDate(from.getDate() - 30);
      break;
    case 'last90Days':
      from = new Date(now);
      from.setDate(from.getDate() - 90);
      break;
    default:
      from = new Date(now);
      from.setDate(from.getDate() - timeFilter.days);
  }

  return {
    from,
    to: now,
    filter: timeFilter.name,
    matchedPhrase,
  };
};

const analyzeQuery = (userQuery) => {
  const intent = detectIntent(userQuery);

  if (!intent) {
    return {
      intent: null,
      dateRange: null,
      status: null,
      error: 'Unable to understand your query. Please ask about orders, sales, products, customers, or analytics.',
    };
  }

  const dateRange = intent.supportsTimeFilter ? detectDateRange(userQuery) : null;
  const status = detectStatus(userQuery);

  return {
    intent,
    dateRange,
    status: Object.keys(status).length > 0 ? status : null,
    query: userQuery,
  };
};

export {
  detectIntent,
  detectTimeFilter,
  detectStatus,
  detectDateRange,
  analyzeQuery,
  INTENT_MAP,
  TIME_FILTERS,
};
