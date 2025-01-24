const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const registerUser = async (req, res) => {
    try {
        const { username, email, password, gender } = req.body;
        if (!username.trim()) {
            return res.status(400).json({ message: "Username required" });
        }
        if (!email.trim()) {
            return res.status(400).json({ message: "Email required" });
        }
        if (!password.trim()) {
            return res.status(400).json({ message: "Password required" });
        }
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(password)) {
            return res.status(400).json({ message: "Enter valid password" });
        }
        const user = await User.findOne({ $or: [{ username: username }, { email: email }] });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            profileimage: gender === 'male' ? '/archieved/maleavatar.png' : "/archieved/femaleavatar.png",
            password: hashedPassword,
            gender
        });
        await newUser.save();
        res.status(200).json({ message: "User registered" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
const loginUser = async (req, res) => {
    try {
        const { identifier, password, rememberme } = req.body;
        if (!identifier.trim()) {
            return res.status(400).json({ message: "Username or email required" });
        }
        if (!password.trim()) {
            return res.status(400).json({ message: "Password required" });
        }
        const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return res.status(400).json({ message: "Wrong password" });
        }
        const token = jwt.sign({ userid: user._id, role: user.role }, process.env.TOKEN_SECRET, { expiresIn: '1d' });
        const refresh = jwt.sign({ userid: user._id, role: user.role }, process.env.REFRESH_SECRET, { expiresIn: '30d' });
        if (rememberme) {
            res.cookie("runorefreshtoken", refresh, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        }
        delete user.password;
        res.cookie("runousertoken", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        res.status(200).json({ message: "User logged in", user: user });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const verifyLoggedinUser = async (req, res) => {
    try {
        const userid = req.user.userid;
        const user = await User.findById(userid).select("-password");
        if (!user) {
            return res.status(403).json({ message: "Access denied" });
        }
        res.status(200).json({ message: "Authenticated", user: user });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const userLogout = async (req, res) => {
    try {
        res.clearCookie("runousertoken");
        res.clearCookie("runorefreshtoken");
        res.status(200).json({ message: "User logged out" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const updateUserInfo = async (req, res) => {
    try {
        const userid = req.user.userid;
        const { firstname, lastname, email, phonecode, phonenumber, bio, shortdescription } = req.body;
        const updatedUser = await User.findByIdAndUpdate(userid, {
            firstname,
            lastname,
            email,
            phonecode,
            phonenumber,
            bio,
            shortdescription
        }, { new: true });
        res.status(200).json({ message: "User updated", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const updateProfilePicture = async (req, res) => {
    try {
        const profileimage = req.file;
        const userid = req.user.userid;
        const user = await User.findById(userid);
        if (user.profileimage) {
            const oldPath = path.join(__dirname, "../uploads/users", user.profileimage);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        const relativePath = path.relative(path.join(__dirname, "../uploads/users"), profileimage.path);
        const updatedUser = await User.findByIdAndUpdate(userid, {
            profileimage: relativePath
        }, { new: true });
        res.status(200).json({ message: "User updated", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const updateCoverImage = async (req, res) => {
    try {
        const coverImage = req.file;
        const userid = req.user.userid;
        const user = await User.findById(userid);
        if (user.coverimage) {
            const oldPath = path.join(__dirname, "../uploads/users", user.coverimage);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        const relativePath = path.relative(path.join(__dirname, "../uploads/users"), coverImage.path);
        const updatedUser = await User.findByIdAndUpdate(userid, {
            coverimage: relativePath
        }, { new: true });
        res.status(200).json({ message: "Cover image update", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const removeProfileImage = async (req, res) => {
    try {
        const userid = req.user.userid;
        const user = await User.findById(userid);
        const oldPath = path.join(__dirname, "../uploads/users", user.profileimage);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
        const updatedUser = await User.findByIdAndUpdate(userid, {
            profileimage: ""
        }, { new: true });
        res.status(200).json({ message: "Profileimage deleted", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const removeCoverImage = async (req, res) => {
    try {
        const userid = req.user.userid;
        const user = await User.findById(userid);
        const oldPath = path.join(__dirname, "../uploads/users", user.coverimage);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
        const updatedUser = await User.findByIdAndUpdate(userid, {
            coverimage: ""
        }, { new: true });
        res.status(200).json({ message: "Profileimage deleted", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


module.exports = { registerUser, loginUser, verifyLoggedinUser, userLogout, updateUserInfo, updateProfilePicture, updateCoverImage, removeProfileImage, removeCoverImage };