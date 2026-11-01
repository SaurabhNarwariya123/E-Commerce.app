import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { Field } from '../components/ViewModal'
import { getPaymentBadge } from '../utils/orderPayment'

const OrderView = ({ token }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true)
            try {
                const res = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
                if (res.data.success) {
                    setOrder(res.data.orders.find(o => o._id === id) || null)
                } else {
                    toast.error(res.data.message)
                }
            } catch (err) {
                toast.error(err.message)
            }
            setLoading(false)
        }
        fetchOrder()
    }, [id, token])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full" />
        </div>
    )

    if (!order) return (
        <div className="text-center text-[var(--adm-muted)] py-12 text-sm">Order not found</div>
    )

    return (
        <div className="flex flex-col gap-5">
            <button onClick={() => navigate('/admin/orders')} className="text-sm text-[var(--adm-muted)] hover:text-[var(--adm-ink)] transition cursor-pointer w-fit">
                ← Back to Orders
            </button>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h1 className="text-xl font-semibold text-[var(--adm-ink)]">Order #{order._id?.slice(-8).toUpperCase()}</h1>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-[var(--adm-ink)]">{order.status}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <Field label="Amount" value={`${currency}${order.amount}`} />
                    <Field label="Payment Method" value={order.paymentMethod} />
                    <Field label="Payment Status" value={
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPaymentBadge(order).className}`}>
                            {getPaymentBadge(order).label}
                        </span>
                    } />
                    <Field label="Order Date" value={new Date(order.date).toLocaleString()} />
                </div>

                {order.deliveryPersonName && (
                    <Field label="Delivery Person" value={`🚲 ${order.deliveryPersonName}`} />
                )}

                <div>
                    <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide mb-2">Items</p>
                    <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                <div className="text-[var(--adm-ink)]">
                                    {item.name} {item.size && <span className="text-[var(--adm-muted)]">({item.size})</span>}
                                </div>
                                <div className="text-[var(--adm-ink)]">x{item.quantity}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide mb-2">Shipping Address</p>
                    <div className="text-sm text-[var(--adm-ink)] leading-relaxed">
                        <p className="font-medium">{order.address?.firstName} {order.address?.lastName}</p>
                        <p>{order.address?.street}</p>
                        <p>{order.address?.city}, {order.address?.state} {order.address?.zipcode}</p>
                        <p>{order.address?.country}</p>
                        <p className="text-[var(--adm-muted)] mt-1">{order.address?.phone}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderView
