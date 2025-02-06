const Article = require('../models/articleModel');

const articleModifierForAddingfeatured = async (req, res) => {
    try {
        await Article.updateMany({
            featured: false
        });
    } catch (error) {
        console.log(error);
    }
}


module.exports = { articleModifierForAddingfeatured };