// Provides common utility functions
// for extending objects and inheritance.
R.util = (function () {
  var ctor, extend;

  extend = function (target, source) {
    var key;
    for (key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
    return target;
  };

  ctor = function () {};

  inherit = function (base, properties) {
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

  return {
    extend: extend,
    inherit: inherit
  };
})();