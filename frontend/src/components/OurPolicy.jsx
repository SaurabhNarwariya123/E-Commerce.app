import React from 'react'

const items = [
  {
    title: 'Free Shipping',
    subtitle: 'On orders over $99',
    path: 'M3 7h11v8H3zM14 10h4l3 3v2h-7zM6.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  },
  {
    title: 'Easy Returns',
    subtitle: '30-day returns',
    path: 'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10',
  },
  {
    title: 'Secure Payment',
    subtitle: '100% protected',
    path: 'M12 2l8 3.5V11c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V5.5L12 2zM9 12l2 2 4-4',
  },
  {
    title: '24/7 Support',
    subtitle: "We're here to help",
    path: 'M4 13a8 8 0 0 1 16 0M4 13v4a2 2 0 0 0 2 2h1v-6H5a1 1 0 0 0-1 1zM20 13v4a2 2 0 0 1-2 2h-1v-6h1a1 1 0 0 1 1 1zM10 19h4',
  },
]

const OurPolicy = () => {
  return (
    <div className='bg-beige-light/60 border border-beige rounded-2xl px-6 sm:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8 my-16'>
      {items.map((item) => (
        <div key={item.title} className='flex items-center gap-3 group'>
          <div className='w-11 h-11 shrink-0 rounded-full bg-ivory flex items-center justify-center group-hover:bg-gold/15 group-hover:scale-110 transition-all duration-300'>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' className='text-charcoal/70 group-hover:text-charcoal transition-colors'>
              <path d={item.path} />
            </svg>
          </div>
          <div className='min-w-0'>
            <p className='font-semibold text-charcoal text-sm truncate group-hover:text-charcoal transition-colors'>{item.title}</p>
            <p className='text-gray-400 text-xs truncate'>{item.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OurPolicy
