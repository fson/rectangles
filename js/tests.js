this.R.tests = (function (R) {
  'use strict';
  var fail, assert, assertEquals;

  fail =  function (wrong, correct, message) {
    throw new Error('Assertion error: ' +
        message + ', expected: ' +
        wrong + ' == ' + correct);
  };

  assert = function (value, message) {
    if (!value) {
      fail(value, true, message);
    }
  };

  assertEquals = function (actual, expected, message) {
    if (actual !== expected) {
      fail(actual, expected, message);
    }
  };

  // Unit tests for core functionality.
  return {
    util: {
      extend: function () {
        var a, b, c, Ctr;

        a = {};
        b = {f: 'foo', b: 'bar'};

        c = R.util.extend(a, b);

        assertEquals(a, c, 'should return the target object');
        assertEquals(a.f + a.b, 'foobar', 'should copy all the properties');

        Ctr = function () {
          this.foo = 'bar';
        };
        Ctr.prototype = {
          NOPE: false
        };
        a = new Ctr();
        b = R.util.extend({}, a);

        assertEquals(b.foo, 'bar', 'should copy own properties');
        assert(!b.NOPE, 'should not copy properties from prototype chain');
      },
      inherit: function () {
        var Animal, Cat, Lion, a, nyan, scar;
        Animal = function (name) {
          this.name = name;
        };
        Animal.prototype = {
          type: 'the animal',
          sound: function () {
            return '*silence*';
          }
        };
        Animal.prototype.greet = function () {
          return [this.name, this.type, this.sound()].join(' ');
        };
        Cat = R.util.inherit(Animal, {
          sound: function () { return 'says meow!'; },
          type: 'the cat'
        });
        Lion = R.util.inherit(Cat, {
          sound: function () { return 'roars!'; }
        });
        a = new Animal('Rafiki');
        nyan = new Cat('Nyan');
        scar = new Lion('Scar');
        assertEquals(a.type, 'the animal', 'should preserve base properties');
        assertEquals(nyan.greet(), 'Nyan the cat says meow!');
        assertEquals(scar.greet(), 'Scar the cat roars!');
      }
    },
    mvc: {
      Model: function () {
        var Model, Box, b, changedKey;
        Model = R.mvc.Model;
        Box = Model.extend({
          constructor: function () {
            Model.apply(this, arguments);
          },
          area: function () { return this.get('w') * this.get('h'); }
        });
        b = new Box({w: 10, h: 10});
        assertEquals(b.area(), 100, 'should calculate area from attributes');

        changedKey = null;
        b.subscribe('change', function (key) {
          changedKey = key;
        });

        b.set('w', 20);
        assertEquals(b.get('w'), 20, 'set should change the attribute');
        assertEquals(changedKey, 'w', 'set should trigger event handler');

      }
    }
  };
})(this.R);