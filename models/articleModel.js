const mongoose = require('mongoose');
const articleSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    title: { type: String },
    shortdescription: { type: String },
    coverimage: { type: String },
    content: { type: String },
    categoryid: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    tagid: { type: mongoose.Schema.Types.ObjectId, ref: 'tags' },
    isarchieved: { type: Boolean }
}, { timestamps: true })

const Article = mongoose.model('articles', articleSchema);
module.exports = Article;