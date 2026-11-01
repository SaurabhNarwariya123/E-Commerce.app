const MAX_MESSAGE_LENGTH = 500

// Control and zero-width characters can hide instructions or break matching; ids, dates and names are left intact.
const INVISIBLE = new RegExp('[\\u0000-\\u001F\\u007F\\u200B-\\u200F\\u2028\\u2029\\uFEFF]', 'g')

export const normalizeInput = (state) => {
    if (typeof state.message !== 'string') return { cleanedMessage: '', invalidInput: 'Please type a question.' }
    const cleaned = state.message.replace(INVISIBLE, ' ').trim().replace(/\s+/g, ' ')
    if (!cleaned) return { cleanedMessage: '', invalidInput: 'Please type a question.' }
    if (cleaned.length > MAX_MESSAGE_LENGTH) {
        return { cleanedMessage: '', invalidInput: `Please keep your question under ${MAX_MESSAGE_LENGTH} characters.` }
    }
    return { cleanedMessage: cleaned }
}
