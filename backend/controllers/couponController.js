import couponModel from '../models/couponModel.js'

const normalizeCode = (code) => code?.trim().toUpperCase()

// ─── Admin: Add a coupon ─────────────────────────────────────────────────────
const addCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, maxDiscount, minOrderAmount, expiryDate, usageLimit, isActive } = req.body

        const normalizedCode = normalizeCode(code)
        if (!normalizedCode) {
            return res.json({ success: false, message: 'Coupon code is required' })
        }
        if (!['percent', 'flat'].includes(discountType)) {
            return res.json({ success: false, message: 'Discount type must be percent or flat' })
        }
        if (discountValue === undefined || Number(discountValue) <= 0) {
            return res.json({ success: false, message: 'Discount value must be greater than 0' })
        }
        if (discountType === 'percent' && Number(discountValue) > 100) {
            return res.json({ success: false, message: 'Percent discount cannot exceed 100' })
        }
        if (!expiryDate) {
            return res.json({ success: false, message: 'Expiry date is required' })
        }

        const exists = await couponModel.findOne({ code: normalizedCode })
        if (exists) {
            return res.json({ success: false, message: 'A coupon with this code already exists' })
        }

        const coupon = new couponModel({
            code: normalizedCode,
            discountType,
            discountValue: Number(discountValue),
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
            expiryDate: new Date(expiryDate),
            usageLimit: usageLimit ? Number(usageLimit) : null,
            isActive: isActive === undefined ? true : (isActive === true || isActive === 'true'),
            date: Date.now(),
        })
        await coupon.save()

        res.json({ success: true, message: 'Coupon added', coupon })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: List all coupons ─────────────────────────────────────────────────
const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ date: -1 })
        res.json({ success: true, coupons })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: Remove a coupon ──────────────────────────────────────────────────
const removeCoupon = async (req, res) => {
    try {
        const { id } = req.body
        await couponModel.findByIdAndDelete(id)
        res.json({ success: true, message: 'Coupon removed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: Toggle a coupon active/inactive ──────────────────────────────────
const toggleCoupon = async (req, res) => {
    try {
        const { id } = req.body
        const coupon = await couponModel.findById(id)
        if (!coupon) return res.json({ success: false, message: 'Coupon not found' })
        coupon.isActive = !coupon.isActive
        await coupon.save()
        res.json({ success: true, coupon })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Shared validation — used by both the "preview" apply endpoint and order placement.
export const validateCoupon = async (code, amount) => {
    const normalizedCode = normalizeCode(code)
    const coupon = await couponModel.findOne({ code: normalizedCode })

    if (!coupon) return { valid: false, message: 'Invalid coupon code' }
    if (!coupon.isActive) return { valid: false, message: 'This coupon is no longer active' }
    if (coupon.expiryDate < new Date()) return { valid: false, message: 'This coupon has expired' }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, message: 'This coupon has reached its usage limit' }
    }
    if (amount < coupon.minOrderAmount) {
        return { valid: false, message: `Minimum order amount for this coupon is ${coupon.minOrderAmount}` }
    }

    let discount = coupon.discountType === 'percent'
        ? (amount * coupon.discountValue) / 100
        : coupon.discountValue
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    discount = Math.min(Math.round(discount), amount) // never discount more than the order itself

    return { valid: true, coupon, discount }
}

// ─── User: Validate + preview a coupon's discount for the current cart amount ─
const applyCoupon = async (req, res) => {
    try {
        const { code, amount } = req.body
        if (!code || amount === undefined) {
            return res.json({ success: false, message: 'Coupon code and cart amount are required' })
        }

        const result = await validateCoupon(code, Number(amount))
        if (!result.valid) {
            return res.json({ success: false, message: result.message })
        }

        res.json({
            success: true,
            code: result.coupon.code,
            discount: result.discount,
            finalAmount: Number(amount) - result.discount,
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Public: Currently-active, non-expired coupons (for "Offer Price" previews) ─
const activeCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({ isActive: true, expiryDate: { $gte: new Date() } })
            .select('code discountType discountValue maxDiscount minOrderAmount')
        res.json({ success: true, coupons })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Called once a coupon-bearing order is confirmed (COD) or paid (Stripe/Razorpay).
export const incrementCouponUsage = async (code) => {
    if (!code) return
    await couponModel.findOneAndUpdate({ code: normalizeCode(code) }, { $inc: { usedCount: 1 } })
}

export { addCoupon, listCoupons, removeCoupon, toggleCoupon, applyCoupon, activeCoupons }
