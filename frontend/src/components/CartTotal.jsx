import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'

export const CartTotal = ({ onCouponChange }) => {

    const {currency , freeDeliveryThreshold, getCartAmount, getDeliveryFee, backendUrl, token} = useContext(ShopContext);
    const cartAmount = getCartAmount();
    const deliveryFee = getDeliveryFee();

    const [couponInput, setCouponInput] = useState('')
    const [applying, setApplying]       = useState(false)
    const [applied, setApplied]         = useState(null) // { code, discount }

    const applyCoupon = async () => {
        if (!couponInput.trim()) return
        if (!token) { toast.error('Please login to apply a coupon'); return }
        setApplying(true)
        try {
            const res = await axios.post(
                backendUrl + '/api/coupon/apply',
                { code: couponInput.trim(), amount: cartAmount },
                { headers: { Authorization: `Bearer ${token}`, token } }
            )
            if (res.data.success) {
                const result = { code: res.data.code, discount: res.data.discount }
                setApplied(result)
                onCouponChange?.(result)
                toast.success(`Coupon applied! You saved ${currency}${res.data.discount}`)
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply coupon')
        }
        setApplying(false)
    }

    const removeCoupon = () => {
        setApplied(null)
        setCouponInput('')
        onCouponChange?.(null)
    }

    const discount = applied?.discount || 0
    const total = cartAmount === 0 ? 0 : cartAmount + deliveryFee - discount

  return (
    <div className='w-full'>
        <div className='text-2xl'>
          <Title text1={'CART'} text2={'TOTALS'}/>
        </div>

        {cartAmount > 0 && (
          <div className='mt-4'>
            {applied ? (
              <div className='flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm'>
                <span className='text-green-700 font-medium'>✅ {applied.code} applied — saved {currency}{applied.discount}</span>
                <button type='button' onClick={removeCoupon} className='text-xs text-red-500 hover:underline cursor-pointer'>Remove</button>
              </div>
            ) : (
              <div className='flex gap-2'>
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder='Coupon code'
                  className='flex-1 border border-beige rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition uppercase'
                />
                <button
                  type='button'
                  onClick={applyCoupon}
                  disabled={applying || !couponInput.trim()}
                  className='px-4 py-2 text-sm rounded-lg bg-charcoal text-white disabled:opacity-50 cursor-pointer'
                >
                  {applying ? '...' : 'Apply'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className='flex flex-col gap-3 mt-4 text-sm text-gray-600'>
          <div className='flex justify-between'>
            <p>Subtotal</p>
            <p> {currency}{cartAmount}.00</p>

          </div>
          <hr className='border-beige' />
          {discount > 0 && (
            <>
              <div className='flex justify-between text-green-700'>
                <p>Coupon Discount</p>
                <p>-{currency}{discount}</p>
              </div>
              <hr className='border-beige' />
            </>
          )}
          <div className='flex justify-between'>
            <p>Shipping Fee</p>
            <p className={deliveryFee === 0 && cartAmount > 0 ? 'text-gold-dark font-semibold' : ''}>{deliveryFee === 0 && cartAmount > 0 ? 'FREE' : `${currency} ${deliveryFee}`}</p>

          </div>
          <hr className='border-beige' />
        <div className='flex justify-between text-charcoal'>
            <b>Total</b>
            <b>{currency}{total}</b>

          </div>
        </div>

        {cartAmount > 0 && cartAmount < freeDeliveryThreshold && (
          <p className='text-xs text-gray-500 mt-3'>
            Add {currency}{freeDeliveryThreshold - cartAmount} more for free delivery
          </p>
        )}
        {cartAmount >= freeDeliveryThreshold && (
          <p className='text-xs text-gold-dark mt-3'>🎉 Free delivery unlocked</p>
        )}
    </div>
  )
}
