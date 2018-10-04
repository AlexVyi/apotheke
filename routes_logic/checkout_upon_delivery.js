"use strict";
var express = require('express');
var router = express.Router();
var validator = require('express-validator');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var braintree = require('braintree');
var Cart = require('../models/cart-model');
var User = require('../models/user-model');
var json2html = require('node-json2html');
var Orders = require('../models/order-model-logged-in-from-upon-delivery');
var flashMsg = require('express-flash');
var nodemailer = require('nodemailer');
var creds = require('../lib/nodemailer');
var gateway = require('../lib/gateway');
var logger = require('../lib/logger');



module.exports = {

  getCheckoutFromUponDelivery : function (req,res,next) {
    function round(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    if(!req.session.cart){//if no cart go to main page

      logger.info('There was no session so we sent the user back to main from wherever he wanted to go',
        {headers:req.headers},{method:req.method}
      );
      res.redirect('/shopping-cart')
    }
    if(req.session.cart.constructor === Object && Object.keys(req.session.cart.items).length === 0){//if session.cart existed but the user decided to drop it session still holds the empty cart so don't let the user

      logger.info('Tried to go to checkout with an empty cart.Who would do such a thing?',
        {headers:req.headers},{method:req.method}
      );

      return res.redirect('/')
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    logger.info('errMsg were triggered, from above gateway.clientToken.generate function, in checkout_upon_delivery.Must see why', errMsg);

    gateway.clientToken.generate({}, function (err, response) {

      logger.info('In this point the gateway was accessed from checkout upon delivery',
        {headers:req.headers},
        {method:req.method}
      );

      if(err){
        logger.info('In this point the gateway was accessed from checkout upon delivery and we have an ERROR',err);
        return next(err)
      }

      res.render('shop/checkout-upon-delivery',{products: cart.generateArray(),totalPrice:round(cart.totalPrice,2),subTotalPrice:round(cart.subTotalPrice,2),amount:String(cart.totalPrice *100),errMsg: errMsg})
    });
    //var amount is for the view/form of stripe/brain_tree(more exactly, the pay with card button) and totalPrice is for the view/shopping-cart
    //amount is transforming to cents and after to string because stripe & brain tree accepts only string integers
  },
  postCheckoutFromUponDelivery: function (req,res,next) {

    function round(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    var cart = new Cart(req.session.cart);
    var amount = Number(cart.totalPrice);

    req.sanitizeBody("first_name").trim();
    req.checkBody("first_name").isAlpha();
    req.sanitizeBody("last_name").trim();
    req.checkBody("last_name").isAlpha();
    req.sanitizeBody("phone").trim();
    req.checkBody("phone").isInt();
    req.checkBody("email").isEmail();
    req.sanitizeBody("street").trim();
    req.checkBody("street").matches(/^[0-9a-zA-Z]*$/,"i");
    req.sanitizeBody("city").trim();
    req.checkBody("city").isAlpha();
    req.sanitizeBody("number").trim();
    req.checkBody("number").optional({checkFalsy:true}).isInt([ {min: 1} ]);//optional doesn't work without checkFalsy
    req.sanitizeBody("zip").trim();
    req.checkBody("zip").optional({checkFalsy:true}).isInt([ {min: 1} ]);
    //begin checking the company
    req.sanitizeBody("company").trim();
    req.checkBody("company","Nu lasati spatii intre cuvinte.Daca numele companiei este format din mai multe cuvinte, delimitati-le prin litere mari.").optional({checkFalsy:true}).isAlpha();
    req.sanitizeBody("cui").trim();
    req.checkBody("cui").optional({checkFalsy:true}).isInt([ {min: 1} ]);
    req.sanitizeBody("bank").trim();
    req.checkBody("bank").optional({checkFalsy:true}).isAlpha();
    req.sanitizeBody("company_street").trim();
    req.checkBody("company_street").optional({checkFalsy:true}).matches(/^[0-9a-zA-Z]*$/,"i");
    req.sanitizeBody("company_street_no").trim();
    req.checkBody("company_street_no").optional({checkFalsy:true}).isInt([ {min: 1} ]);
    req.sanitizeBody("company_city").trim();
    req.checkBody("company_city").optional({checkFalsy:true}).isAlpha();
    req.sanitizeBody("company_county").trim();
    req.checkBody("company_county").optional({checkFalsy:true}).isAlpha();
    req.sanitizeBody("company_zip").trim();
    req.checkBody("company_zip").optional({checkFalsy:true}).isInt([ {min: 1} ]);

    var errors = req.validationErrors(true);//errors from the rest of the form

    if (errors) {

      var keys = Object.keys(errors);
      logger.info("Errors from checkout upon delivery: " + keys)
      req.flash('error', "A aparut o eroare la urmatoarele campuri: " + keys + ". INDICIU:Nu lasati spatii intre cuvinte sau cifre.Daca, spre exemplu, numele companiei este format din mai multe cuvinte, delimitati-le prin litere mari.")
      res.redirect('/checkout-upon-delivery')
    }
    else {

      var order = new Orders({
        user: req.user,
        cart: cart,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        block: req.body.block,
        entrance: req.body.entrance,
        flat: req.body.flat,
        street: req.body.street, //express stores everything from every post route in req.body
        number: req.body.number,
        city: req.body.city,
        county: req.body.county,
        zip: req.body.zip,
        date: new Date(),
        company: {
          name: req.body.company,
          cui: req.body.cui,
          j: req.body.j,
          bank: req.body.bank,
          company_block:req.body.company_block,
          company_entrance:req.body.company_entrance,
          company_flat:req.body.company_flat,
          company_street: req.body.company_street,
          company_street_no: req.body.company_street_no,
          company_city: req.body.company_city,
          company_county: req.body.company_county,
          company_zip: req.body.company_zip

        },
        payment: req.body.payed_upon_delivery_loggedIn

      });
      logger.info('User\'s id accessing the store is : ',
        {user:req.user._id},
        {method:req.method},
        {body:req.body},
        {headers:req.headers}
      )
      order.save(function (err, user) {
        if (err) {//if err send the user back to shop and display in the view, bellow error, button towards the shop.keep the actual session alive

          logger.info('Error when trying to save the order from checkout upon delivery',
            err,
            {method:req.method}
          );
          var cart = new Cart(req.session.cart);
          return res.render('shop/shopping-cart', {products: cart.generateArray()})
        }
        logger.info('Post checkout upon delivery and order is saved :' ,
          'User id is : ',
          {user:req.user._id},
          {method:req.method}
        );
      });
      var user = req.user;
      var items = order.cart.generateArray();//use the function from cart model to transform the items object, into an array.if not, you get an object under each item id, inside the items object.
      var products = [];

      items.forEach(function (item, index, items) {//loop through the array and store whatever u need into a new Array.
        if(items[index].item.color){
          products.push("Produsul: " + items[index].item.name + ", " + " pret/set: " + items[index].item.price + " lei, " + " " + " culoare: " + items[index].item.color + ", " + " cantitate: " + items[index].qty + " set, " + " " + " ecotaxa: " + items[index].ecotaxa + " lei. " + " * " + " * " + " * " + " * ")

        }else {
          products.push("Produsul: " + items[index].item.name + ", " + " pret/set: " + items[index].item.price + " lei, " + " " + " cantitate: " + items[index].qty + " set, " + " " + " ecotaxa: " + items[index].ecotaxa + " lei. " + " * " + " * " + " * " + " * ")
        }
      });
      var data = {//make a js object and store the vars which are to be transformed from json to html
        product: products,
        total: order.cart.totalPrice,
        shipment: order.cart.shipment,
        tva: order.cart.tva,
        first_name: order.first_name,
        last_name: order.last_name,
        block: order.block,
        entrance: order.entrance,
        flat: order.flat,
        street: order.street,
        number: order.number,
        city: order.city,
        county: order.county,
        phone: order.phone,
        company: order.company.name,
        cui: order.company.cui,
        j: order.company.j,
        bank: order.company.bank,
        company_block: order.company.company_block,
        company_entrance:order.company.company_entrance,
        company_flat:order.company.company_flat,
        company_street: order.company.company_street,
        company_street_no: order.company.company_street_no,
        company_city: order.company.company_city,
        company_county: order.company.company_county,
        company_zip: order.company.company_zip,

      };

      var transform = {
        '<>': 'h3', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (this.product + '\n')
        }
      };
      var transform16 = {
        '<>': 'h4', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Cost transport: ' + this.shipment + " lei");
        }
      };
      var transform17 = {
        '<>': 'h4', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' T.V.A: ' + this.tva + " lei");
        }
      };
      var transform1 = {
        '<>': 'h4', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Cost total: ' + this.total + " lei");
        }
      };

      var transform2 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Nume: ' + this.first_name);
        }
      };
      var transform3 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Prenume: ' + this.last_name);
        }
      };
      var transform19 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Bloc: ' + this.block);
        }
      };
      var transform20 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Scara: ' + this.entrance);
        }
      };
      var transform21 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Ap. : ' + this.flat);
        }
      };
      var transform4 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Strada: ' + this.street + ' ' + this.number);
        }
      };
      var transform5 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Orasul: ' + this.city);
        }
      };
      var transform6 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Judetul: ' + this.county);
        }
      };
      var transform7 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Telefon: ' + this.phone);
        }
      };
      var transform8 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Companie: ' + this.company);
        }
      };
      var transform9 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' C.U.I: ' + this.cui);
        }
      };
      var transform10 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' J: ' + this.j);
        }
      };
      var transform11 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Banca: ' + this.bank);
        }
      };
      var transform22 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Bloc: ' + this.company_block);
        }
      };
      var transform23 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Scara: ' + this.company_entrance);
        }
      };
      var transform24 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Ap. : ' + this.company_flat);
        }
      };
      var transform12 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Strada: ' + this.company_street  + ' ' + "nr.: " + this.company_street_no);
        }
      };
      var transform13 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Orasul: ' + this.company_city);
        }
      };
      var transform14 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Judetul: ' + this.company_county);
        }
      };
      var transform15 = {
        '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
          return (' Cod postal: ' + this.company_zip);
        }
      };
      var html = json2html.transform(data, transform);//return the html
      var html16 = json2html.transform(data, transform16);//return the html
      var html17 = json2html.transform(data, transform17);//return the html
      var html1 = json2html.transform(data, transform1);//return the html
      var html2 = json2html.transform(data, transform2);//return the html
      var html3 = json2html.transform(data, transform3);//return the html
      //added later and copied from check out logged in. the numbers are random because I was tired and lazy
      var html19 = json2html.transform(data, transform19);
      var html20 = json2html.transform(data, transform20);
      var html21 = json2html.transform(data, transform21);

      var html4 = json2html.transform(data, transform4);
      var html5 = json2html.transform(data, transform5);
      var html6 = json2html.transform(data, transform6);
      var html7 = json2html.transform(data, transform7);
      var html8 = json2html.transform(data, transform8);
      var html9 = json2html.transform(data, transform9);
      var html10 = json2html.transform(data, transform10);
      var html11 = json2html.transform(data, transform11);
      //same here as above
      var html22 = json2html.transform(data, transform22);
      var html23 = json2html.transform(data, transform23);
      var html24 = json2html.transform(data, transform24);

      var html12 = json2html.transform(data, transform12);
      var html13 = json2html.transform(data, transform13);
      var html14 = json2html.transform(data, transform14);
      var html15 = json2html.transform(data, transform15);

      var smtpTransport = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: creds.user,
          pass: creds.pass
        }
      });
      if(data.company) {
        var mailOptions = {
          from: '"Simona from orders@evvs.ro"',
          to: user.email,
          bcc: 'flaviu.ariesanu@evvs.ro',
          subject: 'Your order has been received',
          html: '<h3>Buna, </h3>' + user.email +

          '<h3>Acest mail reprezinta confirmarea comenzii.</h3>' + html + html16 + html17 + html1 + html2 + html3 + html19+html20+html21+ html4 + html5 + html6 + html7 + html8 + html9 + html10 + html11 + html22+html23+html24+ html12 + html13 + html14 + html15 + '<h5>Curier: Urgent Cargus</h5>' + '<h5>Pentru informatii suplimentare sau orice alte situatii apelati gratuit: 0800 41 02 02. L-V 8:00-16:00</h5>'

          // '. <h5>This is a confirmation that your order has been successfully sent.</h5>' + '<ul>' + html + '</ul>' + '<ul>' + html16 + '</ul>' + '<ul>' + html17 + '</ul>' + '<ul>' + html1 + '</ul>' + '<ul>' + html2 + '</ul>' + '<ul>' + html3 + '</ul>' + '<ul>' + html4 + '</ul>' + '<ul>' + html5 + '</ul>' + '<ul>' +html6 + '</ul>' + '<ul>' + html7 + '</ul>' + '<ul>' + html8 + '</ul>' + '<ul>' + html9 + '</ul>' + '<ul>' + html10 +'</ul>' + '<ul>' + html11 + '</ul>' + '<ul>' +html12 + '</ul>' + '<ul>' + html13 + '</ul>' + '<ul>' +html14 + '</ul>' + '<ul>' + html15 + '</ul>'
        };
      }else{
        var mailOptions = {
          to: user.email,
          bcc: 'flaviu.ariesanu@evvs.ro',
          from: '"Simona from " <orders@evvs.ro>',
          subject: 'Your order has been received',
          html: '<h3>Buna, </h3>' + user.email +

          '<h3>Acest mail reprezinta confirmarea comenzii.</h3>' + html + html16 + html17 + html1 + html2 + html3 + html19+html20+html21 + html4 + html5 + html6 + html7 + '<h5>Curier: Urgent Cargus</h5>' + '<h5>Pentru informatii suplimentare sau orice alte situatii apelati gratuit: 0800 41 02 02. L-V 8:00-16:00</h5>'

          // '. <h5>This is a confirmation that your order has been successfully sent.</h5>' + '<ul>' + html + '</ul>' + '<ul>' + html16 + '</ul>' + '<ul>' + html17 + '</ul>' + '<ul>' + html1 + '</ul>' + '<ul>' + html2 + '</ul>' + '<ul>' + html3 + '</ul>' + '<ul>' + html4 + '</ul>' + '<ul>' + html5 + '</ul>' + '<ul>' +html6 + '</ul>' + '<ul>' + html7 + '</ul>' + '<ul>' + html8 + '</ul>' + '<ul>' + html9 + '</ul>' + '<ul>' + html10 +'</ul>' + '<ul>' + html11 + '</ul>' + '<ul>' +html12 + '</ul>' + '<ul>' + html13 + '</ul>' + '<ul>' +html14 + '</ul>' + '<ul>' + html15 + '</ul>'
        };
      }
      smtpTransport.sendMail(mailOptions, function (err, result) {
        //eval(require('locus'))LOOK INTO THIS LOOK INTO THIS LOOK INTO THIS LOOK INTO THIS LOOK INTO THIS LOOK INTO THIS LOOK INTO THIS
        if (err) {
          logger.info('Error when trying to send the email from upon delivery',err)
          return next('route')
        }
        logger.info('We successfully sent the email with the order from checkout upon delivery. ',
          'User id is : ',
          {user:req.user._id},
          {method:req.method},
          {body:req.body}
        );
        req.session.cart = null;//make cart 0 again
        res.render('shop/success')

      });
    }//end else
  }
}
