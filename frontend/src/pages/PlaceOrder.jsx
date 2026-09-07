import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import { CartTotal } from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import { reverseGeocode } from '../utils/geocoding'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import axios from 'axios';
import { toast } from 'react-toastify'

// ✅ Confirmation Modal Component
const OrderConfirmationModal = ({ isOpen, orderData, onClose }) => {
  if (!isOpen || !orderData) return null;

  return (
    <div className='fixed inset-0 bg-charcoal/60 flex items-center justify-center z-50 px-4'>
      <div className='bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl'>
        <div className='text-center'>
          {/* Success Icon */}
          <div className='mb-3 flex justify-center'>
            <div className='bg-beige-light rounded-full p-3'>
              <svg className='w-7 h-7 text-charcoal' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
            </div>
          </div>

          <h2 className='prata-regular text-xl text-charcoal mb-1'>Order Confirmed!</h2>
          <p className='text-sm text-gray-500 mb-4'>Your order has been placed successfully</p>

          {/* Compact order details */}
          <div className='bg-beige-light/60 rounded-xl p-4 mb-4 text-left space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Order ID</span>
              <span className='font-mono font-bold text-charcoal'>{orderData.orderId?.slice(-8).toUpperCase()}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Amount</span>
              <span className='font-bold text-charcoal'>₹{orderData.amount}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Items</span>
              <span className='font-semibold text-charcoal'>{orderData.itemCount} item(s)</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-500'>Payment</span>
              <span className='font-semibold text-charcoal'>Cash on Delivery</span>
            </div>
            <div className='pt-2 border-t border-beige'>
              <p className='text-gray-500 mb-0.5'>Delivery to</p>
              <p className='font-medium text-charcoal'>
                {orderData.address?.firstName} {orderData.address?.lastName} · {orderData.address?.phone}
              </p>
              <p className='text-gray-500 text-xs mt-0.5'>
                {orderData.address?.street}, {orderData.address?.city} {orderData.address?.zipcode}
              </p>
            </div>
          </div>

          <Button variant='primary' size='lg' className='w-full' onClick={onClose}>
            View My Orders
          </Button>
        </div>
      </div>
    </div>
  );
};

const PlaceOrder = () => {

    const [method , setMethod] = useState('cod');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationData, setConfirmationData] = useState(null);
    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddrId, setSelectedAddrId] = useState(null)
    const [locationStatus, setLocationStatus] = useState('idle') // idle | loading | success | denied | error
    const [isGift, setIsGift] = useState(false)
    const [giftMessage, setGiftMessage] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null) // { code, discount }
    const {navigate ,backendUrl, token , cartItems, setCartItems,getCartAmount,getDeliveryFee,products} = useContext(ShopContext);
    const[formData,setFormData] = useState({
       firstName:'',
       lastName:'',
       street:'',
       city:'',
       state:'',
       zipcode:'',
       country:'',
       phone:'',
       lat: null,
       lng: null,
    })

    // Load saved addresses
    useEffect(() => {
        if (!token) return
        axios.post(backendUrl + '/api/user/addresses', {}, {
            headers: { Authorization: `Bearer ${token}`, token }
        }).then(res => {
            if (res.data.success) setSavedAddresses(res.data.addresses || [])
        }).catch(() => {})
    }, [token])

    // Fill form from a saved address
    const applyAddress = (addr) => {
        setSelectedAddrId(addr._id)
        setFormData(f => ({
            ...f,
            firstName: addr.firstName || '',
            lastName:  addr.lastName  || '',
            street:    addr.street    || '',
            city:      addr.city      || '',
            state:     addr.state     || '',
            zipcode:   addr.zipcode   || '',
            country:   addr.country   || '',
            phone:     addr.phone     || '',
        }))
    }

     const onChangeHandler = (event) =>{
       const name = event.target.name;
       const value = event.target.value;
       setSelectedAddrId(null) // user is editing manually
       setFormData(data => ({...data,[name]:value}))
     }

    // ── Share Location: capture GPS position → reverse-geocode → auto-fill address ──
    const shareLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('error')
            toast.error('Geolocation is not supported by your browser')
            return
        }

        setLocationStatus('loading')

        // Some browsers/embedded webviews never invoke either geolocation callback
        // (e.g. blocked by a Permissions-Policy) — guard with our own timeout so the
        // button never gets stuck on "Locating..." with no feedback.
        let settled = false
        const safetyTimer = setTimeout(() => {
            if (settled) return
            settled = true
            setLocationStatus('error')
            toast.error('Location request timed out. Please check your browser location permission and try again.')
        }, 15000)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                if (settled) return
                settled = true
                clearTimeout(safetyTimer)
                const { latitude, longitude } = position.coords
                try {
                    const address = await reverseGeocode(latitude, longitude)
                    setSelectedAddrId(null)
                    setFormData(f => ({ ...f, ...address, lat: latitude, lng: longitude }))
                    setLocationStatus('success')
                    toast.success('Location detected — address filled in below')
                } catch {
                    setLocationStatus('error')
                    toast.error('Got your location, but could not resolve an address from it. Please fill it in manually.')
                }
            },
            (error) => {
                if (settled) return
                settled = true
                clearTimeout(safetyTimer)
                setLocationStatus(error.code === 1 ? 'denied' : 'error')
                if (error.code !== 1) {
                    toast.error(error.message || 'Could not detect your location. Please try again or enter it manually.')
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

       const initPay = (order)=>{
        const options = {
           key:import.meta.env.VITE_RAZORPAY_KEY_ID,
           amount:order.amount,
           currency:order.currency,
           name:'Order Payment',
           description :'Order Payment',
           order_id:order.id,
           receipt:order.receipt,
           handler:async(response)=>{
            console.log(response)
             try {
               const {data} = await axios.post(backendUrl + '/api/order/verifyRazorpay', response , {headers:{Authorization: `Bearer ${token}`, token}})
                if(data.success){
                  toast.success('✓ Payment successful! Order confirmed.')
                  setCartItems({})
                  navigate('/orders')
                }
             } catch (error) {
                  console.log(error)
                  toast.error(error.response?.data?.message || 'Payment verification failed')
             }
           }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
       }





    const onSubmitHandler =  async(event)=>{
       event.preventDefault()

       try {
        // ✅ Check if user is logged in
        if (!token) {
          toast.error('❌ Please login first to place an order');
          navigate('/login');
          return;
        }

        // ✅ Validate phone number
        if (!formData.phone || formData.phone.toString().length < 10) {
          toast.error('❌ Please enter a valid 10-digit phone number');
          return;
        }

        // ✅ Validate all required fields
        const requiredFields = ['firstName', 'lastName', 'street', 'city', 'state', 'zipcode', 'country'];
        for (let field of requiredFields) {
          if (!formData[field]) {
            toast.error(`❌ Please fill in ${field}`);
            return;
          }
        }

        let orderItems = []
        for(const items in cartItems) {
           for ( const item in cartItems[items]){
             if(cartItems[items][item] > 0) {
                  const itemInfo = structuredClone(products.find(product => product._id === items))
              if(itemInfo){
               itemInfo.size = item
               itemInfo.quantity = cartItems[items][item]
               orderItems.push(itemInfo)
             }
             }
           }
        }

        if (orderItems.length === 0) {
          toast.error('❌ Your cart is empty');
          return;
        }

         const discount = appliedCoupon?.discount || 0
         let orderData =  {
           address:formData,
           items:orderItems,
           amount:getCartAmount() + getDeliveryFee() - discount,
           isGift,
           giftMessage: isGift ? giftMessage : '',
           couponCode: appliedCoupon?.code,
           discountAmount: discount,
         }

         switch(method){
          //   Api calls for COD
             case 'cod':
               const response = await axios.post(backendUrl + '/api/order/place' , orderData,{headers:{Authorization: `Bearer ${token}`, token}})
                if(response.data.success){
                   setConfirmationData({
                     orderId: response.data.orderId,
                     amount: orderData.amount,
                     itemCount: orderItems.length,
                     address: formData
                   });
                   setShowConfirmation(true);
                   setTimeout(() => { setCartItems({}) }, 1000);
                }
                else{
                    toast.error('❌ ' + (response.data.message || 'Failed to place order'));
                }

              break;

               case 'stripe':
                 const responseStripe = await axios.post(backendUrl + '/api/order/stripe' , orderData,{headers:{Authorization: `Bearer ${token}`, token}})
                  if(responseStripe.data.success){
                     const{session_url} = responseStripe.data
                     window.location.replace(session_url)
                  }
                  else {
                     toast.error('❌ ' + (responseStripe.data.message || 'Stripe service error'));
                  }
                break;

                case 'razorpay':
                  const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData,{headers:{Authorization: `Bearer ${token}`, token}})
                   if(responseRazorpay.data.success){
                    initPay(responseRazorpay.data.order)
                   }
                   else {
                     toast.error('❌ ' + (responseRazorpay.data.message || 'Failed to initiate payment'));
                   }

                   break;

              default:
                break;

         }

       } catch (error) {
           console.error('Order Error:', error);

           // ✅ Handle specific 401 error (Not Authorized)
           if (error.response?.status === 401) {
             toast.error('❌ Session expired. Please login again');
             localStorage.removeItem('token');
             navigate('/login');
           }
           // Handle other errors
           else {
             toast.error('❌ ' + (error.response?.data?.message || error.message || 'Error placing order'));
           }
       }

    }

  return (
    <>
      <form  onSubmit = {onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-10 pt-5 sm:pt-14 min-h-[80vh] border-t border-beige'>

      {/*  -------------------------   left Side ------------------- */}
       <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

         <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
         </div>

         {/* ── Share Location (moved to the top) ── */}
         <Card hover={false} className='p-4 bg-beige-light/50'>
             <div className='flex items-center justify-between gap-3'>
                 <div>
                     <p className='text-sm font-semibold text-charcoal'>📍 Use your current location</p>
                     <p className='text-xs text-gray-500 mt-0.5'>We'll auto-fill your address below</p>
                 </div>
                 <Button
                     type='button'
                     variant='outline'
                     size='sm'
                     onClick={shareLocation}
                     disabled={locationStatus === 'loading'}
                 >
                     {locationStatus === 'loading' ? 'Locating...' : locationStatus === 'success' ? 'Located ✓' : 'Share Location'}
                 </Button>
             </div>

             {locationStatus === 'denied' && (
                 <div className='mt-3 pt-3 border-t border-beige flex items-center justify-between gap-3'>
                     <p className='text-xs text-gray-600'>
                         We couldn't access your location — you can still enter your address manually below, or try again.
                     </p>
                     <Button type='button' variant='ghost' size='sm' onClick={shareLocation} className='shrink-0'>
                         Retry Location
                     </Button>
                 </div>
             )}
             {locationStatus === 'error' && (
                 <div className='mt-3 pt-3 border-t border-beige flex items-center justify-between gap-3'>
                     <p className='text-xs text-gray-600'>Something went wrong while detecting your location.</p>
                     <Button type='button' variant='ghost' size='sm' onClick={shareLocation} className='shrink-0'>
                         Retry Location
                     </Button>
                 </div>
             )}
         </Card>

         {/* ── Saved Addresses ── */}
         {savedAddresses.length > 0 && (
             <div className='mb-2'>
                 <p className='text-sm font-medium text-gray-600 mb-2'>Saved Addresses</p>

                 {selectedAddrId ? (
                     /* Selected — compact summary + Change button */
                     (() => {
                         const addr = savedAddresses.find(a => a._id === selectedAddrId)
                         return addr ? (
                             <div className='border border-gold bg-beige-light/40 rounded-xl px-4 py-3 flex items-start justify-between gap-3'>
                                 <div className='flex items-start gap-2 min-w-0'>
                                     <span className='text-base mt-0.5 shrink-0'>
                                         {addr.label === 'Work' ? '💼' : addr.label === 'Other' ? '📍' : '🏠'}
                                     </span>
                                     <div className='min-w-0'>
                                         <p className='text-xs font-semibold text-charcoal uppercase tracking-wide'>{addr.label}</p>
                                         <p className='text-sm text-charcoal font-medium'>{addr.firstName} {addr.lastName}</p>
                                         <p className='text-sm text-gray-500 truncate'>{addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zipcode}</p>
                                         {addr.phone && <p className='text-xs text-gray-400 mt-0.5'>📞 {addr.phone}</p>}
                                     </div>
                                 </div>
                                 <button
                                     type='button'
                                     onClick={() => setSelectedAddrId(null)}
                                     className='text-xs text-gray-500 underline hover:text-charcoal shrink-0 mt-1'
                                 >
                                     Change
                                 </button>
                             </div>
                         ) : null
                     })()
                 ) : (
                     /* All cards for selection */
                     <>
                         <div className='flex flex-col gap-2'>
                             {savedAddresses.map(addr => (
                                 <div
                                     key={addr._id}
                                     onClick={() => applyAddress(addr)}
                                     className='cursor-pointer border border-beige hover:border-gold rounded-xl px-4 py-3 flex items-start justify-between gap-3 transition-all duration-200'
                                 >
                                     <div className='flex items-start gap-2 min-w-0'>
                                         <span className='text-base mt-0.5 shrink-0'>
                                             {addr.label === 'Work' ? '💼' : addr.label === 'Other' ? '📍' : '🏠'}
                                         </span>
                                         <div className='min-w-0'>
                                             <p className='text-xs font-semibold text-charcoal uppercase tracking-wide'>{addr.label}</p>
                                             <p className='text-sm text-gray-600 truncate'>
                                                 {addr.firstName} {addr.lastName} · {addr.street}, {addr.city}
                                             </p>
                                             {addr.phone && <p className='text-xs text-gray-400'>{addr.phone}</p>}
                                         </div>
                                     </div>
                                     <span className='text-xs text-charcoal shrink-0'>Use</span>
                                 </div>
                             ))}
                         </div>
                         <p className='text-xs text-gray-400 mt-2 mb-1'>Or enter a new address below</p>
                     </>
                 )}
             </div>
         )}

         {/* Address form — hidden when a saved address is selected */}
         {!selectedAddrId && (
             <>
                 <div className='flex gap-3'>
                     <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-beige rounded-lg py-2 px-3.5 w-full focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition' type='text' placeholder='First Name' />
                     <input required onChange={onChangeHandler} name='lastName'  value={formData.lastName}  className='border border-beige rounded-lg py-2 px-3.5 w-full focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition' type='text' placeholder='Last Name' />
                 </div>
                 <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-beige rounded-lg py-2 px-3.5 w-full focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition' type='text'  placeholder='Street' />
                 <div className='flex gap-3'>
                     <input required onChange={onChangeHandler} name='city'  value={formData.city}  className='border border-beige rounded-lg py-2 px-3.5 w-full focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition' type='text' placeholder='City' />
                     <input required onChange={onChangeHandler} name='state' value={formData.state} className='border border-beige rounded-lg py-2 px-3.5 w-full focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition' type='text' placeholder='State' />
                 </div>
                 <div className='flex gap-3'>
                     <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-beige rounded-lg py-2 px-3.5 w-full focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition' type='number' placeholder='Zip Code' />
                     <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-beige rounded-lg py-2 px-3.5 w-full focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition' type='text'   placeholder='Country' />
                 </div>
                 <div className='bg-beige-light/60 border border-beige rounded-lg p-3'>
                     <label className='text-sm font-semibold text-charcoal mb-2 block'>📱 Phone Number (Required)</label>
                     <input
                         required
                         onChange={onChangeHandler}
                         name='phone'
                         value={formData.phone}
                         className='border border-beige rounded-lg py-2 px-3.5 w-full focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition'
                         type='tel'
                         placeholder='10-digit phone number'
                         maxLength='10'
                         pattern='[0-9]{10}'
                     />
                     <p className='text-xs text-gray-500 mt-2'>✓ We will send SMS order confirmation to this number</p>
                 </div>
             </>
         )}
       </div>

       {/* ---------------------right Side------------------ */}

       <div className ='mt-8'>
         <div className='mt-8 min-w-80'>
          <CartTotal onCouponChange={setAppliedCoupon}/>

         </div>

         <Card hover={false} className='mt-6 p-4'>
             <label className='flex items-center gap-3 cursor-pointer'>
                 <input
                     type='checkbox'
                     checked={isGift}
                     onChange={(e) => setIsGift(e.target.checked)}
                     className='w-4 h-4 accent-gold-dark cursor-pointer'
                 />
                 <span className='text-sm font-semibold text-charcoal'>🎁 This is a gift</span>
             </label>
             {isGift && (
                 <textarea
                     value={giftMessage}
                     onChange={(e) => setGiftMessage(e.target.value)}
                     placeholder='Add a gift message (optional)'
                     maxLength={200}
                     rows={3}
                     className='mt-3 w-full border border-beige rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition resize-none'
                 />
             )}
         </Card>

         <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'}/>

          {/*   -----------------payment Method seletion---------------- */}
          <div className='flex gap-3 flex-col lg:flex-row' >
                  <div onClick={()=>setMethod('stripe')} className={`flex items-center gap-3 border rounded-xl p-2 px-3 cursor-pointer transition-all duration-200 ${method === 'stripe' ? 'border-gold bg-beige-light/40' : 'border-beige'}`}>
                    <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-gold border-gold' : 'border-gray-300'}`}></p>
                    <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                  </div>

                  <div  onClick={()=>setMethod('razorpay')} className={`flex items-center gap-3 border rounded-xl p-2 px-3 cursor-pointer transition-all duration-200 ${method === 'razorpay' ? 'border-gold bg-beige-light/40' : 'border-beige'}`}>
                    <p className={`min-w-3.5 h-3.5 border rounded-full  ${method === 'razorpay' ? 'bg-gold border-gold' : 'border-gray-300'}`}></p>
                    <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                  </div>

                  <div onClick={()=>setMethod('cod')} className={`flex items-center gap-3 border rounded-xl p-2 px-3 cursor-pointer transition-all duration-200 ${method === 'cod' ? 'border-gold bg-beige-light/40' : 'border-beige'}`}>
                    <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-gold border-gold' : 'border-gray-300'}`}></p>
                   <p className='text-gray-600 text-sm font-medium mx-4'> CASH ON DELIVERY</p>
                  </div>
          </div>

              <div className='w-full text-end mt-8'>
              <Button type='submit' variant='gold' size='lg'>PLACE ORDER</Button>
             </div>

         </div>
       </div>
    </form>

    {/* ✅ Order Confirmation Modal Pop-up */}
    <OrderConfirmationModal
      isOpen={showConfirmation}
      orderData={confirmationData}
      onClose={() => {
        setShowConfirmation(false);
        navigate('/orders');
      }}
    />
    </>
  )
}

export default PlaceOrder
