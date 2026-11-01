import mongoose from 'mongoose'
import productModel from '../../models/productModel.js'
import { POLICIES } from './policies.js'
import { productToDocument, policyToDocuments } from './chunker.js'
import { addDocumentsBatched, deleteBySource, ragCollection, RAG_COLLECTION, RAG_INDEX_NAME } from './vectorStore.js'
import { EMBED_DIMENSIONS } from './embedder.js'

// Creates the collection and the Atlas vector index if they are missing. Index builds take ~1 minute.
export const ensureVectorIndex = async () => {
    const db = mongoose.connection.db
    const existing = await db.listCollections({ name: RAG_COLLECTION }).toArray()
    if (!existing.length) await db.createCollection(RAG_COLLECTION)

    const col = db.collection(RAG_COLLECTION)
    const indexes = await col.listSearchIndexes(RAG_INDEX_NAME).toArray()
    if (indexes.length) return { created: false, status: indexes[0].status }

    await col.createSearchIndex({
        name: RAG_INDEX_NAME,
        type: 'vectorSearch',
        definition: {
            fields: [
                { type: 'vector', path: 'embedding', numDimensions: EMBED_DIMENSIONS, similarity: 'cosine' },
                { type: 'filter', path: 'type' },
                { type: 'filter', path: 'category' },
                { type: 'filter', path: 'price' },
                { type: 'filter', path: 'inStock' },
            ],
        },
    })
    return { created: true, status: 'PENDING' }
}

export const indexPolicies = async () => {
    await ragCollection().deleteMany({ type: 'policy' })
    const docs = POLICIES.flatMap(policyToDocuments)
    await addDocumentsBatched(docs)
    return docs.length
}

export const indexAllProducts = async () => {
    await ragCollection().deleteMany({ type: 'product' })
    const products = await productModel.find({}).lean()
    await addDocumentsBatched(products.map(productToDocument))
    return products.length
}

// Re-embeds one product (add or edit): old chunk out, fresh one in.
export const indexProduct = async (product) => {
    await deleteBySource('product', product._id)
    await addDocumentsBatched([productToDocument(product)])
}

export const removeProductFromIndex = (id) => deleteBySource('product', id)

// Fire-and-forget wrapper for controllers: indexing problems must never fail a product request.
export const syncProduct = (fn, ...args) => {
    if (process.env.RAG_AUTO_INDEX === 'false' || !process.env.GOOGLE_gemini_API_KEY) return
    Promise.resolve().then(() => fn(...args)).catch(err => console.error('[rag] product sync failed:', err.message))
}
