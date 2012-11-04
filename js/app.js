window.R.app = (function (R) {
  var Model = R.mvc.Model,
    Collection = R.mvc.Collection,
    View = R.mvc.View,
    times = R.util.times,
    each = R.util.each,
    colors = ['pink', 'chartreuse', 'chocolate'],
    randomColor = R.util.choice.bind(null, colors),
    Rectangle,
    CountView,
    FormField,
    RectangleListView,
    EditRectangleView,
    MainView,
    rectangles,
    rectanglesEl,
    list;

  Rectangle = Model.extend({
    defaults: {
      width: 200,
      height: 100,
      color: 'pink'
    }
  });

  Rectangles = Collection.extend({
    model: Rectangle
  });

  CountView = View.extend({
    constructor: function (options) {
      View.call(this, options);
      this.collection = options.collection;
      this.collection.subscribe('add remove', this.collectionChange, this) 
      this.on('change keyup', this.inputChange);
    },
    collectionChange: function () {
      this.el.value = this.collection.length;
    },
    inputChange: function () {
      var value = parseInt(this.el.value), difference;
      if (isNaN(value)) return;
      difference = value - this.collection.length;
      if (difference >  0) {
        times(difference, function () {
          this.collection.create({color: randomColor()});
        }, this);
      } else if (difference < 0) {
        this.collection.truncate(value);
      }
    }
  });

  ButtonView = View.extend({
    tagName: 'a',
    className: 'button',
    attributes: {
      href: '#'
    },
    constructor: function (options) {
      View.call(this, options);
      this.label = options.label;
      this.on('click', options.action);
      this.el.textContent = this.label;
    }
  });

  FormField = View.extend({
    tagName: 'label',
    constructor: function (options) {
      var input;
      View.call(this, options);
      this.el.textContent = options.label;
      input = document.createElement('input');
      input.value = options.value;
      this.append(input);
    },
    value: function () {
      return this.el.getElementsByTagName('input')[0].value;
    }
  });

  ControlsView = View.extend({
    tagName: 'div',
    className: 'controls',
    constructor: function (options) {
      View.call(this, options);
      this.model = options.model;
      this.append(new ButtonView({
        label: 'Edit',
        action: this.edit.bind(this)
      }));
      this.append(new ButtonView({
        label: 'Delete',
        action: this.remove.bind(this)
      }));
    },
    edit: function () {
      this.publish('edit');
    },
    remove: function () {
      this.model.remove();
    }
  });

  EditRectangleView = View.extend({
    tagName: 'form',
    className: 'edit',
    fields: {
      width: 'Width',
      height: 'Height',
      color: 'Colour'
    },
    constructor: function (options) {
      View.call(this, options);
      this.model = options.model;
      this.form = {};
      this.on('submit', this.save);
      this.render();
    },
    renderFields: function () {
      var key, label, view;
      each(this.fields, function (label, key) {
        label = this.fields[key];
        view = new FormField({
          label: this.fields[key],
          value: this.model.get(key)
        });
        this.form[key] = view;
        this.append(view);
      }, this);
    },
    render: function () {
      var submit, cancel, or, cancel;

      submit = document.createElement('input');
      submit.type = 'submit';
      submit.value = 'Save';
      or = document.createTextNode('or');
      cancel = new ButtonView({
        label: 'Cancel',
        action: this.cancel.bind(this)
      });

      this.renderFields();
      this.append([submit, or, cancel])
    },
    save: function () {
      each(this.form, function (field, key) {
        this.model.set(key, field.value());
      }, this);
      this.remove();
      return false;
    },
    cancel: function () {
      this.remove();
      return false;
    }
  });

  RectangleView = View.extend({
    tagName: 'div',
    className: 'rectangle',
    constructor: function (options) {
      View.call(this, options);
      this.model = options.model;
      this.model.subscribe('change', this.render, this);
      this.render();
    },
    render: function () {
      this.width(this.model.get('width'));
      this.height(this.model.get('height'));
      this.backgroundColor(this.model.get('color'));
    }
  });

  RectangleItemView = View.extend({
    tagName: 'li',
    constructor: function (options) {
      var controls;
      View.call(this, options);
      this.model = options.model;
      this.model.subscribe('remove', this.remove, this);
      this.append(new RectangleView({model: this.model}));
      controls = new ControlsView({model: this.model});
      controls.subscribe('edit', this.edit.bind(this));
      this.append(controls);
    },
    edit: function () {
      this.append(new EditRectangleView({model: this.model}));
    }
  });

  ListView = View.extend({
    tagName: 'ul',
    constructor: function (options) {
      View.call(this, options);
      this.collection = options.collection;
      this.collection.subscribe('add', this.add, this);
    },
    render: function () {
      this.add(this.collection.models);
    },
    add: function (models) {
      this.append(models.map(function (r) {
        return new RectangleItemView({model: r});
      }));
    }
  });

  MainView = View.extend({
    constructor: function () {
      View.apply(this, arguments);
      this.rectangles = new Rectangles();
      this.countView = new CountView({
        el: document.getElementById('rectangle-count'),
        collection: this.rectangles
      });
      this.rectangleList = new ListView({
        el: document.getElementById('rectangles'),
        collection: this.rectangles
      });
    },
    render: function () {
      this.rectangleList.render();
    }
  });

  return {
    MainView: MainView
  };
})(window.R);
