window.R.app = (function (R) {
  var Model = R.mvc.Model,
    Collection = R.mvc.Collection,
    View = R.mvc.View,
    times = R.util.times,
    Rectangle,
    CountView,
    RectangleListView,
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
      this.on('change', this.change);
    },
    change: function () {
      var value = parseInt(this.el.value),
        difference = value - this.collection.length;
      if (isNaN(value)) return;
      if (difference >  0) {
        times(difference, function () {
          this.collection.create()
        }, this);
      } else {
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
      this.text = options.text;
      this.on('click', options.action);
      this.el.textContent = this.text;
    }
  });

  ControlsView = View.extend({
    tagName: 'div',
    className: 'controls',
    constructor: function (options) {
      View.call(this, options);
      this.model = options.model;
      this.append(new ButtonView({
        text: 'Edit',
        action: this.edit.bind(this)
      }));
      this.append(new ButtonView({
        text: 'Delete',
        action: this.remove.bind(this)
      }));
    },
    edit: function () {
      console.log('Edit', this.model);
    },
    remove: function () {
      console.log('Delete', this.model);
    }
  });

  RectangleView = View.extend({
    tagName: 'div',
    className: 'rectangle',
    constructor: function (options) {
      View.call(this, options);
      this.model = options.model;
      this.model.on('change', this.render, this);
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
      var model = options.model;
      View.call(this, options);
      this.append(new RectangleView({model: model}));
      this.append(new ControlsView({model: model}));
    }
  });

  ListView = View.extend({
    tagName: 'ul',
    constructor: function (options) {
      View.call(this, options);
      this.collection = options.collection;
      this.collection.on('add', this.add, this);
      this.collection.on('remove', this.remove, this);
    },
    render: function () {
      this.add(this.collection.models);
    },
    add: function (models) {
      this.append(models.map(function (r) {
        return new RectangleItemView({model: r});
      }));
    },
    remove: function (models) {
      
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
