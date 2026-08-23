import React, { useContext, useState } from 'react'
import {assets} from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import IconButton from './ui/IconButton'
import axios from 'axios'


const Navbar = () => {

  const [visible , setVisible] = useState(false);

   const {setShowSearch , getCartCount , navigate,token,setToken,setCartItems,setUserId,setUserName,setUserEmail, setShowCartSidebar, backendUrl} = useContext(ShopContext);
    const logout = async () => {
       try { await axios.post(backendUrl + '/api/user/logout') } catch (_) {}
       localStorage.removeItem('token')
       localStorage.removeItem('userId')
       localStorage.removeItem('userName')
       localStorage.removeItem('userEmail')
       setToken('')
       setUserId('')
       setUserName('')
       setUserEmail('')
       setCartItems({})
       navigate('/login')
    }

  const navLinkClass = ({ isActive }) =>
    `group relative flex flex-col items-center gap-1 text-xs tracking-[0.15em] uppercase transition-colors duration-200 ${isActive ? 'active text-charcoal' : 'text-gray-500 hover:text-charcoal'}`

  return (
    <>
    <div className='sticky top-0 z-30 flex items-center justify-between py-3.5 sm:py-5 font-medium border-b border-beige bg-ivory/90 backdrop-blur-md shadow-sm shadow-black/2'>
     <Link to="/" className='transition-transform duration-300 hover:scale-105'> <img src={assets.logo} className='w-28 sm:w-36' alt="" /></Link>

       <ul className='hidden sm:flex gap-8'>

        <NavLink to= '/' className={navLinkClass}>
          <p>Home</p>
          <hr className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 border-none h-[1.5px] bg-gold rounded-full transition-all duration-300 in-[.active]:w-full group-hover:w-full'/>
        </NavLink>

        <NavLink to= '/collection' className={navLinkClass}>
          <p>Collection</p>
          <hr className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 border-none h-[1.5px] bg-gold rounded-full transition-all duration-300 in-[.active]:w-full group-hover:w-full'/>
        </NavLink>

        <NavLink to= '/about' className={navLinkClass}>
          <p>About</p>
          <hr className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 border-none h-[1.5px] bg-gold rounded-full transition-all duration-300 in-[.active]:w-full group-hover:w-full'/>
        </NavLink>

        <NavLink to= '/contact' className={navLinkClass}>
          <p>Contact</p>
          <hr className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 border-none h-[1.5px] bg-gold rounded-full transition-all duration-300 in-[.active]:w-full group-hover:w-full'/>
        </NavLink>
       </ul>

       <div className='flex items-center gap-2'>
             <IconButton onClick={() => setShowSearch(true)} aria-label='Search'>
               <img src={assets.search_icon} className='w-4.5' alt="" />
             </IconButton>
             <div className='group relative'>

            <IconButton onClick={()=> token ? null : navigate('/login')} aria-label='Account'>
              <img src={assets.profile_icon} className='w-4.5' alt="" />
            </IconButton>

               {/*  -----------------Drop down -------------  */}

                { token &&
                     <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-3 z-20'>
                     <div className='flex flex-col gap-0.5 w-44 py-2 px-1.5 bg-white border border-beige rounded-xl shadow-xl shadow-black/5 text-sm text-gray-600 animate-pop origin-top-right'>
                        <p onClick={() => navigate('/profile')} className='cursor-pointer rounded-lg px-3.5 py-2 hover:text-gold-dark hover:bg-beige-light/70 transition-colors'>My Profile</p>
                        <p onClick={() =>navigate('/orders')} className='cursor-pointer rounded-lg px-3.5 py-2 hover:text-gold-dark hover:bg-beige-light/70 transition-colors'>Orders</p>
                        <p onClick={() =>navigate('/wishlist')} className='cursor-pointer rounded-lg px-3.5 py-2 hover:text-gold-dark hover:bg-beige-light/70 transition-colors'>Wishlist</p>
                        <hr className='my-1 border-beige' />
                        <p onClick={logout} className='cursor-pointer rounded-lg px-3.5 py-2 hover:text-rose hover:bg-rose/5 transition-colors'>Logout</p>
                    </div>
                  </div>
                }
              </div>
                {token &&
                  <IconButton onClick={() => navigate('/wishlist')} aria-label='Wishlist'>
                    <svg className='w-4.5 h-4.5' fill='none' stroke='currentColor' strokeWidth='1.8' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M12 21s-7.5-4.6-10-9.1C.5 8.5 2.3 5 6 5c2 0 3.5 1 4 2.3C10.5 6 12 5 14 5c3.7 0 5.5 3.5 4 6.9C19.5 16.4 12 21 12 21z' />
                    </svg>
                  </IconButton>
                }
                <IconButton onClick={() => setShowCartSidebar(true)} badge={getCartCount()} aria-label='Cart'>
                   <img src={assets.cart_icon} alt="" className='w-4.5'/>
                </IconButton>
                <IconButton onClick={() => setVisible(true)} className='sm:hidden' aria-label='Menu'>
                  <img src={assets.menu_icon} className='w-4.5' alt="" />
                </IconButton>
            </div>
    </div>

      {/* Sidebar menu for small screens */}

      <div className ={`fixed inset-0 z-40 bg-charcoal/80 transition-opacity duration-300 ${ visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none' }`} onClick={() => setVisible(false)}></div>

      <div className ={`fixed top-0 right-0 z-50 h-screen w-[80%] max-w-xs overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${ visible ? 'translate-x-0' : 'translate-x-full' } `}>
             <div className='flex flex-col text-gray-600 h-full'>
               <div className='flex items-center justify-between p-5 border-b border-beige'>
                <img src={assets.logo} className='w-24' alt="" />
                <button onClick={()=> setVisible(false)} aria-label='Close menu' className='text-2xl leading-none text-gray-400 hover:text-charcoal transition-colors cursor-pointer'>&times;</button>
               </div>
               <NavLink   onClick={()=> setVisible(false)}   className={({isActive}) => `py-4 pl-6 border-b border-beige tracking-[0.15em] text-sm transition-colors hover:text-gold-dark hover:bg-beige-light/60 ${isActive ? 'text-gold-dark bg-beige-light/60 font-semibold' : ''}`} to='/'>HOME</NavLink>
               <NavLink   onClick={()=> setVisible(false)}  className={({isActive}) => `py-4 pl-6 border-b border-beige tracking-[0.15em] text-sm transition-colors hover:text-gold-dark hover:bg-beige-light/60 ${isActive ? 'text-gold-dark bg-beige-light/60 font-semibold' : ''}`} to='/collection'>COLLECTION</NavLink>
               <NavLink   onClick={()=> setVisible(false)}  className={({isActive}) => `py-4 pl-6 border-b border-beige tracking-[0.15em] text-sm transition-colors hover:text-gold-dark hover:bg-beige-light/60 ${isActive ? 'text-gold-dark bg-beige-light/60 font-semibold' : ''}`} to='/about'>ABOUT</NavLink>
               <NavLink   onClick={()=> setVisible(false)}  className={({isActive}) => `py-4 pl-6 border-b border-beige tracking-[0.15em] text-sm transition-colors hover:text-gold-dark hover:bg-beige-light/60 ${isActive ? 'text-gold-dark bg-beige-light/60 font-semibold' : ''}`} to='/contact'>CONTACT</NavLink>

             </div>
      </div>
    </>
  )
}

export default Navbar
