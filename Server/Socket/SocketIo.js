const { Server }  = require('socket.io')
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

        socket.on('disconnect', () => {
            activeUsers = activeUsers.filter(user => user.socketId !== socket.id)
            io.emit('getActiveUsers', activeUsers)
        })
    })
}

module.exports = socketSetup