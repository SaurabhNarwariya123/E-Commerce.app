import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Offers = ({ token }) => {

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

    return (
        <div className='flex flex-col gap-8'>
            <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
                <div>
                    <p className='mb-2'>Offer Image</p>
                    <label htmlFor="offerImage">
                        <img className='w-24 cursor-pointer' src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id='offerImage' hidden />
                    </label>
                </div>

                <div className='w-full'>
                    <p className='mb-2'>Title</p>
                    <input onChange={(e) => setTitle(e.target.value)} value={title} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='e.g. Diwali Dhamaka Sale' required />
                </div>

                <div className='w-full'>
                    <p className='mb-2'>Description</p>
                    <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' placeholder='Short description shown on the offer card' />
                </div>

                <div className='w-full'>
                    <p className='mb-2'>Discount Text</p>
                    <input onChange={(e) => setDiscountText(e.target.value)} value={discountText} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='e.g. Flat 20% OFF' />
                </div>

                <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
                    <div>
                        <p className='mb-2'>Start Date</p>
                        <input onChange={(e) => setStartDate(e.target.value)} value={startDate} className='w-full px-3 py-2' type="date" required />
                    </div>
                    <div>
                        <p className='mb-2'>End Date</p>
                        <input onChange={(e) => setEndDate(e.target.value)} value={endDate} className='w-full px-3 py-2' type="date" required />
                    </div>
                </div>

                <button type='submit' className='w-32 py-3 mt-4 bg-green-700 hover:bg-green-800 text-white rounded-xl cursor-pointer transition'>ADD OFFER</button>
            </form>

            <div>
                <p className='mb-2'>All Festival Offers</p>
                <div className='flex flex-col gap-2'>
                    <div className='hidden md:grid grid-cols-[1fr_3fr_2fr_2fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
                        <b>Image</b>
                        <b>Title</b>
                        <b>Start Date</b>
                        <b>End Date</b>
                        <b className='text-center'>Action</b>
                    </div>

                    {offers.map((offer) => (
                        <div key={offer._id} className='grid grid-cols-[1fr_3fr_2fr_2fr_1fr] items-center py-1 px-2 border text-sm'>
                            <img className='w-12 h-12 object-cover' src={offer.imageUrl} alt={offer.title} />
                            <p>{offer.title}</p>
                            <p>{new Date(offer.startDate).toLocaleDateString()}</p>
                            <p>{new Date(offer.endDate).toLocaleDateString()}</p>
                            <p onClick={() => removeOffer(offer._id)} className='text-center text-red-500 cursor-pointer'>X</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Offers
