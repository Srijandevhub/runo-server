const express = require('express');
const { userAuth } = require('../middlewares/auth');
const { addTag, getTags } = require('../controllers/tagController');
const router = express.Router();

router.post("/add-tag", userAuth, addTag);
router.get("/get-tags", getTags);

module.exports = router;