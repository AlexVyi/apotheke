"use strict"
var mongoose =require('mongoose');
var Schema = mongoose.Schema;//Schema is a built in object of mongoose

var schema = new Schema({//make one base on Schema object
    user:{type:Schema.Types.ObjectId, ref :'User'}, //tell mongoose that in fact it should look for the user model with the id created by mongo.see bellow
    cart:{type:Object, required:true},
    first_name:{type:String, required:true},
    last_name:{type:String, required:true},
    email:{type:String,required:true},
    phone:{type:Number,required:true},
    block:String,
    entrance:String,
    flat:String,
    street:{type:String,required:true},
    city:{type:String,required:true},
    number:{type:Number},
    county:{type:String},
    zip:{type:Number},
    date: { type: Date, default: Date.now },
    company:{
        name:"String",
        cui:"String",
        j:"String",
        bank:"String",
        company_block:"String",
        company_entrance:"String",
        company_flat:"String",
        company_street:"String",
        company_street_no:Number,
        company_city:"String",
        company_county:"String",
        company_zip:Number

    },
    payment:{type:String}
});

module.exports = mongoose.model('Orders', schema);//export it with the help of the model, which is an object from mongoose also.
