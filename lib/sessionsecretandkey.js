//add this file to .gitignore
"use strict"
require('dotenv').load();

module.exports={
  session:{
    cookieKey: process.env.COOKIE_KEY,
    cookieSecret:process.env.COOKIE_SECRET
  }
}