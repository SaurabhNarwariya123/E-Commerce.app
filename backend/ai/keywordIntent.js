import { INTENTS, RAG_INTENTS } from './intents.js'

// Used only when Gemini cannot classify (quota exhausted, outage, timeout). Deliberately conservative:
// a rule fires only on an unambiguous phrase, and anything unclear returns null so the admin gets the
// "AI is unavailable" reply instead of a wrong answer. Parameters are still bounded by sanitizeParams.
const OBJECT_ID = /\b[0-9a-fA-F]{24}\b/
const has = (text, re) => re.test(text)

const WRITE_VERB = /\b(cancel|update|assign|delete|remove|approve|reject|send|change|set|edit)\b/

// "last 7 days" / "in 30 days" -> a day count; "last 12 hours" -> an hour count. Bounds are applied later.
const windowParams = (t) => {
    const params = {}
    const d = t.match(/(\d{1,3})\s*days?/)
    const h = t.match(/(\d{1,3})\s*(hours?|hrs?)/)
    if (d) { params.days = Number(d[1]); params.sinceDays = Number(d[1]) }
    if (h) params.sinceHours = Number(h[1])
    return params
}

const base = (message) => {
    const t = String(message || '').toLowerCase()
    return { t, window: windowParams(t) }
}

export const keywordIntent = (message) => {
    const { t, window } = base(message)
    if (!t.trim() || has(t, WRITE_VERB)) return null

    const hasOrderId = OBJECT_ID.test(t)

    if (hasOrderId && has(t, /\b(transit|deliver|delivery|track|shipping)\b/)) return { intent: INTENTS.ORDER_TRANSIT_STATUS, params: {} }
    if (hasOrderId && has(t, /\b(status|order)\b/)) return { intent: INTENTS.ORDER_STATUS, params: {} }

    if (has(t, /out of stock|stock (khatam|out)|sold out/)) return { intent: INTENTS.OUT_OF_STOCK, params: {} }
    if (has(t, /low stock|stock (is )?low|running low|kam stock/)) return { intent: INTENTS.LOW_STOCK, params: {} }

    if (has(t, /cod/) && has(t, /unverified|not verified|otp/)) return { intent: INTENTS.UNVERIFIED_COD_ORDERS, params: {} }
    if (has(t, /cancel+ed/)) return { intent: INTENTS.CANCELLED_ORDERS, params: { ...window } }
    if (has(t, /delayed|delay|late orders|stuck/)) return { intent: INTENTS.DELAYED_ORDERS, params: {} }
    if (has(t, /pending/)) return { intent: INTENTS.PENDING_ORDERS, params: {} }
    if (has(t, /\b(new|naye)\b.*orders?|orders?.*\b(today|last 24)/)) return { intent: INTENTS.NEW_ORDERS, params: { ...window } }
    if (has(t, /(sales|revenue)/) && window.days && !has(t, /today|yesterday|this (week|month)/)) return { intent: INTENTS.SALES_SUMMARY, params: { days: window.days } }
    if (has(t, /(latest|recent|last)\b.*orders?/)) {
        const n = t.match(/(\d{1,2})\s*(latest|recent|last)?\s*orders?/)
        return { intent: INTENTS.RECENT_ORDERS, params: n ? { limit: Number(n[1]) } : {} }
    }

    if (has(t, /previous month|last month/) && has(t, /revenue|sales/)) return { intent: INTENTS.PREVIOUS_MONTH_REVENUE, params: {} }
    if (has(t, /top[- ]selling|best[- ]sell|best selling/)) return { intent: INTENTS.TOP_SELLING_PRODUCT, params: { ...window } }
    if (has(t, /today'?s? (sales|revenue)|(sales|revenue).*today|aaj ki sale/)) return { intent: INTENTS.TODAY_SALES_SUMMARY, params: {} }
    if (has(t, /trend/)) return { intent: INTENTS.ORDER_TREND, params: { ...window } }
    if (has(t, /this month/) && has(t, /sales|revenue/)) return { intent: INTENTS.SALES_SUMMARY, params: { period: 'this_month' } }
    if (has(t, /this week/) && has(t, /sales|revenue/)) return { intent: INTENTS.SALES_SUMMARY, params: { period: 'this_week' } }
    if (has(t, /yesterday/) && has(t, /sales|revenue/)) return { intent: INTENTS.SALES_SUMMARY, params: { period: 'yesterday' } }

    if (has(t, /delivery (persons?|boys?|partners?|agents?)/) && has(t, /active|available|online/)) return { intent: INTENTS.ACTIVE_DELIVERY_PERSONS, params: {} }
    if (has(t, /(total|how many).*customers?|customers? (count|total)/)) return { intent: INTENTS.TOTAL_CUSTOMERS, params: {} }
    if (has(t, /(new|recent).*(customers?|signups?|sign-ups?)/)) return { intent: INTENTS.NEW_CUSTOMERS, params: { ...window } }
    if (has(t, /coupons?/) && has(t, /active|expir|valid|available/)) return { intent: INTENTS.ACTIVE_COUPONS, params: has(t, /expir/) ? { expiringWithinDays: 7 } : {} }

    if (has(t, /return|refund|exchange|privacy|terms|policy|gift wrap|payment method|shipping|free delivery|how long.*deliver|contact support|wapas/)) return { intent: RAG_INTENTS.POLICY_QA, params: {} }

    return null
}
