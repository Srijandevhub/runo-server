const express = require('express');
const { registerUser, loginUser, verifyLoggedinUser, userLogout, updateUserInfo, updateProfilePicture, updateCoverImage, removeProfileImage, removeCoverImage } = require('../controllers/userController');
const { userAuth } = require('../middlewares/auth');
const { profileImageUpload } = require('../middlewares/upload');
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/protected", userAuth, verifyLoggedinUser);
router.post("/logout", userLogout);
router.post("/update-info", userAuth, updateUserInfo);
router.post("/update-profileimage", userAuth, profileImageUpload.single("profileimage"), updateProfilePicture);
router.post("/update-coverimage", userAuth, profileImageUpload.single("coverimage"), updateCoverImage);
router.delete("/remove-profileimage", userAuth, removeProfileImage);
router.delete("/remove-coverimage", userAuth, removeCoverImage);

module.exports = router;