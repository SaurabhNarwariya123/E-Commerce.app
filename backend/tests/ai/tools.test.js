import { jest, describe, test, expect, afterEach } from '@jest/globals'
import orderModel from '../../models/orderModel.js'
import productModel from '../../models/productModel.js'
import userModel from '../../models/userModel.js'
import couponModel from '../../models/couponModel.js'
import { getLowStockProducts, getOutOfStockProducts, getProductStock } from '../../ai/tools/stockTool.js'
import { findOrders, getNewOrders, getUnverifiedCODOrders, getOrderStatus } from '../../ai/tools/orderTool.js'
import { getSalesSummary, getOrderTrend, getTopSellingProduct } from '../../ai/tools/insightsTool.js'
import { getActiveCoupons } from '../../ai/tools/couponTool.js'
import { getCustomerOrderHistory, getNewCustomers } from '../../ai/tools/customerTool.js'
import { getDelayedOrders } from '../../ai/tools/deliveryTool.js'
import { ORDER_ID } from './fixtures.js'

afterEach(() => jest.restoreAllMocks())

const leanQuery = (rows) => {
    const q = { select: () => q, sort: () => q, limit: () => q, lean: () => Promise.resolve(rows) }
    return q
}

const PRODUCTS = [
    { _id: 'p1', name: 'Denim Jacket', stock: { S: 10, M: 2, L: 0 } },
    { _id: 'p2', name: 'Wool Scarf', stock: { Free: 0 } },
    { _id: 'p3', name: 'Cotton Tee', stock: { M: 50, L: 4 } },
    { _id: 'p4', name: 'Mystery Item', stock: {} },
]
const stubProducts = () => jest.spyOn(productModel, 'find').mockReturnValue(leanQuery(PRODUCTS))

describe('stockTool: low stock and out of stock are different answers', () => {
    // Regression: the old OUT_OF_STOCK called the low-stock controller with threshold 0, which the controller
    // turned into 5 (Number(0) || 5), so both questions returned the same list.
    test('low stock lists sizes between 1 and the threshold only', async () => {
        stubProducts()
        const r = await getLowStockProducts({ threshold: 5 })
        expect(r.products.map(p => [p.name, p.sizes])).toEqual([
            ['Denim Jacket', [{ size: 'M', qty: 2 }]],
            ['Cotton Tee', [{ size: 'L', qty: 4 }]],
        ])
        expect(r.total).toBe(2)
        expect(r.untracked).toBe(1)
    })

    test('out of stock lists zero-quantity sizes only', async () => {
        stubProducts()
        const r = await getOutOfStockProducts()
        expect(r.products.map(p => [p.name, p.fullyOut])).toEqual([['Denim Jacket', false], ['Wool Scarf', true]])
        expect(r.fullyOutCount).toBe(1)
        expect(r.untracked).toBe(1)
    })

    test('the two results do not overlap', async () => {
        stubProducts()
        const low = await getLowStockProducts()
        const out = await getOutOfStockProducts()
        for (const p of low.products) for (const s of p.sizes) expect(s.qty).toBeGreaterThan(0)
        for (const p of out.products) for (const s of p.sizes) expect(s.qty).toBe(0)
    })

    test('threshold is honoured', async () => {
        stubProducts()
        const r = await getLowStockProducts({ threshold: 50 })
        expect(r.products.find(p => p.name === 'Cotton Tee').sizes).toEqual([{ size: 'M', qty: 50 }, { size: 'L', qty: 4 }])
    })

    test('stock stored as a Map (live Mongoose docs) is read correctly', async () => {
        jest.spyOn(productModel, 'find').mockReturnValue(leanQuery([{ _id: 'm', name: 'Map Item', stock: new Map([['M', 1]]) }]))
        expect((await getLowStockProducts()).products[0].sizes).toEqual([{ size: 'M', qty: 1 }])
    })

    test('single product: exact match, no stock data, ambiguity and not found', async () => {
        const find = jest.spyOn(productModel, 'find')
        find.mockReturnValueOnce(leanQuery([PRODUCTS[0]]))
        expect(await getProductStock({ productName: 'denim jacket' })).toMatchObject({ name: 'Denim Jacket', hasStockData: true })

        find.mockReturnValueOnce(leanQuery([PRODUCTS[3]]))
        expect(await getProductStock({ productName: 'Mystery Item' })).toMatchObject({ hasStockData: false, sizes: [] })

        find.mockReturnValueOnce(leanQuery([])).mockReturnValueOnce(leanQuery([PRODUCTS[0], { ...PRODUCTS[2], name: 'Denim Tee' }]))
        expect(await getProductStock({ productName: 'denim' })).toEqual({ ambiguous: ['Denim Jacket', 'Denim Tee'] })

        find.mockReturnValueOnce(leanQuery([])).mockReturnValueOnce(leanQuery([]))
        expect(await getProductStock({ productName: 'ghost' })).toBeNull()
    })

    test('product name is escaped before use in a regex', async () => {
        const find = jest.spyOn(productModel, 'find').mockReturnValue(leanQuery([]))
        await getProductStock({ productName: '.*' })
        expect(find.mock.calls[0][0].name.source).toBe('^\\.\\*$')
    })
})

describe('orderTool', () => {
    const stubOrders = (rows, total) => {
        const find = jest.spyOn(orderModel, 'find').mockReturnValue(leanQuery(rows))
        const count = jest.spyOn(orderModel, 'countDocuments').mockResolvedValue(total)
        return { find, count }
    }

    test('total is the real count even when the list is capped', async () => {
        stubOrders([{ _id: 1 }], 500)
        expect(await findOrders({ status: 'x' })).toEqual({ orders: [{ _id: 1 }], total: 500 })
    })

    test('only whitelisted fields are selected: no address, items or OTP', async () => {
        const q = leanQuery([])
        const select = jest.spyOn(q, 'select')
        jest.spyOn(orderModel, 'find').mockReturnValue(q)
        jest.spyOn(orderModel, 'countDocuments').mockResolvedValue(0)
        await findOrders()
        const fields = select.mock.calls[0][0].split(' ')
        for (const secret of ['otp', 'otpExpiry', 'deliveryOtp', 'deliveryOtpExpiry', 'address', 'items', 'userId']) {
            expect(fields).not.toContain(secret)
        }
        expect(fields).toContain('status')
    })

    test('new orders filter uses the requested window and reports it', async () => {
        const { find } = stubOrders([], 0)
        const before = Date.now()
        const r = await getNewOrders({ sinceHours: 6 })
        const cutoff = find.mock.calls[0][0].date.$gte
        expect(before - cutoff).toBeGreaterThanOrEqual(6 * 3600 * 1000 - 50)
        expect(before - cutoff).toBeLessThan(6 * 3600 * 1000 + 5000)
        expect(r.window).toEqual({ sinceHours: 6 })
    })

    test('unverified COD excludes finished orders', async () => {
        const { find } = stubOrders([], 0)
        await getUnverifiedCODOrders()
        expect(find.mock.calls[0][0]).toMatchObject({ paymentMethod: 'COD', status: { $nin: ['Cancelled', 'Delivered'] } })
    })

    test('an invalid order id returns null without querying', async () => {
        const spy = jest.spyOn(orderModel, 'findById')
        expect(await getOrderStatus({ orderId: 'nope' })).toBeNull()
        expect(spy).not.toHaveBeenCalled()
    })

    test('delayed orders: only those stuck longer than the threshold, and flags truncation', async () => {
        const old = new Date(Date.now() - 48 * 3600 * 1000)
        const fresh = new Date(Date.now() - 1 * 3600 * 1000)
        stubOrders([
            { _id: 'a', status: 'Assigned', amount: 1, paymentMethod: 'COD', date: 1, statusHistory: [{ status: 'Assigned', timestamp: old }] },
            { _id: 'b', status: 'Assigned', amount: 1, paymentMethod: 'COD', date: 1, statusHistory: [{ status: 'Assigned', timestamp: fresh }] },
        ], 350)
        const r = await getDelayedOrders()
        expect(r.orders.map(o => o._id)).toEqual(['a'])
        expect(r.total).toBe(1)
        expect(r.incomplete).toBe(true)
    })
})

describe('insightsTool', () => {
    test('sales summary: cancelled orders are excluded from revenue and counted separately', async () => {
        const agg = jest.spyOn(orderModel, 'aggregate').mockResolvedValue([
            { _id: false, orders: 4, revenue: 10000 },
            { _id: true, orders: 2, revenue: 5000 },
        ])
        const r = await getSalesSummary({ period: 'this_month' })
        expect(r).toMatchObject({ totalRevenue: 10000, totalOrders: 4, avgOrderValue: 2500, cancelledOrders: 2 })
        const match = agg.mock.calls[0][0][0].$match
        expect(match.date.$gte).toBeLessThan(match.date.$lt)
    })

    test('sales summary with no orders is zero, not an error', async () => {
        jest.spyOn(orderModel, 'aggregate').mockResolvedValue([])
        expect(await getSalesSummary({ period: 'today' })).toMatchObject({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, cancelledOrders: 0 })
    })

    test('different periods query different date ranges', async () => {
        const agg = jest.spyOn(orderModel, 'aggregate').mockResolvedValue([])
        await getSalesSummary({ period: 'today' })
        await getSalesSummary({ period: 'last_month' })
        const [today, lastMonth] = agg.mock.calls.map(c => c[0][0].$match.date)
        expect(today.$gte).toBeGreaterThan(lastMonth.$lt - 1)
        expect(lastMonth.$lt - lastMonth.$gte).toBeGreaterThan(27 * 86400 * 1000)
    })

    test('unknown period is an error', async () => {
        await expect(getSalesSummary({ period: 'whenever' })).rejects.toThrow()
    })

    test('trend fills days with no orders with real zeros', async () => {
        jest.spyOn(orderModel, 'aggregate').mockResolvedValue([])
        const r = await getOrderTrend({ days: 3 })
        expect(r.daily).toHaveLength(3)
        expect(r.daily.every(d => d.orders === 0 && d.revenue === 0)).toBe(true)
        expect(r.totalRevenue).toBe(0)
    })

    test('top product: none -> null', async () => {
        jest.spyOn(orderModel, 'aggregate').mockResolvedValue([])
        expect(await getTopSellingProduct()).toBeNull()
    })
})

describe('coupon and customer tools', () => {
    test('coupons: expiring window adds an upper bound; otherwise only "not expired"', async () => {
        const find = jest.spyOn(couponModel, 'find').mockReturnValue(leanQuery([]))
        await getActiveCoupons({})
        await getActiveCoupons({ expiringWithinDays: 7 })
        const [plain, soon] = find.mock.calls.map(c => c[0].expiryDate)
        expect(plain.$lte).toBeUndefined()
        expect(soon.$lte.getTime() - soon.$gte.getTime()).toBe(7 * 86400 * 1000)
        expect(find.mock.calls[0][0].isActive).toBe(true)
    })

    test('customer history: not found, ambiguous, and found', async () => {
        const find = jest.spyOn(userModel, 'find')
        find.mockReturnValueOnce(leanQuery([]))
        expect(await getCustomerOrderHistory({ customerName: 'Nobody' })).toBeNull()

        find.mockReturnValueOnce(leanQuery([{ _id: 'u1', name: 'Priya Sharma' }, { _id: 'u2', name: 'Priya Sharma' }]))
        expect(await getCustomerOrderHistory({ customerName: 'Priya Sharma' })).toEqual({ ambiguous: ['Priya Sharma', 'Priya Sharma'] })

        find.mockReturnValueOnce(leanQuery([{ _id: 'u1', name: 'Priya Sharma' }]))
        jest.spyOn(orderModel, 'find').mockReturnValue(leanQuery([{ _id: ORDER_ID }]))
        jest.spyOn(orderModel, 'countDocuments').mockResolvedValue(1)
        const r = await getCustomerOrderHistory({ customerName: 'Priya Sharma' })
        expect(r).toMatchObject({ customerName: 'Priya Sharma', total: 1 })
        expect(orderModel.find.mock.calls[0][0]).toEqual({ userId: 'u1' })
    })

    test('customer history requires an identifier', async () => {
        await expect(getCustomerOrderHistory({})).rejects.toThrow()
    })

    test('new customers: only name/email/createdAt are read, with the real total', async () => {
        const find = jest.spyOn(userModel, 'find').mockReturnValue(leanQuery([{ name: 'N', createdAt: new Date() }]))
        jest.spyOn(userModel, 'countDocuments').mockResolvedValue(9)
        const r = await getNewCustomers({ sinceDays: 3 })
        expect(find.mock.calls[0][1]).toBe('name email createdAt')
        expect(r).toMatchObject({ sinceDays: 3, total: 9 })
    })
})
