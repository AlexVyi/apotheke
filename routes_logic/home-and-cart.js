"use strict";
var express = require('express');
var router = express.Router();
var Product = require('../models/product-model');
var Cart = require('../models/cart-model');
var flashMsg = require('express-flash');
var logger = require('../lib/logger');
router.use(flashMsg());


module.exports = {
    getMain:function(req,res,next){


      function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");//make a regex that can search through almost everything
      }
      //if there is a search each product or resembling products, having a description can be identified by passing the regex
      if (req.query.search) {

        logger.info('Incoming request query from search product on main page', {query:req.query},{method:req.method} );//log the get query
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');


        Product.find({$or:[
            {description: regex},
            {color: regex},
            {name: regex}
          ]
        }, function (err, docs) {//docs = naming of the Product array elements retrieved
          if (err) {

            logger.info(err)
            return next(err)

          }else {

            var productsChunk = [];
            var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row

            for (var i = 0; i < docs.length; i += chunkSize) {

              productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.

            }
            var responseToQuery = {search: docs}
            logger.info('/ the response to query was ',responseToQuery, {query:req.query}, {method:req.method})
            res.render('shop/index', {products: productsChunk});
          }
        });
      }//if no search just render shop with all the products
      else{
        res.render('main')
      }
    },
    getHome:function (req,res,next) {

      function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");//make a regex that can search through almost everything
      }
      //if there is a search each product or resembling products, having a description can be identified by passing the regex
      if (req.query.search) {

        logger.info('Incoming request query from search product', {query:req.query},{method:req.method} );//log the get query
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');


        Product.find({$or:[
          {description: regex},
          {color: regex},
          {name: regex}
          ]
        }, function (err, docs) {//docs = naming of the Product array elements retrieved
          if (err) {

            logger.info(err)
            return next(err)

          }else {

            var productsChunk = [];
            var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row

            for (var i = 0; i < docs.length; i += chunkSize) {

              productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.

            }
            var responseToQuery = {search: docs}
            logger.info('/ the response to query was ',responseToQuery, {query:req.query}, {method:req.method})
            res.render('shop/index', {products: productsChunk});
          }
        });
      }//if no search just render shop with all the products
      else{
        Product.find({}).sort({'category': -1}).exec(function (err, docs) {//docs = naming of the Product array elements retrieved

          if (err) {
            logger.info(err)
            return next(err)
          }
            var productsChunk = [];
            var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
            for (var i = 0; i < docs.length; i += chunkSize) {
              productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
            }
            var noOfProductsLoaded;
            logger.info('Normal loading for products from DB', "," ,{noOfProductsLoaded:docs.length},{method:req.method} );
            //res.setHeader('Cache-Control', 'public, max-age=86400')//set cache control only on index
            res.render('shop/index', {products: productsChunk});

        });
      }
    },
  getShopPlasticPharmacyBags:function (req,res,next) {//each product has a category declared in the schema

    var plasticsPharma = "sacose farmacii generale plastic"

    Product.find({category: plasticsPharma }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 2;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request for pharmacy plastic bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },

  getShopPaperPharmacyBags:function (req,res,next) {//each product has a category declared in the schema

    var paperPharma = "pungi farmacii generale hartie"

    Product.find({category: paperPharma }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request for pharmacy paper bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },

  /*getShopPlasticVetPharmacyBags:function (req,res,next) {//each product has a category declared in the schema

    var plasticsVetPharma = "sacose farmacii generale veterinare plastic"

    Product.find({category: plasticsVetPharma }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 2;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request  veterinary pharmacy plastic bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },

  getShopPaperVetPharmacyBags:function (req,res,next) {//each product has a category declared in the schema

    var paperVetPharma = "pungi farmacii veterinare generale hartie"

    Product.find({category: paperVetPharma }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request for veterinary pharmacy paper bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },


  getShopPlasticShoppingBags:function (req,res,next) {//each product has a category declared in the schema

     var plastics = "sacose generale plastic"

      Product.find({category: plastics }, function (err, docs) {//docs = naming of the Product array elements retrieved
        if (err) {

          logger.info(err)
          return next(err)

        }else {

          var productsChunk = [];
          var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
          for (var i = 0; i < docs.length; i += chunkSize) {
            productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
          }
          var responseToRequest = {response: docs}
          logger.info('/ request for plastic shopping bags category', responseToRequest, {method:req.method})
          res.render('shop/index', {products: productsChunk});
        }
      });

  },

  getShopPaperShoppingBags:function (req,res,next) {//each product has a category declared in the schema

    var paper = "sacose generale hartie"

    Product.find({category: paper }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request for paper shopping bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },
  getShopPaperTransportBags:function (req,res,next) {//each product has a category declared in the schema

    var paperBags = "punga generale hartie"

    Product.find({category: paperBags }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request for paper transport bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },
  getShopPlasticTransportBags:function (req,res,next) {//each product has a category declared in the schema

    var plasticBags = "zipper bags"

    Product.find({category: plasticBags }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request for paper transport bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },
  getShopPlasticGarbageBags:function (req,res,next) {//each product has a category declared in the schema

    var garbageBags = "saci menajeri"

    Product.find({category: garbageBags }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request for paper transport bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },
  getShopPaperBakeryBags:function (req,res,next) {//each product has a category declared in the schema

    var bakeryBags = "pungi panificatie si coltare"

    Product.find({category: bakeryBags }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request for paper transport bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },
  getShopPlatter:function (req,res,next) {//each product has a category declared in the schema

    var platter = "tavite"

    Product.find({category: platter }, function (err, docs) {//docs = naming of the Product array elements retrieved
      if (err) {

        logger.info(err)
        return next(err)

      }else {

        var productsChunk = [];
        var chunkSize = 3;   //I need to loop through my products and stop after each 3 items due to bootstrap being set to display 3 items in a row
        for (var i = 0; i < docs.length; i += chunkSize) {
          productsChunk.push(docs.slice(i, i + chunkSize))//slice and push from current iteration until current plus chunkSize.at every iteration we slice 3.
        }
        var responseToRequest = {response: docs}
        logger.info('/ request for paper transport bags category', responseToRequest, {method:req.method})
        res.render('shop/index', {products: productsChunk});
      }
    });

  },*/



  getShoppingCart:function (req,res,next) {
        function round(value, decimals) {
            return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
        }
        if(!req.session.cart){

            logger.info('No products page rendered', {method:req.method})
            return res.render('shop/shopping-cart',{products: null});

        }else {

            var cart = new Cart(req.session.cart);
            var itemsInCart = cart.totalQty
            //console.log(cart.ecotaxa) take a look at this first if bugs reappear
            logger.info('Cart is displayed',{productsInCart:itemsInCart}, {method:req.method})
            res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice:round(cart.totalPrice,2), subTotalPrice:round(cart.subTotalPrice,2), totalEcotaxa:cart.totalEcotaxa, ecotaxa:cart.ecotaxa,tva:round(cart.tva,2), shipment:cart.shipment});
        }
    }

};
