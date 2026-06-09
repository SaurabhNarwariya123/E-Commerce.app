import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const EMPTY_FORM = { label: 'Home', firstName: '', lastName: '', street: '', city: '', state: '', zipcode: '', country: '', phone: '' }

// ─── Add / Edit Address Modal ─────────────────────────────────────────────────
const AddAddressModal = ({ onSave, onClose, initialValues }) => {
    const [form, setForm] = useState(initialValues || EMPTY_FORM)
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSave = () => {
        if (!form.street.trim() || !form.city.trim()) {
            toast.error('Street and city are required')
            return
        }
        onSave(form)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-bold text-gray-900 mb-4">{initialValues ? 'Edit Address' : 'Add New Address'}</h3>

                {/* Label */}
                <div className="flex gap-2 mb-4">
                    {['Home', 'Work', 'Other'].map(l => (
                        <button
                            key={l}
                            onClick={() => set('label', l)}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium border transition ${form.label === l ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">First Name</label>
                        <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                        <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Street Address *</label>
                    <input value={form.street} onChange={e => set('street', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">City *</label>
                        <input value={form.city} onChange={e => set('city', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">State</label>
                        <input value={form.state} onChange={e => set('state', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Zip Code</label>
                        <input value={form.zipcode} onChange={e => set('zipcode', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Country</label>
                        <input value={form.country} onChange={e => set('country', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                </div>

                <div className="mb-5">
                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-900">
                        Save Address
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Profile ──────────────────────────────────────────────────────────────────
const Profile = () => {
    const { userName, userEmail, userId, token, navigate, backendUrl, setUserName, setUserEmail } = useContext(ShopContext)
    const [loading, setLoading]       = useState(false)
    const [addresses, setAddresses]   = useState([])
    const [showAdd, setShowAdd]       = useState(false)
    const [editingAddr, setEditingAddr] = useState(null)
    const [deleting, setDeleting]     = useState(null)

    useEffect(() => { if (!token) navigate('/login') }, [token])

    useEffect(() => {
        if (!token) return
        const fetchAll = async () => {
            setLoading(true)
            try {
                const [profileRes, addrRes] = await Promise.all([
                    userName && userEmail ? null : axios.get(backendUrl + '/api/user/profile', { headers: { Authorization: `Bearer ${token}`, token } }),
                    axios.post(backendUrl + '/api/user/addresses', {}, { headers: { Authorization: `Bearer ${token}`, token } })
                ])
                if (profileRes?.data?.success) {
                    setUserName(profileRes.data.name)
                    setUserEmail(profileRes.data.email)
                    localStorage.setItem('userName', profileRes.data.name)
                    localStorage.setItem('userEmail', profileRes.data.email)
                }
                if (addrRes.data.success) setAddresses(addrRes.data.addresses)
            } catch (_) {}
            setLoading(false)
        }
        fetchAll()
    }, [token])

    const saveAddress = async (form) => {
        try {
            const res = await axios.post(
                backendUrl + '/api/user/addresses/add',
                { address: form },
                { headers: { Authorization: `Bearer ${token}`, token } }
            )
            if (res.data.success) {
                setAddresses(res.data.addresses)
                setShowAdd(false)
                toast.success('Address saved')
            } else {
                toast.error(res.data.message)
            }
        } catch (_) { toast.error('Failed to save') }
    }

    const editAddress = async (form) => {
        try {
            const res = await axios.post(
                backendUrl + '/api/user/addresses/update',
                { addressId: editingAddr._id, address: form },
                { headers: { Authorization: `Bearer ${token}`, token } }
            )
            if (res.data.success) {
                setAddresses(res.data.addresses)
                setEditingAddr(null)
                toast.success('Address updated')
            } else {
                toast.error(res.data.message)
            }
        } catch (_) { toast.error('Failed to update') }
    }

    const deleteAddress = async (addressId) => {
        setDeleting(addressId)
        try {
            const res = await axios.post(
                backendUrl + '/api/user/addresses/delete',
                { addressId },
                { headers: { Authorization: `Bearer ${token}`, token } }
            )
            if (res.data.success) {
                setAddresses(res.data.addresses)
                toast.success('Address removed')
            } else {
                toast.error(res.data.message)
            }
        } catch (_) { toast.error('Failed to delete') }
        setDeleting(null)
    }

    if (!token) return null

    const initials = userName
        ? userName.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?'

    const labelIcon = { Home: '🏠', Work: '💼', Other: '📍' }

    return (
        <div className='border-t pt-14 min-h-[60vh]'>
            {showAdd && <AddAddressModal onSave={saveAddress} onClose={() => setShowAdd(false)} />}
            {editingAddr && <AddAddressModal onSave={editAddress} onClose={() => setEditingAddr(null)} initialValues={editingAddr} />}

            <div className='text-2xl mb-8'>
                <Title text1='MY' text2='PROFILE' />
            </div>

            {loading ? (
                <p className='text-gray-400 text-sm'>Loading profile...</p>
            ) : (
                <div className='max-w-xl space-y-6'>

                    {/* Avatar + name */}
                    <div className='flex items-center gap-5 bg-gray-50 border rounded-2xl px-6 py-5'>
                        <div className='w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold shrink-0 select-none'>
                            {initials}
                        </div>
                        <div className='overflow-hidden'>
                            <p className='text-lg font-semibold text-gray-900 truncate'>{userName || '—'}</p>
                            <p className='text-sm text-gray-500 truncate'>{userEmail || '—'}</p>
                            <span className='inline-block mt-1 text-xs bg-black text-white px-2 py-0.5 rounded-full'>Customer</span>
                        </div>
                    </div>

                    {/* Details */}
                    <div className='border rounded-xl divide-y text-sm'>
                        <div className='flex items-center justify-between px-5 py-4'>
                            <span className='text-gray-500'>Full Name</span>
                            <span className='font-medium text-gray-800'>{userName || '—'}</span>
                        </div>
                        <div className='flex items-center justify-between px-5 py-4'>
                            <span className='text-gray-500'>Email</span>
                            <span className='font-medium text-gray-800 break-all text-right'>{userEmail || '—'}</span>
                        </div>
                        <div className='flex items-center justify-between px-5 py-4'>
                            <span className='text-gray-500'>Account Type</span>
                            <span className='font-medium text-gray-800'>Customer</span>
                        </div>
                    </div>

                    {/* ── Saved Addresses ── */}
                    <div>
                        <div className='flex items-center justify-between mb-3'>
                            <h3 className='text-base font-semibold text-gray-900'>Saved Addresses</h3>
                            <button
                                onClick={() => setShowAdd(true)}
                                className='flex items-center gap-1.5 text-xs border border-black text-black px-3 py-1.5 rounded-full hover:bg-black hover:text-white transition'
                            >
                                + Add Address
                            </button>
                        </div>

                        {addresses.length === 0 ? (
                            <div className='border border-dashed border-gray-300 rounded-xl p-8 text-center'>
                                <p className='text-gray-400 text-sm'>No saved addresses yet</p>
                                <button
                                    onClick={() => setShowAdd(true)}
                                    className='mt-3 text-xs text-black underline'
                                >
                                    Add your first address
                                </button>
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {addresses.map(addr => (
                                    <div key={addr._id} className='border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4'>
                                        <div className='flex items-start gap-3'>
                                            <span className='text-xl mt-0.5'>{labelIcon[addr.label] || '📍'}</span>
                                            <div>
                                                <div className='flex items-center gap-2 mb-1'>
                                                    <span className='text-xs font-semibold text-gray-800 uppercase tracking-wide'>{addr.label}</span>
                                                    {addr.firstName && (
                                                        <span className='text-xs text-gray-500'>· {addr.firstName} {addr.lastName}</span>
                                                    )}
                                                </div>
                                                <p className='text-sm text-gray-700 leading-relaxed'>
                                                    {addr.street}<br />
                                                    {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zipcode}
                                                    {addr.country ? `, ${addr.country}` : ''}
                                                </p>
                                                {addr.phone && (
                                                    <p className='text-xs text-gray-400 mt-1'>📞 {addr.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-1.5 shrink-0'>
                                            <button
                                                onClick={() => setEditingAddr(addr)}
                                                className='text-xs text-gray-500 hover:text-black border border-gray-200 hover:border-gray-400 px-2.5 py-1 rounded-lg transition'
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteAddress(addr._id)}
                                                disabled={deleting === addr._id}
                                                className='text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg transition disabled:opacity-50'
                                            >
                                                {deleting === addr._id ? '...' : 'Remove'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div className='grid grid-cols-2 gap-3'>
                        <Link
                            to='/orders'
                            className='text-center border border-black py-3 text-sm font-medium hover:bg-black hover:text-white transition-all duration-300 rounded-lg'
                        >
                            My Orders
                        </Link>
                        <Link
                            to='/collection'
                            className='text-center border border-gray-300 py-3 text-sm text-gray-600 hover:border-black hover:text-black transition-all duration-300 rounded-lg'
                        >
                            Shop Now
                        </Link>
                    </div>

                </div>
            )}
        </div>
    )
}

export default Profile
