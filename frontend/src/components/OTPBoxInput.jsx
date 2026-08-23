import React, { useRef } from 'react'

const ACCENT_CLASSES = {
    black: 'focus:border-black',
    red:   'focus:border-red-400',
    green: 'focus:border-green-500',
}

// ─── 6-Box OTP Input ─────────────────────────────────────────────────────────
const OTPBoxInput = ({ value, onChange, disabled, accent = 'black' }) => {
    const inputs = useRef([])
    const digits = value.split('').concat(Array(6).fill('')).slice(0, 6)

    const handleKey = (e, idx) => {
        if (e.key === 'Backspace') {
            const next = value.slice(0, idx) + value.slice(idx + 1)
            onChange(next)
            if (idx > 0) inputs.current[idx - 1]?.focus()
            return
        }
        if (e.key === 'ArrowLeft' && idx > 0) { inputs.current[idx - 1]?.focus(); return }
        if (e.key === 'ArrowRight' && idx < 5) { inputs.current[idx + 1]?.focus(); return }
    }

    const handleChange = (e, idx) => {
        const char = e.target.value.replace(/\D/g, '').slice(-1)
        if (!char) return
        const arr = digits.slice()
        arr[idx] = char
        const next = arr.join('').replace(/ /g, '')
        onChange(next.slice(0, 6))
        if (idx < 5) inputs.current[idx + 1]?.focus()
    }

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 5)]?.focus() }
        e.preventDefault()
    }

    return (
        <div className="flex gap-2 justify-center mb-5">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    disabled={disabled}
                    onChange={e => handleChange(e, i)}
                    onKeyDown={e => handleKey(e, i)}
                    onPaste={handlePaste}
                    onFocus={e => e.target.select()}
                    className={`w-11 h-12 border-2 rounded-lg text-center text-xl font-bold text-gray-800
                               border-gray-200 ${ACCENT_CLASSES[accent] || ACCENT_CLASSES.black} focus:outline-none
                               bg-gray-50 focus:bg-white transition-all disabled:opacity-50`}
                />
            ))}
        </div>
    )
}

export default OTPBoxInput
