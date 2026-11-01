import mongoose from 'mongoose'
import orderModel from '../../models/orderModel.js'
import { IN_TRANSIT_STATUSES, CANCELLABLE_ISH_PENDING_STATUSES } from '../intents.js'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const DEFAULT_LIMIT = 20

// Whitelist, not blacklist: address, items, OTPs and other personal/secret fields never leave the database.
const ORDER_FIELDS = '_id status amount paymentMethod payment date otpVerified deliveryPersonName deliveryPersonId statusHistory'

// Read-only. `total` is the real number of matching orders; `orders` is capped for display.
export const findOrders = async (filter = {}, { limit = DEFAULT_LIMIT } = {}) => {
    const [orders, total] = await Promise.all([
        orderModel.find(filter).select(ORDER_FIELDS).sort({ date: -1 }).limit(limit).lean(),
        orderModel.countDocuments(filter),
    ])
    return { orders, total }
}

export const getNewOrders = async ({ sinceHours = 24 } = {}) => ({
    ...(await findOrders({ date: { $gte: Date.now() - sinceHours * HOUR_MS } })),
    window: { sinceHours },
})

export const getRecentOrders = async ({ limit = 5 } = {}) => findOrders({}, { limit })

export const getPendingOrders = async () =>
    findOrders({ status: { $in: CANCELLABLE_ISH_PENDING_STATUSES } })

export const getOrderStatus = async ({ orderId }) => {
    if (!orderId) throw new Error('orderId is required')
    if (!mongoose.isValidObjectId(orderId)) return null
    return orderModel.findById(orderId).select(ORDER_FIELDS).lean()
}

export const getCancelledOrders = async ({ sinceDays } = {}) => {
    const filter = { status: 'Cancelled' }
    if (sinceDays) filter.date = { $gte: Date.now() - sinceDays * DAY_MS }
    return { ...(await findOrders(filter)), window: { sinceDays: sinceDays || null } }
}

// COD orders whose OTP is still unverified. Delivered/cancelled orders are finished, so they are not "waiting on OTP".
export const getUnverifiedCODOrders = async () =>
    findOrders({ paymentMethod: 'COD', otpVerified: { $ne: true }, status: { $nin: ['Cancelled', 'Delivered'] } })

// In-transit orders carry their status history so delayed-order logic can look at the last change.
export const getInTransitOrders = async () =>
    findOrders({ status: { $in: IN_TRANSIT_STATUSES } }, { limit: 200 })
