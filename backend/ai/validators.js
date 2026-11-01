import { z } from 'zod'
import { INTENTS } from './intents.js'

// ObjectIds arrive as objects from .lean(), so accept anything that stringifies to a non-empty id.
const id = z.custom(v => v !== null && v !== undefined && String(v).length > 0, 'id required')
const count = z.number().int().min(0)
const money = z.number().finite()

const orderRow = z.looseObject({
    _id: id,
    status: z.string().min(1),
    amount: money,
    paymentMethod: z.string().min(1),
})

const ambiguous = z.object({ ambiguous: z.array(z.string()).min(1) })

const orderList = z.looseObject({ orders: z.array(orderRow), total: count })

const salesSummary = z.looseObject({
    periodLabel: z.string(),
    totalRevenue: money,
    totalOrders: count,
    avgOrderValue: money,
    cancelledOrders: count,
})

const sizeQty = z.object({ size: z.string(), qty: z.number().finite() })

export const RESULT_SCHEMAS = {
    [INTENTS.NEW_ORDERS]: orderList,
    [INTENTS.RECENT_ORDERS]: orderList,
    [INTENTS.PENDING_ORDERS]: orderList,
    [INTENTS.CANCELLED_ORDERS]: orderList,
    [INTENTS.UNVERIFIED_COD_ORDERS]: orderList,
    [INTENTS.DELAYED_ORDERS]: orderList,
    [INTENTS.ORDER_STATUS]: orderRow,
    [INTENTS.ORDER_TRANSIT_STATUS]: z.looseObject({
        orderId: id,
        status: z.string().min(1),
        statusHistory: z.array(z.any()),
        deliveryPersonName: z.string().nullable(),
    }),

    [INTENTS.SALES_SUMMARY]: salesSummary,
    [INTENTS.PREVIOUS_MONTH_REVENUE]: salesSummary,
    [INTENTS.TODAY_SALES_SUMMARY]: salesSummary,
    [INTENTS.TOP_SELLING_PRODUCT]: z.looseObject({ name: z.string().min(1), unitsSold: money, revenue: money, days: count }),
    [INTENTS.ORDER_TREND]: z.looseObject({
        days: count,
        daily: z.array(z.object({ date: z.string(), orders: count, revenue: money })),
        totalOrders: count,
        totalRevenue: money,
    }),

    [INTENTS.ACTIVE_DELIVERY_PERSONS]: z.array(z.looseObject({ name: z.string().min(1) })),
    [INTENTS.DELIVERY_PERSON_ORDERS]: z.union([
        ambiguous,
        z.looseObject({ personName: z.string(), orders: z.array(orderRow), total: count }),
    ]),

    [INTENTS.LOW_STOCK]: z.looseObject({
        threshold: count,
        products: z.array(z.looseObject({ name: z.string(), sizes: z.array(sizeQty) })),
        total: count,
        untracked: count,
    }),
    [INTENTS.OUT_OF_STOCK]: z.looseObject({
        products: z.array(z.looseObject({ name: z.string(), sizes: z.array(sizeQty), fullyOut: z.boolean() })),
        total: count,
        fullyOutCount: count,
        untracked: count,
    }),
    [INTENTS.PRODUCT_STOCK]: z.union([
        ambiguous,
        z.looseObject({ name: z.string(), sizes: z.array(sizeQty), hasStockData: z.boolean() }),
    ]),

    [INTENTS.TOTAL_CUSTOMERS]: count,
    [INTENTS.CUSTOMER_ORDER_HISTORY]: z.union([
        ambiguous,
        z.looseObject({ customerName: z.string(), orders: z.array(orderRow), total: count }),
    ]),
    [INTENTS.NEW_CUSTOMERS]: z.looseObject({
        sinceDays: count,
        customers: z.array(z.looseObject({ name: z.string() })),
        total: count,
    }),

    [INTENTS.ACTIVE_COUPONS]: z.looseObject({
        coupons: z.array(z.looseObject({
            code: z.string(),
            discountType: z.enum(['percent', 'flat']),
            discountValue: money,
            expiryDate: z.any(),
        })),
        total: count,
    }),
}

// "Nothing matched" is a valid outcome and different from an error; a zero total or a null record means no match.
// Numeric zero (e.g. 0 customers) and zero-revenue summaries are real values, not empty results.
export const isEmptyResult = (result) => {
    if (result === null || result === undefined) return true
    if (Array.isArray(result)) return result.length === 0
    if (typeof result === 'object' && !result.ambiguous && typeof result.total === 'number') return result.total === 0
    return false
}

// -> { ok: true, empty } | { ok: false, error }
export const validateToolResult = (intent, result) => {
    if (isEmptyResult(result)) return { ok: true, empty: true }
    const schema = RESULT_SCHEMAS[intent]
    if (!schema) return { ok: false, error: `no result schema for ${intent}` }
    const parsed = schema.safeParse(result)
    if (!parsed.success) {
        return { ok: false, error: parsed.error.issues.slice(0, 3).map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }
    }
    return { ok: true, empty: false }
}
