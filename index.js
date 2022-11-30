// esversion : jshint6
const bodyParser = require('body-parser');
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")
const messageRoute = require("./routes/messagesRoutes")
const socket = require("socket.io")
const crypto = require("crypto")

const app = express()
require("dotenv").config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userRoutes)
app.use("/api/messages", messageRoute)

mongoose.connect(process.env.MONGO_URL).then((client) => {
    console.log("DB connection successfull")
}).catch((err) => {
    console.log(err.message)
})
const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on ${process.env.PORT}`)
})

const io = socket(server, {
    cors: {
        origin: "*",
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
        const isBroadcast = data.isBroadcast;
        if (sendUserSocket || isBroadcast) {
            if (isBroadcast === true) {
                socket.broadcast.emit("msg-receive", { message: data.message, image: data.image, username: data.username });
            }
            else
                socket.to(sendUserSocket).emit("msg-receive", { message: data.message, image: data.image })
        }
    })
})
