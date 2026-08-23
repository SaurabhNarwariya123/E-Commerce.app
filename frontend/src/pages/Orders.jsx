import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import OTPBoxInput from '../components/OTPBoxInput'
import Button from '../components/ui/Button'
import Invoice from '../components/Invoice'

const CANCELLABLE = ['Order Placed', 'Order Confirmed', 'Assigned']

// ─── Cancel Order OTP Modal ───────────────────────────────────────────────────
const CancelModal = ({ orderId, userId, token, backendUrl, onCancelled, onClose }) => {
    const [step, setStep]         = useState('confirm') // 'confirm' | 'otp'
    const [otp, setOtp]           = useState('')
    const [loading, setLoading]   = useState(false)
    const [resending, setResending] = useState(false)
    const headers = { headers: { Authorization: `Bearer ${token}`, token } }

    const requestOTP = async () => {
        setLoading(true)
        try {
            const res = await axios.post(
                backendUrl + '/api/order/request-cancel-otp',
                { orderId, userId },
                headers
            )
            if (res.data.success) { toast.success(res.data.message); setStep('otp') }
            else toast.error(res.data.message)
        } catch (err) { toast.error(err.message) }
        setLoading(false)
    }

    const confirmCancel = async () => {
        if (otp.length !== 6) return toast.error('Enter all 6 digits')
        setLoading(true)
        try {
            const res = await axios.post(
                backendUrl + '/api/order/confirm-cancel',
                { orderId, userId, otp },
                headers
            )
            if (res.data.success) { toast.success('Order cancelled'); onCancelled(); onClose() }
            else toast.error(res.data.message)
        } catch (err) { toast.error(err.message) }
        setLoading(false)
    }

    const resendOTP = async () => {
        setResending(true); setOtp('')
        try {
            const res = await axios.post(backendUrl + '/api/order/request-cancel-otp', { orderId, userId }, headers)
            if (res.data.success) toast.success('New OTP sent')
            else toast.error(res.data.message)
        } catch (err) { toast.error(err.message) }
        setResending(false)
    }

    return (
        <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm">

                {step === 'confirm' ? (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">⚠️</div>
                            <div>
                                <h3 className="text-base font-bold text-charcoal">Cancel Order?</h3>
                                <p className="text-xs text-gray-400">#{orderId.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            An OTP will be sent to your registered email to verify this cancellation.
                        </p>
                        <div className="flex gap-3">
                            <Button onClick={onClose} variant='outline' className="flex-1">
                                Go Back
                            </Button>
                            <Button onClick={requestOTP} disabled={loading} className="flex-1 bg-red-500! border-red-500! hover:bg-red-600!">
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-base font-bold text-charcoal mb-1">Verify Cancellation</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Enter the 6-digit OTP sent to your email to confirm cancellation.
                        </p>

                        <OTPBoxInput value={otp} onChange={setOtp} disabled={loading} accent="red" />

                        <div className="flex gap-3">
                            <Button onClick={onClose} variant='outline' className="flex-1">
                                Keep Order
                            </Button>
                            <Button
                                onClick={confirmCancel}
                                disabled={loading || otp.length !== 6}
                                className="flex-1 bg-red-500! border-red-500! hover:bg-red-600!"
                            >
                                {loading ? 'Cancelling...' : 'Confirm Cancel'}
                            </Button>
                        </div>

                        <button onClick={resendOTP} disabled={resending} className="w-full mt-4 text-xs text-red-500 hover:text-red-700 underline disabled:opacity-50">
                            {resending ? 'Resending...' : 'Resend OTP'}
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

// ─── Main Orders Page ─────────────────────────────────────────────────────────
const Orders = () => {
    const { backendUrl, token, currency, userId } = useContext(ShopContext)
    const navigate = useNavigate()
    const [orders, setOrders]           = useState([])
    const [cancelModal, setCancelModal] = useState(null) // { orderId }
    const [invoiceOrder, setInvoiceOrder] = useState(null)

    const loadOrders = async () => {
        if (!token) return
        try {
            const res = await axios.post(
                backendUrl + '/api/order/userorders',
                {},
                { headers: { Authorization: `Bearer ${token}`, token } }
            )
            if (res.data.success) setOrders(res.data.orders.reverse())
        } catch (err) { console.error(err) }
    }

    useEffect(() => {
        loadOrders()

        if (!token) return
        const socket = io(backendUrl, { transports: ['websocket', 'polling'] })

        // Re-fetch orders when delivery OTP is generated so it appears instantly
        socket.on('delivery-otp-ready', () => { loadOrders() })
        socket.on('order-status-update', () => { loadOrders() })

        return () => socket.disconnect()
    }, [token])

    const statusColor = {
        'Order Placed':    'bg-yellow-400',
        'Order Confirmed': 'bg-blue-500',
        'Assigned':        'bg-purple-500',
        'Packed':          'bg-indigo-500',
        'Out For delivery':'bg-orange-500',
        'Delivered':       'bg-green-500',
        'Cancelled':       'bg-red-400',
    }

    const rows = orders.flatMap(order =>
        order.items.map(item => ({ ...item, order }))
    )

    // Track which orders have already rendered their action buttons
    const shownOrders = new Set()

    return (
        <div className="border-t border-beige pt-16">
            {invoiceOrder && <Invoice order={invoiceOrder} currency={currency} onClose={() => setInvoiceOrder(null)} />}
            {cancelModal && (
                <CancelModal
                    orderId={cancelModal.orderId}
                    userId={userId}
                    token={token}
                    backendUrl={backendUrl}
                    onCancelled={loadOrders}
                    onClose={() => setCancelModal(null)}
                />
            )}

            <div className="text-2xl mb-6">
                <Title text1="MY" text2="ORDERS" />
            </div>

            <div className="space-y-3">
                {rows.map((item, index) => {
                    const isFirst = !shownOrders.has(item.order._id)
                    if (isFirst) shownOrders.add(item.order._id)

                    return (
                        <div key={index} className="py-4 border-t border-b border-beige text-gray-700 flex flex-col gap-3">

                            {/* Product info + actions row */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                {/* Product info */}
                                <div className="flex items-start gap-6 text-sm">
                                    <img className="w-16 sm:w-20 rounded-lg object-cover" src={item.image?.[0]} alt="" />
                                    <div>
                                        <p className="sm:text-base font-medium text-charcoal">{item.name}</p>
                                        <div className="flex items-center gap-3 mt-1 text-gray-600">
                                            <p>{currency} {item.price}</p>
                                            <p>Qty: {item.quantity}</p>
                                            <p>Size: {item.size}</p>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {new Date(item.order.date).toDateString()} &bull; {item.order.paymentMethod}
                                        </p>
                                        {item.order.deliveryPersonName && (
                                            <p className="text-xs text-gold-dark mt-0.5">
                                                Delivery: <strong>{item.order.deliveryPersonName}</strong>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions — rendered once per order */}
                                {isFirst && (
                                    <div className="md:w-1/2 flex items-center justify-between gap-3 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${statusColor[item.order.status] || 'bg-gray-400'}`}></span>
                                            <p className="text-sm">{item.order.status}</p>
                                        </div>
                                        {CANCELLABLE.includes(item.order.status) && (
                                            <button
                                                onClick={() => setCancelModal({ orderId: item.order._id })}
                                                className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        {item.order.status === 'Cancelled' && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                                Cancelled
                                            </span>
                                        )}
                                        {item.order.status !== 'Cancelled' && (
                                            <button
                                                onClick={() => navigate('/orders/' + item.order._id)}
                                                className="border border-beige px-4 py-2 text-sm font-medium rounded-full hover:border-gold hover:bg-beige-light/50 transition"
                                            >
                                                Track Order
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setInvoiceOrder(item.order)}
                                            className="text-xs text-gray-500 hover:text-charcoal underline"
                                        >
                                            🧾 Invoice
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Delivery OTP bar — full width below, shown once per order */}
                            {isFirst && item.order.status === 'Out For delivery' && item.order.deliveryOtp && (
                                <div className="bg-[#1c3829] rounded-xl px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
                                    <div>
                                        <p className="text-white text-xs font-semibold">🚲 Delivery OTP</p>
                                        <p className="text-white/60 text-[10px] mt-0.5">Share this with your delivery partner</p>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {item.order.deliveryOtp.split('').map((d, i) => (
                                            <span
                                                key={i}
                                                className="w-8 h-9 bg-white/15 rounded-lg flex items-center justify-center text-white font-bold text-base select-all"
                                            >
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}

                {rows.length === 0 && (
                    <p className="text-center text-gray-400 py-16">No orders yet</p>
                )}
            </div>
        </div>
    )
}

export default Orders
