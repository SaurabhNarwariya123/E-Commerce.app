/**
 * Response Formatter Service
 * Formats AI responses into user-friendly formats
 */

const formatTableData = (data, columns = []) => {
  if (!Array.isArray(data) || data.length === 0) return '';

  // Auto-detect columns if not provided
  if (columns.length === 0 && data.length > 0) {
    columns = Object.keys(data[0]);
  }

  // Create table
  let table = '| ' + columns.join(' | ') + ' |\n';
  table += '| ' + columns.map(() => '---').join(' | ') + ' |\n';

  data.forEach((row) => {
    const values = columns.map((col) => {
      let value = row[col];
      if (typeof value === 'object') value = JSON.stringify(value);
      return String(value).substring(0, 50);
    });
    table += '| ' + values.join(' | ') + ' |\n';
  });

  return table;
};

const formatOrdersResponse = (orders) => {
  if (!orders || !Array.isArray(orders)) return '';

  let formatted = '';
  orders.forEach((order) => {
    formatted += `\n📦 **Order ${order._id}**\n`;
    formatted += `   • Amount: $${order.amount}\n`;
    formatted += `   • Status: ${order.status}\n`;
    formatted += `   • Date: ${new Date(order.date * 1000).toLocaleDateString()}\n`;
    formatted += `   • Payment: ${order.payment ? '✅ Paid' : '⏳ Pending'}\n`;
  });

  return formatted;
};

const formatSalesResponse = (salesData) => {
  if (!salesData) return '';

  const data = salesData.data || salesData;
  let formatted = '';

  formatted += `\n💰 **Sales Summary**\n`;
  formatted += `   • Total Sales: $${(data.totalSales || 0).toFixed(2)}\n`;
  formatted += `   • Total Orders: ${data.totalOrders || 0}\n`;
  formatted += `   • Average Order Value: $${(data.averageOrderValue || 0).toFixed(2)}\n`;
  if (data.maxOrderValue) {
    formatted += `   • Highest Order: $${(data.maxOrderValue).toFixed(2)}\n`;
    formatted += `   • Lowest Order: $${(data.minOrderValue).toFixed(2)}\n`;
  }

  return formatted;
};

const formatProductsResponse = (products) => {
  if (!products || !Array.isArray(products)) return '';

  let formatted = '';
  products.forEach((product) => {
    formatted += `\n📦 **${product.name}**\n`;
    formatted += `   • Price: $${product.price}\n`;
    formatted += `   • Category: ${product.category}\n`;
    formatted += `   • Bestseller: ${product.bestseller ? '⭐ Yes' : 'No'}\n`;
  });

  return formatted;
};

const addConfidenceIndicator = (response, confidence) => {
  let indicator = '';
  if (confidence > 80) {
    indicator = '✅ High Confidence';
  } else if (confidence > 50) {
    indicator = '⚠️ Medium Confidence';
  } else {
    indicator = '❓ Low Confidence';
  }

  return `${response}\n\n*[${indicator}]*`;
};

/**
 * Wrap response with metadata
 */
const formatFinalResponse = (aiResponse, metadata = {}) => {
  const { intentType, confidence, dataSource, timestamp } = metadata;

  let formatted = aiResponse;

  // Add data source info if available
  if (dataSource) {
    formatted += `\n\n**Data Source:** ${dataSource}`;
  }

  // Add timestamp
  if (timestamp) {
    formatted += `\n**Generated:** ${new Date(timestamp).toLocaleString()}`;
  }

  return formatted;
};

/**
 * Format comparison data
 */
const formatComparisonResponse = (comparison) => {
  if (!comparison) return '';

  let formatted = '\n📊 **Period Comparison**\n';

  if (comparison.period1) {
    formatted += `\n**Period 1:**\n`;
    formatted += `   • Sales: $${(comparison.period1.totalSales || 0).toFixed(2)}\n`;
    formatted += `   • Orders: ${comparison.period1.totalOrders || 0}\n`;
  }

  if (comparison.period2) {
    formatted += `\n**Period 2:**\n`;
    formatted += `   • Sales: $${(comparison.period2.totalSales || 0).toFixed(2)}\n`;
    formatted += `   • Orders: ${comparison.period2.totalOrders || 0}\n`;
  }

  if (comparison.comparison) {
    formatted += `\n**Change:**\n`;
    formatted += `   • Sales Growth: ${comparison.comparison.salesGrowth}%\n`;
    formatted += `   • Order Growth: ${comparison.comparison.orderGrowth}%\n`;
  }

  return formatted;
};

/**
 * Format error response
 */
const formatErrorResponse = (error) => {
  let response = '❌ **Error**\n';
  response += `${error}\n\n`;
  response += 'Please try rephrasing your question or contact support if the issue persists.';

  return response;
};

/**
 * Create markdown formatted response
 */
const formatMarkdownResponse = (content, format = 'text') => {
  if (format === 'list' && Array.isArray(content)) {
    return content.map((item) => `- ${item}`).join('\n');
  }

  if (format === 'table' && Array.isArray(content)) {
    return formatTableData(content);
  }

  return content;
};

/**
 * Main formatter function
 */
const formatResponse = (aiResponse, options = {}) => {
  const {
    includeMetadata = true,
    metadata = {},
    includeFormatting = true,
    format = 'text',
  } = options;

  let response = aiResponse;

  // Apply formatting
  if (includeFormatting) {
    response = formatMarkdownResponse(response, format);
  }

  // Add metadata
  if (includeMetadata && Object.keys(metadata).length > 0) {
    response = formatFinalResponse(response, metadata);
  }

  return response;
};

export {
  formatTableData,
  formatOrdersResponse,
  formatSalesResponse,
  formatProductsResponse,
  addConfidenceIndicator,
  formatFinalResponse,
  formatComparisonResponse,
  formatErrorResponse,
  formatMarkdownResponse,
  formatResponse,
};
