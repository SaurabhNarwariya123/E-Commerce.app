import React from 'react'

export const Field = ({ label, value }) => (
    <div>
        <p className="text-xs text-[var(--adm-muted)] uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-[var(--adm-ink)]">{value ?? '—'}</div>
    </div>
)

const ViewModal = ({ title, onClose, children }) => {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                    <h2 className="text-lg font-semibold text-[var(--adm-ink)]">{title}</h2>
                    <button onClick={onClose} className="text-[var(--adm-muted)] hover:text-[var(--adm-ink)] text-2xl leading-none cursor-pointer" aria-label="Close">&times;</button>
                </div>
                <div className="p-6 flex flex-col gap-4">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default ViewModal
