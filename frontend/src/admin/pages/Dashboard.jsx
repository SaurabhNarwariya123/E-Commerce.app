import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { useNavigate } from 'react-router-dom'

const statusColors = {
    'Order Placed':    'bg-yellow-100 text-yellow-700',
    'Order Confirmed': 'bg-blue-100 text-blue-700',
    'Assigned':        'bg-purple-100 text-purple-700',
    'Packed':          'bg-indigo-100 text-indigo-700',
    'Out For delivery':'bg-orange-100 text-orange-700',
    'Delivered':       'bg-green-100 text-green-700',
    'Cancelled':       'bg-red-100 text-red-600',
}

const NOTIF_ICON = { order: '🛒', delivery: '✅', stock: '⚠️', coupon: '🏷️' }

const initials = (name) => name ? name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
const AVATAR_COLORS = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-500', 'bg-pink-600']
const avatarColor = (id) => AVATAR_COLORS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

const timeAgo = (ts) => {
    const mins = Math.floor((Date.now() - ts) / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

const StatCard = ({ label, value, icon, color, delay }) => (
    <div
        className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${color}`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        </div>
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
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-green-700 rounded-full" />
        </div>
    )

    if (!data) return <p className="text-gray-400">Failed to load dashboard</p>

    const { stats, ordersByStatus, recentOrders } = data
    const pendingOrders = (ordersByStatus['Order Placed'] || 0) + (ordersByStatus['Order Confirmed'] || 0)
    const deliveredCount = ordersByStatus['Delivered'] || 0
    const fulfillmentPct = stats.totalOrders ? Math.round((deliveredCount / stats.totalOrders) * 100) : 0
    const maxRevenue = Math.max(...(report?.dailyRevenue?.map(d => d.revenue) || [1]), 1)

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 animate-fade-in-up">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Track sales, orders and inventory at a glance</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 rounded-full p-0.5 gap-0.5">
                        {PERIODS.map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-3 py-1.5 text-xs rounded-full font-medium transition cursor-pointer ${period === p.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => navigate('/admin/reports')} className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-full transition cursor-pointer">
                        Reports
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-700 to-green-900 text-white rounded-2xl p-5 animate-fade-in-up">
                    <p className="text-xs text-white/70">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1">{currency}{stats.totalRevenue.toFixed(2)}</p>
                    <span className="inline-block mt-2 text-[10px] bg-white/15 px-2 py-0.5 rounded-full">📈 {stats.totalOrders} total orders</span>
                </div>
                <StatCard label="Total Products" value={stats.totalProducts} icon="🛍️" color="bg-blue-50" delay={60} />
                <StatCard label="Pending Orders" value={pendingOrders} icon="⏳" color="bg-yellow-50" delay={120} />
                <StatCard label="Low Stock" value={stats.lowStockCount} icon="⚠️" color={stats.lowStockCount > 0 ? "bg-red-50" : "bg-gray-50"} delay={180} />
            </div>

            {/* Analytics + Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

                <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h3 className="font-semibold text-gray-800 text-sm mb-5">
                        Sales Analytics <span className="text-gray-400 font-normal">({PERIODS.find(p => p.value === period)?.label})</span>
                    </h3>
                    {reportLoading ? (
                        <div className="h-40 flex items-center justify-center">
                            <div className="animate-spin w-6 h-6 border-4 border-gray-200 border-t-green-700 rounded-full" />
                        </div>
                    ) : report ? (
                        <div className="flex items-end gap-2 h-40">
                            {report.dailyRevenue.map(d => (
                                <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1.5 group">
                                    <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">{currency}{d.revenue.toFixed(0)}</span>
                                    <div
                                        className="w-full rounded-t-lg bg-gradient-to-t from-green-700 to-green-400 transition-all duration-700 ease-out"
                                        style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%` }}
                                    />
                                    <span className="text-[10px] text-gray-400">
                                        {d.date.length === 7
                                            ? new Date(d.date + '-01').toLocaleDateString('en-US', { month: 'short' })
                                            : new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-xs text-gray-400">No data</p>}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400">You're all caught up</p>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map(n => (
                                <div key={n.id} className="flex items-start gap-2.5">
                                    <span className="text-base shrink-0">{NOTIF_ICON[n.type] || '🔔'}</span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-800 truncate">{n.title}</p>
                                        <p className="text-[11px] text-gray-400">{timeAgo(n.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent orders */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '220ms' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-sm">Recent Orders</h3>
                    <button onClick={() => navigate('/admin/orders')} className="text-xs text-green-700 hover:underline cursor-pointer">
                        View All →
                    </button>
                </div>

                {recentOrders.length === 0 ? (
                    <p className="text-xs text-gray-400">No orders yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b">
                                    <th className="pb-2 text-left font-medium">ORDER ID</th>
                                    <th className="pb-2 text-left font-medium">CUSTOMER</th>
                                    <th className="pb-2 text-left font-medium">ITEMS</th>
                                    <th className="pb-2 text-left font-medium">TOTAL</th>
                                    <th className="pb-2 text-left font-medium">STATUS</th>
                                    <th className="pb-2 text-left font-medium">DATE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition">
                                        <td className="py-2.5 font-mono text-xs text-gray-500">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="py-2.5 text-gray-700">
                                            {order.address?.firstName} {order.address?.lastName}
                                            <p className="text-xs text-gray-400">{order.address?.email || order.paymentMethod}</p>
                                        </td>
                                        <td className="py-2.5 text-gray-600">{order.items} item{order.items !== 1 ? 's' : ''}</td>
                                        <td className="py-2.5 font-semibold text-gray-800">{currency}{order.amount?.toFixed(2)}</td>
                                        <td className="py-2.5">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-xs text-gray-400">
                                            {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Fulfillment + Recent Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center animate-fade-in-up" style={{ animationDelay: '280ms' }}>
                    <h3 className="font-semibold text-gray-800 text-sm mb-4 self-start">Order Fulfillment</h3>
                    <div
                        className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000"
                        style={{ background: `conic-gradient(#15803d ${fulfillmentPct * 3.6}deg, #e5e7eb 0deg)` }}
                    >
                        <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-gray-900">{fulfillmentPct}%</span>
                            <span className="text-[10px] text-gray-400">Delivered</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '340ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 text-sm">Recent Customers</h3>
                        <button onClick={() => navigate('/admin/customers')} className="text-xs text-green-700 hover:underline cursor-pointer">
                            View All →
                        </button>
                    </div>
                    {customers.length === 0 ? (
                        <p className="text-xs text-gray-400">No customers yet</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {customers.map(c => (
                                <div key={c._id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                                    <div className={`w-9 h-9 rounded-full ${avatarColor(c._id)} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                                        {initials(c.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{c.orderCount} order{c.orderCount !== 1 ? 's' : ''} · {currency}{c.totalSpent.toFixed(0)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <h3 className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Add Product', path: '/admin/add', icon: '➕' },
                        { label: 'Manage Stock', path: '/admin/stock', icon: '📊' },
                        { label: 'View Orders', path: '/admin/orders', icon: '📋' },
                        { label: 'Customers', path: '/admin/customers', icon: '👥' },
                        { label: 'Coupons', path: '/admin/coupons', icon: '🏷️' },
                        { label: 'Delivery Partners', path: '/admin/delivery-persons', icon: '🚲' },
                    ].map(action => (
                        <button
                            key={action.path}
                            onClick={() => navigate(action.path)}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left hover:border-green-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                        >
                            <span className="text-2xl">{action.icon}</span>
                            <p className="text-sm font-medium text-gray-700 mt-2">{action.label}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
