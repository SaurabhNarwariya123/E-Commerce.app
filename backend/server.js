import dns from 'node:dns/promises'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();
dns.setServers(['1.1.1.1', '8.8.8.8']);
import connectCloudinary from './config/cloudinary.js'
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import aiChatRouter from './routes/aiChat.routes.js';
import stockRouter from './routes/stockRoute.js';
import deliveryRouter from './routes/deliveryRoute.js';
import { validateAIConfig } from './config/ai.js';

// App config
const app = express()
const port = process.env.PORT || 4000
connectCloudinary()
connectDB();

// Initialize AI Config
try {
    validateAIConfig();
    console.log('AI Chatbot configured successfully');
} catch (error) {
    console.warn('AI Chatbot not configured:', error.message);
}

// Middlewares
app.use(express.json())

const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.ADMIN_CORS_ORIGIN,
    'https://e-commerce-app-self-ten.vercel.app',
    "https://e-commerce-app-366q.vercel.app",
    "http://localhost:5000",
    "http://localhost:5174",
    "http://localhost:5173",
].filter(Boolean)

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'token'],
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

// Create HTTP server + Socket.io (disabled on Vercel serverless)
const httpServer = createServer(app)

let io = null
if (process.env.VERCEL !== '1') {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', (socket) => {
        // Admin joins admin room to receive all delivery updates
        socket.on('admin:join', () => {
            socket.join('admin-room')
        })

        // Delivery person announces their presence
        socket.on('delivery:join', ({ deliveryPersonId }) => {
            socket.join(`delivery:${deliveryPersonId}`)
            socket.deliveryPersonId = deliveryPersonId
        })

        // Customer/admin tracks a specific order
        socket.on('order:track', ({ orderId }) => {
            socket.join(`order:${orderId}`)
        })

        // Delivery person sends live location (alternative to REST)
        socket.on('delivery:location', async ({ deliveryPersonId, lat, lng }) => {
            io.to('admin-room').emit('delivery-location-update', { deliveryPersonId, lat, lng })
            // Will also notify relevant order rooms (handled in controller for REST)
        })

        socket.on('disconnect', () => {})
    })

    console.log('Socket.io initialized')
}

// Attach io to every request so controllers can emit events
app.use((req, _res, next) => {
    req.io = io
    next()
})

// API endpoints
app.use('/api/user',     userRouter)
app.use('/api/product',  productRouter)
app.use('/api/cart',     cartRouter)
app.use('/api/order',    orderRouter)
app.use('/api/ai',       aiChatRouter)
app.use('/api/stock',    stockRouter)
app.use('/api/delivery', deliveryRouter)

app.get('/', (_req, res) => {
    res.send("API Working")
})

if (process.env.VERCEL !== '1') {
    httpServer.listen(port, () => console.log('Server started on PORT: ' + port))
}

export default app
