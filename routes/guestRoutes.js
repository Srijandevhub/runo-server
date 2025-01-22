const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { articleImagesUpload } = require('../middlewares/upload');
const { saveImagesForArticles } = require('../controllers/guestController');
const router = express.Router();

router.post("/upload-images", userAuth, articleImagesUpload.array("images", 4), saveImagesForArticles);

module.exports = router;