import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { EyeIcon, EditIcon, TrashIcon, IconButton } from '../components/Icons'
import Pagination, { usePagination } from '../components/Pagination'

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

   const { page, setPage, totalPages, pageItems, start } = usePagination(list, 10)

  return (
    <>
  <div className='flex items-center justify-between mb-4'>
    <div>
      <h1 className='text-xl font-semibold text-[var(--adm-ink)]'>All Product List</h1>
      <p className='text-xs text-[var(--adm-muted)] mt-0.5'>{list.length} product{list.length !== 1 ? 's' : ''}</p>
    </div>
    <button
      onClick={() => navigate('/admin/add')}
      className='btn btn-primary'
    >
      + Add Item
    </button>
  </div>

  <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden'>
    {list.length === 0 ? (
      <p className='text-center text-[var(--adm-muted)] py-12 text-sm'>No products found</p>
    ) : (
      <>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Image</th>
              <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Name</th>
              <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Category</th>
              <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Price</th>
              <th className='px-3 py-2.5 text-left text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Discount</th>
              <th className='px-3 py-2.5 text-right text-xs font-semibold text-[var(--adm-muted)] uppercase tracking-wide'>Action</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {pageItems.map((item) => (
              <tr key={item._id} className='hover:bg-gray-50 transition'>
                <td className='px-3 py-2'>
                  <img className='w-12 h-12 object-cover rounded-lg' src={item.image[0]} alt={item.name} />
                </td>
                <td className='px-3 py-2 font-medium text-[var(--adm-ink)]'>{item.name}</td>
                <td className='px-3 py-2 text-[var(--adm-muted)]'>{item.category}</td>
                <td className='px-3 py-2 text-[var(--adm-ink)]'>{currency}{item.price}</td>
                <td className='px-3 py-2'>
                  {item.discountPercent
                    ? <span className='text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium'>{item.discountPercent}%</span>
                    : <span className='text-[var(--adm-muted)]'>-</span>}
                </td>
                <td className='px-3 py-2'>
                  <div className='flex items-center justify-end gap-2'>
                    <IconButton variant='view' onClick={()=> navigate(`/admin/product/${item._id}`)} aria-label='View product' title='View'>
                      <EyeIcon />
                    </IconButton>
                    <IconButton variant='edit' onClick={()=> openEdit(item)} aria-label='Edit product' title='Edit'>
                      <EditIcon />
                    </IconButton>
                    <IconButton variant='delete' onClick={()=> removeProduct(item._id)} aria-label='Delete product' title='Delete'>
                      <TrashIcon />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={list.length} pageSize={10} start={start} />
      </>
    )}
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
            <button type='button' onClick={addColor} className='btn btn-secondary'>Add</button>
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
          <button onClick={closeEdit} className='btn btn-secondary'>Cancel</button>
          <button onClick={saveEdit} disabled={saving} className='btn btn-primary'>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )}
</>

  )
}

export default List
