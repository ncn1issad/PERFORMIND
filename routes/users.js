const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs');   // Import bcryptjs

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
            teach: user.teach
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
    const { fullname, email, password, confirm, teach } = req.body;

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
            teach: teach === 'on' // HTML checkbox sends 'on' if checked
        });

        await user.save();

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error(err.message);
        // Pass error to the error handler
        next(err);
    }
});

// You would also add your login routes here, e.g., GET /users/login and POST /users/login

module.exports = router;