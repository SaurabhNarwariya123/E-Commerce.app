import React , {useContext, useEffect, useState} from 'react'
 import { ShopContext} from '../context/ShopContext'
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';

function SearchBar() {
    const {search , setSearch , showSearch ,setShowSearch} = useContext(ShopContext);
    const [visible , setVisible] = useState(false);
    const location = useLocation();

    useEffect(() =>{
      
       if(location.pathname.includes('collection'))  {
         setVisible(true);
       }
       else {
        setVisible(false);
       }
    }, [location])


  return showSearch  && visible ? (

    <div className = 'border-t border-b border-beige bg-beige-light/40 text-center animate-fade-in'>

         <div className='inline-flex items-center justify-center border border-beige bg-white px-5 py-3.5 my-6 mx-3 rounded-full w-3/4 sm:w-1/2 shadow-sm focus-within:border-gold transition-colors'>
           <input  value={search} onChange={ (e) => setSearch (e.target.value)} className = ' flex-1 outline-none bg-inherit text-sm'  type="text" placeholder='Search' />
           <img className='w-4' src={assets.search_icon} alt="" />
         </div>
         <img onClick={ () =>  setShowSearch(false)}  className = 'inline w-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity' src={assets.cross_icon} alt="" />
    </div>

  ) : null
}

export default SearchBar