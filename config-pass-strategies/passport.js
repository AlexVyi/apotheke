"use strict"
var passport = require('passport');
var User = require('../models/user-model');
var LocalStrategy = require('passport-local').Strategy;//see pass docs if u forget
var crypto = require('crypto');//node build in package for generating tokens
var nodemailer = require('nodemailer');
var creds = require('../lib/nodemailer');
var Token = require('../models/token-model');
var logger = require('../lib/logger');



passport.serializeUser(function (user, done) {//tell pass how to store user in the session cookie
  done(null, user._id)
});

passport.deserializeUser(function (id, done) {//call user whenever u need it from the session cookie.
  User.findById(id, function (err,user) {
    done(err, user)
  })
});
//sign user up
passport.use('local.signup', new LocalStrategy({ //passport locals strategy.. u can use it with facebook, google etc...
  usernameField:'email', //it can be email or whatever one chooses
  passwordField:'password',
  confirmField:'password',
  passReqToCallback:true
},function (req,email, password, done) {
  req.checkBody('email','Invalid e-mail address...').notEmpty().isEmail().normalizeEmail();//validate email
  req.checkBody('password','Parola trebuie sa aibe minim 8 caractere').notEmpty().isLength({min:8});//validate pass
  logger.info('We are now in the sign up function.Watch the number of attempts', {method:req.method},{headers:req.headers})
  var errors = req.validationErrors();
  if(errors){
    var messages = [];
    errors.forEach(function (error) {
      messages.push(error.msg)
    });
    logger.info('Error on sign up' + messages, {method:req.method},{headers:req.headers})
    return done(null, false, req.flash('error', messages))
  }

  User.findOne({ email: req.body.email }, function (err, user) {

    // Make sure user doesn't already exist
    if (user) return done(null, false, {message:'The email address you have entered is already associated with another account.'});

    // Create and save the user
    user = new User();
    user.email = req.body.email;
    user.password = user.encryptPassword(req.body.password);//from user model, bcrypt method
    user.confirm = req.body.confirm;//from user model, bcrypt method
    if(req.body.password !== req.body.confirm) {
      return done(null, false, {message:'Password doesnt match.Please try again'});

    }
    user.save(function (err) {
      if (err) {
        logger.info('Error on sign up when saving the user' + err, {method:req.method},{headers:req.headers})
        return done(null, false, {message: err.message});
      }
      logger.info('We entered the user.save function and await to see if the token is also saved', {method:req.method},{headers:req.headers})

      // Create a verification token for this user
      var token = new Token({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

      // Save the verification token
      token.save(function (err) {
        if (err) {
          logger.info('Error on sign up when saving the token' + err, {method:req.method},{headers:req.headers})
          return done(null, false, {message: err.message});
        }

        // Send the email
        var transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {user: creds.user, pass: creds.pass}
        });
        var mailOptions = {
          from: 'no-reply@evvs.ro',
          to: user.email,
          subject: 'Account Verification Token',
          text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/users/confirmation\/' + token.token + '.\n'
        };
        transporter.sendMail(mailOptions, function (err) {
          if (err) {
            logger.info('Error on sign up when sending the confirmation token' + err, {method:req.method},{headers:req.headers})
            return done(null, false, {message: err.message});
          }
          if (!user.isVerified){
            req.isAuthenticated = false;
            logger.info('We saved and sent the token to the user and warned about the sent email', {method:req.method},{headers:req.headers})

            return done(null, false, {message:'Your email is not yet verified.An e-mail has been sent to ' + user.email + ' for validation.Please check your inbox'} )
          }
          //return done(null, user, {message:'An e-mail has been sent to ' + user.email + ' for validation'});
          //if instead of false, we would have used the line above(user, to be more specific), the user would have been allowed in and token sent for nothing
        });
      });


    });
  })
}));
//sign user in
passport.use('local.signin', new LocalStrategy({
  usernameField:'email',
  passwordField:'password',
  passReqToCallback:true
},function (req, email,password, done) {
  req.checkBody('email','Invalid e-mail address...').notEmpty().isEmail();
  req.checkBody('password','Invalid password...').notEmpty().isLength({min:8});

  var errors = req.validationErrors();
  if(errors){
    var messages = [];
    errors.forEach(function (error) {
      messages.push(error.msg)
    });
    logger.info('Error on sign in' + messages, {method:req.method},{headers:req.headers})
    return done(null, false, req.flash('error', messages))
  }


  User.findOne({'email': email},function (err,user) {
    if (err){
      logger.info('Error on sign in' + err, {method:req.method},{headers:req.headers})
      return done(err)
    }

    if(!user){//if user does not exist
      logger.info('No user found on sign in.Watch the number of attempts', {method:req.method},{headers:req.headers})
      return done(null, false, {message:'No user found...'} )//here done take null for no err, false for no user object TO BE RETRIEVED
      //and this is important NOT TO RETRIEVE THE USER and the  message to output
    }
    if(!user.validPassword(password)){//take method validPassword from user model.
      logger.info('INVALID PASS on sign in.Watch the number of attempts', {method:req.method},{headers:req.headers})
      return done(null, false, {message:'Wrong password ...'} )
    }
    if (!user.isVerified){//when this u cant even reset your password the err is: cant set header after they are sent
      logger.info('User did not verify the token', {method:req.method},{headers:req.headers})
      return done(null, false, {message:'Your email is not verified'} )
    }

    return done(null, user)



  })

}));
