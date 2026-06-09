import mongoose from 'mongoose'

const deliveryPersonSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone:    { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    isActive:    { type: Boolean, default: true },
    currentLocation: {
        lat:       { type: Number, default: null },
        lng:       { type: Number, default: null },
        updatedAt: { type: Date,   default: null }
    },
    assignedOrders:  [{ type: String }],
    totalDelivered:  { type: Number, default: 0 }
}, { timestamps: true })

const deliveryPersonModel = mongoose.models.deliveryPerson ||
    mongoose.model('deliveryPerson', deliveryPersonSchema)

export default deliveryPersonModel
