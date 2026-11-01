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

const navBtn = 'btn btn-secondary btn-page'

const Pagination = ({ page, totalPages, onChange, totalItems, pageSize, start }) => {
    if (totalPages <= 1) return null

    const pages = []
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i)
        else if (pages[pages.length - 1] !== '…') pages.push('…')
    }

    const rangeEnd = Math.min(start + pageSize, totalItems)

    return (
        <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-2.5 border-t border-[var(--adm-line)] bg-[var(--adm-bg)]/60">
            <p className="text-xs text-[var(--adm-muted)]">
                Showing <span className="font-semibold text-[var(--adm-ink)]">{start + 1}–{rangeEnd}</span> of <span className="font-semibold text-[var(--adm-ink)]">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1">
                <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} className={navBtn} aria-label="Previous page">‹</button>
                {pages.map((p, i) => p === '…' ? (
                    <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-[var(--adm-muted)] text-sm">…</span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        className={`btn btn-page ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                        aria-current={p === page ? 'page' : undefined}
                    >
                        {p}
                    </button>
                ))}
                <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages} className={navBtn} aria-label="Next page">›</button>
            </div>
        </div>
    )
}

export default Pagination
