"use strict"
//calculate the time before calling the function in window.onload
//var before_load = (new Date()).getTime();
var myLoaderVar;
var loadTime = window.performance.timing.domContentLoadedEventEnd- window.performance.timing.navigationStart;
window.performance.timing.fetchStart = move()//we make calculation base on window.performance object
//we asin the value of move to fetchStartEvent object(timer object) so it can start on that moment

function move() {
  var elem = document.getElementById("percentage");
  var width = 1;
  var id = setInterval(frame, 70);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      document.getElementById("loader").style.display = "none";
      //document.getElementById("brand").style.display = "block";
    } else {
      //document.getElementById("brand").style.display = "none";
      width++;
      elem.style.width = width + '%';
      elem.innerHTML = width * 1  + '%';
    }
  }
}
//executed on window load -- see pretty.js
function loadAlbum() {
  myLoaderVar = setTimeout(move, loadTime);
};



//build it prior to finding the performance object which makes it easier
function getPageLoadTime(){
  //calculate the current time in after_load
  var after_load = (new Date()).getTime();
  // now use the before load and after_load to calculate the seconds
  seconds = (after_load - before_load) / 1000;
  // asin the value to window
  window.onload = seconds
};


// tells how many times was the page loaded using local storage
/*var n = localStorage.getItem('percentage');

if (n === null) {
  n = 0;
}

n++;

localStorage.setItem("percentage", n);

document.getElementById('loader').innerHTML = n;*/
