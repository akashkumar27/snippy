const messageModel = require("../model/messageModel");
const userModel = require("../model/userModel");
const uploadFiles = require("../middleware/uploadFile")


module.exports.addMessage = async (req, res, next) => {
    try {
        await uploadFiles(req, res);

        const { from, to, message, isBroadcast, username } = req.body;

        const data = await messageModel.create({
            message: { text: message },
            users: [from, to],
            sender: from,
            isBroadcast: isBroadcast,
            username: username,
            img: req.file !== undefined ? req.file.id : null
        })
        if (data)
            return res.json({ msg: "Message added successfully" })
        else
            return res.json({ msg: "Failed to add message to the database" })
    }
    catch (err) {
        next(err)
    }
}

module.exports.getAllMessage = async (req, res, next) => {
    try {
        const { from, to, isBroadcast } = req.body
        let messages;
        if (!isBroadcast) {
            messages = await messageModel.find({
                users: {
                    $all: [from, to],
                }
            }).sort({ updatedAt: 1 })
        }
        else {
            messages = await messageModel.find({ isBroadcast: true })
        }


        const projectedMessages = messages.map((msg) => {
            return {
                sender: msg.sender,
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text,
                username: msg.username
            }
        })
        res.json(projectedMessages)
    }
    catch (err) {
        next(err)
    }
}