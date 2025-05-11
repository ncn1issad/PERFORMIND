var express = require('express');
var router = express.Router();

const { isAuthenticated } = require('../middleware/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Log session on homepage load for verification
  console.log('Current session user:', req.session.user || 'Not logged in');

  res.render('index', {
    title: 'Express',
    user: req.session.user || null
  });
});

router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.session.user });
});

module.exports = router;
