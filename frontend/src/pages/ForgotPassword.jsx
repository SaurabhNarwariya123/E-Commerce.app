import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import OTPBoxInput from '../components/OTPBoxInput';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PasswordInput from '../components/ui/PasswordInput';

const inputClass = 'w-full px-4 py-2.5 border border-beige rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition'

const ForgotPassword = () => {
  const { navigate, backendUrl } = useContext(ShopContext)

  const [step, setStep] = useState('email') // 'email' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const requestOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/user/forgot-password', { email })
      toast.success(response.data.message)
      setStep('reset')
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
    setLoading(false)
  }

  const resendOtp = async () => {
    setOtp('')
    try {
      const response = await axios.post(backendUrl + '/api/user/forgot-password', { email })
      toast.success(response.data.message)
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    if (otp.length !== 6) {
      toast.error('Please enter the full 6-digit code')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/user/reset-password', { email, otp, newPassword })
      if (response.data.success) {
        toast.success(response.data.message)
        navigate('/login')
      } else {
        toast.error(response.data.message)
        setOtp('')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
    setLoading(false)
  }

  if (step === 'reset') {
    return (
      <div className='flex items-center justify-center w-full mt-14 mb-14 px-4 py-10 bg-linear-to-br from-beige-light via-ivory to-gold/10 rounded-3xl'>
      <Card hover={false} className='w-full sm:max-w-96 p-8 bg-linear-to-b from-white to-beige-light/40'>
      <form onSubmit={resetPassword} className='flex flex-col items-center gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2'>
          <p className='prata-regular text-3xl text-charcoal'>Reset Password</p>
          <hr className='border-none h-0.5 w-8 bg-linear-to-r from-gold to-rose' />
        </div>

        <p className='text-sm text-gray-500 text-center'>Enter the code sent to <strong className='text-charcoal'>{email}</strong></p>

        <OTPBoxInput value={otp} onChange={setOtp} disabled={loading} accent='black' />

        <PasswordInput
          onChange={(e) => setNewPassword(e.target.value)}
          value={newPassword}
          className={inputClass}
          placeholder='New password (min 8 characters)'
        />

        <Button type='submit' loading={loading} variant='gold' size='md' className='w-full'>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>

        <p onClick={resendOtp} className='text-sm cursor-pointer text-charcoal hover:underline'>Resend code</p>
      </form>
      </Card>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-center w-full mt-14 mb-14 px-4 py-10 bg-linear-to-br from-beige-light via-ivory to-gold/10 rounded-3xl'>
    <Card hover={false} className='w-full sm:max-w-96 p-8 bg-linear-to-b from-white to-beige-light/40'>
    <form onSubmit={requestOtp} className='flex flex-col items-center gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2'>
        <p className='prata-regular text-3xl text-charcoal'>Forgot Password</p>
        <hr className='border-none h-0.5 w-8 bg-linear-to-r from-gold to-rose' />
      </div>

      <p className='text-sm text-gray-500 text-center'>Enter your account email and we'll send you a reset code</p>

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type='email'
        className={inputClass}
        placeholder='Email'
        required
      />

      <Button type='submit' loading={loading} variant='gold' size='md' className='w-full'>
        {loading ? 'Sending...' : 'Send Reset Code'}
      </Button>

      <p onClick={() => navigate('/login')} className='text-sm cursor-pointer text-charcoal hover:underline'>Back to login</p>
    </form>
    </Card>
    </div>
  )
}

export default ForgotPassword
