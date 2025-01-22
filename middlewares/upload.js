const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profileImageStrorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userdir = path.join(__dirname, "../uploads/users");
        if (!fs.existsSync(userdir)) {
            fs.mkdirSync(userdir, { recursive: true });
        }
        cb(null, userdir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
})

const profileImageUpload = multer({ storage: profileImageStrorage });

const articleImagesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const articleDir = path.join(__dirname, "../uploads/articles");
        if (!fs.existsSync(articleDir)) {
            fs.mkdirSync(articleDir);
        }
        cb(null, articleDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
})

const articleImagesUpload = multer({ storage: articleImagesStorage });

module.exports = { profileImageUpload, articleImagesUpload };