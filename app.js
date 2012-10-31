window.R.app = (function (R) {
  var View, Model, Rectangle,
    RectangleListView, MainView,
    rectangles, rectanglesEl, list;

  View = R.mvc.View;
  Model = R.mvc.Model;

  rectangles = [];

  Rectangle = Model.extend();

  RectangleListView = View.extend({
    tagName: 'ul',
    render: function () {
      var that = this;
      rectangles.map(function (r) {
        var li = document.createElement('li');
        li.className = 'rectangle';
        li.style.width = r.get('width');
        li.style.height = r.get('height');
        return li;
      }).forEach(function (li) {
        that.appendChild(li);
      });
    }
  });

  MainView = View.extend({
    constructor: function () {
      View.apply(this, arguments);
      this.rectanglesEl = document.getElementById('rectangles');
      this.rectangleList = new RectangleListView({el: rectanglesEl});
    },
    render: function () {
      this.rectangleList.render();
    }
  });

  return {
    MainView: MainView
  };
})(window.R);
