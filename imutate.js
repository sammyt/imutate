(function () {

  var _ = this._ || require('underscore');

  var dispatcher = function (/* funs */) {
    var funs = _.toArray(arguments);
    var size = funs.length;

    return function (/*, args */) {
      var ret = undefined;

      for (var funIndex = 0; funIndex < size; funIndex++) {
        var fun = funs[funIndex];
        ret = fun.apply(fun, _.toArray(arguments));
        if (ret) return ret;
      }

      return ret;
    };
  };


  var match = function () {
    var cases = _.toArray(arguments);
    var ellipsis = _.isArray(_.last(cases));

    ellipsis && (cases = _.initial(cases));

    return function (fn) {
      return function () {
        var args = _.toArray(arguments);

        var valid = _.every(cases, function (ca, i) {
          var arg = args[i];
          if (ca === _) {
            return true;
          }
          return !(arg && arg.constructor !== ca);
        });

        if (!valid) return undefined;

        if (ellipsis) {
          var rest = _.rest(args, cases.length);
          args = _.take(args, cases.length);
          args.push(rest);
        }
        return fn.apply(null, args);
      };
    };
  };


  var pred = function (guard, fn) {
    return function (target) {
      if (guard(target)) {
        return fn.apply(null, _.toArray(arguments))
      }
      return undefined;
    }
  };

  var conjArr = function (target, value) {
    return target.concat(value);
  };

  var conjObj = function (target, value) {
    return _.extend({}, target, value);
  };

  var conjStr = function (target, value) {
    return '' + target + value;
  };


  var _imutateIn = function (target, path, fn, args) {
    var props = path.split('.'),
        prop = _.first(props),
        rest = _.rest(props).join('.'),
        next = target[prop];

    if (prop) {
      return imutate.assoc(
          target,
          prop,
          _imutateIn.apply(null, [next, rest, fn, args])
      );
    }
    return fn.apply(null, [target].concat(args));
  };

  var _imutate = function (target, fn, args) {
    return fn.apply(null, [target].concat(args));
  };

  var imutate = dispatcher(
      match(_, String, Function, [])(_imutateIn),
      match(_, Function, [])(_imutate)
  );

  imutate.assoc = function (map, key, value) {
    var tmp = {};
    tmp[key] = value;
    return _.extend({}, map, tmp);
  };

  imutate.conj = function (target, val) {
    return dispatcher(
        pred(_.isArray, conjArr),
        pred(_.isObject, conjObj),
        pred(_.isString, conjStr)
    ).apply(null, _.toArray(arguments));
  };


  var foo = ['oh my, '];
  var bar = imutate(foo, imutate.conj, ['hi']);

  console.log(bar);

  console.log(
      imutate(
          {rarr: 'barr'},
          imutate.conj,
          {ohh: 'eeek'}
      )
  );

  var a = {
    foo: {
      farr : { fiff : 'hi '},
      bar: {
        baz: [1, 2, 3]
      }
    }
  };

  var b = imutate(
      a,
      'foo.bar.baz',
      imutate.conj,
      [4, 5]
  );

  console.log(a.foo.bar.baz);
  console.log(b.foo.bar.baz);
  console.log(a.foo.farr == b.foo.farr);
  console.log(a.foo== b.foo);

  console.log(
    imutate(a, 'foo.bar', _.omit, 'baz')
  );

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = imutate;
    }
    exports.imutate = imutate;
  } else {
    root.imutate = imutate;
  }

}).call(this);
