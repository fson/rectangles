this.R.testRunner = (function (window, document, R) {
  var log, statusTexts, $, setStatus, runTests;

  log = (typeof window.console !== 'undefined') ?
    window.console.log.bind(window.console) : function () {};

  $ = function (id) {
    return document.getElementById(id);
  };

  statusTexts = {
    'run': 'Running tests...',
    'error': 'Error found!',
    'ok': 'All tests passed.'
  };

  setStatus = function (name, info) {
    var el;
    el = $('status');
    el.setAttribute('data-status', name);
    el.textContent = statusTexts[name];
    $('status-info').textContent = info || '';
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

  return function () {
    setStatus('run');
    try {
      runTests(R.tests);
      setStatus('ok');
    } catch (err) {
      setStatus('error', err.name + ': ' + err.message);
      throw err;
    }
  };
})(this, this.document, this.R);