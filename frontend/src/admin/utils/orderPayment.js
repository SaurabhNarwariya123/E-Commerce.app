// Single source of truth for how an order's payment is shown in the admin.
// COD orders delivered before the backend started setting `payment: true`
// are still stored as unpaid, so a delivered COD order counts as paid here too.
export const getPaymentBadge = (order) => {
    const paid = order.payment || (order.paymentMethod === 'COD' && order.status === 'Delivered')
    if (paid) return { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' }
    if (order.status === 'Cancelled') return { label: 'Void', className: 'bg-gray-100 text-gray-500' }
    return { label: 'Pending', className: 'bg-amber-100 text-amber-700' }
}
