import React, { useState } from 'react'
import ChatPanel from './ChatPanel'

// Floating chat bubble — click to open/close the assistant as a popup,
// available on every admin page (not just the /admin/assistant route).
const ChatWidget = ({ token }) => {
    const [open, setOpen] = useState(false)

    return (
        <>
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-up">
                    <ChatPanel token={token} onClose={() => setOpen(false)} compact />
                </div>
            )}

            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                aria-label={open ? 'Close assistant' : 'Open assistant'}
            >
                {open ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <span className="text-lg font-bold">AI</span>
                )}
            </button>
        </>
    )
}

export default ChatWidget
