import couponModel from '../../models/couponModel.js'

const DAY_MS = 24 * 60 * 60 * 1000

// Active = switched on and not yet expired. `expiringWithinDays` narrows to coupons about to expire.
export const getActiveCoupons = async ({ expiringWithinDays } = {}) => {
    const now = new Date()
    const expiry = { $gte: now }
    if (expiringWithinDays) expiry.$lte = new Date(now.getTime() + expiringWithinDays * DAY_MS)

    const coupons = await couponModel
        .find({ isActive: true, expiryDate: expiry }, 'code discountType discountValue expiryDate usageLimit usedCount')
        .sort({ expiryDate: 1 })
        .limit(50)
        .lean()

    return { coupons, total: coupons.length, expiringWithinDays: expiringWithinDays || null }
}
