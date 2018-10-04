"use strict"
require('dotenv').load();
process.env.NODE_ENV = 'test';
var mongoose = require("mongoose");
var Product = require('../models/product-model');
var Cart = require('../models/cart-model');
var credMdb = require('../lib/mongodb');
var session = require('supertest-session');

var chai = require('chai')
var chaiHttp = require('chai-http');
var should = chai.should();
var expect = require('chai').expect;
var super_test = require('supertest');
var myApp = require('../app.js');
var api = super_test(myApp);
chai.use(chaiHttp);





describe('Session',function () {
  var testSession = null;

  beforeEach(function () {
     testSession = session(myApp);
  });

  it('should fail accessing a restricted page', function (done) {
    testSession.get('/users/profile').expect(401).end(done)
  });
})

describe('Products', function () {
  beforeEach(function(done) { //Before each test we empty the database
    Product.remove({}, function(err){
      done();
    });
  });
  describe('home page', function () {

    it('renders homepage', function (done) {
      api.get('/').expect(302, function (err, res) {
        expect(res).to.not.redirect
        done();
      });
    });
    it('it should GET all products', function (done) {
      api.get('/all').end(function (err, res) {
        res.body.should.be.a('Object');
        res.body.should.be.eql({});
        done();

      })
    })
    it('responds with 200', function (done) {
      api.get('/').expect(200, done);
    });
  })

})

describe('Testing for db connection and saving products', function() {

  before(function (done) {
    mongoose.connect(credMdb.mongoDb_TEST.dbURI, function (err) {
      //console.log('connected to test on vps1')
      if (err) throw  err;
    }, {useMongoClient: true});

      done();

  });

  describe('Test Database', function() {
    //Save object
    it('Saves new Product to test database', function (done) {
      var testProduct = new Product({
        _id: new mongoose.Types.ObjectId(),
        imagePath:"/images/products/poli-farmacie-maiou-3.jpg",
        name:"Pungă farmacie veterinară 13 x 20",
        description:"Pungă realizată din hârtie mătase albită cu densitate de 38g/mp, lătime de 13 cm si înăltime 20 cm.Imprimare farmacie veterinară generală.",
        category:"pungi farmacii veterinare generale hartie",
        price:4.36,                        /* ă â ș ț Î î */
        ecotaxa:10,
        cod:"NP VET 13X20"
      })

      testProduct.save().then(function () {
        expect(testProduct.isNew === false)//isNew is provided by mongoose
      });
      done()
    });

    it('Should retrieve data from test database', function(done) {
      //Look up the  product previously saved.
      Product.find({name: 'Pungă farmacie veterinară 13 x 20'}, function(err, name) {
        if(err) {throw err;}
        if(name.length === 0) {throw new Error('No data!');}
      });
      done();
    });

    it('Doesn\'t save incorrect format to database', function(done) {
      //Attempt to save with wrong info. An error should trigger
      var testProductErr = new Product({
        imagePath:"/images/products/kraft-carouri.jpg",
        name:"Pungă farmacie veterinară 10 x 18",
        description:"Pungă realizată din hârtie mătase albită cu densitate de 38g/mp, lătime de 10 cm si înăltime 18 cm.Imprimare farmacie veterinară generală.",
        category:"pungi farmacii veterinare generale hartie",
        price:4.36,           /* ă â ș ț Î î */
        ecotaxa:10,
        cod:"NP VET 10X18"
      });
      expect(testProductErr.imagePath).to.be.a('string')
      expect(testProductErr.name).to.be.a('string')
      expect(testProductErr.description).to.be.a('string')
      expect(testProductErr.category).to.be.a('string')
      expect(testProductErr.price).to.be.a('number')
      expect(testProductErr.ecotaxa).to.be.a('number')
      expect(testProductErr.cod).to.be.a('string')
      done()
    });


  });

})

describe('Shopping-cart', function () {
  it('it generates a shopping cart', function (done) {
    var testSession = session(myApp);
    var req = super_test(myApp).get('testSession');
    var productId = testSession.id;
    var cart = new Cart(testSession.cart ? testSession.cart:{});
    expect(cart).to.have.property('items');
    expect(cart).to.have.property('totalQty');
    expect(cart).to.have.property('subTotalPrice');
    expect(cart).to.have.property('totalEcotaxa');
    expect(cart).to.have.property('totalPrice');
    expect(cart).to.have.property('ecotaxa');
    expect(cart).to.have.property('tva');
    expect(cart).to.have.property('shipment');
    expect(cart).to.have.property('add');
    expect(cart).to.have.property('reduceByOne');
    expect(cart).to.have.property('removeItem');
    expect(cart).to.have.property('generateArray');

    expect(cart.items).to.be.a('Object');
    expect(cart.add).to.be.a('function');
    expect(cart.reduceByOne).to.be.a('function');
    expect(cart.removeItem).to.be.a('function');
    expect(cart.generateArray).to.be.a('function');
    done()
  });

  it('responds with 200', function (done) {
    api.get('/shopping-cart').expect(200, done);
  });


  it('if there are no products it shows no products page', function (done) {
    api.get('/shopping-cart').end(function (err, res) {
      expect(res.text).to.match(/<h1 class="display-8">Nu aveti nici un produs in cos!/);
      done();
    });
  });













  afterEach(function() {
    if (this.currentTest.state === 'passed') {
      console.log('passed')
    }
  });


})
