"use strict";
var express = require('express');
var router = express.Router();
var mongoose =require('mongoose');
var csrf = require('csurf');
var Token = require('../models/token-model');
var User = require('../models/user-model');
var flashMsg = require('express-flash');
var logger = require('../lib/logger');
var csrfPortection = csrf();
router.use(csrfPortection);
router.use(flashMsg());
require('../config-pass-strategies/passport');

module.exports = {

  getConfirmation:function (req,res,next) {//here done was blocking everything and the same for the post.be careful in the future.only do done in a callback or something
    var infoMessages = req.flash('info');
    var messages = req.flash('error');
    logger.info('The confirmation page for creating an account is displayed',
      {method:req.method},
      {headers:req.headers}
    );
    res.render('users/confirm',{csrfToken: req.csrfToken(), messages:messages, infoMessages:infoMessages, hasErrors:messages.length > 0, hasInfo:infoMessages.length > 0});
  },

  postConfirmation : function (req, res,next) {

    // Find a matching token
    Token.findOne({ token: req.params.token   }, function (err, token) {
      // Find a matching token
      if (!token) {
        req.flash('error','We were unable to find a valid token. Your token my have expired.');
        logger.info('There was no token or not a valid one.',
          {method:req.method},
          {headers:req.headers}
        );
        return res.redirect('/users/signup')

      }
      // If we found a token, find a matching user
      User.findOne({ _id: token._userId }, function (err, user) {

        if (!user) {
          req.flash('error','We were unable to find a user for this token.Please sign up');
          logger.info('There was no valid user for the token.',
            {method:req.method},
            {headers:req.headers}
          );
          return res.redirect('/users/signup')
        }

        if (user.isVerified) {
          req.flash('info', 'This user has already been verified.Please sign in.')
          logger.info('The token for the user has already been verified .',
            {method:req.method},
            {headers:req.headers}
          );
          return res.redirect('/users/signin')
        }
        // Verify and save the user
        user.isVerified = true;
        user.save(function (err) {
        	if(err){
            logger.info('Error when trying to confirm and save the new user\'s account' + err)
        		return next(err)
					}
          req.flash('info', "The account has been verified. Please log in.");
          logger.info('The new account was successfully created .',
            {method:req.method},
            {body:req.body},
            {headers:req.headers}
          );
          res.redirect('/users/signin')
        });
      });
    });
  }
};