import React, { useContext, useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { io } from 'socket.io-client'

const STEPS = [
    { key: 'Order Placed',     label: 'Placed',           icon: '🕐' },
    { key: 'Order Confirmed',  label: 'Confirmed',         icon: '✓'  },
    { key: 'Assigned',         label: 'Assigned',          icon: '👤' },
    { key: 'Packed',           label: 'Packed',            icon: '📦' },
    { key: 'Out For delivery', label: 'Out for Delivery',  icon: '🚲' },
    { key: 'Delivered',        label: 'Delivered',         icon: '✓'  },
]
const STATUS_ORDER = STEPS.map(s => s.key)

const formatDate = (d) => {
    const dt = new Date(d)
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// Build Google Maps URLs from address
const buildMapUrls = (address) => {
    const parts = [
        address.street,
        address.city,
        address.state,
        address.zipcode,
        address.country || 'India'
    ].filter(Boolean)
    const q = encodeURIComponent(parts.join(', '))
    return {
        embed: `https://maps.google.com/maps?q=${q}&t=m&z=15&ie=UTF8&iwloc=&output=embed`,
        open:  `https://maps.google.com/?q=${q}`,
    }
}

const OrderTracking = () => {
    const { orderId } = useParams()
    const { backendUrl, token, currency } = useContext(ShopContext)
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [deliveryLocation, setDeliveryLocation] = useState(null)
    const [loading, setLoading] = useState(true)
    const socketRef = useRef(null)

    const fetchOrder = async () => {
        try {
            const res = await axios.post(
                backendUrl + '/api/order/detail',
                { orderId },
                { headers: { Authorization: `Bearer ${token}`, token } }
            )
            if (res.data.success) setOrder(res.data.order)
        } catch (_) {}
        setLoading(false)
    }

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchOrder()

        socketRef.current = io(backendUrl, { transports: ['websocket', 'polling'] })
        socketRef.current.emit('order:track', { orderId })

        socketRef.current.on('delivery-location-update', (data) => {
            setDeliveryLocation({ lat: data.lat, lng: data.lng })
        })
        socketRef.current.on('order-status-update', (data) => {
            if (data.orderId === orderId) fetchOrder()
        })
        socketRef.current.on('delivery-otp-ready', (data) => {
            if (data.orderId === orderId) fetchOrder()
        })

        return () => socketRef.current?.disconnect()
    }, [orderId, token])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-700 rounded-full"></div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-3">
                <p>Order not found</p>
                <button onClick={() => navigate('/orders')} className="text-sm text-indigo-600 underline">Back to Orders</button>
            </div>
        )
    }

    const currentStepIdx = STATUS_ORDER.indexOf(order.status)
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = Math.round(subtotal * 0.08 * 100) / 100
    const mapUrls = buildMapUrls(order.address)

    // Live delivery location link (GPS)
    const deliveryMapUrl = deliveryLocation
        ? `https://maps.google.com/?q=${deliveryLocation.lat},${deliveryLocation.lng}`
        : null

    const deliveryOtp = order.deliveryOtp
    const otpDigits = deliveryOtp ? deliveryOtp.split('') : []

    return (
        <div className="border-t pt-10 pb-16 max-w-5xl mx-auto">

            {/* Back link */}
            <button
                onClick={() => navigate('/orders')}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
            >
                ← Back to Orders
            </button>

            <h2 className="text-xl font-semibold text-gray-900 mb-1">Order #{order._id.slice(-8).toUpperCase()}</h2>
            <p className="text-sm text-gray-400 mb-6">
                {new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                &nbsp;·&nbsp;{order.paymentMethod}
            </p>

            {/* ── Delivery OTP Card ── */}
            {deliveryOtp && order.status === 'Out For delivery' && (
                <div className="bg-[#1c3829] rounded-xl p-5 mb-6 flex items-center gap-4 flex-wrap">
                    <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        🚲
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold">Delivery OTP</p>
                        <p className="text-white/60 text-xs mt-0.5">Share this code with your delivery partner</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {otpDigits.map((digit, i) => (
                            <div
                                key={i}
                                className="w-10 h-11 bg-white/15 rounded-lg flex items-center justify-center text-white font-bold text-xl select-all"
                            >
                                {digit}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Map + Right Panel ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 mb-6">

                {/* Google Maps iframe */}
                <div className="rounded-xl overflow-hidden border border-gray-200 h-[340px] lg:h-[400px] relative">
                    <iframe
                        title="Delivery Location"
                        src={mapUrls.embed}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                    {/* Overlay buttons */}
                    <div className="absolute bottom-3 left-3 flex gap-2">
                        <a
                            href={mapUrls.open}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 flex items-center gap-1 transition"
                        >
                            🗺 Open in Maps
                        </a>
                        {deliveryMapUrl && (
                            <a
                                href={deliveryMapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-full shadow-md hover:bg-green-700 flex items-center gap-1 transition"
                            >
                                📍 Live Location
                            </a>
                        )}
                    </div>
                </div>

                {/* Address + Items + Totals */}
                <div className="space-y-4">

                    {/* Delivery Address */}
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                            <span>📍</span> Delivery Address
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                            {order.address.firstName} {order.address.lastName}
                        </p>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                            {order.address.street}<br />
                            {order.address.city}, {order.address.state} {order.address.zipcode}
                        </p>
                        {order.address.phone && (
                            <p className="text-xs text-gray-400 mt-1">{order.address.phone}</p>
                        )}
                        <a
                            href={mapUrls.open}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-600 hover:underline"
                        >
                            View on Google Maps →
                        </a>
                    </div>

                    {/* Items + Totals */}
                    <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">
                            Items ({order.items.length})
                        </h3>
                        <div className="space-y-2 mb-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {item.image?.[0] && (
                                            <img src={item.image[0]} alt="" className="w-8 h-8 object-cover rounded shrink-0" />
                                        )}
                                        <span className="text-gray-600 truncate">
                                            {item.name} <span className="text-gray-400">x{item.quantity}</span>
                                        </span>
                                    </div>
                                    <span className="text-gray-800 font-medium shrink-0">
                                        {currency}{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span><span>{currency}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Delivery</span><span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Tax</span><span>{currency}{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-900 pt-1.5 border-t border-gray-100">
                                <span>Total</span><span>{currency}{order.amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery person badge */}
                    {order.deliveryPersonName && (
                        <div className="border border-gray-200 rounded-xl p-3 flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                                {order.deliveryPersonName[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Delivery Partner</p>
                                <p className="text-sm font-medium text-gray-800">{order.deliveryPersonName}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Delivery Progress Timeline ── */}
            <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-800 mb-6">Delivery Progress</h3>

                <div className="relative">
                    <div className="absolute left-3.75 top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>

                    <div className="space-y-7">
                        {STEPS.map((step, idx) => {
                            const isCompleted = idx < currentStepIdx
                            const isCurrent   = idx === currentStepIdx
                            const active      = isCompleted || isCurrent

                            const histEntry = order.statusHistory?.find(h => h.status === step.key)
                            const timestamp = step.key === 'Order Placed' ? order.date : histEntry?.timestamp

                            return (
                                <div key={step.key} className="relative flex items-start gap-4 pl-10">
                                    <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 transition-all
                                        ${active ? 'bg-[#1c3829] text-white shadow-sm' : 'bg-white border-2 border-gray-300 text-gray-400'}`}
                                    >
                                        {step.icon}
                                    </div>
                                    <div className="pt-0.5">
                                        <p className={`font-medium text-sm ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {step.label}
                                        </p>
                                        {active && timestamp && (
                                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(timestamp)}</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderTracking
