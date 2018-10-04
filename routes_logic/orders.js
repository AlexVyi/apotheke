"use strict";
var express = require('express');
//= require("stripe")("sk_test_wwLoTnBK2RcZRJ9raO3BqyhR");
var Cart = require('../models/cart-model');
var Order = require('../models/order-model-logged-in');
var flashMsg = require('express-flash');
var router = express.Router();
var logger = require('../lib/logger');
router.use(flashMsg());
//get order and display it in the profile.beware of the different order models.they might conflict.

module.exports = {
	getOrder:function (req,res,next) {
    /*WHAT I WANT TO DO HERE IS TO BE ABLE TO SEARCH THROUGH THE ORDERS
    if (req.query.search) {
      var regex = new RegExp(escapeRegex(req.query.search), 'gi');
      Order.find({ date:date},function (err,orders) {

        if(err){
          var messages = req.flash('error');
          res.render('error',{message:messages})
        }

        var cart;
        orders.forEach(function (order) {
          cart = new Cart(order.cart);//at each iteration a new cart will save every new orders.this is why order.cart.
          order.items = cart.generateArray()
        });

        res.render('users/profile',{orders:orders, csrfToken: req.csrfToken()})
      });
    }else {}*/
      Order.find({user: req.user}, function (err, orders) {
        var user = req.user
        if (err) {
          var errorMessage = req.flash('error')[0];
          logger.info('Something went wrong and we couldn\'t find the orders' + err, errorMessage)
          res.render('error', {errorMessage: errorMessage})
        }

        var cart;
        orders.forEach(function (order) {
          cart = new Cart(order.cart);//at each iteration a new cart will save every new orders.this is why order.cart.
          order.items = cart.generateArray()
        });
        logger.info('Orders are displayed',
          {userId:user.id},
          {method:req.method},
        )
        res.render('users/profile', {orders: orders, csrfToken: req.csrfToken()})
      });

	}
};