// Valid tool results (the shape each tool really returns), one per intent, plus a question
// and classifier output that should lead to it. Values are deliberately distinctive so a test
// can tell whether an answer used the right data.
const NOW = Date.UTC(2026, 9, 20, 6, 0, 0)

export const ORDER_ID = 'a1b2c3d4e5f60718293a4b5c'
export const ORDER_ID_2 = '0123456789abcdef01234567'

export const order = (over = {}) => ({
    _id: ORDER_ID, status: 'Order Placed', amount: 1499, paymentMethod: 'COD', date: NOW, ...over,
})

const orderList = (orders, total = orders.length, extra = {}) => ({ orders, total, ...extra })

export const CASES = {
    NEW_ORDERS: {
        question: 'Which orders came in during the last 12 hours?',
        classify: { intent: 'NEW_ORDERS', sinceHours: 12 },
        data: orderList([order()], 1, { window: { sinceHours: 12 } }),
        expect: [ORDER_ID, '₹1,499', 'last 12 hours'],
    },
    RECENT_ORDERS: {
        question: 'Show my latest orders',
        classify: { intent: 'RECENT_ORDERS' },
        data: orderList([order(), order({ _id: ORDER_ID_2, status: 'Delivered', amount: 899, paymentMethod: 'Stripe' })], 40),
        expect: [ORDER_ID, ORDER_ID_2, '₹899', 'of 40 total'],
    },
    PENDING_ORDERS: {
        question: 'How many orders are pending?',
        classify: { intent: 'PENDING_ORDERS' },
        data: orderList([order()], 37),
        expect: ['37 orders pending', '...and 36 more'],
    },
    ORDER_STATUS: {
        question: `What is the status of order ${ORDER_ID}?`,
        classify: { intent: 'ORDER_STATUS', orderId: ORDER_ID },
        data: order({ status: 'Delivered' }),
        expect: [`Order #${ORDER_ID}`, '"Delivered"', '₹1,499'],
    },
    CANCELLED_ORDERS: {
        question: 'Cancelled orders in the last 3 days',
        classify: { intent: 'CANCELLED_ORDERS', sinceDays: 3 },
        data: orderList([order({ status: 'Cancelled' })], 1, { window: { sinceDays: 3 } }),
        expect: ['cancelled in the last 3 days', 'Cancelled'],
    },
    UNVERIFIED_COD_ORDERS: {
        question: 'Any COD orders where the OTP is not verified?',
        classify: { intent: 'UNVERIFIED_COD_ORDERS' },
        data: orderList([order()], 1),
        expect: ['unverified COD OTP', ORDER_ID],
    },
    SALES_SUMMARY: {
        question: 'What were my sales this month?',
        classify: { intent: 'SALES_SUMMARY', period: 'this_month' },
        data: { periodLabel: 'this month (October 2026)', from: 0, to: 1, totalRevenue: 125000, totalOrders: 42, avgOrderValue: 2976.19, cancelledOrders: 3 },
        expect: ['this month (October 2026)', '₹1,25,000', '42 orders', '3 cancelled orders excluded'],
    },
    PREVIOUS_MONTH_REVENUE: {
        question: 'Revenue of last month?',
        classify: { intent: 'PREVIOUS_MONTH_REVENUE' },
        data: { periodLabel: 'September 2026', from: 0, to: 1, totalRevenue: 98000, totalOrders: 30, avgOrderValue: 3266.67, cancelledOrders: 0 },
        expect: ['September 2026', '₹98,000', '30 orders'],
    },
    TOP_SELLING_PRODUCT: {
        question: 'Best selling product this month',
        classify: { intent: 'TOP_SELLING_PRODUCT', days: 30 },
        data: { name: 'Linen Shirt', unitsSold: 18, revenue: 27000, days: 30 },
        expect: ['Linen Shirt', '18 units', '₹27,000', 'last 30 days'],
    },
    TODAY_SALES_SUMMARY: {
        question: "How are today's sales?",
        classify: { intent: 'TODAY_SALES_SUMMARY' },
        data: { periodLabel: 'today', from: 0, to: 1, totalRevenue: 4500, totalOrders: 3, avgOrderValue: 1500, cancelledOrders: 0 },
        expect: ['today', '₹4,500', '3 orders'],
    },
    ORDER_TREND: {
        question: 'Order trend for the last 3 days',
        classify: { intent: 'ORDER_TREND', days: 3 },
        data: {
            days: 3, totalOrders: 6, totalRevenue: 9000,
            daily: [{ date: '2026-10-18', orders: 1, revenue: 1000 }, { date: '2026-10-19', orders: 0, revenue: 0 }, { date: '2026-10-20', orders: 5, revenue: 8000 }],
        },
        expect: ['6 orders', '₹9,000', 'Best day: 2026-10-20', '2026-10-19: 0 orders, ₹0'],
    },
    ACTIVE_DELIVERY_PERSONS: {
        question: 'Who is on delivery duty?',
        classify: { intent: 'ACTIVE_DELIVERY_PERSONS' },
        data: [{ _id: 'd1', name: 'Ravi Kumar' }, { _id: 'd2', name: 'Amit Singh' }],
        expect: ['2 active delivery person accounts', 'Ravi Kumar', 'Amit Singh'],
    },
    DELIVERY_PERSON_ORDERS: {
        question: 'Orders assigned to Ravi Kumar',
        classify: { intent: 'DELIVERY_PERSON_ORDERS', deliveryPersonName: 'Ravi Kumar' },
        data: { personName: 'Ravi Kumar', ...orderList([order({ status: 'Assigned' })], 1) },
        expect: ['assigned to Ravi Kumar', 'Assigned'],
    },
    ORDER_TRANSIT_STATUS: {
        question: `Where is order ${ORDER_ID} right now?`,
        classify: { intent: 'ORDER_TRANSIT_STATUS', orderId: ORDER_ID },
        data: { orderId: ORDER_ID, status: 'Out For delivery', statusHistory: [], deliveryPersonName: 'Ravi Kumar' },
        expect: [`Order #${ORDER_ID}`, 'Out For delivery', 'Ravi Kumar'],
    },
    DELAYED_ORDERS: {
        question: 'Which deliveries are delayed?',
        classify: { intent: 'DELAYED_ORDERS' },
        data: orderList([order({ status: 'Assigned' })], 1, { window: { thresholdHours: 24 }, incomplete: false }),
        expect: ['no status update for 24+ hours', ORDER_ID],
    },
    LOW_STOCK: {
        question: 'How many products are low in stock?',
        classify: { intent: 'LOW_STOCK' },
        data: { threshold: 5, total: 2, untracked: 1, products: [{ _id: 'p1', name: 'Denim Jacket', sizes: [{ size: 'M', qty: 2 }] }, { _id: 'p2', name: 'Cotton Tee', sizes: [{ size: 'L', qty: 4 }] }] },
        expect: ['2 products', 'Denim Jacket (M: 2)', 'Cotton Tee (L: 4)', '1 product has no stock data'],
    },
    PRODUCT_STOCK: {
        question: 'Stock of Denim Jacket',
        classify: { intent: 'PRODUCT_STOCK', productName: 'Denim Jacket' },
        data: { _id: 'p1', name: 'Denim Jacket', hasStockData: true, sizes: [{ size: 'M', qty: 2 }, { size: 'L', qty: 0 }] },
        expect: ['Denim Jacket has 2 units', 'M: 2', 'L: 0'],
    },
    OUT_OF_STOCK: {
        question: 'Which products are out of stock?',
        classify: { intent: 'OUT_OF_STOCK' },
        data: { total: 2, fullyOutCount: 1, untracked: 0, products: [{ _id: 'p1', name: 'Wool Scarf', sizes: [{ size: 'Free', qty: 0 }], fullyOut: true }, { _id: 'p2', name: 'Denim Jacket', sizes: [{ size: 'L', qty: 0 }], fullyOut: false }] },
        expect: ['2 products', '1 completely out', 'Wool Scarf (all sizes out)', 'Denim Jacket (out: L)'],
    },
    TOTAL_CUSTOMERS: {
        question: 'How many customers do we have?',
        classify: { intent: 'TOTAL_CUSTOMERS' },
        data: 128,
        expect: ['128 customers'],
    },
    CUSTOMER_ORDER_HISTORY: {
        question: 'Order history of Priya Sharma',
        classify: { intent: 'CUSTOMER_ORDER_HISTORY', customerName: 'Priya Sharma' },
        data: { customerName: 'Priya Sharma', ...orderList([order()], 1) },
        expect: ['placed by Priya Sharma', ORDER_ID],
    },
    NEW_CUSTOMERS: {
        question: 'New signups in the last 5 days',
        classify: { intent: 'NEW_CUSTOMERS', sinceDays: 5 },
        data: { sinceDays: 5, total: 1, customers: [{ _id: 'u1', name: 'Neha Verma', email: 'neha@example.com', createdAt: new Date('2026-10-18T10:00:00Z') }] },
        expect: ['1 new customer in the last 5 days', 'Neha Verma'],
    },
    ACTIVE_COUPONS: {
        question: 'Which coupons expire within 7 days?',
        classify: { intent: 'ACTIVE_COUPONS', expiringWithinDays: 7 },
        data: { expiringWithinDays: 7, total: 1, coupons: [{ code: 'SAVE20', discountType: 'percent', discountValue: 20, expiryDate: new Date('2026-10-25T00:00:00Z'), usageLimit: 100, usedCount: 40 }] },
        expect: ['expiring within 7 days', 'SAVE20 - 20% off', 'used 40/100'],
    },
}
