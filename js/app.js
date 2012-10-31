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

  RectangleListView = View.extend({
    tagName: 'ul',
    render: function () {
      var that, controls;
      that = this;
      rectangles.forEach(function (r) {
        var li, rect, h;
        li = document.createElement('li');
        rect = document.createElement('div')
        rect.className = 'rectangle';
        rect.style.width = r.get('width') + 'px';
        h = r.get('height') + 'px';
        li.style.height = h;
        rect.style.height = h;
        rect.style.backgroundColor = r.get('color');
        controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = ['Edit', 'Delete'].map(function (t) {
          return '<a href="#">' + t + '</a>';
        }).join('');
        li.appendChild(rect);
        li.appendChild(controls.cloneNode(true))
        that.append(li);
      });
    }
  });

  MainView = View.extend({
    constructor: function () {
      View.apply(this, arguments);
      this.rectangleList = new RectangleListView({
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
