import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
    title        : { type: String, required: true },
    description  : { type: String, default: '' },
    imageUrl     : { type: String, required: true },
    discountText : { type: String, default: '' },
    startDate    : { type: Date, required: true },
    endDate      : { type: Date, required: true },
    date         : { type: Number, required: true },
})

const offerModel = mongoose.models.offer || mongoose.model('offer', offerSchema)
export default offerModel
