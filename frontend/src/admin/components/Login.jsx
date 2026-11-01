import axios from 'axios'
import React, { useState } from 'react'
import { backendUrl } from '../App'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const HIGHLIGHTS = [
    { icon: '📈', title: 'Live sales insights', text: 'Revenue, orders and stock at a glance.' },
    { icon: '🚲', title: 'Delivery tracking', text: 'Assign riders and follow every order.' },
    { icon: '🤖', title: 'AI assistant', text: 'Ask questions about your store in plain words.' },
]

const EyeIcon = ({ off }) => (
    <svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
        <path d='M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z' />
        <circle cx='12' cy='12' r='3' />
        {off && <path d='M4 4l16 16' />}
    </svg>
)

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        setError('')
        try {
            const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
            if (response.data.success) {
                setToken(response.data.token)
                return
            }
            setError(response.data.message || 'Login failed')
            toast.error(response.data.message)
        } catch (err) {
            console.log(err)
            setError(err.response?.data?.message || 'Could not reach the server. Please try again.')
            toast.error(err.message)
        }
        setLoading(false)
    }

    const inputClass = 'w-full rounded-lg border border-[var(--adm-line)] bg-white px-3.5 py-2.5 text-sm text-[var(--adm-ink)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-[var(--adm-bg)] disabled:cursor-not-allowed'

    return (
        <div className='flex-1 min-h-0 w-full grid lg:grid-cols-[1.05fr_1fr] bg-white overflow-y-auto'>

            {/* Brand panel */}
            <aside className='hidden lg:flex relative overflow-hidden flex-col justify-between p-10 text-white bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-950'>
                <div className='absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10' />
                <div className='absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-white/5' />
                <div className='absolute -bottom-28 right-10 w-72 h-72 rounded-full bg-teal-400/10' />

                <div className='relative'>
                    <span className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-wide'>
                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-300' /> Forever · Admin Panel
                    </span>
                </div>

                <div className='relative max-w-md'>
                    <h2 className='text-3xl font-semibold leading-tight'>Run your store with confidence.</h2>
                    <p className='mt-3 text-sm text-emerald-100/80'>Everything you need to manage products, orders and deliveries in one place.</p>
                    <ul className='mt-8 space-y-4'>
                        {HIGHLIGHTS.map(h => (
                            <li key={h.title} className='flex items-start gap-3'>
                                <span className='w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center'>{h.icon}</span>
                                <div>
                                    <p className='text-sm font-medium'>{h.title}</p>
                                    <p className='text-xs text-emerald-100/70'>{h.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className='relative text-xs text-emerald-100/60'>© {new Date().getFullYear()} Forever. All rights reserved.</p>
            </aside>

            {/* Form */}
            <main className='flex items-center justify-center px-6 py-10 bg-[var(--adm-bg)] lg:bg-white'>
                <div className='w-full max-w-sm animate-fade-in-up'>
                    <img className='h-9 w-auto mb-8' src={assets.logo} alt='Forever' />

                    <h1 className='text-2xl font-semibold text-[var(--adm-ink)]'>Welcome back</h1>
                    <p className='mt-1 text-sm text-[var(--adm-muted)]'>Sign in to continue to the admin panel.</p>

                    <form onSubmit={onSubmitHandler} className='mt-7 space-y-4'>
                        <div>
                            <label htmlFor='admin-email' className='block text-sm font-medium text-[var(--adm-ink)] mb-1.5'>Email address</label>
                            <input
                                id='admin-email' type='email' required autoComplete='username' autoFocus
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                disabled={loading} placeholder='your@gmail.com'
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor='admin-password' className='block text-sm font-medium text-[var(--adm-ink)] mb-1.5'>Password</label>
                            <div className='relative'>
                                <input
                                    id='admin-password' type={showPassword ? 'text' : 'password'} required autoComplete='current-password'
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading} placeholder='Enter your password'
                                    className={`${inputClass} pr-11`}
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(s => !s)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                    className='absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-[var(--adm-muted)] hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer'
                                >
                                    <EyeIcon off={showPassword} />
                                </button>
                            </div>
                        </div>

                        <div role='alert' aria-live='polite'>
                            {error && (
                                <p className='flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700'>
                                    <span aria-hidden='true'>⚠️</span>{error}
                                </p>
                            )}
                        </div>

                        <button type='submit' disabled={loading} aria-busy={loading} className='btn btn-primary btn-lg w-full'>
                            {loading ? (
                                <>
                                    <span className='w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin' aria-hidden='true' />
                                    Signing in…
                                </>
                            ) : 'Sign in'}
                        </button>
                    </form>

                    <p className='mt-6 text-center text-xs text-[var(--adm-muted)]'>Authorized administrators only.</p>
                </div>
            </main>
        </div>
    )
}

export default Login
