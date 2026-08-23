import React from 'react'
import { assets } from '../assets/assets'
import NotificationBell from './NotificationBell'

const Navbar = ({setToken, token}) => {
  return (
    <div className='flex items-center py-2.5 px-[4%] justify-between bg-white'>
         <img className='w-[max(10%,80px)]' src= {assets.logo} alt="" />
         <div className='flex items-center gap-4'>
           <NotificationBell token={token} />
           <div className='hidden sm:flex items-center gap-2'>
             <div className='w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold'>A</div>
             <span className='text-sm text-gray-700 font-medium'>Admin</span>
           </div>
           <button onClick={()=>setToken('')}  className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer'>Logout</button>
         </div>
    </div>
  )
}

export default Navbar
