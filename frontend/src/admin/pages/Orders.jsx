import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {
    const [orders, setOrders] = useState([])
    const [deliveryPersons, setDeliveryPersons] = useState([])

    const fetchAllOrders = async () => {
        if (!token) return
        try {
            const res = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
            if (res.data.success) setOrders(res.data.orders.reverse())
            else toast.error(res.data.message)
        } catch (err) {
            toast.error(err.message)
        }
    }

    const fetchDeliveryPersons = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/delivery/list', { headers: { token } })
            if (res.data.success) setDeliveryPersons(res.data.deliveryPersons.filter(d => d.isActive))
        } catch (_) {}
    }

    const statusHandler = async (event, orderId) => {
        try {
            const res = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
            if (res.data.success) await fetchAllOrders()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const assignDeliveryHandler = async (orderId, deliveryPersonId) => {
        if (!deliveryPersonId) return
        try {
            const res = await axios.post(
                backendUrl + '/api/delivery/assign-order',
                { orderId, deliveryPersonId },
                { headers: { token } }
            )
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

    useEffect(() => {
        fetchAllOrders()
        fetchDeliveryPersons()
    }, [token])

    const statusStyle = {
        'Order Placed':    { background: '#fefce8', color: '#a16207', borderColor: '#fde047' },
        'Order Confirmed': { background: '#eff6ff', color: '#1d4ed8', borderColor: '#93c5fd' },
        'Assigned':        { background: '#faf5ff', color: '#7e22ce', borderColor: '#d8b4fe' },
        'Packed':          { background: '#eef2ff', color: '#4338ca', borderColor: '#a5b4fc' },
        'Out For delivery':{ background: '#fff7ed', color: '#c2410c', borderColor: '#fdba74' },
        'Delivered':       { background: '#f0fdf4', color: '#15803d', borderColor: '#86efac' },
        'Cancelled':       { background: '#fef2f2', color: '#b91c1c', borderColor: '#fca5a5' },
    }

    return (
        <div className="p-2">
            <h3 className="text-xl font-semibold text-gray-800 mb-5">All Orders</h3>
            <div className="space-y-4">
                {orders.map((order, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 bg-white grid grid-cols-1 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-start"
                    >
                        {/* Icon */}
                        <img className="w-10 mt-1" src={assets.parcel_icon} alt="" />

                        {/* Order items + address */}
                        <div>
                            <div className="flex flex-wrap gap-x-2 text-sm text-gray-700">
                                {order.items.map((item, i) => (
                                    <span key={i}>
                                        {item.name} x{item.quantity} <em className="text-gray-400">{item.size}</em>
                                        {i < order.items.length - 1 ? ',' : ''}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-2 font-medium text-gray-800">
                                {order.address.firstName} {order.address.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                                {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipcode}
                            </p>
                            <p className="text-xs text-gray-500">{order.address.phone}</p>

                        </div>

                        {/* Meta */}
                        <div className="text-xs text-gray-600 space-y-1 min-w-[110px]">
                            <p>Items: {order.items.length}</p>
                            <p>Method: {order.paymentMethod}</p>
                            <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
                            <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                        </div>

                        {/* Amount */}
                        <p className="font-semibold text-gray-800 min-w-[70px]">{currency}{order.amount}</p>

                        {/* Controls */}
                        <div className="flex flex-col gap-2 min-w-[180px]">
                            {/* Order status — colored by current status */}
                            <select
                                onChange={e => statusHandler(e, order._id)}
                                value={order.status}
                                style={statusStyle[order.status] || {}}
                                className="border rounded px-2 py-1.5 text-xs font-semibold cursor-pointer"
                            >
                                <option value="Order Placed">Order Placed</option>
                                <option value="Order Confirmed">Order Confirmed</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Packed">Packed</option>
                                <option value="Out For delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>

                            {/* Assign delivery person */}
                            <select
                                onChange={e => assignDeliveryHandler(order._id, e.target.value)}
                                value={order.deliveryPersonId || ''}
                                className="border border-gray-300 rounded px-2 py-1.5 text-xs"
                            >
                                <option value="">— Assign Delivery Person —</option>
                                {deliveryPersons.map(dp => (
                                    <option key={dp._id} value={dp._id}>
                                        {dp.name} {dp.isAvailable ? '(Free)' : '(Busy)'}
                                    </option>
                                ))}
                            </select>

                            {order.deliveryPersonName && (
                                <p className="text-xs text-indigo-600 font-medium">
                                    🚲 {order.deliveryPersonName}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Orders
