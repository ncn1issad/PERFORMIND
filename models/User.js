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
    teach: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Add these lines:
const User = mongoose.model('User', userSchema);
module.exports = User;