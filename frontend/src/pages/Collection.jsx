import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import { ProductGridSkeleton } from '../components/ui/Skeleton';

const Collection = () => {
  const {products ,search, showSearch, currency}  = useContext(ShopContext);
  const [showFilter , setShowFilter] = useState(false);
  const [filterProducts , setFilterProducts] = useState([]);
  const [category ,setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');
  const maxProductPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000;
  const [maxPrice, setMaxPrice] = useState(maxProductPrice);

  useEffect(() => {
    setMaxPrice(maxProductPrice);
  }, [maxProductPrice]);


  const toggleCategory = (e) =>{
          if(category.includes(e.target.value)){
               setCategory(prev => prev.filter (item => item != e.target.value)) //
          }

          else{
            setCategory( prev => [...prev,e.target.value])
          }
  }

   const toggleSubCategory = (e) =>{
    if(subCategory.includes(e.target.value)){
        setSubCategory(prev => prev.filter (item => item != e.target.value)) //
        }

    else{
          setSubCategory( prev => [...prev,e.target.value])
      }
   }

    const applyfilter = () =>{
       let productsCopy = products.slice();

       if(showSearch && search) {
           productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
       }

       if(category.length > 0){
          productsCopy = productsCopy.filter (item => category.includes(item.category));

       }
       if(subCategory.length > 0){
        productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));

     }

       productsCopy = productsCopy.filter(item => item.price <= maxPrice);

       setFilterProducts(productsCopy)
    }

      const sortProduct = () => {
         let fpCopy = filterProducts.slice();
          switch (sortType) {
            case  "low-high":
               setFilterProducts(fpCopy.sort((a,b) => (a.price - b.price)));
             break;

             case  "high-low":
               setFilterProducts(fpCopy.sort((a,b) => (b.price - a.price)));
             break;

            default:
              applyfilter();
              break;
          }
      }
    //   useEffect(()=>{
    //    setFilterProducts(products);
    //  },[])

     useEffect(()=>{
       applyfilter();
    },[category,subCategory ,search,showSearch,products,maxPrice])

    useEffect(()=>{
       sortProduct();
      },[sortType])

  const loading = products.length === 0

  return (
    <div className='flex flex-col sm:flex-row gap-6 sm:gap-10 pt-10 border-t border-beige'>

        {/* filter Options  */}

        <div className='min-w-60'>
          <p onClick={ () => setShowFilter(!showFilter)} className='my-2 text-xl prata-regular text-charcoal flex items-center cursor-pointer gap-2'>Filters
            <img className = {`h-3 sm:hidden transition-transform ${showFilter ? 'rotate-90' : ''} `} src={assets.dropdown_icon} alt="" />
          </p>


           {/* category Filter */}
           <div className={`border border-beige rounded-xl pl-5 py-4 mt-6 ${ showFilter ? '' : 'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium text-charcoal tracking-wide'>CATEGORIES</p>
             <div className='flex flex-col gap-2.5 text-sm font-light text-gray-600'>

                <label className='flex items-center gap-2 cursor-pointer w-fit'>
                  <input  className = 'accent-gold w-3.5 h-3.5' type="checkbox" value={'Men'} onChange={toggleCategory}/> Men
                </label>

                <label className='flex items-center gap-2 cursor-pointer w-fit'>
                  <input  className = 'accent-gold w-3.5 h-3.5' type="checkbox" value={'Women'} onChange={toggleCategory} /> Women
                </label>

                <label className='flex items-center gap-2 cursor-pointer w-fit'>
                  <input  className = 'accent-gold w-3.5 h-3.5' type="checkbox" value={'Kids'} onChange={toggleCategory} /> Kids
                </label>


             </div>
           </div>
           {/* SubCategory Filter */}

           <div className={`border border-beige rounded-xl pl-5 py-4 mt-5 ${ showFilter ? '' : 'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium text-charcoal tracking-wide'>TYPE</p>
             <div className='flex flex-col gap-2.5 text-sm font-light text-gray-600'>
                <label className='flex items-center gap-2 cursor-pointer w-fit'>
                  <input  className = 'accent-gold w-3.5 h-3.5' type="checkbox" value={'Topwear'} onChange={toggleSubCategory} /> Topwear
                </label>

                <label className='flex items-center gap-2 cursor-pointer w-fit'>
                  <input  className = 'accent-gold w-3.5 h-3.5' type="checkbox" value={'Bottomwear'} onChange={toggleSubCategory}/> Bottomwear
                </label>

                <label className='flex items-center gap-2 cursor-pointer w-fit'>
                  <input  className = 'accent-gold w-3.5 h-3.5' type="checkbox" value={'Winterwear'}  onChange={toggleSubCategory}/> Winterwear
                </label>


             </div>
           </div>

           {/* Price Range Filter */}

           <div className={`border border-beige rounded-xl pl-5 pr-4 py-4 mt-5 ${ showFilter ? '' : 'hidden'} sm:block`}>
            <p className='mb-3 text-sm font-medium text-charcoal tracking-wide'>PRICE</p>
            <input
              type='range'
              min='0'
              max={maxProductPrice}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className='w-full accent-gold cursor-pointer'
            />
            <div className='flex items-center justify-between text-xs text-gray-500 mt-1'>
              <span>{currency}0</span>
              <span className='text-charcoal font-medium'>Up to {currency}{maxPrice}</span>
            </div>
           </div>
        </div>

        {/* Right Side */}

         <div className='flex-1'>

          <div className='flex justify-between items-center mb-6' >

           <Title text1={"ALL"} text2={'COLLECTION'}/>

           {/* Product Sort */}

            <select  onChange = {(e) => setSortType(e.target.value)} className='border border-beige rounded-full text-sm px-4 py-2 text-gray-600 focus:outline-none focus:border-gold transition-colors'>
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>

            </select>
          </div>

          {/* Map Product*/}

          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : (
           <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-8'>
               {
                 filterProducts.map((item,index)=>(
                  <ProductItem key={index}  name={item.name} id={item._id} price={item.price} image={item.image} discountPercent={item.discountPercent} colors={item.colors} rating={item.rating} reviewCount={item.reviewCount} />

                 ))
               }
           </div>
          )}
         </div>
    </div>
  )
}

export default Collection
