/**
 * Prompt Templates Service
 * Manages dynamic prompts for Gemini based on context and data
 */

const RESPONSE_RULE = `
STRICT RULES:
- Reply in maximum 3 short lines. No bullet points unless asked.
- Give only numbers and key fact. No long explanations.
- Never add "Data Source", "Generated", or footer text — that is added separately.
- If data is empty, say so in one line.`;

const SYSTEM_PROMPTS = {
  ORDERS: `You are an e-commerce admin assistant. Answer order questions with exact numbers only.${RESPONSE_RULE}`,
  SALES: `You are an e-commerce sales assistant. Give revenue numbers directly.${RESPONSE_RULE}`,
  PRODUCTS: `You are a product advisor. List product facts briefly.${RESPONSE_RULE}`,
  CUSTOMERS: `You are a customer data assistant. Give customer counts and key info only.${RESPONSE_RULE}`,
  ANALYTICS: `You are a business analyst. Give key metrics in 2-3 lines max.${RESPONSE_RULE}`,
  DEFAULT: `You are an e-commerce admin assistant. Answer briefly with data only.${RESPONSE_RULE}`,
};

/**
 * Generate context string from fetched data
 */
const generateContextFromData = (data, intentType) => {
  if (!data) return '';

  let context = '\n\n### DATA CONTEXT ###\n';

  if (intentType === 'ORDERS' && data.data) {
    context += `\nOrders Found: ${data.count}\n`;
    if (data.summary) {
      context += `Total Amount: $${data.summary.totalAmount.toFixed(2)}\n`;
      context += `Average Order Value: $${data.summary.averageOrderValue.toFixed(2)}\n`;
    }
    if (data.data.length > 0) {
      context += '\nRecent Orders:\n';
      data.data.slice(0, 5).forEach((order, idx) => {
        context += `${idx + 1}. Order Amount: $${order.amount}, Status: ${order.status}, Date: ${new Date(order.date).toLocaleDateString()}\n`;
      });
    }
  } else if (intentType === 'SALES' && data.data) {
    context += `\nTotal Sales: $${data.data.totalSales?.toFixed(2) || 0}\n`;
    context += `Total Orders: ${data.data.totalOrders || 0}\n`;
    context += `Average Order Value: $${data.data.averageOrderValue?.toFixed(2) || 0}\n`;
    context += `Highest Order: $${data.data.maxOrderValue?.toFixed(2) || 0}\n`;
    context += `Lowest Order: $${data.data.minOrderValue?.toFixed(2) || 0}\n`;
  } else if (intentType === 'PRODUCTS' && data.data) {
    context += `\nTotal Products: ${data.count}\n`;
    if (data.summary) {
      context += `Average Price: $${data.summary.averagePrice.toFixed(2)}\n`;
      context += `Price Range: $${data.summary.lowestPrice.toFixed(2)} - $${data.summary.highestPrice.toFixed(2)}\n`;
    }
    if (data.data.length > 0) {
      context += '\nTop Products:\n';
      data.data.slice(0, 5).forEach((product, idx) => {
        context += `${idx + 1}. ${product.name} - $${product.price} (${product.category})\n`;
      });
    }
  } else if (intentType === 'CUSTOMERS' && data.data) {
    context += `\nTotal Users: ${data.count}\n`;
    if (data.data.length > 0) {
      context += '\nRecent Users:\n';
      data.data.slice(0, 5).forEach((user, idx) => {
        context += `${idx + 1}. ${user.name} (${user.email})\n`;
      });
    }
  } else if (intentType === 'ANALYTICS') {
    // Handle multiple data sources for analytics
    if (data.orders) {
      context += `\n## Orders Summary:\n`;
      context += `Total Orders: ${data.orders.count}\n`;
      if (data.orders.summary) {
        context += `Total Amount: $${data.orders.summary.totalAmount.toFixed(2)}\n`;
      }
    }
    if (data.products) {
      context += `\n## Products Summary:\n`;
      context += `Total Products: ${data.products.count}\n`;
      if (data.products.summary) {
        context += `Average Price: $${data.products.summary.averagePrice.toFixed(2)}\n`;
      }
    }
  }

  context += '\n### END DATA CONTEXT ###\n';
  return context;
};

const buildUserPrompt = (userQuery, data, intentType, intentDetails) => {
  let prompt = '';

  // Add instruction about what to do
  if (intentType === 'ORDERS') {
    prompt += `The user is asking about their orders. Here's their question: "${userQuery}"\n`;
  } else if (intentType === 'SALES') {
    prompt += `The user is asking about their sales data. Here's their question: "${userQuery}"\n`;
  } else if (intentType === 'PRODUCTS') {
    prompt += `The user is asking about products. Here's their question: "${userQuery}"\n`;
  } else if (intentType === 'CUSTOMERS') {
    prompt += `The user is asking about customers. Here's their question: "${userQuery}"\n`;
  } else if (intentType === 'ANALYTICS') {
    prompt += `The user is asking for business analytics. Here's their question: "${userQuery}"\n`;
  } else {
    prompt += `The user asked: "${userQuery}"\n`;
  }

  // Add status filter info if applicable
  if (intentDetails.status) {
    const statuses = Object.keys(intentDetails.status).filter((k) => intentDetails.status[k]);
    if (statuses.length > 0) {
      prompt += `Filter applied: Status in [${statuses.join(', ')}]\n`;
    }
  }

  // Add date range info if applicable
  if (intentDetails.dateRange && intentDetails.dateRange.matchedPhrase) {
    prompt += `Time period: ${intentDetails.dateRange.matchedPhrase}\n`;
  }

  // Add data context
  prompt += generateContextFromData(data, intentType);

  prompt += `\nAnswer in maximum 3 short lines using only the data above. Numbers first, explanation minimal.`;

  return prompt;
};

/**
 * Get system prompt based on intent
 */
const getSystemPrompt = (intentType) => {
  return SYSTEM_PROMPTS[intentType] || SYSTEM_PROMPTS.DEFAULT;
};

/**
 * Build complete prompt object for Gemini
 */
const buildCompletePrompt = (userQuery, data, intentType, intentDetails) => {
  const systemPrompt = getSystemPrompt(intentType);
  const userPrompt = buildUserPrompt(userQuery, data, intentType, intentDetails);

  return {
    systemPrompt,
    userPrompt,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  };
};

export {
  SYSTEM_PROMPTS,
  generateContextFromData,
  buildUserPrompt,
  getSystemPrompt,
  buildCompletePrompt,
};
