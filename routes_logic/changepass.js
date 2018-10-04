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
require('../config-pass-strategies/passport');
var csrfPortection = csrf();
router.use(csrfPortection);
router.use(flashMsg());



module.exports = {
  isLogged: function (req,res,next) {
    async.waterfall([
      function(done) {

        User.findOne({ user:req.params.user}, function(err,user, password) {//this is how you find the first object from a collection
          logger.info('We found a user who wants to change his password from inside the account', {userId:user.id},{method:req.method},{headers:req.headers} );
        	user = req.user//this is how you retrieve the actual user who is using the session now
          user.password = user.encryptPassword(req.body.password);//from user model, bcrypt method
          user.confirm = user.validPassword(req.body.confirm);//from user model, bcrypt method

          if(req.body.password !== req.body.confirm) {

            req.flash('error', 'Parolele nu se potrivesc.Incercati din nou.');
            var messages = req.flash('error');
            logger.info('We found a user who wants to change his password from inside the account but the password doesn\'t match',
              {displayErrors:messages},{userId:user.id},{method:req.method}
            );
            return res.render('users/profile',{csrfToken: req.csrfToken(),
              messages:messages,
              hasError:messages.length>0})//here you have hasError instead of hasErrors due to the front end.if hasErrors the view changes for the send_opinion route also

          }
          user.save(function (err) {//passport method of storing the user.see config-pass-strategies
            if (err) {
              logger.info('Error when trying to save the new password from change_pass'+ err)
              return next(err)
            }
            logger.info('We found a user who wants to change his password from inside the account and succeeded'
              ,{userId:user.id},{method:req.method}
            );
            return done(null, user)
          });

        });
      },
      function(user, done) {
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
          		to: user.email,
          		from: 'password-reset@evvs.ro',
          		subject: 'Your password has been changed',
          		text: 'Hello,\n\n' +
          		'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
               req.logout();
               req.flash('info', 'Parola schimbata cu succes! Te rugam sa intri din nou in cont.');
          		 var infoMessages = req.flash('info');
          		 res.render('users/profile',{csrfToken: req.csrfToken(),
                 infoMessages:infoMessages,
                 hasInfos:infoMessages.length>0
          		 });
               logger.info('We found a user who wants to change his password from inside the account and the success mail was sent',
                  {displayMessage:infoMessages},{userId:user.id},{method:req.method}
               );
          		 done(err)
        });
      }

    ], function(err) {
           if(err) {
             logger.info(err)
             var errMsg = req.flash('error',err.message)[0]; //render in error view the first element
             res.render('error',{errMsg:errMsg})
           }
         });

  }
};