import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { Field } from '../components/ViewModal'

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
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-green-700 rounded-full" />
        </div>
    )

    if (!order) return (
        <div className="text-center text-gray-400 py-12 text-sm">Order not found</div>
    )

    return (
        <div className="flex flex-col gap-5">
            <button onClick={() => navigate('/admin/orders')} className="text-sm text-gray-500 hover:text-gray-800 transition cursor-pointer w-fit">
                ← Back to Orders
            </button>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-xl font-semibold text-gray-800">Order #{order._id?.slice(-8).toUpperCase()}</h2>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700">{order.status}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <Field label="Amount" value={`${currency}${order.amount}`} />
                    <Field label="Payment Method" value={order.paymentMethod} />
                    <Field label="Payment Status" value={
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.payment ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.payment ? 'Paid' : 'Pending'}
                        </span>
                    } />
                    <Field label="Order Date" value={new Date(order.date).toLocaleString()} />
                </div>

                {order.deliveryPersonName && (
                    <Field label="Delivery Person" value={`🚲 ${order.deliveryPersonName}`} />
                )}

                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Items</p>
                    <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                <div className="text-gray-800">
                                    {item.name} {item.size && <span className="text-gray-500">({item.size})</span>}
                                </div>
                                <div className="text-gray-700">x{item.quantity}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Shipping Address</p>
                    <div className="text-sm text-gray-800 leading-relaxed">
                        <p className="font-medium">{order.address?.firstName} {order.address?.lastName}</p>
                        <p>{order.address?.street}</p>
                        <p>{order.address?.city}, {order.address?.state} {order.address?.zipcode}</p>
                        <p>{order.address?.country}</p>
                        <p className="text-gray-600 mt-1">{order.address?.phone}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderView
