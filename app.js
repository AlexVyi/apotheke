'use strict';
var express = require('express');// always check the order in which you require the packages
var path = require('path');
var helmet = require('helmet');
var favicon = require('serve-favicon');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var mongoose = require('mongoose');// .set('debug', true);//DEBUG FUNCTION FOR MONGOOSEE
var expressHbs = require('express-handlebars');
var hbsHelpers = expressHbs.create({// extra helpers to be inserted if needed.
  helpers: require('./helpersHbs/handlebars.js').helpers,
  defaultLayout: 'layout',
  extname: '.hbs',
});
var session = require('express-session');
var passport = require('passport');
var flashMsg = require('express-flash');
var validator = require('express-validator');
var MongoStoreSession = require('connect-mongo')(session);
var reports_route = require('./routes/reportsroute');
var auth_route = require('./routes/authroute');
var main_route = require('./routes/mainroute');
var users_route = require('./routes/userroute');
var credMdb = require('./lib/mongodb');
var credSession = require('./lib/sessionsecretandkey');
var escapeCss = require('cssesc');
var memWatch = require('memwatch-next');
var limiter = require('express-rate-limit');// limit the connections to server with redis and express-limiter
var logger = require('./lib/logger');
var csp = require('./lib/helmet');// only the csp module from helmet is configure in a diff file
var nonceString = require('uuid/v4');// unique string for csp
var app = express();

app.all('*', function (req, res, next) {

  logger.debug('All incoming request verbose', {
    "headers": req.headers,
    "query": req.query,
    "body": req.body,
  });
  return next();

});

/*
 *first on security use helmet for headers and always execute it first of all
 *content security not enabled by default in helmet
 */
app.use(helmet.dnsPrefetchControl({allow: true, }));
app.use(helmet.frameguard({action: 'sameorigin', }));
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts({maxAge: 5184000,
}));
app.use(helmet.hpkp({
  "maxAge": 7776000, // 90 days
  "sha256s": ['AbCdEf123=',
'ZyXwVu456=',],// must retrieve my own
}));
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({policy: 'same-origin', }));
// Sets "X-XSS-Protection: 1; mode=block".DON'T ALLOW MALICIOUS SITES TO INTERFERE
app.use(helmet.xssFilter());

// enable the nonce to equal a random string generator to be used along side the csp module.see helmet js to see how  the csp header is set
app.use((req, res, next) => {
 res.locals.nonce = nonceString()
 var nonce = "'nonce-" + res.locals.nonce + "'"
 next()
});

/*
 *use csp + nonce + handlebars in the view
 *app.use(csp); //ENABLE IT FROM HELMET.JS IN THE lib folder
 */


/*
 *enable limiter in production by uncomment the line bellow
 *app.enable('trust proxy');
 */

// watch for memory leaks.don't forget about the NODE HEAP-DUMP PACKAGE
memWatch.on('leak', (info) => {
  var keys = Object.keys(info)//best way to return the object properties.not the value.
  for(keys in info){
    logger.error('Memory leak detected:\n' +  keys + ":" + Object.values(info))
  }
});
memWatch.on('stats', (stats) => {//being an object it must be reconstructed from 2 arrays
  var keys = Object.keys(stats)//best way to return the object properties(not the value) as an array.
  var keyValues = Object.values(stats)//return the value also

  var num_full_gc = keys.indexOf('num_full_gc');
  var num_inc_gc = keys.indexOf('num_inc_gc');
  var heap_compactions = keys.indexOf('heap_compactions');
  var usage_trend = keys.indexOf('usage_trend');
  var estimated_base = keys.indexOf('estimated_base');
  var current_base = keys.indexOf('current_base');
  var min = keys.indexOf('min');
  var max = keys.indexOf('max');


  //logger.info('MemWatch message: ' + ( 'num_full_gc' + ":" + keyValues[num_full_gc]) + " ; " + ( 'num_inc_gc' + ":" + keyValues[num_inc_gc]) + " ; " + ( 'heap_compactions' + ":" + keyValues[heap_compactions]) + " ; " + ( 'usage_trend' + ":" + keyValues[usage_trend]) + " ; " + ( 'estimated_base' + ":" + keyValues[estimated_base]) + " ; " + ( 'current_base' + ":" + keyValues[current_base]) + " ; " + ( 'min' + ":" + keyValues[min]) + " ; " + ( 'max' + ":" + keyValues[max]))
});


// escape css MUST LOOK IF IT WORKS
escapeCss.options.escapeEverything = true;
escapeCss('../../../style.css');// noy sure if it works yet

// connect to db
if (app.get('env') === 'development') {

  mongoose.connect(credMdb.mongoDb_DEV.dbURI, {useNewUrlParser: true, }, (err) => {
    //console.log('connected to apotheke on vps1')
    if (err) throw  err;
  }, {"useMongoClient": true,});

}
if (app.get('env') === 'production') {

  mongoose.connect(credMdb.mongoDb_PRODUCTION.dbURI, (err) => {
    //console.log('connected to apotheke on ATLAS')
    if (err) throw  err;
  }, {"useMongoClient": true,});

}
if (app.get('env') === 'test') {

  mongoose.connect(credMdb.mongoDb_TEST.dbURI, (err) => {
    //console.log('connected to test on vps1')
    if (err) throw  err;
  }, {"useMongoClient": true,});

}


require('./config-pass-strategies/passport');// make use of passport configuration
require('./config-pass-strategies/passport-google');// make use of passport configuration

// View engine setup
app.engine('.hbs', expressHbs({"defaultLayout": 'layout',
extname: '.hbs',}));
app.engine('.hbs', hbsHelpers.engine);
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({extended: false, }));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/csp-report', }));
app.use(validator());
/*
 *app.use(cookieParser());
 *app.set('trust proxy', 1) // trust first proxy/use this only in production
 */
app.use(session({
  secret: credSession.session.cookieSecret,
  key: credSession.session.cookieKey,
  // proxy: true  -- only in production
  resave: false,
  saveUninitialized: false,
  store: new MongoStoreSession({"mongooseConnection": mongoose.connection,}), // use existing mongoose connection for user session and make sure no other is opened
  cookie: {
    httpOnly: false, // true in production
    // secure: true, MUST BE SET AFTER SSL
    // domain: 'store.evvs.ro', MUST BE SET WHEN GO LIVE
    // sameSite: true //MUST BE SET WHEN GO LIVE
    // path: '/', /only in production
    maxAge: 60 * 60 * 1000,
  },// set cookie to 60 min then x 60sec x 1000 because it expects milliseconds
}));
app.use(flashMsg());

// initialize session cookie with passport
app.use(passport.initialize());
app.use(passport.session());

// use sass, jquery and bootstrap all over
app.use(sassMiddleware({
  "src": path.join(__dirname, 'public'),
  "dest": path.join(__dirname, 'public'),
  "indentedSyntax": true, // True = .sass and false = .scss
  "sourceMap": true,
}));
app.use(favicon(path.join(`${__dirname  }/public/favicon/favicon.ico`)));
app.use(express.static(`${__dirname  }/node_modules/jquery/dist`));
app.use(express.static(`${__dirname  }/node_modules/bootstrap/dist`));
app.use(express.static(path.join(__dirname, 'public')));


// makes login and session available in all views
app.use((req,res,next) => {
  res.locals.login = req.isAuthenticated();//this makes the login variable available in all views in order to differentiate login views from the rest
  res.locals.session = req.session;//make the session variable available in all views
  if(req.user){//if we have a user make available only the id

    req.session.user = req.user.id
    req.session.userG = req.user.googleId
    req.session.userFb = req.user.facebookId
  }
  next()//let the req continue
});

// Limit each IP to 100 requests
var limit = new limiter({
  "windowMs": 5 * 60 * 1000, // 5 minutes
  "max": 100, // Limit each IP to 100 requests per windowMs
  "delayMs": 0, // Disable delaying - full speed until the max limit is reached
  "message": 'Too many requests created from this IP, please try again after 5 minutes'
});

// apply to all requests
app.use(limit);


// make use of routes
app.use('/report', reports_route);
app.use('/auth', auth_route);
app.use('/users', users_route);
app.use('/', main_route);


// Catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('This url does not exist on this server!');
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error',{
	  message: err.message,
	  error: err});
});
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
});

// Production error handler. no stack traces leaked to user
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
