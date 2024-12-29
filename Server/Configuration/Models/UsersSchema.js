const mongoose = require('mongoose')


const UsersSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        default: null
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: null
    },
    sex: { 
        type: String,
        required: true
    },
    birthdate: {
        type: String,
        required: true
    },
    isAuthenticated: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: null
    },
    about: {
        type: String,
        default: null
    },
    friends: [
        {
            userId: String,
            username: String,
            profileImage: String,
        }
    ],
    friendRequests: [
        {
            senderId: String,
            username: String,
            senderPhoto: String
        }
    ],
    verificationCode: {
        type: String,
    },
    verificationCodeExpire: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date
}, {timestamps: true})

module.exports = mongoose.model('Users', UsersSchema)