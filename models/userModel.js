const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    username: { type: String },
    email: { type: String },
    phonecode: { type: String, default: "" },
    phonenumber: { type: String, default: "" },
    password: { type: String },
    profileimage: { type: String, default: "" },
    coverimage: { type: String, default: "" },
    bio: { type: String, default: "" },
    shortdescription: { type: String, default: "" },
    gender: { type: String, enum: ["male", 'female'] },
    posts: [ { type: mongoose.Schema.Types.ObjectId, ref: 'articles' } ],
    role: { type: String, enum: ['admin', 'user'], default: "user" }
}, { timestamps: true });

const User = mongoose.model("users", userSchema);
module.exports = User;