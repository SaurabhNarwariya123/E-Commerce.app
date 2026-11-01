import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { useNavigate } from 'react-router-dom'

const statusColors = {
    'Order Placed':    'bg-amber-100 text-amber-700',
    'Order Confirmed': 'bg-sky-100 text-sky-700',
    'Assigned':        'bg-violet-100 text-violet-700',
    'Packed':          'bg-indigo-100 text-indigo-700',
    'Out For delivery':'bg-orange-100 text-orange-700',
    'Delivered':       'bg-emerald-100 text-emerald-700',
    'Cancelled':       'bg-rose-100 text-rose-600',
}

const NOTIF_ICON = { order: '🛒', delivery: '✅', stock: '⚠️', coupon: '🏷️' }

const initials = (name) => name ? name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
const AVATAR_COLORS = ['bg-emerald-600', 'bg-sky-600', 'bg-violet-600', 'bg-amber-500', 'bg-rose-500']
const avatarColor = (id) => AVATAR_COLORS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

const timeAgo = (ts) => {
    const mins = Math.floor((Date.now() - ts) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

const ACCENTS = {
    sky:    { bg: 'bg-sky-50',    fg: 'text-sky-600',    bar: 'bg-sky-500' },
    amber:  { bg: 'bg-amber-50',  fg: 'text-amber-600',  bar: 'bg-amber-500' },
    rose:   { bg: 'bg-rose-50',   fg: 'text-rose-600',   bar: 'bg-rose-500' },
    violet: { bg: 'bg-violet-50', fg: 'text-violet-600', bar: 'bg-violet-500' },
}

const StatCard = ({ label, value, icon, accent, hint, delay }) => {
    const a = ACCENTS[accent]
    return (
        <div
            className="adm-card relative overflow-hidden px-3.5 py-3 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${a.bar}`} />
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${a.bg} ${a.fg}`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide">{label}</p>
                <p className="text-lg font-semibold text-[var(--adm-ink)] leading-tight truncate">{value}</p>
                {hint && <p className="text-xs text-[var(--adm-muted)]">{hint}</p>}
            </div>
        </div>
    )
}

const CardTitle = ({ children, action }) => (
    <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-[var(--adm-ink)]">{children}</h3>
        {action}
    </div>
)

const PERIODS = [
    { label: 'Week',  value: 7 },
    { label: 'Month', value: 30 },
    { label: 'Year',  value: 365 },
]

const Dashboard = ({ token }) => {
    const navigate = useNavigate()
    const [data, setData]           = useState(null)
    const [report, setReport]       = useState(null)
    const [notifications, setNotifications] = useState([])
    const [customers, setCustomers] = useState([])
    const [loading, setLoading]     = useState(true)
    const [reportLoading, setReportLoading] = useState(false)
    const [period, setPeriod]       = useState(7)

    useEffect(() => {
        const fetchStatic = async () => {
            try {
                const [statsRes, notifRes, customersRes] = await Promise.all([
                    axios.get(backendUrl + '/api/stock/dashboard-stats', { headers: { token } }),
                    axios.get(backendUrl + '/api/stock/notifications', { headers: { token } }),
                    axios.get(backendUrl + '/api/user/admin/customers', { headers: { token } }),
                ])
                if (statsRes.data.success) setData(statsRes.data)
                if (notifRes.data.success) setNotifications(notifRes.data.notifications.slice(0, 4))
                if (customersRes.data.success) setCustomers(customersRes.data.customers.slice(0, 4))
            } catch (_) {}
            setLoading(false)
        }
        fetchStatic()
    }, [token])

    useEffect(() => {
        const fetchReport = async () => {
            setReportLoading(true)
            try {
                const res = await axios.get(backendUrl + `/api/stock/report?days=${period}`, { headers: { token } })
                if (res.data.success) setReport(res.data)
            } catch (_) {}
            setReportLoading(false)
        }
        fetchReport()
    }, [token, period])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full" />
        </div>
    )

    if (!data) return <p className="text-[var(--adm-muted)]">Failed to load dashboard</p>

    const { stats, ordersByStatus, recentOrders } = data
    const pendingOrders = (ordersByStatus['Order Placed'] || 0) + (ordersByStatus['Order Confirmed'] || 0)
    const deliveredCount = ordersByStatus['Delivered'] || 0
    const fulfillmentPct = stats.totalOrders ? Math.round((deliveredCount / stats.totalOrders) * 100) : 0
    const maxRevenue = Math.max(...(report?.dailyRevenue?.map(d => d.revenue) || [1]), 1)

    return (
        <div className="space-y-4 max-w-[1400px]">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-in-up">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--adm-ink)]">Dashboard</h1>
                    <p className="text-xs text-[var(--adm-muted)] mt-0.5">Track sales, orders and inventory at a glance</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-white border border-[var(--adm-line)] rounded-lg p-0.5 gap-0.5">
                        {PERIODS.map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-3 py-1 text-xs rounded-md font-medium transition cursor-pointer ${period === p.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-[var(--adm-muted)] hover:text-[var(--adm-ink)]'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => navigate('/admin/reports')} className="bg-white border border-[var(--adm-line)] hover:border-emerald-300 hover:text-emerald-700 text-[var(--adm-ink)] text-xs font-medium px-3.5 py-2 rounded-lg transition cursor-pointer">
                        Reports
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative overflow-hidden rounded-[14px] px-4 py-3 text-white bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 animate-fade-in-up">
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute -right-2 top-8 w-14 h-14 rounded-full bg-white/5" />
                    <p className="text-xs text-emerald-100/80 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-2xl font-semibold mt-0.5 leading-tight">{currency}{stats.totalRevenue.toFixed(2)}</p>
                    <span className="inline-block mt-1.5 text-xs bg-white/15 px-2 py-0.5 rounded-full">{stats.totalOrders} total orders</span>
                </div>
                <StatCard label="Products" value={stats.totalProducts} icon="🛍️" accent="sky" delay={60} />
                <StatCard label="Pending Orders" value={pendingOrders} icon="⏳" accent="amber" hint={pendingOrders ? 'Needs attention' : 'All clear'} delay={120} />
                <StatCard label="Low Stock" value={stats.lowStockCount} icon="⚠️" accent={stats.lowStockCount > 0 ? 'rose' : 'violet'} hint={stats.lowStockCount ? 'Restock soon' : 'Healthy'} delay={180} />
            </div>

            {/* Analytics + Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">

                <div className="adm-card p-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <CardTitle action={<span className="text-xs text-[var(--adm-muted)]">{PERIODS.find(p => p.value === period)?.label} view</span>}>
                        Sales Analytics
                    </CardTitle>
                    {reportLoading ? (
                        <div className="h-36 flex items-center justify-center">
                            <div className="animate-spin w-6 h-6 border-4 border-gray-200 border-t-emerald-600 rounded-full" />
                        </div>
                    ) : report ? (
                        <div className="relative h-36">
                            <div className="absolute inset-0 flex flex-col justify-between pb-5 pointer-events-none">
                                {[0, 1, 2, 3].map(i => <div key={i} className="border-t border-dashed border-[var(--adm-line)]" />)}
                            </div>
                            <div className="relative flex items-end gap-1.5 h-full">
                                {report.dailyRevenue.map(d => (
                                    <div key={d.date} className="flex-1 h-full flex flex-col items-center justify-end gap-1 group">
                                        <span className="text-xs font-medium text-emerald-700 opacity-0 group-hover:opacity-100 transition">{currency}{d.revenue.toFixed(0)}</span>
                                        <div
                                            className="w-full max-w-[34px] rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-700 group-hover:to-teal-500 transition-all duration-700 ease-out"
                                            style={{ height: `${Math.max((d.revenue / maxRevenue) * 78, 3)}%` }}
                                        />
                                        <span className="text-xs text-[var(--adm-muted)] h-3.5">
                                            {d.date.length === 7
                                                ? new Date(d.date + '-01').toLocaleDateString('en-US', { month: 'short' })
                                                : new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : <p className="text-xs text-[var(--adm-muted)]">No data</p>}
                </div>

                <div className="adm-card p-4 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
                    <CardTitle>Notifications</CardTitle>
                    {notifications.length === 0 ? (
                        <p className="text-xs text-[var(--adm-muted)]">You're all caught up</p>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map(n => (
                                <div key={n.id} className="flex items-start gap-2 rounded-lg bg-[var(--adm-bg)] px-2.5 py-2">
                                    <span className="text-sm shrink-0">{NOTIF_ICON[n.type] || '🔔'}</span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-[var(--adm-ink)] truncate">{n.title}</p>
                                        <p className="text-xs text-[var(--adm-muted)]">{timeAgo(n.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent orders + Fulfillment / Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
                <div className="adm-card p-4 animate-fade-in-up" style={{ animationDelay: '220ms' }}>
                    <CardTitle action={<button onClick={() => navigate('/admin/orders')} className="text-xs text-emerald-700 hover:underline cursor-pointer font-medium">View all →</button>}>
                        Recent Orders
                    </CardTitle>
                    {recentOrders.length === 0 ? (
                        <p className="text-xs text-[var(--adm-muted)]">No orders yet</p>
                    ) : (
                        <div className="overflow-x-auto adm-scroll">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="text-xs uppercase tracking-wide text-[var(--adm-muted)] border-b border-[var(--adm-line)]">
                                        <th className="pb-2 text-left font-medium">Order</th>
                                        <th className="pb-2 text-left font-medium">Customer</th>
                                        <th className="pb-2 text-left font-medium">Items</th>
                                        <th className="pb-2 text-left font-medium">Total</th>
                                        <th className="pb-2 text-left font-medium">Status</th>
                                        <th className="pb-2 text-left font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--adm-line)]">
                                    {recentOrders.map(order => (
                                        <tr key={order._id} className="hover:bg-[var(--adm-bg)] transition">
                                            <td className="py-2 font-mono text-xs text-[var(--adm-muted)]">#{order._id.slice(-6).toUpperCase()}</td>
                                            <td className="py-2 text-[var(--adm-ink)]">
                                                {order.address?.firstName} {order.address?.lastName}
                                                <p className="text-xs text-[var(--adm-muted)]">{order.address?.email || order.paymentMethod}</p>
                                            </td>
                                            <td className="py-2 text-[var(--adm-muted)]">{order.items}</td>
                                            <td className="py-2 font-semibold text-[var(--adm-ink)]">{currency}{order.amount?.toFixed(2)}</td>
                                            <td className="py-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-[var(--adm-muted)]'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-2 text-xs text-[var(--adm-muted)]">
                                                {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="adm-card p-4 animate-fade-in-up" style={{ animationDelay: '280ms' }}>
                        <CardTitle>Order Fulfillment</CardTitle>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 transition-all duration-1000"
                                style={{ background: `conic-gradient(#059669 ${fulfillmentPct * 3.6}deg, #E3EAE6 0deg)` }}
                            >
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                                    <span className="text-sm font-semibold text-[var(--adm-ink)]">{fulfillmentPct}%</span>
                                </div>
                            </div>
                            <div className="text-xs space-y-1">
                                <p className="flex items-center gap-1.5 text-[var(--adm-muted)]"><span className="w-2 h-2 rounded-full bg-emerald-600" />Delivered <b className="text-[var(--adm-ink)] font-semibold">{deliveredCount}</b></p>
                                <p className="flex items-center gap-1.5 text-[var(--adm-muted)]"><span className="w-2 h-2 rounded-full bg-[#E3EAE6]" />Other <b className="text-[var(--adm-ink)] font-semibold">{stats.totalOrders - deliveredCount}</b></p>
                            </div>
                        </div>
                    </div>

                    <div className="adm-card p-4 animate-fade-in-up" style={{ animationDelay: '340ms' }}>
                        <CardTitle action={<button onClick={() => navigate('/admin/customers')} className="text-xs text-emerald-700 hover:underline cursor-pointer font-medium">View all →</button>}>
                            Recent Customers
                        </CardTitle>
                        {customers.length === 0 ? (
                            <p className="text-xs text-[var(--adm-muted)]">No customers yet</p>
                        ) : (
                            <div className="space-y-2">
                                {customers.map(c => (
                                    <div key={c._id} className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-full ${avatarColor(c._id)} text-white flex items-center justify-center text-xs font-semibold shrink-0`}>
                                            {initials(c.name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-[var(--adm-ink)] truncate">{c.name}</p>
                                            <p className="text-xs text-[var(--adm-muted)] truncate">{c.orderCount} order{c.orderCount !== 1 ? 's' : ''}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-700">{currency}{c.totalSpent.toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="adm-card p-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <CardTitle>Quick Actions</CardTitle>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[
                        { label: 'Add Product', path: '/admin/add', icon: '➕' },
                        { label: 'Manage Stock', path: '/admin/stock', icon: '📊' },
                        { label: 'View Orders', path: '/admin/orders', icon: '📋' },
                        { label: 'Customers', path: '/admin/customers', icon: '👥' },
                        { label: 'Coupons', path: '/admin/coupons', icon: '🏷️' },
                        { label: 'Delivery', path: '/admin/delivery-persons', icon: '🚲' },
                    ].map(action => (
                        <button
                            key={action.path}
                            onClick={() => navigate(action.path)}
                            className="flex items-center gap-2 bg-[var(--adm-bg)] border border-transparent rounded-lg px-3 py-2 text-left hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200 cursor-pointer"
                        >
                            <span className="text-base">{action.icon}</span>
                            <span className="text-xs font-medium text-[var(--adm-ink)]">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
