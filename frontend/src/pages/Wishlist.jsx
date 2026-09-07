import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import { Link } from 'react-router-dom'

const Wishlist = () => {
  const { products, wishlist } = useContext(ShopContext)
  const wishedProducts = products.filter(p => wishlist?.includes(p._id))

  return (
    <div className='pt-8 border-t border-beige min-h-[60vh]'>
      <div className='text-2xl mb-8'>
        <Title text1={'MY'} text2={'WISHLIST'} />
      </div>

      {wishedProducts.length === 0 ? (
        <div className='flex flex-col items-center justify-center text-center py-20 gap-3'>
          <p className='text-gray-500'>Your wishlist is empty.</p>
          <Link to='/collection' className='text-sm text-charcoal underline hover:text-charcoal transition-colors'>
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6'>
          {wishedProducts.map(item => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
              discountPercent={item.discountPercent}
              colors={item.colors}
              rating={item.rating}
              reviewCount={item.reviewCount}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
