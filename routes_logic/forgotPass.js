"use strict";
var express = require('express');
var router = express.Router();
var mongoose =require('mongoose');
var csrf = require('csurf');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var User = require('../models/user-model');
var flashMsg = require('express-flash');
var creds = require('../lib/nodemailer');
var csrfPortection = csrf();
var logger = require('../lib/logger');
router.use(csrfPortection);
router.use(flashMsg());
require('../config-pass-strategies/passport');




module.exports = {

	  getForgot : function(req, res, next) {
		  var messages = req.flash('error');
		  var infoMessages = req.flash('info');
      logger.info('Forgot pass page rendered',
        {method:req.method},
				{headers:req.headers},
        {displayMessage:infoMessages},
        {displayMessage:messages}
      );
		  res.render('users/forgotpass',{csrfToken: req.csrfToken(),messages:messages, infoMessages:infoMessages, hasErrors:messages.length > 0, hasInfo:infoMessages.length>0})
	  },

	  postForgot : function(req, res, next) {
		  async.waterfall([
			  function(done) {//create a toke using crypto a built in node package.just need to require it not install from npm.
				  crypto.randomBytes(20, function(err, buf) {
					  var token = buf.toString('hex');
					  done(err, token);
				  });
			  },
			  function(token, done) {
				  User.findOne({ email: req.body.email }, function(err, user) {//User is from Schema and findOne is a query function from mongodb
					  if (!user) {
						  req.flash('error', 'No account with that email address exists.');
						  logger.info('No account with the provided email exists',
								{method:req.method},
								{headers:req.headers}
							);
						  return res.redirect('/users/forgot');
					  }

					  user.resetPasswordToken = token;//asign token to user.not required in Schema because is optional.
					  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour + date is assigned to token.

					  user.save(function(err) {//save user again with token.does not create a duplicate in db of course.
              logger.info('User with required token saved to db',
                {userId:user.id},
                {method:req.method},
                {headers:req.headers}
              );
              done(err, token, user);
					  });
				  });
			  },
			  function(token, user, done) {
				  var smtpTransport = nodemailer.createTransport({
					  host: 'smtp.sendgrid.net',
					  port:587,
					  secure:false,
					  auth: {
						  user: creds.user,
						  pass: creds.pass
					  }
				  });
				  var mailOptions = {
					  from: 'password-reset@evvs.ro',
					  to: user.email,
					  subject: ' Password Reset',
					  text: 'You are receiving this because you (or someone else) have requested the forgotpassword of the password for your account.\n\n' +
					  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					  'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
					  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				  };
				  smtpTransport.sendMail(mailOptions, function(err) {
					  req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');

            logger.info('Successfully sent the email with token for resetting the password',
              {userId:user.id},
              {method:req.method},
              {headers:req.headers}
            );
					  done(err, 'done');
				  });
			  }
		  ], function(err) {
			  if (err){
			  	logger.info('Something went wrong after the async on forgot pass' + err)
			  	return next(err)
			  };
			  res.redirect('/users/forgot');
		  });
	  }

};