import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Add = ({token}) => {
   
    const[image1,setImage1] = useState(false);
    const[image2,setImage2] = useState(false);
    const[image3,setImage3] = useState(false);
    const[image4,setImage4] = useState(false);

    const[name,setName] = useState("")
    const[description,setDescription] = useState("")
    const[price,setPrice] = useState("")
    const[category,setCategory] = useState("Men")
    const[subCategory,setSubCategory] = useState("Topwear")
    const[bestseller,setBestseller] = useState(false)
    const[sizes,setSizes] = useState([]);
    const[discountPercent,setDiscountPercent] = useState("")
    const[colors,setColors] = useState([]) // [{ name, hex }]
    const[colorName,setColorName] = useState("")
    const[colorHex,setColorHex] = useState("#000000")
    const[rating,setRating] = useState("")
    const[reviewCount,setReviewCount] = useState("")

    const addColor = () => {
        if (!colorName.trim()) return
        setColors(prev => [...prev, { name: colorName.trim(), hex: colorHex }])
        setColorName("")
    }

    const removeColor = (index) => {
        setColors(prev => prev.filter((_, i) => i !== index))
    }

    const onSubmitHandler = async (e) =>{
        e.preventDefault();

        try {
           const formData = new FormData()

           formData.append("name",name)
           formData.append("description",description)
           formData.append("price",price)
           formData.append("category",category)
           formData.append("subCategory",subCategory)
           formData.append("bestseller",bestseller)
           formData.append("sizes",JSON.stringify(sizes))
           formData.append("discountPercent",discountPercent || 0)
           formData.append("colors",JSON.stringify(colors))
           formData.append("rating",rating)
           formData.append("reviewCount",reviewCount || 0)

           image1 &&  formData.append("image1",image1)
           image2 &&  formData.append("image2",image2)
           image3 &&  formData.append("image3",image3)
           image4 &&  formData.append("image4",image4)

          const response = await axios.post(backendUrl + "/api/product/add",formData,{headers:{token}})
           console.log(response);

           if(response.data.success){
            toast.success(response.data.message)
            setName('')
            setDescription('')
            setImage1(false)
            setImage2(false)
            setImage3(false)
            setImage4(false)
           setPrice('')
           setDiscountPercent('')
           setColors([])
           setRating('')
           setReviewCount('')
           }

           else{
             toast.error(response.data.message)
           }

        } catch (error) {
          
          console.log(error)
          toast.error(error.message)

        }
    }


  const labelClass = 'text-sm font-medium text-gray-700 mb-1.5 block'
  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition'

  return (
    <div className='bg-white border border-gray-200 rounded-2xl p-6'>
      <h2 className='text-xl font-semibold text-gray-800 mb-5'>Add Product</h2>
      <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4' action="">
         <div>
            <p className={labelClass}>Upload Image</p>

            <div className='flex gap-3'>
              <label htmlFor="image1">
                <div className='w-20 h-20 rounded-lg border border-dashed border-gray-300 hover:border-green-400 transition overflow-hidden'>
                  <img className='w-full h-full object-cover cursor-pointer' src={ !image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
                </div>
                <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id='image1' hidden />
             </label>
              <label htmlFor="image2">
                <div className='w-20 h-20 rounded-lg border border-dashed border-gray-300 hover:border-green-400 transition overflow-hidden'>
                  <img className='w-full h-full object-cover cursor-pointer' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
                </div>
                <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id='image2' hidden />
              </label>
              <label htmlFor="image3">
                <div className='w-20 h-20 rounded-lg border border-dashed border-gray-300 hover:border-green-400 transition overflow-hidden'>
                  <img className='w-full h-full object-cover cursor-pointer' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
                </div>
                <input onChange={(e)=>setImage3(e.target.files[0])}  type="file" id='image3' hidden />
              </label>
              <label htmlFor="image4">
                <div className='w-20 h-20 rounded-lg border border-dashed border-gray-300 hover:border-green-400 transition overflow-hidden'>
                  <img className='w-full h-full object-cover cursor-pointer' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
                </div>
                <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id='image4' hidden />
              </label>
            </div>
         </div>

         <div className='w-full max-w-125'>
           <p className={labelClass}>Product Name</p>
           <input onChange={(e)=>setName(e.target.value)} value={name}  className={inputClass} type="text" placeholder='Type here'  required/>
         </div>
          <div className='w-full max-w-125'>
           <p className={labelClass}>Product description</p>
           <textarea onChange={(e)=>setDescription(e.target.value)}  value={description} rows={3} className={inputClass} placeholder='Write content here'  required/>
         </div>

          <div className='flex flex-wrap gap-4 w-full'>
              <div className='w-36'>
                 <p className={labelClass}>Product Category</p>
                  <select onChange={(e)=>setCategory(e.target.value)}  value={category} className={inputClass}>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
              </div>

                <div className='w-36'>
                 <p className={labelClass}>Sub Category</p>
                  <select onChange={(e)=>setSubCategory(e.target.value)}  value={subCategory} className={inputClass}>
                    <option value="Topwear">Topwear</option>
                    <option value="Bottomwear">Bottomwear</option>
                    <option value="Winterwear">Winterwear</option>
                  </select>
              </div>

              <div className='w-28'>
                 <p className={labelClass}>Product price</p>
                  <input onChange={(e)=>setPrice(e.target.value)}  value={price} className={inputClass} type="Number" placeholder='25' />
              </div>

              <div className='w-28'>
                 <p className={labelClass}>Discount %</p>
                  <input onChange={(e)=>setDiscountPercent(e.target.value)}  value={discountPercent} className={inputClass} type="Number" min="0" max="90" placeholder='0' />
              </div>

              <div className='w-28'>
                 <p className={labelClass}>Rating (optional)</p>
                  <input onChange={(e)=>setRating(e.target.value)}  value={rating} className={inputClass} type="Number" min="0" max="5" step="0.1" placeholder='e.g. 4.2' />
              </div>

              <div className='w-28'>
                 <p className={labelClass}>Review Count</p>
                  <input onChange={(e)=>setReviewCount(e.target.value)}  value={reviewCount} className={inputClass} type="Number" min="0" placeholder='0' />
              </div>
          </div>

          <div className='w-full'>
             <p className={labelClass}>Colors (optional)</p>
             <div className='flex flex-wrap items-center gap-2 mb-2'>
                <input onChange={(e)=>setColorName(e.target.value)} value={colorName} className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition' type="text" placeholder='Color name e.g. Charcoal' />
                <input onChange={(e)=>setColorHex(e.target.value)} value={colorHex} className='w-9 h-9 p-0 border border-gray-300 rounded-lg cursor-pointer' type="color" />
                <button type='button' onClick={addColor} className='px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer'>Add Color</button>
             </div>
             {colors.length > 0 && (
               <div className='flex flex-wrap gap-2'>
                 {colors.map((c, i) => (
                   <span key={i} className='flex items-center gap-2 px-2.5 py-1 border border-gray-200 rounded-full text-sm bg-gray-50'>
                     <span className='w-3.5 h-3.5 rounded-full border border-gray-300' style={{ backgroundColor: c.hex }}></span>
                     {c.name}
                     <span onClick={()=>removeColor(i)} className='text-red-500 cursor-pointer font-medium'>×</span>
                   </span>
                 ))}
               </div>
             )}
          </div>
          <div>
             <p className={labelClass}>Product Sizes</p>
              <div className='flex gap-2'>
                {["S", "M", "L", "XL", "XLL"].map(size => (
                  <button
                    type='button'
                    key={size}
                    onClick={()=>setSizes(prev =>prev.includes(size) ? prev.filter(item =>item !== size) : [...prev,size])}
                    className={`w-10 h-10 rounded-lg text-sm font-medium cursor-pointer transition ${sizes.includes(size) ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
          </div>
          <label className='flex items-center gap-2 mt-2 cursor-pointer w-fit'>
            <input onChange={() => setBestseller(prev => !prev)} checked = {bestseller} type="checkbox" className='w-4 h-4 accent-green-700' />
            <span className='text-sm text-gray-700'>Add to bestseller</span>
          </label>
          <button type='submit' className='px-6 py-2.5 mt-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-full cursor-pointer transition'>Add Product</button>
      </form>
    </div>

  )
}

export default Add
