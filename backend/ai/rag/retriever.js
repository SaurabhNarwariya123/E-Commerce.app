import { getVectorStore } from './vectorStore.js'

export const RAG_TOP_K = Number(process.env.RAG_TOP_K) || 5
// Cosine similarity below this is treated as "not in our documents" and never reaches the model.
export const RAG_MIN_SCORE = Number(process.env.RAG_MIN_SCORE) || 0.6

// `type` is 'product' or 'policy'. `filter` may add price/category/inStock conditions (Atlas pre-filter).
export const retrieve = async (query, { type, k = RAG_TOP_K, minScore = RAG_MIN_SCORE, filter = {} } = {}) => {
    const preFilter = { ...filter, ...(type ? { type } : {}) }
    const results = await getVectorStore().similaritySearchWithScore(query, k, { preFilter })

    return results
        .filter(([, score]) => score >= minScore)
        .map(([doc, score]) => ({ text: doc.pageContent, metadata: doc.metadata, score }))
}
