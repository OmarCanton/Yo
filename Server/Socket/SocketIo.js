const { Server }  = require('socket.io')
const Users = require('../Configuration/Models/UsersSchema')
const Chat = require('../Configuration/Models/ChatSchema')
const socketSetup = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONT_END_URL,
            methods: ["GET", "POST"],
            credentials: true
        }
    })

    let activeUsers = []
    
    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId

        if(userId) {
            if(!activeUsers.some(user => user.userId === userId)) {
                activeUsers.push({
                    userId,
                    socketId: socket.id
                })
            }
        }

        io.emit('getActiveUsers', activeUsers)
        
        socket.on('sendMessage', async ({ chatId, senderId, receiverId, content }) => {
            if(!senderId) return console.log('Message cannot be sent at this time')
            if(!receiverId) return console.log('Message cannot be sent at this time')
            if(!chatId) return console.log('Cannot fetch messages, try again!')
    
            const chat = await Chat.findById(chatId)

            chat.messages.push({
                senderId,
                content
            })
            chat.lastMessage = content

            const existingUnreadMsg = chat.unreadMsgsTrack.find(user => user.senderId === senderId && user.receiverId === receiverId )
            if(existingUnreadMsg) {
                existingUnreadMsg.count += 1
            } else {
                chat.unreadMsgsTrack.push({
                    senderId,
                    receiverId,
                    count: 1
                })
            }
    
            await chat.save()

            const receiver = activeUsers.find(user => user.userId === receiverId)
            
            socket.emit('getSenderMessages', chat.messages)
            if(receiver) {
                io.to(receiver.socketId).emit('getMessages', {
                    message: chat.messages,
                    sender: chat.senderId,
                    receiver: receiverId,
                })
            }

            io.emit('getLastMessage', { 
                lastMessage: chat.lastMessage,
                chatId,
                senderId,
            })
        })

        //Fetching user chats live
        socket.on('fetchChats', async (userId) => {
            if(userId) {
                const user = await Users.findById(userId)
                if(!user) return console.log('User not found')
        
                const chats = await Chat.find({members: userId}).sort({updatedAt: -1})
                const userChats = chats.map((chat) => chat.userDetails.id === userId ? 
                    { chatId: chat._id, theChat: chat.otherUsersDetails, chatLastMessage: chat.lastMessage, unreadCounts: chat.unreadMsgsTrack} 
                    :
                    { chatId: chat._id, theChat: chat.userDetails, chatLastMessage: chat.lastMessage, unreadCounts: chat.unreadMsgsTrack}
                )
                socket.emit('getChats', userChats)
            }
        })

        socket.on('openChat', async ({chatId, selectedUser}) => {
            if(chatId && selectedUser) {
                const chats = await Chat.findById(chatId)
                console.log(chats)
                if(chats) {
                    const chat = chats.unreadMsgsTrack.filter(chat => chat.senderId === selectedUser && chat.receiverId === userId) 
                    if(chat) {
                        chat.count = 0
                    }
                    chats.save()
                }
                
            }
        })
        // socket.emit('fetchUnreadCounts', ())

        socket.on('disconnect', () => {
            activeUsers = activeUsers.filter(user => user.socketId !== socket.id)
            io.emit('getActiveUsers', activeUsers)
        })
    })
}

module.exports = socketSetup