"use strict"
var mongoose =require('mongoose')
var Schema = mongoose.Schema;//Schema is a built in object of mongoose


var productSchema = new Schema({    //make one base on Schema object
    _id: mongoose.Schema.Types.ObjectId,
    imagePath:{type: String, required:true},
    imagePath1:{type: String},
    name:{type: String, required:true},
    description:{type: String},
    category:{type: String, required:true},
    price:{type: Number, required:true},
    ecotaxa:{type: Number, required:true},
    color:{type: String},
    cod:{type: String, required:true}
});

/*productSchema.pre('save', function(next){
  var Product = this;
  this.colors.forEach(function(color) {
    color._id = Product._id;
  });
  next();
});*/

module.exports = mongoose.model('Product', productSchema);//export it with the help of the model, which is an object from mongoose also.
//Product can be named in whatever name u feel like for your own project