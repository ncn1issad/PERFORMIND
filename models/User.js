const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures email addresses are unique
        lowercase: true, // Converts email to lowercase before saving
        trim: true
    },
    password: {
        type: String,
        required: true
        // Password hashing should be handled before saving
    },
    grade: {
        type: String,
        required: true
    },
    teach: {
        type: Boolean,
        default: false
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Add these lines:
const User = mongoose.model('User', userSchema);
module.exports = User;