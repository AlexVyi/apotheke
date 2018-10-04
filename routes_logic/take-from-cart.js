"use strict";
var express = require('express');
var router = express.Router();
var Cart = require('../models/cart-model');
var Product = require('../models/product-model');
var flashMsg = require('express-flash');
var logger = require('../lib/logger');
router.use(flashMsg());

module.exports = {
    reduce:function (req,res,next) {
      var productId = req.params.id;
      var cart = new Cart(req.session.cart ? req.session.cart : {});//check with session if there is a cart and if not pass it as an empty object
      cart.reduceByOne(productId);
      req.session.cart = cart;
      logger.info('Reduce by one the product from cart with id : ' + productId, {method:req.method})
      res.redirect('/shopping-cart');

    },
    remove:function (req,res,next) {
        var productId = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart:{});//check with session if there is a cart and if not pass it as an empty object
        cart.removeItem(productId);
        req.session.cart = cart;//IMPORTANT:if this has the value of cart the session sees the cart and does not redirect.instead it can render the checkout although it shouldn't.IT IS SOLVED IN ALL CHECKOUTS BY CHECKING AGAINST AN EMPTY OBJECT.
        logger.info('Remove from cart the whole qty for the product with id : ' + productId, {method:req.method})
        res.redirect('/shopping-cart');
    }
};