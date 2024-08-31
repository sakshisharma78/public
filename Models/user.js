
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bio: { type: String },
    password: {
        type: String,
        required: true,
        minlength: 6 // You might want to enforce a minimum length for passwords
    },
    contact: { type: String },
    email: { type: String, required: true, unique: true },
    github: { type: String },
    linkedin: { type: String },
    website: { type: String },
    profileImage: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

