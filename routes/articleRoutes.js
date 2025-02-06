const express = require('express');
const { userAuth, articleAuth, articleAuth2, adminAuth } = require('../middlewares/auth');
const { addArticle, getArticle, getArticlesAuth, getArticles, updateArticle, deleteArticle, tooglePublish, addArticleToBanner, removeArticleToBanner, addArticleToFeatured, removeFeaturedArticle, getBannerArticles, getFeatured, getEditorsPick, getRelatedPosts } = require('../controllers/articleController');
const { articleImagesUpload } = require('../middlewares/upload');
const router = express.Router();

router.post("/add-article", userAuth, articleImagesUpload.fields([ { name: "coverimage", maxCount: 1 }, { name: "thumbnail", maxCount: 1 } ]), addArticle);
router.get("/public/get-article/:id", articleAuth, getArticle);
router.get("/get-article/:id", articleAuth2, getArticle);
router.get("/get-articles", userAuth, getArticlesAuth);
router.get("/public/get-articles", getArticles);
router.put("/update-article/:id", articleAuth2, articleImagesUpload.fields([ { name: "coverimage", maxCount: 1 }, { name: "thumbnail", maxCount: 1 } ]), updateArticle);
router.delete("/delete-article/:id", articleAuth2, deleteArticle);
router.post("/toogle-publish/:id", articleAuth2, tooglePublish);
router.post("/add-article-to-banner", adminAuth, addArticleToBanner);
router.post("/remove-article-to-banner", adminAuth, removeArticleToBanner);
router.post("/add-article-to-featured", adminAuth, addArticleToFeatured);
router.post("/remove-article-to-featured", adminAuth, removeFeaturedArticle);
router.get("/banner", getBannerArticles);
router.get("/featured", getFeatured);
router.get("/editorspick", getEditorsPick);
router.get("/related-articles/:id", getRelatedPosts);

module.exports = router;