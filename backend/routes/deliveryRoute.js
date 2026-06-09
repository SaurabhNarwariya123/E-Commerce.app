import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import deliveryAuth from '../middleware/deliveryAuth.js'
import {
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
} from '../controllers/deliveryController.js'

const deliveryRouter = express.Router()

// ─── Admin routes ─────────────────────────────────────────────────────────────
deliveryRouter.post('/add',           adminAuth, addDeliveryPerson)
deliveryRouter.get('/list',           adminAuth, listDeliveryPersons)
deliveryRouter.post('/remove',        adminAuth, removeDeliveryPerson)
deliveryRouter.post('/toggle-status', adminAuth, toggleDeliveryStatus)
deliveryRouter.post('/assign-order',  adminAuth, assignOrderToDelivery)
deliveryRouter.get('/tracking',       adminAuth, getLiveTracking)

// ─── Delivery person public route ─────────────────────────────────────────────
deliveryRouter.post('/login', loginDeliveryPerson)

// ─── Delivery person protected routes ────────────────────────────────────────
deliveryRouter.post('/update-location',       deliveryAuth, updateDeliveryLocation)
deliveryRouter.get('/my-orders',              deliveryAuth, getMyOrders)
deliveryRouter.post('/request-delivery-otp', deliveryAuth, requestDeliveryOTP)
deliveryRouter.post('/update-order-status',  deliveryAuth, updateDeliveryOrderStatus)

export default deliveryRouter
