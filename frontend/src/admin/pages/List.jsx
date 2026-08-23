import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({token}) => {
  const navigate = useNavigate()

  const [list,setList] = useState([])
  const [editItem, setEditItem] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [editDiscount, setEditDiscount] = useState('')
  const [editBestseller, setEditBestseller] = useState(false)
  const [editColors, setEditColors] = useState([])
  const [colorName, setColorName] = useState('')
  const [colorHex, setColorHex] = useState('#000000')
  const [editRating, setEditRating] = useState('')
  const [editReviewCount, setEditReviewCount] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchList = async() => {

    try {

      const response = await axios.get(backendUrl + '/api/product/list')
        // console.log(response.data)
      if(response.data.success){
        setList(response.data.products);
      }

      else{
        toast.error(response.data.message)
      }

     }
    catch (error) {
       console.log(error)
         toast.error(error.message)
    }

  }

   const removeProduct = async(id) => {
     try {

      const response = await axios.post(backendUrl + '/api/product/remove' , {id} , {headers : {token}})

      if(response.data.success)
      {
         toast.success(response.data.message)
         await fetchList();
      }
      else{
        toast.error(response.data.message)
      }
     } catch (error) {
         console.log(error)
         toast.error(error.message)
     }
   }

   const openEdit = (item) => {
     setEditItem(item)
     setEditPrice(item.price)
     setEditDiscount(item.discountPercent || 0)
     setEditBestseller(!!item.bestseller)
     setEditColors(item.colors || [])
     setEditRating(item.rating ?? '')
     setEditReviewCount(item.reviewCount || 0)
   }

   const closeEdit = () => {
     setEditItem(null)
     setColorName('')
     setColorHex('#000000')
   }

   const addColor = () => {
     if (!colorName.trim()) return
     setEditColors(prev => [...prev, { name: colorName.trim(), hex: colorHex }])
     setColorName('')
   }

   const removeColor = (index) => {
     setEditColors(prev => prev.filter((_, i) => i !== index))
   }

   const saveEdit = async () => {
     if (!editItem) return
     setSaving(true)
     try {
       const response = await axios.post(backendUrl + '/api/product/update', {
         id: editItem._id,
         price: editPrice,
         discountPercent: editDiscount,
         bestseller: editBestseller,
         colors: JSON.stringify(editColors),
         rating: editRating,
         reviewCount: editReviewCount,
       }, { headers: { token } })

       if (response.data.success) {
         toast.success(response.data.message)
         await fetchList()
         closeEdit()
       } else {
         toast.error(response.data.message)
       }
     } catch (error) {
       console.log(error)
       toast.error(error.message)
     } finally {
       setSaving(false)
     }
   }

   useEffect(()=>{
     fetchList()
   },[])


  return (
    <>
  <div className='flex items-center justify-between mb-2'>
    <p>All Product List</p>
    <button
      onClick={() => navigate('/admin/add')}
      className='bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-full transition cursor-pointer'
    >
      + Add Item
    </button>
  </div>
  <div className='flex flex-col gap-2'>
    <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
      <b>Image</b>
      <b>Name</b>
      <b>Category</b>
      <b>Price</b>
      <b className='text-center'>Discount</b>
      <b className='text-center'>Action</b>
    </div>

    {list.map((item, index) => (
      <div key={index} className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border text-sm'>
        <img className='w-12 h-12 object-cover' src={item.image[0]} alt={item.name} />
        <p>{item.name}</p>
        <p>{item.category}</p>
        <p>{currency}{item.price}</p>
        <p className='text-center'>{item.discountPercent ? `${item.discountPercent}%` : '-'}</p>
        <div className='flex items-center justify-center gap-3'>
          <p onClick={()=> openEdit(item)} className='text-blue-600 cursor-pointer'>Edit</p>
          <p onClick={()=> removeProduct(item._id)} className='text-red-500 cursor-pointer'>X</p>
        </div>
      </div>
    ))}
  </div>

  {editItem && (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={closeEdit}>
      <div className='bg-white rounded-xl p-6 w-full max-w-md flex flex-col gap-4' onClick={(e)=>e.stopPropagation()}>
        <h2 className='text-lg font-semibold'>Edit {editItem.name}</h2>

        <div>
          <p className='mb-1 text-sm'>Price</p>
          <input type='number' className='w-full px-3 py-2 border rounded' value={editPrice} onChange={(e)=>setEditPrice(e.target.value)} />
        </div>

        <div>
          <p className='mb-1 text-sm'>Discount %</p>
          <input type='number' min='0' max='90' className='w-full px-3 py-2 border rounded' value={editDiscount} onChange={(e)=>setEditDiscount(e.target.value)} />
        </div>

        <div className='flex gap-3'>
          <div className='flex-1'>
            <p className='mb-1 text-sm'>Rating</p>
            <input type='number' min='0' max='5' step='0.1' className='w-full px-3 py-2 border rounded' placeholder='e.g. 4.2' value={editRating} onChange={(e)=>setEditRating(e.target.value)} />
          </div>
          <div className='flex-1'>
            <p className='mb-1 text-sm'>Review Count</p>
            <input type='number' min='0' className='w-full px-3 py-2 border rounded' value={editReviewCount} onChange={(e)=>setEditReviewCount(e.target.value)} />
          </div>
        </div>

        <div>
          <p className='mb-1 text-sm'>Colors</p>
          <div className='flex flex-wrap items-center gap-2 mb-2'>
            <input value={colorName} onChange={(e)=>setColorName(e.target.value)} className='px-3 py-2 border rounded' type='text' placeholder='Color name' />
            <input value={colorHex} onChange={(e)=>setColorHex(e.target.value)} className='w-12 h-9 p-0 border rounded cursor-pointer' type='color' />
            <button type='button' onClick={addColor} className='px-3 py-2 bg-slate-200 rounded cursor-pointer'>Add</button>
          </div>
          {editColors.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {editColors.map((c, i) => (
                <span key={i} className='flex items-center gap-2 px-2 py-1 border rounded-full text-sm'>
                  <span className='w-4 h-4 rounded-full border' style={{ backgroundColor: c.hex }}></span>
                  {c.name}
                  <span onClick={()=>removeColor(i)} className='text-red-500 cursor-pointer'>×</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <label className='flex items-center gap-2 text-sm cursor-pointer w-fit'>
          <input type='checkbox' checked={editBestseller} onChange={()=>setEditBestseller(prev=>!prev)} /> Bestseller
        </label>

        <div className='flex justify-end gap-2 mt-2'>
          <button onClick={closeEdit} className='px-4 py-2 rounded border cursor-pointer'>Cancel</button>
          <button onClick={saveEdit} disabled={saving} className='px-4 py-2 rounded bg-green-700 hover:bg-green-800 text-white cursor-pointer disabled:opacity-50 transition'>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )}
</>

  )
}

export default List
