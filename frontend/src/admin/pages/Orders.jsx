import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import Invoice from '../../components/Invoice'
import Pagination, { usePagination } from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'
import { EyeIcon, IconButton } from '../components/Icons'
import { getPaymentBadge } from '../utils/orderPayment'

const DAY_MS = 24 * 60 * 60 * 1000

const STATUSES = ['Order Placed', 'Order Confirmed', 'Assigned', 'Packed', 'Out For delivery', 'Delivered', 'Cancelled']
const STATUS_LABEL = { 'Out For delivery': 'Out for Delivery' }

// Tabs group the 7 statuses into the stages an admin actually works with.
const TABS = [
    { key: 'all',       label: 'All',         match: () => true },
    { key: 'new',       label: 'New',         match: o => ['Order Placed', 'Order Confirmed'].includes(o.status) },
    { key: 'progress',  label: 'In progress', match: o => ['Assigned', 'Packed', 'Out For delivery'].includes(o.status) },
    { key: 'delivered', label: 'Delivered',   match: o => o.status === 'Delivered' },
    { key: 'cancelled', label: 'Cancelled',   match: o => o.status === 'Cancelled' },
]

const DATE_RANGES = [
    { key: 'all', label: 'All time', days: null },
    { key: '1',   label: 'Today',    days: 1 },
    { key: '7',   label: 'Last 7 days',  days: 7 },
    { key: '30',  label: 'Last 30 days', days: 30 },
]

const statusStyle = {
    'Order Placed':    { background: '#FFFBEB', color: '#B45309', borderColor: '#FCD34D' },
    'Order Confirmed': { background: '#F0F9FF', color: '#0369A1', borderColor: '#7DD3FC' },
    'Assigned':        { background: '#F5F3FF', color: '#6D28D9', borderColor: '#C4B5FD' },
    'Packed':          { background: '#EEF2FF', color: '#4338CA', borderColor: '#A5B4FC' },
    'Out For delivery':{ background: '#FFF7ED', color: '#C2410C', borderColor: '#FDBA74' },
    'Delivered':       { background: '#ECFDF5', color: '#047857', borderColor: '#6EE7B7' },
    'Cancelled':       { background: '#FFF1F2', color: '#BE123C', borderColor: '#FDA4AF' },
}

const customerName = (o) => `${o.address?.firstName || ''} ${o.address?.lastName || ''}`.trim()

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
)

const Orders = ({ token }) => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [deliveryPersons, setDeliveryPersons] = useState([])
    const [invoiceOrder, setInvoiceOrder] = useState(null)
    const [tab, setTab] = useState('all')
    const [query, setQuery] = useState('')
    const [range, setRange] = useState('all')
    const [pending, setPending] = useState(null) // { kind, order, status|deliveryPersonId }
    const [working, setWorking] = useState(false)

    const fetchAllOrders = async () => {
        if (!token) return
        try {
            const res = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
            if (res.data.success) setOrders(res.data.orders.reverse())
            else toast.error(res.data.message)
        } catch (err) {
            toast.error(err.message)
        }
        setLoading(false)
    }

    const fetchDeliveryPersons = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/delivery/list', { headers: { token } })
            if (res.data.success) setDeliveryPersons(res.data.deliveryPersons.filter(d => d.isActive))
        } catch (_) {}
    }

    useEffect(() => {
        fetchAllOrders()
        fetchDeliveryPersons()
    }, [token])

    const applyStatus = async (orderId, status) => {
        try {
            const res = await axios.post(backendUrl + '/api/order/status', { orderId, status }, { headers: { token } })
            if (res.data.success) {
                toast.success(`Status set to ${STATUS_LABEL[status] || status}`)
                await fetchAllOrders()
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    const applyAssign = async (orderId, deliveryPersonId) => {
        try {
            const res = await axios.post(backendUrl + '/api/delivery/assign-order', { orderId, deliveryPersonId }, { headers: { token } })
            if (res.data.success) {
                toast.success(res.data.message)
                await fetchAllOrders()
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    // Risky changes go through a confirmation; everything else applies immediately.
    const requestStatusChange = (order, status) => {
        if (status === order.status) return
        if (status === 'Delivered' || status === 'Cancelled') setPending({ kind: 'status', order, status })
        else applyStatus(order._id, status)
    }

    const requestAssign = (order, deliveryPersonId) => {
        if (!deliveryPersonId || deliveryPersonId === order.deliveryPersonId) return
        if (order.deliveryPersonId) setPending({ kind: 'assign', order, deliveryPersonId })
        else applyAssign(order._id, deliveryPersonId)
    }

    const confirmPending = async () => {
        setWorking(true)
        if (pending.kind === 'status') await applyStatus(pending.order._id, pending.status)
        else await applyAssign(pending.order._id, pending.deliveryPersonId)
        setWorking(false)
        setPending(null)
    }

    const counts = useMemo(() => Object.fromEntries(TABS.map(t => [t.key, orders.filter(t.match).length])), [orders])

    const filtered = useMemo(() => {
        const tabDef = TABS.find(t => t.key === tab)
        const days = DATE_RANGES.find(r => r.key === range)?.days
        const since = days ? Date.now() - days * DAY_MS : 0
        const q = query.trim().toLowerCase()
        return orders.filter(o => {
            if (!tabDef.match(o)) return false
            if (since && o.date < since) return false
            if (!q) return true
            return (
                customerName(o).toLowerCase().includes(q) ||
                (o.address?.phone || '').includes(q) ||
                (o._id || '').toLowerCase().includes(q) ||
                (o.deliveryPersonName || '').toLowerCase().includes(q)
            )
        })
    }, [orders, tab, range, query])

    const { page, setPage, totalPages, pageItems, start } = usePagination(filtered, 10)

    const pendingText = pending && (
        pending.kind === 'assign'
            ? {
                title: 'Reassign this order?',
                message: `Order #${pending.order._id.slice(-6).toUpperCase()} is currently assigned to ${pending.order.deliveryPersonName}. It will move to ${deliveryPersons.find(d => d._id === pending.deliveryPersonId)?.name || 'the selected rider'}.`,
                label: 'Reassign', tone: 'primary',
            }
            : pending.status === 'Cancelled'
                ? {
                    title: 'Cancel this order?',
                    message: `Order #${pending.order._id.slice(-6).toUpperCase()} for ${customerName(pending.order)} will be marked Cancelled.`,
                    label: 'Cancel order', tone: 'danger',
                }
                : {
                    title: 'Mark as delivered?',
                    message: `Order #${pending.order._id.slice(-6).toUpperCase()} will be marked Delivered${pending.order.paymentMethod === 'COD' ? ', its COD payment as paid,' : ''} and reward points will be awarded to the customer.`,
                    label: 'Mark delivered', tone: 'primary',
                }
    )

    return (
        <div className='flex flex-col gap-4 max-w-[1400px]'>
            {invoiceOrder && <Invoice order={invoiceOrder} currency={currency} onClose={() => setInvoiceOrder(null)} />}
            {pending && (
                <ConfirmDialog
                    title={pendingText.title} message={pendingText.message}
                    confirmLabel={pendingText.label} tone={pendingText.tone}
                    busy={working} onConfirm={confirmPending} onCancel={() => setPending(null)}
                />
            )}

            <div>
                <h1 className='text-xl font-semibold text-[var(--adm-ink)]'>All Orders</h1>
                <p className='text-xs text-[var(--adm-muted)] mt-0.5'>{orders.length} order{orders.length !== 1 ? 's' : ''} in total</p>
            </div>

            {/* Status tabs */}
            <div className='flex gap-1.5 overflow-x-auto adm-scroll pb-1' role='tablist' aria-label='Order status'>
                {TABS.map(t => {
                    const active = tab === t.key
                    return (
                        <button
                            key={t.key} role='tab' aria-selected={active} onClick={() => setTab(t.key)}
                            className={`shrink-0 flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition cursor-pointer ${active ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-[var(--adm-line)] text-[var(--adm-muted)] hover:border-emerald-300 hover:text-[var(--adm-ink)]'}`}
                        >
                            {t.label}
                            <span className={`rounded-full px-1.5 min-w-5 text-center text-xs ${active ? 'bg-white/20 text-white' : 'bg-[var(--adm-bg)] text-[var(--adm-muted)]'}`}>{counts[t.key]}</span>
                        </button>
                    )
                })}
            </div>

            {/* Search + date filter */}
            <div className='flex flex-wrap gap-2'>
                <div className='relative flex-1 min-w-[220px] max-w-md'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--adm-muted)]'><SearchIcon /></span>
                    <input
                        type='search' value={query} onChange={e => setQuery(e.target.value)}
                        placeholder='Search customer, phone, order ID or rider…'
                        aria-label='Search orders'
                        className='w-full border border-[var(--adm-line)] bg-white rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--adm-ink)] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition'
                    />
                </div>
                <select
                    value={range} onChange={e => setRange(e.target.value)} aria-label='Date range'
                    className='border border-[var(--adm-line)] bg-white rounded-lg px-3 py-2 text-sm text-[var(--adm-ink)] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 cursor-pointer'
                >
                    {DATE_RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
                {(query || range !== 'all' || tab !== 'all') && (
                    <button className='btn btn-secondary' onClick={() => { setQuery(''); setRange('all'); setTab('all') }}>Clear filters</button>
                )}
            </div>

            <div className='adm-card overflow-hidden'>
                {loading ? (
                    <div className='p-4 space-y-3' aria-busy='true'>
                        {[0, 1, 2, 3, 4].map(i => <div key={i} className='h-12 rounded-lg bg-[var(--adm-bg)] animate-pulse' />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className='text-center py-14'>
                        <p className='text-3xl mb-2'>🔍</p>
                        <p className='text-sm font-medium text-[var(--adm-ink)]'>{orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}</p>
                        <p className='text-xs text-[var(--adm-muted)] mt-1'>{orders.length === 0 ? 'New orders will appear here.' : 'Try a different tab, date range or search.'}</p>
                    </div>
                ) : (
                    <>
                        <div className='overflow-x-auto adm-scroll'>
                            <table className='w-full text-[13px]'>
                                <thead>
                                    <tr className='bg-[var(--adm-bg)]/70 text-xs uppercase tracking-wide text-[var(--adm-muted)] border-b border-[var(--adm-line)]'>
                                        <th className='px-3 py-2.5 text-left font-medium'>Order</th>
                                        <th className='px-3 py-2.5 text-left font-medium'>Customer</th>
                                        <th className='px-3 py-2.5 text-left font-medium'>Amount</th>
                                        <th className='px-3 py-2.5 text-left font-medium'>Payment</th>
                                        <th className='px-3 py-2.5 text-left font-medium'>Status</th>
                                        <th className='px-3 py-2.5 text-left font-medium'>Delivery</th>
                                        <th className='px-3 py-2.5 text-right font-medium'>Action</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-[var(--adm-line)]'>
                                    {pageItems.map((order) => {
                                        const pay = getPaymentBadge(order)
                                        return (
                                            <tr key={order._id} className='hover:bg-emerald-50/40 transition'>
                                                <td className='px-3 py-2.5'>
                                                    <p className='font-mono text-xs text-[var(--adm-ink)]'>#{order._id.slice(-6).toUpperCase()}</p>
                                                    <p className='text-xs text-[var(--adm-muted)]'>{new Date(order.date).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                                </td>
                                                <td className='px-3 py-2.5 min-w-[140px]'>
                                                    <p className='font-medium text-[var(--adm-ink)]'>{customerName(order)}</p>
                                                    <p className='text-xs text-[var(--adm-muted)]'>{order.address?.phone}</p>
                                                </td>
                                                <td className='px-3 py-2.5 font-semibold text-[var(--adm-ink)]'>{currency}{order.amount}</td>
                                                <td className='px-3 py-2.5'>
                                                    <p className='text-xs text-[var(--adm-muted)] mb-0.5'>{order.paymentMethod}</p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pay.className}`}>{pay.label}</span>
                                                </td>
                                                <td className='px-3 py-2.5'>
                                                    <select
                                                        onChange={e => requestStatusChange(order, e.target.value)}
                                                        value={order.status}
                                                        style={statusStyle[order.status] || {}}
                                                        aria-label={`Status for order ${order._id.slice(-6)}`}
                                                        className='border rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold cursor-pointer outline-none'
                                                    >
                                                        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>)}
                                                    </select>
                                                </td>
                                                <td className='px-3 py-2.5 min-w-[170px]'>
                                                    <select
                                                        onChange={e => requestAssign(order, e.target.value)}
                                                        value={order.deliveryPersonId || ''}
                                                        aria-label={`Assign rider for order ${order._id.slice(-6)}`}
                                                        className='border border-[var(--adm-line)] bg-white rounded-lg px-2 py-1.5 text-xs w-full text-[var(--adm-ink)] cursor-pointer outline-none focus:border-emerald-500'
                                                    >
                                                        <option value=''>— Assign —</option>
                                                        {deliveryPersons.map(dp => (
                                                            <option key={dp._id} value={dp._id}>{dp.name} {dp.isAvailable ? '(Free)' : '(Busy)'}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className='px-3 py-2.5'>
                                                    <div className='flex items-center justify-end gap-2'>
                                                        <IconButton variant='view' onClick={() => navigate(`/admin/order/${order._id}`)} aria-label='View order' title='View'>
                                                            <EyeIcon />
                                                        </IconButton>
                                                        <button onClick={() => setInvoiceOrder(order)} className='btn btn-secondary' title='Invoice'>🧾 Invoice</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={10} start={start} />
                    </>
                )}
            </div>
        </div>
    )
}

export default Orders
