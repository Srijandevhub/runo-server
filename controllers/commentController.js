const Comment = require('../models/commentsModel');
const User = require("../models/userModel");

const addComment = async (req, res) => {
    try {
        const { articleid, comment } = req.body;
        const userid = req.user.userid;
        if (!comment.trim()) {
            return res.status(400).json({ message: "Cannot be empty" });
        }
        const user = await User.findById(userid);
        const newComment = new Comment({
            userid,
            articleid,
            comment
        });
        await newComment.save();
        const finalComment = {
            _id: newComment._id,
            comment,
            userid,
            username: (user.firstname || user.lastname) ? user.firstname + " " + user.lastname : user.username,
            profileimage: user.profileimage,
            createdAt: newComment.createdAt
        }
        res.status(200).json({ message: "Comment added", comment: finalComment });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userid = req.user.userid;
        const comment = await Comment.findById(id);
        if (comment.userid.toString() !== userid.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        await Comment.findByIdAndDelete(id);
        res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = { addComment, deleteComment };