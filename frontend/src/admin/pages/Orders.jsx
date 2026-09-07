import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import Invoice from '../../components/Invoice'
import Pagination, { usePagination } from '../components/Pagination'
import { EyeIcon, IconButton } from '../components/Icons'

const Orders = ({ token }) => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [deliveryPersons, setDeliveryPersons] = useState([])
    const [invoiceOrder, setInvoiceOrder] = useState(null)

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

    const { page, setPage, totalPages, pageItems, start } = usePagination(orders, 10)

    return (
        <div className='flex flex-col gap-5'>
            {invoiceOrder && <Invoice order={invoiceOrder} currency={currency} onClose={() => setInvoiceOrder(null)} />}

            <div className='flex items-center justify-between flex-wrap gap-3'>
                <div>
                    <h2 className='text-xl font-semibold text-gray-800'>All Orders</h2>
                    <p className='text-xs text-gray-500 mt-0.5'>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden'>
                {orders.length === 0 ? (
                    <p className='text-center text-gray-400 py-12 text-sm'>No orders yet</p>
                ) : (
                    <>
                        <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 border-b border-gray-200'>
                                <tr>
                                    <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Customer</th>
                                    <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Items</th>
                                    <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Amount</th>
                                    <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Payment</th>
                                    <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Date</th>
                                    <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Status</th>
                                    <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Delivery</th>
                                    <th className='px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {pageItems.map((order, index) => (
                                    <tr key={order._id || index} className='hover:bg-gray-50 transition'>
                                        <td className='px-3 py-2.5 min-w-[140px]'>
                                            <p className='font-medium text-gray-800'>{order.address?.firstName} {order.address?.lastName}</p>
                                            <p className='text-xs text-gray-500'>{order.address?.phone}</p>
                                        </td>
                                        <td className='px-3 py-2.5 text-gray-700'>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                                        <td className='px-3 py-2.5 font-semibold text-gray-800'>{currency}{order.amount}</td>
                                        <td className='px-3 py-2.5'>
                                            <p className='text-gray-700'>{order.paymentMethod}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.payment ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.payment ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className='px-3 py-2.5 text-gray-700 text-xs'>{new Date(order.date).toLocaleDateString()}</td>
                                        <td className='px-3 py-2.5'>
                                            <select
                                                onChange={e => statusHandler(e, order._id)}
                                                value={order.status}
                                                style={statusStyle[order.status] || {}}
                                                className='border rounded px-2 py-1.5 text-xs font-semibold cursor-pointer'
                                            >
                                                <option value='Order Placed'>Order Placed</option>
                                                <option value='Order Confirmed'>Order Confirmed</option>
                                                <option value='Assigned'>Assigned</option>
                                                <option value='Packed'>Packed</option>
                                                <option value='Out For delivery'>Out for Delivery</option>
                                                <option value='Delivered'>Delivered</option>
                                                <option value='Cancelled'>Cancelled</option>
                                            </select>
                                        </td>
                                        <td className='px-3 py-2.5 min-w-[170px]'>
                                            <select
                                                onChange={e => assignDeliveryHandler(order._id, e.target.value)}
                                                value={order.deliveryPersonId || ''}
                                                className='border border-gray-300 rounded px-2 py-1.5 text-xs w-full'
                                            >
                                                <option value=''>— Assign —</option>
                                                {deliveryPersons.map(dp => (
                                                    <option key={dp._id} value={dp._id}>
                                                        {dp.name} {dp.isAvailable ? '(Free)' : '(Busy)'}
                                                    </option>
                                                ))}
                                            </select>
                                            {order.deliveryPersonName && (
                                                <p className='text-xs text-indigo-600 font-medium mt-1'>🚲 {order.deliveryPersonName}</p>
                                            )}
                                        </td>
                                        <td className='px-3 py-2.5'>
                                            <div className='flex items-center justify-end gap-2'>
                                                <IconButton variant='view' onClick={() => navigate(`/admin/order/${order._id}`)} aria-label='View order' title='View'>
                                                    <EyeIcon />
                                                </IconButton>
                                                <button
                                                    onClick={() => setInvoiceOrder(order)}
                                                    className='text-xs border border-gray-300 text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-pointer w-fit'
                                                    title='Invoice'
                                                >
                                                    🧾 Invoice
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={orders.length} pageSize={10} start={start} />
                    </>
                )}
            </div>
        </div>
    )
}

export default Orders
