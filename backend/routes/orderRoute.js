import express from 'express'
import {
    placeOrder, placeOrderStripe, placeOrderRazorpay,
    allOrders, userOrders, updateStatus,
    verifyStripe, verifyRazorpay,
    requestCancelOTP, confirmCancelOrder, getOrderById
} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin
orderRouter.post('/list',   adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

// Payment
orderRouter.post('/place',    authUser, placeOrder)
orderRouter.post('/stripe',   authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// User
orderRouter.post('/userorders', authUser, userOrders)

// Verify payment
orderRouter.post('/verifyStripe',   authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

// Order cancellation with OTP
orderRouter.post('/request-cancel-otp', authUser, requestCancelOTP)
orderRouter.post('/confirm-cancel',     authUser, confirmCancelOrder)

// Single order detail for customer tracking page
orderRouter.post('/detail', authUser, getOrderById)

export default orderRouter
