
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId          : { type: String,  required: true },
    items           : { type: Array,   required: true },
    amount          : { type: Number,  required: true },
    address         : { type: Object,  required: true },
    status          : { type: String,  required: true, default: 'Order Placed' },
    paymentMethod   : { type: String,  required: true },
    payment         : { type: Boolean, required: true, default: false },
    date            : { type: Number,  required: true },

    // Delivery person assignment
    deliveryPersonId   : { type: String,  default: null },
    deliveryPersonName : { type: String,  default: null },

    // Email OTP for COD order confirmation
    otp          : { type: String,  default: null },
    otpExpiry    : { type: Date,    default: null },
    otpVerified  : { type: Boolean, default: false },

    // OTP for delivery person to confirm physical delivery to customer
    deliveryOtp       : { type: String, default: null },
    deliveryOtpExpiry : { type: Date,   default: null },

    // Timestamps for each status change (for progress timeline)
    statusHistory : [{ status: { type: String }, timestamp: { type: Date } }],
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)
export default orderModel
