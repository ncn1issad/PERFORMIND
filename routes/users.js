// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const Token = require('../models/token');
const userController = require('../controllers/userController');

// Keep all your existing routes
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
    res.redirect('/?showLogin=true');
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out');
        }
        res.redirect('/');
    });
});

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials. User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials. Password incorrect.' });
        }

        req.session.user = {
            id: user._id,
            email: user.email,
            fullname: user.fullname,
            teach: user.teach,
            grade: user.grade
        };

        req.session.save((err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to create session' });
            }
            return res.status(200).json({ success: true });
        });

    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

router.post('/update-grade', async (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({error: 'Nu sunteți autentificat.'});
    }

    const {grade} = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            req.session.user.id,
            {grade},
            {new: true}
        );

        if (!user) {
            return res.status(404).json({error: 'Utilizator inexistent.'});
        }

        req.session.user.grade = grade;
        return res.status(200).json({success: true});
    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// Modify signup to use the Token model
router.post('/signup', async (req, res, next) => {
    const { fullname, email, password, confirm, teach, grade } = req.body;

    if (password !== confirm) {
        return res.status(400).json({ error: 'Parolele nu se potrivesc.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'Există deja un utilizator cu acest email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            fullname,
            email,
            password: hashedPassword,
            teach: teach === 'on',
            grade,
            isVerified: false
        });

        await user.save();

        // Create verification token using the Token model
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await new Token({
            userId: user._id,
            token: verificationToken,
            type: 'verification'
        }).save();

        await emailService.sendVerificationEmail(user, verificationToken);

        return res.status(200).json({ success: true, message: 'Te rugăm să-ți verifici email-ul pentru a activa contul.' });

    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// Replace with controller functions for verification and password reset
router.get('/verify/:token', userController.verifyEmail);
router.post('/reset-request', userController.requestPasswordReset);
router.get('/reset-password/:token', userController.resetPasswordForm);
router.post('/reset-password/:token', userController.resetPassword);

module.exports = router;