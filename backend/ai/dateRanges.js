// Calendar periods are computed in IST because the store bills in INR.
// Order timestamps are stored as epoch milliseconds, so ranges are [from, to) in epoch ms.
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

export const PERIODS = ['today', 'yesterday', 'this_week', 'this_month', 'last_month', 'last_7_days', 'last_30_days']

// Midnight IST of the day containing `ms`, returned as epoch ms.
const istDayStart = (ms) => Math.floor((ms + IST_OFFSET_MS) / DAY_MS) * DAY_MS - IST_OFFSET_MS

const istParts = (ms) => {
    const d = new Date(ms + IST_OFFSET_MS)
    return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate(), weekday: d.getUTCDay() }
}

const istMonthStart = (year, month) => Date.UTC(year, month, 1) - IST_OFFSET_MS

export const istDateKey = (ms) => new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 10)

export const formatMonthLabel = (ms) =>
    new Date(ms + IST_OFFSET_MS).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })

// Returns { from, to, label } or null for an unknown period.
export const resolvePeriod = (period, now = Date.now(), days) => {
    if (!period && days) return { from: now - days * DAY_MS, to: now, label: `the last ${days} days` }

    const todayStart = istDayStart(now)
    const { year, month, weekday } = istParts(now)

    switch (period) {
        case 'today':
            return { from: todayStart, to: now, label: 'today' }
        case 'yesterday':
            return { from: todayStart - DAY_MS, to: todayStart, label: 'yesterday' }
        case 'this_week': {
            const sinceMonday = (weekday + 6) % 7 // weeks start on Monday
            return { from: todayStart - sinceMonday * DAY_MS, to: now, label: 'this week (since Monday)' }
        }
        case 'this_month': {
            const from = istMonthStart(year, month)
            return { from, to: now, label: `this month (${formatMonthLabel(from)})` }
        }
        case 'last_month': {
            const from = istMonthStart(year, month - 1)
            return { from, to: istMonthStart(year, month), label: formatMonthLabel(from) }
        }
        case 'last_7_days':
            return { from: now - 7 * DAY_MS, to: now, label: 'the last 7 days' }
        case 'last_30_days':
            return { from: now - 30 * DAY_MS, to: now, label: 'the last 30 days' }
        default:
            return null
    }
}
