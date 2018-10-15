"use strict"
var express = require('express');
var router = express.Router();
var Recaptcha = require('express-recaptcha').Recaptcha
var recaptcha = new Recaptcha('6LfazXMUAAAAAGg9Lk6aZOYNjsVEcYkARK9aSur1','6LfazXMUAAAAAKAgx19hPR8KXqnC1rBvFShnUjZS');//data key , secret key
var csrf = require('csurf');
var passport = require('passport');
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



//if succes got to profile
router.route('/profile').get( isLoggedIn, orders.getOrder);//made with route logic.we no longer store the logic here but importing it.beware of new syntax.

//change pass if you need it when logged in
router.route('/profile').post(isLoggedIn, changePass.isLogged);

//send opinion
router.route('/profile/sendOpinion').post(isLoggedIn, sendOpinion.send);

//delete account get
router.route('/delete-account').get(isLoggedIn,deleteAccount.getDelete)

//delete account post
router.route('/profile/:id').post(isLoggedIn, deleteAccount.postDelete)

router.route('/profile/:googleId').post(isLoggedIn, deleteAccount.postDeleteGoogleAccount)
//logout
router.get('/logout',isLoggedIn, function (req,res,next) {
    if(isLoggedIn) {
      req.logout()  //this logout is added by passport
      req.session.cart = null
      res.render('users/logout')
    }else {
      res.status(403).send('Forbidden')
    }
});


//PROTECT THE ABOVE ROUTES

router.use('/' ,notLoggedIn ,function (req,res,next) {  //here we group by middleware.if notLoggedIn go to whatever and if logged go above
    next()
});

//forgot password.
router.route('/forgot').get(notLoggedIn,forgotPass.getForgot);//made with route logic.we no longer store the logic here but importing it.beware of new sintax.

//forgot password.
router.route('/forgot').post(forgotPass.postForgot);

//reset password
router.route('/reset/:token').get(notLoggedIn,resetPass.getReset);

//reset password not made with passport.only the passwords are encrypted with bcrypt.see user model for this.
router.route('/reset/:token').post(resetPass.postReset);

//confirm user before let him login
router.route('/confirmation/:token').get(confirmUser.getConfirmation);

//confirm user before let him login
router.route('/confirmation/:token').post(confirmUser.postConfirmation);

//sign up
router.get('/signup',recaptcha.middleware.render, function (req,res,next) {
    var messages = req.flash('error');
    res.render('users/signup',{csrfToken: req.csrfToken(), messages:messages, hasErrors:messages.length > 0, captcha : req.recaptcha});

});

//submit sign up form and give google a buzz also, to see if checks out, than use passport
router.post('/signup',recaptcha.middleware.verify, captchaVerification, passport.authenticate('local.signup',{
    successRedirect:'/users/signup',
    failureRedirect:'/users/signup',
    failureFlash:true
}));


//verify the recapcha.see express-recapcha docs for more if don't remember.
function captchaVerification(req, res, next) {
    if (req.recaptcha.error) {
        req.flash('error','reCAPTCHA Incorrect');
        res.redirect('/users/signup');
    } else {
        return next();// all custom middleware must let the request continue so next is a must.
    }
}


//get sign in page, get csurf token and render it
router.get('/signin', function (req,res,next) {
	var infoMessages = req.flash('info');
	var messages = req.flash('error');
	res.render('users/signin',{csrfToken: req.csrfToken(), messages:messages, infoMessages:infoMessages, hasErrors:messages.length > 0, hasInfo:infoMessages.length>0});

});

//submit sign in form
router.post('/signin', passport.authenticate('local.signin',{
    successRedirect:'/users/profile',
    failureRedirect:'/users/signin',
    failureFlash:true
}));

router.get('/error',function (req,res,next) {
    res.render('error')
});


module.exports = router;

function isLoggedIn(req,res,next) {// use this in whatever routes you will have after sign in to protect them
    if(req.isAuthenticated()){
        return next()
    }else{
      res.status(401).send('Unauthorized')
    }
}
function notLoggedIn(req,res,next) {
    if(!req.isAuthenticated()){
        return next()
    }else{
        res.redirect('/')
    }
}
