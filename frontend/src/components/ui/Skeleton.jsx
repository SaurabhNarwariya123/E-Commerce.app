import React from 'react'

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-beige-light rounded ${className}`} />
)

export const ProductCardSkeleton = () => (
  <div className='flex flex-col gap-2'>
    <Skeleton className='w-full aspect-[3/4] rounded-2xl' />
    <Skeleton className='h-3.5 w-3/4 mt-1' />
    <Skeleton className='h-3.5 w-1/3' />
  </div>
)

export const ProductGridSkeleton = ({ count = 10 }) => (
  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8'>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
)

export default Skeleton
