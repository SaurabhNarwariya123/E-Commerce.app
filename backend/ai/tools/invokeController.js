const CONTROLLER_TIMEOUT_MS = 10000

// Runs an existing Express controller with a minimal req/res and resolves with the JSON it sends.
// Controllers that never respond (or respond only via res.send) are cut off by the timeout.
export const invokeController = (controllerFn, { body = {}, query = {}, params = {}, user = null } = {}, timeoutMs = CONTROLLER_TIMEOUT_MS) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Controller timed out')), timeoutMs)
        const done = (fn) => (value) => { clearTimeout(timer); fn(value) }

        const req = { body, query, params, user, headers: {} }
        const res = {
            json: done(resolve),
            status: () => res,
        }
        try {
            const result = controllerFn(req, res)
            if (result && typeof result.catch === 'function') {
                result.catch(done(reject))
            }
        } catch (err) {
            done(reject)(err)
        }
    })
}
