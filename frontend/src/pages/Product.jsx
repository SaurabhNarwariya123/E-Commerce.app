import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {
  const {productId} = useParams();
  const {products,currency,addToCart} = useContext(ShopContext);
  const [productData , setProductData]  = useState(false);
  const [image , setImage] = useState('')
  const [size , setSize] = useState('')

  const fetchProductData = async () => {

         products.map((item) => {
           if (item._id == productId)
           {
             setProductData(item)
             setImage(item.image[0])
             return null;
           }
         })
  }

  useEffect( () =>{
    fetchProductData();
  },[productId])

  return productData ? (
    <div className=' border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
         {/* --------------- product Info------------ */}
        <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
      
         {/* --------------- product Info------------ */}
        <div className='flex-1 flex flex-col gap-3 sm:flex-row '>
           <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal'>
                {
                  productData.image.map((item,index) => (

                    <img onClick={() =>setImage(item)} src = {item} key = {index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt=''/>
                  ))
                }
           </div>
            <div className='w-full sm:w-[80%]'> 
                 <img className='w-full h-auto ' src={image} alt="" />
            </div>
        </div>

        {/* --------------- product Info------------ */}

         <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
           <div>
            <img src={assets.star_icon} alt="" className='w-3 5'/>
            <img src={assets.star_icon} alt=""  className='w-3 5'/>
            <img src={assets.star_icon} alt=""  className='w-3 5'/>
            <img src={assets.star_icon} alt=""  className='w-3 5'/>
            <img src={assets.star_dull_icon} alt=""  className='w-3 5'/>
            <p className='pl-2'>(122)</p>
           </div>
           <p className='mt-5 text-3xl font-medium'> {currency} {productData.price}</p>
           <p className='mt-5 text-gray-500 md:w-4/5 '>{productData.description}</p>
           <div className='flex flex-col gap-4 my-8'>
            <p className='font-medium text-sm text-gray-700'>Select Size</p>
            <div className='flex flex-wrap gap-2'>
              {productData.sizes.map((item, index) => {
                const stockQty = productData.stock ? (productData.stock[item] ?? productData.stock.get?.(item) ?? null) : null
                const outOfStock = stockQty !== null && stockQty === 0
                const lowStock = stockQty !== null && stockQty > 0 && stockQty <= 5
                return (
                  <button
                    key={index}
                    disabled={outOfStock}
                    onClick={() => !outOfStock && setSize(item)}
                    className={`relative min-w-[44px] px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-150
                      ${outOfStock ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through' :
                        item === size ? 'border-orange-500 bg-orange-50 text-orange-600' :
                        'border-gray-300 bg-white text-gray-700 hover:border-gray-500 cursor-pointer'}`}
                  >
                    {item}
                    {lowStock && !outOfStock && (
                      <span className='absolute -top-2 -right-2 text-[9px] bg-orange-500 text-white rounded-full px-1 py-0.5 leading-none'>
                        {stockQty}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {/* Stock hint */}
            {size && (() => {
              const qty = productData.stock ? (productData.stock[size] ?? productData.stock.get?.(size) ?? null) : null
              if (qty === null) return null
              if (qty === 0) return <p className='text-xs text-red-500'>Out of stock for size {size}</p>
              if (qty <= 5) return <p className='text-xs text-orange-500'>Only {qty} left in size {size}!</p>
              return <p className='text-xs text-green-600'>In stock ({qty} available)</p>
            })()}
           </div>

           <button
             onClick={() => {
               if (!size) { alert('Please select a size'); return; }
               addToCart(productData._id, size)
             }}
             className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 hover:bg-gray-900 transition-colors rounded'
           >
             ADD TO CART
           </button>
            <hr className='mt-8 sm:w-4/5'/>
            <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original Product </p>
              <p> Cash on Delivery is available on this product .</p>
              <p>Easy return and exchange policy within 7 days.</p>
            </div>
         </div>
        </div>

        {/* ----------Description And Review Section--------------- */}
        <div className='mt-20'>
          <div className='flex'> 
            <b className='border px-5 py-3 text-sm'> Description</b>
           <p className='border px-5 py-3 text-sm'>Reviews (122)</p>

          </div>
          <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
            <p>an e -commerce website is qan online platform tha facilitates the buying and sell of product or servies over the internet / it serves a as virtual marketplace where businesses and individuals can showcasd thwere prodcut interact with customer and conduct transaction without the need for a physical presence . E commerce website have gained immense popularity due to their convenience , accessibility and the global reach they offer.</p>
            <p> E- commerce website typically display product or service along with detailed description . images prices and any available variation (e.g.  sizes colors) . Each product usually has its own dedicates with relevant information .</p>
          </div>
          </div>

        {/* -------------- display related product -------------------------- */}

        <RelatedProducts category={productData.category}  subCategory={productData.subCategory}/>

    </div>
  ) : <div className='opacity-0'></div>
}

export default Product
