import productModel from '../models/productModel.js'
import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'

// Admin: Get stock list for all products
const getStockList = async (req, res) => {
    try {
        const products = await productModel.find({}, 'name sizes stock')
        // Convert Mongoose Map → plain object so frontend Object.entries() works
        const result = products.map(p => {
            const obj = p.toObject()
            if (obj.stock instanceof Map) {
                obj.stock = Object.fromEntries(obj.stock)
            }
            return obj
        })
        res.json({ success: true, products: result })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: Update stock for a product (per size)
// Body: { productId, stock: { S: 10, M: 5, L: 3 } }
const updateStock = async (req, res) => {
    try {
        const { productId, stock } = req.body
        if (!productId || !stock) {
            return res.json({ success: false, message: 'productId and stock required' })
        }
        const product = await productModel.findById(productId)
        if (!product) return res.json({ success: false, message: 'Product not found' })

        // Replace entire Map — must use .save() so Mongoose casts correctly
        product.stock = new Map(Object.entries(stock).map(([k, v]) => [k, Number(v) || 0]))
        await product.save()

        res.json({ success: true, message: 'Stock updated', product })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: Get low stock products (threshold default: 5)
const getLowStock = async (req, res) => {
    try {
        const threshold = Number(req.query.threshold) || 5
        const products = await productModel.find({})

        const lowStockProducts = products.filter(p => {
            if (!p.stock || p.stock.size === 0) return false
            return [...p.stock.values()].some(qty => qty <= threshold)
        })

        res.json({ success: true, products: lowStockProducts })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: Get stock of a single product
const getSingleStock = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId, 'name sizes stock')
        if (!product) return res.json({ success: false, message: 'Product not found' })
        res.json({ success: true, product })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: Dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const [totalOrders, totalUsers, totalProducts, orders, products] = await Promise.all([
            orderModel.countDocuments(),
            userModel.countDocuments(),
            productModel.countDocuments(),
            orderModel.find().sort({ date: -1 }),
            productModel.find({}, 'name stock'),
        ])

        const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0)

        const ordersByStatus = orders.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1
            return acc
        }, {})

        const lowStockCount = products.filter(p => {
            if (!p.stock || p.stock.size === 0) return false
            return [...p.stock.values()].some(qty => qty <= 5)
        }).length

        const recentOrders = orders.slice(0, 5).map(o => ({
            _id: o._id,
            items: o.items?.length || 0,
            amount: o.amount,
            status: o.status,
            date: o.date,
            address: o.address,
            paymentMethod: o.paymentMethod,
        }))

        res.json({
            success: true,
            stats: { totalOrders, totalRevenue, totalUsers, totalProducts, lowStockCount },
            ordersByStatus,
            recentOrders,
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { getStockList, updateStock, getLowStock, getSingleStock, getDashboardStats }
