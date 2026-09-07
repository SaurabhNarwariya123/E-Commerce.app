import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { backendUrl } from '../App'
import { Field } from '../components/ViewModal'

const OfferView = ({ token }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [offer, setOffer] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOffer = async () => {
            setLoading(true)
            try {
                const res = await axios.get(backendUrl + '/api/offer/list', { headers: { token } })
                if (res.data.success) {
                    setOffer(res.data.offers.find(o => o._id === id) || null)
                }
            } catch (_) {}
            setLoading(false)
        }
        fetchOffer()
    }, [id, token])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-green-700 rounded-full" />
        </div>
    )

    if (!offer) return (
        <div className="text-center text-gray-400 py-12 text-sm">Offer not found</div>
    )

    return (
        <div className="flex flex-col gap-5">
            <button onClick={() => navigate('/admin/offers')} className="text-sm text-gray-500 hover:text-gray-800 transition cursor-pointer w-fit">
                ← Back to Offers
            </button>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-5 max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-800">{offer.title}</h2>
                <img className="w-full aspect-video object-cover rounded-xl" src={offer.imageUrl} alt={offer.title} />
                <Field label="Description" value={offer.description || '—'} />
                <div className="grid grid-cols-2 gap-6">
                    <Field label="Discount Text" value={offer.discountText || '—'} />
                    <Field label="Active Window" value={`${new Date(offer.startDate).toLocaleDateString()} – ${new Date(offer.endDate).toLocaleDateString()}`} />
                </div>
            </div>
        </div>
    )
}

export default OfferView
