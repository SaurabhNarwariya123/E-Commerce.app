import deliveryPersonModel from '../models/deliveryPersonModel.js'
import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { sendOrderStatusEmail } from '../config/email.js'

// ─── Admin: Add delivery person ───────────────────────────────────────────────
const addDeliveryPerson = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body
        if (!name || !email || !password || !phone) {
            return res.json({ success: false, message: 'All fields are required' })
        }
        const exists = await deliveryPersonModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: 'Email already registered' })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const dp = new deliveryPersonModel({ name, email, password: hashedPassword, phone })
        await dp.save()
        res.json({ success: true, message: 'Delivery person added successfully' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: List all delivery persons ────────────────────────────────────────
const listDeliveryPersons = async (req, res) => {
    try {
        const deliveryPersons = await deliveryPersonModel.find().select('-password').sort({ createdAt: -1 })
        res.json({ success: true, deliveryPersons })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: Remove delivery person ───────────────────────────────────────────
const removeDeliveryPerson = async (req, res) => {
    try {
        const { deliveryPersonId } = req.body
        await deliveryPersonModel.findByIdAndDelete(deliveryPersonId)
        res.json({ success: true, message: 'Delivery person removed' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: Toggle active status ─────────────────────────────────────────────
const toggleDeliveryStatus = async (req, res) => {
    try {
        const { deliveryPersonId } = req.body
        const dp = await deliveryPersonModel.findById(deliveryPersonId)
        if (!dp) return res.json({ success: false, message: 'Not found' })
        dp.isActive = !dp.isActive
        await dp.save()
        res.json({ success: true, isActive: dp.isActive, message: `Status set to ${dp.isActive ? 'Active' : 'Inactive'}` })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: Assign order to delivery person ───────────────────────────────────
const assignOrderToDelivery = async (req, res) => {
    try {
        const { orderId, deliveryPersonId } = req.body
        const dp = await deliveryPersonModel.findById(deliveryPersonId)
        if (!dp) return res.json({ success: false, message: 'Delivery person not found' })
        if (!dp.isActive) return res.json({ success: false, message: 'Delivery person is inactive' })

        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })

        // Remove from previous delivery person if reassigning
        if (order.deliveryPersonId && order.deliveryPersonId !== deliveryPersonId) {
            await deliveryPersonModel.findByIdAndUpdate(order.deliveryPersonId, {
                $pull: { assignedOrders: orderId }
            })
        }

        await orderModel.findByIdAndUpdate(orderId, {
            deliveryPersonId,
            deliveryPersonName: dp.name,
            status: 'Assigned',
            $push: { statusHistory: { status: 'Assigned', timestamp: new Date() } }
        })

        await deliveryPersonModel.findByIdAndUpdate(deliveryPersonId, {
            $addToSet: { assignedOrders: orderId },
            isAvailable: false
        })

        // Notify delivery person via socket
        if (req.io) {
            req.io.to(`delivery:${deliveryPersonId}`).emit('order-assigned', {
                orderId,
                address: order.address,
                amount: order.amount,
                items: order.items
            })
        }

        // Email customer about assignment
        try {
            const user = await userModel.findById(order.userId)
            if (user?.email) {
                await sendOrderStatusEmail(user.email, 'Out For delivery', orderId)
            }
        } catch (_) {}

        res.json({ success: true, message: `Order assigned to ${dp.name}` })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: Live tracking data ────────────────────────────────────────────────
const getLiveTracking = async (req, res) => {
    try {
        const deliveryPersons = await deliveryPersonModel
            .find({ isActive: true })
            .select('-password')
        res.json({ success: true, deliveryPersons })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Delivery: Login ──────────────────────────────────────────────────────────
const loginDeliveryPerson = async (req, res) => {
    try {
        const { email, password } = req.body
        const dp = await deliveryPersonModel.findOne({ email })
        if (!dp) return res.json({ success: false, message: 'Invalid credentials' })
        if (!dp.isActive) return res.json({ success: false, message: 'Account is inactive. Contact admin.' })

        const isMatch = await bcrypt.compare(password, dp.password)
        if (!isMatch) return res.json({ success: false, message: 'Invalid credentials' })

        const token = jwt.sign(
            { id: dp._id.toString(), isDeliveryPerson: true },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            success: true,
            token,
            deliveryPerson: {
                id: dp._id,
                name: dp.name,
                email: dp.email,
                phone: dp.phone
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Delivery: Update GPS location ───────────────────────────────────────────
const updateDeliveryLocation = async (req, res) => {
    try {
        const { deliveryPersonId } = req
        const { lat, lng } = req.body
        if (lat == null || lng == null) {
            return res.json({ success: false, message: 'lat and lng required' })
        }

        await deliveryPersonModel.findByIdAndUpdate(deliveryPersonId, {
            currentLocation: { lat, lng, updatedAt: new Date() }
        })

        const dp = await deliveryPersonModel.findById(deliveryPersonId).select('assignedOrders name')

        // Broadcast to admin room + every customer tracking their order
        if (req.io) {
            req.io.to('admin-room').emit('delivery-location-update', { deliveryPersonId, name: dp?.name, lat, lng })
            if (dp?.assignedOrders?.length) {
                dp.assignedOrders.forEach(oid => {
                    req.io.to(`order:${oid}`).emit('delivery-location-update', { deliveryPersonId, lat, lng })
                })
            }
        }

        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Delivery: Get assigned orders ───────────────────────────────────────────
const getMyOrders = async (req, res) => {
    try {
        const { deliveryPersonId } = req
        // Query by deliveryPersonId on the order itself (stays after delivery)
        // so both active and delivered orders are returned
        const orders = await orderModel.find({ deliveryPersonId }).sort({ date: -1 })
        res.json({ success: true, orders })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Delivery: Request OTP for delivery confirmation ─────────────────────────
const requestDeliveryOTP = async (req, res) => {
    try {
        const { deliveryPersonId } = req
        const { orderId } = req.body

        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.deliveryPersonId?.toString() !== deliveryPersonId.toString()) {
            return res.json({ success: false, message: 'Not authorized for this order' })
        }
        if (order.status !== 'Out For delivery') {
            return res.json({ success: false, message: 'Order is not out for delivery' })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        await orderModel.findByIdAndUpdate(orderId, {
            deliveryOtp: otp,
            deliveryOtpExpiry: otpExpiry
        })

        // Notify customer's tracking page + orders page to re-fetch and show OTP
        if (req.io) {
            req.io.to(`order:${orderId}`).emit('delivery-otp-ready', { orderId })
        }

        res.json({ success: true, message: 'OTP generated — customer will see it on their order page' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Delivery: Update order status ───────────────────────────────────────────
const updateDeliveryOrderStatus = async (req, res) => {
    try {
        const { deliveryPersonId } = req
        const { orderId, status, otp } = req.body

        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.deliveryPersonId?.toString() !== deliveryPersonId.toString()) {
            return res.json({ success: false, message: 'Not authorized for this order' })
        }

        // OTP is mandatory when marking as Delivered
        if (status === 'Delivered') {
            if (!otp) {
                return res.json({ success: false, message: 'OTP is required to confirm delivery' })
            }
            if (!order.deliveryOtp || !order.deliveryOtpExpiry) {
                return res.json({ success: false, message: 'No OTP found. Request OTP first.' })
            }
            if (new Date() > order.deliveryOtpExpiry) {
                return res.json({ success: false, message: 'OTP has expired. Request a new OTP.' })
            }
            if (order.deliveryOtp !== otp.toString()) {
                return res.json({ success: false, message: 'Invalid OTP. Delivery not confirmed.' })
            }
            // Clear OTP after successful verification
            await orderModel.findByIdAndUpdate(orderId, {
                deliveryOtp: null,
                deliveryOtpExpiry: null
            })
        }

        await orderModel.findByIdAndUpdate(orderId, {
            status,
            $push: { statusHistory: { status, timestamp: new Date() } }
        })

        if (status === 'Delivered') {
            await deliveryPersonModel.findByIdAndUpdate(deliveryPersonId, {
                $pull: { assignedOrders: orderId },
                $inc:  { totalDelivered: 1 },
                isAvailable: true
            })
        }

        // Notify customer + admin via socket with full step detail
        if (req.io) {
            req.io.to(`order:${orderId}`).emit('order-status-update', { orderId, status })
            req.io.to('admin-room').emit('order-status-update', { orderId, status })
            req.io.to(`delivery:${deliveryPersonId}`).emit('order-status-update', { orderId, status })
        }

        // Email customer
        try {
            const user = await userModel.findById(order.userId)
            if (user?.email) {
                await sendOrderStatusEmail(user.email, status, orderId)
            }
        } catch (_) {}

        res.json({ success: true, message: 'Status updated' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export {
    addDeliveryPerson,
    listDeliveryPersons,
    removeDeliveryPerson,
    toggleDeliveryStatus,
    assignOrderToDelivery,
    getLiveTracking,
    loginDeliveryPerson,
    updateDeliveryLocation,
    getMyOrders,
    requestDeliveryOTP,
    updateDeliveryOrderStatus
}
