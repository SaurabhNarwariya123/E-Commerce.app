import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { backendUrl } from '../App'
import { Field } from '../components/ViewModal'

const DeliveryPersonView = ({ token }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [dp, setDp] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDp = async () => {
            setLoading(true)
            try {
                const res = await axios.get(backendUrl + '/api/delivery/list', { headers: { token } })
                if (res.data.success) {
                    setDp(res.data.deliveryPersons.find(d => d._id === id) || null)
                }
            } catch (_) {}
            setLoading(false)
        }
        fetchDp()
    }, [id, token])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-teal-600 rounded-full" />
        </div>
    )

    if (!dp) return (
        <div className="text-center text-gray-400 py-12 text-sm">Delivery person not found</div>
    )

    return (
        <div className="flex flex-col gap-5">
            <button onClick={() => navigate('/admin/delivery-persons')} className="text-sm text-gray-500 hover:text-teal-700 transition cursor-pointer w-fit">
                ← Back to Delivery Persons
            </button>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">{dp.name}</h2>
                <div className="grid grid-cols-2 gap-6">
                    <Field label="Email" value={dp.email} />
                    <Field label="Phone" value={dp.phone} />
                    <Field label="Status" value={
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dp.isActive ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                            {dp.isActive ? 'Active' : 'Inactive'}
                        </span>
                    } />
                    <Field label="Availability" value={
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dp.isAvailable ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'}`}>
                            {dp.isAvailable ? 'Free' : 'Busy'}
                        </span>
                    } />
                    <Field label="Total Delivered" value={dp.totalDelivered || 0} />
                    <Field label="Active Orders" value={dp.assignedOrders?.length || 0} />
                    <Field label="Live Location" value={
                        dp.currentLocation?.lat
                            ? <a href={`https://maps.google.com/?q=${dp.currentLocation.lat},${dp.currentLocation.lng}`} target="_blank" rel="noreferrer" className="text-teal-600 underline">View on Map</a>
                            : 'No data'
                    } />
                </div>
            </div>
        </div>
    )
}

export default DeliveryPersonView
