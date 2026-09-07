import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'
import { EyeIcon, TrashIcon, IconButton } from '../components/Icons'
import Pagination, { usePagination } from '../components/Pagination'

const DeliveryPersons = ({ token }) => {
    const navigate = useNavigate()
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

    const { page, setPage, totalPages, pageItems, start } = usePagination(deliveryPersons, 10)

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Delivery Persons</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{deliveryPersons.length} delivery person{deliveryPersons.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-teal-600 text-white px-4 py-2 text-sm rounded-full hover:bg-teal-700 transition cursor-pointer"
                >
                    + Add Delivery Person
                </button>
            </div>

            {/* Add Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                            <h2 className="text-lg font-semibold text-gray-800">Add Delivery Person</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer" aria-label="Close">&times;</button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text" required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                                    placeholder="Ravi Kumar"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email" required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                                    placeholder="ravi@delivery.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password" required minLength={6}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                                    placeholder="Min 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel" required
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div className="sm:col-span-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm cursor-pointer hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-teal-600 text-white px-6 py-2 rounded-full text-sm hover:bg-teal-700 disabled:opacity-50 transition cursor-pointer"
                                >
                                    {loading ? 'Adding...' : 'Add Delivery Person'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delivery Persons Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Email</th>
                            <th className="py-2.5 px-3">Phone</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Availability</th>
                            <th className="py-2.5 px-3">Live Location</th>
                            <th className="py-2.5 px-3">Orders</th>
                            <th className="py-2.5 px-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveryPersons.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-gray-400">No delivery persons added yet</td>
                            </tr>
                        )}
                        {pageItems.map(dp => (
                            <tr key={dp._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-2 px-3 font-medium text-gray-800">{dp.name}</td>
                                <td className="py-2 px-3 text-gray-700">{dp.email}</td>
                                <td className="py-2 px-3 text-gray-700">{dp.phone}</td>
                                <td className="py-2 px-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dp.isActive ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                                        {dp.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="py-2 px-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dp.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {dp.isAvailable ? 'Free' : 'Busy'}
                                    </span>
                                </td>
                                <td className="py-2 px-3 text-xs text-gray-600">
                                    {dp.currentLocation?.lat
                                        ? <a
                                            href={`https://maps.google.com/?q=${dp.currentLocation.lat},${dp.currentLocation.lng}`}
                                            target="_blank" rel="noreferrer"
                                            className="text-teal-600 underline"
                                          >
                                            View Map
                                          </a>
                                        : 'No data'
                                    }
                                </td>
                                <td className="py-2 px-3">
                                    <span className="text-gray-800 font-medium">{dp.totalDelivered || 0}</span>
                                    <span className="text-gray-400 text-xs ml-1">delivered</span>
                                    {dp.assignedOrders?.length > 0 && (
                                        <span className="ml-1 text-xs text-orange-500">+{dp.assignedOrders.length} active</span>
                                    )}
                                </td>
                                <td className="py-2 px-3 flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggle(dp._id)}
                                        className={`text-xs px-3 py-1 rounded border ${dp.isActive ? 'border-orange-400 text-orange-600 hover:bg-orange-50' : 'border-teal-400 text-teal-600 hover:bg-teal-50'}`}
                                    >
                                        {dp.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <IconButton variant='view' onClick={() => navigate(`/admin/delivery-person/${dp._id}`)} aria-label='View delivery person' title='View'>
                                        <EyeIcon />
                                    </IconButton>
                                    <IconButton variant='delete' onClick={() => handleRemove(dp._id)} aria-label='Remove delivery person' title='Remove'>
                                        <TrashIcon />
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={deliveryPersons.length} pageSize={10} start={start} />
            </div>
        </div>
    )
}

export default DeliveryPersons
