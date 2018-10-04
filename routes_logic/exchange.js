"use strict";
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var https = require('https');


var currencies = [ 'EUR','RON'];
var url = 'https://data.fixer.io/api/latest?access_key=b2efb2b81f7311fcd39bd50bf855d327&base=EUR&symbols= '+ currencies.join(",");

module.exports = {

  getData: function(req,res,next) {

    https.get(url, function (res) {
      let data = '';
      let rate = {}
      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        rate = JSON.parse(data).rates;
        console.log(rate)

      })
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  }
}