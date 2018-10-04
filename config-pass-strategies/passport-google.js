"use strict"
var passport = require('passport');
var User = require('../models/user-model');
var GoogleStrategy = require('passport-google-oauth20');
var cred = require('../lib/google');
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
  new GoogleStrategy({
      callbackURL:'/auth/google/redirect',
      clientID:cred.google.clientID,
      clientSecret:cred.google.clientSecret
    },
    function(accessToken,refreshToken,profile,done) {//get the token and the user profile
      User.findOne({googleId:profile.id}).then(function (currentUser) {
        logger.info('login with google')
        //console.log(profile)
        if(currentUser){
          done(null,currentUser)
        }else{
          new User({
            username: profile.displayName,
            googleId: profile.id,
            email:profile.emails[0].value,
            isVerified:true
          }).save().then(function (newUser) {
            //console.log(newUser)
            done(null, newUser)
          })
        }
      })

    })
)