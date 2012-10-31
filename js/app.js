window.R.app = (function (R) {
  var View, Model, Rectangle,
    RectangleListView, MainView,
    rectangles, rectanglesEl, list;

  View = R.mvc.View;
  Model = R.mvc.Model;

  Rectangle = Model.extend();
  rectangles = [
    [100,100],
    [200,300],
    [100,200]
  ].map(function (dim) {
    return new Rectangle({
      width: dim[0],
      height: dim[1],
      color: 'pink'
    });
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
      this.model.onChange(this.render, this);
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
    render: function () {
      var that = this;
      rectangles.forEach(function (r) {
        var item = new RectangleItemView({model: r});
        that.append(item);
      });
    }
  });

  MainView = View.extend({
    constructor: function () {
      View.apply(this, arguments);
      this.rectangleList = new ListView({
        el: document.getElementById('rectangles')
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
