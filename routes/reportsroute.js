"use strict";
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var debug = require('debug')('ReportService');
var helmet = require('helmet');
var logger = require('../lib/logger');
var csp = require('../lib/helmet');//only the csp module from helmet is configure in a diff file
var app = express()


router.use(function(req, res, next) {
  //Some browsers (Chrome at least) doesn't set the content type for HPKP
  //Reports which causing the body parser to ignore the content, so add the content type.
  if(typeof(req.headers['content-type']) === 'undefined'){
    req.headers['content-type'] = "application/json; charset=UTF-8";
  }
  next();
})


router.get('/cookie-policy', function (req, res,next) {
  res.render('cookie-policy')
});

router.get('/privacy-policy', function (req, res,next) {
  res.render('privacy-policy')
});

router.get('/terms', function (req, res,next) {
  res.render('terms&conditions')
});
router.get('/contact', function (req, res,next) {
  res.render('contact')
});



router.post('/csp-report.json', function (req, res,next) {
  logger.error('Warning Report for CSP:' + '{"Headers":' + JSON.stringify(req.headers) + ',"Body":' + JSON.stringify(req.body) + "}");
});

//helmet reports about the headers violations
router.post('/report-violation', function (req, res) {
  if (req.body) {
    console.log('CSP Violation: ', req.body)
  } else {
    console.log('CSP Violation: No data received!')
  }

  res.status(204).end()
})



module.exports = router;