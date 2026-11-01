import { jest, describe, test, expect, beforeAll, beforeEach } from '@jest/globals'
import { llm, loadGraph, ask, resetLlm } from './harness.js'

// Retrieval and the product table are mocked; the graph's own RAG code (routing, fixed replies,
// live price lookup, answer validation, fallback) runs for real.
const retrieve = jest.fn()
const find = jest.fn()

let chatGraph, routing

beforeAll(async () => {
    jest.unstable_mockModule('../../ai/rag/retriever.js', () => ({ retrieve }))
    jest.unstable_mockModule('../../models/productModel.js', () => ({ default: { find } }))
    ;({ chatGraph, routing } = await loadGraph())
    jest.spyOn(console, 'error').mockImplementation(() => {})
})

beforeEach(() => {
    resetLlm()
    retrieve.mockReset()
    find.mockReset()
})

const policyDoc = (text) => ({ text, metadata: { type: 'policy', sourceId: 'return-policy:0:0' }, score: 0.9 })

describe('RAG routing', () => {
    test('policy and product intents go to retrieveDocs, tool intents still go to routeToTool', () => {
        expect(routing.afterDetect({ intent: 'POLICY_QA' })).toBe('retrieveDocs')
        expect(routing.afterDetect({ intent: 'PRODUCT_SEARCH' })).toBe('retrieveDocs')
        expect(routing.afterDetect({ intent: 'LOW_STOCK' })).toBe('routeToTool')
        expect(routing.afterDetect({ intent: 'POLICY_QA', llmError: true })).toBe('buildContext')
    })
})

describe('POLICY_QA', () => {
    test('retrieved passages are answered by the model and cited', async () => {
        llm.classify.mockResolvedValue({ intent: 'POLICY_QA' })
        retrieve.mockResolvedValue([policyDoc('Return Policy - Return Window\nWe offer a 7-day free return policy.')])
        llm.answer.mockResolvedValue({ content: 'Customers can return items within 7 days.' })

        const r = await ask(chatGraph, 'what is the return window?')

        expect(retrieve).toHaveBeenCalledWith('what is the return window?', { type: 'policy' })
        expect(r.answer).toBe('Customers can return items within 7 days.')
        expect(r.sources).toEqual(['Store policies'])
    })

    test('nothing relevant retrieved: fixed reply, model never writes an answer', async () => {
        llm.classify.mockResolvedValue({ intent: 'POLICY_QA' })
        retrieve.mockResolvedValue([])

        const r = await ask(chatGraph, 'do you sell insurance?')

        expect(r.answer).toMatch(/couldn't find that in the store's policy documents/)
        expect(llm.calls.answer).toBe(0)
        expect(r.sources).toEqual([])
    })

    test('a model answer with an invented number falls back to the retrieved passage', async () => {
        llm.classify.mockResolvedValue({ intent: 'POLICY_QA' })
        retrieve.mockResolvedValue([policyDoc('Return Policy - Return Window\nWe offer a 7-day free return policy.')])
        llm.answer.mockResolvedValue({ content: 'You have 30 days to return.' })

        const r = await ask(chatGraph, 'return window?')

        expect(r.answer).toContain('7-day free return policy')
        expect(r.answer).not.toContain('30')
    })

    test('a model failure falls back to the retrieved passage', async () => {
        llm.classify.mockResolvedValue({ intent: 'POLICY_QA' })
        retrieve.mockResolvedValue([policyDoc('Return Policy - Refunds\nRefunds take 5-7 business days.')])
        llm.answer.mockRejectedValue(new Error('429 quota'))

        const r = await ask(chatGraph, 'how long do refunds take?')

        expect(r.answer).toContain('5-7 business days')
    })

    test('a search failure gives a safe fixed reply', async () => {
        llm.classify.mockResolvedValue({ intent: 'POLICY_QA' })
        retrieve.mockRejectedValue(new Error('embedding quota exceeded: secret-detail'))

        const r = await ask(chatGraph, 'return window?')

        expect(r.answer).toMatch(/couldn't search the store documents/)
        expect(r.answer).not.toMatch(/secret-detail/)
    })
})

describe('PRODUCT_SEARCH', () => {
    test('price and stock come from the database, not the indexed copy', async () => {
        llm.classify.mockResolvedValue({ intent: 'PRODUCT_SEARCH' })
        retrieve.mockResolvedValue([
            { text: 'Product: Tee\nPrice: 100', metadata: { type: 'product', sourceId: 'p1' }, score: 0.9 },
            { text: 'Product: Gone', metadata: { type: 'product', sourceId: 'p2' }, score: 0.8 },
        ])
        find.mockReturnValue({ lean: () => Promise.resolve([
            { _id: 'p1', name: 'Tee', price: 250, discountPercent: 10, category: 'Men', subCategory: 'Topwear', stock: { M: 3, L: 2 } },
        ]) })

        const r = await ask(chatGraph, 'a cotton tee')

        expect(retrieve).toHaveBeenCalledWith('a cotton tee', { type: 'product' })
        expect(r.answer).toContain('Tee - $250 (10% off)')
        expect(r.answer).toContain('in stock (5 units)')
        expect(r.answer).not.toContain('Gone')
        expect(llm.calls.answer).toBe(0)
        expect(r.sources).toEqual(['Product catalog'])
    })

    test('matches that no longer exist in the database give the empty reply', async () => {
        llm.classify.mockResolvedValue({ intent: 'PRODUCT_SEARCH' })
        retrieve.mockResolvedValue([{ text: 'x', metadata: { type: 'product', sourceId: 'p9' }, score: 0.9 }])
        find.mockReturnValue({ lean: () => Promise.resolve([]) })

        const r = await ask(chatGraph, 'red kurta')

        expect(r.answer).toMatch(/couldn't find products/)
    })
})
