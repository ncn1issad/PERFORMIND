// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

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

        const token = crypto.randomBytes(32).toString('hex');
        user.verificationToken = token;
        user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        await emailService.sendVerificationEmail(user, token);

        return res.status(200).json({ success: true, message: 'Te rugăm să-ți verifici email-ul pentru a activa contul.' });

    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

router.get('/verify/:token', async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('verification-error', { message: 'Link-ul de verificare este invalid sau a expirat.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;

        await user.save();

        return res.render('verification-success');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

const recentResetRequests = new Map();

router.post('/reset-request', async (req, res, next) => {
    try {
        const email = req.body.email;

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

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

        await user.save();

        await new Promise(resolve => setTimeout(resolve, 1000));

        await emailService.sendPasswordResetEmail(user, token);

        res.status(200).json({ success: true, message: 'Email-ul pentru resetarea parolei a fost trimis.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/reset-password/:token', async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password, confirm } = req.body;

        if (password !== confirm) {
            return res.status(400).json({ error: 'Parolele nu se potrivesc.' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Link-ul de resetare este invalid sau a expirat.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Parola a fost resetată cu succes.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;