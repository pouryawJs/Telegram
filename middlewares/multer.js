const multer = require("multer");
const fs = require("fs");
const path = require("path");

exports.multerStorage = (destination, allowedTypes = /jpg|png|jpeg/) => {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            const randomName = Math.floor(Math.random() * 999_999_999_999);
            const ext = path.extname(file.originalname);
            cb(null, `${randomName}${ext}`);
        },
    });

    const upload = multer({
        storage,
        fileFilter: (req, file, cb) => {
            if (allowedTypes.test(file.filename)) {
                cb(null, true);
            } else {
                cb(new Error("file type not allowed"));
            }
        },
    });

    return upload;
};
