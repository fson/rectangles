/**
 * Provides common utility functions
 * for extending objects and inheritance.
 *
 * @namespace
 */
this.R.util = (function () {
  'use strict';
  var util = {},
    extend,
    Ctor;

  /**
   * Copies properties from source object to the target object.
   *
   * @memberOf R.util
   * @param {Object} target
   * @param {Object} source
   * @return {Object} target
   */
  util.extend = extend = function (target, source) {
    var key;
    for (key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
    return target;
  };

  /**
   * Fills in undefined properties in target object with values from the
   * source object.
   *
   * @memberOf R.util
   * @param {Object} target
   * @param {Object} source
   */
  util.defaults = function (target, source) {
    var key;
    for (key in source) {
      if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
    return target;
  };

  Ctor = function () {};

  /**
   * Creates a new constructor that inherits prototype methods from base.
   * If a hash of additional properties are passed to the function,
   * those are added to the constructor.
   * If a property named 'constructor' is passed in the properties object,
   * it will become the new constructor function instead.
   *
   * @memberOf R.util
   * @param {function} base inherited constructor
   * @param {Object} properties additional properties
   * @param {function} properties.constructor a function to use as constructor
   */
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

    Ctor.prototype = base.prototype;
    child.prototype = new Ctor();

    if (properties) {
      extend(child.prototype, properties);
    }
    child.prototype.constructor = child;
    child.__super__ = base.prototype;

    return child;
  };

  /**
   * Returns a list of names of methods of an object.
   *
   * @memberOf R.util
   * @param {Object} obj
   */
  util.functions = function (obj) {
    var key, result = [];
    for (key in obj) {
      if (typeof obj[key] === 'function') {
        result.push(key);
      }
    }
    return result;
  };

  /**
   * When passed an Array, executes a provided function once per array element,
   * like Array#forEach. When passed some other object, executes the function
   * for each own property of the object, passing the value of the property,
   * the name of the property and the object as arguments.
   *
   * @memberOf R.util
   * @param {Array|Object} obj
   * @param {function(Object, Object, Object)}
   */
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

  /**
   * Calls given iterator n times with given context.
   * The index is passed as an argument to the iterator.
   *
   * @memberOf R.util
   * @param {number} n the amount of iterations.
   * @param {function(number)} iterator the iterator function
   */
  util.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) {
      iterator.call(context, i);
    }
  };

  /**
   * Given an array, returns a function that when called will
   * each time return one item from the array, cycling though the array.
   *
   * @memberOf R.util
   * @param {Array} array the target array.
   */
  util.cycle = function (array) {
    var i = -1;
    return function () {
      i += 1;
      if (i === array.length) i = 0;
      return array[i];
    };
  };

  return util;
})();