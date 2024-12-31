const { Router } = require('express')
const router = Router()
const Chats = require('../Configuration/Models/ChatSchema')
const Users = require('../Configuration/Models/UsersSchema')

//Start Chat
router.post('/startChat', async (req, res) => {
    const { userId, recipientId } = req.body
    try {
        if(!userId || !recipientId) return res.json({success: false, error: 'Invalid user or receiver'})

        //first check for existing chats
        let chat = await Chats.findOne({
            members: {$all: [userId, recipientId]}
        })

        //if no existig chat is found, the chat variable is overridden to contain a new chat content instead of the existing
        if(!chat) {
            chat = new Chats({
                members: [userId, recipientId],
                messages: [] //set to an empty array at the start of a chat
            });
            await chat.save()
        }
        res.json({success: true, chat})

    } catch (err) {
        res.json({success: false, error: err})
    }
})

//Fetch all chats for a user
router.get('/fetchChats/:userId', async (req, res) => {
    const { userId } = req.params
    try {
        const user = await Users.findById(userId)
        if(!user) return res.json({success: false, error: 'User not found'})

        const chats = await Chats.find({members: userId}).sort({updatedAt: -1})

        res.json({success: true, chats})
    } catch(err) {
        res.json({success: false, error: err})
    }
})

//Fetch Messages in a particular chat
router.get('/fetchMessages/:chatId', async (req, res) => {
    const { chatId } = req.params
    try {
        if(!chatId) return res.json({success: false, error: 'Cannot fetch messages, try again!'})
        
        const chat = await Chats.findById(chatId)

        res.json({success: true, messages: chat.messages})

    } catch (err) {
        res.json({success: false, error: err})
    }
})

//Send a new Message
router.post('/sendMessage/:chatId', async (req, res) => {
    const { chatId } = req.params
    const { senderId, content } = req.body

    try {
        if(!senderId) return res.json({success: false, error: 'Message cannot be sent at this time'})
        if(!chatId) return res.json({success: false, error: 'Cannot fetch messages, try again!'})

        const chat = await Chats.findById(chatId)

        //adding new message to the chat object
        chat.messages.push({
            senderId,
            content
        })
        chat.lastMessage = content //whatever sent at the moment will be the last message sent at that moment

        await chat.save()
        //The only thing to return is the last message since it will be the only thing to deal with at the frontend when the message is sent not the entire message object
        //The entire message is fetched once the user opens the chat
        res.json({success: true, messageSent: chat.messages[chat.messages.length - 1]}) //returns the last message in the message aray
    } catch (err) {
        res.json({success: false, error: err})
    }
})






module.exports = router