const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'seen'],
        default: 'sent'
    }
}, { timestamps: true })

const ChatSchema = new mongoose.Schema({
    members: [
        {
            type:String
        }
    ],
    messages: [MessageSchema],
    lastMessage: {
        type: String
    }
}, { timestamps: true })


module.exports = mongoose.model('Chat', ChatSchema)