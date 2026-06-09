import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { io } from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

// ─── Login Screen ─────────────────────────────────────────────────────────────
const DeliveryLogin = ({ onLogin }) => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post(backendUrl + '/api/delivery/login', form)
            if (res.data.success) {
                localStorage.setItem('delivery_token', res.data.token)
                localStorage.setItem('delivery_person', JSON.stringify(res.data.deliveryPerson))
                onLogin(res.data.token, res.data.deliveryPerson)
                toast.success(`Welcome, ${res.data.deliveryPerson.name}!`)
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 w-full max-w-sm">
                <h2 className="text-2xl font-semibold text-gray-800 mb-1">Delivery Login</h2>
                <p className="text-sm text-gray-500 mb-6">Sign in to your delivery account</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email" required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password" required
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusColors = {
    'Order Placed':    'bg-yellow-100 text-yellow-700',
    'Order Confirmed': 'bg-blue-100 text-blue-700',
    'Packing':         'bg-purple-100 text-purple-700',
    'Shipped':         'bg-indigo-100 text-indigo-700',
    'Out For delivery':'bg-orange-100 text-orange-700',
    'Delivered':       'bg-green-100 text-green-700',
}

// ─── 6-Box OTP Input ─────────────────────────────────────────────────────────
const OTPBoxInput = ({ value, onChange, disabled }) => {
    const inputs = useRef([])
    const digits = value.split('').concat(Array(6).fill('')).slice(0, 6)

    const handleKey = (e, idx) => {
        if (e.key === 'Backspace') {
            const next = value.slice(0, idx) + value.slice(idx + 1)
            onChange(next)
            if (idx > 0) inputs.current[idx - 1]?.focus()
            return
        }
        if (e.key === 'ArrowLeft' && idx > 0) { inputs.current[idx - 1]?.focus(); return }
        if (e.key === 'ArrowRight' && idx < 5) { inputs.current[idx + 1]?.focus(); return }
    }

    const handleChange = (e, idx) => {
        const char = e.target.value.replace(/\D/g, '').slice(-1)
        if (!char) return
        const arr = digits.slice()
        arr[idx] = char
        const next = arr.join('').replace(/ /g, '')
        onChange(next.slice(0, 6))
        if (idx < 5) inputs.current[idx + 1]?.focus()
    }

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 5)]?.focus() }
        e.preventDefault()
    }

    return (
        <div className="flex gap-2 justify-center mb-5">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    disabled={disabled}
                    onChange={e => handleChange(e, i)}
                    onKeyDown={e => handleKey(e, i)}
                    onPaste={handlePaste}
                    onFocus={e => e.target.select()}
                    className="w-11 h-12 border-2 rounded-lg text-center text-xl font-bold text-gray-800
                               border-gray-200 focus:border-green-500 focus:outline-none
                               bg-gray-50 focus:bg-white transition-all disabled:opacity-50"
                />
            ))}
        </div>
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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">

                {/* Header */}
                <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900">Confirm Delivery</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>
                <p className="text-sm text-gray-400 mb-5">
                    Order #{order._id.slice(-6).toUpperCase()} &nbsp;·&nbsp; {order.address.firstName} {order.address.lastName}
                </p>

                {/* Status */}
                {sending ? (
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-5">
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin shrink-0"></div>
                        <p className="text-sm text-gray-400">Generating OTP...</p>
                    </div>
                ) : otpReady ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 flex items-center justify-between gap-2">
                        <p className="text-sm text-green-700 font-medium">✓ OTP shown on customer's order page</p>
                        <button onClick={generateOTP} className="text-xs text-green-600 underline shrink-0">Refresh</button>
                    </div>
                ) : null}

                {/* Instruction */}
                <p className="text-sm text-gray-500 text-center mb-4">
                    Ask the customer the 6-digit OTP visible on their order page
                </p>

                {/* 6-box OTP input */}
                <OTPBoxInput value={otp} onChange={setOtp} disabled={verifying || sending} />

                {/* Actions */}
                <div className="flex gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={verifyAndDeliver}
                        disabled={verifying || otp.length !== 6}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition"
                    >
                        {verifying ? 'Verifying...' : 'Confirm Delivery ✓'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Step update notification badge ──────────────────────────────────────────
const StepNotification = ({ notifications, onClear }) => {
    if (!notifications.length) return null
    return (
        <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-xs">
            {notifications.map((n, i) => (
                <div key={i} className="bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0"></span>
                    <span>{n}</span>
                </div>
            ))}
        </div>
    )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DeliveryHome = ({ token, person, onLogout }) => {
    const [orders, setOrders] = useState([])
    const [sharing, setSharing] = useState(false)
    const [location, setLocation] = useState(null)
    const [loading, setLoading] = useState(false)
    const [otpOrder, setOtpOrder] = useState(null) // order being confirmed via OTP
    const [notifications, setNotifications] = useState([])
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
    }

    useEffect(() => {
        fetchOrders()
        socketRef.current = io(backendUrl, { transports: ['websocket', 'polling'] })
        socketRef.current.emit('delivery:join', { deliveryPersonId: person.id })

        // New order assigned
        socketRef.current.on('order-assigned', (data) => {
            toast.info(`New order assigned: #${data.orderId.slice(-6).toUpperCase()}`)
            addNotification(`Order #${data.orderId.slice(-6).toUpperCase()} assigned to you`)
            fetchOrders()
        })

        // Order status updated (by admin or self)
        socketRef.current.on('order-status-update', (data) => {
            addNotification(`Order #${data.orderId.slice(-6).toUpperCase()} → ${data.status}`)
            fetchOrders()
        })

        // OTP sent confirmation
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
        setLoading(true)
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
        setLoading(false)
    }

    const activeOrders    = orders.filter(o => o.status !== 'Delivered')
    const completedOrders = orders.filter(o => o.status === 'Delivered')
    const [tab, setTab] = useState('active') // 'active' | 'completed'

    const displayOrders = tab === 'active' ? activeOrders : completedOrders

    return (
        <div className="min-h-screen bg-gray-50">
            {/* OTP Confirmation Modal */}
            {otpOrder && (
                <DeliveryOTPModal
                    order={otpOrder}
                    token={token}
                    onClose={() => setOtpOrder(null)}
                    onDelivered={fetchOrders}
                />
            )}

            {/* Step Notifications */}
            <StepNotification notifications={notifications} />

            {/* Header */}
            <div className="bg-white border-b px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🚲</span>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 leading-tight">Instacart Delivery</h1>
                        <p className="text-xs text-gray-400">{person.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onLogout}
                        className="text-gray-400 hover:text-red-500 transition text-lg"
                        title="Logout"
                    >
                        ⎋
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setTab('active')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${tab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setTab('completed')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${tab === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Completed
                    </button>
                </div>

                {/* Order cards */}
                {displayOrders.length === 0 && (
                    <div className="bg-white border rounded-xl p-10 text-center text-gray-400">
                        {tab === 'active' ? 'No active orders' : 'No completed orders'}
                    </div>
                )}

                {displayOrders.map(order => (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-xs text-gray-400">#{order._id.slice(-6).toUpperCase()}</p>
                                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">₹{order.amount}</p>
                        </div>

                        {/* Customer + address */}
                        <div className="flex items-start gap-2 mb-2">
                            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                                {order.address.firstName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    {order.address.firstName} {order.address.lastName}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <span>📍</span>
                                    {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipcode}
                                </p>
                            </div>
                        </div>

                        {/* Items count + payment */}
                        <p className="text-xs text-gray-500 mb-3">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
                            <span className={order.payment ? 'text-green-600' : 'text-orange-500'}>
                                {order.payment ? 'PAID' : order.paymentMethod === 'COD' ? 'CASH' : 'CARD'}
                            </span>
                        </p>

                        {/* Action buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {order.status === 'Assigned' && (
                                <button
                                    onClick={() => updateOrderStatus(order._id, 'Packed')}
                                    disabled={loading}
                                    className="text-xs bg-[#1c3829] text-white px-4 py-2 rounded-lg hover:bg-[#152c20] disabled:opacity-50 flex items-center gap-1"
                                >
                                    📦 Mark Packed
                                </button>
                            )}
                            {order.status === 'Packed' && (
                                <button
                                    onClick={() => updateOrderStatus(order._id, 'Out For delivery')}
                                    disabled={loading}
                                    className="text-xs bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1"
                                >
                                    🚲 Start Delivery
                                </button>
                            )}
                            {/* Keep backward compat for Shipped status */}
                            {order.status === 'Shipped' && (
                                <button
                                    onClick={() => updateOrderStatus(order._id, 'Out For delivery')}
                                    disabled={loading}
                                    className="text-xs bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                                >
                                    Start Delivery
                                </button>
                            )}
                            {order.status === 'Out For delivery' && (
                                <button
                                    onClick={() => setOtpOrder(order)}
                                    className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-1"
                                >
                                    ✓ Mark Delivered
                                </button>
                            )}
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(order.address.street + ' ' + order.address.city)}`}
                                target="_blank" rel="noreferrer"
                                className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200"
                            >
                                🗺 Maps
                            </a>
                        </div>
                    </div>
                ))}

                <button onClick={fetchOrders} className="w-full text-xs text-gray-400 underline py-2">
                    Refresh
                </button>
            </div>
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

    if (!token || !person) return <DeliveryLogin onLogin={handleLogin} />
    return <DeliveryHome token={token} person={person} onLogout={handleLogout} />
}

export default DeliveryPortal
