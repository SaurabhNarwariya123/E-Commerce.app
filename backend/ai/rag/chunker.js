const MAX_CHUNK_CHARS = 1200

const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()

// One searchable text per product. Price and stock are included so the model can read them,
// but they are always refreshed from the database before being shown (they go stale here).
export const productToText = (p) => {
    const colors = (p.colors || []).map(c => c?.name).filter(Boolean).join(', ')
    const sizes = (p.sizes || []).join(', ')
    return [
        `Product: ${clean(p.name)}`,
        `Category: ${clean(p.category)} / ${clean(p.subCategory)}`,
        `Description: ${clean(p.description)}`,
        colors && `Colors: ${colors}`,
        sizes && `Sizes: ${sizes}`,
        `Price: ${p.price}`,
    ].filter(Boolean).join('\n')
}

// Text for a product plus the metadata used for filtering. `inStock` is true if any size has stock.
export const productToDocument = (p) => {
    const stock = p.stock instanceof Map ? [...p.stock.values()] : Object.values(p.stock || {})
    return {
        pageContent: productToText(p),
        metadata: {
            type: 'product',
            sourceId: String(p._id),
            category: p.category,
            price: p.price,
            inStock: stock.some(q => q > 0),
        },
    }
}

// Splits long text on blank lines / sentences into chunks of at most MAX_CHUNK_CHARS.
export const splitText = (text, max = MAX_CHUNK_CHARS) => {
    const parts = String(text ?? '').split(/\n{2,}/).map(clean).filter(Boolean)
    const chunks = []
    let current = ''
    for (const part of parts) {
        if (current && current.length + part.length + 1 > max) {
            chunks.push(current)
            current = ''
        }
        current = current ? `${current} ${part}` : part
        while (current.length > max) {
            let cut = current.lastIndexOf('. ', max)
            if (cut < max / 2) cut = max
            chunks.push(current.slice(0, cut + 1).trim())
            current = current.slice(cut + 1).trim()
        }
    }
    if (current) chunks.push(current)
    return chunks
}

// A policy/FAQ section becomes chunks that each keep their heading, so a chunk is understandable alone.
export const policyToDocuments = ({ slug, title, sections }) =>
    sections.flatMap((section, i) => {
        const body = Array.isArray(section.body) ? section.body.join('\n\n') : section.body
        return splitText(body).map((chunk, j) => ({
            pageContent: `${title} - ${section.heading}\n${chunk}`,
            metadata: { type: 'policy', sourceId: `${slug}:${i}:${j}`, category: slug },
        }))
    })
