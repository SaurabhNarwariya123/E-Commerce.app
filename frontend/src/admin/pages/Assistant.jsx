import React from 'react'
import ChatPanel from '../components/ChatPanel'

const Assistant = ({ token }) => {
    return (
        <div className="h-full max-h-[calc(100vh-140px)] bg-white border border-gray-200 rounded-xl overflow-hidden animate-fade-in-up">
            <h1 className="sr-only">AI Assistant</h1>
            <ChatPanel token={token} />
        </div>
    )
}

export default Assistant
