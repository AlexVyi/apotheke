"use strict"
var express = require('express');
var router = express.Router();
var validator = require('express-validator');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var braintree = require('braintree');
var Cart = require('../models/cart-model');
var User = require('../models/user-model');
var json2html = require('node-json2html');
var Order = require('../models/order-model-not-logged');
var flashMsg = require('express-flash');
var nodemailer = require('nodemailer');
var creds = require('../lib/nodemailer');
var gateway = require('../lib/gateway');
var logger = require('../lib/logger');

router.use(flashMsg());
router.use(validator());
require('express-validator/check');

module.exports = {

  getCheckout : function (req,res,next) {
    function round(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    if(!req.session.cart){

      logger.info('There was no session so we sent the user back to main from wherever he wanted to go',
        {headers:req.headers},{method:req.method}
      );
      return res.redirect('/');

    }//if no session return to main

    if(req.session.cart.constructor === Object && Object.keys(req.session.cart.items).length === 0){

      logger.info('Tried to go to checkout with empty cart.Who would do such a thing?', {headers:req.headers},{method:req.method})
      return res.redirect('/');

    }//if there was a previous cart in the same session, but the cart is still empty, return to main

    var errMsg = req.flash('error')[0];
    logger.info('errMsg were triggered, from above gateway.clientToken.generate function, in checkout_not_logged_in.Must see why', errMsg);

    var cart = new Cart(req.session.cart);

    //res.render('shop/checkout',{products: cart.generateArray(),totalPrice:round(cart.totalPrice,2),subTotalPrice:round(cart.subTotalPrice,2),amount:String(cart.totalPrice *100),messages: req.flash('error')})
    //var amount is for the view/form of stripe(more exactly the pay with card button) and totalPrice is for the view/shopping-cart
    //amount is transforming to cents and after to string because stripe accepts only string integers

    gateway.clientToken.generate({}, function (err, response) {
      logger.info('In this point the gateway was accessed from checkout not logged in',
        {headers:req.headers},
        {method:req.method}
      );
      if(err){
        logger.info('In this point the gateway was accessed from checkout not logged in and we have an ERROR',err);
        return next(err);
      }
      res.render('shop/checkout',{
        clientToken: response.clientToken,
        products: cart.generateArray(),
        totalPrice:round(cart.totalPrice,2),
        subTotalPrice:round(cart.subTotalPrice,2),
        amount:String(cart.totalPrice *100),
        errMsg:errMsg});
    });
  },
  postCheckout: function (req,res,next) {
    function round(value, decimals) {
      return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    var cart = new Cart(req.session.cart);
    var amount = Number(cart.totalPrice);
    var nonceFromTheClient = req.body.payment_method_nonce;//replace with this to have the errors from else come back(else not displaying correctly) :paymentMethodNonce;
    var merchantAccountId;

    function formatErrors(errors) {//error from the drop in UI
      var formattedErrors = '';

      for (var i in errors) {
        if (errors.hasOwnProperty(i)) {
          formattedErrors += 'Error: ' + errors[i].code + ': ' + errors[i].message + '\n';
        }
      }
      logger.info(formattedErrors)
      return formattedErrors;
    }
    req.sanitizeBody("first_name").trim()
    req.checkBody("first_name").isAlpha();
    req.checkBody("first_name").escape();
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



    var errors = req.validationErrors(true);//errors from the rest of the form
    if (errors) {
      var keys = Object.keys(errors);
        logger.info("Errors from checkout not logged in: " + keys)
        req.flash('error', "A aparut o eroare la urmatoarele campuri: " + keys + ". INDICIU: Nu lasati spatii intre cuvinte sau cifre.Daca, spre exemplu, numele  este format din mai multe cuvinte, delimitati-le prin litere mari")
        res.redirect('/checkout')
    }
    else {
      gateway.transaction.sale({
        amount: amount,
        paymentMethodNonce: nonceFromTheClient,
        //merchantAccountId: "europackwrappingsolutionsRON", //only in production
        options: {
          submitForSettlement: true,
          threeDSecure: {
            required: false
          }
        }
      }, function (error, result) {
        if (result.success || result.transaction) {
          var transactionMessages = {
            id: result.transaction.id,
            cardholderName: result.transaction.creditCard.cardholderName,
            type: result.transaction.type,
            status: result.transaction.status,
            amount: result.transaction.amount,
            createdAt: result.transaction.createdAt,
            updatedAt: result.transaction.updatedAt,
            cardType: result.transaction.creditCard.cardType,
            customerLocation: result.transaction.creditCard.customerLocation
          }
          logger.info('Card transaction id is : ',
            result.transaction.id,
            {method:req.method},
            {body:req.body},
            {headers:req.headers},
          )
          var order = new Order({//if you add something here make sure to add it in the model too.
            user: req.user,
            cart: cart,
            email: req.body.email,
            phone: req.body.phone,
            date: new Date(),
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            block: req.body.block,
            entrance: req.body.entrance,
            flat: req.body.flat,
            street: req.body.street,
            number:req.body.number,
            county: req.body.county,
            city: req.body.city,
            zip: req.body.zip,//express stores everything from every post route in req.body
            transaction: {
              id: transactionMessages.id,
              cardholderName: transactionMessages.cardholderName,
              transactionType: transactionMessages.type,
              status: transactionMessages.status,
              amount: transactionMessages.amount,
              createdAt: transactionMessages.createdAt,
              updatedAt: transactionMessages.updatedAt,
              cardType: transactionMessages.cardType,
              customerLocation: transactionMessages.customerLocation
            },
            payment: req.body.payed_with_card_notLoggedIn
          });

          order.save(function (err, cart) {

            var items = order.cart.generateArray();//use the function from cart model to transform the items object, into an array.if not, you get an object under each item id, inside the items object.
            var products = [];
            items.forEach(function (item, index, items) {//loop through the array and store whatever u need into a new Array.
              if(items[index].item.color) {
                products.push("Produsul: " + items[index].item.name + ", " + " pret/set: " + items[index].item.price + " lei, " + " " + " culoare: " + items[index].item.color + ", " + " cantitate: " + items[index].qty + " set, " + " " + " ecotaxa: " + items[index].ecotaxa + " lei. " + " * " + " * " + " * " + " * ")
              }else{
                products.push("Produsul: " + items[index].item.name + ", " + " pret/set: " + items[index].item.price + " lei, " + " " +  " cantitate: " + items[index].qty + " set, " + " " + " ecotaxa: " + items[index].ecotaxa + " lei. " + " * " + " * " + " * " + " * ")
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
              number:order.number,
              city: order.city,
              county: order.county,
              phone: order.phone,
              transaction:order.transaction.status

            };
            var transform = {
              '<>': 'h4', 'html': function () {//see http://www.json2html.com/ for details if u forget
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
                return (' Cost total: ' + this.total);
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
            var transform18 = {
              '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
                return (' Bloc: ' + this.block);
              }
            };
            var transform19 = {
              '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
                return (' Scara: ' + this.entrance);
              }
            };
            var transform20 = {
              '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
                return (' Ap. : ' + this.flat);
              }
            };
            var transform4 = {
              '<>': 'ul', 'html': function () {//see http://www.json2html.com/ for details if u forget
                return (' Strada: ' + this.street + ' ' + "nr.: " + this.number);
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
                return (' Status tranzactie: ' + this.transaction);
              }
            };
            var html = json2html.transform(data, transform);//return the html
            var html16 = json2html.transform(data, transform16);//return the html
            var html17 = json2html.transform(data, transform17);//return the html
            var html1 = json2html.transform(data, transform1);//return the html
            var html2 = json2html.transform(data, transform2);//return the html
            var html3 = json2html.transform(data, transform3);//return the html
            var html18 = json2html.transform(data, transform18);
            var html19 = json2html.transform(data, transform19);
            var html20 = json2html.transform(data, transform20);
            var html4 = json2html.transform(data, transform4);
            var html5 = json2html.transform(data, transform5);
            var html6 = json2html.transform(data, transform6);
            var html7 = json2html.transform(data, transform7);
            var html8 = json2html.transform(data, transform8);


            var smtpTransport = nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 587,
                secure: false,
                auth: {
                  user: creds.user,
                  pass: creds.pass
                }
              }),
              mailOptions = {
                to: order.email,
                bcc: 'flaviu.ariesanu@evvs.ro',
                from: '"Simona from " <orders@evvs.ro>',
                subject: 'Your order has been received',
                html: '<h3>Buna, </h3>' + order.email +
                '. <h4>Acest mail reprezinta confirmarea comenzii.</h4>' + html + html16 + html17 + html1 + html2 + html3 + html18 + html19 + html20 + html4 + html5 + html6 + html7 + html8 + '<h5>Curier: Urgent Cargus</h5>' + '<h5>Pentru informatii suplimentare sau orice alte situatii apelati gratuit: 0800 41 02 02. L-V 8:00-16:00</h5>'
              };

            smtpTransport.sendMail(mailOptions, function (err, result) {
              if (err) {
                logger.info('Error when trying to send the email from not logged in',err);
                return next('route');
              }
              logger.info('We successfully sent the email with the order from checkout not logged in',
                {method:req.method},
                {body:req.body}
              );
              req.session.cart = null;//make cart 0 again
              res.render('shop/success', {transactionMessages: transactionMessages})

            });

          });
        }
        else {
          var transactionErrors = result.errors.deepErrors();
          logger.info('Post checkout not logged in and failed  : ', err)

          logger.info('Post checkout not logged in  and failed to process card : ', transactionErrors)
          req.flash('error', formatErrors(transactionErrors))//flash returns always an array of messages.in handlebars can be accessed with this.
          res.redirect('/checkout')

        }

      });
    }
  }

};


