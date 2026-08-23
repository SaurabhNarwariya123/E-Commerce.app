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


  return (
    <form onSubmit={onSubmitHandler} className = 'flex flex-col w-full items-start gap-3' action="">
       <div>
          <p className='mb-2'>Upload Image</p>

          <div className=' flex gap-2 '>
            <label htmlFor="image1">
              <img className='w-20 cursor-pointer' src={ !image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
              <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id='image1' hidden />
           </label>
            <label htmlFor="image2">
              <img  className='w-20 cursor-pointer' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id='image2' hidden />
            </label>
            <label htmlFor="image3">
              <img className='w-20 cursor-pointer'src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
              <input onChange={(e)=>setImage3(e.target.files[0])}  type="file" id='image3' hidden />
            </label>
            <label htmlFor="image4">
              <img className='w-20 cursor-pointer' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id='image4' hidden />
            </label>
          </div>
       </div>

       <div className='w-full'>
         <p className='mb-2'>Product Name</p>
         <input onChange={(e)=>setName(e.target.value)} value={name}  className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here'  required/>
       </div>
        <div className='w-full'>
         <p className='mb-2'>Product description</p>
         <textarea onChange={(e)=>setDescription(e.target.value)}  value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Write content here'  required/>
       </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
            <div >
               <p className='mb-2'>Product Category</p>
                <select onChange={(e)=>setCategory(e.target.value)}  value={category} className='w-full px-3 py-2'>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
            </div>

              <div>
               <p className='mb-2'>Sub Category</p>
                <select onChange={(e)=>setSubCategory(e.target.value)}  value={subCategory} className='w-full px-3 py-2'>
                  <option value="Topwear">Topwear</option>
                  <option value="Bottomwear">Bottomwear</option>
                  <option value="Winterwear">Winterwear</option>
                </select>
            </div>

            <div>
               <p className='mb-2'>Product price</p>
                <input onChange={(e)=>setPrice(e.target.value)}  value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' />
            </div>

            <div>
               <p className='mb-2'>Discount %</p>
                <input onChange={(e)=>setDiscountPercent(e.target.value)}  value={discountPercent} className='w-full px-3 py-2 sm:w-[120px]' type="Number" min="0" max="90" placeholder='0' />
            </div>

            <div>
               <p className='mb-2'>Rating (optional)</p>
                <input onChange={(e)=>setRating(e.target.value)}  value={rating} className='w-full px-3 py-2 sm:w-[100px]' type="Number" min="0" max="5" step="0.1" placeholder='e.g. 4.2' />
            </div>

            <div>
               <p className='mb-2'>Review Count</p>
                <input onChange={(e)=>setReviewCount(e.target.value)}  value={reviewCount} className='w-full px-3 py-2 sm:w-[120px]' type="Number" min="0" placeholder='0' />
            </div>
        </div>

        <div className='w-full'>
           <p className='mb-2'>Colors (optional)</p>
           <div className='flex flex-wrap items-center gap-2 mb-2'>
              <input onChange={(e)=>setColorName(e.target.value)} value={colorName} className='px-3 py-2' type="text" placeholder='Color name e.g. Charcoal' />
              <input onChange={(e)=>setColorHex(e.target.value)} value={colorHex} className='w-12 h-9 p-0 border rounded cursor-pointer' type="color" />
              <button type='button' onClick={addColor} className='px-4 py-2 bg-slate-200 rounded cursor-pointer'>Add Color</button>
           </div>
           {colors.length > 0 && (
             <div className='flex flex-wrap gap-2'>
               {colors.map((c, i) => (
                 <span key={i} className='flex items-center gap-2 px-2 py-1 border rounded-full text-sm'>
                   <span className='w-4 h-4 rounded-full border' style={{ backgroundColor: c.hex }}></span>
                   {c.name}
                   <span onClick={()=>removeColor(i)} className='text-red-500 cursor-pointer'>×</span>
                 </span>
               ))}
             </div>
           )}
        </div>
        <div>
           <p className='mb-2'>Product Sizes</p>
            <div className='flex gap-3 '>
               <div onClick={()=>setSizes(prev =>prev.includes("S") ? prev.filter(item =>item !== "S") : [...prev,"S"])}>
                 <p className={`${sizes.includes("S") ? "bg-pink-300" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded`}>S</p>
               </div>
               
               <div onClick={()=>setSizes(prev =>prev.includes("M") ? prev.filter(item =>item !== "M") : [...prev ,"M"])}>
                <p  className={`${sizes.includes("M") ? "bg-pink-300" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded`}>M</p>
               </div>
              <div onClick={()=>setSizes(prev =>prev.includes("L") ? prev.filter(item =>item !== "L") : [...prev ,"L"])}>
                <p className= {`${sizes.includes("L") ? "bg-pink-300" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded `}>L</p>
              </div>
               <div onClick={()=>setSizes(prev =>prev.includes("XL") ? prev.filter(item =>item !== "XL") : [...prev ,"XL"])}>
                <p  className={`${sizes.includes("XL") ? "bg-pink-300" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded `}>XL</p>
              </div>
               <div onClick={()=>setSizes(prev =>prev.includes("XLL") ? prev.filter(item =>item !== "XLL") : [...prev ,"XLL"])}>
                <p  className={`${sizes.includes("XLL") ? "bg-pink-300" : "bg-slate-200"} px-3 py-1 cursor-pointer rounded `}>XLL</p>
              </div>

            </div>
        </div>
        <div className='flex gap-2 mt-2'>
          <input onChange={() => setBestseller(prev => !prev)} checked = {bestseller} type="checkbox"  id="bestseller" />
          <label  className = "cursor-pointer " htmlFor="bestseller">Add to bestseller</label>
        </div>
        <button type='submit' className='w-28 py-3 mt-4 bg-green-700 hover:bg-green-800 text-white rounded-xl cursor-pointer transition'>ADD</button>
    </form>

  )
}

export default Add
