// A simple basis for building an app
// using MV* architecture.
R.mvc = (function () {
  var mvc = {},
    extend = R.util.extend,
    defaults = R.util.defaults,
    Events,
    Base,
    Model,
    Collection;

  Events = {
    on: function (events, handler, context) {
      var callbacks;
      if (!this._callbacks) this._callbacks = {};
      if (!context) context = this;
      callbacks = this._callbacks;
      events.split(' ').forEach(function (eventName) {
        if (!callbacks[eventName]) callbacks[eventName] = [];
        callbacks[eventName].push(handler.bind(context));
      });
    },
    trigger: function (events) {
      console.log.apply(console, arguments);
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
  }

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
      this.trigger('change', key, value);
    }
  });
  extend(Model.prototype, Events);

  mvc.Collection = Collection = Base.extend({
    model: Model,
    constructor: function (options) {
      Base.apply(this, arguments);
      this.models = [];
      this.length = 0;
      if (options && options.models) {
        this.push.apply(this, options.models);
      }
    },
    create: function (attributes) {
      var model = new this.model(attributes);
      this.push(model);
    },
    push: function () {
      var addedModels = Array.prototype.slice.call(arguments, 0);
      this.models.push.apply(this.models, addedModels);
      this.length = this.models.length;
      this.trigger('add', addedModels);
    },
    truncate: function (length) {
      var removedModels = this.models.splice(length, this.length - length);
      this.length = this.models.length;
      this.trigger('remove', removedModels);
      return removed;
    },
    forEach: function () {
      return this.models.forEach.apply(this.models, arguments);
    },
    map: function () {
      return this.models.map.apply(this.models, arguments);
    }
  });
  extend(Collection.prototype, Events);

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
      if (Array.isArray(element)) {
        element.forEach(this.append, this);
      } else {
        this.el.appendChild(element);
      }
    },
    on: function (eventName, handler) {
      handler = handler.bind(this);
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
