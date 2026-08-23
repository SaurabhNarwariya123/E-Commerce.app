import React from 'react'

const Card = ({ className = '', children, hover = true, ...props }) => {
  return (
    <div
      className={`rounded-2xl border border-beige bg-white shadow-sm
                  ${hover ? 'hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1.5 hover:border-gold/40' : ''}
                  transition-all duration-300 ease-out ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
