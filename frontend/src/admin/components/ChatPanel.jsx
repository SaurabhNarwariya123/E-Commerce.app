import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'

const SUGGESTIONS = [
    "Today's sales",
    'Low stock items',
    'Top customers',
    'Pending orders',
    'Active coupon performance',
]

const STORAGE_KEY = 'admin_assistant_history'

const TypingBubble = () => (
    <div className="flex items-end gap-2.5 max-w-[80%]">
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">AI</div>
        <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
        </div>
    </div>
)

const Message = ({ role, text, sources, error }) => {
    const isUser = role === 'user'
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-2.5 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isUser ? 'bg-gray-700 text-white' : 'bg-emerald-600 text-white'}`}>
                    {isUser ? 'A' : 'AI'}
                </div>
                <div>
                    <div
                        className={`px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                            isUser
                                ? 'bg-emerald-600 text-white rounded-2xl rounded-br-sm'
                                : error
                                    ? 'bg-red-50 text-red-600 rounded-2xl rounded-bl-sm border border-red-100'
                                    : 'bg-gray-100 text-[var(--adm-ink)] rounded-2xl rounded-bl-sm'
                        }`}
                    >
                        {text}
                    </div>
                    {sources?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {sources.map((s, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[var(--adm-muted)]">
                                    {typeof s === 'string' ? s : s.label || s.title || 'source'}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * Shared chat body — used by both the full-page Assistant screen and the
 * floating ChatWidget popup, so the two stay in sync via sessionStorage.
 */
const ChatPanel = ({ token, onClose, compact = false }) => {
    const [messages, setMessages] = useState(() => {
        try {
            const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
            return Array.isArray(saved) ? saved : []
        } catch {
            return []
        }
    })
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)) } catch { /* ignore quota errors */ }
    }, [messages])

    const send = async (text) => {
        const question = (text ?? input).trim()
        if (!question || sending) return

        // Last few non-error turns give the backend context for follow-ups ("uska status batao")
        const history = messages
            .filter(m => !m.error)
            .slice(-6)
            .map(m => ({ role: m.role, text: m.text }))

        setMessages(prev => [...prev, { role: 'user', text: question }])
        setInput('')
        setSending(true)

        try {
            const res = await axios.post(backendUrl + '/api/chat', { message: question, history }, { headers: { token } })
            if (res.data.success) {
                setMessages(prev => [...prev, { role: 'assistant', text: res.data.answer, sources: res.data.sources }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: res.data.message || "Sorry, I couldn't answer that.", error: true }])
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: err.response?.data?.message || 'Something went wrong. Please try again.', error: true }])
        }

        setSending(false)
        inputRef.current?.focus()
    }

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
        }
    }

    const clearChat = () => setMessages([])

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">AI</div>
                    <div>
                        <h2 className="text-sm font-semibold text-[var(--adm-ink)]">Store Assistant</h2>
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> AI &middot; Online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={clearChat}
                        disabled={messages.length === 0}
                        className="text-xs text-[var(--adm-muted)] hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                        Clear
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--adm-muted)] hover:bg-gray-100 hover:text-[var(--adm-muted)] transition cursor-pointer"
                            aria-label="Close chat"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-4 ${compact ? 'text-sm' : ''}`}>
                {messages.length === 0 && !sending && (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-[var(--adm-muted)]">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">AI</div>
                        <p className="text-sm text-[var(--adm-muted)] font-medium">Ask me about your store</p>
                        <p className="text-xs max-w-xs">Sales, orders, stock, customers &mdash; ask in plain English and I'll pull it from your data.</p>
                    </div>
                )}

                {messages.map((m, i) => (
                    <Message key={i} role={m.role} text={m.text} sources={m.sources} error={m.error} />
                ))}

                {sending && <TypingBubble />}
                <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            <div className="px-5 pt-2 flex flex-wrap gap-2 shrink-0">
                {SUGGESTIONS.map(s => (
                    <button
                        key={s}
                        onClick={() => send(s)}
                        disabled={sending}
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-[var(--adm-muted)] hover:bg-emerald-50 hover:text-emerald-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Input bar */}
            <div className="p-4 shrink-0">
                <div className="flex items-end gap-2 bg-gray-100 rounded-2xl px-3 py-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Ask about sales, orders, stock, customers..."
                        rows={1}
                        className="flex-1 bg-transparent resize-none outline-none text-sm py-1.5 max-h-28 placeholder:text-[var(--adm-muted)]"
                    />
                    <button
                        onClick={() => send()}
                        disabled={sending || !input.trim()}
                        className="w-9 h-9 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700 transition cursor-pointer"
                        aria-label="Send message"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatPanel
