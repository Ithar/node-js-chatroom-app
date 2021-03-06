const socketio = require('socket.io')

const { generateMessage, generateLocationMessage } = require('../utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('../utils/users')

const socketService = {

    init(server) {
        const io = socketio(server)
        this.connect(io)
    }, 
    connect(io) {

        io.on('connection', (socket) => {

            console.log('New connection was established')
        
            socketService.joinListener(io, socket)
            socketService.sendMsgListener(io, socket)
            socketService.disconnectListener(io, socket)
        
            // TODO delete !
            socket.on('sendLocation', (coords, callback) => {
                const user = getUser(socket.id)
                io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
                callback()
            })
           
        })
    },
    joinListener(io, socket) {

         socket.on('join', (options, callback) => {
        
            const { error, user } = addUser({ id: socket.id, ...options })
    
            if (error) {
                return callback(error)
            }
    
            socket.join(user.room)
    
            const displayName = user.username.charAt(0).toUpperCase() + user.username.slice(1); 
            socket.emit('message', generateMessage('Admin', 'Welcome!'))
            socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${displayName} joined the chatroom!`))
            io.to(user.room).emit('roomData', {
                room: user.room.toUpperCase(),
                users: getUsersInRoom(user.room)
            })
    
            callback()
        })
    },
    sendMsgListener(io, socket) {

        socket.on('sendMessage', (message, callback) => {
            const user = getUser(socket.id)
            io.to(user.room).emit('message', generateMessage(user.username, message))
            callback()
        })

    }, 
    disconnectListener(io, socket) {
         
         socket.on('disconnect', () => {
            const user = removeUser(socket.id)
    
            if (user) {
                const displayName = user.username.charAt(0).toUpperCase() + user.username.slice(1); 
                io.to(user.room).emit('message', generateMessage('Admin', `${displayName} left the room!`))
                io.to(user.room).emit('roomData', {
                    room: user.room,
                    users: getUsersInRoom(user.room)
                })
            }
        })
    }
}

module.exports = socketService