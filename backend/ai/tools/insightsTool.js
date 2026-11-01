import orderModel from '../../models/orderModel.js'
import { resolvePeriod, istDateKey } from '../dateRanges.js'

const DAY_MS = 24 * 60 * 60 * 1000

const num = (field) => ({ $convert: { input: field, to: 'double', onError: 0, onNull: 0 } })

// Totals are computed by the database, never by the LLM. Cancelled orders are reported
// separately and are NOT counted as revenue.
export const getSalesSummary = async ({ period, days } = {}) => {
    const range = resolvePeriod(period, Date.now(), days)
    if (!range) throw new Error('Unknown sales period')

    const rows = await orderModel.aggregate([
        { $match: { date: { $gte: range.from, $lt: range.to } } },
        {
            $group: {
                _id: { $eq: ['$status', 'Cancelled'] },
                orders: { $sum: 1 },
                revenue: { $sum: num('$amount') },
            },
        },
    ])

    const counted = rows.find(r => r._id === false) || { orders: 0, revenue: 0 }
    const cancelled = rows.find(r => r._id === true) || { orders: 0 }
    const totalOrders = counted.orders
    const totalRevenue = counted.revenue

    return {
        periodLabel: range.label,
        from: range.from,
        to: range.to,
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
        cancelledOrders: cancelled.orders,
    }
}

export const getPreviousMonthRevenue = () => getSalesSummary({ period: 'last_month' })

export const getTodaySalesSummary = () => getSalesSummary({ period: 'today' })

export const getTopSellingProduct = async ({ days = 30 } = {}) => {
    const since = Date.now() - days * DAY_MS
    const [top] = await orderModel.aggregate([
        { $match: { date: { $gte: since }, status: { $ne: 'Cancelled' } } },
        { $unwind: '$items' },
        {
            $group: {
                _id: { $ifNull: ['$items._id', '$items.name'] },
                name: { $first: '$items.name' },
                unitsSold: { $sum: { $convert: { input: '$items.quantity', to: 'double', onError: 1, onNull: 1 } } },
                revenue: { $sum: { $multiply: [num('$items.price'), { $convert: { input: '$items.quantity', to: 'double', onError: 1, onNull: 1 } }] } },
            },
        },
        { $sort: { revenue: -1 } },
        { $limit: 1 },
    ])
    return top ? { name: top.name, unitsSold: top.unitsSold, revenue: top.revenue, days } : null
}

export const getOrderTrend = async ({ days = 7 } = {}) => {
    const now = Date.now()
    const since = now - days * DAY_MS

    const rows = await orderModel.aggregate([
        { $match: { date: { $gte: since }, status: { $ne: 'Cancelled' } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$date' }, timezone: '+05:30' } },
                orders: { $sum: 1 },
                revenue: { $sum: num('$amount') },
            },
        },
    ])
    const byDay = Object.fromEntries(rows.map(r => [r._id, r]))

    // Include days with no orders as real zeros so the trend has no gaps.
    const daily = []
    for (let i = days - 1; i >= 0; i--) {
        const key = istDateKey(now - i * DAY_MS)
        daily.push({ date: key, orders: byDay[key]?.orders || 0, revenue: byDay[key]?.revenue || 0 })
    }
    return {
        days,
        daily,
        totalOrders: daily.reduce((s, d) => s + d.orders, 0),
        totalRevenue: daily.reduce((s, d) => s + d.revenue, 0),
    }
}
