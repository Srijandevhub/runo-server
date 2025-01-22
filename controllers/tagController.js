const Tag = require('../models/tagModel');
const addTag = async (req, res) => {
    try {
        const { title } = req.body;
        const newTag = new Tag({
            title
        });
        res.status(200).json({ message: "Tag added", tag: newTag });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getTags = async (req, res) => {
    try {
        const tags = await Tag.find();
        res.status(200).json({ message: "Tag added", tags: tags });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = { addTag, getTags };