// A simple basis for building an app
// using MV* architecture.
R.mvc = (function () {
  var mvc, Base;
  mvc = {};

  mvc.Base = Base = function () {};
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

  mvc.Model = Base.extend({
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

  mvc.View = Base.extend({
    constructor: function (options) {
      Base.apply(this, arguments);
      if (options && options.el) {
        this.el = options.el;
      } else {
        this.el = document.createElement(this.tagName);
      }
      if (this.className) {
        this.el.className += this.className;
      }
      if (this.attributes) {
        R.util.each(this.attributes, function (value, key) {
          this.el.setAttribute(key, value);
        }, this);
      }
    },
    replace: function (element) {
      this.el.innerHTML = '';
      this.el.appendChild(element);
    },
    append: function (element) {
      if (element.el) element = element.el;
      this.el.appendChild(element);
    },
    on: function (eventName, handler) {
      if (this.el.addEventListener) {
        this.el.addEventListener('click', handler, false); 
      } else if (el.attachEvent)  {
        this.el.attachEvent('on' + eventName, handler);
      }
    },
    backgroundColor: function (color) {
      if (color === null) return this.el.style.backgroundColor;
      this.el.style.backgroundColor = color;
    },
    width: function (w) {
      if (w == null) return this.el.style.width;
      this.el.style.width = w + 'px';
    },
    height: function (h) {
      if (h == null) return this.el.style.height;
      this.el.style.height = h + 'px';
    },
    tagName: 'div',
  });

  return mvc;
})();
