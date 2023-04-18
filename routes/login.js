var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (req.session.user)
    res.redirect('/')
  res.render('login', { didLoginFail: false });
});

router.post('/', function(req, res, next) {
  if (req.session.user) {
    res.send('Already logged in!');
  }
  else {
    const username = req.body.username.trim();
    const password = req.body.password;

    if (username === process.env.ROOT_USER &&
        password === process.env.ROOT_PASS) {
      req.session.user = process.env.ROOT_USER;
      res.redirect('/');
    }
    else {
      res.render('login', { didLoginFail: true })
    }
  }
});

module.exports = router;
