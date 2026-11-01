// Per-admin sliding-window limiter for the chat endpoint (every message can trigger an LLM call).
// In-memory: fine for one server instance; use a shared store (Redis is already a dependency) if you scale out.
const WINDOW_MS = Number(process.env.CHAT_RATE_WINDOW_MS) || 60 * 1000
const MAX_REQUESTS = Number(process.env.CHAT_RATE_MAX) || 20

export const createChatRateLimit = ({ windowMs = WINDOW_MS, max = MAX_REQUESTS, now = Date.now } = {}) => {
    const hits = new Map() // adminId -> timestamps inside the window

    return (req, res, next) => {
        const key = req.admin?.id || req.ip
        const t = now()
        const recent = (hits.get(key) || []).filter(ts => t - ts < windowMs)

        if (recent.length >= max) {
            const retryAfter = Math.max(1, Math.ceil((recent[0] + windowMs - t) / 1000))
            res.set('Retry-After', String(retryAfter))
            return res.status(429).json({ success: false, message: 'Too many chat requests. Please wait a moment and try again.' })
        }

        recent.push(t)
        hits.set(key, recent)

        // Drop idle keys so the map cannot grow without bound.
        if (hits.size > 1000) {
            for (const [k, list] of hits) if (!list.some(ts => t - ts < windowMs)) hits.delete(k)
        }
        next()
    }
}

export default createChatRateLimit()
