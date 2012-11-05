this.R.app = (function (window, document, R) {
  'use strict';
  var Model = R.mvc.Model,
    Collection = R.mvc.Collection,
    View = R.mvc.View,
    times = R.util.times,
    each = R.util.each,
    colors = ['#F24E53', '#82C2D1', '#FC9A00', '#739C1B', '#274A85'],
    randomColor = R.util.cycle(colors),
    Rectangle,
    Rectangles,
    ButtonView = R.views.ButtonView,
    InputField = R.views.InputField,
    FormField = R.views.FormField,
    ListView = R.views.ListView,
    Container = R.views.Container,
    CountView,
    RectangleView,
    RectangleItemView,
    EditRectangleView,
    MainView;

  Rectangle = Model.extend({
    defaults: {
      width: 200,
      height: 100,
      color: 'pink'
    }
  });

  Rectangles = Collection.extend({
    model: Rectangle,
    create: function (attributes) {
      if (!attributes) attributes = {};
      if (!attributes.color) attributes.color = randomColor();
      Collection.prototype.create.call(this, attributes);
    }
  });

  CountView = View.extend({
    constructor: function (options) {
      View.call(this, options);
      if (options.errorEl) this.errorEl = options.errorEl;
      this.collection = options.collection;
      this.collection.subscribe('add remove', this.collectionChange, this);
      this.on('change keyup', this.inputChange);
    },
    collectionChange: function () {
      this.clearError();
      this.el.value = this.collection.length;
    },
    inputChange: function () {
      var value = parseInt(this.el.value, 10);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        this.clearError();
        this.setCount(value);
      } else {
        this.setError('Enter a number (0-100)');
      }
    },
    setCount: function (value) {
      var difference = value - this.collection.length;
      if (difference >  0) {
        times(difference, function () {
          this.collection.create();
        }, this);
      } else if (difference < 0) {
        this.collection.truncate(value);
      }
    },
    setError: function (message) {
      if (this.errorEl) this.errorEl.textContent = message;
    },
    clearError: function () {
      if (this.errorEl) this.errorEl.textContent = '';
    }
  });

  EditRectangleView = View.extend({
    tagName: 'form',
    className: 'edit-rectangle',
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
      var fieldSet = new Container({tagName: 'fieldset'});
      each(this.fields, function (label, key) {
        var view = new FormField({
          label: this.fields[key],
          value: this.model.get(key)
        });
        this.form[key] = view;
        fieldSet.append(view);
      }, this);
      this.append(fieldSet);
    },
    render: function () {
      this.append(new Container({className: 'controls'},
        new InputField({type: 'submit', value: 'Save'}), ' or ',
        new ButtonView({label: 'Cancel', action: this.cancel.bind(this)})
      ));
      this.renderFields();
    },
    save: function () {
      each(this.form, function (field, key) {
        this.model.set(key, field.value());
      }, this);
      this.publish('save');
      this.remove();
    },
    cancel: function () {
      this.publish('cancel');
      this.remove();
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
    className: 'rectangle-item',
    constructor: function (options) {
      var model = options.model;
      View.call(this, options);
      model.subscribe('remove', this.remove, this);
      this.model = model;
      this.editButton = new ButtonView({
        label: 'Edit',
        action: this.edit.bind(this)
      });
      this.append([
        new RectangleView({model: this.model}),
        new Container({className: 'controls'},
          this.editButton,
          new ButtonView({label: 'Delete', action: model.remove.bind(model)})
        )
      ]);
    },
    edit: function () {
      this.editButton.disable();
      var editView = new EditRectangleView({model: this.model});
      editView.subscribe('save cancel', function () {
        this.editButton.enable();
      }, this);
      this.append(editView);
    }
  });

  MainView = View.extend({
    constructor: function () {
      View.apply(this, arguments);
      this.rectangles = new Rectangles();
      this.countView = new CountView({
        el: 'rectangle-count',
        errorView: new Container({el: 'rectangle-count-error'}),
        collection: this.rectangles
      });
      this.rectangleList = new ListView({
        el: 'rectangles',
        collection: this.rectangles,
        item: RectangleItemView
      });
      this.rectangleList.render();
      this.addButton = new ButtonView({
        el: 'add-rectangle',
        action: this.add.bind(this)
      });
      this.countView.setCount(3);
    },
    add: function () {
      this.rectangles.create();
    }
  });

  return {
    MainView: MainView
  };
})(this, this.document, this.R);
