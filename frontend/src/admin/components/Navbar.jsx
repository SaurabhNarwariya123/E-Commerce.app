import React from 'react'
import { assets } from '../assets/assets'
import NotificationBell from './NotificationBell'

const Navbar = ({ setToken, token }) => {
  return (
    <div className='flex items-center py-1.5 px-5 justify-between bg-white border-b border-[var(--adm-line)]'>
      <img className='h-8 w-auto' src={assets.logo} alt='Forever admin' />
      <div className='flex items-center gap-3'>
        <NotificationBell token={token} />
        <div className='hidden sm:flex items-center gap-2 pl-3 border-l border-[var(--adm-line)]'>
          <div className='w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xs font-semibold'>A</div>
          <span className='text-[13px] text-[var(--adm-ink)] font-medium'>Admin</span>
        </div>
        <button onClick={() => setToken('')} className='btn btn-secondary'>Logout</button>
      </div>
    </div>
  )
}

export default Navbar
