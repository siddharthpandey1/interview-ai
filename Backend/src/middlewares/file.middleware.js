const multer = require("multer")


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024
    },
    fileFilter(req, file, callback) {
        if (file.mimetype !== "application/pdf") {
            const error = new Error("Only PDF files are allowed.")
            error.code = "INVALID_FILE_TYPE"
            return callback(error)
        }

        callback(null, true)
    }
})

function uploadResume(req, res, next) {
    upload.single("resume")(req, res, error => {
        if (error?.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "Resume PDF must be 3 MB or smaller."
            })
        }

        if (error?.code === "INVALID_FILE_TYPE") {
            return res.status(400).json({
                message: error.message
            })
        }

        if (error) {
            return next(error)
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Resume PDF is required."
            })
        }

        next()
    })
}

module.exports = uploadResume