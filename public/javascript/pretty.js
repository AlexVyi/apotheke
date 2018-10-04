'use strict';//vars at the top
// false disables the Cookie, allowing you to style the banner
var dropCookie = true;
// Number of days before the cookie expires, and the banner reappears
var cookieDuration = 14;
// Name of our cookie
var cookieName = 'complianceCookie';
// Value of cookie
var cookieValue = 'on';
/*print all orders*/
var orders = document.querySelectorAll("#orderWrapper");



//helper function for setting multiple attributes on an element
function setAttributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}
//print orders from account and from not-logged-in, in the success page
function printOrder(divId) {
    var printContents = document.getElementById(divId).innerHTML;//take the div from body
    var originalContents = document.body.innerHTML;//take body
    document.body.innerHTML = printContents;//SET the the body to equal only the div because window.print knows how to print only the whole page
    document.getElementById('printButton').style = "display: none"
    window.print();//print the new body
    document.body.innerHTML = originalContents;//leave the body as it was.VERY IMPORTANT.
}

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("left_nav").style.width = "300px";
  document.getElementById("main").style.marginLeft = "300px";
  document.getElementById("navbarOnIndex").style.marginLeft = "300px";
}
function openMainSideNav() {
  document.getElementById("left_nav").style.width = "300px";
  document.getElementById("mainJumbotron").style.marginLeft = "300px";
  document.getElementById("navbarOnMain").style.marginLeft = "300px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("left_nav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.getElementById("navbarOnIndex").style.marginLeft = "0";
}
function closeMainSideNav() {
  document.getElementById("left_nav").style.width = "0";
  document.getElementById("mainJumbotron").style.marginLeft = "0";
  document.getElementById("navbarOnMain").style.marginLeft = "0";
}
/***********************create cookie and DIV for displaying only once the G_D_P_R *******************/
function createDiv(){
  var body_tag = document.getElementsByTagName('body')[0];
  var div = document.createElement('div');
  setAttributes(div,{'id':'cookie-law','class':'container-fluid'});  /* ă â ș ț Î î µ */

  div.innerHTML = '<p class="text-sm-left text-md-left text-lg-left" id="cookie-law-p" style="font-family: \'BT Mono\'">Da, si site-ul nostru folosește cookie-uri.De ciocolată, normal.. :) Prin continuarea navigării vă dați acordul ca acestea sa fie instalate pe dispozitivul dvs.' +
    'Vă rugam sa cititi despre' + '<a href="report/cookie-policy/" rel="nofollow" title=""> politica de cookie-uri.</a>O să fie o lectură interesantă..</p> ' +
    '<a id="close-cookie-banner" class="mx-auto d-block" href="javascript:void(0)" onclick="removeMe()" style="font-family: \'BT Mono\'">Am inteles!</a>';// Be advised the Close Banner 'Am inteles' link requires jQuery

  body_tag.insertBefore(div,body_tag.firstChild); // Adds the Cookie Law Banner just after the opening <body> tag
  //document.getElementsByTagName('body')[0].className += ' cookie_banner'; //Adds a class to the <body> tag when the banner is visible

  createCookie(window.cookieName, window.cookieValue, window.cookieDuration); // Create the cookie
}


function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+ date.toLocaleDateString();
    console.log(date.toLocaleDateString())
  }
  else var expires = "";
  if(window.dropCookie) {
    document.cookie = name+"="+value+expires+"; path=/";
  }
}

function checkCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)===' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name,"",-1);
}


window.onload = function(){
  if(checkCookie(window.cookieName) !== window.cookieValue){
    createDiv();
    //loadAlbum()
  }/*else{
    loadAlbum()
  }*/
};

window.removeMe = function removeMe(){
  var element = document.getElementById('cookie-law');
  element.parentNode.removeChild(element);
};
/************************************ END COOKIE ********************************************/


//go back to product category or to main index page if in shopping cart
function goBackTo() {
  window.history.back()
}
//scroll to top from bottom of the page.see footer.hbs
function scrollToTop() {
  window.scrollTo({
    top: 0, // could be negative value
    left: 0,
    behavior: 'smooth'
  });
};



//return to the scroll level of the click event
function ScrollSneak(prefix, wait) {
  // clean up arguments (allows prefix to be optional - a bit of overkill)
  if (typeof(wait) === 'undefined' && prefix === true) prefix = null, wait = true;
  prefix = (typeof(prefix) === 'string' ? prefix : window.location.host).split('_').join('');
  var pre_name;

  // scroll function, if window.name matches, then scroll to that position and clean up window.name
  this.scroll = function() {
    if (window.name.search('^'+prefix+'_(\\d+)_(\\d+)_') === 0) {
      var name = window.name.split('_');
      window.scrollTo(name[1], name[2]);
      window.name = name.slice(3).join('_');
    }
  }
  // if not wait, scroll immediately
  if (!wait) this.scroll();

  this.sneak = function() {
    // prevent multiple clicks from getting stored on window.name
    if (typeof(pre_name) === 'undefined') pre_name = window.name;

    // get the scroll positions
    var top = 0, left = 0;
    if (typeof(window.pageYOffset) === 'number') { // netscape
      top = window.pageYOffset, left = window.pageXOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) { // dom
      top = document.body.scrollTop, left = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) { // ie6
      top = document.documentElement.scrollTop, left = document.documentElement.scrollLeft;
    }
    // store the scroll
    if (top || left) window.name = prefix + '_' + left + '_' + top + '_' + pre_name;
    return true;
  }
}
var sneaky = new ScrollSneak(location.hostname)
var links = document.querySelectorAll("a");
for (var l = 0; l < links.length; l++) {
  links[l].addEventListener('click', sneaky.sneak);
}

/*PREVENT DEFAULT ON ALL LINKS
var links = document.querySelectorAll("a");
  function pd(e) {

    e.preventDefault ? e.preventDefault() : e.returnValue = false;

  };
for(var l = 0;l<links.length;l++) {
  links[l].addEventListener('click', pd, false);
}


/**hide product description, when displaying paper bag image colors and the select options

function displayImages(){
  var cssString = "display:block; float: left; width: 25%; padding: 5px;"
  var description = document.getElementsByClassName('productDescription');
  var images = document.getElementsByClassName('paperBagsImages');
  var select = document.getElementsByClassName('selectForMultiColoredProducts')
   for(var i = 0;i< images.length;i++) {
     images[i].style.cssText += ';' + cssString;
   }
  for(var i = 0;i< description.length;i++) {
    description[i].style.display = "none"
  }
  for(var i = 0;i< select.length;i++) {
    select[i].style.display = "block"
  }

}


/**hide images and select option and display description again
function hideImages(){
  var images = document.getElementsByClassName('paperBagsImages');
  var description = document.getElementsByClassName('productDescription');
  var select = document.getElementsByClassName('selectForMultiColoredProducts')
  for(var i = 0;i< images.length;i++) {
    images[i].style.display = 'none'
  }

  for(var i = 0;i< description.length;i++) {
    description[i].style.display = "block"
  }
  for(var i = 0;i < select.length;i++) {
    select[i].style.display = "none"
  }
}**/

/*tell each select option value where to go when selected
function selectColor () {
  var x = document.getElementById("selectForMultiColoredProducts").value;
  return window.location.href = x
};*/




