import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { Field } from '../components/ViewModal'

const initials = (name) => name ? name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
const AVATAR_COLORS = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-500', 'bg-pink-600', 'bg-teal-600']
const avatarColor = (id) => AVATAR_COLORS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

const CustomerView = ({ token }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [customer, setCustomer] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCustomer = async () => {
            setLoading(true)
            try {
                const res = await axios.get(backendUrl + '/api/user/admin/customers', { headers: { token } })
                if (res.data.success) {
                    setCustomer(res.data.customers.find(c => c._id === id) || null)
                }
            } catch (_) {}
            setLoading(false)
        }
        fetchCustomer()
    }, [id, token])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-green-700 rounded-full" />
        </div>
    )

    if (!customer) return (
        <div className="text-center text-gray-400 py-12 text-sm">Customer not found</div>
    )

    return (
        <div className="flex flex-col gap-5">
            <button onClick={() => navigate('/admin/customers')} className="text-sm text-gray-500 hover:text-gray-800 transition cursor-pointer w-fit">
                ← Back to Customers
            </button>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-full ${avatarColor(customer._id)} text-white flex items-center justify-center text-xl font-bold shrink-0`}>
                        {initials(customer.name)}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">{customer.name}</h2>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <Field label="Orders" value={customer.orderCount} />
                    <Field label="Total Spent" value={`${currency}${customer.totalSpent.toFixed(2)}`} />
                    <Field label="Reward Points" value={`${customer.rewardPoints} pts`} />
                    <Field label="Joined" value={customer.joinedAt ? new Date(customer.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} />
                    <Field label="Last Order" value={customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} />
                    <Field label="Email Status" value={
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${customer.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {customer.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                    } />
                </div>
            </div>
        </div>
    )
}

export default CustomerView
