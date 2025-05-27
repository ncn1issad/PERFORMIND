// controllers/userController.js
const User = require('../models/User');
const Token = require('../models/token');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService');

// Email verification function
exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const tokenDoc = await Token.findOne({
            token: token,
            type: 'verification'
        });

        if (!tokenDoc) {
            return res.render('verification-error', { message: 'Link-ul de verificare este invalid sau a expirat.' });
        }

        const user = await User.findById(tokenDoc.userId);
        if (!user) {
            return res.render('verification-error', { message: 'Utilizatorul nu a fost găsit.' });
        }

        user.isVerified = true;
        await user.save();

        // Delete the token after successful verification
        await Token.findByIdAndDelete(tokenDoc._id);

        if (req.session && req.session.user && req.session.user.id == tokenDoc.userId) {
            // Update the session to reflect verification
            req.session.user.isVerified = true;

            return req.session.save(err => {
                if (err) console.error('Error saving session:', err);
                // Render success page after session is updated
                res.render('verification-success');
            });
        } else {
            // If user isn't logged in or is a different user
            return res.render('verification-success');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// Password reset request function
exports.requestPasswordReset = async (req, res, next) => {
    try {
        const email = req.body.email;

        // Keep your rate limiting logic
        const lastRequestTime = recentResetRequests.get(email);
        const now = Date.now();
        if (lastRequestTime && (now - lastRequestTime < 10000)) {
            return res.status(200).json({
                success: true,
                message: 'Email-ul pentru resetarea parolei a fost trimis.'
            });
        }

        recentResetRequests.set(email, now);

        if (recentResetRequests.size > 100) {
            const tenMinutesAgo = now - 600000;
            for (const [key, timestamp] of recentResetRequests.entries()) {
                if (timestamp < tenMinutesAgo) {
                    recentResetRequests.delete(key);
                }
            }
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ error: 'Nu există utilizator cu acest email.' });
        }

        // Generate a token and store it in the Token collection
        const resetToken = crypto.randomBytes(32).toString('hex');

        await new Token({
            userId: user._id,
            token: resetToken,
            type: 'passwordReset'
        }).save();

        await new Promise(resolve => setTimeout(resolve, 1000));

        await emailService.sendPasswordResetEmail(user, resetToken);

        res.status(200).json({ success: true, message: 'Email-ul pentru resetarea parolei a fost trimis.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.resetPasswordForm = async (req, res, next) => {
    try {
        const { token } = req.params;
        console.log('Reset password form accessed with token:', token);
        console.log('Full URL:', req.originalUrl);

        // Verify token exists and is valid
        const tokenDoc = await Token.findOne({
            token: token,
            type: 'passwordReset'
        });

        if (!tokenDoc) {
            return res.render('reset-error', { message: 'Link-ul de resetare este invalid sau a expirat.' });
        }

        // Render the password reset form with the token
        return res.render('reset-password', { token });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password, confirm } = req.body;

        if (password !== confirm) {
            return res.status(400).json({ error: 'Parolele nu se potrivesc.' });
        }

        const tokenDoc = await Token.findOne({
            token: token,
            type: 'passwordReset'
        });

        if (!tokenDoc) {
            return res.status(400).json({ error: 'Link-ul de resetare este invalid sau a expirat.' });
        }

        const user = await User.findById(tokenDoc.userId);
        if (!user) {
            return res.status(400).json({ error: 'Utilizatorul nu a fost găsit.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Delete the token after successful reset
        await Token.findByIdAndDelete(tokenDoc._id);

        res.status(200).json({ success: true, message: 'Parola a fost resetată cu succes.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// Reusing the rate limiting map from your original code
const recentResetRequests = new Map();