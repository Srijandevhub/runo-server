const express = require('express');
const { userAuth, articleAuth } = require('../middlewares/auth');
const { addArticle, getArticle, getArticlesAuth } = require('../controllers/articleController');
const { articleImagesUpload } = require('../middlewares/upload');
const router = express.Router();

router.post("/add-article", userAuth, articleImagesUpload.single("coverimage"), addArticle);
router.get("/public/get-article/:id", articleAuth, getArticle);
router.get("/get-articles", userAuth, getArticlesAuth);

module.exports = router;