import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'

const TYPE_ICON = {
    order: '🛒',
    delivery: '✅',
    stock: '⚠️',
    coupon: '🏷️',
}

const SEEN_KEY = 'admin_notifications_seen_at'

const timeAgo = (ts) => {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

const NotificationBell = ({ token }) => {
    const [notifications, setNotifications] = useState([])
    const [open, setOpen] = useState(false)
    const [lastSeen, setLastSeen] = useState(() => Number(localStorage.getItem(SEEN_KEY)) || 0)
    const ref = useRef(null)

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/stock/notifications', { headers: { token } })
            if (res.data.success) setNotifications(res.data.notifications)
        } catch (_) {}
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [token])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const unreadCount = notifications.filter(n => n.timestamp > lastSeen).length

    const toggleOpen = () => {
        setOpen(o => !o)
        if (!open) {
            const now = Date.now()
            localStorage.setItem(SEEN_KEY, String(now))
            setLastSeen(now)
        }
    }

    return (
        <div className='relative' ref={ref}>
            <button
                onClick={toggleOpen}
                className='relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition cursor-pointer'
                aria-label='Notifications'
            >
                <span className='text-lg'>🔔</span>
                {unreadCount > 0 && (
                    <span className='absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center'>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className='absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in'>
                    <div className='px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-800'>Notifications</div>
                    {notifications.length === 0 ? (
                        <p className='text-center text-gray-400 text-sm py-8'>You're all caught up</p>
                    ) : (
                        <div className='divide-y divide-gray-50'>
                            {notifications.map(n => (
                                <div key={n.id} className='flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition'>
                                    <span className='text-lg shrink-0'>{TYPE_ICON[n.type] || '🔔'}</span>
                                    <div className='min-w-0'>
                                        <p className='text-sm font-medium text-gray-800'>{n.title}</p>
                                        <p className='text-xs text-gray-500 truncate'>{n.message}</p>
                                        <p className='text-[10px] text-gray-400 mt-0.5'>{timeAgo(n.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default NotificationBell
