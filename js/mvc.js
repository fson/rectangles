// A simple basis for building an app
// using MV* architecture.
this.R.mvc = (function (document, R) {
  'use strict';
  var mvc = {},
    extend = R.util.extend,
    defaults = R.util.defaults,
    PubSub,
    Base,
    prepareElement,
    View,
    Model,
    Collection;

  PubSub = {
    subscribe: function (events, handler, context) {
      var callbacks;
      if (!this._callbacks) this._callbacks = {};
      if (!context) context = this;
      callbacks = this._callbacks;
      events.split(' ').forEach(function (eventName) {
        if (!callbacks[eventName]) callbacks[eventName] = [];
        callbacks[eventName].push(handler.bind(context));
      });
    },
    publish: function (events) {
      var callbacks = this._callbacks || {},
        args = Array.prototype.slice.call(arguments, 1);
      events.split(' ').forEach(function (eventName) {
        if (callbacks[eventName]) {
          callbacks[eventName].forEach(function (handler) {
            handler.apply(null, args);
          });
        }
        if (callbacks['*']) {
          callbacks['*'].forEach(function (handler) {
            handler.apply(null, [eventName].concat(args));
          });
        }
      });
    }
  };

  mvc.Base = Base = function () {};
  Base.prototype = {
    // Sugar that returns the super prototype.
    // Usage in a method: this.super().myMethod('foo')
    base: function () {
      return this.constructor.__super__;
    }
  };
  extend(Base.prototype, PubSub);
  Base.extend = function (properties) {
    var child = R.util.inherit(this, properties);
    child.extend = this.extend;
    return child;
  };

  mvc.Model = Model = Base.extend({
    constructor: function (attributes) {
      Base.call(this);
      this._attributes = attributes || {};
      if (this.defaults) {
        defaults(this._attributes, this.defaults);
      }
    },
    get: function (key) {
      return this._attributes[key];
    },
    set: function (key, value) {
      this._attributes[key] = value;
      this.publish('change', key, value);
    },
    remove: function () {
      this.publish('remove', this);
    }
  });

  mvc.Collection = Collection = Base.extend({
    model: Model,
    constructor: function (options) {
      Base.apply(this, arguments);
      this.models = [];
      this.length = 0;
      this.subscribe('remove', this.remove);
      if (options && options.models) {
        this.push.apply(this, options.models);
      }
    },
    create: function (attributes) {
      var model = new this.model(attributes);
      this.add(model);
    },
    add: function () {
      var addedModels = Array.prototype.slice.call(arguments, 0),
        that = this;
      addedModels.forEach(function (model) {
        model.subscribe('*', function () {
          that.publish.apply(that, arguments);
        }); 
      });
      this.models.push.apply(this.models, addedModels);
      this.length = this.models.length;
      this.publish('add', addedModels);
    },
    remove: function (model) {
      var i = this.models.indexOf(model);
      this.models.splice(i, 1);
      this.length = this.models.length;
    },
    truncate: function (length) {
      var removedModels = this.models.slice(length);
      removedModels.forEach(function (model) {
        model.remove();
      });
    },
    forEach: function () {
      return this.models.forEach.apply(this.models, arguments);
    },
    map: function () {
      return this.models.map.apply(this.models, arguments);
    }
  });

  prepareElement = function (element) {
    var result;
    if (element instanceof View) element = element.el;
    if (Array.isArray(element)) {
      result = document.createDocumentFragment();
      for (var i = 0; i < element.length; i++) {
        result.appendChild(prepareElement(element[i]));
      }
    } else if (typeof element === 'string' || element instanceof String) {
      result = document.createTextNode(element);
    } else {
      result = element;
    }
    return result;
  };

  mvc.View = View = Base.extend({
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
    remove: function () {
      if (this.el && this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    },
    append: function (element) {
      this.el.appendChild(prepareElement(element));
    },
    on: function (events, callback, context) {
      var handler;
      context = context || this;
      handler = function (e) {
        callback.apply(context, arguments);
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
      };
      events.split(' ').forEach(function (type) {
        if (this.el.addEventListener) {
          this.el.addEventListener(type, handler, false); 
        } else if (this.el.attachEvent)  {
          this.el.attachEvent('on' + type, handler);
        }
      }, this);
    },
    backgroundColor: function (color) {
      if (typeof color === 'undefined') return this.el.style.backgroundColor;
      this.el.style.backgroundColor = color;
    },
    width: function (w) {
      if (typeof w === 'undefined') return this.el.style.width;
      this.el.style.width = w + 'px';
    },
    height: function (h) {
      if (typeof h === 'undefined') return this.el.style.height;
      this.el.style.height = h + 'px';
    },
    value: function (value) {
      if (typeof value === 'undefined') return this.el.value;
      this.el.value = value;
    },
    tagName: 'div'
  });

  return mvc;
})(this.document, this.R);
