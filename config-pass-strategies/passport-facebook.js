"use strict"
var passport = require('passport');
var User = require('../models/user-model');
var FacebookStrategy = require('passport-facebook');
var cred = require('../lib/facebook');
var logger = require('../lib/logger');

//take the user id and put it in the cookie
passport.serializeUser(function (user,done) {
  done(null, user.id)
});
//verify the id
passport.deserializeUser(function (id,done) {
  User.findById(id).then(function (user) {
    done(null, user)
  })
});

passport.use(
  new FacebookStrategy({
    callbackURL:'https://localhost:3000/auth/facebook/redirect',
    profileField:['id','displayName','emails'],
    clientID:cred.facebook.appID,
    clientSecret:cred.facebook.appSecret
  },function (accessToken, refreshToken, profile, done) {
    User.findOne({facebookId:profile.id}).then(function (currentUser) {

      logger.info('login with facebook')
      if (currentUser) {
        done(null, currentUser)
      } else {
        new User({
          username: profile.displayName,
          facebookId: profile.id,
          email: profile.emails,
          isVerified: true
        }).save().then(function (newUser) {
          console.log(newUser)
          done(null, newUser)
        })
      }
    })
  })
)