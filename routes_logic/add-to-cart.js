"use strict";
var express = require('express');
var router = express.Router();
var Cart = require('../models/cart-model');
var Product = require('../models/product-model');
var flashMsg = require('express-flash');
var logger = require('../lib/logger');
router.use(flashMsg());

module.exports = {
    addToCart : function (req,res,next) {
        var productId = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart:{});//check with session if there is a cart and if not pass it as an empty object

        Product.findById(productId, function (err, product) {
          if(err){
            logger.info('Error when adding to cart' + err)
            return next(err)//error route called from app.js
          }
          cart.add(product, productId);
          req.session.cart = cart;
          logger.info('Request for product from main page with the following id : ' +  productId )
          res.redirect('back');//if we don't redirect within the same request for finding an id, we create another cart.All happens within this function
        });

    },

    addToCartFromInsideTheCart :function (req,res,next) {
        var productId = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart:{});//check with session if there is a cart and if not pass it as an empty object

        Product.findById(productId, function (err, product) {
            if(err){
              logger.info('Error when adding to cart from inside the cart' + err)
              return next(err)//error route called from app.js
            }
            cart.add(product, productId);
            req.session.cart = cart;
            logger.info('Request for product from inside the cart with the following id : ' + productId )
            res.redirect('/shopping-cart');//if we don't redirect within the same session we create another cart
        });
    }
};