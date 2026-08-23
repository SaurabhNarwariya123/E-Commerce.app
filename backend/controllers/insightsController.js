import orderModel from '../models/orderModel.js'
import productModel from '../models/productModel.js'
import couponModel from '../models/couponModel.js'
import userModel from '../models/userModel.js'

const LOW_STOCK_THRESHOLD = 5
const DAY_MS = 24 * 60 * 60 * 1000

// ─── Admin: Live notification feed (synthesized from recent activity) ─────────
// No separate notifications table — read/unread state is tracked client-side
// (via a "last seen" timestamp in localStorage) so this stays simple.
const getNotifications = async (req, res) => {
    try {
        const now = Date.now()
        const since = now - 3 * DAY_MS

        const [recentOrders, products, expiringCoupons] = await Promise.all([
            orderModel.find({ date: { $gte: since } }).sort({ date: -1 }).limit(20),
            productModel.find({}, 'name stock'),
            couponModel.find({ isActive: true, expiryDate: { $gte: new Date(), $lte: new Date(now + 3 * DAY_MS) } }),
        ])

        const notifications = []

        for (const o of recentOrders) {
            notifications.push({
                id: `order-${o._id}`,
                type: 'order',
                title: 'New order placed',
                message: `${o.address?.firstName || 'A customer'} placed an order worth ${o.amount}`,
                orderId: o._id,
                timestamp: o.date,
            })
            if (o.status === 'Delivered') {
                notifications.push({
                    id: `delivered-${o._id}`,
                    type: 'delivery',
                    title: 'Order delivered',
                    message: `Order #${o._id.toString().slice(-6).toUpperCase()} was delivered successfully`,
                    orderId: o._id,
                    timestamp: o.date,
                })
            }
        }

        for (const p of products) {
            if (!p.stock || p.stock.size === 0) continue
            for (const [size, qty] of p.stock.entries()) {
                if (qty <= LOW_STOCK_THRESHOLD) {
                    notifications.push({
                        id: `stock-${p._id}-${size}`,
                        type: 'stock',
                        title: 'Low stock warning',
                        message: `${p.name} (${size}) has only ${qty} left`,
                        productId: p._id,
                        timestamp: now,
                    })
                }
            }
        }

        for (const c of expiringCoupons) {
            notifications.push({
                id: `coupon-${c._id}`,
                type: 'coupon',
                title: 'Coupon expiring soon',
                message: `${c.code} expires on ${new Date(c.expiryDate).toLocaleDateString()}`,
                timestamp: now,
            })
        }

        notifications.sort((a, b) => b.timestamp - a.timestamp)

        res.json({ success: true, notifications: notifications.slice(0, 30) })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: Sales report (revenue trend + top products) ───────────────────────
const getSalesReport = async (req, res) => {
    try {
        const days = Math.min(Number(req.query.days) || 7, 365)
        const since = Date.now() - days * DAY_MS
        const byMonth = days > 60 // bucket by month once the range gets too wide for daily bars

        const orders = await orderModel.find({ date: { $gte: since } }).sort({ date: 1 })

        // Revenue trend — daily for week/month views, monthly for the year view
        const buckets = {}
        if (byMonth) {
            for (let i = 0; i < Math.ceil(days / 30); i++) {
                const d = new Date()
                d.setMonth(d.getMonth() - i)
                const key = d.toISOString().slice(0, 7) // YYYY-MM
                buckets[key] = { date: key, revenue: 0, orders: 0 }
            }
        } else {
            for (let i = 0; i < days; i++) {
                const d = new Date(Date.now() - i * DAY_MS)
                const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
                buckets[key] = { date: key, revenue: 0, orders: 0 }
            }
        }
        for (const o of orders) {
            const key = byMonth ? new Date(o.date).toISOString().slice(0, 7) : new Date(o.date).toISOString().slice(0, 10)
            if (buckets[key]) {
                buckets[key].revenue += o.amount || 0
                buckets[key].orders += 1
            }
        }
        const dailyRevenue = Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date))

        // Top products by revenue (within the same window)
        const productTotals = {}
        for (const o of orders) {
            for (const item of o.items || []) {
                const key = item._id || item.name
                if (!productTotals[key]) {
                    productTotals[key] = { name: item.name, image: item.image?.[0] || null, revenue: 0, unitsSold: 0 }
                }
                productTotals[key].revenue += (item.price || 0) * (item.quantity || 1)
                productTotals[key].unitsSold += item.quantity || 1
            }
        }
        const topProducts = Object.values(productTotals).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

        const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0)
        const totalOrders = orders.length
        const avgOrderValue = totalOrders ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0

        const ordersByStatus = orders.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1
            return acc
        }, {})

        // Top orders by value, within the same window
        const topOrders = [...orders]
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))
            .slice(0, 5)
            .map(o => ({
                _id: o._id,
                amount: o.amount,
                status: o.status,
                date: o.date,
                items: o.items?.length || 0,
                customerName: `${o.address?.firstName || ''} ${o.address?.lastName || ''}`.trim() || 'Guest',
            }))

        // Top customers by spend, within the same window
        const spendByUser = {}
        for (const o of orders) {
            if (!o.userId) continue
            if (!spendByUser[o.userId]) spendByUser[o.userId] = { userId: o.userId, totalSpent: 0, orderCount: 0 }
            spendByUser[o.userId].totalSpent += o.amount || 0
            spendByUser[o.userId].orderCount += 1
        }
        const topSpenderIds = Object.values(spendByUser).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)
        const topUsers = await userModel.find({ _id: { $in: topSpenderIds.map(s => s.userId) } }, 'name email')
        const userById = Object.fromEntries(topUsers.map(u => [u._id.toString(), u]))
        const topCustomers = topSpenderIds.map(s => ({
            userId: s.userId,
            name: userById[s.userId]?.name || 'Unknown',
            email: userById[s.userId]?.email || '',
            totalSpent: s.totalSpent,
            orderCount: s.orderCount,
        }))

        res.json({
            success: true,
            range: { days, since },
            summary: { totalRevenue, totalOrders, avgOrderValue },
            dailyRevenue,
            topProducts,
            topOrders,
            topCustomers,
            ordersByStatus,
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getNotifications, getSalesReport }
