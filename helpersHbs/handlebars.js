var moment = require('moment');
var register = function(Handlebars) {

  var helpers = {
    formatDate: function (date) {//use this in the profile view to solve the date format
      return moment(date).format('DD MM YYYY HH:MM:SS');
    },


    debug: function (optionalValue) {//use this for debugging all handlebars
      console.log("Current Context");
      console.log("====================");
      console.log(this);

      if (optionalValue) {
        console.log("Value");
        console.log("====================");
        console.log(optionalValue);
      }
    },

    compare:function(lvalue, rvalue, options) {

      if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

      var operator = options.hash.operator || "==";

      var operators = {
        '===':      function(l,r) { return l === r; },
        '!==':       function(l,r) { return l !== r; },
        '<':        function(l,r) { return l < r; },
        '>':        function(l,r) { return l > r; },
        '<=':       function(l,r) { return l <= r; },
        '>=':       function(l,r) { return l >= r; },
        'typeof':   function(l,r) { return typeof l === r; }
      }

      if (!operators[operator])
        throw new Error("Handlebars Helper 'compare' doesn't know the operator "+ operator);

      var result = operators[operator](lvalue,rvalue);

      if( result ) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }

    },
    equal: function(lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if( lvalue!==rvalue ) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }



  };










  if (Handlebars && typeof Handlebars.registerHelper === "function") {
    for (var prop in helpers) {
      Handlebars.registerHelper(prop, helpers[prop]);
    }
  } else {
    return helpers;
  }

};

module.exports.register = register;
module.exports.helpers = register(null);


//what you write here can be targeted in any view