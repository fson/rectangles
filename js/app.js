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
    model: Rectangle
  });

  CountView = View.extend({
    constructor: function (options) {
      View.call(this, options);
      this.collection = options.collection;
      this.collection.subscribe('add remove', this.collectionChange, this);
      this.on('change keyup', this.inputChange);
    },
    collectionChange: function () {
      this.el.value = this.collection.length;
    },
    inputChange: function () {
      var value = parseInt(this.el.value, 10);
      if (!isNaN(value)) {
        this.setCount(value);
      }
    },
    setCount: function (value) {
      var difference = value - this.collection.length;
      if (difference >  0) {
        times(difference, function () {
          this.collection.create({color: randomColor()});
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
      this.remove();
    },
    cancel: function () {
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
      this.append([
        new RectangleView({model: this.model}),
        new Container({className: 'controls'},
          new ButtonView({label: 'Edit', action: this.edit.bind(this)}),
          new ButtonView({label: 'Delete', action: model.remove.bind(model)})
        )
      ]);
    },
    edit: function () {
      this.append(new EditRectangleView({model: this.model}));
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
      this.countView.setCount(3);
    }
  });

  return {
    MainView: MainView
  };
})(this, this.document, this.R);
