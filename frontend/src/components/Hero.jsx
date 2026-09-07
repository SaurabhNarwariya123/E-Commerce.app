import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <div className='relative left-1/2 right-1/2 -mx-[50vw] w-screen flex flex-col sm:flex-row overflow-hidden bg-linear-to-br from-beige-light/60 via-ivory to-beige/30'>
        {/* Ambient gold glow */}
        <div className='pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gold/20 blur-3xl'></div>
        <div className='pointer-events-none absolute -bottom-24 right-1/3 w-64 h-64 rounded-full bg-rose/10 blur-3xl'></div>

        {/* Hero left side */}

        <div className='relative w-full sm:w-1/2 flex items-center justify-center py-14 sm:py-0 pl-4 sm:pl-[5vw] md:pl-[7vw] lg:pl-[9vw] pr-6'>
         <div className='text-charcoal'>
            <div className='flex items-center gap-2 animate-fade-in-up'>
                <p className='w-8 md:w-11 h-[2px] bg-gold'></p>
                 <p className='font-medium text-sm md:text-base tracking-[0.2em] gold-gradient-text'>NEW COLLECTION</p>

            </div>
            <h1 className='prata-regular text-4xl sm:py-3 lg:text-6xl leading-relaxed animate-fade-in-up' style={{ animationDelay: '0.1s' }}>Elevate Your<br/>Everyday Style</h1>
            <p className='text-gray-500 text-sm md:text-base max-w-sm mb-1 animate-fade-in-up' style={{ animationDelay: '0.15s' }}>
                Discover timeless pieces crafted for comfort, designed for elegance, made for you.
            </p>
             <a href='#latest-collection' className='flex items-center gap-2 group w-fit animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
                <p className='font-semibold text-sm md:text-base group-hover:text-charcoal transition-colors'>SHOP NOW</p>

                 <p className='w-8 md:w-11 h-[1px] bg-charcoal group-hover:bg-gold group-hover:w-12 transition-all'></p>
             </a>
         </div>
        </div>

        {/*  Hero Right side */}

        <div className='relative w-full sm:w-1/2 overflow-hidden'>
          <img className='w-full h-full object-cover max-h-[520px] animate-float' src={assets.hero_img} alt="" />
          <div className='absolute inset-0 bg-linear-to-t from-charcoal/10 via-transparent to-transparent sm:bg-linear-to-l'></div>
        </div>
    </div>
  )
}

export default Hero
