import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import { io } from 'socket.io-client'
import OTPBoxInput from '../components/OTPBoxInput'
import Pagination, { usePagination } from '../admin/components/Pagination'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

const shortId = (id) => id.slice(-6).toUpperCase()

const EyeIcon = ({ off }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
        {off && <path d="M4 4l16 16" />}
    </svg>
)

// ─── Login Screen ─────────────────────────────────────────────────────────────
const FieldIcon = ({ children }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

const FEATURES = [
    { title: 'Live route sharing', text: 'Customers follow your delivery on the map.' },
    { title: 'OTP-verified hand-over', text: 'Confirm every drop with the customer’s code.' },
    { title: 'Cash at a glance', text: 'See exactly how much to collect per order.' },
]

const DeliveryLogin = ({ onLogin }) => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError('')
        try {
            const res = await axios.post(backendUrl + '/api/delivery/login', form)
            if (res.data.success) {
                localStorage.setItem('delivery_token', res.data.token)
                localStorage.setItem('delivery_person', JSON.stringify(res.data.deliveryPerson))
                onLogin(res.data.token, res.data.deliveryPerson)
                toast.success(`Welcome, ${res.data.deliveryPerson.name}!`)
                return
            }
            setError(res.data.message || 'Login failed')
        } catch (err) {
            setError(err.response?.data?.message || 'Could not reach the server. Please try again.')
        }
        setLoading(false)
    }

    return (
        <div className="dp-login min-h-screen w-full grid md:grid-cols-2 bg-white">

            {/* Brand panel: compact strip on phones, full panel from md up */}
            <section className="relative overflow-hidden bg-[#0B1020] text-white px-6 py-6 md:p-12 flex flex-col justify-between">
                <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden="true" />

                <div className="relative flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-lg shadow-lg shadow-orange-500/30" aria-hidden="true">🛵</span>
                    <span className="text-sm font-semibold tracking-wide">Forever Rider</span>
                </div>

                <div className="relative mt-5 md:mt-0">
                    <h2 className="text-2xl md:text-4xl leading-tight font-extrabold tracking-tight">
                        Every order, <span className="text-orange-400">right on time.</span>
                    </h2>
                    <p className="hidden md:block mt-3 max-w-sm text-sm text-slate-300">Pick up deliveries, share your route and confirm hand-overs, all from one place.</p>

                    <ul className="hidden md:block mt-8 space-y-4 max-w-sm">
                        {FEATURES.map(f => (
                            <li key={f.title} className="flex items-start gap-3">
                                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs" aria-hidden="true">✓</span>
                                <div>
                                    <p className="text-sm font-semibold">{f.title}</p>
                                    <p className="text-xs text-slate-400">{f.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative hidden md:block text-xs text-slate-500">© {new Date().getFullYear()} Forever. All rights reserved.</p>
            </section>

            {/* Form */}
            <main className="flex items-center justify-center px-6 py-8 md:py-10">
                <div className="w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
                    <p className="mt-1 text-sm text-slate-500">Log in with your rider account.</p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="dp-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><FieldIcon><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></FieldIcon></span>
                                <input
                                    id="dp-email" type="email" required autoFocus autoComplete="username"
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    disabled={loading} placeholder="you@example.com"
                                    className="dp-input w-full pl-10 pr-3 py-3 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="dp-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><FieldIcon><rect x="4" y="10" width="16" height="10" rx="2.5" /><path d="M8 10V7.5a4 4 0 018 0V10" /></FieldIcon></span>
                                <input
                                    id="dp-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    disabled={loading} placeholder="Enter your password"
                                    className="dp-input w-full pl-10 pr-11 py-3 text-sm"
                                />
                                <button
                                    type="button" onClick={() => setShowPassword(s => !s)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-orange-600 transition cursor-pointer"
                                >
                                    <EyeIcon off={showPassword} />
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs font-medium text-rose-700">
                                <span aria-hidden="true">⚠️</span>{error}
                            </p>
                        )}

                        <button
                            type="submit" disabled={loading} aria-busy={loading}
                            className="btn w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/25 hover:bg-orange-600"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                                    Logging in…
                                </>
                            ) : 'Log in'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-xs text-slate-500">Trouble logging in? Ask your store admin to reset your password.</p>
                </div>
            </main>
        </div>
    )
}

// ─── Status ──────────────────────────────────────────────────────────────────
const statusColors = {
    'Order Placed':    'bg-amber-100 text-amber-700',
    'Order Confirmed': 'bg-sky-100 text-sky-700',
    'Assigned':        'bg-violet-100 text-violet-700',
    'Packed':          'bg-indigo-100 text-indigo-700',
    'Shipped':         'bg-indigo-100 text-indigo-700',
    'Out For delivery':'bg-orange-100 text-orange-700',
    'Delivered':       'bg-emerald-100 text-emerald-700',
}

const STEPS = ['Assigned', 'Packed', 'Out For delivery', 'Delivered']
const STEP_LABELS = ['Assigned', 'Packed', 'On the way', 'Delivered']
const stepIndex = (status) => {
    if (status === 'Shipped') return 1
    const i = STEPS.indexOf(status)
    return i === -1 ? 0 : i
}

const Stepper = ({ status }) => {
    const current = stepIndex(status)
    return (
        <ol className="flex items-center" aria-label="Delivery progress">
            {STEPS.map((s, i) => (
                <li key={s} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    <div className="flex flex-col items-center gap-1">
                        <span
                            aria-current={i === current ? 'step' : undefined}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${i < current ? 'bg-emerald-600 text-white' : i === current ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' : 'bg-gray-100 text-[var(--adm-muted)]'}`}
                        >
                            {i < current ? '✓' : i + 1}
                        </span>
                        <span className={`text-xs whitespace-nowrap ${i <= current ? 'text-[var(--adm-ink)] font-medium' : 'text-[var(--adm-muted)]'}`}>{STEP_LABELS[i]}</span>
                    </div>
                    {i < STEPS.length - 1 && <span className={`flex-1 h-0.5 mx-1.5 mb-4 rounded ${i < current ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
                </li>
            ))}
        </ol>
    )
}

// ─── Delivery OTP Modal ───────────────────────────────────────────────────────
const DeliveryOTPModal = ({ order, token, onClose, onDelivered }) => {
    const [otp, setOtp]             = useState('')
    const [verifying, setVerifying] = useState(false)
    const [sending, setSending]     = useState(false)
    const [otpReady, setOtpReady]   = useState(false)
    const authHeaders = { headers: { token } }

    const generateOTP = async () => {
        setSending(true)
        try {
            const res = await axios.post(
                backendUrl + '/api/delivery/request-delivery-otp',
                { orderId: order._id },
                authHeaders
            )
            if (res.data.success) {
                setOtpReady(true)
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
        setSending(false)
    }

    // Auto-generate OTP when modal opens
    useEffect(() => { generateOTP() }, [])

    const verifyAndDeliver = async () => {
        if (otp.length !== 6) return toast.error('Enter all 6 digits')
        setVerifying(true)
        try {
            const res = await axios.post(
                backendUrl + '/api/delivery/update-order-status',
                { orderId: order._id, status: 'Delivered', otp },
                authHeaders
            )
            if (res.data.success) {
                toast.success('Order delivered successfully!')
                onDelivered()
                onClose()
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
        setVerifying(false)
    }

    const collectCash = !order.payment && order.paymentMethod === 'COD'

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50 sm:px-4" role="dialog" aria-modal="true" aria-label="Confirm delivery">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm p-5">
                <div className="flex items-start justify-between mb-1">
                    <h2 className="text-lg font-semibold text-[var(--adm-ink)]">Confirm delivery</h2>
                    <button onClick={onClose} className="btn btn-icon" aria-label="Close">✕</button>
                </div>
                <p className="text-sm text-[var(--adm-muted)] mb-4">
                    Order #{shortId(order._id)} · {order.address.firstName} {order.address.lastName}
                </p>

                {collectCash && (
                    <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 mb-4">
                        <p className="text-sm text-amber-800">Collect cash from customer</p>
                        <p className="text-lg font-semibold text-amber-800">₹{order.amount}</p>
                    </div>
                )}

                {sending ? (
                    <div className="flex items-center gap-2 bg-[var(--adm-bg)] rounded-xl px-4 py-3 mb-4">
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                        <p className="text-sm text-[var(--adm-muted)]">Generating OTP…</p>
                    </div>
                ) : otpReady ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-2">
                        <p className="text-sm text-emerald-700 font-medium">✓ OTP shown on customer’s order page</p>
                        <button onClick={generateOTP} className="text-xs text-emerald-700 underline shrink-0 cursor-pointer">Refresh</button>
                    </div>
                ) : null}

                <p className="text-sm text-[var(--adm-muted)] text-center mb-3">Ask the customer for the 6-digit OTP</p>
                <OTPBoxInput value={otp} onChange={setOtp} disabled={verifying || sending} accent="green" />

                <div className="flex gap-3 mt-3">
                    <button onClick={onClose} className="btn btn-secondary btn-lg flex-1">Cancel</button>
                    <button onClick={verifyAndDeliver} disabled={verifying || otp.length !== 6} className="btn btn-primary btn-lg flex-1">
                        {verifying ? 'Verifying…' : 'Confirm delivery'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Step update notification badge ──────────────────────────────────────────
const StepNotification = ({ notifications }) => {
    if (!notifications.length) return null
    return (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-40 space-y-2 sm:max-w-xs" aria-live="polite">
            {notifications.map((n, i) => (
                <div key={i} className="bg-emerald-700 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse shrink-0" />
                    <span>{n}</span>
                </div>
            ))}
        </div>
    )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DeliveryHome = ({ token, person, onLogout }) => {
    const [orders, setOrders] = useState([])
    const [fetching, setFetching] = useState(true)
    const [sharing, setSharing] = useState(false)
    const [location, setLocation] = useState(null)
    const [busyId, setBusyId] = useState(null)
    const [otpOrder, setOtpOrder] = useState(null)
    const [notifications, setNotifications] = useState([])
    const [tab, setTab] = useState('active') // 'active' | 'completed'
    const watchIdRef = useRef(null)
    const socketRef = useRef(null)

    const authHeaders = { headers: { token } }

    const addNotification = (msg) => {
        setNotifications(prev => [...prev, msg])
        setTimeout(() => setNotifications(prev => prev.slice(1)), 5000)
    }

    const fetchOrders = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/delivery/my-orders', authHeaders)
            if (res.data.success) setOrders(res.data.orders)
        } catch (err) {
            toast.error(err.message)
        }
        setFetching(false)
    }

    useEffect(() => {
        fetchOrders()
        socketRef.current = io(backendUrl, { transports: ['websocket', 'polling'] })
        socketRef.current.emit('delivery:join', { deliveryPersonId: person.id })

        socketRef.current.on('order-assigned', (data) => {
            toast.info(`New order assigned: #${shortId(data.orderId)}`)
            addNotification(`Order #${shortId(data.orderId)} assigned to you`)
            fetchOrders()
        })
        socketRef.current.on('order-status-update', (data) => {
            addNotification(`Order #${shortId(data.orderId)} → ${data.status}`)
            fetchOrders()
        })
        socketRef.current.on('delivery-otp-sent', (data) => {
            addNotification(data.message)
        })

        return () => {
            stopSharing()
            socketRef.current?.disconnect()
        }
    }, [])

    const startSharing = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported by this browser')
            return
        }
        setSharing(true)
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords
                setLocation({ lat, lng })
                axios.post(backendUrl + '/api/delivery/update-location', { lat, lng }, authHeaders).catch(() => {})
            },
            (err) => {
                toast.error('Location error: ' + err.message)
                setSharing(false)
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        )
    }

    const stopSharing = () => {
        if (watchIdRef.current != null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setSharing(false)
    }

    const updateOrderStatus = async (orderId, status) => {
        setBusyId(orderId)
        try {
            const res = await axios.post(
                backendUrl + '/api/delivery/update-order-status',
                { orderId, status },
                authHeaders
            )
            if (res.data.success) {
                toast.success('Status updated')
                fetchOrders()
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
        setBusyId(null)
    }

    const activeOrders    = orders.filter(o => o.status !== 'Delivered')
    const completedOrders = orders.filter(o => o.status === 'Delivered')
    const displayOrders = tab === 'active' ? activeOrders : completedOrders
    const { page, setPage, totalPages, pageItems, start } = usePagination(displayOrders, 5)

    const initials = person.name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)

    const primaryAction = (order) => {
        if (order.status === 'Assigned') return { label: '📦 Mark packed', run: () => updateOrderStatus(order._id, 'Packed') }
        if (order.status === 'Packed' || order.status === 'Shipped') return { label: '🚲 Start delivery', run: () => updateOrderStatus(order._id, 'Out For delivery') }
        if (order.status === 'Out For delivery') return { label: '✓ Mark delivered', run: () => setOtpOrder(order) }
        return null
    }

    return (
        <div className="min-h-screen bg-[var(--adm-bg)] pb-10">
            {otpOrder && (
                <DeliveryOTPModal order={otpOrder} token={token} onClose={() => setOtpOrder(null)} onDelivered={fetchOrders} />
            )}
            <StepNotification notifications={notifications} />

            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[var(--adm-line)]">
                <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-semibold">{initials}</div>
                        <div>
                            <p className="text-sm font-semibold text-[var(--adm-ink)] leading-tight">{person.name}</p>
                            <p className="text-xs text-[var(--adm-muted)] leading-tight">Forever Delivery</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="btn btn-secondary">Logout</button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
                <h1 className="sr-only">Delivery dashboard</h1>

                {/* Hero: stats + location */}
                <section className="relative overflow-hidden rounded-2xl p-4 text-white bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900">
                    <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
                    <p className="relative text-xs uppercase tracking-wide text-emerald-100/80">Today</p>
                    <div className="relative mt-2 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white/10 px-3 py-2">
                            <p className="text-2xl font-semibold leading-tight">{activeOrders.length}</p>
                            <p className="text-xs text-emerald-100/80">Active orders</p>
                        </div>
                        <div className="rounded-xl bg-white/10 px-3 py-2">
                            <p className="text-2xl font-semibold leading-tight">{completedOrders.length}</p>
                            <p className="text-xs text-emerald-100/80">Delivered</p>
                        </div>
                    </div>

                    <div className="relative mt-3 flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${sharing ? 'bg-emerald-300 animate-pulse' : 'bg-white/40'}`} />
                            <div className="min-w-0">
                                <p className="text-sm font-medium">{sharing ? 'Sharing live location' : 'Location sharing is off'}</p>
                                {sharing && location && <p className="text-xs text-emerald-100/70 truncate">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
                            </div>
                        </div>
                        <button
                            onClick={sharing ? stopSharing : startSharing}
                            aria-pressed={sharing}
                            className="shrink-0 rounded-lg bg-white text-emerald-800 text-xs font-semibold px-3 py-2 hover:bg-emerald-50 transition cursor-pointer"
                        >
                            {sharing ? 'Stop' : 'Start sharing'}
                        </button>
                    </div>
                </section>

                {/* Tabs */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                        <button onClick={() => setTab('active')} aria-pressed={tab === 'active'} className="btn btn-tab">Active ({activeOrders.length})</button>
                        <button onClick={() => setTab('completed')} aria-pressed={tab === 'completed'} className="btn btn-tab">Completed ({completedOrders.length})</button>
                    </div>
                    <button onClick={fetchOrders} className="btn btn-secondary" aria-label="Refresh orders">↻ Refresh</button>
                </div>

                {/* Orders */}
                {fetching ? (
                    <div className="space-y-3" aria-busy="true">
                        {[0, 1].map(i => <div key={i} className="adm-card h-40 animate-pulse bg-white" />)}
                    </div>
                ) : displayOrders.length === 0 ? (
                    <div className="adm-card p-10 text-center">
                        <p className="text-3xl mb-2">{tab === 'active' ? '🎉' : '📭'}</p>
                        <p className="text-sm font-medium text-[var(--adm-ink)]">{tab === 'active' ? 'No active orders' : 'No completed orders yet'}</p>
                        <p className="text-xs text-[var(--adm-muted)] mt-1">{tab === 'active' ? 'New assignments will appear here instantly.' : 'Delivered orders will show up here.'}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pageItems.map(order => {
                            const action = primaryAction(order)
                            const collectCash = !order.payment && order.paymentMethod === 'COD' && order.status !== 'Delivered'
                            const phone = order.address.phone
                            return (
                                <article key={order._id} className="adm-card p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-[var(--adm-muted)] font-mono">#{shortId(order._id)}</p>
                                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                                        </div>
                                        <p className="text-lg font-semibold text-[var(--adm-ink)]">₹{order.amount}</p>
                                    </div>

                                    {order.status !== 'Delivered' && <div className="mt-4"><Stepper status={order.status} /></div>}

                                    <div className="mt-4 flex items-start gap-2.5">
                                        <div className="w-8 h-8 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                                            {order.address.firstName?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-[var(--adm-ink)]">{order.address.firstName} {order.address.lastName}</p>
                                            <p className="text-xs text-[var(--adm-muted)]">📍 {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipcode}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                        <span className="text-[var(--adm-muted)]">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                        {collectCash
                                            ? <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Collect ₹{order.amount} cash</span>
                                            : <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{order.payment || order.status === 'Delivered' ? 'Paid' : 'Prepaid'}</span>}
                                    </div>

                                    <div className="mt-4 flex gap-2 flex-wrap">
                                        {action && (
                                            <button onClick={action.run} disabled={busyId === order._id} className="btn btn-primary btn-lg flex-1 min-w-[10rem]">
                                                {busyId === order._id ? 'Updating…' : action.label}
                                            </button>
                                        )}
                                        {phone && order.status !== 'Delivered' && (
                                            <a href={`tel:${phone}`} className="btn btn-secondary btn-lg">📞 Call</a>
                                        )}
                                        <a
                                            href={`https://maps.google.com/?q=${encodeURIComponent(order.address.street + ' ' + order.address.city)}`}
                                            target="_blank" rel="noreferrer"
                                            className="btn btn-secondary btn-lg"
                                        >
                                            🗺 Maps
                                        </a>
                                    </div>
                                </article>
                            )
                        })}
                        <div className="adm-card overflow-hidden">
                            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={displayOrders.length} pageSize={5} start={start} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

// ─── Root component: handles login state ─────────────────────────────────────
const DeliveryPortal = () => {
    const [token, setToken] = useState(() => localStorage.getItem('delivery_token') || '')
    const [person, setPerson] = useState(() => {
        try { return JSON.parse(localStorage.getItem('delivery_person')) } catch { return null }
    })

    const handleLogin = (t, p) => {
        setToken(t)
        setPerson(p)
    }

    const handleLogout = () => {
        localStorage.removeItem('delivery_token')
        localStorage.removeItem('delivery_person')
        setToken('')
        setPerson(null)
    }

    return (
        <div className="delivery-app">
            <ToastContainer position="top-center" />
            {!token || !person
                ? <DeliveryLogin onLogin={handleLogin} />
                : <DeliveryHome token={token} person={person} onLogout={handleLogout} />}
        </div>
    )
}

export default DeliveryPortal
