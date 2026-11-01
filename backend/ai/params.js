import { PERIODS } from './dateRanges.js'

const OBJECT_ID = /\b[0-9a-fA-F]{24}\b/
const MAX_STRING = 100

const NUMERIC_BOUNDS = {
    days: [1, 365],
    sinceDays: [1, 365],
    sinceHours: [1, 24 * 90],
    limit: [1, 20],
    threshold: [0, 1000],
    expiringWithinDays: [1, 365],
}

const STRING_KEYS = [
    'orderId', 'productId', 'productName', 'customerId', 'customerName',
    'customerEmail', 'deliveryPersonId', 'deliveryPersonName',
]

const ID_KEYS = ['orderId', 'productId', 'customerId', 'deliveryPersonId']

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim()

// The classifier is a language model: it can return values the admin never typed.
// Anything that identifies a record must literally appear in what the admin wrote
// (this message, or an earlier turn when resolving "that order"). Numbers are clamped.
export const sanitizeParams = (raw = {}, message = '', history = []) => {
    const haystack = norm([message, ...history.map(h => h.text)].join(' \n '))
    const out = {}

    for (const key of STRING_KEYS) {
        const value = raw[key]
        if (typeof value !== 'string') continue
        const trimmed = value.trim().slice(0, MAX_STRING)
        if (!trimmed) continue
        if (ID_KEYS.includes(key) && !/^[0-9a-fA-F]{24}$/.test(trimmed)) continue
        if (!haystack.includes(norm(trimmed))) continue
        out[key] = trimmed
    }

    // An id typed in the message beats whatever the classifier extracted.
    const typedId = message.match(OBJECT_ID)?.[0]
    if (typedId && !out.orderId) out.orderId = typedId

    for (const [key, [min, max]] of Object.entries(NUMERIC_BOUNDS)) {
        const value = Number(raw[key])
        if (raw[key] === undefined || raw[key] === null || !Number.isFinite(value)) continue
        out[key] = Math.min(max, Math.max(min, Math.round(value)))
    }

    if (PERIODS.includes(raw.period)) out.period = raw.period

    return out
}
