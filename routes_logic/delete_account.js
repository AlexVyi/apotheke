"use strict";
var express = require('express');
var router = express.Router();
var mongoose =require('mongoose');
var csrf = require('csurf');
var nodemailer = require('nodemailer');
var User = require('../models/user-model');
var flashMsg = require('express-flash');
var creds = require('../lib/nodemailer');
var csrfPortection = csrf();
var logger = require('../lib/logger');
router.use(csrfPortection);
router.use(flashMsg());
require('../config-pass-strategies/passport');
require('../config-pass-strategies/passport-google');//make use of passport configuration


module.exports = {

  getDelete: function(req,res,next){

    var infoMsg = req.flash("success")[0];
    logger.info('Delete account page rendered',
      {method:req.method},
      {displayMessage:infoMsg}
    );
    res.render('users/delete-account',{infoMsg:infoMsg})

  },
  postDelete: function (req,res,next) {

    User.findOneAndRemove({_id: req.params.id}, function (err, user, password) {
        user = req.user
        user.password = user.validPassword(req.body.password)
        if (err) {
          logger.info('Error when trying to delete the account made with email '+ err, {userId:user.id})
          return next('route')
        }
        req.flash("success", "Contul dumneavoastra a fost sters cu success!");
        req.logout();
      logger.info('We found a user who successfully deleted the account made with email',
        {userId:user.id},
        {method:req.method},
        {headers:req.headers}
      );
        return res.render('users/delete-account');
    })

  },
  postDeleteGoogleAccount:function (req,res,next) {
    //eval(require('locus'))
    User.findOneAndRemove({googleId: req.params.googleId}, function (err, user) {
      user = req.user
      if (err) {
        logger.info('Error when trying to delete the account made with GOOGLE '+ err, {userId:user.id})
        return next('route')
      }
      req.flash("success", "Contul dumneavoastra a fost sters cu success!");
      req.logout();
      logger.info('We found a user who successfully deleted the account made with GOOGLE',
        {userId:user.id},
        {method:req.method},
        {body:req.body},
        {headers:req.headers}
      );
      return res.render('users/delete-account');
    })

  },
  postDeleteFacebookAccount:function (req,res,next) {
    //eval(require('locus'))
    User.findOneAndRemove({facebookId: req.params.facebookId}, function (err, user) {
      user = req.user
      if (err) {
        logger.info('Error when trying to delete the account made with FACEBOOK '+ err, {userId:user.id})
        return next('route')
      }
      req.flash("success", "Contul dumneavoastra a fost sters cu success!");
      req.logout();
      logger.info('We found a user who successfully deleted the account made with FACEBOOK',
        {userId:user.id},
        {method:req.method},
        {body:req.body},
        {headers:req.headers}
      );
      return res.render('users/delete-account');
    })

  }
};