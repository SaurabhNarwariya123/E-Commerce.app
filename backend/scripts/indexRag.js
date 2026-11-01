import 'dotenv/config'
import dns from 'node:dns/promises'
import mongoose from 'mongoose'

// Same resolver override as server.js, so Atlas SRV lookups work on networks that block them.
dns.setServers(['1.1.1.1', '8.8.8.8'])
import { ensureVectorIndex, indexPolicies, indexAllProducts } from '../ai/rag/indexer.js'

// Usage: npm run rag:index   (safe to re-run; rebuilds all policy and product chunks)
await mongoose.connect(process.env.MONGODB_URI)

const index = await ensureVectorIndex()
console.log(index.created ? 'Vector index created (takes ~1 minute to become queryable).' : `Vector index already exists (${index.status}).`)

console.log(`Policy chunks indexed: ${await indexPolicies()}`)
console.log(`Products indexed: ${await indexAllProducts()}`)

await mongoose.disconnect()
