var _ = require('underscore');


var dispatch = function () {
  var funs = _.toArray(arguments);
  var size = funs.length;

  return function () {
    var ret = undefined;

    for (var funIndex = 0; funIndex < size; funIndex++) {
      var fun = funs[funIndex];
      ret = fun.apply(fun, _.toArray(arguments));
      if (ret) return ret;
    }

    return ret;
  };
};


var signature = function () {
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


var startsWith = function (guard) {
  return function (fn) {
    return function (source) {
      if (guard(source)) {
        return fn.apply(null, _.toArray(arguments));
      }
      return undefined;
    }
  }
};

var forString = startsWith(_.isString);
var forObject = startsWith(_.isObject);
var forArray = startsWith(_.isArray);


var conjArr = function (source, value) {
  return source.concat(value);
};


var conjObj = function (source, value) {
  return _.extend({}, source, value);
};


var conjStr = function (source, value) {
  return '' + source + value;
};


var _imutateIn = function (source, path, fn, args) {
  var props = path.split('.'),
      prop = _.first(props),
      rest = _.rest(props).join('.'),
      next = source[prop];

  if (prop) {
    return imutate.assoc(
        source,
        prop,
        _imutateIn.apply(null, [next, rest, fn, args])
    );
  }
  return fn.apply(null, [source].concat(args));
};

_imutateIn.match = signature(_, String, Function, [])(_imutateIn);

var _imutate = function (source, fn, args) {
  return fn.apply(null, [source].concat(args));
};

_imutate.match = signature(_, Function, [])(_imutate);

/**
 * Facilities arbitrary changes to nested data structures with
 * copy-on-write semantics.
 *
 * The following code will return a new message object with text/html
 * added to the accepts array.
 *
 * > message.headers.accept; // ["text/xhtml"]
 * > var msg = imutate(message, 'headers.accept', imutate.conj, 'text/html')
 * > msg.headers.accept' // ["text/xhtml", "text/html"]
 *
 * copy-on-write ensure only necessary containers are created.  All non
 * container paths in the source object remain referentially equal.
 *
 * > msg == message; // false
 * > msg.headers.user == message.headers.user; // true
 *
 * @param {*} source
 * @param {string} [path]
 * @param {function} fn
 * @param {...*} args
 * @returns {*}
 */
var imutate = dispatch(
    _imutateIn.match,
    _imutate.match
);

/**
 * associates an indexed object with a value without mutation
 * @param {Array|string|*} arr
 * @param index
 * @param value
 * @returns {Array|string}
 *
 * @private
 */
var assocArr = function(arr, index, value) {
  var tmp = arr.concat();
  tmp[index] = value;
  return tmp;
};


/**
 * associates the map with new key and value without mutation
 * @param {Object} map
 * @param {string} key
 * @param {*} value
 * @returns {object}
 *
 * @private
 */
var assocObj = function (map, key, value) {
  var tmp = {};
  tmp[key] = value;
  return _.extend({}, map, tmp);
};

/**
 * (Assoc)iates an object with a value at a key (or index).
 * Never mutates the source object.  Returns the same type
 * of object as the source.
 *
 * @func
 * @param source
 * @param identifier
 * @param value
 * @returns {Object|Array|string}
 */
imutate.assoc = dispatch(
    forObject(assocObj),
    forArray(assocArr)
);

var dissocObj = function(map, key) {
  return _.omit(map, key);
};


var dissocArr = function(arr, index) {
  return arr.slice(0,index).concat(arr.slice(index + 1));
};


imutate.dissoc = dispatch(
    forObject(dissocObj),
    forArray(dissocArr)
);


/**
 * (Conj)oins two collections, without mutation.
 *
 * @func
 * @param left
 * @param right
 * @returns {Object|Array|string}
 */
imutate.conj = dispatch(
    forArray(conjArr),
    forObject(conjObj),
    forString(conjStr)
);



// How to change a item in an array?
// imutate(arr, index, fn, args)
// what index as a path? path then index?
// imutate(obj, 'foo.bar.items', 3, assoc, "selected", true)

// would i know the index?
// or just have a reference...


// maintain API option:
// imutate(obj, 'foo.items', only(d), inc)
// imutate(obj, 'foo.things', only(d), assoc, 'selected', true);

imutate.only = function(item) {
  return function(items, fn) {
    var index = items.indexOf(item);
    var container = items.concat();
    container[index] = fn.apply(null, [item].concat(_.drop(arguments, 2)));
    return container;
  }
};

module.exports = imutate;


