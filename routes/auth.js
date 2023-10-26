// Authentication and authorization using Passport js 

var express = require('express');
var passport = require('passport');
var MagicLinkStrategy = require('passport-magic-link').Strategy;
// TODO: export a function that matches the sendGrid.send() method below
var email = require('../email-functions')
var db = require('../db');

passport.use(new MagicLinkStrategy({
  secret: 'keyboard cat',
  userFields: [ 'email' ],
  tokenField: 'token',
  verifyUserAfterToken: true
}, function send(user, token) {
  var link = 'http://localhost:3000/login/email/verify?token=' + token;
  var msg = {
    to: user.email,
    from: process.env['EMAIL'],
    subject: 'Sign in to Todos',
    text: 'Hello! Click the link below to finish signing in to Todos.\r\n\r\n' + link,
    html: '<h3>Hello!</h3><p>Click the link below to finish signing in to Todos.</p><p><a href="' + link + '">Sign in</a></p>',
  };
  return sendgrid.send(msg);
}, function verify(user) {
  return new Promise(function(resolve, reject) {
    db.get('SELECT * FROM users WHERE email = ?', [
      user.email
    ], function(err, row) {
      if (err) { return reject(err); }
      if (!row) {
        db.run('INSERT INTO users (email, email_verified) VALUES (?, ?)', [
          user.email,
          1
        ], function(err) {
          if (err) { return reject(err); }
          var id = this.lastID;
          var obj = {
            id: id,
            email: user.email
          };
          return resolve(obj);
        });
      } else {
        return resolve(row);
      }
    });
  });
}));




var router = express.Router();

router.get('/login', function(req, res, next) {
  res.render('login');
});

module.exports = router;