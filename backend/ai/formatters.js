import { INTENTS } from './intents.js'

const MAX_LIST = 10
const TIME_ZONE = 'Asia/Kolkata'

// Missing or non-numeric values must never be shown as zero.
const money = (n) => (Number.isFinite(Number(n)) && n !== null && n !== '' ? `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'amount unavailable')
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const fmtDate = (d) => {
    const date = new Date(d)
    return Number.isNaN(date.getTime()) || d === null || d === undefined ? 'unknown date' : date.toLocaleDateString('en-IN', { timeZone: TIME_ZONE })
}
const sizeList = (sizes) => sizes.map(s => `${s.size}: ${s.qty}`).join(', ')

const orderLine = (o) => `#${o._id} - ${o.status} - ${money(o.amount)} (${o.paymentMethod}) - ${fmtDate(o.date)}`

const listWithMore = (items, toLine, total = items.length, max = MAX_LIST) => {
    const shown = items.slice(0, max)
    const rest = total - shown.length
    const body = shown.map(toLine).join('\n')
    return rest > 0 ? `${body}\n...and ${rest} more` : body
}

const orderList = (data, label, max) =>
    `${plural(data.total, 'order')} ${label}:\n${listWithMore(data.orders, orderLine, data.total, max)}`

const ambiguousMessage = (names, what) =>
    `More than one ${what} matches: ${names.join(', ')}. Please say which one you mean.`

const periodNote = (label) => (/^(today|yesterday)$/.test(label) ? ' (IST)' : '')

// Each formatter turns validated tool output into the final text. Every number, id and date shown comes straight from `d`.
export const FORMATTERS = {
    [INTENTS.NEW_ORDERS]: (d) => orderList(d, `placed in the last ${d.window?.sinceHours ?? 24} hours`),
    [INTENTS.RECENT_ORDERS]: (d) => `Latest ${plural(d.orders.length, 'order')} (of ${d.total} total):\n${listWithMore(d.orders, orderLine, d.orders.length, 20)}`,
    [INTENTS.PENDING_ORDERS]: (d) => orderList(d, 'pending (Order Placed or Order Confirmed)'),
    [INTENTS.CANCELLED_ORDERS]: (d) => orderList(d, d.window?.sinceDays ? `cancelled in the last ${d.window.sinceDays} days` : 'cancelled'),
    [INTENTS.UNVERIFIED_COD_ORDERS]: (d) => orderList(d, 'with an unverified COD OTP (still open)'),
    [INTENTS.DELAYED_ORDERS]: (d) =>
        `${orderList(d, `in transit with no status update for ${d.window?.thresholdHours ?? 24}+ hours`)}${d.incomplete ? '\n(Only the 200 most recent in-transit orders were checked, so there may be more.)' : ''}`,

    [INTENTS.ORDER_STATUS]: (o) => `Order #${o._id} is "${o.status}" - ${money(o.amount)} via ${o.paymentMethod}, placed on ${fmtDate(o.date)}.`,
    [INTENTS.ORDER_TRANSIT_STATUS]: (o) => {
        const last = o.statusHistory[o.statusHistory.length - 1]
        const when = last?.timestamp ? `, last updated ${fmtDate(last.timestamp)}` : ''
        const who = o.deliveryPersonName ? `delivery by ${o.deliveryPersonName}` : 'no delivery person assigned yet'
        return `Order #${o.orderId} is "${o.status}" (${who}${when}).`
    },

    [INTENTS.SALES_SUMMARY]: (d) => formatSales(d),
    [INTENTS.PREVIOUS_MONTH_REVENUE]: (d) => formatSales(d),
    [INTENTS.TODAY_SALES_SUMMARY]: (d) => formatSales(d),
    [INTENTS.TOP_SELLING_PRODUCT]: (d) =>
        `Top product by revenue in the last ${d.days} days: ${d.name} - ${plural(d.unitsSold, 'unit')} sold, ${money(d.revenue)} revenue.`,
    [INTENTS.ORDER_TREND]: (d) => {
        const head = `Last ${d.days} days: ${plural(d.totalOrders, 'order')}, ${money(d.totalRevenue)} revenue (IST days, cancelled orders excluded).`
        const peak = d.daily.reduce((best, x) => (x.revenue > best.revenue ? x : best), d.daily[0])
        const peakLine = peak && peak.revenue > 0 ? `\nBest day: ${peak.date} with ${money(peak.revenue)} from ${plural(peak.orders, 'order')}.` : ''
        const rows = d.days <= 14 ? `\n${d.daily.map(x => `${x.date}: ${plural(x.orders, 'order')}, ${money(x.revenue)}`).join('\n')}` : ''
        return `${head}${peakLine}${rows}`
    },

    [INTENTS.ACTIVE_DELIVERY_PERSONS]: (d) => `${plural(d.length, 'active delivery person account')}: ${d.map(p => p.name).join(', ')}.`,
    [INTENTS.DELIVERY_PERSON_ORDERS]: (d) =>
        d.ambiguous ? ambiguousMessage(d.ambiguous, 'delivery person') : orderList(d, `assigned to ${d.personName}`),

    [INTENTS.LOW_STOCK]: (d) => {
        const body = `${plural(d.total, 'product')} with a size at ${d.threshold} units or fewer (but not zero):\n${listWithMore(d.products, p => `${p.name} (${sizeList(p.sizes)})`, d.total)}`
        return d.untracked ? `${body}\n${plural(d.untracked, 'product')} ${d.untracked === 1 ? 'has' : 'have'} no stock data and could not be checked.` : body
    },
    [INTENTS.OUT_OF_STOCK]: (d) => {
        const line = (p) => (p.fullyOut ? `${p.name} (all sizes out)` : `${p.name} (out: ${p.sizes.map(s => s.size).join(', ')})`)
        const body = `${plural(d.total, 'product')} with at least one size out of stock (${d.fullyOutCount} completely out):\n${listWithMore(d.products, line, d.total)}`
        return d.untracked ? `${body}\n${plural(d.untracked, 'product')} ${d.untracked === 1 ? 'has' : 'have'} no stock data and could not be checked.` : body
    },
    [INTENTS.PRODUCT_STOCK]: (p) => {
        if (p.ambiguous) return ambiguousMessage(p.ambiguous, 'product')
        if (!p.hasStockData) return `${p.name} has no stock data recorded.`
        const total = p.sizes.reduce((sum, s) => sum + s.qty, 0)
        return `${p.name} has ${plural(total, 'unit')} in stock (${sizeList(p.sizes)}).`
    },

    [INTENTS.TOTAL_CUSTOMERS]: (n) => `You have ${plural(n, 'customer')} in total.`,
    [INTENTS.CUSTOMER_ORDER_HISTORY]: (d) =>
        d.ambiguous ? ambiguousMessage(d.ambiguous, 'customer') : orderList(d, `placed by ${d.customerName}`),
    [INTENTS.NEW_CUSTOMERS]: (d) =>
        `${plural(d.total, 'new customer')} in the last ${d.sinceDays} days:\n${listWithMore(d.customers, c => `${c.name} (joined ${fmtDate(c.createdAt)})`, d.total)}`,

    [INTENTS.ACTIVE_COUPONS]: (d) => {
        const head = d.expiringWithinDays
            ? `${plural(d.total, 'active coupon')} expiring within ${d.expiringWithinDays} days:`
            : `${plural(d.total, 'active coupon')}:`
        const line = (c) => {
            const off = c.discountType === 'percent' ? `${c.discountValue}% off` : `${money(c.discountValue)} off`
            const usage = c.usageLimit ? `, used ${c.usedCount ?? 0}/${c.usageLimit}` : ''
            return `${c.code} - ${off}, expires ${fmtDate(c.expiryDate)}${usage}`
        }
        return `${head}\n${listWithMore(d.coupons, line, d.total)}`
    },
}

function formatSales(d) {
    const cancelled = d.cancelledOrders ? ` ${plural(d.cancelledOrders, 'cancelled order')} excluded.` : ''
    if (d.totalOrders === 0) return `No orders were placed ${d.periodLabel}${periodNote(d.periodLabel)}, so revenue is ${money(0)}.${cancelled}`
    return `Sales for ${d.periodLabel}${periodNote(d.periodLabel)}: ${money(d.totalRevenue)} from ${plural(d.totalOrders, 'order')} (average ${money(d.avgOrderValue)}).${cancelled}`
}

const who = (p = {}) => p.productName || p.productId || p.customerName || p.customerEmail || p.customerId || p.deliveryPersonName || p.deliveryPersonId

// What to say when the query ran fine but matched nothing. Never an error, never a made-up record.
const EMPTY = {
    [INTENTS.NEW_ORDERS]: (d, p) => `No orders were placed in the last ${p.sinceHours ?? 24} hours.`,
    [INTENTS.RECENT_ORDERS]: () => 'There are no orders yet.',
    [INTENTS.PENDING_ORDERS]: () => 'There are no pending orders.',
    [INTENTS.CANCELLED_ORDERS]: (d, p) => (p.sinceDays ? `No orders were cancelled in the last ${p.sinceDays} days.` : 'There are no cancelled orders.'),
    [INTENTS.UNVERIFIED_COD_ORDERS]: () => 'No open COD orders are waiting on OTP verification.',
    [INTENTS.DELAYED_ORDERS]: () => 'No in-transit orders are delayed right now.',
    [INTENTS.ORDER_STATUS]: (d, p) => `I couldn't find an order with ID ${p.orderId}.`,
    [INTENTS.ORDER_TRANSIT_STATUS]: (d, p) => `I couldn't find an order with ID ${p.orderId}.`,
    [INTENTS.TOP_SELLING_PRODUCT]: (d, p) => `No sales were recorded in the last ${p.days ?? 30} days, so there is no top product.`,
    [INTENTS.ORDER_TREND]: () => 'No orders were found in that period.',
    [INTENTS.ACTIVE_DELIVERY_PERSONS]: () => 'No delivery persons are active right now.',
    [INTENTS.DELIVERY_PERSON_ORDERS]: (d, p) => (d ? `${d.personName} has no assigned orders.` : `I couldn't find a delivery person matching "${who(p)}".`),
    [INTENTS.LOW_STOCK]: (d, p) => `No products have a size at ${p.threshold ?? 5} units or fewer (excluding zero).${d?.untracked ? ` ${plural(d.untracked, 'product')} could not be checked (no stock data).` : ''}`,
    [INTENTS.OUT_OF_STOCK]: (d) => `No products have a size that is out of stock.${d?.untracked ? ` ${plural(d.untracked, 'product')} could not be checked (no stock data).` : ''}`,
    [INTENTS.PRODUCT_STOCK]: (d, p) => `I couldn't find a product matching "${who(p)}".`,
    [INTENTS.CUSTOMER_ORDER_HISTORY]: (d, p) => (d ? `${d.customerName} has not placed any orders.` : `I couldn't find a customer matching "${who(p)}".`),
    [INTENTS.NEW_CUSTOMERS]: (d, p) => `No new customers signed up in the last ${p.sinceDays ?? 7} days.`,
    [INTENTS.ACTIVE_COUPONS]: (d, p) => (p.expiringWithinDays ? `No active coupons expire within ${p.expiringWithinDays} days.` : 'There are no active coupons right now.'),
}

export const emptyMessage = (intent, data, params = {}) => {
    try {
        return (EMPTY[intent] || (() => 'No matching records were found.'))(data, params)
    } catch {
        return 'No matching records were found.'
    }
}

// Deterministic last resort when the model's wording cannot be trusted: plain key/value lines from the data.
export const genericSummary = (data) => {
    if (data === null || data === undefined) return 'No data was available.'
    if (typeof data !== 'object') return `Result: ${data}`
    const target = Array.isArray(data) ? { count: data.length } : data
    const lines = Object.entries(target)
        .filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v))
        .map(([k, v]) => `${k}: ${v}`)
    return lines.length ? lines.join('\n') : 'The data was retrieved but could not be summarised.'
}

// Returns the final text for this intent, or null if there is no formatter or the data is not what it expects.
export const formatAnswer = (intent, data) => {
    const formatter = FORMATTERS[intent]
    if (!formatter) return null
    try {
        return formatter(data) || null
    } catch {
        return null
    }
}
