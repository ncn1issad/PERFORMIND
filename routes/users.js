const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs');   // Import bcryptjs
const crypto = require('crypto');
const emailService = require('../utils/emailService');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource'); // This is the default, you might change or remove it
});

router.get('/login', function(req, res, next) {
    // For now, let's assume the login modal is part of the homepage or another main page.
    // If you have a dedicated login page (e.g., 'login.ejs'), render that.
    // Otherwise, you might redirect to the homepage where the modal can be triggered.
    // res.render('login'); // if you have a views/login.ejs
    // Or, if the modal is on the index page:
    res.redirect('/?showLogin=true'); // Or however you trigger the modal on the client-side
    // For a simpler approach for now, just send a placeholder:
    // res.send('Login page placeholder. You would typically render a view with the login modal here.');
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out');
        }
        res.redirect('/');
    });
});

// POST login form
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // User not found
            return res.status(400).json({ error: 'Invalid credentials. User not found.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Password does not match
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
        next(err); // Pass error to the error handler
    }
});

// POST signup form
router.post('/signup', async (req, res, next) => {
    const { fullname, email, password, confirm, teach, grade } = req.body;

    // Check if passwords match
    if (password !== confirm) {
        // You should ideally send this error back to the form or render a page with an error
        return res.status(400).json({ error: 'Parolele nu se potrivesc.' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            // User already exists
            return res.status(400).json({ error: 'Există deja un utilizator cu acest email.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            fullname,
            email,
            password: hashedPassword,
            teach: teach === 'on', // HTML checkbox sends 'on' if checked\
            grade
        });

        await user.save();

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error(err.message);
        // Pass error to the error handler
        next(err);
    }
});

// POST update grade form
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

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user with verification
        user = new User({
            fullname,
            email,
            password: hashedPassword,
            teach: teach === 'on',
            grade,
            isVerified: false
        });

        // Generate verification token
        const token = crypto.randomBytes(32).toString('hex');
        user.verificationToken = token;
        user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        await user.save();

        // Send verification email
        await emailService.sendVerificationEmail(user, token);

        return res.status(200).json({ success: true, message: 'Te rugăm să-ți verifici email-ul pentru a activa contul.' });

    } catch (err) {
        console.error(err.message);
        next(err);
    }
});

// Verify email route
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

// Request password reset
router.post('/reset-request', async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Nu există utilizator cu acest email.' });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save();

        // Send password reset email
        await emailService.sendPasswordResetEmail(user, token);

        res.status(200).json({ success: true, message: 'Email-ul pentru resetarea parolei a fost trimis.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Reset password with token
router.get('/reset-password/:token', async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetToken: token,
            resetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('reset-error', { message: 'Link-ul de resetare este invalid sau a expirat.' });
        }

        // Render reset password form
        res.render('reset-password', { token });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// Submit new password
router.post('/reset-password/:token', async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password, confirm } = req.body;

        if (password !== confirm) {
            return res.status(400).json({ error: 'Parolele nu se potrivesc.' });
        }

        const user = await User.findOne({
            resetToken: token,
            resetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Link-ul de resetare este invalid sau a expirat.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetToken = undefined;
        user.resetExpires = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Parola a fost resetată cu succes.' });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// You would also add your login routes here, e.g., GET /users/login and POST /users/login

module.exports = router;