import express from 'express'
import { addOffer, listOffers, removeOffer, activeOffers } from '../controllers/offerController.js'
import upload from '../middleware/multer.js'
import adminAuth from '../middleware/adminAuth.js'

const offerRouter = express.Router()

offerRouter.post('/add', adminAuth, upload.single('image'), addOffer)
offerRouter.post('/remove', adminAuth, removeOffer)
offerRouter.get('/list', adminAuth, listOffers)
offerRouter.get('/active', activeOffers)

export default offerRouter
