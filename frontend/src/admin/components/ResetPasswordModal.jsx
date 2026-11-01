import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'

const ResetPasswordModal = ({ person, token, onClose }) => {
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)
    const [saving, setSaving] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await axios.post(
                backendUrl + '/api/delivery/reset-password',
                { deliveryPersonId: person._id, newPassword: password },
                { headers: { token } }
            )
            if (res.data.success) {
                toast.success(res.data.message)
                onClose()
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err.message)
        }
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-[var(--adm-line)]">
                    <h2 className="text-base font-semibold text-[var(--adm-ink)]">Reset password</h2>
                    <p className="text-xs text-[var(--adm-muted)] mt-0.5">{person.name} · {person.email}</p>
                </div>
                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-[var(--adm-ink)] mb-1">New password</label>
                        <div className="relative">
                            <input
                                type={show ? 'text' : 'password'} required minLength={6} autoFocus
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full border border-[var(--adm-line)] rounded-lg px-3 py-2 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition"
                                placeholder="Min 6 characters"
                            />
                            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-emerald-700 cursor-pointer">
                                {show ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <p className="text-xs text-[var(--adm-muted)] mt-1.5">Share the new password with the delivery partner yourself.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={saving} className="btn btn-primary">
                            {saving ? 'Saving…' : 'Reset password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ResetPasswordModal
