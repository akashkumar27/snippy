const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage")

var storage = new GridFsStorage({
    url: "mongodb://localhost:27017/chat-app",
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return {
            bucketName: "photos",
            filename: `${Date.now()}-chat-app-${file.originalname}`
        }
    }
})

var uploadFiles = multer({ storage: storage }).single("file");
var uplaodFilesMiddleware = util.promisify(uploadFiles);
module.exports = uplaodFilesMiddleware