import { formatAnswer, emptyMessage } from '../../formatters.js'
import { RAG_INTENTS } from '../../intents.js'

const RAG_INTENT_NAMES = Object.values(RAG_INTENTS)

const GREETING_REPLY =
    "Hello! I'm your admin assistant. I can look up orders, sales, delivery, stock, customers and coupons, search products, and answer store policy questions (read-only). What would you like to know?"

// Decides what the admin sees. Every non-data outcome has a fixed reply; real data is turned into
// text by a deterministic formatter, so exact values never pass through the model.
// Only data no formatter handles falls through to generateAnswer (with minimal context).
export const buildContext = (state) => {
    const fixed = (answer) => ({ answer, answerSource: 'fixed' })

    if (state.permissionDenied) return fixed('You are not authorized to use this chatbot. Admin access is required.')
    if (state.invalidInput) return fixed(state.invalidInput)
    if (state.llmError) return fixed("The AI service is temporarily unavailable (it may be busy or its usage limit is reached). Please try again later. Meanwhile you can ask directly: low stock, out of stock, pending orders, cancelled orders, delayed orders, today's sales, this month's sales, total customers, active coupons, or an order ID's status.")
    if (state.unsupportedAction) {
        return fixed("This action isn't enabled — the chatbot is read-only reporting only. I can look up information, but I can't cancel, update, assign, or delete anything.")
    }
    if (state.intent === 'GREETING') return fixed(GREETING_REPLY)
    if (!state.intent || state.intent === 'UNKNOWN') {
        return fixed('I can only answer questions about orders, sales/reports, delivery, stock, customers, coupons, product search, and store policies (read-only). Could you rephrase your question around one of those topics?')
    }
    // RAG intents were already answered (or given passages) by retrieveDocs.
    if (RAG_INTENT_NAMES.includes(state.intent)) return state.answer ? {} : { contextText: state.contextText }
    if (state.missingParam) return fixed(`I need the ${state.missingParam} to answer that — could you provide it?`)
    if (state.toolError) return fixed(`I couldn't retrieve that information (${state.toolError}). Please try again.`)

    if (state.noDataFound) {
        return { answer: emptyMessage(state.intent, state.toolResult, state.params), answerSource: 'empty' }
    }

    const answer = formatAnswer(state.intent, state.toolResult)
    if (answer) return { answer, answerSource: 'template' }

    // Only this intent's validated data goes to the model; nothing from earlier turns or other tools.
    return { contextText: JSON.stringify(state.toolResult).slice(0, 6000) }
}
