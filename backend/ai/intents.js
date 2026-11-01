export const INTENTS = {
    NEW_ORDERS: 'NEW_ORDERS',
    RECENT_ORDERS: 'RECENT_ORDERS',
    PENDING_ORDERS: 'PENDING_ORDERS',
    ORDER_STATUS: 'ORDER_STATUS',
    CANCELLED_ORDERS: 'CANCELLED_ORDERS',
    UNVERIFIED_COD_ORDERS: 'UNVERIFIED_COD_ORDERS',
    SALES_SUMMARY: 'SALES_SUMMARY',
    PREVIOUS_MONTH_REVENUE: 'PREVIOUS_MONTH_REVENUE',
    TOP_SELLING_PRODUCT: 'TOP_SELLING_PRODUCT',
    TODAY_SALES_SUMMARY: 'TODAY_SALES_SUMMARY',
    ORDER_TREND: 'ORDER_TREND',
    ACTIVE_DELIVERY_PERSONS: 'ACTIVE_DELIVERY_PERSONS',
    DELIVERY_PERSON_ORDERS: 'DELIVERY_PERSON_ORDERS',
    ORDER_TRANSIT_STATUS: 'ORDER_TRANSIT_STATUS',
    DELAYED_ORDERS: 'DELAYED_ORDERS',
    LOW_STOCK: 'LOW_STOCK',
    PRODUCT_STOCK: 'PRODUCT_STOCK',
    OUT_OF_STOCK: 'OUT_OF_STOCK',
    TOTAL_CUSTOMERS: 'TOTAL_CUSTOMERS',
    CUSTOMER_ORDER_HISTORY: 'CUSTOMER_ORDER_HISTORY',
    NEW_CUSTOMERS: 'NEW_CUSTOMERS',
    ACTIVE_COUPONS: 'ACTIVE_COUPONS',
}

// Answered from indexed documents (RAG) instead of a database tool. Kept apart from INTENTS so the
// tool registry / validators, which cover every INTENTS entry, are unaffected.
export const RAG_INTENTS = {
    POLICY_QA: 'POLICY_QA',
    PRODUCT_SEARCH: 'PRODUCT_SEARCH',
}

export const RAG_INTENT_DESCRIPTIONS = {
    [RAG_INTENTS.POLICY_QA]: "A question about the store's own policies or help content: returns, refunds, exchanges, shipping/delivery terms, cancellation, privacy, terms and conditions, payment methods, gift wrapping, FAQs.",
    [RAG_INTENTS.PRODUCT_SEARCH]: 'Finding products in the catalog by description, style, colour, category or occasion (e.g. "red cotton shirts", "something for a wedding"). Not stock counts of a named product - that is PRODUCT_STOCK.',
}

// Intents that never reach a tool; they are classified but answered with a fixed reply.
export const NON_TOOL_INTENTS = ['GREETING', 'UNSUPPORTED_ACTION', 'UNKNOWN']

// Which tool module serves each intent. routeToTool checks the registry against this.
export const INTENT_TOOL_MAP = {
    [INTENTS.NEW_ORDERS]: 'orderTool',
    [INTENTS.RECENT_ORDERS]: 'orderTool',
    [INTENTS.PENDING_ORDERS]: 'orderTool',
    [INTENTS.ORDER_STATUS]: 'orderTool',
    [INTENTS.CANCELLED_ORDERS]: 'orderTool',
    [INTENTS.UNVERIFIED_COD_ORDERS]: 'orderTool',

    [INTENTS.SALES_SUMMARY]: 'insightsTool',
    [INTENTS.PREVIOUS_MONTH_REVENUE]: 'insightsTool',
    [INTENTS.TOP_SELLING_PRODUCT]: 'insightsTool',
    [INTENTS.TODAY_SALES_SUMMARY]: 'insightsTool',
    [INTENTS.ORDER_TREND]: 'insightsTool',

    [INTENTS.ACTIVE_DELIVERY_PERSONS]: 'deliveryTool',
    [INTENTS.DELIVERY_PERSON_ORDERS]: 'deliveryTool',
    [INTENTS.ORDER_TRANSIT_STATUS]: 'deliveryTool',
    [INTENTS.DELAYED_ORDERS]: 'deliveryTool',

    [INTENTS.LOW_STOCK]: 'stockTool',
    [INTENTS.PRODUCT_STOCK]: 'stockTool',
    [INTENTS.OUT_OF_STOCK]: 'stockTool',
    [INTENTS.TOTAL_CUSTOMERS]: 'customerTool',

    [INTENTS.CUSTOMER_ORDER_HISTORY]: 'customerTool',
    [INTENTS.NEW_CUSTOMERS]: 'customerTool',

    [INTENTS.ACTIVE_COUPONS]: 'couponTool',
}

// Shown to the classifier so it does not have to guess from the intent name alone.
export const INTENT_DESCRIPTIONS = {
    [INTENTS.NEW_ORDERS]: 'Orders placed in a recent time window (default last 24 hours). Params: sinceHours.',
    [INTENTS.RECENT_ORDERS]: 'The latest/most recent orders, regardless of date ("show my latest orders"). Params: limit.',
    [INTENTS.PENDING_ORDERS]: 'Orders still waiting to be processed (Order Placed / Order Confirmed).',
    [INTENTS.ORDER_STATUS]: 'Current status, amount and payment method of ONE specific order. Needs orderId.',
    [INTENTS.CANCELLED_ORDERS]: 'Orders that were cancelled. Params: sinceDays.',
    [INTENTS.UNVERIFIED_COD_ORDERS]: 'Open Cash-on-Delivery orders whose email OTP has not been verified.',
    [INTENTS.SALES_SUMMARY]: 'Revenue and order count for a period: today, yesterday, this_week, this_month, last_month, last_7_days, last_30_days, or last N days. Params: period, days.',
    [INTENTS.PREVIOUS_MONTH_REVENUE]: 'Revenue for the previous calendar month specifically.',
    [INTENTS.TOP_SELLING_PRODUCT]: 'The best-selling product by revenue. Params: days.',
    [INTENTS.TODAY_SALES_SUMMARY]: "Today's sales/revenue only.",
    [INTENTS.ORDER_TREND]: 'Day-by-day orders and revenue over the last N days. Params: days.',
    [INTENTS.ACTIVE_DELIVERY_PERSONS]: 'Which delivery person accounts are active.',
    [INTENTS.DELIVERY_PERSON_ORDERS]: 'Orders assigned to ONE named delivery person. Needs deliveryPersonName or deliveryPersonId.',
    [INTENTS.ORDER_TRANSIT_STATUS]: 'Delivery/transit progress and assigned delivery person of ONE order. Needs orderId.',
    [INTENTS.DELAYED_ORDERS]: 'Orders in transit that have not progressed for a long time.',
    [INTENTS.LOW_STOCK]: 'Products running low on stock (not yet zero). Params: threshold.',
    [INTENTS.PRODUCT_STOCK]: 'Stock levels of ONE specific product. Needs productName or productId.',
    [INTENTS.OUT_OF_STOCK]: 'Products with sizes at zero stock.',
    [INTENTS.TOTAL_CUSTOMERS]: 'How many customers are registered in total.',
    [INTENTS.CUSTOMER_ORDER_HISTORY]: "ONE customer's orders. Needs customerName, customerEmail or customerId.",
    [INTENTS.NEW_CUSTOMERS]: 'Customers who recently signed up. Params: sinceDays.',
    [INTENTS.ACTIVE_COUPONS]: 'Coupons that are active and not expired, including ones expiring soon. Params: expiringWithinDays.',
}

export const DELIVERY_PERSON_ORDERS_NEEDS_DELIVERY_TOOL = true

export const DELAYED_ORDER_THRESHOLD_HOURS = 24

export const IN_TRANSIT_STATUSES = ['Assigned', 'Out For delivery']
export const CANCELLABLE_ISH_PENDING_STATUSES = ['Order Placed', 'Order Confirmed']
