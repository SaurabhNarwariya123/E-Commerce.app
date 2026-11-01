import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import { backendUrl } from '../App'
import { Field } from '../components/ViewModal'

const CouponView = ({ token }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [coupon, setCoupon] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCoupon = async () => {
            setLoading(true)
            try {
                const res = await axios.get(backendUrl + '/api/coupon/list', { headers: { token } })
                if (res.data.success) {
                    setCoupon(res.data.coupons.find(c => c._id === id) || null)
                }
            } catch (_) {}
            setLoading(false)
        }
        fetchCoupon()
    }, [id, token])

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full" />
        </div>
    )

    if (!coupon) return (
        <div className="text-center text-[var(--adm-muted)] py-12 text-sm">Coupon not found</div>
    )

    const isExpired = new Date(coupon.expiryDate) < new Date()

    return (
        <div className="flex flex-col gap-5">
            <button onClick={() => navigate('/admin/coupons')} className="text-sm text-[var(--adm-muted)] hover:text-[var(--adm-ink)] transition cursor-pointer w-fit">
                ← Back to Coupons
            </button>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h1 className="text-xl font-semibold text-[var(--adm-ink)] mb-6">{coupon.code}</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <Field label="Discount" value={coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} />
                    <Field label="Max Discount" value={coupon.maxDiscount ? `₹${coupon.maxDiscount}` : 'No cap'} />
                    <Field label="Min Order Amount" value={`₹${coupon.minOrderAmount}`} />
                    <Field label="Usage" value={`${coupon.usedCount}${coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (unlimited)'}`} />
                    <Field label="Expiry Date" value={new Date(coupon.expiryDate).toLocaleDateString()} />
                    <Field label="Status" value={
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isExpired ? 'bg-red-100 text-red-600' : coupon.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-[var(--adm-muted)]'}`}>
                            {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                    } />
                </div>
            </div>
        </div>
    )
}

export default CouponView
