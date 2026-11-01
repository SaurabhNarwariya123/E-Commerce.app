import React, { useEffect } from 'react'

const TONES = {
    primary: 'btn-primary',
    danger: 'btn-danger',
}

const ConfirmDialog = ({ title, message, confirmLabel = 'Confirm', tone = 'primary', busy = false, onConfirm, onCancel }) => {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onCancel() }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onCancel])

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div
                role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message"
                className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="confirm-title" className="text-base font-semibold text-[var(--adm-ink)]">{title}</h2>
                <p id="confirm-message" className="text-sm text-[var(--adm-muted)] mt-1.5">{message}</p>
                <div className="flex justify-end gap-2 mt-5">
                    <button type="button" onClick={onCancel} className="btn btn-secondary" autoFocus>Cancel</button>
                    <button type="button" onClick={onConfirm} disabled={busy} className={`btn ${TONES[tone] || TONES.primary}`}>
                        {busy ? 'Working…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog
