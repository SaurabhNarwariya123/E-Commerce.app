import { POLICIES } from './policies.js'

// Offline policy lookup used only when the embedding service is unavailable (quota / outage).
// Plain word overlap against the policy text in policies.js; no model involved, so the reply is the
// store's own wording. Returns null when nothing matches well enough rather than guessing.
const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'do', 'does', 'can', 'i', 'you', 'we', 'my', 'your', 'what', 'how', 'to', 'of', 'in', 'on', 'for', 'and', 'or', 'it', 'me', 'about', 'have', 'has', 'any', 'there', 'hai', 'hain', 'kya', 'kaise', 'ka', 'ki', 'ke', 'mein', 'me', 'kitne', 'din', 'policy', 'store', 'please'])

// Hinglish / alternate words mapped to the words used in the policy text.
const ALIASES = {
    days: 'day', day: 'day', window: 'day', long: 'day', time: 'day', period: 'day',
    wapas: 'return', vapas: 'return', returns: 'return', returning: 'return', exchange: 'exchange',
    paisa: 'refund', paise: 'refund', refunds: 'refund', refunded: 'refund',
    delivery: 'delivery', deliver: 'delivery', shipping: 'shipping', ship: 'shipping',
    cancel: 'cancel', cancellation: 'cancel', cancelled: 'cancel',
    gift: 'gift', wrap: 'gift', wrapping: 'gift',
    payment: 'payment', pay: 'payment', cod: 'cash', razorpay: 'razorpay', stripe: 'stripe',
    privacy: 'privacy', data: 'data', password: 'password',
    contact: 'contact', support: 'support', email: 'email', track: 'track', tracking: 'track',
}

const tokens = (text) =>
    String(text).toLowerCase().match(/[a-z0-9]+/g)
        ?.filter(w => !STOP.has(w) && w.length > 2)
        .map(w => ALIASES[w] || w) || []

const sectionText = (s) => (Array.isArray(s.body) ? s.body.join(' ') : s.body)

const SECTIONS = POLICIES.flatMap(p => p.sections.map(s => ({
    policy: p.title,
    heading: s.heading,
    body: sectionText(s),
    words: new Set(tokens(`${p.title} ${s.heading} ${sectionText(s)}`)),
    headingWords: new Set(tokens(s.heading)),
})))

export const lexicalPolicyAnswer = (query) => {
    const q = [...new Set(tokens(query))]
    if (!q.length) return null

    let best = null
    for (const s of SECTIONS) {
        const hits = q.filter(w => s.words.has(w)).length
        if (!hits) continue
        // A heading match is the strongest signal (FAQ headings are the questions themselves).
        const score = hits + q.filter(w => s.headingWords.has(w)).length
        if (!best || score > best.score) best = { ...s, score }
    }
    // Require a meaningful overlap: at least two points, so one stray word does not produce an answer.
    if (!best || best.score < 2) return null
    return `${best.policy} - ${best.heading}: ${best.body}`
}
