// Defense in depth: adminAuth already verified the JWT at the route, but the graph must not
// trust that on its own. adminId comes from the verified token, never from the chat message.
export const authorizeAdmin = (state) => {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!state.adminId || !adminEmail || state.adminId !== adminEmail) {
        return { isAdmin: false, permissionDenied: true }
    }
    return { isAdmin: true, permissionDenied: false }
}
