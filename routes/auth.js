// Authentication and authorization using Passport js 

var express = require('express');
var passport = require('passport');
var MagicLinkStrategy = require('passport-magic-link').Strategy;
var sendgrid = require('@sendgrid/mail');
var db = require('../db');





var router = express.Router();

router.get('/login', function(req, res, next) {
  res.render('login');
});

module.exports = router;