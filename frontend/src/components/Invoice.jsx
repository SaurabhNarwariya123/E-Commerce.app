import React from 'react'

// Printable invoice — shared by the customer "My Orders" page and the admin Orders page.
// Wrap in the `.printable-invoice` class so index.css's @media print rule can isolate it.
const Invoice = ({ order, currency, onClose }) => {
    if (!order) return null

    const subtotal = (order.items || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
    const discount = order.discountAmount || 0
    const delivery = Math.max(0, (order.amount || 0) - subtotal + discount)

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                <div className="printable-invoice p-8">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                            <p className="text-sm text-gray-500 mt-1">Order #{order._id?.toString().slice(-8).toUpperCase()}</p>
                            <p className="text-sm text-gray-500">Date: {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-green-700">E-Commerce Store</p>
                            <p className="text-xs text-gray-400">Tax Invoice</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-xs uppercase text-gray-400 font-semibold mb-1">Bill To</p>
                            <p className="text-sm font-medium text-gray-800">{order.address?.firstName} {order.address?.lastName}</p>
                            <p className="text-sm text-gray-600">{order.address?.street}</p>
                            <p className="text-sm text-gray-600">{order.address?.city}, {order.address?.state} {order.address?.zipcode}</p>
                            <p className="text-sm text-gray-600">{order.address?.country}</p>
                            <p className="text-sm text-gray-600">{order.address?.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-400 font-semibold mb-1">Payment</p>
                            <p className="text-sm text-gray-600">Method: {order.paymentMethod}</p>
                            <p className="text-sm text-gray-600">Status: {order.payment ? 'Paid' : 'Pending'}</p>
                            <p className="text-sm text-gray-600">Order Status: {order.status}</p>
                            {order.couponCode && <p className="text-sm text-gray-600">Coupon: {order.couponCode}</p>}
                        </div>
                    </div>

                    <table className="w-full text-sm mb-6">
                        <thead>
                            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-400">
                                <th className="pb-2">Item</th>
                                <th className="pb-2">Size</th>
                                <th className="pb-2 text-center">Qty</th>
                                <th className="pb-2 text-right">Price</th>
                                <th className="pb-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(order.items || []).map((item, i) => (
                                <tr key={i}>
                                    <td className="py-2 text-gray-800">{item.name}</td>
                                    <td className="py-2 text-gray-500">{item.size}</td>
                                    <td className="py-2 text-center text-gray-500">{item.quantity}</td>
                                    <td className="py-2 text-right text-gray-500">{currency}{item.price}</td>
                                    <td className="py-2 text-right text-gray-800 font-medium">{currency}{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-56 space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{currency}{subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>Discount</span>
                                    <span>-{currency}{discount.toFixed(2)}</span>
                                </div>
                            )}
                            {delivery > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery</span>
                                    <span>{currency}{delivery.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5 mt-1.5">
                                <span>Total</span>
                                <span>{currency}{order.amount?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-10">Thank you for shopping with us!</p>
                </div>

                <div className="no-print flex gap-3 justify-end px-8 pb-6">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">Close</button>
                    <button onClick={() => window.print()} className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white hover:bg-green-800 cursor-pointer">Print / Save PDF</button>
                </div>
            </div>
        </div>
    )
}

export default Invoice
