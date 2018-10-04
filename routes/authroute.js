'use strict'
var express = require('express');
var router = express.Router();
var passport = require('passport');
var csrf = require('csurf');
var forgotPass = require('../routes_logic/forgotPass');
var resetPass = require('../routes_logic/resetPass');
var changePass = require('../routes_logic/changepass');
var deleteAccount = require('../routes_logic/delete_account');
var sendOpinion = require('../routes_logic/sendopinion');
var confirmUser = require('../routes_logic/confirm_user');
var orders = require('../routes_logic/orders');
var flashMsg = require('express-flash');
var csrfPortection = csrf();
router.use(csrfPortection);
router.use(flashMsg());
require('../config-pass-strategies/passport-google');//make use of passport configuration
require('../config-pass-strategies/passport-facebook');//make use of passport configuration


// Ask google for a profile
router.get('/google',passport.authenticate('google',{
  scope: ['email','profile']

}));
/* Here you get the redirect route which you
Set up in dev tools and exchanged the info with google.*/
router.get('/google/redirect',notLoggedIn,passport.authenticate('google'),function (req,res,next) {
      res.redirect('/users/profile');
});

// Ask facebook for a profile
router.get('/facebook',passport.authenticate('facebook',{
  scope: 'email'
}));

router.get('/facebook/redirect',notLoggedIn,passport.authenticate('facebook'),function (req,res,next) {
  res.redirect('/users/profile');
});



module.exports = router;

function isLoggedIn(req,res,next) {// Use this in whatever routes you will have after sign in to protect them
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/');
  }
}
function notLoggedIn(req,res,next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}