"use strict";
var express = require('express');
var router = express.Router();
var Opinion = require('../models/opinion');
var User = require('../models/user-model');
var logger = require('../lib/logger');
//mongoose = require('mongoose').set('debug', true); MONGOOSE DEBUGGING CAN BE USED LIKE THIS ANYWHERE YOU NEED IT
var flashMsg = require('express-flash');
router.use(flashMsg());



module.exports = {
  send: function (req,res,next) {
    Opinion.findOne({opinion:req.params.opinion},function (err,opinion) {
      var user = req.user
      if (opinion === null) {//if only the object named opinion exists, save one.findOne does not return an array as the find function does.
        opinion = new Opinion({
          text: req.body.opinion,
          _userId: req.user.id
        });

        opinion.save(function (err, success) {
          req.flash('info', 'Opinia dvs a fost trimisa.Va multumim frumos pentru timpul acordat.');
          var infoMessages = req.flash('info');
          return res.render('users/profile', {
            csrfToken: req.csrfToken(),
            infoMessages: infoMessages,
            hasInfo: infoMessages.length > 0
          });


        });
         logger.info('We saved the very first opinion in the db for this user: ', {userId: user.id},{method:req.method})
      } else {
        Opinion.findOne({_id:opinion._userId}, function (err, user) {
          //if (index < 1) return next();this helps to skip a index in a forEach loop
          user = req.user;
          if (opinion._userId.equals(user.id)) {//equals() function is the better way for comparing 2 id's in mongodb.
            //this is used only for the very first user to be compared and not store its opinion twice.
            //IF EVER U CONSIDER TO LET THE USER HAVE A SECOND OPINION STORE IN THE MODEL THE "expiresAt" option.
            req.flash('error', 'Opinia dvs a fost trimisa deja, ');
            var messages = req.flash('error');
            return res.render('users/profile', {
              csrfToken: req.csrfToken(),
              messages: messages,
              hasErrors: messages.length > 0
            });
            logger.info('The very first Opinion id and user id are equal so we refused it.', {userId: user.id},{method:req.method})

          }else{
            opinion = new Opinion({
              text: req.body.opinion,
              _userId: req.user.id
            });
            opinion.save(function (err, success) {
              if (err) {//remember that if everything fails u must write code to match the mongodb errors in order to retrieve a error.
                if (err.name === 'MongoError' && err.code === 11000) {//if opinion is a duplicate(you set unique:true in the model) return the error.nothing simpler but it took a week to figure it out.remember that.
                  // Duplicate username
                  req.flash('error', 'Opinia dvs a fost trimisa deja.');
                  //eveything here failed to be compared in order to see if the user tried to have a second opinion, but the error send by the mongodb server.
                  var messages = req.flash('error');
                  return res.render('users/profile', {
                    csrfToken: req.csrfToken(),
                    messages: messages,
                    hasErrors: messages.length > 0
                  });
                }
                //return res.status(500).send(err) --- with this code and the json viewer extension from chrome see the error fully display without crashing the browser
                req.flash('error', 'Opinia dvs a fost trimisa deja.');
                messages = req.flash('error');
                return res.render('users/profile', {
                  csrfToken: req.csrfToken(),
                  messages: messages,
                  hasErrors: messages.length > 0
                });
                logger.info('Opinion id and user id are equal so we refused the user', {userId: user.id},{method:req.method})

              }
              else {
                req.flash('info', 'Opinia dvs a fost trimisa.Va multumim frumos pentru timpul acordat.');
                var infoMessages = req.flash('info');
                logger.info('Saved another opinion for the user : ', {userId: user.id},{method:req.method})

                return res.render('users/profile', {
                  csrfToken: req.csrfToken(),
                  infoMessages: infoMessages,
                  hasInfo: infoMessages.length > 0
                });
              }
            });
          }


        })

      }

    })


  }



};