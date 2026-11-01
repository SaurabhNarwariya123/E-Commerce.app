import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import Pagination, { usePagination } from '../components/Pagination'
import ResetPasswordModal from '../components/ResetPasswordModal'
import { getPaymentBadge } from '../utils/orderPayment'

const STATUS_BADGE = {
    'Order Placed':    'bg-amber-100 text-amber-700',
    'Order Confirmed': 'bg-sky-100 text-sky-700',
    'Assigned':        'bg-violet-100 text-violet-700',
    'Packed':          'bg-indigo-100 text-indigo-700',
    'Out For delivery':'bg-orange-100 text-orange-700',
    'Delivered':       'bg-emerald-100 text-emerald-700',
    'Cancelled':       'bg-rose-100 text-rose-600',
}

const Tile = ({ label, value, tone }) => (
    <div className={`rounded-xl px-4 py-3 ${tone}`}>
        <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-xl font-semibold leading-tight mt-0.5">{value}</p>
    </div>
)

const Row = ({ label, children }) => (
    <div>
        <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-[var(--adm-ink)]">{children ?? '—'}</div>
    </div>
)

const DeliveryPersonView = ({ token }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [dp, setDp] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [resetOpen, setResetOpen] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [dpRes, orderRes] = await Promise.all([
                    axios.get(backendUrl + '/api/delivery/list', { headers: { token } }),
                    axios.post(backendUrl + '/api/order/list', {}, { headers: { token } }),
                ])
                if (dpRes.data.success) setDp(dpRes.data.deliveryPersons.find(d => d._id === id) || null)
                if (orderRes.data.success) {
                    setOrders(orderRes.data.orders.filter(o => o.deliveryPersonId === id).reverse())
                }
            } catch (_) {}
            setLoading(false)
        }
        load()
    }, [id, token])

    const { page, setPage, totalPages, pageItems, start } = usePagination(orders, 6)

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full" />
        </div>
    )

    if (!dp) return (
        <div className="text-center text-[var(--adm-muted)] py-12 text-sm">Delivery person not found</div>
    )

    const initials = dp.name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="flex flex-col gap-4 max-w-[1100px]">
            {resetOpen && <ResetPasswordModal person={dp} token={token} onClose={() => setResetOpen(false)} />}

            <button onClick={() => navigate('/admin/delivery-persons')} className="text-xs text-[var(--adm-muted)] hover:text-emerald-700 transition cursor-pointer w-fit">
                ← Back to Delivery Partners
            </button>

            {/* Profile */}
            <div className="adm-card overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800" />
                <div className="px-5 pb-5">
                    <div className="flex items-end justify-between flex-wrap gap-3 -mt-7">
                        <div className="flex items-end gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow">
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg font-semibold">{initials}</div>
                            </div>
                            <div className="pb-0.5">
                                <h1 className="text-lg font-semibold text-[var(--adm-ink)] leading-tight">{dp.name}</h1>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dp.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{dp.isActive ? 'Active' : 'Inactive'}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dp.isAvailable ? 'bg-sky-100 text-sky-700' : 'bg-orange-100 text-orange-700'}`}>{dp.isAvailable ? 'Free' : 'Busy'}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setResetOpen(true)}
                            className="flex items-center gap-1.5 bg-white border border-[var(--adm-line)] hover:border-emerald-300 hover:text-emerald-700 text-[var(--adm-ink)] text-xs font-medium px-3.5 py-2 rounded-lg transition cursor-pointer"
                        >
                            🔑 Reset password
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                        <Tile label="Delivered" value={dp.totalDelivered || 0} tone="bg-emerald-50 text-emerald-800" />
                        <Tile label="Active orders" value={dp.assignedOrders?.length || 0} tone="bg-amber-50 text-amber-800" />
                        <Tile label="Total assigned" value={orders.length} tone="bg-sky-50 text-sky-800" />
                        <Tile label="Cancelled" value={orders.filter(o => o.status === 'Cancelled').length} tone="bg-rose-50 text-rose-800" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-[var(--adm-line)]">
                        <Row label="Email">{dp.email}</Row>
                        <Row label="Phone">{dp.phone}</Row>
                        <Row label="Live location">
                            {dp.currentLocation?.lat
                                ? <a href={`https://maps.google.com/?q=${dp.currentLocation.lat},${dp.currentLocation.lng}`} target="_blank" rel="noreferrer" className="text-emerald-700 underline">View on map</a>
                                : 'No data'}
                        </Row>
                    </div>
                </div>
            </div>

            {/* Orders handled */}
            <div className="adm-card overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--adm-line)] flex items-center justify-between">
                    <h3 className="text-[13px] font-semibold text-[var(--adm-ink)]">Assigned orders</h3>
                    <span className="text-xs text-[var(--adm-muted)]">{orders.length} total</span>
                </div>
                {orders.length === 0 ? (
                    <p className="text-center text-[var(--adm-muted)] py-10 text-sm">No orders assigned yet</p>
                ) : (
                    <>
                        <div className="overflow-x-auto adm-scroll">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="text-xs uppercase tracking-wide text-[var(--adm-muted)] bg-[var(--adm-bg)]/60">
                                        <th className="px-4 py-2 text-left font-medium">Order</th>
                                        <th className="px-4 py-2 text-left font-medium">Customer</th>
                                        <th className="px-4 py-2 text-left font-medium">Amount</th>
                                        <th className="px-4 py-2 text-left font-medium">Payment</th>
                                        <th className="px-4 py-2 text-left font-medium">Status</th>
                                        <th className="px-4 py-2 text-left font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--adm-line)]">
                                    {pageItems.map(o => {
                                        const pay = getPaymentBadge(o)
                                        return (
                                            <tr key={o._id} onClick={() => navigate(`/admin/order/${o._id}`)} className="hover:bg-emerald-50/40 transition cursor-pointer">
                                                <td className="px-4 py-2.5 font-mono text-xs text-[var(--adm-muted)]">#{o._id.slice(-6).toUpperCase()}</td>
                                                <td className="px-4 py-2.5 text-[var(--adm-ink)]">{o.address?.firstName} {o.address?.lastName}</td>
                                                <td className="px-4 py-2.5 font-semibold text-[var(--adm-ink)]">{currency}{o.amount}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className="text-[var(--adm-muted)] mr-1.5">{o.paymentMethod}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pay.className}`}>{pay.label}</span>
                                                </td>
                                                <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[o.status] || 'bg-gray-100 text-[var(--adm-muted)]'}`}>{o.status}</span></td>
                                                <td className="px-4 py-2.5 text-xs text-[var(--adm-muted)]">{new Date(o.date).toLocaleDateString()}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={orders.length} pageSize={6} start={start} />
                    </>
                )}
            </div>
        </div>
    )
}

export default DeliveryPersonView
