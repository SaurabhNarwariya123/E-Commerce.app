import { TOOL_REGISTRY } from '../../tools/toolRegistry.js'
import { INTENT_TOOL_MAP, NON_TOOL_INTENTS } from '../../intents.js'

const PARAM_LABELS = {
    orderId: 'order ID',
    productId: 'product ID',
    productName: 'product name',
    customerId: 'customer ID',
    customerName: 'customer name',
    customerEmail: 'customer email',
    deliveryPersonId: 'delivery person ID',
    deliveryPersonName: 'delivery person name',
    period: 'time period (for example "this month" or "last 30 days")',
    days: 'number of days',
}

const isParamSatisfied = (spec, params) => spec.split('_or_').some(k => params[k] !== undefined)

const humanizeSpec = (spec) => spec.split('_or_').map(k => PARAM_LABELS[k] || k).join(' or ')

export const routeToTool = (state) => {
    if (!state.intent || NON_TOOL_INTENTS.includes(state.intent)) return {}

    const entry = TOOL_REGISTRY[state.intent]
    // An intent with no registered tool, or one whose registry entry disagrees with the
    // declared intent->tool mapping, must never run anything.
    if (!entry || INTENT_TOOL_MAP[state.intent] !== entry.tool) {
        console.error(`[chat ${state.requestId}] no valid tool for intent ${state.intent}`)
        return { toolError: 'this question is not supported yet' }
    }

    const params = state.params || {}
    for (const spec of entry.requiredParams) {
        if (!isParamSatisfied(spec, params)) {
            return { missingParam: humanizeSpec(spec) }
        }
    }
    return { missingParam: null }
}
