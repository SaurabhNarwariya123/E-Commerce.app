import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Coupons = ({ token }) => {

    const [code, setCode] = useState('')
    const [discountType, setDiscountType] = useState('percent')
    const [discountValue, setDiscountValue] = useState('')
    const [maxDiscount, setMaxDiscount] = useState('')
    const [minOrderAmount, setMinOrderAmount] = useState('')
    const [expiryDate, setExpiryDate] = useState('')
    const [usageLimit, setUsageLimit] = useState('')

    const [coupons, setCoupons] = useState([])
    const headers = { headers: { token } }

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/coupon/list', headers)
            if (response.data.success) {
                setCoupons(response.data.coupons)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => { fetchCoupons() }, [])

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(backendUrl + '/api/coupon/add', {
                code, discountType, discountValue, maxDiscount, minOrderAmount, expiryDate, usageLimit
            }, headers)

            if (response.data.success) {
                toast.success(response.data.message)
                setCode(''); setDiscountValue(''); setMaxDiscount(''); setMinOrderAmount(''); setExpiryDate(''); setUsageLimit('')
                await fetchCoupons()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const removeCoupon = async (id) => {
        try {
            const response = await axios.post(backendUrl + '/api/coupon/remove', { id }, headers)
            if (response.data.success) {
                toast.success(response.data.message)
                await fetchCoupons()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const toggleCoupon = async (id) => {
        try {
            const response = await axios.post(backendUrl + '/api/coupon/toggle', { id }, headers)
            if (response.data.success) {
                await fetchCoupons()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const isExpired = (c) => new Date(c.expiryDate) < new Date()

    return (
        <div className='flex flex-col gap-8'>
            <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
                <div className='w-full'>
                    <p className='mb-2'>Coupon Code</p>
                    <input onChange={(e) => setCode(e.target.value)} value={code} className='w-full max-w-[300px] px-3 py-2 uppercase' type='text' placeholder='e.g. WELCOME50' required />
                </div>

                <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                    <div>
                        <p className='mb-2'>Discount Type</p>
                        <select onChange={(e) => setDiscountType(e.target.value)} value={discountType} className='w-full px-3 py-2'>
                            <option value='percent'>Percent (%)</option>
                            <option value='flat'>Flat (₹)</option>
                        </select>
                    </div>

                    <div>
                        <p className='mb-2'>Discount Value</p>
                        <input onChange={(e) => setDiscountValue(e.target.value)} value={discountValue} className='w-full px-3 py-2 sm:w-[120px]' type='number' min='0' required placeholder={discountType === 'percent' ? '10' : '100'} />
                    </div>

                    {discountType === 'percent' && (
                        <div>
                            <p className='mb-2'>Max Discount (optional)</p>
                            <input onChange={(e) => setMaxDiscount(e.target.value)} value={maxDiscount} className='w-full px-3 py-2 sm:w-[140px]' type='number' min='0' placeholder='e.g. 500' />
                        </div>
                    )}

                    <div>
                        <p className='mb-2'>Min Order Amount</p>
                        <input onChange={(e) => setMinOrderAmount(e.target.value)} value={minOrderAmount} className='w-full px-3 py-2 sm:w-[140px]' type='number' min='0' placeholder='0' />
                    </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                    <div>
                        <p className='mb-2'>Expiry Date</p>
                        <input onChange={(e) => setExpiryDate(e.target.value)} value={expiryDate} className='w-full px-3 py-2' type='date' required />
                    </div>
                    <div>
                        <p className='mb-2'>Usage Limit (optional)</p>
                        <input onChange={(e) => setUsageLimit(e.target.value)} value={usageLimit} className='w-full px-3 py-2 sm:w-[140px]' type='number' min='1' placeholder='Unlimited' />
                    </div>
                </div>

                <button type='submit' className='w-32 py-3 mt-4 bg-green-700 hover:bg-green-800 text-white rounded-xl cursor-pointer transition'>ADD COUPON</button>
            </form>

            <div>
                <p className='mb-2'>All Coupons</p>
                <div className='flex flex-col gap-2'>
                    <div className='hidden md:grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.5fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
                        <b>Code</b>
                        <b>Discount</b>
                        <b>Min Order</b>
                        <b>Used</b>
                        <b>Expiry</b>
                        <b className='text-center'>Action</b>
                    </div>

                    {coupons.map((c) => (
                        <div key={c._id} className='grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1.5fr] items-center py-1 px-2 border text-sm'>
                            <p className='font-semibold'>{c.code}</p>
                            <p>{c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}</p>
                            <p>₹{c.minOrderAmount}</p>
                            <p>{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</p>
                            <p className={isExpired(c) ? 'text-red-500' : ''}>{new Date(c.expiryDate).toLocaleDateString()}</p>
                            <div className='flex items-center justify-center gap-3'>
                                <p onClick={() => toggleCoupon(c._id)} className={`cursor-pointer ${c.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                    {c.isActive ? 'Active' : 'Inactive'}
                                </p>
                                <p onClick={() => removeCoupon(c._id)} className='text-red-500 cursor-pointer'>X</p>
                            </div>
                        </div>
                    ))}
                    {coupons.length === 0 && <p className='text-center text-gray-400 py-6 text-sm'>No coupons yet</p>}
                </div>
            </div>
        </div>
    )
}

export default Coupons
