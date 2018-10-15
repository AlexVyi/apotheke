/*
 *everything here reflects in db.
 *this folder must be run manually at any time during new INSERTIONS or MODIFICATIONS,
 * because it wont be around during runtime.cd to the folder then run node first-product.js
 *this is why we are importing the connection object again.
 */
'use strict'
// var credMdb = require('../lib/mongodb')
var Product = require('../models/product-model');
var mongoose = require('mongoose');

/*
 *mongoose.connect('mongodb://alexvyi:VtXGcH8qitIb1UfY@cluster0-shard-00-00-voax2.mongodb.net:27017,cluster0-shard-00-01-voax2.mongodb.net:27017,cluster0-shard-00-02-voax2.mongodb.net:27017/apotheke?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin', function (err) {
 * if(err) throw  err;
 *});
 */
mongoose.connect('mongodb://alex:iepurelefugeadevulpe@94.130.109.19:27017/apothekede', (err) => {
    if(err) throw  err;
},{ useNewUrlParser: true });


var products = [

  /* A a s t i i */

  new Product({
    _id: new mongoose.Types.ObjectId(),
    imagePath: "/images/products/27x17.5/27x17.5A.jpg",
    imagePath1: "/images/products/apotheke multi.jpg",
    name: "Punga farmacie 27 x 17.5",
    description: "Punga realizata din hartie sulfit albit cu densitate de 35g/mp, latime de 6 cm si inaltime 9 cm.Imprimare farmacie generala.",
    category: "pungi farmacii generale hartie",
    price: 2.70,
    ecotaxa: 0,
    cod: "PB 6X9",
  }),
  new Product({
    _id: new mongoose.Types.ObjectId(),
    imagePath: "/images/products/20x12/20x12A.jpg",
    imagePath1: "/images/products/apotheke multi.jpg",
    name: "Punga farmacie 20 x 12",
    description: "Punga realizata din hartie sulfit albit cu densitate de 35g/mp, latime de 7 cm si inaltime  de 15 de cm.Imprimare farmacie generala.",
    category: "pungi farmacii generale hartie",
    price: 2.85,
    ecotaxa: 0,
    cod: "PB 7X15",
  }),
  new Product({
    _id: new mongoose.Types.ObjectId(),
    imagePath: "/images/products/22.5x6x11/22.5X6X11A.jpg",
    imagePath1: "/images/products/apotheke multi.jpg",
    name: "Punga farmacie 22.5 x 6 x 11",
    description: "Punga realizata din hartie sulfit albit cu densitate de 35g/mp, latime de 8.5 cm si inaltime de 15 cm.Imprimare farmacie generala.",
    category: "pungi farmacii generale hartie",
    price: 3.53,
    ecotaxa: 0,
    cod: "PB 8.5X15",
  }),
  new Product({
    _id: new mongoose.Types.ObjectId(),
    imagePath: "/images/products/27x8x13/27x8x13 A.jpg",
    imagePath1: "/images/products/apotheke multi.jpg",
    name: "Punga farmacie 27 x 8 x 13",
    description: "Punga realizata din hartie sulfit albit cu densitate de 35g/mp, latime de 10 cm si inaltime de 18 cm.Imprimare farmacie generala.",
    category: "pungi farmacii generale hartie",
    price: 3.95,
    ecotaxa: 0,
    cod: "PB 10X18",
  }),
  new Product({
    _id: new mongoose.Types.ObjectId(),
    imagePath: "/images/products/cma1.jpg",
    imagePath1: "/images/products/cma2.jpg",
    name: "Sacosa cu maner exterior 18 x 9 x 25",
    description: "Sacosa realizata din hartie kraft natur sau albit cu densitate de 70g/mp, latime de 18 cm, inaltime de 25 cm si burduf(pliu lateral) de 9 cm.",
    category: "pungi farmacii generale hartie",
    price: 4.36,
    ecotaxa: 0,
    cod: "PB 13X20",
  }),
  new Product({
    _id: new mongoose.Types.ObjectId(),
    imagePath: "/images/products/banana.jpg",
    imagePath1: "/images/products/banana.jpg",
    name: "Sacosa tip banana 25 x 35",
    description: "Sacosa realizata din polietilena de medie densitate cu grosime de 50 µ, latime de 25 cm si inaltime de 35 cm.Imprimare farmacie generala.",
    category: "sacose farmacii generale plastic",
    price: 4.36,
    ecotaxa: 0,
    cod: "PB 13X20",
  }),
  new Product({
    _id: new mongoose.Types.ObjectId(),
    imagePath: "/images/products/maiou.jpg",
    imagePath1: "/images/products/maiou.jpg",
    name: "Sacosa tip maiou 23 x 40",
    description: "Sacosa realizata din polietilena de medie densitate cu grosime de 50 µ, latime de 23 cm, inaltime de 40 cm si burduf(pliu lateral) de 12 cm.Imprimare farmacie generala.",
    category: "sacose farmacii generale plastic",
    price: 4.36,
    ecotaxa: 0,
    cod: "PB 13X20",
  }),
  new Product({
    _id: new mongoose.Types.ObjectId(),
    imagePath: "/images/products/maiou27x51.jpg",
    imagePath1: "/images/products/maiou27x51.jpg",
    name: "Sacosa tip maiou 27 x 51",
    description: "Sacosa realizata din polietilena de medie densitate cu grosime de 50 µ, latime de 27 cm, inaltime de 51 cm si burduf(pliu lateral) de 12 cm.Imprimare farmacie generala.",
    category: "sacose farmacii generale plastic",
    price: 4.36,
    ecotaxa: 0,
    cod: "PB 13X20",
  })
];
var done = 0;

for (var i = 0; i < products.length; i++) {

  products[i].save((err) => {//save products with save function from mongoose
      if(err){
        throw err
      }else {
        done++;
        if (done === products.length) {
          exit();
        }
      }
    });

}

function exit () {

  mongoose.disconnect();// disconnect when you are done

}
