// A simple basis for building an app
// using MV* architecture.
R.mvc = (function () {
  var Base, Model, View;

  Base = function () {};
  Base.prototype = {
    // Sugar that returns the super prototype.
    // Usage in a method: this.super().myMethod('foo')
    base: function () {
      return this.constructor.__super__;
    }
  };
  Base.extend = function (properties) {
    var child = R.util.inherit(this, properties);
    child.extend = this.extend;
    return child;
  };

  Model = Base.extend({
    constructor: function (attributes) {
      Base.call(this);
      this._attributes = attributes || {};
      this._callbacks = [];
    },
    get: function (key) {
      return this._attributes[key];
    },
    set: function (key, value) {
      this._attributes[key] = value;
      this.triggerChange(key, value);
    },
    triggerChange: function (key, value) {
      this._callbacks.forEach(function (handler) {
        handler(key, value);
      });
    },
    onChange: function (handler, context) {
      context = context || this;
      this._callbacks.push(handler.bind(context));
    }
  });

  View = Base.extend({
    constructor: function (options) {
      Base.apply(this, arguments);
      if (options && options.el) {
        this.el = options.el;
      } else {
        this.el = document.createElement(this.tagName);
      }
    },
    replace: function (element) {
      this.el.innerHTML = '';
      this.el.appendChild(element);
    },
    append: function (element) {
      this.el.appendChild(element);
    },
    tagName: 'div'
  });

  return {
    Base: Base,
    Model: Model,
    View: View
  };
})();
