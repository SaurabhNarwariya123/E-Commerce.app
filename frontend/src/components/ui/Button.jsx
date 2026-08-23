import React from 'react'

const VARIANTS = {
  primary: 'bg-charcoal text-ivory hover:bg-black border border-charcoal hover:shadow-lg hover:shadow-charcoal/20',
  outline: 'bg-transparent text-charcoal border border-charcoal hover:bg-charcoal hover:text-ivory',
  gold: 'bg-linear-to-r from-gold-dark via-gold to-gold text-white hover:brightness-110 border border-gold hover:shadow-lg hover:shadow-gold/30',
  ghost: 'bg-transparent text-charcoal border border-transparent hover:bg-beige-light',
}

const SIZES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-10 py-3 text-sm',
}

const Spinner = () => (
  <svg className='animate-spin w-4 h-4' viewBox='0 0 24 24' fill='none'>
    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
  </svg>
)

const Button = ({ variant = 'primary', size = 'md', className = '', children, loading = false, disabled, ...props }) => {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide
                  transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer active:scale-95 ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export default Button
