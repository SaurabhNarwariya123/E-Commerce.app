import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const CategoryNav = () => {
  const { products } = useContext(ShopContext)

  const items = useMemo(() => {
    if (!products || products.length === 0) return []

    const firstImageFor = (predicate) => products.find(predicate)?.image?.[0]

    const groups = [
      { label: 'Women', image: firstImageFor(p => p.category === 'Women') },
      { label: 'Men', image: firstImageFor(p => p.category === 'Men') },
      { label: 'Kids', image: firstImageFor(p => p.category === 'Kids') },
      { label: 'Topwear', image: firstImageFor(p => p.subCategory === 'Topwear') },
      { label: 'Bottomwear', image: firstImageFor(p => p.subCategory === 'Bottomwear') },
      { label: 'Winterwear', image: firstImageFor(p => p.subCategory === 'Winterwear') },
    ].filter(g => g.image)

    return groups
  }, [products])

  if (items.length === 0) return null

  return (
    <div className='relative -mt-8 sm:-mt-10 z-10 mx-auto max-w-4xl'>
      <div className='bg-ivory border border-beige rounded-2xl shadow-lg shadow-charcoal/5 px-4 sm:px-8 py-5 flex items-center justify-between gap-3 sm:gap-6 overflow-x-auto'>
        {items.map((item) => (
          <Link key={item.label} to='/collection' className='flex flex-col items-center gap-2 shrink-0 group'>
            <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-beige group-hover:border-gold transition-colors'>
              <img src={item.image} alt={item.label} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300' />
            </div>
            <p className='text-[11px] sm:text-xs text-gray-600 group-hover:text-charcoal transition-colors'>{item.label}</p>
          </Link>
        ))}
        <Link to='/collection' className='flex flex-col items-center gap-2 shrink-0 group'>
          <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-charcoal flex items-center justify-center group-hover:bg-gold-dark transition-colors'>
            <span className='text-ivory text-[10px] sm:text-xs font-semibold tracking-wide'>SALE</span>
          </div>
          <p className='text-[11px] sm:text-xs text-gray-600 group-hover:text-charcoal transition-colors'>Sale</p>
        </Link>
      </div>
    </div>
  )
}

export default CategoryNav
