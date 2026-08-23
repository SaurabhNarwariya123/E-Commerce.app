import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title.jsx";
import ProductItem from "./ProductItem.jsx";
import { ProductGridSkeleton } from "./ui/Skeleton";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller ] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products && products.length > 0) {
      const bestProduct = products.filter((item) => (item.bestseller));
      setBestSeller(bestProduct.slice(0, 5));
      setLoading(false);
    }
  }, [products]);

  return (
    <div className="my-16">
      <div className="text-center py-8">
        <Title text1={"BEST"} text2={"SELLERS"} />

        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-500">
          The pieces our customers keep coming back for — quality that speaks
          for itself.
        </p>
      </div>
       {/* Rendering products */}

       {loading ? (
         <ProductGridSkeleton count={5} />
       ) : (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8">
          {
              bestSeller.map((item,index) => (
                  <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} discountPercent={item.discountPercent} colors={item.colors} rating={item.rating} reviewCount={item.reviewCount}/>
              ))

           }
         </div>
       )}

    </div>
  )
}

export default BestSeller;
