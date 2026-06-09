/**
 * MongoDB Query Service
 * Dynamically builds and executes queries based on detected intent
 */

import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

const COLLECTION_MODELS = {
  Order,
  User,
  Product,
};

/**
 * Fetch orders with optional filters
 */
const getOrdersData = async (userId, options = {}) => {
  const { dateRange, status, limit = 10 } = options;

  try {
    // Admin AI: fetch ALL orders (not filtered by userId)
    let query = {};

    // Apply date range filter (date field stored as milliseconds via Date.now())
    if (dateRange && dateRange.from && dateRange.to) {
      query.date = { $gte: dateRange.from.getTime(), $lte: dateRange.to.getTime() };
    }

    // Apply status filter
    if (status) {
      const statusKeys = Object.keys(status).filter((k) => status[k]);
      if (statusKeys.length > 0) {
        query.status = { $in: statusKeys.map((s) => s.charAt(0).toUpperCase() + s.slice(1)) };
      }
    }

    const orders = await Order.find(query).sort({ date: -1 }).limit(limit);

    return {
      count: orders.length,
      data: orders,
      summary: {
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + order.amount, 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.amount, 0) / orders.length : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Fetch sales data with aggregations
 */
const getSalesData = async (userId, options = {}) => {
  const { dateRange, limit = 10 } = options;

  try {
    const pipeline = [];

    // Admin AI: match all orders (no userId filter)
    pipeline.push({ $match: {} });

    // Apply date range filter (date field stored as milliseconds via Date.now())
    if (dateRange && dateRange.from && dateRange.to) {
      pipeline.push({
        $match: {
          date: { $gte: dateRange.from.getTime(), $lte: dateRange.to.getTime() },
        },
      });
    }

    // Group and calculate sales metrics
    pipeline.push({
      $group: {
        _id: null,
        totalSales: { $sum: '$amount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$amount' },
        maxOrderValue: { $max: '$amount' },
        minOrderValue: { $min: '$amount' },
      },
    });

    const salesData = await Order.aggregate(pipeline);

    return {
      data: salesData[0] || {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        maxOrderValue: 0,
        minOrderValue: 0,
      },
    };
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
};

/**
 * Fetch product data
 */
const getProductsData = async (options = {}) => {
  const { category, limit = 10, sortBy = 'bestseller' } = options;

  try {
    let query = {};

    if (category) {
      query.category = category;
    }

    const sortOrder = sortBy === 'bestseller' ? { bestseller: -1 } : { date: -1 };

    const products = await Product.find(query).sort(sortOrder).limit(limit);

    return {
      count: products.length,
      data: products,
      summary: {
        totalProducts: products.length,
        averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
        highestPrice: Math.max(...products.map((p) => p.price), 0),
        lowestPrice: Math.min(...products.map((p) => p.price), Infinity),
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch user data
 */
const getUsersData = async (options = {}) => {
  const { dateRange, limit = 10 } = options;

  try {
    let query = {};

    // Apply date range filter (createdAt field if exists)
    if (dateRange && dateRange.from && dateRange.to) {
      // Assuming users have a createdAt field or you use registration date
      // For this example, we'll fetch all users
    }

    const users = await User.find(query).select('-password').limit(limit);

    return {
      count: users.length,
      data: users,
      summary: {
        totalUsers: users.length,
      },
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Fetch top selling products with aggregation
 */
const getTopSellingProducts = async (options = {}) => {
  const { dateRange, limit = 5 } = options;

  try {
    const pipeline = [];

    // If date range filter is needed, first filter orders
    if (dateRange && dateRange.from && dateRange.to) {
      pipeline.push({
        $match: {
          date: { $gte: dateRange.from.getTime(), $lte: dateRange.to.getTime() },
        },
      });
    }

    // Unwind items array
    pipeline.push({ $unwind: '$items' });

    // Group by product and count
    pipeline.push({
      $group: {
        _id: '$items.id',
        count: { $sum: 1 },
        totalAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    });

    // Sort by count
    pipeline.push({ $sort: { count: -1 } });
    pipeline.push({ $limit: limit });

    const topProducts = await Order.aggregate(pipeline);

    // Fetch product details
    const productIds = topProducts.map((p) => p._id);
    const products = await Product.find({ _id: { $in: productIds } });

    const enrichedData = topProducts.map((tp) => {
      const product = products.find((p) => p._id.toString() === tp._id);
      return {
        product,
        sales: tp.count,
        totalRevenue: tp.totalAmount,
      };
    });

    return {
      count: enrichedData.length,
      data: enrichedData,
    };
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    throw error;
  }
};

/**
 * Compare sales between two periods
 */
const comparePeriodSales = async (userId, options = {}) => {
  const { period1, period2 } = options;

  try {
    const getSalesForPeriod = async (dateRange) => {
      const pipeline = [];
      // Admin AI: all orders, no userId filter
      pipeline.push({ $match: {} });

      if (dateRange && dateRange.from && dateRange.to) {
        pipeline.push({
          $match: {
            date: { $gte: dateRange.from.getTime(), $lte: dateRange.to.getTime() },
          },
        });
      }

      pipeline.push({
        $group: {
          _id: null,
          totalSales: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
        },
      });

      const result = await Order.aggregate(pipeline);
      return result[0] || { totalSales: 0, totalOrders: 0 };
    };

    const sales1 = await getSalesForPeriod(period1);
    const sales2 = await getSalesForPeriod(period2);

    const percentageChange = sales1.totalSales !== 0 
      ? ((sales2.totalSales - sales1.totalSales) / sales1.totalSales * 100).toFixed(2)
      : 0;

    return {
      period1: sales1,
      period2: sales2,
      comparison: {
        salesGrowth: percentageChange,
        orderGrowth: ((sales2.totalOrders - sales1.totalOrders) / (sales1.totalOrders || 1) * 100).toFixed(2),
      },
    };
  } catch (error) {
    console.error('Error comparing period sales:', error);
    throw error;
  }
};

/**
 * Generic data fetcher based on intent
 */
const fetchDataByIntent = async (userId, intentAnalysis) => {
  const { intent, dateRange, status } = intentAnalysis;

  if (!intent) {
    return null;
  }

  // Only apply dateRange if user explicitly mentioned a time phrase
  const effectiveDateRange = dateRange && dateRange.filter ? dateRange : null;

  try {
    switch (intent.intent) {
      case 'ORDERS':
        return await getOrdersData(userId, { dateRange: effectiveDateRange, status, limit: 50 });

      case 'SALES':
        return await getSalesData(userId, { dateRange: effectiveDateRange, limit: 50 });

      case 'PRODUCTS':
        return await getProductsData({ limit: 20 });

      case 'CUSTOMERS':
        return await getUsersData({ dateRange: effectiveDateRange, limit: 50 });

      case 'ANALYTICS': {
        const orders = await getOrdersData(userId, { dateRange: effectiveDateRange, status, limit: 50 });
        const products = await getProductsData({ limit: 10 });
        return { orders, products };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error('Error fetching data by intent:', error);
    throw error;
  }
};

export {
  getOrdersData,
  getSalesData,
  getProductsData,
  getUsersData,
  getTopSellingProducts,
  comparePeriodSales,
  fetchDataByIntent,
  COLLECTION_MODELS,
};
