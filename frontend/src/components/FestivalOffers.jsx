import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import Card from './ui/Card'
import axios from 'axios'

const FestivalOffers = () => {
  const { backendUrl } = useContext(ShopContext)
  const [offers, setOffers] = useState([])

  useEffect(() => {
    axios.get(backendUrl + '/api/offer/active')
      .then(res => { if (res.data.success) setOffers(res.data.offers) })
      .catch(() => {})
  }, [backendUrl])

  if (offers.length === 0) return null

  return (
    <div className='my-16'>
      <div className='text-center py-4'>
        <Title text1={'FESTIVAL'} text2={'OFFERS'} />
      </div>

      <div className='flex gap-5 overflow-x-auto pb-2'>
        {offers.map(offer => (
          <Card key={offer._id} className='min-w-65 max-w-65 overflow-hidden shrink-0'>
            <div className='relative'>
              <img src={offer.imageUrl} alt={offer.title} className='w-full h-36 object-cover' />
              {offer.discountText && (
                <span className='absolute top-2 right-2 bg-gold text-white text-xs font-semibold px-2.5 py-1 rounded-full'>
                  {offer.discountText}
                </span>
              )}
            </div>
            <div className='p-4'>
              <p className='font-semibold text-charcoal text-sm truncate'>{offer.title}</p>
              {offer.description && (
                <p className='text-xs text-gray-500 mt-1 line-clamp-2'>{offer.description}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default FestivalOffers
