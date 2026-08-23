import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'

const RANGE_OPTIONS = [
    { label: 'Week', value: 7 },
    { label: 'Month', value: 30 },
    { label: 'Year', value: 365 },
]

const statusColors = {
    'Order Placed':    'bg-yellow-100 text-yellow-700',
    'Order Confirmed': 'bg-blue-100 text-blue-700',
    'Assigned':        'bg-purple-100 text-purple-700',
    'Packed':          'bg-indigo-100 text-indigo-700',
    'Out For delivery':'bg-orange-100 text-orange-700',
    'Delivered':       'bg-green-100 text-green-700',
    'Cancelled':       'bg-red-100 text-red-600',
}

const Reports = ({ token }) => {
    const [days, setDays] = useState(7)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            try {
                const res = await axios.get(backendUrl + `/api/stock/report?days=${days}`, { headers: { token } })
                if (res.data.success) setData(res.data)
            } catch (_) {}
            setLoading(false)
        }
        fetch()
    }, [token, days])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-green-700 rounded-full" />
        </div>
    )

    if (!data) return <p className="text-gray-400">Failed to load report</p>

    const { summary, dailyRevenue, topProducts, topOrders, topCustomers, ordersByStatus } = data
    const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1)

    return (
        <div className="space-y-7 animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Sales Report</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Revenue and order trends</p>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                    {RANGE_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setDays(opt.value)}
                            className={`px-3 py-1.5 text-xs rounded-md font-medium transition cursor-pointer ${days === opt.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-700 text-white rounded-xl p-5">
                    <p className="text-xs opacity-80">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1">{currency}{summary.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-xs text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalOrders}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-xs text-gray-500">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{currency}{summary.avgOrderValue}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

                {/* Revenue chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 text-sm mb-5">Revenue Trend</h3>
                    <div className="flex items-end gap-2 h-48">
                        {dailyRevenue.map(d => (
                            <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1.5 group">
                                <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">{currency}{d.revenue.toFixed(0)}</span>
                                <div
                                    className="w-full rounded-t-md bg-gradient-to-t from-green-700 to-green-400 transition-all duration-500"
                                    style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 3)}%` }}
                                />
                                <span className="text-[10px] text-gray-400">
                                    {d.date.length === 7
                                        ? new Date(d.date + '-01').toLocaleDateString('en-US', { month: 'short' })
                                        : new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Orders by status */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 text-sm mb-4">Orders by Status</h3>
                    <div className="space-y-2">
                        {Object.entries(ordersByStatus).map(([s, count]) => (
                            <div key={s} className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>
                                <span className="text-sm font-bold text-gray-700">{count}</span>
                            </div>
                        ))}
                        {Object.keys(ordersByStatus).length === 0 && <p className="text-xs text-gray-400">No orders in this range</p>}
                    </div>
                </div>
            </div>

            {/* Top products */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-4">Top Products</h3>
                {topProducts.length === 0 ? (
                    <p className="text-xs text-gray-400">No sales in this range</p>
                ) : (
                    <div className="space-y-3">
                        {topProducts.map((p, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 truncate">{p.name}</p>
                                    <p className="text-xs text-gray-400">{p.unitsSold} sold</p>
                                </div>
                                <p className="text-sm font-semibold text-green-700">{currency}{p.revenue.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top orders + Top customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 text-sm mb-4">Top Orders</h3>
                    {topOrders?.length === 0 ? (
                        <p className="text-xs text-gray-400">No orders in this range</p>
                    ) : (
                        <div className="space-y-3">
                            {topOrders?.map(o => (
                                <div key={o._id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="text-gray-800">{o.customerName}</p>
                                        <p className="text-xs text-gray-400 font-mono">#{o._id.slice(-6).toUpperCase()} · {o.items} item{o.items !== 1 ? 's' : ''}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                                    <p className="font-semibold text-green-700">{currency}{o.amount?.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 text-sm mb-4">Top Customers</h3>
                    {topCustomers?.length === 0 ? (
                        <p className="text-xs text-gray-400">No customers in this range</p>
                    ) : (
                        <div className="space-y-3">
                            {topCustomers?.map(c => (
                                <div key={c.userId} className="flex items-center justify-between text-sm">
                                    <div className="min-w-0">
                                        <p className="text-gray-800 truncate">{c.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{c.email}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold text-green-700">{currency}{c.totalSpent.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400">{c.orderCount} order{c.orderCount !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Reports
