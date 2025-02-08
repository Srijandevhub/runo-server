const Article = require('../models/articleModel');
const User = require('../models/userModel');
const Category = require("../models/categoryModel");
const Tag = require('../models/tagModel');
const Comment = require('../models/commentsModel');
const path = require('path');
const addArticle = async (req, res) => {
    try {
        const { categoryid, tagid, title, shortdescription, content, isarchieved } = req.body;
        const userid = req.user.userid;
        const coverimage = req.files.coverimage[0];
        const thumbnail = req.files.thumbnail[0];
        const relativePath = path.relative(path.join(__dirname, "../uploads/articles"), coverimage.path);
        const relativePath2 = path.relative(path.join(__dirname, "../uploads/articles"), thumbnail.path);
        const newArticle = new Article({
            userid: userid,
            title,
            shortdescription,
            coverimage: relativePath,
            thumbnail: relativePath2,
            content,
            categoryid,
            tagid,
            isarchieved
        });
        await User.findByIdAndUpdate(userid, {
            $push: { posts: newArticle._id }
        });
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
        const comments = await Comment.find({ articleid: id });
        const commentuserids = comments.map(item => item.userid);
        const commentusers = await User.find({ _id: { $in: commentuserids } });
        const finalComments = comments.map((item) => {
            const user = commentusers.find(user => user._id.toString() === item.userid.toString());
            return {
                _id: item._id,
                comment: item.comment,
                userid: user._id,
                username: (user.firstname || user.lastname) ? user.firstname + " " + user.lastname : user.username,
                profileimage: user.profileimage,
                createdAt: item.createdAt
            }
        });
        const user = await User.findById(article.userid);
        const category = await Category.findById(article.categoryid);
        const tag = await Tag.findById(article.tagid);
        res.status(200).json({ message: "Fetched article", article: article, user: user, category: category, tag: tag, comments: finalComments });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getArticlesAuth = async (req, res) => {
    try {
        const { limit = 4, skip = 0 } = req.query;
        const userid = req.user.userid;
        const totalArticles = await Article.countDocuments({ userid: userid });
        const articles = await Article.find({ userid: userid }).skip(Number(skip)).limit(Number(limit));
        const totalPages = Math.ceil(totalArticles / limit);
        const currentPage = Math.floor(skip / limit) + 1;
        const previousPage = currentPage > 1 ? currentPage - 1 : null;
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        res.status(200).json({ message: "Articles fetched", articles: articles, 
            pagination: {
                totalPages,
                currentPage,
                previousPage,
                nextPage
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getArticles = async (req, res) => {
    try {
        let { cat = 'all', limit = 9, skip = 0, query = "" } = req.query;
        let posts, totalPosts;
        if (!cat.trim()) {
            cat = "all";
        }
        const catIds = cat !== 'all' ? cat.split(',') : [];
        const searchQuery = query ? { title: { $regex: query, $options: 'i' } } : {};
        if (!limit) {
            posts = await Article.find({ isarchieved: false, ...searchQuery }).sort({ createdAt: -1 });
            totalPosts = await Article.countDocuments({ isarchieved: false, ...searchQuery });
        }
        if (cat === 'all') {
            posts = await Article.find({ isarchieved: false, ...searchQuery }).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit));
            totalPosts = await Article.countDocuments({ isarchieved: false, ...searchQuery });
        } else if (catIds.length > 0) {
            posts = await Article.find({ categoryid: { $in: catIds }, isarchieved: false, ...searchQuery }).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit));
            totalPosts = await Article.countDocuments({ categoryid: catIds, isarchieved: false, ...searchQuery });
        }
        const userids = posts.map(post => post.userid);
        const categoryIds = posts.map(post => post.categoryid);
        const users = await User.find({ _id: { $in: userids } });
        const categories = await Category.find({ _id: { $in: categoryIds } });
        const allPosts = posts.map((post) => {
            const user = users.find(item => item._id.toString() === post.userid.toString());
            const category = categories.find(item => item._id.toString() === post.categoryid.toString());
            return {
                _id: post._id,
                thumbnail: post.thumbnail,
                createdAt: post.createdAt,
                title: post.title,
                shortdescription: post.shortdescription,
                userid: user._id,
                authorimage: user.profileimage,
                author: (user.firstname && user.lastname) ? user.firstname + " " + user.lastname : user.username,
                authordes: user.shortdescription,
                categorytitle: category.title,
                coverimage: post.coverimage
            }
        })
        const totalPages = Math.ceil(totalPosts / limit);
        const currentPage = Math.floor(skip / limit) + 1;
        const previousPage = currentPage > 1 ? currentPage - 1 : null;
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        res.status(200).json({ message: "Posts fetched", posts: allPosts, pagination: {
            totalPages,
            currentPage,
            previousPage,
            nextPage
        }});
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const updateArticle = async (req, res) => {
    try {
        const { categoryid, tagid, title, shortdescription, content, isarchieved } = req.body;
        const { id } = req.params;
        const article = await Article.findById(id);
        let relativeCover = article.coverimage;
        let relativeThumbnail = article.thumbnail;
        const coverimage = req.files.coverimage?.[0] || null;
        const thumbnail = req.files.thumbnail?.[0] || null;
        if (coverimage) {
            relativeCover = path.relative(path.join(__dirname, "../uploads/articles"), coverimage.path);
        }
        if (thumbnail) {
            relativeThumbnail = path.relative(path.join(__dirname, "../uploads/articles"), thumbnail.path);
        }
        const updatedArticle = await Article.findByIdAndUpdate(id, {
            title,
            shortdescription,
            coverimage: relativeCover,
            thumbnail: relativeThumbnail,
            content,
            categoryid,
            tagid,
            isarchieved
        }, { new: true })
        res.status(200).json({ message: "post updated", post: updatedArticle });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        await Article.findByIdAndDelete(id);
        res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const tooglePublish = async (req, res) => {
    try {
        const { archieved } = req.body;
        const { id } = req.params;
        await Article.findByIdAndUpdate(id, {
            isarchieved: archieved
        });
        res.status(200).json({ message: "Post modified" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const addArticleToBanner = async (req, res) => {
    try {
        const { articleid } = req.body;
        const selectedArticle = await Article.findById(articleid);
        if (selectedArticle.showbanner) {
            res.status(400).json({ message: "Article Already added to banner" });
        }
        await Article.findByIdAndUpdate(articleid, {
            showbanner: true
        });
        res.status(200).json({ message: "Article modified" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
const removeArticleToBanner = async (req, res) => {
    try {
        const { articleid } = req.body;
        const selectedArticle = await Article.findById(articleid);
        if (!selectedArticle.showbanner) {
            res.status(400).json({ message: "Article is not added to banner" });
        }
        await Article.findByIdAndUpdate(articleid, {
            showbanner: false
        });
        res.status(200).json({ message: "Article modified" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const addArticleToFeatured = async (req, res) => {
    try {
        const { articleid } = req.body;
        const featured = await Article.find({ featured: true });
        if (featured._id.toString() === articleid) {
            res.status(400).json({ message: "Article Already added to featured" });
        }
        if (featured.length == 1) {
            res.status(400).json({ message: "Already there is one featured article" });
        }
        await Article.findByIdAndUpdate(articleid, {
            featured: true
        });
        res.status(200).json({ message: "Article modified" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const removeFeaturedArticle = async (req, res) => {
    try {
        const { articleid } = req.body;
        await Article.findByIdAndUpdate(articleid, {
            featured: false
        });
        res.status(200).json({ message: "Article modified" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getBannerArticles = async (req, res) => {
    try {
        const articles = await Article.find({ showbanner: true, isarchieved: false });
        const categoryids = articles.map(item => item.categoryid);
        const categories = await Category.find({ _id: { $in: categoryids } });
        const updatedArticles = articles.map((item) => {
            const category = categories.find(cat => cat._id.toString() === item.categoryid.toString());
            return {
                categorytitle: category.title,
                coverimage: item.coverimage,
                title: item.title,
                createdAt: item.createdAt,
                shortdescription: item.shortdescription,
                _id: item._id
            }
        })
        res.status(200).json({ message: "Articles fetched", articles: updatedArticles });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getFeatured = async (req, res) => {
    try {
        const article = await Article.findOne({ featured: true, isarchieved: false }).sort({ createdAt: -1 });
        const category = await Category.findById(article.categoryid);
        const finalArticle = {
            _id: article._id,
            title: article.title,
            coverimage: article.coverimage,
            shortdescription: article.shortdescription,
            createdAt: article.createdAt,
            categorytitle: category.title
        };
        res.status(200).json({ message: "Article fetched", article: finalArticle });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getEditorsPick = async (req, res) => {
    try {
        const articles = await Article.find({ editorpick: true, isarchieved: false });
        const categoryids = articles.map(item =>item.categoryid);
        const categories = await Category.find({ _id: { $in: categoryids } });
        const finalArticles = articles.map((item) => {
            const category = categories.find(cat => cat._id.toString() === item.categoryid.toString());
            return {
                _id: item._id,
                coverimage: item.coverimage,
                categorytitle: category.title,
                title: item.title,
                shortdescription: item.shortdescription,
                createdAt: item.createdAt
            }
        })
        res.status(200).json({ message: "Article fetched", articles: finalArticles });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getRelatedPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findById(id);
        const relatedArticles = await Article.find({ categoryid: article.categoryid, _id: { $ne: id }, isarchieved: false }).sort({ createdAt: -1 }).limit(5);
        const category = await Category.findById(article.categoryid);
        const modifiedArticles = relatedArticles.map((item) => {
            const articleObj = item.toObject();
            return { ...articleObj, categorytitle: category?.title };
        });
        res.status(200).json({ message: "Articles fetched", articles: modifiedArticles });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getAdminArticles = async (req, res) => {
    try {
        const { limit = 10, skip = 0, query = "" } = req.query;
        const searchQuery = query ? { title: { $regex: query, $options: 'i' } } : {};
        const articles = await Article.find({ ...searchQuery }).skip(Number(skip)).limit(Number(limit));
        const articlesTotal = await Article.countDocuments({ ...searchQuery });
        const totalPages = Math.ceil(articlesTotal / limit);
        const currentPage = Math.floor(skip / limit) + 1;
        const previousPage = currentPage > 1 ? currentPage - 1 : null;
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        res.status(200).json({ message: "Articles Fetched", articles: articles, 
            pagination: {
                totalPages,
                currentPage,
                previousPage,
                nextPage
            }
         });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = { addArticle, getArticle, getArticlesAuth, getArticles, updateArticle, deleteArticle, tooglePublish, addArticleToBanner, removeArticleToBanner, addArticleToFeatured, removeFeaturedArticle, getBannerArticles, getFeatured, getEditorsPick, getRelatedPosts, getAdminArticles };