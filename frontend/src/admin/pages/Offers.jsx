import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { EyeIcon, TrashIcon, IconButton } from '../components/Icons'
import Pagination, { usePagination } from '../components/Pagination'

const Offers = ({ token }) => {
    const navigate = useNavigate()
    const [showForm, setShowForm] = useState(false)

    const [image, setImage] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [discountText, setDiscountText] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [offers, setOffers] = useState([])

    const fetchOffers = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/offer/list', { headers: { token } })
            if (response.data.success) {
                setOffers(response.data.offers)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('description', description)
            formData.append('discountText', discountText)
            formData.append('startDate', startDate)
            formData.append('endDate', endDate)
            image && formData.append('image', image)

            const response = await axios.post(backendUrl + '/api/offer/add', formData, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                setImage(false)
                setTitle('')
                setDescription('')
                setDiscountText('')
                setStartDate('')
                setEndDate('')
                setShowForm(false)
                await fetchOffers()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const removeOffer = async (id) => {
        try {
            const response = await axios.post(backendUrl + '/api/offer/remove', { id }, { headers: { token } })
            if (response.data.success) {
                toast.success(response.data.message)
                await fetchOffers()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchOffers()
    }, [])

    const { page, setPage, totalPages, pageItems, start } = usePagination(offers, 10)

    const labelClass = 'text-sm font-medium text-gray-700 mb-1.5 block'
    const inputClass = 'w-full max-w-125 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition'

    return (
        <div className='flex flex-col gap-5'>
            <div className='flex items-center justify-between flex-wrap gap-3'>
                <div>
                    <h2 className='text-xl font-semibold text-gray-800'>Festival Offers</h2>
                    <p className='text-xs text-gray-500 mt-0.5'>{offers.length} offer{offers.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className='bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-full transition cursor-pointer'
                >
                    + Add Offer
                </button>
            </div>

            {showForm && (
                <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowForm(false)}>
                    <div className='bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
                        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl'>
                            <h2 className='text-lg font-semibold text-gray-800'>Add Festival Offer</h2>
                            <button onClick={() => setShowForm(false)} className='text-gray-400 hover:text-gray-700 text-2xl leading-none cursor-pointer' aria-label='Close'>&times;</button>
                        </div>
                        <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4 p-6'>
                            <div>
                                <p className={labelClass}>Offer Image</p>
                                <label htmlFor="offerImage">
                                    <div className='w-24 h-24 rounded-lg border border-dashed border-gray-300 hover:border-green-400 transition overflow-hidden'>
                                        <img className='w-full h-full object-cover cursor-pointer' src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                                    </div>
                                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='offerImage' hidden />
                                </label>
                            </div>

                            <div className='w-full'>
                                <p className={labelClass}>Title</p>
                                <input onChange={(e) => setTitle(e.target.value)} value={title} className={inputClass} type="text" placeholder='e.g. Diwali Dhamaka Sale' required />
                            </div>

                            <div className='w-full'>
                                <p className={labelClass}>Description</p>
                                <textarea onChange={(e) => setDescription(e.target.value)} value={description} rows={3} className={inputClass} placeholder='Short description shown on the offer card' />
                            </div>

                            <div className='w-full'>
                                <p className={labelClass}>Discount Text</p>
                                <input onChange={(e) => setDiscountText(e.target.value)} value={discountText} className={inputClass} type="text" placeholder='e.g. Flat 20% OFF' />
                            </div>

                            <div className='flex flex-col sm:flex-row gap-4 w-full'>
                                <div>
                                    <p className={labelClass}>Start Date</p>
                                    <input onChange={(e) => setStartDate(e.target.value)} value={startDate} className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition' type="date" required />
                                </div>
                                <div>
                                    <p className={labelClass}>End Date</p>
                                    <input onChange={(e) => setEndDate(e.target.value)} value={endDate} className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition' type="date" required />
                                </div>
                            </div>

                            <div className='flex justify-end gap-2 w-full mt-2'>
                                <button type='button' onClick={() => setShowForm(false)} className='px-4 py-2 rounded border border-gray-300 text-gray-700 text-sm cursor-pointer hover:bg-gray-50 transition'>Cancel</button>
                                <button type='submit' className='px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-full cursor-pointer transition'>Add Offer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div>
                <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden'>
                    {offers.length === 0 ? (
                        <p className='text-center text-gray-400 py-12 text-sm'>No offers yet</p>
                    ) : (
                        <>
                            <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead className='bg-gray-50 border-b border-gray-200'>
                                    <tr>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Image</th>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Title</th>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>Start Date</th>
                                        <th className='px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide'>End Date</th>
                                        <th className='px-3 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide'>Action</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-100'>
                                    {pageItems.map((offer) => (
                                        <tr key={offer._id} className='hover:bg-gray-50 transition'>
                                            <td className='px-3 py-2'>
                                                <img className='w-12 h-12 object-cover rounded-lg' src={offer.imageUrl} alt={offer.title} />
                                            </td>
                                            <td className='px-3 py-2 font-medium text-gray-800'>{offer.title}</td>
                                            <td className='px-3 py-2 text-gray-700'>{new Date(offer.startDate).toLocaleDateString()}</td>
                                            <td className='px-3 py-2 text-gray-700'>{new Date(offer.endDate).toLocaleDateString()}</td>
                                            <td className='px-3 py-2'>
                                                <div className='flex items-center justify-end gap-2'>
                                                    <IconButton variant='view' onClick={() => navigate(`/admin/offer/${offer._id}`)} aria-label='View offer' title='View'>
                                                        <EyeIcon />
                                                    </IconButton>
                                                    <IconButton variant='delete' onClick={() => removeOffer(offer._id)} aria-label='Delete offer' title='Delete'>
                                                        <TrashIcon />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={offers.length} pageSize={10} start={start} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Offers
