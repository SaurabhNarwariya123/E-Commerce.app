import express from 'express'
import { chat } from '../controllers/chatController.js'
import adminAuth from '../middleware/adminAuth.js'
import chatRateLimit from '../middleware/chatRateLimit.js'

const chatRouter = express.Router()

// Auth first so unauthenticated traffic is rejected before it can use up anyone's rate-limit budget.
chatRouter.post('/', adminAuth, chatRateLimit, chat)

export default chatRouter
