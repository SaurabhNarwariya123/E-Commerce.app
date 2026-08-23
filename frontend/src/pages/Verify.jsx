import React, { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success')
  const orderId = searchParams.get('orderId')

  const verifyPayment = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/verifyStripe`,
        { success, orderId },
        { headers: { Authorization: `Bearer ${token}`, token } }
      )

      if (res.data.success) {
        setCartItems({})
        navigate('/orders')
      } else {
        navigate('/cart')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message || 'Payment verification failed')
      navigate('/cart')
    }
  }

  useEffect(() => {
    if (token && success && orderId) {
      verifyPayment()
    }
  }, [token, success, orderId])

  return (
    <div className='flex flex-col items-center justify-center gap-4 min-h-[50vh]'>
      <div className='animate-spin w-8 h-8 border-4 border-beige border-t-gold rounded-full'></div>
      <p className='text-sm text-gray-500'>Verifying your payment...</p>
    </div>
  )
}

export default Verify