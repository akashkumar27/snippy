// esversion : jshint6
const bodyParser = require('body-parser');
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")
const messageRoute = require("./routes/messagesRoutes")
const socket = require("socket.io")

const app = express()
require("dotenv").config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userRoutes)
app.use("/api/messages", messageRoute)
let _db;
let server;
mongoose.connect(process.env.MONGO_URL).then((client) => {
    _db = client.connection.db;
    console.log("DB connection successfull")
    server = app.listen(process.env.PORT, () => {
        console.log(`Server started on ${process.env.PORT}`)
    })
}).catch((err) => {
    console.log(err.message)
})

const getDatabase = () => {
    if (_db) return _db;
    else throw "No database found"
}

const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    }
})

global.onlineUsers = new Map()

io.on("connection", (socket) => {
    global.chatSocket = socket

    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id)
    })

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to)
        if (sendUserSocket) {

            socket.to(sendUserSocket).emit("msg-receive", data.message)
        }
    })
})

module.exports.getDatabase = getDatabase;