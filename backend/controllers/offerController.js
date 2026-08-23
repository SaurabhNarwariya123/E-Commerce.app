import { v2 as cloudinary } from 'cloudinary'
import offerModel from '../models/offerModel.js'

// ─── Admin: Add a festival offer ─────────────────────────────────────────────
const addOffer = async (req, res) => {
    try {
        const { title, description, discountText, startDate, endDate } = req.body

        if (!title || !startDate || !endDate) {
            return res.json({ success: false, message: 'Title, start date and end date are required' })
        }
        if (!req.file) {
            return res.json({ success: false, message: 'Offer image is required' })
        }

        const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })

        const offer = new offerModel({
            title,
            description: description || '',
            discountText: discountText || '',
            imageUrl: result.secure_url,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            date: Date.now()
        })
        await offer.save()

        res.json({ success: true, message: 'Offer added' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: List all offers ───────────────────────────────────────────────────
const listOffers = async (req, res) => {
    try {
        const offers = await offerModel.find({}).sort({ date: -1 })
        res.json({ success: true, offers })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Admin: Remove an offer ───────────────────────────────────────────────────
const removeOffer = async (req, res) => {
    try {
        const { id } = req.body
        await offerModel.findByIdAndDelete(id)
        res.json({ success: true, message: 'Offer removed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ─── Public: Currently-active offers ─────────────────────────────────────────
const activeOffers = async (req, res) => {
    try {
        const now = new Date()
        const offers = await offerModel.find({ startDate: { $lte: now }, endDate: { $gte: now } }).sort({ endDate: 1 })
        res.json({ success: true, offers })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addOffer, listOffers, removeOffer, activeOffers }
