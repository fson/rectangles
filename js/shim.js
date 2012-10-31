// Shims for some EcmaScript5 features,
// as provided by MDN documentation.
// Required only for IE support.

// Array#forEach
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/
// Array/forEach
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  };
}
// Function#bind
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/
// Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}

// Array.isArray
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/
// Array/isArray
if (!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}