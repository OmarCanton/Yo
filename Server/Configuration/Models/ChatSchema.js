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
    userDetails: {
        id: String,
        username: String,
        profileImage: String
    },
    otherUsersDetails: {
        id: String,
        username: String,
        profileImage: String
    },
    messages: [MessageSchema],
    unreadMsgsTrack: [
        {
            senderId: String,
            receiverId: String,
            count: { 
                type: Number,
                default: 0
            }
        },
    ],
    lastMessage: {
        type: String
    }
}, { timestamps: true })


module.exports = mongoose.model('Chat', ChatSchema)