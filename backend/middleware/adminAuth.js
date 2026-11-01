import jwt from 'jsonwebtoken'

const adminAuth = async (req, res, next) => {
    try {
        // Accept `token` header or `Authorization: Bearer <token>`
        let token = req.headers.token;
        if (!token && req.headers.authorization) {
            const auth = req.headers.authorization;
            if (/^Bearer/i.test(auth)) token = auth.replace(/^Bearer\s+/i, '');
        }
        token = token?.trim();

        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
        }

        if (!process.env.JWT_SECRET || !process.env.ADMIN_EMAIL) {
            console.error('ADMIN_EMAIL or JWT_SECRET not configured');
            return res.status(500).json({ success: false, message: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // `createToken` sets `{ id }` — for admin we used email as id
        if (!decoded || decoded.id !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
        }

        req.admin = decoded
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
    }
}

export default adminAuth
