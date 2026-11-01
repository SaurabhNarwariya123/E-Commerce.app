import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

// Must match the dimensions in the Atlas vector index (ai/rag/atlasIndex.json).
// Changing the model or dimensions means re-indexing everything.
export const EMBED_DIMENSIONS = Number(process.env.RAG_EMBED_DIMENSIONS) || 768

let _embeddings = null

export const getEmbeddings = () => {
    if (_embeddings) return _embeddings

    const apiKey = process.env.GOOGLE_gemini_API_KEY
    if (!apiKey) {
        throw new Error('GOOGLE_gemini_API_KEY is not configured')
    }

    _embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey,
        model: process.env.RAG_EMBED_MODEL || 'gemini-embedding-001',
        outputDimensionality: EMBED_DIMENSIONS,
        maxRetries: 1, // bounded, same as the chat model
    })
    return _embeddings
}
