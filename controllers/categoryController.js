const Category = require("../models/categoryModel");
const addCategory = async (req, res) => {
    try {
        const { title } = req.body;
        const newCategory = new Category({
            title
        });
        await newCategory.save();
        res.status(200).json({ message: "Category added", category: newCategory });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ message: "Categories fetched", categories: categories });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = { addCategory, getCategories };