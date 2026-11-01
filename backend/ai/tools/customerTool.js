import mongoose from 'mongoose'
import userModel from '../../models/userModel.js'
import { findOrders } from './orderTool.js'

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_NEW_CUSTOMERS = 20

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const exactCI = (s) => new RegExp(`^${escapeRegex(s.trim())}$`, 'i')

export const getTotalCustomers = async () => userModel.countDocuments()

// Returns { customerName, orders, total } | { ambiguous: [names] } | null (customer not found)
export const getCustomerOrderHistory = async ({ customerId, customerName, customerEmail } = {}) => {
    if (!customerId && !customerName && !customerEmail) {
        throw new Error('customerId, customerName, or customerEmail is required')
    }

    let matches
    if (customerId) {
        if (!mongoose.isValidObjectId(customerId)) return null
        const u = await userModel.findById(customerId, 'name').lean()
        matches = u ? [u] : []
    } else if (customerEmail) {
        matches = await userModel.find({ email: exactCI(customerEmail) }, 'name').limit(2).lean()
    } else {
        matches = await userModel.find({ name: exactCI(customerName) }, 'name').limit(6).lean()
    }

    if (matches.length === 0) return null
    if (matches.length > 1) return { ambiguous: matches.slice(0, 5).map(m => m.name) }

    const [user] = matches
    const { orders, total } = await findOrders({ userId: user._id.toString() })
    return { customerName: user.name, orders, total }
}

export const getNewCustomers = async ({ sinceDays = 7 } = {}) => {
    const filter = { createdAt: { $gte: new Date(Date.now() - sinceDays * DAY_MS) } }
    const [customers, total] = await Promise.all([
        userModel.find(filter, 'name email createdAt').sort({ createdAt: -1 }).limit(MAX_NEW_CUSTOMERS).lean(),
        userModel.countDocuments(filter),
    ])
    return { sinceDays, customers, total }
}
