import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import { CartTotal } from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios';
import { toast } from 'react-toastify'

// ✅ Confirmation Modal Component
const OrderConfirmationModal = ({ isOpen, orderData, onClose }) => {
  if (!isOpen || !orderData) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl'>
        <div className='text-center'>
          {/* Success Icon */}
          <div className='mb-4 flex justify-center'>
            <div className='bg-green-100 rounded-full p-4'>
              <svg className='w-8 h-8 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
              </svg>
            </div>
          </div>

          <h2 className='text-2xl font-bold text-gray-800 mb-2'>✓ Order Confirmed!</h2>
          <p className='text-gray-600 mb-6'>Your order has been placed successfully</p>

          {/* Order Details */}
          <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-3'>
            <div>
              <p className='text-sm text-gray-600'>Order ID</p>
              <p className='font-mono text-sm font-bold text-gray-800'>{orderData.orderId?.slice(-8)}</p>
            </div>
            
            <div>
              <p className='text-sm text-gray-600'>Amount</p>
              <p className='text-lg font-bold text-gray-800'>₹{orderData.amount}</p>
            </div>

            <div>
              <p className='text-sm text-gray-600'>Items</p>
              <p className='font-semibold text-gray-800'>{orderData.itemCount} item(s)</p>
            </div>

            <div>
              <p className='text-sm text-gray-600'>Delivery Address</p>
              <p className='text-sm font-semibold text-gray-800'>
                {orderData.address?.firstName} {orderData.address?.lastName}<br/>
                {orderData.address?.street}<br/>
                {orderData.address?.city}, {orderData.address?.state} {orderData.address?.zipcode}
              </p>
            </div>

            <div className='pt-3 border-t border-gray-200'>
              <p className='text-sm text-gray-600'>📱 Phone Number</p>
              <p className='text-lg font-bold text-green-600'>{orderData.address?.phone}</p>
              <p className='text-xs text-gray-500 mt-1'>✓ SMS confirmation sent to this number</p>
            </div>
          </div>

          {/* Notifications */}
          <div className='space-y-3 mb-6'>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
              <p className='text-sm text-blue-800'><strong>📧 Confirmation email sent</strong></p>
            </div>
            <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
              <p className='text-sm text-green-800'><strong>📱 SMS sent to {orderData.address?.phone}</strong></p>
              <p className='text-xs text-green-700 mt-1'>You will receive shipping updates via SMS</p>
            </div>
          </div>

          {/* Buttons */}
          <button
            onClick={onClose}
            className='w-full bg-black text-white py-2 px-4 rounded font-medium hover:bg-gray-800 transition'>
            View My Orders
          </button>

          <p className='text-xs text-gray-500 mt-4'>Your order is being processed...</p>
        </div>
      </div>
    </div>
  );
};

const PlaceOrder = () => {

    const [method , setMethod] = useState('cod');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationData, setConfirmationData] = useState(null);
    const {navigate ,backendUrl, token , cartItems, setCartItems,getCartAmount,delivery_fee,products} = useContext(ShopContext);
    const[formData,setFormData] = useState({
       firstName:'',
       lastName:'',
       email:'',
       street:'',
       city:'',
       state:'',
       zipcode:'',
       country:'',
       phone:''

    })
     const onChangeHandler = (event) =>{
       const name = event.target.name;
       const value = event.target.value;

         setFormData(data => ({...data,[name]:value}))
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
        const requiredFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country'];
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

         let orderData =  {
           address:formData,
           items:orderItems,
           amount:getCartAmount() + delivery_fee
         }

         switch(method){
          //   Api calls for COD
             case 'cod':
               const response = await axios.post(backendUrl + '/api/order/place' , orderData,{headers:{Authorization: `Bearer ${token}`, token}})
                if(response.data.success){
                   // ✅ Show confirmation modal with order details
                   setConfirmationData({
                     orderId: response.data.orderId,
                     amount: orderData.amount,
                     itemCount: orderItems.length,
                     address: formData
                   });
                   setShowConfirmation(true);
                   
                   // Clear cart after showing modal
                   setTimeout(() => {
                     setCartItems({});
                   }, 1000);
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
      <form  onSubmit = {onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>

      {/*  -------------------------   left Side ------------------- */}
       <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

         <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
         </div>
  
          <div  className='flex gap-3'>
         <input required  onChange={onChangeHandler} name='firstName' value={formData.firstName}  className = 'border border-gray-300 rounded py-1.5 px-3.5 w-full 'type="text"  placeholder='First Name' />
         <input required onChange={onChangeHandler} name='lastName'  value={formData.lastName}  className = 'border border-gray-300 rounded py-1.5 px-3.5 w-full 'type="text"  placeholder='Last Name' />
           </div>
         <input required onChange={onChangeHandler}  name='email' value={formData.email} className = 'border border-gray-300 rounded py-1.5 px-3.5 w-full 'type="email"  placeholder='Email address' />
          <input required onChange={onChangeHandler}  name='street' value={formData.street}   className = 'border border-gray-300 rounded py-1.5 px-3.5 w-full 'type="text"  placeholder='street' />

          <div className='flex gap-3'>
         <input required onChange={onChangeHandler}  name='city' value={formData.city} className = 'border border-gray-300 rounded py-1.5 px-3.5 w-full 'type="text"  placeholder='City' />
         <input  required onChange={onChangeHandler}  name='state' value={formData.state}  className = 'border border-gray-300 rounded py-1.5 px-3.5 w-full 'type="text"  placeholder='state' />
           </div>

        <div className='flex gap-3'>
         <input  required onChange={onChangeHandler}  name='zipcode' value={formData.zipcode} className = 'border border-gray-300 rounded py-1.5 px-3.5 w-full 'type="Number"  placeholder='Zip Code' />
         <input  required onChange={onChangeHandler}  name='country' value={formData.country} className = 'border border-gray-300 rounded py-1.5 px-3.5 w-full 'type="text"  placeholder='Country' />
        </div>
        
        {/* ✅ Phone Number with SMS notice */}
        <div className='bg-green-50 border border-green-200 rounded p-3'>
          <label className='text-sm font-semibold text-green-800 mb-2 block'>📱 Phone Number (Required)</label>
          <input  
            required 
            onChange={onChangeHandler}  
            name='phone' 
            value={formData.phone}  
            className = 'border border-gray-300 rounded py-1.5 px-3.5 w-full' 
            type="tel"  
            placeholder='10-digit phone number' 
            maxLength='10'
            pattern='[0-9]{10}'
          />
          <p className='text-xs text-green-700 mt-2'>✓ We will send SMS order confirmation to this number</p>
        </div>
       </div>

       {/* ---------------------right Side------------------ */}

       <div className ='mt-8'>
         <div className='mt-8 min-w-80'>
          <CartTotal/>

         </div>

         <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'}/>

          {/*   -----------------payment Method seletion---------------- */}
          <div className='flex gap-3 flex-col lg:flex-row' >
                  <div onClick={()=>setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                    <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                    <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                  </div>

                  <div  onClick={()=>setMethod('razorpay')}className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                    <p className={`min-w-3.5 h-3.5 border rounded-full  ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                    <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                  </div>

                  <div onClick={()=>setMethod('cod')} className ='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                    <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                   <p className='text-gray-500 text-sm font-medium mx-4'> CASH ON DELIVERY</p>
                  </div>
          </div>
           
              <div className='w-full text-end mt-8'> 
              <button type='submit' className='bg-black text-white px-16 py-3 text-sm cursor-pointer hover:bg-gray-800 transition'> PLACE ORDER</button>
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
