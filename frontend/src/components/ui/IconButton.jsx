import React from 'react'

const IconButton = ({ className = '', children, badge, ...props }) => {
  return (
    <button
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full
                  text-charcoal hover:bg-beige-light hover:scale-105 active:scale-95
                  transition-all duration-200 cursor-pointer ${className}`}
      {...props}
    >
      {children}
      {badge != null && badge !== 0 && (
        <span className='absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center
                          rounded-full bg-gold text-white text-[10px] font-semibold leading-none'>
          {badge}
        </span>
      )}
    </button>
  )
}

export default IconButton
