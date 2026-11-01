import { genericSummary } from '../../formatters.js'

const NUMBER = /\d[\d,]*(?:\.\d+)?/g

const numbersIn = (text) => new Set((String(text).match(NUMBER) || []).map(n => n.replace(/,/g, '')))

// Every number or 24-hex id in a model-written answer must exist in the verified data
// (or in the admin's own question, e.g. "last 7 days"). Returns the unsupported values.
export const unsupportedFacts = (answer, contextText, question = '') => {
    const allowed = numbersIn(`${contextText} ${question}`)
    const claimed = [...numbersIn(answer)]
    const bad = claimed.filter(n => !allowed.has(n))

    const ids = String(answer).match(/\b[0-9a-fA-F]{24}\b/g) || []
    const lowerContext = String(contextText).toLowerCase()
    for (const id of ids) if (!lowerContext.includes(id.toLowerCase())) bad.push(id)

    return bad
}

// Deterministic template answers are exact by construction, so only model-written text is checked.
export const validateAnswer = (state) => {
    if (state.answerSource !== 'llm') return {}

    const bad = unsupportedFacts(state.answer, state.contextText, state.cleanedMessage)
    if (bad.length === 0) return {}

    console.error(`[chat ${state.requestId}] model answer rejected, unsupported values: ${bad.slice(0, 5).join(', ')}`)
    return { answer: state.ragFallback || genericSummary(state.toolResult), answerSource: 'fallback' }
}
