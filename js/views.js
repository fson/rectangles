/**
 * Generic views to use as building blocks of UI.
 *
 * @namespace
 */
this.R.views = (function (View) {
  var views = {},
    InputField;

  views.ButtonView = View.extend({
    tagName: 'a',
    className: 'button',
    attributes: {
      href: '#'
    },
    constructor: function (options) {
      View.call(this, options);
      if (options.label) {
        this.el.textContent = options.label;
      }
      this.on('click', options.action);
    },
    disable: function (argument) {
      var text;
      this.originalEl = this.el;
      this.setElement(document.createElement('span'));
      this.append(this.originalEl.textContent);
      this.disabled = true;
    },
    enable: function (argument) {
      if (this.disabled) {
        this.setElement(this.originalEl);
        this.disabled = false;
      }
    }
  });

  views.InputField = InputField = View.extend({
    tagName: 'input',
    constructor: function (options) {
      this.attributes = {
        type: options.type || 'text',
        value: options.value
      };
      View.call(this, options);
    }
  });

  views.FormField = View.extend({
    tagName: 'label',
    constructor: function (options) {
      View.call(this, options);
      this.el.textContent = options.label;
      this.input = new InputField(options);
      this.append(this.input);
    },
    value: function () {
      return this.input.value();
    }
  });

  views.ListView = View.extend({
    tagName: 'ul',
    constructor: function (options) {
      View.call(this, options);
      this.item = options.item;
      this.collection = options.collection;
      this.collection.subscribe('add', this.add, this);
    },
    render: function () {
      this.add(this.collection.models);
    },
    add: function (models) {
      var ItemView = this.item;
      this.append(models.map(function (r) {
        return new ItemView({model: r});
      }));
    }
  });

  views.Container = View.extend({
    tagName: 'div',
    constructor: function (options) {
      var children = Array.prototype.slice.call(arguments, 1);
      if (options.className) this.className = options.className;
      if (options.tagName) this.tagName = options.tagName;
      View.call(this, options);
      this.append(children);
    }
  });

  return views;
})(this.R.mvc.View);