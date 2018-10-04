"use strict";
require('dotenv').load();
var path = require('path')
var bunyan = require('bunyan');
var Log = require('../models/logs-model');//logs model for db
var LogEntryStream = require('bunyan-mongodb-stream')({model: Log});
var level = process.env.NODE_LOGGING_LEVEL; //now, NODE_LOGGING_LEVEL is set to info(in the .dot_env) and if u set it to debug it will log out->
                                              //-> all the req. See in app.js,  the app.all function for details.

var log = bunyan.createLogger({
  name:"epk store",
  time:new Date().toLocaleString(),
  serializers: bunyan.stdSerializers,
  streams: [
    {
      level,
      stream: LogEntryStream
    }
  ]

})


module.exports = log;
