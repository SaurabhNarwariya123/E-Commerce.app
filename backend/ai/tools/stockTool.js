import mongoose from 'mongoose'
import productModel from '../../models/productModel.js'

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// stock is a Map in Mongoose docs and a plain object after .lean(); both reduce to [size, qty] pairs.
const sizeEntries = (stock) => {
    if (!stock) return []
    const pairs = stock instanceof Map ? [...stock.entries()] : Object.entries(stock)
    return pairs
        .map(([size, qty]) => ({ size, qty: Number(qty) }))
        .filter(e => Number.isFinite(e.qty))
}

const loadStockProducts = () => productModel.find({}, 'name stock').lean()

// Low = some size has between 1 and `threshold` units. Sizes at zero are "out of stock", a separate question.
export const getLowStockProducts = async ({ threshold = 5 } = {}) => {
    const products = await loadStockProducts()
    let untracked = 0
    const low = []
    for (const p of products) {
        const entries = sizeEntries(p.stock)
        if (!entries.length) { untracked++; continue }
        const lowSizes = entries.filter(e => e.qty > 0 && e.qty <= threshold)
        if (lowSizes.length) low.push({ _id: p._id, name: p.name, sizes: lowSizes })
    }
    return { threshold, products: low, total: low.length, untracked }
}

export const getOutOfStockProducts = async () => {
    const products = await loadStockProducts()
    let untracked = 0
    const out = []
    for (const p of products) {
        const entries = sizeEntries(p.stock)
        if (!entries.length) { untracked++; continue }
        const outSizes = entries.filter(e => e.qty <= 0)
        if (outSizes.length) {
            out.push({ _id: p._id, name: p.name, sizes: outSizes, fullyOut: outSizes.length === entries.length })
        }
    }
    return { products: out, total: out.length, fullyOutCount: out.filter(p => p.fullyOut).length, untracked }
}

// Returns { _id, name, sizes } | { ambiguous: [names] } | null
export const getProductStock = async ({ productId, productName } = {}) => {
    if (!productId && !productName) throw new Error('productId or productName is required')

    let matches
    if (productId) {
        if (!mongoose.isValidObjectId(productId)) return null
        const p = await productModel.findById(productId, 'name stock').lean()
        matches = p ? [p] : []
    } else {
        const name = productName.trim()
        matches = await productModel.find({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') }, 'name stock').limit(6).lean()
        if (!matches.length) {
            matches = await productModel.find({ name: new RegExp(escapeRegex(name), 'i') }, 'name stock').limit(6).lean()
        }
    }

    if (matches.length === 0) return null
    if (matches.length > 1) return { ambiguous: matches.slice(0, 5).map(m => m.name) }
    const [p] = matches
    return { _id: p._id, name: p.name, sizes: sizeEntries(p.stock), hasStockData: sizeEntries(p.stock).length > 0 }
}
