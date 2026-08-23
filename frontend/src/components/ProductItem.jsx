import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';
import Card from './ui/Card';

const formatCount = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`

const ProductItem = ({id,image,name,price,discountPercent,colors,rating,reviewCount}) => {

    const {currency, wishlist, toggleWishlist, getBestOffer} = useContext(ShopContext);
    const hasDiscount = discountPercent > 0
    const discountedPrice = hasDiscount ? Math.round(price - (price * discountPercent) / 100) : price
    const isWished = wishlist?.includes(id)
    const offer = getBestOffer(discountedPrice)

  return (
    <Link className='text-charcoal cursor-pointer group' to={`/product/${id}`}>
        <Card className='overflow-hidden'>
            <div className='relative overflow-hidden rounded-t-2xl aspect-[3/4] bg-beige-light'>
                <img className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out' src={image[0]} alt={name} />
                <div className='absolute inset-0 bg-linear-to-t from-charcoal/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                <button
                  type='button'
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(id); }}
                  aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                  className='absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-ivory/90 shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 z-10'
                >
                  <svg className={`w-4 h-4 ${isWished ? 'text-rose' : 'text-charcoal/60'}`} fill={isWished ? 'currentColor' : 'none'} stroke='currentColor' strokeWidth='1.8' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M12 21s-7.5-4.6-10-9.1C.5 8.5 2.3 5 6 5c2 0 3.5 1 4 2.3C10.5 6 12 5 14 5c3.7 0 5.5 3.5 4 6.9C19.5 16.4 12 21 12 21z' />
                  </svg>
                </button>
                {hasDiscount && (
                  <span className='absolute top-2.5 left-2.5 bg-rose text-white text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full shadow-sm'>
                    -{discountPercent}%
                  </span>
                )}
                <span className='absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-ivory/95 text-charcoal text-[11px] tracking-[0.15em] uppercase px-4 py-1.5 rounded-full shadow-sm'>
                    View Details
                </span>
            </div>
            <div className='p-3'>
                <p className='text-sm text-gray-700 truncate group-hover:text-charcoal transition-colors'>{name}</p>
                {rating != null && (
                  <span className='inline-flex items-center gap-1 mt-1 bg-green-700 text-white text-[11px] font-medium px-1.5 py-0.5 rounded'>
                    {rating.toFixed(1)}<span className='text-[9px]'>★</span>
                    {reviewCount > 0 && <span className='opacity-80'>| {formatCount(reviewCount)}</span>}
                  </span>
                )}
                <div className='flex items-center gap-2 mt-1'>
                  <p className='text-sm font-semibold text-gold-dark'>{currency} {discountedPrice}</p>
                  {hasDiscount && (
                    <p className='text-xs text-gray-400 line-through'>{currency} {price}</p>
                  )}
                  {hasDiscount && <p className='text-xs text-green-700 font-medium'>({discountPercent}% off)</p>}
                </div>
                {offer && (
                  <p className='flex items-center gap-1 text-[11px] text-green-700 font-medium mt-0.5'>
                    <span>✅</span> Offer Price: {currency} {offer.offerPrice}
                  </p>
                )}
                {colors?.length > 0 && (
                  <div className='flex items-center gap-1.5 mt-2'>
                    {colors.slice(0, 5).map((c, i) => (
                      <span key={i} className='w-3 h-3 rounded-full border border-beige' style={{ backgroundColor: c.hex }} title={c.name}></span>
                    ))}
                  </div>
                )}
            </div>
        </Card>
    </Link>
  )
}

export default ProductItem
