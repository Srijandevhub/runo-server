const mongoose = require('mongoose');
const tagSchema = new mongoose.Schema({
    title: { type: String }
}, { timestamps: true });

const Tag = mongoose.model("tags", tagSchema);
module.exports = Tag;