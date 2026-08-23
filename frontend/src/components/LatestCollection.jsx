import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { ProductGridSkeleton } from "./ui/Skeleton";



const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts,setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products && products.length > 0) {
      setLatestProducts(products.slice(0, 10));
      setLoading(false);
    }
  }, [products]);


  return (
    <div id='latest-collection' className="my-16 scroll-mt-24">
      <div className="text-center py-8">
        <Title text1={"LATEST"} text2={"COLLECTION"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-500">
          Fresh in — curated fabrics and silhouettes for the season, made to last
          and made to be worn.
        </p>
      </div>
      {/* Rendering products */}

      {loading ? (
        <ProductGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
          {
              latestProducts.map((item,index) => (
                  <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} discountPercent={item.discountPercent} colors={item.colors} rating={item.rating} reviewCount={item.reviewCount}/>
              ))

           }
        </div>
      )}
    </div>
  )
}

export default LatestCollection;
