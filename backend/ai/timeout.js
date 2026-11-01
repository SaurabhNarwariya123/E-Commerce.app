// Stops waiting after `ms`. The underlying work may keep running; the chat just stops depending on it.
export const withTimeout = (promise, ms, message = 'timed out') => {
    let timer
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms)
    })
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}
