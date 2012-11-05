/** A simple basis for building an app.
 *
 * @namespace
 */
this.R.mvc = (function (document, R) {
  'use strict';
  var extend = R.util.extend,
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

  /**
   * Base constructor for other constructors.
   * Provides inheritance through Base.extend method and pub/sub through
   * subscribe and publish methods provided by PubSub module.
   *
   * @constructor
   * @memberOf R.mvc
   */
  Base = function () {};
  Base.prototype = {
    // Sugar that returns the super prototype.
    // Usage in a method: this.super().myMethod('foo')
    base: function () {
      return this.constructor.__super__;
    }
  };
  extend(Base.prototype, PubSub);

  /**
   * Creates a new constructor that inherits prototype methods from Base.
   * If a hash of additional properties are passed to the function,
   * those are added to the constructor.
   * If a property named 'constructor' is passed in the properties object,
   * it will become the new constructor function instead.
   *
   * @memberOf R.mvc.Base
   * @param {Object} properties additional properties
   * @param {function} properties.constructor a function to use as constructor
   */
  Base.extend = function (properties) {
    var child = R.util.inherit(this, properties);
    child.extend = this.extend;
    return child;
  };

  /**
   * Creates a model. Consists of application data, which is stored in a hash
   * and can be accessed and modified through get and set methods. It also
   * has support for pub/sub.
   * @constructor
   * @memberOf R.mvc
   * @param {Object} attributes application data for the model
   */
  Model = Base.extend({
    constructor: function (attributes) {
      Base.call(this);
      this._attributes = attributes || {};
      if (this.defaults) {
        defaults(this._attributes, this.defaults);
      }
    },
    /**
     * Attribute getter.
     * @memberOf R.mvc.Model#
     * @param {String} key
     * @return {Object} value of the attribute with given key.
     */
    get: function (key) {
      return this._attributes[key];
    },
    /**
     * Sets the value of the attribute with given key to value.
     * @memberOf R.mvc.Model#
     * @param {String} key
     * @param {Object} value
     */
    set: function (key, value) {
      this._attributes[key] = value;
      this.publish('change', key, value);
    },
    /**
     * Destroys the Model.
     * @memberOf R.mvc.Model#
     */
    remove: function () {
      this.publish('remove', this);
    }
  });

  /**
   * A collection of models.
   *
   * @constructor
   * @memberOf R.mvc
   * @param {Object} options
   * @param {Array.<R.mvc.Model>} options.models array of models to initialize
   *   the ecollection with
   */
  Collection = Base.extend({
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
    /**
     * Creates a new model in the collection.
     * @memberOf R.mvc.Collection#
     */    
    create: function (attributes) {
      var model = new this.model(attributes);
      this.add(model);
    },
    /**
     * Adds given model(s) to the collection.
     * @memberOf R.mvc.Collection#
     * @param {...R.mvc.Model} models
     */   
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
    /**
     * Removes given Model from the collection.
     * @memberOf R.mvc.Collection#
     */
    remove: function (model) {
      var i = this.models.indexOf(model);
      this.models.splice(i, 1);
      this.length = this.models.length;
    },
    /**
     * Truncates the collection to given length by removing models from the
     * end of the collection.
     * @memberOf R.mvc.Collection#
     * @param {number} length
     */
    truncate: function (length) {
      var removedModels = this.models.slice(length);
      removedModels.forEach(function (model) {
        model.remove();
      });
    },
    /**
     * Executes a provided function once per each Model in the collection.
     * @memberOf R.mvc.Collection#
     * @param {function} iterator
     * @param {Object} context
     */
    forEach: function () {
      return this.models.forEach.apply(this.models, arguments);
    },
    /**
     * Creates a new array with the results of calling a provided function on
     * every Model in this collection.
     * @memberOf R.mvc.Collection#
     * @param {function} iterator
     * @param {Object} context
     */
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

  /**
   * Creates a View object that represents a part of the UI of an application,
   * manages its state, DOM element and events.
   *
   * @constructor
   * @memberOf R.mvc
   * @param {Object} options
   * @param {Node} options.el optional DOM node to use as
   *   the element of this view. If no element if given, element using the
   *   tagName of the view.
   */
  View = Base.extend({
    constructor: function (options) {
      Base.apply(this, arguments);
      if (options && options.el) {
        this.el = options.el;
        if (typeof options.el === 'string' || options.el instanceof String) {
          this.el = document.getElementById(options.el);
        } else {
          this.el = options.el;
        }
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
    /**
     * Removes the view from DOM.
     * @memberOf R.mvc.View#
     */
    remove: function () {
      if (this.el && this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
    },
    /**
     * Appends an element, string, View or an array of former to the view.
     * @memberOf R.mvc.View#
     * @param {Node|R.mvc.View|string|Array.<Node|R.mvc.View|string>} element
     */
    append: function (element) {
      this.el.appendChild(prepareElement(element));
    },
    /**
     * Adds a DOM event listener to the element of this view.
     * @memberOf R.mvc.View#
     * @param {string} events names of events separated by a space
     * @param {function} callback
     * @param {Object} context
     */    
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
    /**
     * Sets the background color of the element.
     * @memberOf R.mvc.View#
     * @param {string} color
     */   
    backgroundColor: function (color) {
      if (typeof color === 'undefined') return this.el.style.backgroundColor;
      this.el.style.backgroundColor = color;
    },
    /**
     * Gets or sets the width of the element. If parameter is given, sets width
     * to its value. If omitted, returns current width.
     * @memberOf R.mvc.View#
     * @param {number} w if given, the width is set to w pixels
     */   
    width: function (w) {
      if (typeof w === 'undefined') return this.el.style.width;
      this.el.style.width = w + 'px';
    },
    /**
     * Gets or sets the height of the element. If parameter is given, sets
     * height to its value. If omitted, returns current height.
     * @memberOf R.mvc.View#
     * @param {number} h if given, the height is set to h pixels
     */   
    height: function (h) {
      if (typeof h === 'undefined') return this.el.style.height;
      this.el.style.height = h + 'px';
    },
    /**
     * Replaces the element of the view with a new one.
     * @memberOf R.mvc.View#
     * @param {Node} newEl new element
     */ 
    setElement: function (newEl) {
      if (this.el.parentNode) {
        this.el.parentNode.replaceChild(newEl, this.el);
        this.el = newEl;
      }
    },
    /**
     * Gets or sets the value of the element.
     * Without arguments, returns the value of the element.
     * With value given as an argument, sets the value.
     * Useful for views that have an HTMLInputElement as their element.
     * @memberOf R.mvc.View#
     * @param {string} value
     */
    value: function (value) {
      if (typeof value === 'undefined') return this.el.value;
      this.el.value = value;
    },
    /**
     * Sets the text content of the element.
     * @memberOf R.mvc.View#
     * @param {string} text
     */
    text: function (text) {
      if ('textContent' in this.el) {
        if (typeof text === 'undefined') return this.el.textContent;
        this.el.textContent = text;
      } else if ('innerText' in this.el) {
        if (typeof text === 'undefined') return this.el.innerText;
        this.el.innerText = text;
      }
    },
    tagName: 'div'
  });

  return {
    Base: Base,
    Model: Model,
    Collection: Collection,
    View: View
  };
})(this.document, this.R);
