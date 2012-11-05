/**
 * A function for running test suites.
 *
 * @function
 */
this.R.testRunner = (function (window, document, R) {
  'use strict';
  var log, statusTexts, get, statusView,
    statusInfoView, setStatus, runTests;

  log = (typeof window.console !== 'undefined') ?
    window.console.log.bind(window.console) : function () {};

  get = function (id) {
    return document.getElementById(id);
  };

  statusView = new R.views.Container({
    el: get('status')
  });
  statusInfoView = new R.views.Container({
    el: get('status-info')
  });

  statusTexts = {
    'run': 'Running tests...',
    'error': 'Error found!',
    'ok': 'All tests passed.'
  };

  setStatus = function (name, info) {
    statusView.el.setAttribute('data-status', name);
    statusView.text(statusTexts[name]);
    statusInfoView.text(info || '');
  };

  runTests = function (tests) {
    var test, key;
    for (key in tests) {
      if (tests.hasOwnProperty(key)) {
        test = tests[key];
        if (typeof test === 'function') {
          log('Running test: ' + key);
          test();
          log('OK');
        } else {
          log('*** Test suite: ' + key + ' ***');
          runTests(test);
        }
      }
    }
  };

  /** @name R.testRunner */
  return function (suite) {
    setStatus('run');
    try {
      runTests(suite);
      setStatus('ok');
    } catch (err) {
      setStatus('error', err.name + ': ' + err.message);
      throw err;
    }
  };
})(this, this.document, this.R);