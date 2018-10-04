"use strict"
var helmet = require('helmet');

//use a constructor to make your own content policy and export it if you need like this : module.exports = new (helmet.contentSecurityPolicy)({some directives})
// can be used by requiring this module.the function from the directives, exports the base for constructing the nonce from app.js
function getFrames(){
  var frames = [
    'https://www.facebook.com',
    'http://www.facebook.com'
  ]
  return frames//return them one by one with the magic 3 dots in front of the variable name
}
var csp = helmet.contentSecurityPolicy({

  reportOnly:true,
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'",'https://connect.facebook.net/en_US/sdk.js',function (req, res) {
      return "'nonce-" + res.locals.nonce + "'"
    }
    ],
    scriptSrc: ["'self'",'https://connect.facebook.net/en_US/sdk.js',function (req, res) {
      return "'nonce-" + res.locals.nonce + "'"
    }
    ],
    styleSrc: ["'self'","'unsafe-inline'"],
    imgSrc:["'self'",'https://www.facebook.com/impression.php/'],
    //frameSrc:[getFrames],
    reportUri: '/report/csp-report.json'
  }
});


//module.exports = csp;