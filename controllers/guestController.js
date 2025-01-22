const path = require('path');

const saveImagesForArticles = async (req, res) => {
    try {
        const files = req.files;
        const relativePaths = files.map(file => path.relative(path.join(__dirname, "../uploads/articles"), file.path));
        res.status(200).json({ message: "Images Uploaded", images: relativePaths });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = { saveImagesForArticles };