# Rectangles

A simple web application that allows editing rectangles.

To build this app, a generic framework with similarities to
MVC pattern was developed.

Tested with:
* Google Chrome 22.0 (Mac OS X)
* Firefox 16.0 (Mac OS X)
* Firefox 17.0 (Mac OS X)
* Safari 6.0.1 (Mac OS X)
* Opera 11.64 (Mac OS X)
* Internet Explorer 8 (Windows)

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
* `js/tests.js` - tests for most of `R.mvc` and `R.util`
* `js/test_runner.js` - function for running the tests, used in test.html
* `js/shim.js` - shims (optional) only needed for IE support
