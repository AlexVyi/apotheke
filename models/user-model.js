"use strict"
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var userSchema = new Schema({
      username:String,
      googleId:String,
      facebookId:String,
      email:String,
      password: String,
	    isVerified: { type: Boolean, default: false },
	    resetPasswordToken: String,
	    resetPasswordExpires: Date
});

userSchema.methods.encryptPassword = function (password) {//hash it
    if(password) {
      return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null)
    }
};


userSchema.methods.validPassword = function (password) {//compare it
    if(password) {
      return bcrypt.compareSync(password, this.password)
    }
};

module.exports = mongoose.model('User', userSchema);//the last param creates a new collection