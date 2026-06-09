import express from 'express'
import { getStockList, updateStock, getLowStock, getSingleStock, getDashboardStats } from '../controllers/stockController.js'
import adminAuth from '../middleware/adminAuth.js'

const stockRouter = express.Router()

stockRouter.get('/list', adminAuth, getStockList)
stockRouter.get('/low', adminAuth, getLowStock)
stockRouter.post('/update', adminAuth, updateStock)
stockRouter.post('/single', adminAuth, getSingleStock)
stockRouter.get('/dashboard-stats', adminAuth, getDashboardStats)

export default stockRouter
