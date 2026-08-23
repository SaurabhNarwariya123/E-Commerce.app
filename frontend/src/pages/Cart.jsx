import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import { CartTotal } from '../components/CartTotal';
import Button from '../components/ui/Button';

const Cart = () => {

    const{products,currency , cartItems , updateQuantity , navigate} = useContext(ShopContext);

    const [cartData , setCartData] = useState([]);

    useEffect(()=>{

    if(products.length > 0) {
      const tempData = [];
        for(const items in cartItems){
           for (const item in cartItems[items]){
            if(cartItems[items][item] > 0){
               tempData.push({
                _id:items,
                size:item,
                quantity:cartItems[items][item]
               })
            }
           }
        }
        setCartData(tempData);
    }
} , [cartItems,products])


  return (
    <div className='border-t border-beige pt-14 min-h-[50vh]'>

      <div className='text-2xl mb-3'>
        <Title text1={"YOUR"} text2={"CART"}/>

      </div>

      {cartData.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-4 py-24 text-center'>
          <span className='text-5xl'>🛍️</span>
          <p className='text-gray-500 text-sm'>Your cart is empty</p>
          <Button variant='outline' onClick={() => navigate('/collection')}>Continue Shopping</Button>
        </div>
      ) : (
      <div>
        {
          cartData.map((item,index)=>{

            const productData = products.find((Product) => Product._id=== item._id);

            return(
              <div key={index} className='py-4 border-t border-b border-beige text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>

                <div className='flex items-start gap-6'>
                  <img className='w-16 sm:w-20 rounded-lg object-cover' src={productData.image[0]} alt="" />
                  <div>
                    <p className='text-xs sm:text-lg font-medium text-charcoal'> {productData.name}</p>
                        <div className='flex items-center gap-5 mt-2'>
                          <p> {currency}{productData.price}</p>
                          <p className='px-2 sm:px-3 sm:py-1 border border-beige rounded bg-beige-light/60'>{item.size}</p>
                        </div>
                  </div>

                </div>
                     <input  onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id , item.size,Number(e.target.value))} className ="border border-beige rounded-md max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 focus:outline-none focus:border-gold transition-colors" type="number" min={1} defaultValue={item.quantity} />
                     <img  onClick={ () => updateQuantity(item._id,item.size,0)} className='w-4 mr-4 sm:w-5 cursor-pointer opacity-60 hover:opacity-100 transition-opacity' src={assets.bin_icon} alt="" />
              </div>
            )
          })
        }
      </div>
      )}

      {cartData.length > 0 && (
      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal/>
          <div className='w-full text-end'>
             <Button variant='gold' size='lg' className='mt-8' onClick={()=> navigate('/place-order')}>PROCEED TO CHECKOUT</Button>
          </div>

        </div>

      </div>
      )}

    </div>
  )
}

export default Cart
