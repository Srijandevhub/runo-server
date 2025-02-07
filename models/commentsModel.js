const mongoose = require('mongoose');
const commentsSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    articleid: { type: mongoose.Schema.Types.ObjectId, ref: 'articles' },
    comment: { type: String }
}, { timestamps: true });

const Comment = mongoose.model("comments", commentsSchema);

module.exports = Comment;