import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

let _model = null

export const LLM_TIMEOUT_MS = Number(process.env.AI_RESPONSE_TIMEOUT) || 15000

export const getChatModel = () => {
    if (_model) return _model

    const apiKey = process.env.GOOGLE_gemini_API_KEY
    if (!apiKey) {
        throw new Error('GOOGLE_gemini_API_KEY is not configured')
    }

    _model = new ChatGoogleGenerativeAI({
        apiKey,
        model: process.env.AI_MODEL || 'gemini-2.5-flash',
        temperature: 0,
        maxOutputTokens: Number(process.env.AI_MAX_TOKENS) || 2048,
        maxRetries: 1, // bounded: one retry for transient provider errors, never a loop
    })
    return _model
}

// Rejects after `ms` and aborts the in-flight request so a hung provider cannot hold the chat open.
export const invokeWithTimeout = async (runnable, input, ms = LLM_TIMEOUT_MS) => {
    const controller = new AbortController()
    let timer
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
            controller.abort()
            reject(new Error(`LLM call timed out after ${ms}ms`))
        }, ms)
    })
    try {
        return await Promise.race([runnable.invoke(input, { signal: controller.signal }), timeout])
    } finally {
        clearTimeout(timer)
    }
}

// Gemini may return content as a string or as an array of text parts.
export const contentToText = (content) => {
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
        return content.map(p => (typeof p === 'string' ? p : p?.text || '')).join('')
    }
    return ''
}
