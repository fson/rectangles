# Rectangles

A simple web application that allows editing rectangles.

To build this app, a generic framework with similarities to
MVC pattern was developed.

Files:
* `docs/index.html` - jsdoc documentation for `R.mvc` and `R.util`
* `index.html` - HTML page containing the app
* `test.html` - HTML page for running the tests
* `js/app.js` - application code (`R.app`)
* `js/mvc.js` - a generic base for making JS apps,
  built for purposes of this application (`R.mvc`)
* `js/views.js` - generic views
  used as UI building blocks (`R.views`)
* `js/util.js` - utility functions (`R.util`)
* `js/shim.js` - shims needed for IE support
* `js/tests.js` - tests for most of `R.mvc` and `R.util`
* `js/test_runner.js` - function for running the tests, used in test.html
