const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { addComment, deleteComment } = require('../controllers/commentController');
const router = express.Router();

router.post("/add-comment", userAuth, addComment);
router.delete("/:id", userAuth, deleteComment);

module.exports = router