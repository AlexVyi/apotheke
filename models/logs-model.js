"use strict"
var mongoose =require('mongoose');
var Schema = mongoose.Schema;//Schema is a built in object of mongoose

var logs = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hostname:{
    type: String
  },
  pid:{
    type: Number
  },
  msg: {
    type: String
  },
  level: {
    type: Number,
    required: true
  },
  res : {
    type: Object
  },
  req : {
    type: Object
  },
  createdAt: { type: Date, required: true, default: Date.now, expires: 31536000 }
})

module.exports = mongoose.model('Log', logs);