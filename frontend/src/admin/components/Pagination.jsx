import React from 'react'

export const usePagination = (items, pageSize = 8) => {
    const [page, setPage] = React.useState(1)
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    const pageItems = items.slice(start, start + pageSize)

    React.useEffect(() => { setPage(1) }, [items.length])

    return { page: safePage, setPage, totalPages, pageItems, start }
}

const Pagination = ({ page, totalPages, onChange, totalItems, pageSize, start }) => {
    if (totalPages <= 1) return null

    const pages = []
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i)
        else if (pages[pages.length - 1] !== '…') pages.push('…')
    }

    const rangeEnd = Math.min(start + pageSize, totalItems)

    return (
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
                Showing <span className="font-medium text-gray-700">{start + 1}–{rangeEnd}</span> of <span className="font-medium text-gray-700">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onChange(page - 1)}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition cursor-pointer"
                    aria-label="Previous page"
                >
                    ‹
                </button>
                {pages.map((p, i) => p === '…' ? (
                    <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer ${p === page ? 'bg-green-700 text-white' : 'border border-gray-300 text-gray-600 hover:bg-white'}`}
                    >
                        {p}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => onChange(page + 1)}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition cursor-pointer"
                    aria-label="Next page"
                >
                    ›
                </button>
            </div>
        </div>
    )
}

export default Pagination
