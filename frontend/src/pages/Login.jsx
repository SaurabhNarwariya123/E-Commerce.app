import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import OTPBoxInput from '../components/OTPBoxInput';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PasswordInput from '../components/ui/PasswordInput';

const inputClass = 'w-full px-4 py-2.5 border border-beige rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition'

const Login = () => {

  const[currentState , setCurrentState] = useState('Login');
  const[step, setStep] = useState('form'); // 'form' | 'otp' — OTP step only happens for Sign Up
  const{token,setToken,navigate,backendUrl,setUserId,setUserName,setUserEmail} = useContext(ShopContext)

  const[name,setName] = useState('')
  const[password,setPassword] = useState('')
  const[email,setEmail] = useState('')
  const[otp,setOtp] = useState('')
  const[otpLoading,setOtpLoading] = useState(false)
  const[needsVerification,setNeedsVerification] = useState(false)
  const[submitting,setSubmitting] = useState(false)

  const applySession = (data) => {
    setToken('logged_in')
    if (data.userId) {
      setUserId(data.userId)
      localStorage.setItem('userId', data.userId)
    }
    if (data.name) {
      setUserName(data.name)
      localStorage.setItem('userName', data.name)
    }
    if (data.email) {
      setUserEmail(data.email)
      localStorage.setItem('userEmail', data.email)
    }
  }

  const onSubmitHandler = async (event) =>{
         event.preventDefault();
         setSubmitting(true)

         try {

           if(currentState === 'Sign Up') {

             const response = await axios.post(backendUrl + '/api/user/register' , {name,email,password})
                if(response.data.success){
                 toast.success(response.data.message || 'OTP sent to your email')
                 setOtp('')
                 setStep('otp')
                 }
                 else{
                  toast.error(response.data.message)
                 }
           }
           else{
             setNeedsVerification(false)
             const response = await axios.post(backendUrl + '/api/user/login' , {email,password})
                 if(response.data.success){
                  applySession(response.data)
                 }
                 else{
                   toast.error(response.data.message)
                   if (response.data.code === 'EMAIL_NOT_VERIFIED') {
                     setNeedsVerification(true)
                   }
                 }

           }

         } catch (error) {
           console.log(error)
           toast.error(error.message)

         }
         setSubmitting(false)
  }

  const onVerifyOtp = async (event) => {
    event.preventDefault()
    if (otp.length !== 6) {
      toast.error('Please enter the full 6-digit code')
      return
    }
    setOtpLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/user/verify-email', { email, otp })
      if (response.data.success) {
        toast.success('Email verified! Welcome aboard 🎉')
        applySession(response.data)
      } else {
        toast.error(response.data.message)
        setOtp('')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
      setOtp('')
    }
    setOtpLoading(false)
  }

  const resendOtp = async (emailToResend) => {
    setOtp('')
    try {
      const response = await axios.post(backendUrl + '/api/user/resend-otp', { email: emailToResend })
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const response = await axios.post(
      backendUrl + '/api/user/google',
      {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      }
    );

    if (response.data.success) {
      applySession(response.data)
    } else {
      toast.error(response.data.message || 'Google login failed');
    }
  } catch (error) {
    console.log(error);
    toast.error("Google Login Failed");
  }
}

   useEffect(()=>{
     if(token) {
      navigate('/')
     }
   } ,[token])

  if (step === 'otp') {
    return (
      <div className='flex items-center justify-center w-full mt-14 mb-14 px-4 py-10 bg-linear-to-br from-beige-light via-ivory to-gold/10 rounded-3xl'>
      <Card hover={false} className='w-full sm:max-w-96 p-8'>
      <form onSubmit={onVerifyOtp} className='flex flex-col items-center gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2'>
          <p className='prata-regular text-3xl text-charcoal'>Verify Email</p>
          <hr className='border-none h-0.5 w-8 bg-gold' />
        </div>

        <p className='text-sm text-gray-500 text-center'>We've sent a 6-digit code to <strong className='text-charcoal'>{email}</strong></p>

        <OTPBoxInput value={otp} onChange={setOtp} disabled={otpLoading} accent='black' />

        <Button type='submit' loading={otpLoading} variant='gold' size='md' className='w-full'>
          {otpLoading ? 'Verifying...' : 'Verify Email'}
        </Button>

        <p onClick={() => resendOtp(email)} className='text-sm cursor-pointer text-gold-dark hover:underline'>Resend code</p>
        <p onClick={() => setStep('form')} className='text-xs text-gray-400 cursor-pointer hover:text-gray-600'>Back</p>
      </form>
      </Card>
      </div>
    )
  }

  if (currentState === 'Login') {
    return (
      <div className='flex items-center justify-center w-full mt-14 mb-14 px-4 py-10 bg-linear-to-br from-beige-light via-ivory to-gold/10 rounded-3xl'>
      <Card hover={false} className='w-full sm:max-w-96 p-8 bg-linear-to-b from-white to-beige-light/40'>
      <form onSubmit={onSubmitHandler} className='flex flex-col items-center gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2'>
          <p className='prata-regular text-3xl bg-linear-to-r from-charcoal to-gold-dark bg-clip-text text-transparent'>Login</p>
          <hr className='border-none h-0.5 w-8 bg-linear-to-r from-gold to-rose' />
        </div>

        <input onChange={(e)=> setEmail(e.target.value)} value={email} type="email" className={inputClass} placeholder='Email' />
        <PasswordInput onChange={(e)=> setPassword(e.target.value)} value={password} className={inputClass} placeholder='Password' />

        <div className='w-full flex justify-between text-sm -mt-2'>
          <p onClick={() => navigate('/forgot-password')} className='cursor-pointer text-gray-500 hover:text-gold-dark transition-colors'>Forgot your password?</p>
          <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer text-gray-500 hover:text-gold-dark transition-colors'>Create Account</p>
        </div>

        {needsVerification && (
          <p className='text-xs text-gray-500 -mt-2'>
            Email not verified — <span onClick={() => resendOtp(email)} className='underline cursor-pointer text-gold-dark'>resend verification code</span>
          </p>
        )}

        <Button type='submit' variant='gold' size='md' className='w-full mt-2' loading={submitting}>{submitting ? 'Signing In...' : 'Sign In'}</Button>

        <div className='my-1 text-xs text-gray-400 uppercase tracking-widest'>or</div>

        <Button type='button' variant='outline' size='md' className='w-full' onClick={handleGoogleSignIn}>
          <img src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' alt='google' className='w-5 h-5' />
          Sign in with Google
        </Button>
      </form>
      </Card>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center w-full mt-14 mb-14 px-4 py-10 bg-linear-to-br from-beige-light via-ivory to-gold/10 rounded-3xl'>
    <Card hover={false} className='w-full sm:max-w-96 p-8 bg-linear-to-b from-white to-beige-light/40'>
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2'>
        <p className='prata-regular text-3xl bg-linear-to-r from-charcoal to-gold-dark bg-clip-text text-transparent'>Sign Up</p>
        <hr className='border-none h-0.5 w-8 bg-linear-to-r from-gold to-rose' />
      </div>

      <input onChange={(e) => setName(e.target.value)} value={name} type='text' className={inputClass} placeholder='Name' />
      <input onChange={(e) => setEmail(e.target.value)} value={email} type='email' className={inputClass} placeholder='Email' />
      <PasswordInput onChange={(e) => setPassword(e.target.value)} value={password} className={inputClass} placeholder='Password' />

      <div className='w-full flex justify-between text-sm -mt-2'>
        <p onClick={() => navigate('/forgot-password')} className='cursor-pointer text-gray-500 hover:text-gold-dark transition-colors'>Forgot your password?</p>
        <p onClick={() => setCurrentState('Login')} className='cursor-pointer text-gray-500 hover:text-gold-dark transition-colors'>Login</p>
      </div>

      <Button type='submit' variant='gold' size='md' className='w-full mt-2' loading={submitting}>{submitting ? 'Creating Account...' : 'Sign Up'}</Button>
    </form>
    </Card>
    </div>
  )
}

export default Login
