// A simple basis for building an app
// using MV* architecture.
R.mvc = (function () {
  var mvc = {},
    extend = R.util.extend,
    defaults = R.util.defaults,
    PubSub,
    Base,
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
  }

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
    remove: function () {
      var parent;
      if (this.el && this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    },
    append: function (element) {
      if (element.el) element = element.el;
      if (Array.isArray(element)) {
        element.forEach(this.append, this);
      } else {
        this.el.appendChild(element);
      }
    },
    on: function (events, handler) {
      handler = handler.bind(this);
      events.split(' ').forEach(function (type) {
        if (this.el.addEventListener) {
          this.el.addEventListener(type, handler, false); 
        } else if (el.attachEvent)  {
          this.el.attachEvent('on' + type, handler);
        }
      }, this);
    },
    backgroundColor: function (color) {
      if (color == null) return this.el.style.backgroundColor;
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
