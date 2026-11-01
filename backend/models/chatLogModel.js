import mongoose from 'mongoose'

const chatLogSchema = new mongoose.Schema({
    adminId    : { type: String, required: true },
    requestId  : { type: String, required: true },
    message    : { type: String, required: true },
    intent     : { type: String, default: null },
    sourceLabel: { type: String, default: null },
    success    : { type: Boolean, required: true },
    errorMessage: { type: String, default: null },
    timestamp  : { type: Date, default: Date.now },
})

const chatLogModel = mongoose.models.chatLog || mongoose.model('chatLog', chatLogSchema)
export default chatLogModel
