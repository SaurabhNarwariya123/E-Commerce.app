import { TOOL_REGISTRY } from '../../tools/toolRegistry.js'
import { withTimeout } from '../../timeout.js'

const toolTimeoutMs = () => Number(process.env.AI_TOOL_TIMEOUT_MS) || 10000

export const executeExistingController = async (state) => {
    const entry = TOOL_REGISTRY[state.intent]
    if (!entry) return { toolError: 'this question is not supported yet' }

    // Least privilege: only the params this tool declares are forwarded.
    const params = state.params || {}
    const args = Object.fromEntries(entry.allowedParams.filter(k => params[k] !== undefined).map(k => [k, params[k]]))

    try {
        const result = await withTimeout(Promise.resolve(entry.fn(args)), toolTimeoutMs(), 'tool timed out')
        return { toolResult: result, executedTool: entry.tool, sourceLabel: entry.sourceLabel }
    } catch (err) {
        // Real cause goes to the server log; the admin gets a safe, honest message.
        console.error(`[chat ${state.requestId}] tool ${entry.tool} failed for ${state.intent}:`, err.message)
        return { toolError: err.message === 'tool timed out' ? 'the data source took too long to respond' : 'the data source returned an error' }
    }
}
