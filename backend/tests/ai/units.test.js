import { describe, test, expect } from '@jest/globals'
import { sanitizeParams } from '../../ai/params.js'
import { resolvePeriod, istDateKey } from '../../ai/dateRanges.js'
import { validateToolResult, RESULT_SCHEMAS } from '../../ai/validators.js'
import { emptyMessage, formatAnswer, FORMATTERS } from '../../ai/formatters.js'
import { unsupportedFacts } from '../../ai/graph/nodes/validateAnswer.js'
import { INTENTS, INTENT_TOOL_MAP, INTENT_DESCRIPTIONS } from '../../ai/intents.js'
import { TOOL_REGISTRY } from '../../ai/tools/toolRegistry.js'
import { CASES, ORDER_ID } from './fixtures.js'

describe('intent tables are consistent', () => {
    test('every intent has a description, a registry entry, a formatter, a schema and a matching tool name', () => {
        for (const intent of Object.values(INTENTS)) {
            expect(INTENT_DESCRIPTIONS[intent]).toBeTruthy()
            expect(TOOL_REGISTRY[intent]).toBeDefined()
            expect(FORMATTERS[intent]).toBeInstanceOf(Function)
            expect(RESULT_SCHEMAS[intent]).toBeDefined()
            expect(INTENT_TOOL_MAP[intent]).toBe(TOOL_REGISTRY[intent].tool)
        }
    })

    test('every fixture is valid for its schema and formats without error', () => {
        for (const [intent, c] of Object.entries(CASES)) {
            expect(validateToolResult(intent, c.data)).toEqual({ ok: true, empty: false })
            expect(formatAnswer(intent, c.data)).toEqual(expect.any(String))
        }
    })
})

describe('sanitizeParams', () => {
    test('keeps values the admin actually wrote', () => {
        const p = sanitizeParams({ productName: 'Denim Jacket', customerEmail: 'a@b.com' }, 'stock of denim  jacket, user a@b.com')
        expect(p).toEqual({ productName: 'Denim Jacket', customerEmail: 'a@b.com' })
    })

    test('drops names, emails and ids the model made up', () => {
        const p = sanitizeParams({ productName: 'Silk Saree', orderId: ORDER_ID, customerEmail: 'x@y.com' }, 'what is low in stock')
        expect(p).toEqual({})
    })

    test('an id typed in the message wins; non-id strings are rejected as ids', () => {
        expect(sanitizeParams({ orderId: 'latest' }, `status of ${ORDER_ID}`)).toEqual({ orderId: ORDER_ID })
        expect(sanitizeParams({ orderId: 'not-an-id' }, 'status of not-an-id')).toEqual({})
    })

    test('an id from an earlier turn is allowed (follow-up questions)', () => {
        const history = [{ role: 'user', text: `track ${ORDER_ID}` }]
        expect(sanitizeParams({ orderId: ORDER_ID }, 'and its delivery person?', history)).toEqual({ orderId: ORDER_ID })
    })

    test('numbers are clamped and non-numbers dropped', () => {
        const p = sanitizeParams({ days: 99999, sinceHours: -5, limit: 500, threshold: 'many', sinceDays: 2.6, expiringWithinDays: NaN }, 'x')
        expect(p).toEqual({ days: 365, sinceHours: 1, limit: 20, sinceDays: 3 })
    })

    test('only known periods pass', () => {
        expect(sanitizeParams({ period: 'this_month' }, 'x')).toEqual({ period: 'this_month' })
        expect(sanitizeParams({ period: 'last_century' }, 'x')).toEqual({})
    })

    test('overlong strings are cut', () => {
        const long = 'a'.repeat(300)
        expect(sanitizeParams({ productName: long }, long).productName).toHaveLength(100)
    })
})

describe('dateRanges (IST)', () => {
    // 2026-10-20 23:30 UTC is already 2026-10-21 05:00 in IST.
    const now = Date.UTC(2026, 9, 20, 23, 30)

    test('today starts at IST midnight', () => {
        const r = resolvePeriod('today', now)
        expect(istDateKey(r.from)).toBe('2026-10-21')
        expect(r.from).toBe(Date.UTC(2026, 9, 20, 18, 30))
        expect(r.to).toBe(now)
    })

    test('this_month and last_month are adjacent calendar months', () => {
        const thisMonth = resolvePeriod('this_month', now)
        const lastMonth = resolvePeriod('last_month', now)
        expect(lastMonth.to).toBe(thisMonth.from)
        expect(istDateKey(thisMonth.from)).toBe('2026-10-01')
        expect(istDateKey(lastMonth.from)).toBe('2026-09-01')
        expect(lastMonth.label).toBe('September 2026')
    })

    test('last_month works across a year boundary', () => {
        const jan = Date.UTC(2027, 0, 10)
        const r = resolvePeriod('last_month', jan)
        expect(istDateKey(r.from)).toBe('2026-12-01')
        expect(r.label).toBe('December 2026')
    })

    test('this_week starts on Monday', () => {
        const wed = Date.UTC(2026, 9, 21, 6) // Wed 21 Oct 2026
        expect(istDateKey(resolvePeriod('this_week', wed).from)).toBe('2026-10-19')
    })

    test('days window and unknown period', () => {
        expect(resolvePeriod(undefined, now, 5).label).toBe('the last 5 days')
        expect(resolvePeriod('nonsense', now)).toBeNull()
    })
})

describe('validateToolResult', () => {
    test('null, empty arrays and zero totals are "empty", not errors', () => {
        expect(validateToolResult('ORDER_STATUS', null)).toEqual({ ok: true, empty: true })
        expect(validateToolResult('ACTIVE_DELIVERY_PERSONS', [])).toEqual({ ok: true, empty: true })
        expect(validateToolResult('PENDING_ORDERS', { orders: [], total: 0 })).toEqual({ ok: true, empty: true })
    })

    test('numeric zero and zero-revenue summaries are real values', () => {
        expect(validateToolResult('TOTAL_CUSTOMERS', 0)).toEqual({ ok: true, empty: false })
        const zero = { periodLabel: 'today', totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, cancelledOrders: 0 }
        expect(validateToolResult('TODAY_SALES_SUMMARY', zero)).toEqual({ ok: true, empty: false })
    })

    test('wrong shapes and missing required fields are errors', () => {
        expect(validateToolResult('TOTAL_CUSTOMERS', 'many').ok).toBe(false)
        expect(validateToolResult('TOTAL_CUSTOMERS', undefined).empty).toBe(true)
        expect(validateToolResult('TOTAL_CUSTOMERS', -3).ok).toBe(false)
        expect(validateToolResult('PENDING_ORDERS', { orders: [{ _id: 'x', status: 'Order Placed' }], total: 1 }).ok).toBe(false)
        expect(validateToolResult('TODAY_SALES_SUMMARY', { periodLabel: 'today', totalRevenue: null, totalOrders: 1, avgOrderValue: 1, cancelledOrders: 0 }).ok).toBe(false)
        expect(validateToolResult('LOW_STOCK', { products: [] }).ok).toBe(false)
    })

    test('an ambiguous match is a valid, non-empty result', () => {
        expect(validateToolResult('PRODUCT_STOCK', { ambiguous: ['A', 'B'] })).toEqual({ ok: true, empty: false })
    })
})

describe('formatters', () => {
    test('window label follows the data, not a hard-coded 24 hours', () => {
        const d = { orders: [CASES.PENDING_ORDERS.data.orders[0]], total: 1, window: { sinceHours: 6 } }
        expect(formatAnswer('NEW_ORDERS', d)).toContain('last 6 hours')
        expect(formatAnswer('NEW_ORDERS', d)).not.toContain('24')
    })

    test('empty messages say what was searched for', () => {
        expect(emptyMessage('ORDER_STATUS', null, { orderId: ORDER_ID })).toContain(ORDER_ID)
        expect(emptyMessage('PRODUCT_STOCK', null, { productName: 'Silk Saree' })).toContain('Silk Saree')
        expect(emptyMessage('DELIVERY_PERSON_ORDERS', null, { deliveryPersonName: 'Raj' })).toContain('Raj')
        expect(emptyMessage('DELIVERY_PERSON_ORDERS', { personName: 'Raj', orders: [], total: 0 }, {})).toBe('Raj has no assigned orders.')
        expect(emptyMessage('ACTIVE_COUPONS', { coupons: [], total: 0 }, { expiringWithinDays: 7 })).toContain('within 7 days')
    })

    test('stock with no data is "no stock data", not "0 in stock"', () => {
        expect(formatAnswer('PRODUCT_STOCK', { name: 'Cap', sizes: [], hasStockData: false })).toBe('Cap has no stock data recorded.')
    })

    test('formatter returns null on unexpected data instead of throwing', () => {
        expect(formatAnswer('LOW_STOCK', {})).toBeNull()
    })

    test('a missing amount is never shown as zero', () => {
        const line = formatAnswer('ORDER_STATUS', { _id: ORDER_ID, status: 'Order Placed', amount: null, paymentMethod: 'COD', date: 1 })
        expect(line).toContain('amount unavailable')
        expect(line).not.toContain('₹0')
    })
})

describe('unsupportedFacts', () => {
    const context = JSON.stringify({ total: 1250.5, count: 7, id: ORDER_ID })

    test('accepts numbers and ids found in the data or the question', () => {
        expect(unsupportedFacts(`Total ₹1,250.5 across 7 orders, order ${ORDER_ID}, last 30 days`, context, 'last 30 days')).toEqual([])
    })

    test('flags invented numbers and ids', () => {
        expect(unsupportedFacts('Total ₹9,999 across 7 orders', context)).toEqual(['9999'])
        expect(unsupportedFacts('See order 0123456789abcdef01234567', context)).toContain('0123456789abcdef01234567')
    })
})
