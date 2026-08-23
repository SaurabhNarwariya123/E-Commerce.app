import React, { useState } from 'react'

const EyeIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' className='w-4.5 h-4.5'>
    <path d='M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z' />
    <circle cx='12' cy='12' r='3' />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' className='w-4.5 h-4.5'>
    <path d='M3 3l18 18' />
    <path d='M10.58 10.58a3 3 0 004.24 4.24' />
    <path d='M9.88 5.09A10.94 10.94 0 0112 4.5c6.5 0 10.5 7.5 10.5 7.5a13.9 13.9 0 01-3.35 4.3M6.6 6.6C3.88 8.36 1.5 12 1.5 12s4 7.5 10.5 7.5a10.7 10.7 0 004.9-1.17' />
  </svg>
)

const PasswordInput = ({ className = '', ...props }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className='relative w-full'>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-10`}
      />
      <button
        type='button'
        tabIndex={-1}
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal transition-colors'
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

export default PasswordInput
