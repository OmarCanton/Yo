require('dotenv').config()
const express = require('express')
const connectToDB = require('./Configuration/Connection/MongooseConnect')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const passport = require('passport')
const UserAuthRoutes = require('./Routes/UserAuthRoutes')
const FriendRequestsRoutes = require('./Routes/FriendRequestsRoutes')
const ChatRoutes = require('./Routes/ChatRoutes')
const app = express();

app.use(cors({
    origin: process.env.FRONT_END_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}))

// Start database server
connectToDB()

app.use(express.json())
app.use(cookieParser())
// app.use(bodyParser.json())

app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 2 //Store user session for 2 days 
    },
    store: MongoStore.create({
        client: mongoose.connection.getClient()
    })
}))

app.use(passport.initialize())
app.use(passport.session())


//ROUTES
// ..../
app.use(UserAuthRoutes)
app.use(FriendRequestsRoutes)
app.use(ChatRoutes)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`)
})