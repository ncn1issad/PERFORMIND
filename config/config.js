require('dotenv').config();

module.exports = {
    // Email configuration
    email: process.env.EMAIL_ADDRESS || 'your-app-email@gmail.com',
    emailPassword: process.env.EMAIL_PASSWORD || '',

    // Application URL for email links
    appUrl: process.env.APP_URL || 'http://localhost:3000',

    // Database configuration (optional)
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/PERFORMIND',

    // Server configuration (optional)
    port: process.env.PORT || 3000
};