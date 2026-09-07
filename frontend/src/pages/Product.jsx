import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

const formatCount = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`

const Product = () => {
  const {productId} = useParams();
  const {products,currency,addToCart,getBestOffer} = useContext(ShopContext);
  const [productData , setProductData]  = useState(false);
  const [image , setImage] = useState('')
  const [size , setSize] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)

  const fetchProductData = async () => {

         products.map((item) => {
           if (item._id == productId)
           {
             setProductData(item)
             setImage(item.image[0])
             setSelectedColor(item.colors?.[0] || null)
             return null;
           }
         })
  }

  useEffect( () =>{
    fetchProductData();
  },[productId, products])

  return productData ? (
    <div className='border-t border-beige pt-10 transition-opacity ease-in duration-500 opacity-100'>
         {/* --------------- product Info------------ */}
        <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

         {/* --------------- product Info------------ */}
        <div className='flex-1 flex flex-col gap-3 sm:flex-row '>
           <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal gap-2 sm:gap-3'>
                {
                  productData.image.map((item,index) => (

                    <img onClick={() =>setImage(item)} src = {item} key = {index} className={`w-[24%] sm:w-full sm:mb-0 shrink-0 cursor-pointer rounded-lg border-2 transition-colors ${image === item ? 'border-gold' : 'border-transparent hover:border-beige'}`} alt=''/>
                  ))
                }
           </div>
            <div className='w-full sm:w-[80%] aspect-[3/4] rounded-2xl overflow-hidden bg-beige-light'>
                 <img className='w-full h-full object-cover' src={image} alt="" />
            </div>
        </div>

        {/* --------------- product Info------------ */}

         <div className='flex-1'>
          <h1 className='prata-regular text-2xl mt-2 text-charcoal'>{productData.name}</h1>
           {productData.rating != null ? (
             <div className='flex items-center gap-2 mt-2'>
               <span className='inline-flex items-center gap-1 bg-green-700 text-white text-xs font-medium px-2 py-0.5 rounded'>
                 {productData.rating.toFixed(1)}<span className='text-[10px]'>★</span>
               </span>
               {productData.reviewCount > 0 && (
                 <span className='text-sm text-gray-400'>{formatCount(productData.reviewCount)} Ratings</span>
               )}
             </div>
           ) : (
             <div className='flex items-center mt-2'>
              <img src={assets.star_icon} alt="" className='w-3.5'/>
              <img src={assets.star_icon} alt=""  className='w-3.5'/>
              <img src={assets.star_icon} alt=""  className='w-3.5'/>
              <img src={assets.star_icon} alt=""  className='w-3.5'/>
              <img src={assets.star_dull_icon} alt=""  className='w-3.5'/>
              <p className='pl-2 text-sm text-gray-400'>(122)</p>
             </div>
           )}
           {(() => {
             const hasDiscount = productData.discountPercent > 0
             const discountedPrice = hasDiscount
               ? Math.round(productData.price - (productData.price * productData.discountPercent) / 100)
               : productData.price
             const offer = getBestOffer(discountedPrice)
             return (
               <>
                 <div className='flex items-center gap-3 mt-5'>
                   <p className='text-3xl font-medium text-charcoal'>{currency} {discountedPrice}</p>
                   {hasDiscount && (
                     <>
                       <p className='text-lg text-gray-400 line-through'>{currency} {productData.price}</p>
                       <span className='bg-rose text-white text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full'>-{productData.discountPercent}% OFF</span>
                     </>
                   )}
                 </div>
                 {offer && (
                   <p className='flex items-center gap-1.5 text-sm text-green-700 font-medium mt-1.5'>
                     <span>✅</span> Offer Price: {currency} {offer.offerPrice} <span className='text-xs text-gray-400 font-normal'>(use code {offer.code})</span>
                   </p>
                 )}
               </>
             )
           })()}
           <p className='mt-5 text-gray-500 md:w-4/5 leading-relaxed'>{productData.description}</p>

           {productData.colors?.length > 0 && (
             <div className='flex flex-col gap-3 mt-6'>
               <p className='font-medium text-sm text-gray-700'>Color{selectedColor ? `: ${selectedColor.name}` : ''}</p>
               <div className='flex flex-wrap gap-2.5'>
                 {productData.colors.map((c, i) => (
                   <button
                     key={i}
                     type='button'
                     onClick={() => setSelectedColor(c)}
                     title={c.name}
                     className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${selectedColor?.name === c.name ? 'border-gold scale-110 shadow-md' : 'border-beige hover:border-gold/50'}`}
                     style={{ backgroundColor: c.hex }}
                   />
                 ))}
               </div>
             </div>
           )}

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
                        item === size ? 'border-gold bg-gold/10 text-charcoal' :
                        'border-beige bg-white text-gray-700 hover:border-gold cursor-pointer'}`}
                  >
                    {item}
                    {lowStock && !outOfStock && (
                      <span className='absolute -top-2 -right-2 text-[9px] bg-gold text-white rounded-full px-1 py-0.5 leading-none'>
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
              if (qty <= 5) return <p className='text-xs text-charcoal'>Only {qty} left in size {size}!</p>
              return <p className='text-xs text-green-600'>In stock ({qty} available)</p>
            })()}
           </div>

           <Button
             variant='gold'
             size='lg'
             onClick={() => {
               if (!size) { alert('Please select a size'); return; }
               addToCart(productData._id, size)
             }}
           >
             ADD TO CART
           </Button>
            <hr className='mt-8 sm:w-4/5 border-beige'/>
            <div className='text-sm text-gray-500 mt-5 flex flex-col gap-3 sm:w-4/5'>
              <div className='flex items-center gap-3'>
                <img src={assets.quality_icon} alt='' className='w-5 opacity-70'/>
                <p>100% Original Product</p>
              </div>
              <div className='flex items-center gap-3'>
                <img src={assets.support_img} alt='' className='w-5 opacity-70'/>
                <p>Cash on Delivery is available on this product.</p>
              </div>
              <div className='flex items-center gap-3'>
                <img src={assets.exchange_icon} alt='' className='w-5 opacity-70'/>
                <p>Easy return and exchange policy within 7 days.</p>
              </div>
            </div>
         </div>
        </div>

        {/* ----------Description And Review Section--------------- */}
        <div className='mt-20'>
          <div className='flex'>
            <b className='border border-beige rounded-t-lg px-5 py-3 text-sm bg-beige-light/60 text-charcoal'> Description</b>
           <p className='border-b border-beige px-5 py-3 text-sm text-gray-400'>Reviews (122)</p>

          </div>
          <div className='flex flex-col gap-4 border border-beige rounded-b-lg rounded-tr-lg px-6 py-6 text-sm text-gray-500 leading-relaxed'>
            <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
            <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g. sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
          </div>
          </div>

        {/* -------------- display related product -------------------------- */}

        <RelatedProducts category={productData.category}  subCategory={productData.subCategory}/>

    </div>
  ) : (
    <div className='border-t border-beige pt-10'>
      <div className='flex gap-12 flex-col sm:flex-row'>
        <div className='flex-1'>
          <Skeleton className='w-full aspect-square rounded-2xl' />
        </div>
        <div className='flex-1 flex flex-col gap-4'>
          <Skeleton className='h-8 w-2/3' />
          <Skeleton className='h-5 w-1/4' />
          <Skeleton className='h-20 w-4/5' />
          <Skeleton className='h-10 w-1/3' />
        </div>
      </div>
    </div>
  )
}

export default Product
