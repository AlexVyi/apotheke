"use strict"
var mongoose =require('mongoose');
var Schema = mongoose.Schema;//Schema is a built in object of mongoose

var schema = new Schema({//make one base on Schema object tell mongoose that in fact it should look for the user model with the id created by mongo.see bellow
	cart:{type:Object, required:true},
	first_name:{type:"String", required:true},
	last_name:{type:"String", required:true},
  email:{type:"String",required:true},
  phone:{type: Number,required:true},
	block:String,
	entrance:String,
	flat:String,
	date: { type: Date, default: Date.now },
	street:{type:"String", required:true},
	number:{type:Number},
	county:{type:"String", required:true},
	city:{type:"String", required:true},
	zip:Number,
	transaction:{
    	id:"String",
		cardholderName:"String",
		transactionType:"String",
		status:"String",
		amount:"String",
		createdAt:"String",
		updatedAt:"String",
		cardType:"String",
		customerLocation:"String"

	},
	payment:{type:String}


});

module.exports = mongoose.model('Order', schema);//export it with the help of the model, which is an object from mongoose also.
//Product can be named in whatever name u feel like for your own project


//Schema is schema.Types is types of schema(see docs for types of schema) and object id is a type of the schema.we can build one only for ids..