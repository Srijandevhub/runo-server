const Article = require('../models/articleModel');
const User = require('../models/userModel');
const Category = require("../models/categoryModel");
const Tag = require('../models/tagModel');
const path = require('path');
const addArticle = async (req, res) => {
    try {
        const { categoryid, tagid, title, shortdescription, content, isarchieved } = req.body;
        const userid = req.user.userid;
        const user = await User.findById(userid);
        const coverimage = req.file;
        const relativePath = path.relative(path.join(__dirname, "../uploads/articles"), coverimage.path);
        const newArticle = new Article({
            userid: userid,
            author: user.firstname + " " + user.lastname,
            authordescription: user.shortdescription,
            title,
            shortdescription,
            coverimage: relativePath,
            content,
            categoryid,
            tagid,
            isarchieved
        });
        // const updateduser = await User.findByIdAndUpdate(userid, {
        //     posts: user.posts.push(newArticle._id)
        // }, { new: true });
        await newArticle.save();
        res.status(200).json({ message: "New article created", article: newArticle });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findById(id);
        const user = await User.findById(article.userid);
        const category = await Category.findById(article.categoryid);
        const tag = await Tag.findById(article.tagid);
        res.status(200).json({ message: "Fetched article", article: article, user: user, category: category, tag: tag });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getArticlesAuth = async (req, res) => {
    try {
        const userid = req.user.userid;
        const articles = await Article.find({ userid: userid });
        res.status(200).json({ message: "Articles fetched", articles: articles });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = { addArticle, getArticle, getArticlesAuth };