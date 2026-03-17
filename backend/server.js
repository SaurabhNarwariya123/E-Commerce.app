import dns from 'node:dns/promises'
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


// App config
const app = express()
const port = process.env.PORT || 4000
connectCloudinary()
connectDB();

//  middle wares
app.use(express.json())

const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.ADMIN_CORS_ORIGIN,
    'https://e-commerce-app-dun-beta.vercel.app',
    'https://e-commerce-app-admin-rust.vercel.app',
    "http://localhost:4000",
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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

// api endpoints
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)

app.get('/',(req,res)=>{
    res.send("API Working")
})

if (process.env.VERCEL !== '1') {
    app.listen(port, () => console.log('server started on PORT : ' + port))
}

export default app
