"use strict";
var express = require('express');
var router = express.Router();
var { body } = require('express-validator/check');
var flashMsg = require('express-flash');
var checkoutNotLogged = require('../routes_logic/checkout_not_logged_in');
var checkoutLoggedIn = require('../routes_logic/checkout_logged_in');
var checkoutUponDelivery = require('../routes_logic/checkout_upon_delivery');
var homeAndCart = require('../routes_logic/home-and-cart');
var addToCart = require('../routes_logic/add-to-cart');
var takeFromCart = require('../routes_logic/take-from-cart');

router.use(flashMsg());

/* GET home page. */
router.route('/').get(homeAndCart.getMain);
router.route('/all').get(homeAndCart.getHome);

//get categories
router.route('/paper_pharmacy_bags').get(homeAndCart.getShopPaperPharmacyBags);
router.route('/plastic_pharmacy_bags').get(homeAndCart.getShopPlasticPharmacyBags);
/*router.route('/paper_vet_pharmacy_bags').get(homeAndCart.getShopPaperVetPharmacyBags);
router.route('/plastic_vet_pharmacy_bags').get(homeAndCart.getShopPlasticVetPharmacyBags);
router.route('/plastic_shopping_bags').get(homeAndCart.getShopPlasticShoppingBags);
router.route('/plastic_transport_bags').get(homeAndCart.getShopPlasticTransportBags);
router.route('/paper_bakery_bags').get(homeAndCart.getShopPaperBakeryBags);
router.route('/platter').get(homeAndCart.getShopPlatter);
router.route('/plastic_garbage_bags').get(homeAndCart.getShopPlasticGarbageBags);
router.route('/paper_shopping_bags').get(homeAndCart.getShopPaperShoppingBags);
router.route('/paper_transport_bags').get(homeAndCart.getShopPaperTransportBags);*/

//view shopping cart
router.route('/shopping-cart').get(homeAndCart.getShoppingCart);

//add to cart button
router.route('/add-to-cart/:id').get(addToCart.addToCart);

//this is the view that we get when we enter to see the cart.from it we can ad more products but not new ones.button ADAUGA.
router.route('/add-to-cart-fromInsideCart/:id').get(addToCart.addToCartFromInsideTheCart);

//take from cart
router.route('/reduce/:id').get(takeFromCart.reduce);

router.route('/remove/:id').get(takeFromCart.remove);


//view checkout page with account and without
router.route('/checkout').get(notLoggedIn, checkoutNotLogged.getCheckout);
router.route('/checkouts').get(isLoggedIn, checkoutLoggedIn.getCheckout);//here we render user profile

//pay with brain tree and redirects to success page.
router.route('/checkout').post(checkoutNotLogged.postCheckout);
router.route('/checkouts').post(checkoutLoggedIn.postCheckout);

//separate route for the button which allows the user to pay upon delivery.also brain tree
router.route('/checkout-upon-delivery').get(isLoggedIn, checkoutUponDelivery.getCheckoutFromUponDelivery);
router.route('/checkout-upon-delivery').post(checkoutUponDelivery.postCheckoutFromUponDelivery);



router.get('/error',function (req,res,next) {
	res.render('error')
});

//MOVED FROM HERE, TO REPORTS ROUTE,  THE POST OF report-violation route.must see if it is needed.
module.exports = router;

function isLoggedIn(req,res,next) {// use this in whatever routes you will have after sign in to protect them
	if(req.isAuthenticated()){
		return next()
	}else{
		res.redirect('/')
	}
}
function notLoggedIn(req,res,next) {
	if(!req.isAuthenticated()){
		return next()
	}else{
		res.redirect('/')
	}
}
