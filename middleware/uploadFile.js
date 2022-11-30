const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const { resolve } = require("path");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config()


var storage = new GridFsStorage({
    url: process.env.MONGO_URL,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "photos"
                }
                resolve(fileInfo)
            })
        })
    }
})

var uploadFiles = multer({ storage: storage }).single("file");
var uplaodFilesMiddleware = util.promisify(uploadFiles);
module.exports = uplaodFilesMiddleware