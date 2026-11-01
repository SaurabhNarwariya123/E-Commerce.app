import { INTENTS } from '../intents.js'
import { getNewOrders, getRecentOrders, getPendingOrders, getOrderStatus, getCancelledOrders, getUnverifiedCODOrders } from './orderTool.js'
import { getSalesSummary, getPreviousMonthRevenue, getTopSellingProduct, getTodaySalesSummary, getOrderTrend } from './insightsTool.js'
import { getActiveDeliveryPersons, getDeliveryPersonOrders, getOrderDeliveryStatus, getDelayedOrders } from './deliveryTool.js'
import { getLowStockProducts, getProductStock, getOutOfStockProducts } from './stockTool.js'
import { getTotalCustomers, getCustomerOrderHistory, getNewCustomers } from './customerTool.js'
import { getActiveCoupons } from './couponTool.js'

// Allowlist of everything the chatbot may run. Each entry names:
//   tool           - module that owns it (checked against INTENT_TOOL_MAP by routeToTool)
//   requiredParams - 'a_or_b' means either is enough
//   allowedParams  - the only params forwarded to the tool; anything else the LLM produced is dropped
//   sourceLabel    - what actually answered the question, shown to the admin
// Every tool is read-only.
export const TOOL_REGISTRY = {
    [INTENTS.NEW_ORDERS]: {
        tool: 'orderTool', fn: getNewOrders, requiredParams: [], allowedParams: ['sinceHours'], sourceLabel: 'Orders database',
    },
    [INTENTS.RECENT_ORDERS]: {
        tool: 'orderTool', fn: getRecentOrders, requiredParams: [], allowedParams: ['limit'], sourceLabel: 'Orders database',
    },
    [INTENTS.PENDING_ORDERS]: {
        tool: 'orderTool', fn: getPendingOrders, requiredParams: [], allowedParams: [], sourceLabel: 'Orders database',
    },
    [INTENTS.ORDER_STATUS]: {
        tool: 'orderTool', fn: getOrderStatus, requiredParams: ['orderId'], allowedParams: ['orderId'], sourceLabel: 'Orders database',
    },
    [INTENTS.CANCELLED_ORDERS]: {
        tool: 'orderTool', fn: getCancelledOrders, requiredParams: [], allowedParams: ['sinceDays'], sourceLabel: 'Orders database',
    },
    [INTENTS.UNVERIFIED_COD_ORDERS]: {
        tool: 'orderTool', fn: getUnverifiedCODOrders, requiredParams: [], allowedParams: [], sourceLabel: 'Orders database',
    },

    [INTENTS.SALES_SUMMARY]: {
        tool: 'insightsTool', fn: getSalesSummary, requiredParams: ['period_or_days'], allowedParams: ['period', 'days'], sourceLabel: 'Orders database (sales totals)',
    },
    [INTENTS.PREVIOUS_MONTH_REVENUE]: {
        tool: 'insightsTool', fn: getPreviousMonthRevenue, requiredParams: [], allowedParams: [], sourceLabel: 'Orders database (sales totals)',
    },
    [INTENTS.TOP_SELLING_PRODUCT]: {
        tool: 'insightsTool', fn: getTopSellingProduct, requiredParams: [], allowedParams: ['days'], sourceLabel: 'Orders database (sales totals)',
    },
    [INTENTS.TODAY_SALES_SUMMARY]: {
        tool: 'insightsTool', fn: getTodaySalesSummary, requiredParams: [], allowedParams: [], sourceLabel: 'Orders database (sales totals)',
    },
    [INTENTS.ORDER_TREND]: {
        tool: 'insightsTool', fn: getOrderTrend, requiredParams: [], allowedParams: ['days'], sourceLabel: 'Orders database (sales totals)',
    },

    [INTENTS.ACTIVE_DELIVERY_PERSONS]: {
        tool: 'deliveryTool', fn: getActiveDeliveryPersons, requiredParams: [], allowedParams: [], sourceLabel: 'Delivery persons',
    },
    [INTENTS.DELIVERY_PERSON_ORDERS]: {
        tool: 'deliveryTool', fn: getDeliveryPersonOrders, requiredParams: ['deliveryPersonName_or_deliveryPersonId'],
        allowedParams: ['deliveryPersonName', 'deliveryPersonId'], sourceLabel: 'Delivery persons + Orders database',
    },
    [INTENTS.ORDER_TRANSIT_STATUS]: {
        tool: 'deliveryTool', fn: getOrderDeliveryStatus, requiredParams: ['orderId'], allowedParams: ['orderId'], sourceLabel: 'Orders database',
    },
    [INTENTS.DELAYED_ORDERS]: {
        tool: 'deliveryTool', fn: getDelayedOrders, requiredParams: [], allowedParams: [], sourceLabel: 'Orders database',
    },

    [INTENTS.LOW_STOCK]: {
        tool: 'stockTool', fn: getLowStockProducts, requiredParams: [], allowedParams: ['threshold'], sourceLabel: 'Products stock',
    },
    [INTENTS.PRODUCT_STOCK]: {
        tool: 'stockTool', fn: getProductStock, requiredParams: ['productId_or_productName'], allowedParams: ['productId', 'productName'], sourceLabel: 'Products stock',
    },
    [INTENTS.OUT_OF_STOCK]: {
        tool: 'stockTool', fn: getOutOfStockProducts, requiredParams: [], allowedParams: [], sourceLabel: 'Products stock',
    },
    [INTENTS.TOTAL_CUSTOMERS]: {
        tool: 'customerTool', fn: getTotalCustomers, requiredParams: [], allowedParams: [], sourceLabel: 'Customers',
    },

    [INTENTS.CUSTOMER_ORDER_HISTORY]: {
        tool: 'customerTool', fn: getCustomerOrderHistory, requiredParams: ['customerId_or_customerName_or_customerEmail'],
        allowedParams: ['customerId', 'customerName', 'customerEmail'], sourceLabel: 'Customers + Orders database',
    },
    [INTENTS.NEW_CUSTOMERS]: {
        tool: 'customerTool', fn: getNewCustomers, requiredParams: [], allowedParams: ['sinceDays'], sourceLabel: 'Customers',
    },

    [INTENTS.ACTIVE_COUPONS]: {
        tool: 'couponTool', fn: getActiveCoupons, requiredParams: [], allowedParams: ['expiringWithinDays'], sourceLabel: 'Coupons',
    },
}
