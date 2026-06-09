import jwt from 'jsonwebtoken'

const deliveryAuth = async (req, res, next) => {
    try {
        let token = req.headers.token
        if (!token && req.headers.authorization) {
            const auth = req.headers.authorization
            if (auth.startsWith('Bearer ')) token = auth.slice(7)
        }
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized' })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded.isDeliveryPerson) {
            return res.status(403).json({ success: false, message: 'Access Denied: Not a delivery account' })
        }
        req.deliveryPersonId = decoded.id
        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not Authorized' })
    }
}

export default deliveryAuth
