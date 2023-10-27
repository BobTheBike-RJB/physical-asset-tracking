// Authentication and authorization using Passport js 

var express = require('express');
var passport = require('passport');
var MagicLinkStrategy = require('passport-magic-link').Strategy;
// Emailing functions
const email = require('../email-functions.js');

var db = require('../db');

passport.use(new MagicLinkStrategy(
  {
    secret: 'keyboard cat',
    userFields: ['email'],
    tokenField: 'token',
    verifyUserAfterToken: true
  },
  function send(user, token) {
    var link = 'http://localhost:3000/login/email/verify?token=' + token;
    var msg = {
      to: user.email,
      from: process.env['EMAIL'],
      subject: 'MagicLink Login',
      text: 'Hello! Click the link below to finish signing in.\r\n\r\n' + link,
      html: '<h3>Hello!</h3><p>Click the link below to finish signing in.</p><p><a href="' + link + '">Sign in</a></p>',
    };
    return email.sendMail(msg);
  },
  function verify(user) {
    return new Promise(function (resolve, reject) {


      // Sequelize version of user check and/or creation (depends on "unique" property of email in user records)
      User.create({ email: authorization["full-token"]["email"] })
      .then(function (User) {
          console.log({
              "Message": "Created record.",
              "Record": User
          })
      })
      .catch(function (err) {
          if (err.name == 'SequelizeUniqueConstraintError') {
              console.log("User record already exists")
          }
          else {
              console.log(err)
          }
      });
      
      db.get('SELECT * FROM users WHERE email = ?', [
        user.email
      ], function (err, row) {
        if (err) { return reject(err); }
        if (!row) {
          db.run('INSERT INTO users (email, email_verified) VALUES (?, ?)', [
            user.email,
            1
          ], function (err) {
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

router.get('/login', function (req, res, next) {
  res.render('login');
});

module.exports = router;