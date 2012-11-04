// Provides common utility functions
// for extending objects and inheritance.
this.R.util = (function () {
  var util = {},
    extend,
    ctor;

  util.extend = extend = function (target, source) {
    var key;
    for (key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
    return target;
  };

  util.defaults = function (target, source) {
    var key;
    for (key in source) {
      if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
    return target;
  };

  ctor = function () {};

  util.inherit = function (base, properties) {
    var child;
    properties = properties || {};
    if (properties.hasOwnProperty('constructor')) {
      child = properties.constructor;
    } else {
      child = function () {
        base.apply(this, arguments);
      };
    }

    extend(child, base);

    ctor.prototype = base.prototype;
    child.prototype = new ctor();

    if (properties) {
      extend(child.prototype, properties);
    }
    child.prototype.constructor = child;
    child.__super__ = base.prototype;

    return child;
  };

  util.functions = function (obj) {
    var key, result = [];
    for (key in obj) {
      if (typeof obj[key] === 'function') {
        result.push(key);
      }
    }
    return result;
  };

  util.each = function (obj, iterator, context) {
    if (obj.forEach) {
      obj.forEach(iterator, context);
    } else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);  
        }
      }
    }
  };

  util.times = function (number, iterator, context) {
    for (var i = 0; i < number; i++) {
      iterator.call(context, i);
    }
  };

  util.choice = function (array) {
    var i = Math.floor(Math.random() * array.length);
    return array[i];
  };

  return util;
})();