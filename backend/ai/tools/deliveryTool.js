import mongoose from 'mongoose'
import { getLiveTracking, listDeliveryPersons } from '../../controllers/deliveryController.js'
import { invokeController } from './invokeController.js'
import { findOrders, getOrderStatus, getInTransitOrders } from './orderTool.js'
import { DELAYED_ORDER_THRESHOLD_HOURS } from '../intents.js'

// Only names leave this tool: no phone, email, location or credentials reach the answer layer.
export const getActiveDeliveryPersons = async () => {
    const result = await invokeController(getLiveTracking)
    if (!result.success) throw new Error(result.message || 'Failed to load delivery persons')
    return result.deliveryPersons.map(p => ({ _id: p._id, name: p.name }))
}

// Returns { id, name } | { ambiguous: [names] } | null
const resolveDeliveryPerson = async ({ deliveryPersonId, deliveryPersonName }) => {
    if (!deliveryPersonId && !deliveryPersonName) throw new Error('deliveryPersonId or deliveryPersonName is required')
    const result = await invokeController(listDeliveryPersons)
    if (!result.success) throw new Error(result.message || 'Failed to load delivery persons')

    if (deliveryPersonId) {
        const byId = result.deliveryPersons.find(dp => dp._id.toString() === deliveryPersonId)
        return byId ? { id: byId._id.toString(), name: byId.name } : null
    }

    const wanted = deliveryPersonName.toLowerCase()
    const exact = result.deliveryPersons.filter(dp => dp.name.toLowerCase() === wanted)
    const matches = exact.length ? exact : result.deliveryPersons.filter(dp => dp.name.toLowerCase().includes(wanted))
    if (matches.length === 0) return null
    if (matches.length > 1) return { ambiguous: matches.slice(0, 5).map(m => m.name) }
    return { id: matches[0]._id.toString(), name: matches[0].name }
}

export const getDeliveryPersonOrders = async (params = {}) => {
    const person = await resolveDeliveryPerson(params)
    if (!person || person.ambiguous) return person
    const { orders, total } = await findOrders({ deliveryPersonId: person.id })
    return { personName: person.name, orders, total }
}

export const getOrderDeliveryStatus = async ({ orderId }) => {
    if (!orderId) throw new Error('orderId is required')
    if (!mongoose.isValidObjectId(orderId)) return null
    const order = await getOrderStatus({ orderId })
    if (!order) return null
    return {
        orderId: order._id,
        status: order.status,
        statusHistory: order.statusHistory || [],
        deliveryPersonName: order.deliveryPersonName || null,
    }
}

export const getDelayedOrders = async ({ thresholdHours = DELAYED_ORDER_THRESHOLD_HOURS } = {}) => {
    const { orders, total: inTransitTotal } = await getInTransitOrders()
    const cutoff = Date.now() - thresholdHours * 60 * 60 * 1000

    const delayed = orders.filter(o => {
        const lastEntry = o.statusHistory?.[o.statusHistory.length - 1]
        const lastChangeTime = lastEntry ? new Date(lastEntry.timestamp).getTime() : o.date
        return lastChangeTime <= cutoff
    })

    return {
        orders: delayed,
        total: delayed.length,
        window: { thresholdHours },
        // If more in-transit orders exist than were inspected, the delayed count is a lower bound.
        incomplete: inTransitTotal > orders.length,
    }
}
