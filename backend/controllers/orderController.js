import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"
import Stripe from 'stripe';
import razorpay from 'razorpay'
import dotenv from 'dotenv';
import { sendOTPEmail, sendCancelOTPEmail } from '../config/email.js'
dotenv.config();

const currency = 'inr'
const deliveryCharge = 10

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const deductStock = async (items) => {
    for (const item of items) {
        if (!item._id || !item.size || !item.quantity) continue
        const product = await productModel.findById(item._id)
        if (!product || !product.stock || product.stock.size === 0) continue
        const current = product.stock.get(item.size)
        if (current === undefined) continue
        if (current < item.quantity) {
            throw new Error(`${item.name} (${item.size}) ka stock khatam ho gaya`)
        }
        product.stock.set(item.size, current - item.quantity)
        await product.save()
    }
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// ─── Place Order (COD) ────────────────────────────────────────────────────────
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const now = new Date()
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now(),
            otpVerified: true,
            status: 'Order Confirmed',
            statusHistory: [
                { status: 'Order Placed',    timestamp: now },
                { status: 'Order Confirmed', timestamp: now },
            ],
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await deductStock(items);

        // Save delivery address to user profile (skip duplicate street+city)
        try {
            const user = await userModel.findById(userId).select('addresses')
            if (user) {
                const alreadySaved = user.addresses?.some(
                    a => a.street?.toLowerCase() === address.street?.toLowerCase() &&
                         a.city?.toLowerCase()   === address.city?.toLowerCase()
                )
                if (!alreadySaved && address.street && address.city) {
                    await userModel.findByIdAndUpdate(userId, {
                        $push: {
                            addresses: {
                                label:     'Home',
                                firstName: address.firstName || '',
                                lastName:  address.lastName  || '',
                                street:    address.street,
                                city:      address.city,
                                state:     address.state     || '',
                                zipcode:   String(address.zipcode || ''),
                                country:   address.country   || '',
                                phone:     String(address.phone   || ''),
                            }
                        }
                    })
                }
            }
        } catch (_) {}

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({
            success: true,
            message: "Order placed successfully!",
            orderId: newOrder._id,
        });

    } catch (error) {
        console.log("❌ Error placing order:", error);
        res.json({ success: false, message: error.message });
    }
};

const CANCELLABLE_STATUSES = ['Order Placed', 'Order Confirmed', 'Assigned']

// ─── Request OTP to cancel an order ──────────────────────────────────────────
const requestCancelOTP = async (req, res) => {
    try {
        const { orderId, userId } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.userId !== userId) return res.json({ success: false, message: 'Unauthorized' })
        if (!CANCELLABLE_STATUSES.includes(order.status)) {
            return res.json({ success: false, message: 'This order cannot be cancelled anymore' })
        }

        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
        await orderModel.findByIdAndUpdate(orderId, { otp, otpExpiry })

        const user = await userModel.findById(userId)
        if (user?.email) {
            await sendCancelOTPEmail(user.email, otp, orderId)
        }

        res.json({ success: true, message: 'Cancellation OTP sent to your email' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Confirm cancellation with OTP ───────────────────────────────────────────
const confirmCancelOrder = async (req, res) => {
    try {
        const { orderId, userId, otp } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.userId !== userId) return res.json({ success: false, message: 'Unauthorized' })
        if (!CANCELLABLE_STATUSES.includes(order.status)) {
            return res.json({ success: false, message: 'This order cannot be cancelled anymore' })
        }
        if (!order.otp || order.otp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' })
        }
        if (new Date() > order.otpExpiry) {
            return res.json({ success: false, message: 'OTP expired. Please request a new one.' })
        }

        await orderModel.findByIdAndUpdate(orderId, {
            status: 'Cancelled',
            otp: null,
            otpExpiry: null,
            $push: { statusHistory: { status: 'Cancelled', timestamp: new Date() } }
        })

        res.json({ success: true, message: 'Order cancelled successfully' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ─── Place Order (Stripe) ─────────────────────────────────────────────────────
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        const orderData = {
            userId, items, address, amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: { name: item.name },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: { name: 'Delivery Charges' },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })
        res.json({ success: true, session_url: session.url })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ─── Verify Stripe ─────────────────────────────────────────────────────────────
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success === 'true') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true, otpVerified: true });
            const order = await orderModel.findById(orderId)
            if (order) await deductStock(order.items)
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ─── Place Order (Razorpay) ───────────────────────────────────────────────────
const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId, items, address, amount,
            paymentMethod: "Razorpay",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }

        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error)
                return res.json({ success: false, message: error })
            }
            res.json({ success: true, order })
        })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ─── Verify Razorpay ───────────────────────────────────────────────────────────
const verifyRazorpay = async (req, res) => {
    try {
        const { userId, razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true, otpVerified: true });
            const order = await orderModel.findById(orderInfo.receipt)
            if (order) await deductStock(order.items)
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            res.json({ success: true, message: 'Payment Successful' })
        } else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ─── Admin: All Orders ────────────────────────────────────────────────────────
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find()
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ─── User: Own Orders ─────────────────────────────────────────────────────────
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log("❌ Error:", error);
        res.json({ success: false, message: error.message });
    }
}

// ─── Admin: Update Status ─────────────────────────────────────────────────────
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ─── Customer: Get single order by ID ────────────────────────────────────────
const getOrderById = async (req, res) => {
    try {
        const { orderId, userId } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.userId !== userId) return res.json({ success: false, message: 'Unauthorized' })
        res.json({ success: true, order })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export {
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    verifyStripe,
    verifyRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    requestCancelOTP,
    confirmCancelOrder,
    getOrderById
}
