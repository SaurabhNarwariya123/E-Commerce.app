import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-8 sm:gap-4 text-center py-20'>
      <div className='flex flex-col items-center gap-4 px-4 group'>
        <div className='w-16 h-16 rounded-full bg-beige-light flex items-center justify-center group-hover:bg-gold/15 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-gold/15 transition-all duration-300'>
          <img src={assets.exchange_icon} className='w-7' alt="" />
        </div>
        <p className='font-semibold text-charcoal text-sm group-hover:text-gold-dark transition-colors'>Easy Exchange Policy</p>
        <p className='text-gray-400 text-xs sm:text-sm'>We offer a hassle-free exchange policy</p>
      </div>

      <div className='flex flex-col items-center gap-4 px-4 group'>
        <div className='w-16 h-16 rounded-full bg-beige-light flex items-center justify-center group-hover:bg-gold/15 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-gold/15 transition-all duration-300'>
          <img src={assets.quality_icon} className='w-7' alt="" />
        </div>
        <p className='font-semibold text-charcoal text-sm group-hover:text-gold-dark transition-colors'>7 Days Return Policy</p>
        <p className='text-gray-400 text-xs sm:text-sm'>We provide a 7-day free return policy</p>
      </div>

      <div className='flex flex-col items-center gap-4 px-4 group'>
        <div className='w-16 h-16 rounded-full bg-beige-light flex items-center justify-center group-hover:bg-gold/15 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-gold/15 transition-all duration-300'>
          <img src={assets.support_img} className='w-7' alt="" />
        </div>
        <p className='font-semibold text-charcoal text-sm group-hover:text-gold-dark transition-colors'>Best Customer Support</p>
        <p className='text-gray-400 text-xs sm:text-sm'>We provide 24/7 customer support</p>
      </div>
    </div>
  )
}

export default OurPolicy
