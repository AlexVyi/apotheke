"use strict"
module.exports = function Cart(oldCart) {//use or recreate the old cart when need it by replacing the oldCart param.
	this.items = oldCart.items || {};
	this.totalQty = oldCart.totalQty || 0;
	this.subTotalPrice = oldCart.subTotalPrice || 0;
	this.totalEcotaxa = oldCart.totalEcotaxa || 0; //currently not outputted to view
	this.totalPrice = oldCart.totalPrice || 0;
	this.ecotaxa = oldCart.ecotaxa || 0;
	this.tva = oldCart.tva || 0;
	this.shipment = oldCart.shipment || 0;

	function round(value, decimals) {
		return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
	}

	this.add = function (item, _id) {//create new items if none is stored

		var storedItem = this.items[_id];  //check if you have that _id and don't create another cart if you have.just increment the product in the cart
		// you always have an _id created by mongo
		if(!storedItem){
			storedItem = this.items[_id] = {item: item, qty: 0, price: 0, ecotaxa: 0, shipment:0, tva :0}//must be object because in an array u cant store key pair values
		}

		storedItem.qty++;//increment in both cases and after do operations with .qty
		storedItem.ecotaxa = storedItem.item.ecotaxa*storedItem.qty;
		storedItem.price = round((storedItem.item.price * storedItem.qty),2);
		this.totalQty++;                        //update the totals also
		this.subTotalPrice = round(this.subTotalPrice +(storedItem.item.price + storedItem.item.ecotaxa),2);//cost produse cu eco_tax
		this.totalEcotaxa +=storedItem.item.ecotaxa;//total eco_tax

		if (this.subTotalPrice < 200){
			this.shipment = 22;
			this.tva = round((((this.subTotalPrice + this.shipment) * 19)/100),2);
			this.totalPrice = round((this.subTotalPrice + this.shipment + this.tva),2)
		}else{
			this.shipment = 0;
			this.tva = round((((this.subTotalPrice + this.shipment) * 19)/100),2);
			this.totalPrice = round((this.subTotalPrice + this.shipment + this.tva),2)
		}
	};

	this.reduceByOne = function (_id) {
		this.items[_id].qty--;
		this.items[_id].price = round((this.items[_id].price - this.items[_id].item.price),2);
		this.items[_id].ecotaxa -= this.items[_id].item.ecotaxa;
		this.totalQty--;
		this.subTotalPrice = round(this.subTotalPrice - (this.items[_id].item.price + this.items[_id].item.ecotaxa),2);
		this.totalEcotaxa -= this.items[_id].item.ecotaxa;
		if (this.subTotalPrice < 200){
			this.shipment = 22;
			this.tva = round((((this.subTotalPrice + this.shipment) * 19)/100),2);
			this.totalPrice = round((this.subTotalPrice + this.shipment + this.tva),2)

		}else{
			this.shipment = 0;
			this.tva = round((((this.subTotalPrice + this.shipment) * 19)/100),2);
			this.totalPrice = round((this.subTotalPrice + this.shipment  + this.tva),2)

		}

		if(this.items[_id].qty <= 0){
			delete this.items[_id]
		}

	};
	this.removeItem = function (_id) {
		this.totalQty -= this.items[_id].qty;
    this.totalEcotaxa -= this.items[_id].item.ecotaxa;
		this.subTotalPrice = round(this.subTotalPrice - (this.items[_id].price + this.items[_id].ecotaxa),2);
		this.tva = round((((this.subTotalPrice + this.shipment) * 19)/100),2);
		this.totalPrice = round((this.subTotalPrice + this.shipment  + this.tva),2);
    if(this.subTotalPrice > 0 ){
    	this.shipment = 22
      this.tva = round((((this.subTotalPrice + this.shipment) * 19)/100),2);
      this.totalPrice = round((this.subTotalPrice + this.shipment + this.tva),2)
      delete this.items[_id]
		}
		else{
    	this.shipment = 0
      this.tva = round((((this.subTotalPrice + this.shipment) * 19)/100),2);
      this.totalPrice = round((this.subTotalPrice + this.shipment + this.tva),2)
			delete this.items[_id]
		}
	};

	this.generateArray = function () {//transform the obj in an array because u must output a list to the view
		var arr = [];
		for(var _id in this.items){
			arr.push(this.items[_id])
		}
		return arr
	};
};