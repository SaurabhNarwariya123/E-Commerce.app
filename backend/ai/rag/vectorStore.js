import mongoose from 'mongoose'
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { getEmbeddings } from './embedder.js'

export const RAG_COLLECTION = 'ragchunks'
export const RAG_INDEX_NAME = process.env.RAG_INDEX_NAME || 'rag_vector_index'

let _store = null

// Uses the native driver collection of the existing mongoose connection (no second client);
// the mongoose collection wrapper lacks the `db.client` the LangChain store needs.
export const getVectorStore = () => {
    if (_store) return _store

    _store = new MongoDBAtlasVectorSearch(getEmbeddings(), {
        collection: mongoose.connection.db.collection(RAG_COLLECTION),
        indexName: RAG_INDEX_NAME,
        textKey: 'text',
        embeddingKey: 'embedding',
    })
    return _store
}

export const ragCollection = () => mongoose.connection.db.collection(RAG_COLLECTION)

// Removes every chunk of one source (a product id), so an edited product can be re-added cleanly.
export const deleteBySource = (type, sourceId) =>
    ragCollection().deleteMany({ type, sourceId: String(sourceId) })

// Embeds and stores documents in small batches to stay under the embedding rate limit.
export const addDocumentsBatched = async (docs, batchSize = 20, pauseMs = 1000) => {
    const store = getVectorStore()
    for (let i = 0; i < docs.length; i += batchSize) {
        await store.addDocuments(docs.slice(i, i + batchSize))
        if (i + batchSize < docs.length) await new Promise(r => setTimeout(r, pauseMs))
    }
}
