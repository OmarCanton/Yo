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
            const user = await Users.findById(userId)
            const otherUser = await Users.findById(recipientId)
            chat = new Chats({
                members: [userId, recipientId],
                messages: [], //set to an empty array at the start of a chat
                unreadMessages: [],
                userDetails: {
                    id: user._id,
                    username: user.username,
                    profileImage: user.profileImage
                },
                otherUsersDetails: {
                    id: otherUser._id,
                    username: otherUser.username,
                    profileImage: otherUser.profileImage
                }
            });
            await chat.save()
        }
        res.json({success: true, chat})

    } catch (err) {
        res.json({success: false, error: err})
    }
})


//Handled with socket io
//Fetch all chats for a user
// router.get('/fetchChats/:userId', async (req, res) => {
//     const { userId } = req.params
//     try {
//         const user = await Users.findById(userId)
//         if(!user) return res.json({success: false, error: 'User not found'})

//         const chats = await Chats.find({members: userId}).sort({updatedAt: -1})
//         const userChats = chats.map(
//             chat => chat.userDetails.id === userId ? 
//             { chatId: chat._id, theChat: chat.otherUsersDetails, chatLastMessage: chat.lastMessage } 
//             :
//             { chatId: chat._id, theChat: chat.userDetails, chatLastMessage: chat.lastMessage}
//         )

//         res.json({success: true, chats: userChats})
//     } catch(err) {
//         res.json({success: false, error: err})
//     }
// })

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
// router.get('/fetchUnreadCount/:chatId/:userId', async (req, res) => {
//     const { chatId, userId } = req.params
//     try {
//         const findChat = await Chats.findById(chatId)
//         if(findChat) {
//             const unreadCnt = findChat.unreadMsgsTrack.filter(msg => msg.receiverId === userId)
//             res.json({success: true, unreadCnt})
//         }
//     } catch (err) {
//         console.log(err)
//         res.json({success: false, error: err})
//     }
// })

//Send a new Message
// router.post('/sendMessage/:chatId', async (req, res) => {
//     const { chatId } = req.params
//     const { senderId, content } = req.body

//     try {
//         if(!senderId) return res.json({success: false, error: 'Message cannot be sent at this time'})
//         if(!chatId) return res.json({success: false, error: 'Cannot fetch messages, try again!'})

//         const chat = await Chats.findById(chatId)

//         //adding new message to the chat object
//         chat.messages.push({
//             senderId,
//             content
//         })
//         chat.lastMessage = content //whatever sent at the moment will be the last message sent at that moment

//         await chat.save()
//         //The only thing to return is the last message since it will be the only thing to deal with at the frontend when the message is sent not the entire message object
//         //The entire message is fetched once the user opens the chat
//         res.json({success: true, messageSent: chat.messages[chat.messages.length - 1]}) //returns the last message in the message aray
//     } catch (err) {
//         res.json({success: false, error: err})
//     }
// })

//fetch user details when requested
router.get('/getProfile/:userId', async (req, res) => {
    const { userId } = req.params
    try {
        if(!userId) return res.json({success: false, error: 'An unexpected error occured'})
        const user = await Users.findById(userId)
        if(!user) return res.json({success: false, error: 'User not found'})

        res.json({success: true, user})
    } catch(err) {
        res.json({success: false, error: err})
    }
})
router.get('/findChat/:userId/:keyword', async (req, res) => {
    const { userId, keyword } = req.params
    const search  = new RegExp(keyword, 'i')
    try {
        if(!userId) return res.json({success: false, error: 'Invalid User'})
        const user = await Users.findById(userId)
        if(!user) return res.json({success: false, error: 'User not found'})
        const chats = await Chats.find({ members: userId }).sort({createdAt: -1})
        
        const userChats = chats.map(
            chat => chat.userDetails.id === userId ?
            { chatId: chat._id, theChat: chat.otherUsersDetails, chatLastMessage: chat.lastMessage } 
            :
            { chatId: chat._id, theChat: chat.userDetails, chatLastMessage: chat.lastMessage}
        )
        const chatSearchRes = userChats.filter(chat => search.test(chat.theChat.username))

        res.json({success: true, chatSearchRes})
    } catch(err) {
        res.json({success: false, error: err})
    }
})




module.exports = router