import express from 'express'
import { addCoupon, listCoupons, removeCoupon, toggleCoupon, applyCoupon, activeCoupons } from '../controllers/couponController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const couponRouter = express.Router()

couponRouter.post('/add', adminAuth, addCoupon)
couponRouter.get('/list', adminAuth, listCoupons)
couponRouter.post('/remove', adminAuth, removeCoupon)
couponRouter.post('/toggle', adminAuth, toggleCoupon)
couponRouter.post('/apply', authUser, applyCoupon)
couponRouter.get('/active', activeCoupons)

export default couponRouter
