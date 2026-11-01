import { jest } from '@jest/globals'

export const ADMIN = 'admin@shop.test'
process.env.ADMIN_EMAIL = ADMIN
process.env.JWT_SECRET = 'test-secret'

// Controls what the fake Gemini returns. `classify` is the intent classifier, `answer` the answer writer.
export const llm = { classify: jest.fn(), answer: jest.fn(), calls: { classify: 0, answer: 0 } }

// Must run before the graph is first imported in a test file; mocks the model, never the graph's own code.
export const loadGraph = async () => {
    jest.unstable_mockModule('../../ai/llm.js', () => ({
        LLM_TIMEOUT_MS: 1000,
        getChatModel: () => ({
            withStructuredOutput: () => ({ invoke: (input) => { llm.calls.classify++; return llm.classify(input) } }),
            invoke: (input) => { llm.calls.answer++; return llm.answer(input) },
        }),
        invokeWithTimeout: (runnable, input) => Promise.resolve().then(() => runnable.invoke(input)),
        contentToText: (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.map(p => p?.text || '').join('') : ''),
    }))
    const { chatGraph, routing } = await import('../../ai/graph/chatGraph.js')
    const { TOOL_REGISTRY } = await import('../../ai/tools/toolRegistry.js')
    return { chatGraph, routing, TOOL_REGISTRY }
}

let n = 0
export const ask = (chatGraph, message, over = {}) =>
    chatGraph.invoke({ adminId: ADMIN, adminEmail: ADMIN, message, history: [], requestId: `req-${++n}`, ...over })

export const resetLlm = () => {
    llm.classify.mockReset()
    llm.answer.mockReset()
    llm.calls.classify = 0
    llm.calls.answer = 0
}
