import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'

const DISMISS_KEY = 'promoBannerDismissedAt'
const DISMISS_HOURS = 24

const PromoBanner = () => {
  const { currency, freeDeliveryThreshold } = useContext(ShopContext)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
    const hoursSince = (Date.now() - dismissedAt) / (1000 * 60 * 60)
    setVisible(hoursSince > DISMISS_HOURS)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className='relative flex items-center justify-center gap-3 bg-charcoal text-ivory text-xs sm:text-sm tracking-wide py-2.5 px-8 text-center'>
      <span>
        🎁 Festival season is here — enjoy special offers &amp; free shipping on orders over {currency}{freeDeliveryThreshold}.
      </span>
      <button
        onClick={dismiss}
        aria-label='Dismiss announcement'
        className='absolute right-3 text-ivory/70 hover:text-ivory text-lg leading-none cursor-pointer'
      >
        &times;
      </button>
    </div>
  )
}

export default PromoBanner
