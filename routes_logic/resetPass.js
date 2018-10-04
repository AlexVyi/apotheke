"use strict";
var express = require('express');
var router = express.Router();
var mongoose =require('mongoose');
var csrf = require('csurf');
var async = require('async');
var nodemailer = require('nodemailer');
var User = require('../models/user-model');
var flashMsg = require('express-flash');
var creds = require('../lib/nodemailer');
var logger = require('../lib/logger');
var csrfPortection = csrf();
router.use(csrfPortection);
router.use(flashMsg());
require('../config-pass-strategies/passport');


module.exports = {
	getReset : function(req, res,next) {//get inseamna inclusiv pull from database not just render a view you stupid dog.
		var infoMessages = req.flash('info');
		var messages = req.flash('error');
		User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
			if (!user) {
				req.flash('error', 'Token is invalid or has expired.');
        logger.info('No token or expired',
          {method:req.method},
          {headers:req.headers}
        );
				return res.redirect('/forgot');
			}
      logger.info('Reset pass page rendered',
        {method:req.method},
        {headers:req.headers},
        {displayMessage:infoMessages},
        {displayMessage:messages}
      );
			//if token is ok render the page with new pass and new check pass
			res.render('users/resetpass',{csrfToken: req.csrfToken(),messages:messages,infoMessages:infoMessages, hasErrors:messages.length > 0, hasInfo:infoMessages.length>0});
		});
	},

	postReset: function(req, res, next) {
		async.waterfall([
			function(done) {
				User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
					if (!user) {
						req.flash('error', 'Password reset token is invalid or has expired.');
            logger.info('No token or expired in the postResetPass function',
              {method:req.method},
              {headers:req.headers}
            );
						return res.redirect('/users/forgot');
					}
					user.password = user.encryptPassword(req.body.password);//from user model, bcrypt method
					user.confirm = user.validPassword(req.body.confirm);//from user model, bcrypt
					if(req.body.password.length < 8){
            req.flash('error', 'Parola trebuie sa contina minim 8 caractere.Incercati din nou.');
            logger.info('Error = password.length < 8 in the postResetPass function',
              {method:req.method},
              {headers:req.headers}
            );
            return res.redirect('/users/forgot');
					}
					if(req.body.password !== req.body.confirm) {
						req.flash('error', 'Parolele nu se potrivesc.Incercati din nou.');
            logger.info('We found a user who forgot his password,reached the reset page but the password doesn\'t match',
             {userId:user.id},{method:req.method}
            );
						return res.redirect('/users/forgot');
					}
					user.resetPasswordToken = undefined;//reset token
					user.resetPasswordExpires = undefined;//reset token date

					user.save(function(err) {//passport method of storing the user.see config-pass-strategies
						if(err){
							logger.info('Error when trying to save the user\'s reset pass' + err)
							return next(err)
						}
            logger.info('Successfully saved the reset pass',
              {userId:user.id},
              {method:req.method},
              {headers:req.headers}
            );
						return done(null, user)
					});
				});
			},
			function(user, done) {
				var smtpTransport = nodemailer.createTransport({
					host: 'smtp.sendgrid.net',
					port: 587,
					secure: false,
					auth: {
						user: creds.user,
						pass: creds.pass
					}
				});
				var mailOptions = {
					to: user.email,
					from: 'password-reset@evvs.ro',
					subject: 'Your password has been changed',
					text: 'Hello,\n\n' +
					'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					req.flash('info', 'Success! Your password has been changed.');
          logger.info('Successfully sent the email with the info of the reset password',
            {userId:user.id},
            {method:req.method},
            {headers:req.headers}
          );
          res.redirect('/users/signin');
					done(err);
				});
			}
		], function(err) {
			if(err) {

				var errMsg = req.flash('error',err.message)[0]; //render in error view the first element
        logger.info('Something went wrong after the async on reset pass' + err, errMsg)
				res.render('error',{errMsg:errMsg})
			}
		});
	}
};