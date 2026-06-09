import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { useNavigate } from 'react-router-dom'

const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
    </div>
)

const statusColors = {
    'Order Placed':    'bg-yellow-100 text-yellow-700',
    'Order Confirmed': 'bg-blue-100 text-blue-700',
    'Assigned':        'bg-purple-100 text-purple-700',
    'Packed':          'bg-indigo-100 text-indigo-700',
    'Out For delivery':'bg-orange-100 text-orange-700',
    'Delivered':       'bg-green-100 text-green-700',
    'Cancelled':       'bg-red-100 text-red-600',
}

const Dashboard = ({ token }) => {
    const navigate = useNavigate()
    const [data, setData]     = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(backendUrl + '/api/stock/dashboard-stats', { headers: { token } })
                if (res.data.success) setData(res.data)
            } catch (_) {}
            setLoading(false)
        }
        fetch()
    }, [token])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full" />
        </div>
    )

    if (!data) return <p className="text-gray-400">Failed to load dashboard</p>

    const { stats, ordersByStatus, recentOrders } = data

    const statusOrder = ['Order Placed','Order Confirmed','Assigned','Packed','Out For delivery','Delivered','Cancelled']

    return (
        <div className="space-y-7">
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard label="Total Orders"   value={stats.totalOrders}   icon="📦" color="bg-blue-50" />
                <StatCard label="Total Revenue"  value={`${currency}${stats.totalRevenue.toFixed(2)}`} icon="💰" color="bg-green-50" />
                <StatCard label="Total Users"    value={stats.totalUsers}    icon="👥" color="bg-purple-50" />
                <StatCard label="Total Products" value={stats.totalProducts} icon="🛍️" color="bg-yellow-50" />
                <StatCard label="Low Stock"      value={stats.lowStockCount} icon="⚠️" color={stats.lowStockCount > 0 ? "bg-red-50" : "bg-gray-50"} />
            </div>

            {/* Status breakdown + Recent orders */}
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">

                {/* Orders by status */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 text-sm mb-4">Orders by Status</h3>
                    <div className="space-y-2">
                        {statusOrder.map(s => {
                            const count = ordersByStatus[s] || 0
                            if (!count) return null
                            return (
                                <div key={s} className="flex items-center justify-between">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s] || 'bg-gray-100 text-gray-600'}`}>
                                        {s}
                                    </span>
                                    <span className="text-sm font-bold text-gray-700">{count}</span>
                                </div>
                            )
                        })}
                        {Object.keys(ordersByStatus).length === 0 && (
                            <p className="text-xs text-gray-400">No orders yet</p>
                        )}
                    </div>
                </div>

                {/* Recent orders */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 text-sm">Recent Orders</h3>
                        <button onClick={() => navigate('/admin/orders')} className="text-xs text-indigo-600 hover:underline">
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
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Add Product', path: '/admin/add', icon: '➕' },
                    { label: 'Manage Stock', path: '/admin/stock', icon: '📊' },
                    { label: 'View Orders', path: '/admin/orders', icon: '📋' },
                    { label: 'Delivery Partners', path: '/admin/delivery-persons', icon: '🚲' },
                ].map(action => (
                    <button
                        key={action.path}
                        onClick={() => navigate(action.path)}
                        className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-gray-400 hover:shadow-sm transition"
                    >
                        <span className="text-2xl">{action.icon}</span>
                        <p className="text-sm font-medium text-gray-700 mt-2">{action.label}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Dashboard
