import { validateToolResult } from '../../validators.js'

// Separates three outcomes before anything reaches an answer:
//   error  - the tool failed, or returned data in an unexpected shape  -> toolError
//   empty  - the query worked but nothing matched                      -> noDataFound
//   data   - a valid result (including legitimate zeros)
export const validateResult = (state) => {
    if (state.toolError) return {}

    const check = validateToolResult(state.intent, state.toolResult)
    if (!check.ok) {
        console.error(`[chat ${state.requestId}] invalid ${state.intent} result: ${check.error}`)
        return { toolError: 'the data came back in an unexpected format', toolResult: null, noDataFound: false }
    }
    return { noDataFound: check.empty }
}
