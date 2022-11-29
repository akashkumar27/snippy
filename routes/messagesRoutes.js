const { addMessage, getAllMessage } = require("../controllers/messagesController");
const router = require("express").Router();
const mongoose = require('mongoose');

router.post("/addmsg", addMessage)
router.post("/getmsg", getAllMessage);
router.get("/getPhotos/:filename", async (req, res, next) => {
    const connect = mongoose.createConnection("mongodb://localhost:27017/chat-app", { useNewUrlParser: true, useUnifiedTopology: true });
    let gfs;

    connect.once('open', async () => {
        // initialize stream
        gfs = new mongoose.mongo.GridFSBucket(connect.db, { bucketName: "photos" });
        try {
            await gfs.find({ filename: req.params.filename }).toArray((err, files) => {
                if (!files) {
                    console.log(err)
                }
                else {
                    gfs.openDownloadStreamByName(req.params.filename).pipe(res)
                }
            })
        } catch (err) {
            console.log(err)
        }
    });

})
module.exports = router