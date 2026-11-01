import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { EyeIcon, TrashIcon, IconButton } from '../components/Icons'
import Pagination, { usePagination } from '../components/Pagination'

const Coupons = ({ token }) => {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)

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
                setShowForm(false)
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
    const { page, setPage, totalPages, pageItems, start } = usePagination(coupons, 10)

    const labelClass = 'text-sm font-medium text-[var(--adm-ink)] mb-1.5 block'
    const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition'

    return (
        <div className='flex flex-col gap-5'>
            <div className='flex items-center justify-between flex-wrap gap-3'>
                <div>
                    <h1 className='text-xl font-semibold text-[var(--adm-ink)]'>Coupons</h1>
                    <p className='text-xs text-[var(--adm-muted)] mt-0.5'>{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-full transition cursor-pointer'
                >
                    + Add Coupon
                </button>
            </div>

            {showForm && (
                <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowForm(false)}>
                    <div className='bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
                        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl'>
                            <h2 className='text-lg font-semibold text-[var(--adm-ink)]'>Add Coupon</h2>
                            <button onClick={() => setShowForm(false)} className='text-[var(--adm-muted)] hover:text-[var(--adm-ink)] text-2xl leading-none cursor-pointer' aria-label='Close'>&times;</button>
                        </div>
                        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4 p-6'>
                            <div className='w-full'>
                                <p className={labelClass}>Coupon Code</p>
                                <input onChange={(e) => setCode(e.target.value)} value={code} className={`${inputClass} uppercase`} type='text' placeholder='e.g. WELCOME50' required />
                            </div>

                            <div className='flex flex-wrap gap-4 w-full'>
                                <div className='w-36'>
                                    <p className={labelClass}>Discount Type</p>
                                    <select onChange={(e) => setDiscountType(e.target.value)} value={discountType} className={inputClass}>
                                        <option value='percent'>Percent (%)</option>
                                        <option value='flat'>Flat (₹)</option>
                                    </select>
                                </div>

                                <div className='w-30'>
                                    <p className={labelClass}>Discount Value</p>
                                    <input onChange={(e) => setDiscountValue(e.target.value)} value={discountValue} className={inputClass} type='number' min='0' required placeholder={discountType === 'percent' ? '10' : '100'} />
                                </div>

                                {discountType === 'percent' && (
                                    <div className='w-35'>
                                        <p className={labelClass}>Max Discount (optional)</p>
                                        <input onChange={(e) => setMaxDiscount(e.target.value)} value={maxDiscount} className={inputClass} type='number' min='0' placeholder='e.g. 500' />
                                    </div>
                                )}

                                <div className='w-35'>
                                    <p className={labelClass}>Min Order Amount</p>
                                    <input onChange={(e) => setMinOrderAmount(e.target.value)} value={minOrderAmount} className={inputClass} type='number' min='0' placeholder='0' />
                                </div>
                            </div>

                            <div className='flex flex-wrap gap-4 w-full'>
                                <div className='w-44'>
                                    <p className={labelClass}>Expiry Date</p>
                                    <input onChange={(e) => setExpiryDate(e.target.value)} value={expiryDate} className={inputClass} type='date' required />
                                </div>
                                <div className='w-35'>
                                    <p className={labelClass}>Usage Limit (optional)</p>
                                    <input onChange={(e) => setUsageLimit(e.target.value)} value={usageLimit} className={inputClass} type='number' min='1' placeholder='Unlimited' />
                                </div>
                            </div>

                            <div className='flex justify-end gap-2 w-full mt-2'>
                                <button type='button' onClick={() => setShowForm(false)} className='px-4 py-2 rounded border border-gray-300 text-[var(--adm-ink)] text-sm cursor-pointer hover:bg-gray-50 transition'>Cancel</button>
                                <button type='submit' className='px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full cursor-pointer transition'>Add Coupon</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div>
                <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden'>
                    {coupons.length === 0 ? (
                        <p className='text-center text-[var(--adm-muted)] py-12 text-sm'>No coupons yet</p>
                    ) : (
                        <>
                            <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead className='bg-gray-50 border-b border-gray-200'>
                                    <tr>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Code</th>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Discount</th>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Min Order</th>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Used</th>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Expiry</th>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Status</th>
                                        <th className='px-3 py-2.5 text-right text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Action</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {pageItems.map((c) => (
                                        <tr key={c._id} className='hover:bg-gray-50 transition'>
                                            <td className='px-3 py-2 font-semibold text-[var(--adm-ink)]'>{c.code}</td>
                                            <td className='px-3 py-2 text-[var(--adm-ink)]'>{c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                                            <td className='px-3 py-2 text-[var(--adm-ink)]'>₹{c.minOrderAmount}</td>
                                            <td className='px-3 py-2 text-[var(--adm-ink)]'>{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                                            <td className={`px-3 py-2 ${isExpired(c) ? 'text-red-500' : 'text-[var(--adm-ink)]'}`}>{new Date(c.expiryDate).toLocaleDateString()}</td>
                                            <td className='px-3 py-2'>
                                                <button
                                                    onClick={() => toggleCoupon(c._id)}
                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer transition ${c.isActive ? 'bg-emerald-100 text-emerald-600 hover:bg-green-200' : 'bg-gray-100 text-[var(--adm-muted)] hover:bg-gray-200'}`}
                                                >
                                                    {c.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className='px-3 py-2'>
                                                <div className='flex items-center justify-end gap-2'>
                                                    <IconButton variant='view' onClick={() => navigate(`/admin/coupon/${c._id}`)} aria-label='View coupon' title='View'>
                                                        <EyeIcon />
                                                    </IconButton>
                                                    <IconButton variant='delete' onClick={() => removeCoupon(c._id)} aria-label='Delete coupon' title='Delete'>
                                                        <TrashIcon />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={coupons.length} pageSize={10} start={start} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Coupons
