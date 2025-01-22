const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { addCategory, getCategories } = require('../controllers/categoryController');
const router = express.Router();

router.post("/add-category", userAuth, addCategory);
router.get("/get-categories", getCategories);

module.exports = router;