import productModel from '../../../models/productModel.js'
import { RAG_INTENTS } from '../../intents.js'
import { retrieve } from '../../rag/retriever.js'
import { withTimeout } from '../../timeout.js'
import { lexicalPolicyAnswer } from '../../rag/lexicalSearch.js'

const CURRENCY = process.env.CURRENCY_SYMBOL || '$'
const retrieveTimeoutMs = () => Number(process.env.AI_TOOL_TIMEOUT_MS) || 10000

const NO_POLICY = "I couldn't find that in the store's policy documents. Please check the Return, Privacy, Terms or FAQ pages, or rephrase your question."
const NO_PRODUCTS = "I couldn't find products matching that description in the catalog."

const totalStock = (stock) => {
    const qty = stock instanceof Map ? [...stock.values()] : Object.values(stock || {})
    return qty.reduce((sum, q) => sum + (Number(q) || 0), 0)
}

// Search finds *which* products match; price and stock are re-read from the database here
// because the indexed copy can be stale. The reply is built in code, so no model can misquote them.
const answerProducts = async (docs) => {
    const ids = [...new Set(docs.map(d => d.metadata.sourceId))]
    const rows = await productModel.find({ _id: { $in: ids } }).lean()
    const byId = new Map(rows.map(r => [String(r._id), r]))
    const found = ids.map(id => byId.get(id)).filter(Boolean)
    if (!found.length) return null

    const lines = found.map((p, i) => {
        const off = p.discountPercent > 0 ? ` (${p.discountPercent}% off)` : ''
        const stock = totalStock(p.stock)
        return `${i + 1}. ${p.name} - ${CURRENCY}${p.price}${off} - ${p.category} / ${p.subCategory} - ${stock > 0 ? `in stock (${stock} units)` : 'out of stock'}`
    })
    return `Closest matches in the catalog:\n${lines.join('\n')}`
}

// RAG branch: the question is looked up in indexed store documents. Fixed replies cover "nothing
// relevant found" and failures, so a model is only used when real passages were retrieved.
export const retrieveDocs = async (state) => {
    const isProduct = state.intent === RAG_INTENTS.PRODUCT_SEARCH
    const type = isProduct ? 'product' : 'policy'

    let docs
    try {
        docs = await withTimeout(retrieve(state.cleanedMessage, { type }), retrieveTimeoutMs(), 'search timed out')
    } catch (err) {
        console.error(`[chat ${state.requestId}] ${type} search failed:`, err.message)
        // Embeddings unavailable: policy text is local, so answer from it by word match instead of failing.
        if (!isProduct) {
            const offline = lexicalPolicyAnswer(state.cleanedMessage)
            if (offline) return { answer: offline, answerSource: 'fallback', executedTool: 'rag', sourceLabel: 'Store policies' }
        }
        return { answer: "I couldn't search the store documents right now. Please try again in a moment.", answerSource: 'fixed' }
    }

    if (!docs.length) {
        return { answer: isProduct ? NO_PRODUCTS : NO_POLICY, answerSource: 'empty', ragDocs: [] }
    }

    const sourceLabel = isProduct ? 'Product catalog' : 'Store policies'

    if (isProduct) {
        let answer
        try {
            answer = await answerProducts(docs)
        } catch (err) {
            console.error(`[chat ${state.requestId}] product lookup failed:`, err.message)
            return { answer: "I couldn't load the matching products right now. Please try again.", answerSource: 'fixed' }
        }
        if (!answer) return { answer: NO_PRODUCTS, answerSource: 'empty', ragDocs: [] }
        return { answer, answerSource: 'template', ragDocs: docs, executedTool: 'rag', sourceLabel }
    }

    return {
        ragDocs: docs,
        contextText: docs.map((d, i) => `[${i + 1}] ${d.text}`).join('\n\n'),
        ragFallback: docs[0].text,
        executedTool: 'rag',
        sourceLabel,
    }
}
