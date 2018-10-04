//add this file to .gitignore
"use strict"
require('dotenv').load();
module.exports = {
  facebook: {
    appID: process.env.FACEBOOK_ID,
    appSecret: process.env.FACEBOOK_SECRET
  }
}