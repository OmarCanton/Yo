const { Router } = require('express')
const Chat = require('../Configuration/Models/ChatSchema')

const router = Router()

router.post('/createChat', async (req, res) => {
    const { senderId, receiverId } = req.body
    try {
        const newChat = new Chat({
            members: [
                senderId,
                receiverId
            ]
        })
        const result = await newChat.save()
        console.log(result)
        res.json({success: true, newChat: result})
    } catch (err) {
        console.log(err)
        res.json({success: false, error: err})
    }
})

router.get('getAllUserChats/:userId', async (req, res) => {
    const { userId } = req.params
    try {
        const findUserChats = await Chat.find({
            members: {$in: [userId]}
        })
        if(findUserChats) return res.json({success: true, allUserChats: findUserChats})
    } catch(err) {
        console.log(err)
        res.json({success: false, error: err})
    }
})

router.get('getChat/:firstId/:secondId', async (req, res) => {
    const { firstId, secondId} = req.params
    try {
        const findChat = await Chat.findOne({
            members: {$all: [firstId, secondId]}
        })
        if(findChat) return res.json({success: true, chat: findChat}) 
    } catch(err) {
        console.log(err)
        res.json({success: false, error: err})
    }
})

module.exports = router