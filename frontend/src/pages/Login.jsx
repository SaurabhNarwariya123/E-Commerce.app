import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, provider } from '../firebase';

const Login = () => {

  const[currentState , setCurrentState] = useState('Login');
  const{token,setToken,navigate,backendUrl,setUserId,setUserName,setUserEmail} = useContext(ShopContext)

  const[name,setName] = useState('')
  const[password,setPassword] = useState('')
  const[email,setEmail] = useState('')

  const onSubmitHandler = async (event) =>{
         event.preventDefault();

         try {

           if(currentState === 'Sign Up') {

             const response = await axios.post(backendUrl + '/api/user/register' , {name,email,password})
                if(response.data.success){
                 setToken(response.data.token)
                 localStorage.setItem('token' , response.data.token)
                 if(response.data.userId) {
                   setUserId(response.data.userId)
                   localStorage.setItem('userId' , response.data.userId)
                 }
                 if(response.data.name) {
                   setUserName(response.data.name)
                   localStorage.setItem('userName' , response.data.name)
                 }
                 if(response.data.email) {
                   setUserEmail(response.data.email)
                   localStorage.setItem('userEmail' , response.data.email)
                 }
                 }
                 else{
                  toast.error(response.data.message)
                 }
           }
           else{
             
             const response = await axios.post(backendUrl + '/api/user/login' , {email,password})
                 if(response.data.success){
                  setToken(response.data.token)
                   localStorage.setItem('token' , response.data.token)
                   if(response.data.userId) {
                     setUserId(response.data.userId)
                     localStorage.setItem('userId' , response.data.userId)
                   }
                   if(response.data.name) {
                     setUserName(response.data.name)
                     localStorage.setItem('userName' , response.data.name)
                   }
                   if(response.data.email) {
                     setUserEmail(response.data.email)
                     localStorage.setItem('userEmail' , response.data.email)
                   }
                 }

                 else{
                   toast.error(response.data.message)
                 }

           }

         } catch (error) {
           console.log(error)
           toast.error(error.message)

         }
  }

const handleGoogleSignIn = async () => {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.log(error);
    toast.error("Google Login Failed");
  }
}

const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return;

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
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      if (response.data.userId) {
        setUserId(response.data.userId);
        localStorage.setItem('userId', response.data.userId);
      }
      if (response.data.name) {
        setUserName(response.data.name);
        localStorage.setItem('userName', response.data.name);
      }
      if (response.data.email) {
        setUserEmail(response.data.email);
        localStorage.setItem('userEmail', response.data.email);
      }
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

  useEffect(() => {
    handleGoogleRedirectResult();
  }, [])
  if (currentState === 'Login') {
    return (
      <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
          <p className='prata-regular text-3xl'>Login</p>
          <hr className='border-none h-1[1.5px] w-8 bg-gray-800' />
        </div>

        <input onChange={(e)=> setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' />
        <input onChange={(e)=> setPassword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-800' placeholder='Password' />

        <div className='w-full flex justify-between text-sm -mt-2'>
          <p className='cursor-pointer'> Forgot your password?</p>
          <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer'>Create Account</p>
        </div>

        <button className='bg-black text-white font-light px-8 py-2 mt-4 cursor-pointer'>Sign In</button>

        <div className='my-2'>or</div>

        <button type='button' onClick={handleGoogleSignIn} className='bg-white border border-gray-800 text-gray-800 font-light px-6 py-2 mt-2 cursor-pointer flex items-center gap-2'>
          <img src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' alt='google' className='w-5 h-5' />
          Sign in with Google
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>Sign Up</p>
        <hr className='border-none h-1[1.5px] w-8 bg-gray-800' />
      </div>

      <input onChange={(e) => setName(e.target.value)} value={name} type='text' className='w-full px-3 py-2 border border-gray-800' placeholder='Name' />
      <input onChange={(e) => setEmail(e.target.value)} value={email} type='email' className='w-full px-3 py-2 border border-gray-800' placeholder='Email' />
      <input onChange={(e) => setPassword(e.target.value)} value={password} type='password' className='w-full px-3 py-2 border border-gray-800' placeholder='Password' />

      <div className='w-full flex justify-between text-sm -mt-2'>
        <p className='cursor-pointer'> Forgot your password?</p>
        <p onClick={() => setCurrentState('Login')} className='cursor-pointer'>Login</p>
      </div>

      <button className='bg-black text-white font-light px-8 py-2 mt-4 cursor-pointer'>Sign Up</button>
    </form>
  )
}

export default Login
