"use strict"
var mongoose =require('mongoose');
var Schema = mongoose.Schema;//Schema is a built in object of mongoose

var opinionSchema = new mongoose.Schema({//make one base on Schema object
	_userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User',unique:true, dropDups:true },
	text:{type:String,unique:true,dropDups:true},//if unique and dropDups are set if there is a duplicate mongo generates an err which you can use.a special index is created also
	date: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Opinion', opinionSchema);