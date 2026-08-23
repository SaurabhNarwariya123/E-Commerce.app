import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code           : { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType   : { type: String, enum: ['percent', 'flat'], required: true },
    discountValue  : { type: Number, required: true, min: 0 },
    maxDiscount    : { type: Number, default: null }, // cap for percent-type coupons
    minOrderAmount : { type: Number, default: 0 },
    expiryDate     : { type: Date, required: true },
    isActive       : { type: Boolean, default: true },
    usageLimit     : { type: Number, default: null }, // null = unlimited
    usedCount      : { type: Number, default: 0 },
    date           : { type: Number, required: true },
})

const couponModel = mongoose.models.coupon || mongoose.model('coupon', couponSchema)
export default couponModel
