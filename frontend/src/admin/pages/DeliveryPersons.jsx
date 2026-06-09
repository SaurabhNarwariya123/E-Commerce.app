import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'

const DeliveryPersons = ({ token }) => {
    const [deliveryPersons, setDeliveryPersons] = useState([])
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchDeliveryPersons = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/delivery/list', { headers: { token } })
            if (res.data.success) setDeliveryPersons(res.data.deliveryPersons)
            else toast.error(res.data.message)
        } catch (err) {
            toast.error(err.message)
        }
    }

    useEffect(() => { fetchDeliveryPersons() }, [token])

    const handleAdd = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post(backendUrl + '/api/delivery/add', form, { headers: { token } })
            if (res.data.success) {
                toast.success(res.data.message)
                setForm({ name: '', email: '', password: '', phone: '' })
                setShowForm(false)
                fetchDeliveryPersons()
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
        setLoading(false)
    }

    const handleRemove = async (id) => {
        if (!window.confirm('Remove this delivery person?')) return
        try {
            const res = await axios.post(backendUrl + '/api/delivery/remove', { deliveryPersonId: id }, { headers: { token } })
            if (res.data.success) {
                toast.success('Removed successfully')
                fetchDeliveryPersons()
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleToggle = async (id) => {
        try {
            const res = await axios.post(backendUrl + '/api/delivery/toggle-status', { deliveryPersonId: id }, { headers: { token } })
            if (res.data.success) {
                toast.success(res.data.message)
                fetchDeliveryPersons()
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Delivery Persons</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition"
                >
                    {showForm ? 'Cancel' : '+ Add Delivery Person'}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <form onSubmit={handleAdd} className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text" required
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="Ravi Kumar"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email" required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="ravi@delivery.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password" required minLength={6}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="Min 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel" required
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            placeholder="+91 98765 43210"
                        />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-black text-white px-6 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Delivery Person'}
                        </button>
                    </div>
                </form>
            )}

            {/* Delivery Persons Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wide">
                            <th className="py-3 px-2">Name</th>
                            <th className="py-3 px-2">Email</th>
                            <th className="py-3 px-2">Phone</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-2">Availability</th>
                            <th className="py-3 px-2">Live Location</th>
                            <th className="py-3 px-2">Orders</th>
                            <th className="py-3 px-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveryPersons.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-gray-400">No delivery persons added yet</td>
                            </tr>
                        )}
                        {deliveryPersons.map(dp => (
                            <tr key={dp._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-2 font-medium">{dp.name}</td>
                                <td className="py-3 px-2 text-gray-600">{dp.email}</td>
                                <td className="py-3 px-2">{dp.phone}</td>
                                <td className="py-3 px-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {dp.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-3 px-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dp.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {dp.isAvailable ? 'Free' : 'Busy'}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-xs text-gray-500">
                                    {dp.currentLocation?.lat
                                        ? <a
                                            href={`https://maps.google.com/?q=${dp.currentLocation.lat},${dp.currentLocation.lng}`}
                                            target="_blank" rel="noreferrer"
                                            className="text-indigo-600 underline"
                                          >
                                            View Map
                                          </a>
                                        : 'No data'
                                    }
                                </td>
                                <td className="py-3 px-2">
                                    <span className="text-gray-800 font-medium">{dp.totalDelivered || 0}</span>
                                    <span className="text-gray-400 text-xs ml-1">delivered</span>
                                    {dp.assignedOrders?.length > 0 && (
                                        <span className="ml-1 text-xs text-orange-500">+{dp.assignedOrders.length} active</span>
                                    )}
                                </td>
                                <td className="py-3 px-2 flex gap-2">
                                    <button
                                        onClick={() => handleToggle(dp._id)}
                                        className={`text-xs px-3 py-1 rounded border ${dp.isActive ? 'border-orange-400 text-orange-600 hover:bg-orange-50' : 'border-green-400 text-green-600 hover:bg-green-50'}`}
                                    >
                                        {dp.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleRemove(dp._id)}
                                        className="text-xs px-3 py-1 rounded border border-red-400 text-red-600 hover:bg-red-50"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DeliveryPersons
