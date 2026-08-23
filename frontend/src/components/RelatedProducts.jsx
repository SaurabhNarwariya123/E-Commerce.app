import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({category , subCategory}) => {


    const { products }  = useContext(ShopContext);
    const [ related , setRelated] = useState([]);


    useEffect(()=>{

        if(products.length > 0) {

            let productsCopy = products.slice();

            productsCopy = productsCopy.filter((item)=>category === item.category);
            productsCopy = productsCopy.filter((item)=>subCategory === item.subCategory);

            setRelated(productsCopy.slice(0,5));
        } 

    },[products])
  if (related.length === 0) return null

  return (
    <div className='my-24'>
        <div className='text-center py-2'>
            <Title text1= {"RELATED"} text2= {"PRODUCTS"}/>
         </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 gap-y-8' >
     {related.map((item,index) => (
        <ProductItem key = {index} id = {item._id} name = {item.name} price = {item.price}  image = { item.image} discountPercent={item.discountPercent} colors={item.colors} rating={item.rating} reviewCount={item.reviewCount} />
       ))}

        </div>
    </div>
  )
}

export default RelatedProducts
