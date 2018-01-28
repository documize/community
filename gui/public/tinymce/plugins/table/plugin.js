(function () {
var table = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var noop = function () {
  };
  var noarg = function (f) {
    return function () {
      return f();
    };
  };
  var compose = function (fa, fb) {
    return function () {
      return fa(fb.apply(null, arguments));
    };
  };
  var constant = function (value) {
    return function () {
      return value;
    };
  };
  var identity = function (x) {
    return x;
  };
  var tripleEquals = function (a, b) {
    return a === b;
  };
  var curry = function (f) {
    var args = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++)
      args[i - 1] = arguments[i];
    return function () {
      var newArgs = new Array(arguments.length);
      for (var j = 0; j < newArgs.length; j++)
        newArgs[j] = arguments[j];
      var all = args.concat(newArgs);
      return f.apply(null, all);
    };
  };
  var not = function (f) {
    return function () {
      return !f.apply(null, arguments);
    };
  };
  var die = function (msg) {
    return function () {
      throw new Error(msg);
    };
  };
  var apply = function (f) {
    return f();
  };
  var call = function (f) {
    f();
  };
  var never$1 = constant(false);
  var always$1 = constant(true);
  var $_b55bxvjijcun3z24 = {
    noop: noop,
    noarg: noarg,
    compose: compose,
    constant: constant,
    identity: identity,
    tripleEquals: tripleEquals,
    curry: curry,
    not: not,
    die: die,
    apply: apply,
    call: call,
    never: never$1,
    always: always$1
  };

  var never = $_b55bxvjijcun3z24.never;
  var always = $_b55bxvjijcun3z24.always;
  var none = function () {
    return NONE;
  };
  var NONE = function () {
    var eq = function (o) {
      return o.isNone();
    };
    var call = function (thunk) {
      return thunk();
    };
    var id = function (n) {
      return n;
    };
    var noop = function () {
    };
    var me = {
      fold: function (n, s) {
        return n();
      },
      is: never,
      isSome: never,
      isNone: always,
      getOr: id,
      getOrThunk: call,
      getOrDie: function (msg) {
        throw new Error(msg || 'error: getOrDie called on none.');
      },
      or: id,
      orThunk: call,
      map: none,
      ap: none,
      each: noop,
      bind: none,
      flatten: none,
      exists: never,
      forall: always,
      filter: none,
      equals: eq,
      equals_: eq,
      toArray: function () {
        return [];
      },
      toString: $_b55bxvjijcun3z24.constant('none()')
    };
    if (Object.freeze)
      Object.freeze(me);
    return me;
  }();
  var some = function (a) {
    var constant_a = function () {
      return a;
    };
    var self = function () {
      return me;
    };
    var map = function (f) {
      return some(f(a));
    };
    var bind = function (f) {
      return f(a);
    };
    var me = {
      fold: function (n, s) {
        return s(a);
      },
      is: function (v) {
        return a === v;
      },
      isSome: always,
      isNone: never,
      getOr: constant_a,
      getOrThunk: constant_a,
      getOrDie: constant_a,
      or: self,
      orThunk: self,
      map: map,
      ap: function (optfab) {
        return optfab.fold(none, function (fab) {
          return some(fab(a));
        });
      },
      each: function (f) {
        f(a);
      },
      bind: bind,
      flatten: constant_a,
      exists: bind,
      forall: bind,
      filter: function (f) {
        return f(a) ? me : NONE;
      },
      equals: function (o) {
        return o.is(a);
      },
      equals_: function (o, elementEq) {
        return o.fold(never, function (b) {
          return elementEq(a, b);
        });
      },
      toArray: function () {
        return [a];
      },
      toString: function () {
        return 'some(' + a + ')';
      }
    };
    return me;
  };
  var from = function (value) {
    return value === null || value === undefined ? NONE : some(value);
  };
  var $_dx6m1ljhjcun3z22 = {
    some: some,
    none: none,
    from: from
  };

  var rawIndexOf = function () {
    var pIndexOf = Array.prototype.indexOf;
    var fastIndex = function (xs, x) {
      return pIndexOf.call(xs, x);
    };
    var slowIndex = function (xs, x) {
      return slowIndexOf(xs, x);
    };
    return pIndexOf === undefined ? slowIndex : fastIndex;
  }();
  var indexOf = function (xs, x) {
    var r = rawIndexOf(xs, x);
    return r === -1 ? $_dx6m1ljhjcun3z22.none() : $_dx6m1ljhjcun3z22.some(r);
  };
  var contains = function (xs, x) {
    return rawIndexOf(xs, x) > -1;
  };
  var exists = function (xs, pred) {
    return findIndex(xs, pred).isSome();
  };
  var range = function (num, f) {
    var r = [];
    for (var i = 0; i < num; i++) {
      r.push(f(i));
    }
    return r;
  };
  var chunk = function (array, size) {
    var r = [];
    for (var i = 0; i < array.length; i += size) {
      var s = array.slice(i, i + size);
      r.push(s);
    }
    return r;
  };
  var map = function (xs, f) {
    var len = xs.length;
    var r = new Array(len);
    for (var i = 0; i < len; i++) {
      var x = xs[i];
      r[i] = f(x, i, xs);
    }
    return r;
  };
  var each = function (xs, f) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      f(x, i, xs);
    }
  };
  var eachr = function (xs, f) {
    for (var i = xs.length - 1; i >= 0; i--) {
      var x = xs[i];
      f(x, i, xs);
    }
  };
  var partition = function (xs, pred) {
    var pass = [];
    var fail = [];
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      var arr = pred(x, i, xs) ? pass : fail;
      arr.push(x);
    }
    return {
      pass: pass,
      fail: fail
    };
  };
  var filter = function (xs, pred) {
    var r = [];
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        r.push(x);
      }
    }
    return r;
  };
  var groupBy = function (xs, f) {
    if (xs.length === 0) {
      return [];
    } else {
      var wasType = f(xs[0]);
      var r = [];
      var group = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        var type = f(x);
        if (type !== wasType) {
          r.push(group);
          group = [];
        }
        wasType = type;
        group.push(x);
      }
      if (group.length !== 0) {
        r.push(group);
      }
      return r;
    }
  };
  var foldr = function (xs, f, acc) {
    eachr(xs, function (x) {
      acc = f(acc, x);
    });
    return acc;
  };
  var foldl = function (xs, f, acc) {
    each(xs, function (x) {
      acc = f(acc, x);
    });
    return acc;
  };
  var find = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return $_dx6m1ljhjcun3z22.some(x);
      }
    }
    return $_dx6m1ljhjcun3z22.none();
  };
  var findIndex = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return $_dx6m1ljhjcun3z22.some(i);
      }
    }
    return $_dx6m1ljhjcun3z22.none();
  };
  var slowIndexOf = function (xs, x) {
    for (var i = 0, len = xs.length; i < len; ++i) {
      if (xs[i] === x) {
        return i;
      }
    }
    return -1;
  };
  var push = Array.prototype.push;
  var flatten = function (xs) {
    var r = [];
    for (var i = 0, len = xs.length; i < len; ++i) {
      if (!Array.prototype.isPrototypeOf(xs[i]))
        throw new Error('Arr.flatten item ' + i + ' was not an array, input: ' + xs);
      push.apply(r, xs[i]);
    }
    return r;
  };
  var bind = function (xs, f) {
    var output = map(xs, f);
    return flatten(output);
  };
  var forall = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; ++i) {
      var x = xs[i];
      if (pred(x, i, xs) !== true) {
        return false;
      }
    }
    return true;
  };
  var equal = function (a1, a2) {
    return a1.length === a2.length && forall(a1, function (x, i) {
      return x === a2[i];
    });
  };
  var slice = Array.prototype.slice;
  var reverse = function (xs) {
    var r = slice.call(xs, 0);
    r.reverse();
    return r;
  };
  var difference = function (a1, a2) {
    return filter(a1, function (x) {
      return !contains(a2, x);
    });
  };
  var mapToObject = function (xs, f) {
    var r = {};
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      r[String(x)] = f(x, i);
    }
    return r;
  };
  var pure = function (x) {
    return [x];
  };
  var sort = function (xs, comparator) {
    var copy = slice.call(xs, 0);
    copy.sort(comparator);
    return copy;
  };
  var head = function (xs) {
    return xs.length === 0 ? $_dx6m1ljhjcun3z22.none() : $_dx6m1ljhjcun3z22.some(xs[0]);
  };
  var last = function (xs) {
    return xs.length === 0 ? $_dx6m1ljhjcun3z22.none() : $_dx6m1ljhjcun3z22.some(xs[xs.length - 1]);
  };
  var $_cirynjgjcun3z1x = {
    map: map,
    each: each,
    eachr: eachr,
    partition: partition,
    filter: filter,
    groupBy: groupBy,
    indexOf: indexOf,
    foldr: foldr,
    foldl: foldl,
    find: find,
    findIndex: findIndex,
    flatten: flatten,
    bind: bind,
    forall: forall,
    exists: exists,
    contains: contains,
    equal: equal,
    reverse: reverse,
    chunk: chunk,
    difference: difference,
    mapToObject: mapToObject,
    pure: pure,
    sort: sort,
    range: range,
    head: head,
    last: last
  };

  var keys = function () {
    var fastKeys = Object.keys;
    var slowKeys = function (o) {
      var r = [];
      for (var i in o) {
        if (o.hasOwnProperty(i)) {
          r.push(i);
        }
      }
      return r;
    };
    return fastKeys === undefined ? slowKeys : fastKeys;
  }();
  var each$1 = function (obj, f) {
    var props = keys(obj);
    for (var k = 0, len = props.length; k < len; k++) {
      var i = props[k];
      var x = obj[i];
      f(x, i, obj);
    }
  };
  var objectMap = function (obj, f) {
    return tupleMap(obj, function (x, i, obj) {
      return {
        k: i,
        v: f(x, i, obj)
      };
    });
  };
  var tupleMap = function (obj, f) {
    var r = {};
    each$1(obj, function (x, i) {
      var tuple = f(x, i, obj);
      r[tuple.k] = tuple.v;
    });
    return r;
  };
  var bifilter = function (obj, pred) {
    var t = {};
    var f = {};
    each$1(obj, function (x, i) {
      var branch = pred(x, i) ? t : f;
      branch[i] = x;
    });
    return {
      t: t,
      f: f
    };
  };
  var mapToArray = function (obj, f) {
    var r = [];
    each$1(obj, function (value, name) {
      r.push(f(value, name));
    });
    return r;
  };
  var find$1 = function (obj, pred) {
    var props = keys(obj);
    for (var k = 0, len = props.length; k < len; k++) {
      var i = props[k];
      var x = obj[i];
      if (pred(x, i, obj)) {
        return $_dx6m1ljhjcun3z22.some(x);
      }
    }
    return $_dx6m1ljhjcun3z22.none();
  };
  var values = function (obj) {
    return mapToArray(obj, function (v) {
      return v;
    });
  };
  var size = function (obj) {
    return values(obj).length;
  };
  var $_ds59i8jkjcun3z2m = {
    bifilter: bifilter,
    each: each$1,
    map: objectMap,
    mapToArray: mapToArray,
    tupleMap: tupleMap,
    find: find$1,
    keys: keys,
    values: values,
    size: size
  };

  var Immutable = function () {
    var fields = arguments;
    return function () {
      var values = new Array(arguments.length);
      for (var i = 0; i < values.length; i++)
        values[i] = arguments[i];
      if (fields.length !== values.length)
        throw new Error('Wrong number of arguments to struct. Expected "[' + fields.length + ']", got ' + values.length + ' arguments');
      var struct = {};
      $_cirynjgjcun3z1x.each(fields, function (name, i) {
        struct[name] = $_b55bxvjijcun3z24.constant(values[i]);
      });
      return struct;
    };
  };

  var typeOf = function (x) {
    if (x === null)
      return 'null';
    var t = typeof x;
    if (t === 'object' && Array.prototype.isPrototypeOf(x))
      return 'array';
    if (t === 'object' && String.prototype.isPrototypeOf(x))
      return 'string';
    return t;
  };
  var isType = function (type) {
    return function (value) {
      return typeOf(value) === type;
    };
  };
  var $_5lospcjpjcun3z2w = {
    isString: isType('string'),
    isObject: isType('object'),
    isArray: isType('array'),
    isNull: isType('null'),
    isBoolean: isType('boolean'),
    isUndefined: isType('undefined'),
    isFunction: isType('function'),
    isNumber: isType('number')
  };

  var sort$1 = function (arr) {
    return arr.slice(0).sort();
  };
  var reqMessage = function (required, keys) {
    throw new Error('All required keys (' + sort$1(required).join(', ') + ') were not specified. Specified keys were: ' + sort$1(keys).join(', ') + '.');
  };
  var unsuppMessage = function (unsupported) {
    throw new Error('Unsupported keys for object: ' + sort$1(unsupported).join(', '));
  };
  var validateStrArr = function (label, array) {
    if (!$_5lospcjpjcun3z2w.isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    $_cirynjgjcun3z1x.each(array, function (a) {
      if (!$_5lospcjpjcun3z2w.isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = $_cirynjgjcun3z1x.find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };
  var $_bzgn0gjojcun3z2u = {
    sort: sort$1,
    reqMessage: reqMessage,
    unsuppMessage: unsuppMessage,
    validateStrArr: validateStrArr,
    invalidTypeMessage: invalidTypeMessage,
    checkDupes: checkDupes
  };

  var MixedBag = function (required, optional) {
    var everything = required.concat(optional);
    if (everything.length === 0)
      throw new Error('You must specify at least one required or optional field.');
    $_bzgn0gjojcun3z2u.validateStrArr('required', required);
    $_bzgn0gjojcun3z2u.validateStrArr('optional', optional);
    $_bzgn0gjojcun3z2u.checkDupes(everything);
    return function (obj) {
      var keys = $_ds59i8jkjcun3z2m.keys(obj);
      var allReqd = $_cirynjgjcun3z1x.forall(required, function (req) {
        return $_cirynjgjcun3z1x.contains(keys, req);
      });
      if (!allReqd)
        $_bzgn0gjojcun3z2u.reqMessage(required, keys);
      var unsupported = $_cirynjgjcun3z1x.filter(keys, function (key) {
        return !$_cirynjgjcun3z1x.contains(everything, key);
      });
      if (unsupported.length > 0)
        $_bzgn0gjojcun3z2u.unsuppMessage(unsupported);
      var r = {};
      $_cirynjgjcun3z1x.each(required, function (req) {
        r[req] = $_b55bxvjijcun3z24.constant(obj[req]);
      });
      $_cirynjgjcun3z1x.each(optional, function (opt) {
        r[opt] = $_b55bxvjijcun3z24.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? $_dx6m1ljhjcun3z22.some(obj[opt]) : $_dx6m1ljhjcun3z22.none());
      });
      return r;
    };
  };

  var $_asy2ehjljcun3z2p = {
    immutable: Immutable,
    immutableBag: MixedBag
  };

  var dimensions = $_asy2ehjljcun3z2p.immutable('width', 'height');
  var grid = $_asy2ehjljcun3z2p.immutable('rows', 'columns');
  var address = $_asy2ehjljcun3z2p.immutable('row', 'column');
  var coords = $_asy2ehjljcun3z2p.immutable('x', 'y');
  var detail = $_asy2ehjljcun3z2p.immutable('element', 'rowspan', 'colspan');
  var detailnew = $_asy2ehjljcun3z2p.immutable('element', 'rowspan', 'colspan', 'isNew');
  var extended = $_asy2ehjljcun3z2p.immutable('element', 'rowspan', 'colspan', 'row', 'column');
  var rowdata = $_asy2ehjljcun3z2p.immutable('element', 'cells', 'section');
  var elementnew = $_asy2ehjljcun3z2p.immutable('element', 'isNew');
  var rowdatanew = $_asy2ehjljcun3z2p.immutable('element', 'cells', 'section', 'isNew');
  var rowcells = $_asy2ehjljcun3z2p.immutable('cells', 'section');
  var rowdetails = $_asy2ehjljcun3z2p.immutable('details', 'section');
  var bounds = $_asy2ehjljcun3z2p.immutable('startRow', 'startCol', 'finishRow', 'finishCol');
  var $_bt8aj2jrjcun3z34 = {
    dimensions: dimensions,
    grid: grid,
    address: address,
    coords: coords,
    extended: extended,
    detail: detail,
    detailnew: detailnew,
    rowdata: rowdata,
    elementnew: elementnew,
    rowdatanew: rowdatanew,
    rowcells: rowcells,
    rowdetails: rowdetails,
    bounds: bounds
  };

  var fromHtml = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    if (!div.hasChildNodes() || div.childNodes.length > 1) {
      console.error('HTML does not have a single root node', html);
      throw 'HTML must have a single root node';
    }
    return fromDom(div.childNodes[0]);
  };
  var fromTag = function (tag, scope) {
    var doc = scope || document;
    var node = doc.createElement(tag);
    return fromDom(node);
  };
  var fromText = function (text, scope) {
    var doc = scope || document;
    var node = doc.createTextNode(text);
    return fromDom(node);
  };
  var fromDom = function (node) {
    if (node === null || node === undefined)
      throw new Error('Node cannot be null or undefined');
    return { dom: $_b55bxvjijcun3z24.constant(node) };
  };
  var fromPoint = function (doc, x, y) {
    return $_dx6m1ljhjcun3z22.from(doc.dom().elementFromPoint(x, y)).map(fromDom);
  };
  var $_cycgn2jvjcun3z41 = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_cwmfqmjwjcun3z46 = {
    ATTRIBUTE: 2,
    CDATA_SECTION: 4,
    COMMENT: 8,
    DOCUMENT: 9,
    DOCUMENT_TYPE: 10,
    DOCUMENT_FRAGMENT: 11,
    ELEMENT: 1,
    TEXT: 3,
    PROCESSING_INSTRUCTION: 7,
    ENTITY_REFERENCE: 5,
    ENTITY: 6,
    NOTATION: 12
  };

  var ELEMENT = $_cwmfqmjwjcun3z46.ELEMENT;
  var DOCUMENT = $_cwmfqmjwjcun3z46.DOCUMENT;
  var is = function (element, selector) {
    var elem = element.dom();
    if (elem.nodeType !== ELEMENT)
      return false;
    else if (elem.matches !== undefined)
      return elem.matches(selector);
    else if (elem.msMatchesSelector !== undefined)
      return elem.msMatchesSelector(selector);
    else if (elem.webkitMatchesSelector !== undefined)
      return elem.webkitMatchesSelector(selector);
    else if (elem.mozMatchesSelector !== undefined)
      return elem.mozMatchesSelector(selector);
    else
      throw new Error('Browser lacks native selectors');
  };
  var bypassSelector = function (dom) {
    return dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT || dom.childElementCount === 0;
  };
  var all = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? [] : $_cirynjgjcun3z1x.map(base.querySelectorAll(selector), $_cycgn2jvjcun3z41.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? $_dx6m1ljhjcun3z22.none() : $_dx6m1ljhjcun3z22.from(base.querySelector(selector)).map($_cycgn2jvjcun3z41.fromDom);
  };
  var $_aeohlsjujcun3z3x = {
    all: all,
    is: is,
    one: one
  };

  var toArray = function (target, f) {
    var r = [];
    var recurse = function (e) {
      r.push(e);
      return f(e);
    };
    var cur = f(target);
    do {
      cur = cur.bind(recurse);
    } while (cur.isSome());
    return r;
  };
  var $_8tlirhjyjcun3z4f = { toArray: toArray };

  var global = typeof window !== 'undefined' ? window : Function('return this;')();

  var path = function (parts, scope) {
    var o = scope !== undefined && scope !== null ? scope : global;
    for (var i = 0; i < parts.length && o !== undefined && o !== null; ++i)
      o = o[parts[i]];
    return o;
  };
  var resolve = function (p, scope) {
    var parts = p.split('.');
    return path(parts, scope);
  };
  var step = function (o, part) {
    if (o[part] === undefined || o[part] === null)
      o[part] = {};
    return o[part];
  };
  var forge = function (parts, target) {
    var o = target !== undefined ? target : global;
    for (var i = 0; i < parts.length; ++i)
      o = step(o, parts[i]);
    return o;
  };
  var namespace = function (name, target) {
    var parts = name.split('.');
    return forge(parts, target);
  };
  var $_b7yxe9k2jcun3z4q = {
    path: path,
    resolve: resolve,
    forge: forge,
    namespace: namespace
  };

  var unsafe = function (name, scope) {
    return $_b7yxe9k2jcun3z4q.resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_adybm4k1jcun3z4o = { getOrDie: getOrDie };

  var node = function () {
    var f = $_adybm4k1jcun3z4o.getOrDie('Node');
    return f;
  };
  var compareDocumentPosition = function (a, b, match) {
    return (a.compareDocumentPosition(b) & match) !== 0;
  };
  var documentPositionPreceding = function (a, b) {
    return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_PRECEDING);
  };
  var documentPositionContainedBy = function (a, b) {
    return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_CONTAINED_BY);
  };
  var $_6xkc40k0jcun3z4m = {
    documentPositionPreceding: documentPositionPreceding,
    documentPositionContainedBy: documentPositionContainedBy
  };

  var cached = function (f) {
    var called = false;
    var r;
    return function () {
      if (!called) {
        called = true;
        r = f.apply(null, arguments);
      }
      return r;
    };
  };
  var $_fokurjk5jcun3z4t = { cached: cached };

  var firstMatch = function (regexes, s) {
    for (var i = 0; i < regexes.length; i++) {
      var x = regexes[i];
      if (x.test(s))
        return x;
    }
    return undefined;
  };
  var find$2 = function (regexes, agent) {
    var r = firstMatch(regexes, agent);
    if (!r)
      return {
        major: 0,
        minor: 0
      };
    var group = function (i) {
      return Number(agent.replace(r, '$' + i));
    };
    return nu$1(group(1), group(2));
  };
  var detect$2 = function (versionRegexes, agent) {
    var cleanedAgent = String(agent).toLowerCase();
    if (versionRegexes.length === 0)
      return unknown$1();
    return find$2(versionRegexes, cleanedAgent);
  };
  var unknown$1 = function () {
    return nu$1(0, 0);
  };
  var nu$1 = function (major, minor) {
    return {
      major: major,
      minor: minor
    };
  };
  var $_ej0fxpk8jcun3z4x = {
    nu: nu$1,
    detect: detect$2,
    unknown: unknown$1
  };

  var edge = 'Edge';
  var chrome = 'Chrome';
  var ie = 'IE';
  var opera = 'Opera';
  var firefox = 'Firefox';
  var safari = 'Safari';
  var isBrowser = function (name, current) {
    return function () {
      return current === name;
    };
  };
  var unknown = function () {
    return nu({
      current: undefined,
      version: $_ej0fxpk8jcun3z4x.unknown()
    });
  };
  var nu = function (info) {
    var current = info.current;
    var version = info.version;
    return {
      current: current,
      version: version,
      isEdge: isBrowser(edge, current),
      isChrome: isBrowser(chrome, current),
      isIE: isBrowser(ie, current),
      isOpera: isBrowser(opera, current),
      isFirefox: isBrowser(firefox, current),
      isSafari: isBrowser(safari, current)
    };
  };
  var $_4931t4k7jcun3z4v = {
    unknown: unknown,
    nu: nu,
    edge: $_b55bxvjijcun3z24.constant(edge),
    chrome: $_b55bxvjijcun3z24.constant(chrome),
    ie: $_b55bxvjijcun3z24.constant(ie),
    opera: $_b55bxvjijcun3z24.constant(opera),
    firefox: $_b55bxvjijcun3z24.constant(firefox),
    safari: $_b55bxvjijcun3z24.constant(safari)
  };

  var windows = 'Windows';
  var ios = 'iOS';
  var android = 'Android';
  var linux = 'Linux';
  var osx = 'OSX';
  var solaris = 'Solaris';
  var freebsd = 'FreeBSD';
  var isOS = function (name, current) {
    return function () {
      return current === name;
    };
  };
  var unknown$2 = function () {
    return nu$2({
      current: undefined,
      version: $_ej0fxpk8jcun3z4x.unknown()
    });
  };
  var nu$2 = function (info) {
    var current = info.current;
    var version = info.version;
    return {
      current: current,
      version: version,
      isWindows: isOS(windows, current),
      isiOS: isOS(ios, current),
      isAndroid: isOS(android, current),
      isOSX: isOS(osx, current),
      isLinux: isOS(linux, current),
      isSolaris: isOS(solaris, current),
      isFreeBSD: isOS(freebsd, current)
    };
  };
  var $_ffxskhk9jcun3z4y = {
    unknown: unknown$2,
    nu: nu$2,
    windows: $_b55bxvjijcun3z24.constant(windows),
    ios: $_b55bxvjijcun3z24.constant(ios),
    android: $_b55bxvjijcun3z24.constant(android),
    linux: $_b55bxvjijcun3z24.constant(linux),
    osx: $_b55bxvjijcun3z24.constant(osx),
    solaris: $_b55bxvjijcun3z24.constant(solaris),
    freebsd: $_b55bxvjijcun3z24.constant(freebsd)
  };

  var DeviceType = function (os, browser, userAgent) {
    var isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
    var isiPhone = os.isiOS() && !isiPad;
    var isAndroid3 = os.isAndroid() && os.version.major === 3;
    var isAndroid4 = os.isAndroid() && os.version.major === 4;
    var isTablet = isiPad || isAndroid3 || isAndroid4 && /mobile/i.test(userAgent) === true;
    var isTouch = os.isiOS() || os.isAndroid();
    var isPhone = isTouch && !isTablet;
    var iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;
    return {
      isiPad: $_b55bxvjijcun3z24.constant(isiPad),
      isiPhone: $_b55bxvjijcun3z24.constant(isiPhone),
      isTablet: $_b55bxvjijcun3z24.constant(isTablet),
      isPhone: $_b55bxvjijcun3z24.constant(isPhone),
      isTouch: $_b55bxvjijcun3z24.constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: $_b55bxvjijcun3z24.constant(iOSwebview)
    };
  };

  var detect$3 = function (candidates, userAgent) {
    var agent = String(userAgent).toLowerCase();
    return $_cirynjgjcun3z1x.find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$3(browsers, userAgent).map(function (browser) {
      var version = $_ej0fxpk8jcun3z4x.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$3(oses, userAgent).map(function (os) {
      var version = $_ej0fxpk8jcun3z4x.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_bu9n9bkbjcun3z53 = {
    detectBrowser: detectBrowser,
    detectOs: detectOs
  };

  var addToStart = function (str, prefix) {
    return prefix + str;
  };
  var addToEnd = function (str, suffix) {
    return str + suffix;
  };
  var removeFromStart = function (str, numChars) {
    return str.substring(numChars);
  };
  var removeFromEnd = function (str, numChars) {
    return str.substring(0, str.length - numChars);
  };
  var $_ftlzhkkejcun3z5p = {
    addToStart: addToStart,
    addToEnd: addToEnd,
    removeFromStart: removeFromStart,
    removeFromEnd: removeFromEnd
  };

  var first = function (str, count) {
    return str.substr(0, count);
  };
  var last$1 = function (str, count) {
    return str.substr(str.length - count, str.length);
  };
  var head$1 = function (str) {
    return str === '' ? $_dx6m1ljhjcun3z22.none() : $_dx6m1ljhjcun3z22.some(str.substr(0, 1));
  };
  var tail = function (str) {
    return str === '' ? $_dx6m1ljhjcun3z22.none() : $_dx6m1ljhjcun3z22.some(str.substring(1));
  };
  var $_b08vpskfjcun3z5r = {
    first: first,
    last: last$1,
    head: head$1,
    tail: tail
  };

  var checkRange = function (str, substr, start) {
    if (substr === '')
      return true;
    if (str.length < substr.length)
      return false;
    var x = str.substr(start, start + substr.length);
    return x === substr;
  };
  var supplant = function (str, obj) {
    var isStringOrNumber = function (a) {
      var t = typeof a;
      return t === 'string' || t === 'number';
    };
    return str.replace(/\${([^{}]*)}/g, function (a, b) {
      var value = obj[b];
      return isStringOrNumber(value) ? value : a;
    });
  };
  var removeLeading = function (str, prefix) {
    return startsWith(str, prefix) ? $_ftlzhkkejcun3z5p.removeFromStart(str, prefix.length) : str;
  };
  var removeTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? $_ftlzhkkejcun3z5p.removeFromEnd(str, prefix.length) : str;
  };
  var ensureLeading = function (str, prefix) {
    return startsWith(str, prefix) ? str : $_ftlzhkkejcun3z5p.addToStart(str, prefix);
  };
  var ensureTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? str : $_ftlzhkkejcun3z5p.addToEnd(str, prefix);
  };
  var contains$2 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };
  var capitalize = function (str) {
    return $_b08vpskfjcun3z5r.head(str).bind(function (head) {
      return $_b08vpskfjcun3z5r.tail(str).map(function (tail) {
        return head.toUpperCase() + tail;
      });
    }).getOr(str);
  };
  var startsWith = function (str, prefix) {
    return checkRange(str, prefix, 0);
  };
  var endsWith = function (str, suffix) {
    return checkRange(str, suffix, str.length - suffix.length);
  };
  var trim = function (str) {
    return str.replace(/^\s+|\s+$/g, '');
  };
  var lTrim = function (str) {
    return str.replace(/^\s+/g, '');
  };
  var rTrim = function (str) {
    return str.replace(/\s+$/g, '');
  };
  var $_bs9f57kdjcun3z5b = {
    supplant: supplant,
    startsWith: startsWith,
    removeLeading: removeLeading,
    removeTrailing: removeTrailing,
    ensureLeading: ensureLeading,
    ensureTrailing: ensureTrailing,
    endsWith: endsWith,
    contains: contains$2,
    trim: trim,
    lTrim: lTrim,
    rTrim: rTrim,
    capitalize: capitalize
  };

  var normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;
  var checkContains = function (target) {
    return function (uastring) {
      return $_bs9f57kdjcun3z5b.contains(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = $_bs9f57kdjcun3z5b.contains(uastring, 'edge/') && $_bs9f57kdjcun3z5b.contains(uastring, 'chrome') && $_bs9f57kdjcun3z5b.contains(uastring, 'safari') && $_bs9f57kdjcun3z5b.contains(uastring, 'applewebkit');
        return monstrosity;
      }
    },
    {
      name: 'Chrome',
      versionRegexes: [
        /.*?chrome\/([0-9]+)\.([0-9]+).*/,
        normalVersionRegex
      ],
      search: function (uastring) {
        return $_bs9f57kdjcun3z5b.contains(uastring, 'chrome') && !$_bs9f57kdjcun3z5b.contains(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return $_bs9f57kdjcun3z5b.contains(uastring, 'msie') || $_bs9f57kdjcun3z5b.contains(uastring, 'trident');
      }
    },
    {
      name: 'Opera',
      versionRegexes: [
        normalVersionRegex,
        /.*?opera\/([0-9]+)\.([0-9]+).*/
      ],
      search: checkContains('opera')
    },
    {
      name: 'Firefox',
      versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
      search: checkContains('firefox')
    },
    {
      name: 'Safari',
      versionRegexes: [
        normalVersionRegex,
        /.*?cpu os ([0-9]+)_([0-9]+).*/
      ],
      search: function (uastring) {
        return ($_bs9f57kdjcun3z5b.contains(uastring, 'safari') || $_bs9f57kdjcun3z5b.contains(uastring, 'mobile/')) && $_bs9f57kdjcun3z5b.contains(uastring, 'applewebkit');
      }
    }
  ];
  var oses = [
    {
      name: 'Windows',
      search: checkContains('win'),
      versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
    },
    {
      name: 'iOS',
      search: function (uastring) {
        return $_bs9f57kdjcun3z5b.contains(uastring, 'iphone') || $_bs9f57kdjcun3z5b.contains(uastring, 'ipad');
      },
      versionRegexes: [
        /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
        /.*cpu os ([0-9]+)_([0-9]+).*/,
        /.*cpu iphone os ([0-9]+)_([0-9]+).*/
      ]
    },
    {
      name: 'Android',
      search: checkContains('android'),
      versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
    },
    {
      name: 'OSX',
      search: checkContains('os x'),
      versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
    },
    {
      name: 'Linux',
      search: checkContains('linux'),
      versionRegexes: []
    },
    {
      name: 'Solaris',
      search: checkContains('sunos'),
      versionRegexes: []
    },
    {
      name: 'FreeBSD',
      search: checkContains('freebsd'),
      versionRegexes: []
    }
  ];
  var $_ajkvi8kcjcun3z55 = {
    browsers: $_b55bxvjijcun3z24.constant(browsers),
    oses: $_b55bxvjijcun3z24.constant(oses)
  };

  var detect$1 = function (userAgent) {
    var browsers = $_ajkvi8kcjcun3z55.browsers();
    var oses = $_ajkvi8kcjcun3z55.oses();
    var browser = $_bu9n9bkbjcun3z53.detectBrowser(browsers, userAgent).fold($_4931t4k7jcun3z4v.unknown, $_4931t4k7jcun3z4v.nu);
    var os = $_bu9n9bkbjcun3z53.detectOs(oses, userAgent).fold($_ffxskhk9jcun3z4y.unknown, $_ffxskhk9jcun3z4y.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_bnciiuk6jcun3z4u = { detect: detect$1 };

  var detect = $_fokurjk5jcun3z4t.cached(function () {
    var userAgent = navigator.userAgent;
    return $_bnciiuk6jcun3z4u.detect(userAgent);
  });
  var $_d4zrqkk4jcun3z4r = { detect: detect };

  var eq = function (e1, e2) {
    return e1.dom() === e2.dom();
  };
  var isEqualNode = function (e1, e2) {
    return e1.dom().isEqualNode(e2.dom());
  };
  var member = function (element, elements) {
    return $_cirynjgjcun3z1x.exists(elements, $_b55bxvjijcun3z24.curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_6xkc40k0jcun3z4m.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_d4zrqkk4jcun3z4r.detect().browser;
  var contains$1 = browser.isIE() ? ieContains : regularContains;
  var $_bw6rudjzjcun3z4g = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains$1,
    is: $_aeohlsjujcun3z3x.is
  };

  var owner = function (element) {
    return $_cycgn2jvjcun3z41.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    var doc = owner(element);
    return $_cycgn2jvjcun3z41.fromDom(doc.dom().documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return $_cycgn2jvjcun3z41.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return $_dx6m1ljhjcun3z22.from(dom.parentNode).map($_cycgn2jvjcun3z41.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return $_cirynjgjcun3z1x.findIndex(kin, function (elem) {
        return $_bw6rudjzjcun3z4g.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = $_5lospcjpjcun3z2w.isFunction(isRoot) ? isRoot : $_b55bxvjijcun3z24.constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = $_cycgn2jvjcun3z41.fromDom(rawParent);
      ret.push(parent);
      if (stop(parent) === true)
        break;
      else
        dom = rawParent;
    }
    return ret;
  };
  var siblings = function (element) {
    var filterSelf = function (elements) {
      return $_cirynjgjcun3z1x.filter(elements, function (x) {
        return !$_bw6rudjzjcun3z4g.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return $_dx6m1ljhjcun3z22.from(dom.offsetParent).map($_cycgn2jvjcun3z41.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return $_dx6m1ljhjcun3z22.from(dom.previousSibling).map($_cycgn2jvjcun3z41.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return $_dx6m1ljhjcun3z22.from(dom.nextSibling).map($_cycgn2jvjcun3z41.fromDom);
  };
  var prevSiblings = function (element) {
    return $_cirynjgjcun3z1x.reverse($_8tlirhjyjcun3z4f.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_8tlirhjyjcun3z4f.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return $_cirynjgjcun3z1x.map(dom.childNodes, $_cycgn2jvjcun3z41.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return $_dx6m1ljhjcun3z22.from(children[index]).map($_cycgn2jvjcun3z41.fromDom);
  };
  var firstChild = function (element) {
    return child(element, 0);
  };
  var lastChild = function (element) {
    return child(element, element.dom().childNodes.length - 1);
  };
  var childNodesCount = function (element) {
    return element.dom().childNodes.length;
  };
  var hasChildNodes = function (element) {
    return element.dom().hasChildNodes();
  };
  var spot = $_asy2ehjljcun3z2p.immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_9elq0ajxjcun3z47 = {
    owner: owner,
    defaultView: defaultView,
    documentElement: documentElement,
    parent: parent,
    findIndex: findIndex$1,
    parents: parents,
    siblings: siblings,
    prevSibling: prevSibling,
    offsetParent: offsetParent,
    prevSiblings: prevSiblings,
    nextSibling: nextSibling,
    nextSiblings: nextSiblings,
    children: children,
    child: child,
    firstChild: firstChild,
    lastChild: lastChild,
    childNodesCount: childNodesCount,
    hasChildNodes: hasChildNodes,
    leaf: leaf
  };

  var firstLayer = function (scope, selector) {
    return filterFirstLayer(scope, selector, $_b55bxvjijcun3z24.constant(true));
  };
  var filterFirstLayer = function (scope, selector, predicate) {
    return $_cirynjgjcun3z1x.bind($_9elq0ajxjcun3z47.children(scope), function (x) {
      return $_aeohlsjujcun3z3x.is(x, selector) ? predicate(x) ? [x] : [] : filterFirstLayer(x, selector, predicate);
    });
  };
  var $_b5upsnjtjcun3z3q = {
    firstLayer: firstLayer,
    filterFirstLayer: filterFirstLayer
  };

  var name = function (element) {
    var r = element.dom().nodeName;
    return r.toLowerCase();
  };
  var type = function (element) {
    return element.dom().nodeType;
  };
  var value = function (element) {
    return element.dom().nodeValue;
  };
  var isType$1 = function (t) {
    return function (element) {
      return type(element) === t;
    };
  };
  var isComment = function (element) {
    return type(element) === $_cwmfqmjwjcun3z46.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_cwmfqmjwjcun3z46.ELEMENT);
  var isText = isType$1($_cwmfqmjwjcun3z46.TEXT);
  var isDocument = isType$1($_cwmfqmjwjcun3z46.DOCUMENT);
  var $_148ei0khjcun3z5z = {
    name: name,
    type: type,
    value: value,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var rawSet = function (dom, key, value) {
    if ($_5lospcjpjcun3z2w.isString(value) || $_5lospcjpjcun3z2w.isBoolean(value) || $_5lospcjpjcun3z2w.isNumber(value)) {
      dom.setAttribute(key, value + '');
    } else {
      console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
      throw new Error('Attribute value was not simple');
    }
  };
  var set = function (element, key, value) {
    rawSet(element.dom(), key, value);
  };
  var setAll = function (element, attrs) {
    var dom = element.dom();
    $_ds59i8jkjcun3z2m.each(attrs, function (v, k) {
      rawSet(dom, k, v);
    });
  };
  var get = function (element, key) {
    var v = element.dom().getAttribute(key);
    return v === null ? undefined : v;
  };
  var has = function (element, key) {
    var dom = element.dom();
    return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
  };
  var remove = function (element, key) {
    element.dom().removeAttribute(key);
  };
  var hasNone = function (element) {
    var attrs = element.dom().attributes;
    return attrs === undefined || attrs === null || attrs.length === 0;
  };
  var clone = function (element) {
    return $_cirynjgjcun3z1x.foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has(source, attr) && !has(destination, attr))
      set(destination, attr, get(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_148ei0khjcun3z5z.isElement(source) || !$_148ei0khjcun3z5z.isElement(destination))
      return;
    $_cirynjgjcun3z1x.each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_5qpsynkgjcun3z5t = {
    clone: clone,
    set: set,
    setAll: setAll,
    get: get,
    has: has,
    remove: remove,
    hasNone: hasNone,
    transfer: transfer
  };

  var inBody = function (element) {
    var dom = $_148ei0khjcun3z5z.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = $_fokurjk5jcun3z4t.cached(function () {
    return getBody($_cycgn2jvjcun3z41.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return $_cycgn2jvjcun3z41.fromDom(body);
  };
  var $_2wq0b9kkjcun3z65 = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var all$2 = function (predicate) {
    return descendants$1($_2wq0b9kkjcun3z65.body(), predicate);
  };
  var ancestors$1 = function (scope, predicate, isRoot) {
    return $_cirynjgjcun3z1x.filter($_9elq0ajxjcun3z47.parents(scope, isRoot), predicate);
  };
  var siblings$2 = function (scope, predicate) {
    return $_cirynjgjcun3z1x.filter($_9elq0ajxjcun3z47.siblings(scope), predicate);
  };
  var children$2 = function (scope, predicate) {
    return $_cirynjgjcun3z1x.filter($_9elq0ajxjcun3z47.children(scope), predicate);
  };
  var descendants$1 = function (scope, predicate) {
    var result = [];
    $_cirynjgjcun3z1x.each($_9elq0ajxjcun3z47.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants$1(x, predicate));
    });
    return result;
  };
  var $_262p2wkjjcun3z62 = {
    all: all$2,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  var all$1 = function (selector) {
    return $_aeohlsjujcun3z3x.all(selector);
  };
  var ancestors = function (scope, selector, isRoot) {
    return $_262p2wkjjcun3z62.ancestors(scope, function (e) {
      return $_aeohlsjujcun3z3x.is(e, selector);
    }, isRoot);
  };
  var siblings$1 = function (scope, selector) {
    return $_262p2wkjjcun3z62.siblings(scope, function (e) {
      return $_aeohlsjujcun3z3x.is(e, selector);
    });
  };
  var children$1 = function (scope, selector) {
    return $_262p2wkjjcun3z62.children(scope, function (e) {
      return $_aeohlsjujcun3z3x.is(e, selector);
    });
  };
  var descendants = function (scope, selector) {
    return $_aeohlsjujcun3z3x.all(selector, scope);
  };
  var $_7pi6mukijcun3z61 = {
    all: all$1,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var ClosestOrAncestor = function (is, ancestor, scope, a, isRoot) {
    return is(scope, a) ? $_dx6m1ljhjcun3z22.some(scope) : $_5lospcjpjcun3z2w.isFunction(isRoot) && isRoot(scope) ? $_dx6m1ljhjcun3z22.none() : ancestor(scope, a, isRoot);
  };

  var first$2 = function (predicate) {
    return descendant$1($_2wq0b9kkjcun3z65.body(), predicate);
  };
  var ancestor$1 = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = $_5lospcjpjcun3z2w.isFunction(isRoot) ? isRoot : $_b55bxvjijcun3z24.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_cycgn2jvjcun3z41.fromDom(element);
      if (predicate(el))
        return $_dx6m1ljhjcun3z22.some(el);
      else if (stop(el))
        break;
    }
    return $_dx6m1ljhjcun3z22.none();
  };
  var closest$1 = function (scope, predicate, isRoot) {
    var is = function (scope) {
      return predicate(scope);
    };
    return ClosestOrAncestor(is, ancestor$1, scope, predicate, isRoot);
  };
  var sibling$1 = function (scope, predicate) {
    var element = scope.dom();
    if (!element.parentNode)
      return $_dx6m1ljhjcun3z22.none();
    return child$2($_cycgn2jvjcun3z41.fromDom(element.parentNode), function (x) {
      return !$_bw6rudjzjcun3z4g.eq(scope, x) && predicate(x);
    });
  };
  var child$2 = function (scope, predicate) {
    var result = $_cirynjgjcun3z1x.find(scope.dom().childNodes, $_b55bxvjijcun3z24.compose(predicate, $_cycgn2jvjcun3z41.fromDom));
    return result.map($_cycgn2jvjcun3z41.fromDom);
  };
  var descendant$1 = function (scope, predicate) {
    var descend = function (element) {
      for (var i = 0; i < element.childNodes.length; i++) {
        if (predicate($_cycgn2jvjcun3z41.fromDom(element.childNodes[i])))
          return $_dx6m1ljhjcun3z22.some($_cycgn2jvjcun3z41.fromDom(element.childNodes[i]));
        var res = descend(element.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return $_dx6m1ljhjcun3z22.none();
    };
    return descend(scope.dom());
  };
  var $_8cztmfkmjcun3z69 = {
    first: first$2,
    ancestor: ancestor$1,
    closest: closest$1,
    sibling: sibling$1,
    child: child$2,
    descendant: descendant$1
  };

  var first$1 = function (selector) {
    return $_aeohlsjujcun3z3x.one(selector);
  };
  var ancestor = function (scope, selector, isRoot) {
    return $_8cztmfkmjcun3z69.ancestor(scope, function (e) {
      return $_aeohlsjujcun3z3x.is(e, selector);
    }, isRoot);
  };
  var sibling = function (scope, selector) {
    return $_8cztmfkmjcun3z69.sibling(scope, function (e) {
      return $_aeohlsjujcun3z3x.is(e, selector);
    });
  };
  var child$1 = function (scope, selector) {
    return $_8cztmfkmjcun3z69.child(scope, function (e) {
      return $_aeohlsjujcun3z3x.is(e, selector);
    });
  };
  var descendant = function (scope, selector) {
    return $_aeohlsjujcun3z3x.one(selector, scope);
  };
  var closest = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_aeohlsjujcun3z3x.is, ancestor, scope, selector, isRoot);
  };
  var $_avmzmkkljcun3z67 = {
    first: first$1,
    ancestor: ancestor,
    sibling: sibling,
    child: child$1,
    descendant: descendant,
    closest: closest
  };

  var lookup = function (tags, element, _isRoot) {
    var isRoot = _isRoot !== undefined ? _isRoot : $_b55bxvjijcun3z24.constant(false);
    if (isRoot(element))
      return $_dx6m1ljhjcun3z22.none();
    if ($_cirynjgjcun3z1x.contains(tags, $_148ei0khjcun3z5z.name(element)))
      return $_dx6m1ljhjcun3z22.some(element);
    var isRootOrUpperTable = function (element) {
      return $_aeohlsjujcun3z3x.is(element, 'table') || isRoot(element);
    };
    return $_avmzmkkljcun3z67.ancestor(element, tags.join(','), isRootOrUpperTable);
  };
  var cell = function (element, isRoot) {
    return lookup([
      'td',
      'th'
    ], element, isRoot);
  };
  var cells = function (ancestor) {
    return $_b5upsnjtjcun3z3q.firstLayer(ancestor, 'th,td');
  };
  var notCell = function (element, isRoot) {
    return lookup([
      'caption',
      'tr',
      'tbody',
      'tfoot',
      'thead'
    ], element, isRoot);
  };
  var neighbours = function (selector, element) {
    return $_9elq0ajxjcun3z47.parent(element).map(function (parent) {
      return $_7pi6mukijcun3z61.children(parent, selector);
    });
  };
  var neighbourCells = $_b55bxvjijcun3z24.curry(neighbours, 'th,td');
  var neighbourRows = $_b55bxvjijcun3z24.curry(neighbours, 'tr');
  var firstCell = function (ancestor) {
    return $_avmzmkkljcun3z67.descendant(ancestor, 'th,td');
  };
  var table = function (element, isRoot) {
    return $_avmzmkkljcun3z67.closest(element, 'table', isRoot);
  };
  var row = function (element, isRoot) {
    return lookup(['tr'], element, isRoot);
  };
  var rows = function (ancestor) {
    return $_b5upsnjtjcun3z3q.firstLayer(ancestor, 'tr');
  };
  var attr = function (element, property) {
    return parseInt($_5qpsynkgjcun3z5t.get(element, property), 10);
  };
  var grid$1 = function (element, rowProp, colProp) {
    var rows = attr(element, rowProp);
    var cols = attr(element, colProp);
    return $_bt8aj2jrjcun3z34.grid(rows, cols);
  };
  var $_b7drosjsjcun3z37 = {
    cell: cell,
    firstCell: firstCell,
    cells: cells,
    neighbourCells: neighbourCells,
    table: table,
    row: row,
    rows: rows,
    notCell: notCell,
    neighbourRows: neighbourRows,
    attr: attr,
    grid: grid$1
  };

  var fromTable = function (table) {
    var rows = $_b7drosjsjcun3z37.rows(table);
    return $_cirynjgjcun3z1x.map(rows, function (row) {
      var element = row;
      var parent = $_9elq0ajxjcun3z47.parent(element);
      var parentSection = parent.bind(function (parent) {
        var parentName = $_148ei0khjcun3z5z.name(parent);
        return parentName === 'tfoot' || parentName === 'thead' || parentName === 'tbody' ? parentName : 'tbody';
      });
      var cells = $_cirynjgjcun3z1x.map($_b7drosjsjcun3z37.cells(row), function (cell) {
        var rowspan = $_5qpsynkgjcun3z5t.has(cell, 'rowspan') ? parseInt($_5qpsynkgjcun3z5t.get(cell, 'rowspan'), 10) : 1;
        var colspan = $_5qpsynkgjcun3z5t.has(cell, 'colspan') ? parseInt($_5qpsynkgjcun3z5t.get(cell, 'colspan'), 10) : 1;
        return $_bt8aj2jrjcun3z34.detail(cell, rowspan, colspan);
      });
      return $_bt8aj2jrjcun3z34.rowdata(element, cells, parentSection);
    });
  };
  var fromPastedRows = function (rows, example) {
    return $_cirynjgjcun3z1x.map(rows, function (row) {
      var cells = $_cirynjgjcun3z1x.map($_b7drosjsjcun3z37.cells(row), function (cell) {
        var rowspan = $_5qpsynkgjcun3z5t.has(cell, 'rowspan') ? parseInt($_5qpsynkgjcun3z5t.get(cell, 'rowspan'), 10) : 1;
        var colspan = $_5qpsynkgjcun3z5t.has(cell, 'colspan') ? parseInt($_5qpsynkgjcun3z5t.get(cell, 'colspan'), 10) : 1;
        return $_bt8aj2jrjcun3z34.detail(cell, rowspan, colspan);
      });
      return $_bt8aj2jrjcun3z34.rowdata(row, cells, example.section());
    });
  };
  var $_cwbx7zjqjcun3z2x = {
    fromTable: fromTable,
    fromPastedRows: fromPastedRows
  };

  var key = function (row, column) {
    return row + ',' + column;
  };
  var getAt = function (warehouse, row, column) {
    var raw = warehouse.access()[key(row, column)];
    return raw !== undefined ? $_dx6m1ljhjcun3z22.some(raw) : $_dx6m1ljhjcun3z22.none();
  };
  var findItem = function (warehouse, item, comparator) {
    var filtered = filterItems(warehouse, function (detail) {
      return comparator(item, detail.element());
    });
    return filtered.length > 0 ? $_dx6m1ljhjcun3z22.some(filtered[0]) : $_dx6m1ljhjcun3z22.none();
  };
  var filterItems = function (warehouse, predicate) {
    var all = $_cirynjgjcun3z1x.bind(warehouse.all(), function (r) {
      return r.cells();
    });
    return $_cirynjgjcun3z1x.filter(all, predicate);
  };
  var generate = function (list) {
    var access = {};
    var cells = [];
    var maxRows = list.length;
    var maxColumns = 0;
    $_cirynjgjcun3z1x.each(list, function (details, r) {
      var currentRow = [];
      $_cirynjgjcun3z1x.each(details.cells(), function (detail, c) {
        var start = 0;
        while (access[key(r, start)] !== undefined) {
          start++;
        }
        var current = $_bt8aj2jrjcun3z34.extended(detail.element(), detail.rowspan(), detail.colspan(), r, start);
        for (var i = 0; i < detail.colspan(); i++) {
          for (var j = 0; j < detail.rowspan(); j++) {
            var cr = r + j;
            var cc = start + i;
            var newpos = key(cr, cc);
            access[newpos] = current;
            maxColumns = Math.max(maxColumns, cc + 1);
          }
        }
        currentRow.push(current);
      });
      cells.push($_bt8aj2jrjcun3z34.rowdata(details.element(), currentRow, details.section()));
    });
    var grid = $_bt8aj2jrjcun3z34.grid(maxRows, maxColumns);
    return {
      grid: $_b55bxvjijcun3z24.constant(grid),
      access: $_b55bxvjijcun3z24.constant(access),
      all: $_b55bxvjijcun3z24.constant(cells)
    };
  };
  var justCells = function (warehouse) {
    var rows = $_cirynjgjcun3z1x.map(warehouse.all(), function (w) {
      return w.cells();
    });
    return $_cirynjgjcun3z1x.flatten(rows);
  };
  var $_dxqn88kojcun3z6j = {
    generate: generate,
    getAt: getAt,
    findItem: findItem,
    filterItems: filterItems,
    justCells: justCells
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_ao69gnkqjcun3z6x = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!$_5lospcjpjcun3z2w.isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_ao69gnkqjcun3z6x.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_ao69gnkqjcun3z6x.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$1 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    $_ds59i8jkjcun3z2m.each(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    $_ds59i8jkjcun3z2m.each(css, function (v, k) {
      v.fold(function () {
        internalRemove(dom, k);
      }, function (value) {
        internalSet(dom, k, value);
      });
    });
  };
  var get$1 = function (element, property) {
    var dom = element.dom();
    var styles = window.getComputedStyle(dom);
    var r = styles.getPropertyValue(property);
    var v = r === '' && !$_2wq0b9kkjcun3z65.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_ao69gnkqjcun3z6x.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
  };
  var getRaw = function (element, property) {
    var dom = element.dom();
    var raw = getUnsafeProperty(dom, property);
    return $_dx6m1ljhjcun3z22.from(raw).filter(function (r) {
      return r.length > 0;
    });
  };
  var getAllRaw = function (element) {
    var css = {};
    var dom = element.dom();
    if ($_ao69gnkqjcun3z6x.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = $_cycgn2jvjcun3z41.fromTag(tag);
    set$1(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$1 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_5qpsynkgjcun3z5t.has(element, 'style') && $_bs9f57kdjcun3z5b.trim($_5qpsynkgjcun3z5t.get(element, 'style')) === '') {
      $_5qpsynkgjcun3z5t.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_5qpsynkgjcun3z5t.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_5qpsynkgjcun3z5t.remove : $_5qpsynkgjcun3z5t.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_ao69gnkqjcun3z6x.isSupported(sourceDom) && $_ao69gnkqjcun3z6x.isSupported(targetDom)) {
      targetDom.style.cssText = sourceDom.style.cssText;
    }
  };
  var reflow = function (e) {
    return e.dom().offsetWidth;
  };
  var transferOne$1 = function (source, destination, style) {
    getRaw(source, style).each(function (value) {
      if (getRaw(destination, style).isNone())
        set$1(destination, style, value);
    });
  };
  var transfer$1 = function (source, destination, styles) {
    if (!$_148ei0khjcun3z5z.isElement(source) || !$_148ei0khjcun3z5z.isElement(destination))
      return;
    $_cirynjgjcun3z1x.each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_7vp61rkpjcun3z6o = {
    copy: copy,
    set: set$1,
    preserve: preserve,
    setAll: setAll$1,
    setOptions: setOptions,
    remove: remove$1,
    get: get$1,
    getRaw: getRaw,
    getAllRaw: getAllRaw,
    isValidValue: isValidValue,
    reflow: reflow,
    transfer: transfer$1
  };

  var before = function (marker, element) {
    var parent = $_9elq0ajxjcun3z47.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_9elq0ajxjcun3z47.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_9elq0ajxjcun3z47.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_9elq0ajxjcun3z47.firstChild(parent);
    firstChild.fold(function () {
      append(parent, element);
    }, function (v) {
      parent.dom().insertBefore(element.dom(), v.dom());
    });
  };
  var append = function (parent, element) {
    parent.dom().appendChild(element.dom());
  };
  var appendAt = function (parent, element, index) {
    $_9elq0ajxjcun3z47.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_f610dckrjcun3z6y = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap
  };

  var before$1 = function (marker, elements) {
    $_cirynjgjcun3z1x.each(elements, function (x) {
      $_f610dckrjcun3z6y.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    $_cirynjgjcun3z1x.each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_f610dckrjcun3z6y.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    $_cirynjgjcun3z1x.each(elements.slice().reverse(), function (x) {
      $_f610dckrjcun3z6y.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    $_cirynjgjcun3z1x.each(elements, function (x) {
      $_f610dckrjcun3z6y.append(parent, x);
    });
  };
  var $_47qp7xktjcun3z72 = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    $_cirynjgjcun3z1x.each($_9elq0ajxjcun3z47.children(element), function (rogue) {
      remove$2(rogue);
    });
  };
  var remove$2 = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_9elq0ajxjcun3z47.children(wrapper);
    if (children.length > 0)
      $_47qp7xktjcun3z72.before(wrapper, children);
    remove$2(wrapper);
  };
  var $_6u25ksksjcun3z70 = {
    empty: empty,
    remove: remove$2,
    unwrap: unwrap
  };

  var stats = $_asy2ehjljcun3z2p.immutable('minRow', 'minCol', 'maxRow', 'maxCol');
  var findSelectedStats = function (house, isSelected) {
    var totalColumns = house.grid().columns();
    var totalRows = house.grid().rows();
    var minRow = totalRows;
    var minCol = totalColumns;
    var maxRow = 0;
    var maxCol = 0;
    $_ds59i8jkjcun3z2m.each(house.access(), function (detail) {
      if (isSelected(detail)) {
        var startRow = detail.row();
        var endRow = startRow + detail.rowspan() - 1;
        var startCol = detail.column();
        var endCol = startCol + detail.colspan() - 1;
        if (startRow < minRow)
          minRow = startRow;
        else if (endRow > maxRow)
          maxRow = endRow;
        if (startCol < minCol)
          minCol = startCol;
        else if (endCol > maxCol)
          maxCol = endCol;
      }
    });
    return stats(minRow, minCol, maxRow, maxCol);
  };
  var makeCell = function (list, seenSelected, rowIndex) {
    var row = list[rowIndex].element();
    var td = $_cycgn2jvjcun3z41.fromTag('td');
    $_f610dckrjcun3z6y.append(td, $_cycgn2jvjcun3z41.fromTag('br'));
    var f = seenSelected ? $_f610dckrjcun3z6y.append : $_f610dckrjcun3z6y.prepend;
    f(row, td);
  };
  var fillInGaps = function (list, house, stats, isSelected) {
    var totalColumns = house.grid().columns();
    var totalRows = house.grid().rows();
    for (var i = 0; i < totalRows; i++) {
      var seenSelected = false;
      for (var j = 0; j < totalColumns; j++) {
        if (!(i < stats.minRow() || i > stats.maxRow() || j < stats.minCol() || j > stats.maxCol())) {
          var needCell = $_dxqn88kojcun3z6j.getAt(house, i, j).filter(isSelected).isNone();
          if (needCell)
            makeCell(list, seenSelected, i);
          else
            seenSelected = true;
        }
      }
    }
  };
  var clean = function (table, stats) {
    var emptyRows = $_cirynjgjcun3z1x.filter($_b5upsnjtjcun3z3q.firstLayer(table, 'tr'), function (row) {
      return row.dom().childElementCount === 0;
    });
    $_cirynjgjcun3z1x.each(emptyRows, $_6u25ksksjcun3z70.remove);
    if (stats.minCol() === stats.maxCol() || stats.minRow() === stats.maxRow()) {
      $_cirynjgjcun3z1x.each($_b5upsnjtjcun3z3q.firstLayer(table, 'th,td'), function (cell) {
        $_5qpsynkgjcun3z5t.remove(cell, 'rowspan');
        $_5qpsynkgjcun3z5t.remove(cell, 'colspan');
      });
    }
    $_5qpsynkgjcun3z5t.remove(table, 'width');
    $_5qpsynkgjcun3z5t.remove(table, 'height');
    $_7vp61rkpjcun3z6o.remove(table, 'width');
    $_7vp61rkpjcun3z6o.remove(table, 'height');
  };
  var extract = function (table, selectedSelector) {
    var isSelected = function (detail) {
      return $_aeohlsjujcun3z3x.is(detail.element(), selectedSelector);
    };
    var list = $_cwbx7zjqjcun3z2x.fromTable(table);
    var house = $_dxqn88kojcun3z6j.generate(list);
    var stats = findSelectedStats(house, isSelected);
    var selector = 'th:not(' + selectedSelector + ')' + ',td:not(' + selectedSelector + ')';
    var unselectedCells = $_b5upsnjtjcun3z3q.filterFirstLayer(table, 'th,td', function (cell) {
      return $_aeohlsjujcun3z3x.is(cell, selector);
    });
    $_cirynjgjcun3z1x.each(unselectedCells, $_6u25ksksjcun3z70.remove);
    fillInGaps(list, house, stats, isSelected);
    clean(table, stats);
    return table;
  };
  var $_e14a23jjjcun3z28 = { extract: extract };

  var clone$1 = function (original, deep) {
    return $_cycgn2jvjcun3z41.fromDom(original.dom().cloneNode(deep));
  };
  var shallow = function (original) {
    return clone$1(original, false);
  };
  var deep = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = $_cycgn2jvjcun3z41.fromTag(tag);
    var attributes = $_5qpsynkgjcun3z5t.clone(original);
    $_5qpsynkgjcun3z5t.setAll(nu, attributes);
    return nu;
  };
  var copy$1 = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_9elq0ajxjcun3z47.children(deep(original));
    $_47qp7xktjcun3z72.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_f610dckrjcun3z6y.before(original, nu);
    var children = $_9elq0ajxjcun3z47.children(original);
    $_47qp7xktjcun3z72.append(nu, children);
    $_6u25ksksjcun3z70.remove(original);
    return nu;
  };
  var $_367bwxkvjcun3z7t = {
    shallow: shallow,
    shallowAs: shallowAs,
    deep: deep,
    copy: copy$1,
    mutate: mutate
  };

  var NodeValue = function (is, name) {
    var get = function (element) {
      if (!is(element))
        throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
      return getOption(element).getOr('');
    };
    var getOptionIE10 = function (element) {
      try {
        return getOptionSafe(element);
      } catch (e) {
        return $_dx6m1ljhjcun3z22.none();
      }
    };
    var getOptionSafe = function (element) {
      return is(element) ? $_dx6m1ljhjcun3z22.from(element.dom().nodeValue) : $_dx6m1ljhjcun3z22.none();
    };
    var browser = $_d4zrqkk4jcun3z4r.detect().browser;
    var getOption = browser.isIE() && browser.version.major === 10 ? getOptionIE10 : getOptionSafe;
    var set = function (element, value) {
      if (!is(element))
        throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
      element.dom().nodeValue = value;
    };
    return {
      get: get,
      getOption: getOption,
      set: set
    };
  };

  var api = NodeValue($_148ei0khjcun3z5z.isText, 'text');
  var get$2 = function (element) {
    return api.get(element);
  };
  var getOption = function (element) {
    return api.getOption(element);
  };
  var set$2 = function (element, value) {
    api.set(element, value);
  };
  var $_b4faswkyjcun3z84 = {
    get: get$2,
    getOption: getOption,
    set: set$2
  };

  var getEnd = function (element) {
    return $_148ei0khjcun3z5z.name(element) === 'img' ? 1 : $_b4faswkyjcun3z84.getOption(element).fold(function () {
      return $_9elq0ajxjcun3z47.children(element).length;
    }, function (v) {
      return v.length;
    });
  };
  var isEnd = function (element, offset) {
    return getEnd(element) === offset;
  };
  var isStart = function (element, offset) {
    return offset === 0;
  };
  var NBSP = '\xA0';
  var isTextNodeWithCursorPosition = function (el) {
    return $_b4faswkyjcun3z84.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || $_cirynjgjcun3z1x.contains(elementsWithCursorPosition, $_148ei0khjcun3z5z.name(elem));
  };
  var $_alw4qlkxjcun3z80 = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var first$3 = function (element) {
    return $_8cztmfkmjcun3z69.descendant(element, $_alw4qlkxjcun3z80.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_alw4qlkxjcun3z80.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_9elq0ajxjcun3z47.children(element);
      for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (predicate(child))
          return $_dx6m1ljhjcun3z22.some(child);
        var res = descend(child);
        if (res.isSome())
          return res;
      }
      return $_dx6m1ljhjcun3z22.none();
    };
    return descend(scope);
  };
  var $_1thrsskwjcun3z7w = {
    first: first$3,
    last: last$2
  };

  var cell$1 = function () {
    var td = $_cycgn2jvjcun3z41.fromTag('td');
    $_f610dckrjcun3z6y.append(td, $_cycgn2jvjcun3z41.fromTag('br'));
    return td;
  };
  var replace = function (cell, tag, attrs) {
    var replica = $_367bwxkvjcun3z7t.copy(cell, tag);
    $_ds59i8jkjcun3z2m.each(attrs, function (v, k) {
      if (v === null)
        $_5qpsynkgjcun3z5t.remove(replica, k);
      else
        $_5qpsynkgjcun3z5t.set(replica, k, v);
    });
    return replica;
  };
  var pasteReplace = function (cellContent) {
    return cellContent;
  };
  var newRow = function (doc) {
    return function () {
      return $_cycgn2jvjcun3z41.fromTag('tr', doc.dom());
    };
  };
  var cloneFormats = function (oldCell, newCell, formats) {
    var first = $_1thrsskwjcun3z7w.first(oldCell);
    return first.map(function (firstText) {
      var formatSelector = formats.join(',');
      var parents = $_7pi6mukijcun3z61.ancestors(firstText, formatSelector, function (element) {
        return $_bw6rudjzjcun3z4g.eq(element, oldCell);
      });
      return $_cirynjgjcun3z1x.foldr(parents, function (last, parent) {
        var clonedFormat = $_367bwxkvjcun3z7t.shallow(parent);
        $_f610dckrjcun3z6y.append(last, clonedFormat);
        return clonedFormat;
      }, newCell);
    }).getOr(newCell);
  };
  var cellOperations = function (mutate, doc, formatsToClone) {
    var newCell = function (prev) {
      var doc = $_9elq0ajxjcun3z47.owner(prev.element());
      var td = $_cycgn2jvjcun3z41.fromTag($_148ei0khjcun3z5z.name(prev.element()), doc.dom());
      var formats = formatsToClone.getOr([
        'strong',
        'em',
        'b',
        'i',
        'span',
        'font',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'div'
      ]);
      var lastNode = formats.length > 0 ? cloneFormats(prev.element(), td, formats) : td;
      $_f610dckrjcun3z6y.append(lastNode, $_cycgn2jvjcun3z41.fromTag('br'));
      $_7vp61rkpjcun3z6o.copy(prev.element(), td);
      $_7vp61rkpjcun3z6o.remove(td, 'height');
      if (prev.colspan() !== 1)
        $_7vp61rkpjcun3z6o.remove(prev.element(), 'width');
      mutate(prev.element(), td);
      return td;
    };
    return {
      row: newRow(doc),
      cell: newCell,
      replace: replace,
      gap: cell$1
    };
  };
  var paste = function (doc) {
    return {
      row: newRow(doc),
      cell: cell$1,
      replace: pasteReplace,
      gap: cell$1
    };
  };
  var $_6ldhx1kujcun3z76 = {
    cellOperations: cellOperations,
    paste: paste
  };

  var fromHtml$1 = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    return $_9elq0ajxjcun3z47.children($_cycgn2jvjcun3z41.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return $_cirynjgjcun3z1x.map(tags, function (x) {
      return $_cycgn2jvjcun3z41.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return $_cirynjgjcun3z1x.map(texts, function (x) {
      return $_cycgn2jvjcun3z41.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return $_cirynjgjcun3z1x.map(nodes, $_cycgn2jvjcun3z41.fromDom);
  };
  var $_g83pk4l0jcun3z8c = {
    fromHtml: fromHtml$1,
    fromTags: fromTags,
    fromText: fromText$1,
    fromDom: fromDom$1
  };

  var TagBoundaries = [
    'body',
    'p',
    'div',
    'article',
    'aside',
    'figcaption',
    'figure',
    'footer',
    'header',
    'nav',
    'section',
    'ol',
    'ul',
    'li',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'caption',
    'tr',
    'td',
    'th',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'address'
  ];

  var DomUniverse = function () {
    var clone = function (element) {
      return $_cycgn2jvjcun3z41.fromDom(element.dom().cloneNode(false));
    };
    var isBoundary = function (element) {
      if (!$_148ei0khjcun3z5z.isElement(element))
        return false;
      if ($_148ei0khjcun3z5z.name(element) === 'body')
        return true;
      return $_cirynjgjcun3z1x.contains(TagBoundaries, $_148ei0khjcun3z5z.name(element));
    };
    var isEmptyTag = function (element) {
      if (!$_148ei0khjcun3z5z.isElement(element))
        return false;
      return $_cirynjgjcun3z1x.contains([
        'br',
        'img',
        'hr',
        'input'
      ], $_148ei0khjcun3z5z.name(element));
    };
    var comparePosition = function (element, other) {
      return element.dom().compareDocumentPosition(other.dom());
    };
    var copyAttributesTo = function (source, destination) {
      var as = $_5qpsynkgjcun3z5t.clone(source);
      $_5qpsynkgjcun3z5t.setAll(destination, as);
    };
    return {
      up: $_b55bxvjijcun3z24.constant({
        selector: $_avmzmkkljcun3z67.ancestor,
        closest: $_avmzmkkljcun3z67.closest,
        predicate: $_8cztmfkmjcun3z69.ancestor,
        all: $_9elq0ajxjcun3z47.parents
      }),
      down: $_b55bxvjijcun3z24.constant({
        selector: $_7pi6mukijcun3z61.descendants,
        predicate: $_262p2wkjjcun3z62.descendants
      }),
      styles: $_b55bxvjijcun3z24.constant({
        get: $_7vp61rkpjcun3z6o.get,
        getRaw: $_7vp61rkpjcun3z6o.getRaw,
        set: $_7vp61rkpjcun3z6o.set,
        remove: $_7vp61rkpjcun3z6o.remove
      }),
      attrs: $_b55bxvjijcun3z24.constant({
        get: $_5qpsynkgjcun3z5t.get,
        set: $_5qpsynkgjcun3z5t.set,
        remove: $_5qpsynkgjcun3z5t.remove,
        copyTo: copyAttributesTo
      }),
      insert: $_b55bxvjijcun3z24.constant({
        before: $_f610dckrjcun3z6y.before,
        after: $_f610dckrjcun3z6y.after,
        afterAll: $_47qp7xktjcun3z72.after,
        append: $_f610dckrjcun3z6y.append,
        appendAll: $_47qp7xktjcun3z72.append,
        prepend: $_f610dckrjcun3z6y.prepend,
        wrap: $_f610dckrjcun3z6y.wrap
      }),
      remove: $_b55bxvjijcun3z24.constant({
        unwrap: $_6u25ksksjcun3z70.unwrap,
        remove: $_6u25ksksjcun3z70.remove
      }),
      create: $_b55bxvjijcun3z24.constant({
        nu: $_cycgn2jvjcun3z41.fromTag,
        clone: clone,
        text: $_cycgn2jvjcun3z41.fromText
      }),
      query: $_b55bxvjijcun3z24.constant({
        comparePosition: comparePosition,
        prevSibling: $_9elq0ajxjcun3z47.prevSibling,
        nextSibling: $_9elq0ajxjcun3z47.nextSibling
      }),
      property: $_b55bxvjijcun3z24.constant({
        children: $_9elq0ajxjcun3z47.children,
        name: $_148ei0khjcun3z5z.name,
        parent: $_9elq0ajxjcun3z47.parent,
        isText: $_148ei0khjcun3z5z.isText,
        isComment: $_148ei0khjcun3z5z.isComment,
        isElement: $_148ei0khjcun3z5z.isElement,
        getText: $_b4faswkyjcun3z84.get,
        setText: $_b4faswkyjcun3z84.set,
        isBoundary: isBoundary,
        isEmptyTag: isEmptyTag
      }),
      eq: $_bw6rudjzjcun3z4g.eq,
      is: $_bw6rudjzjcun3z4g.is
    };
  };

  var leftRight = $_asy2ehjljcun3z2p.immutable('left', 'right');
  var bisect = function (universe, parent, child) {
    var children = universe.property().children(parent);
    var index = $_cirynjgjcun3z1x.findIndex(children, $_b55bxvjijcun3z24.curry(universe.eq, child));
    return index.map(function (ind) {
      return {
        before: $_b55bxvjijcun3z24.constant(children.slice(0, ind)),
        after: $_b55bxvjijcun3z24.constant(children.slice(ind + 1))
      };
    });
  };
  var breakToRight$2 = function (universe, parent, child) {
    return bisect(universe, parent, child).map(function (parts) {
      var second = universe.create().clone(parent);
      universe.insert().appendAll(second, parts.after());
      universe.insert().after(parent, second);
      return leftRight(parent, second);
    });
  };
  var breakToLeft$2 = function (universe, parent, child) {
    return bisect(universe, parent, child).map(function (parts) {
      var prior = universe.create().clone(parent);
      universe.insert().appendAll(prior, parts.before().concat([child]));
      universe.insert().appendAll(parent, parts.after());
      universe.insert().before(parent, prior);
      return leftRight(prior, parent);
    });
  };
  var breakPath$2 = function (universe, item, isTop, breaker) {
    var result = $_asy2ehjljcun3z2p.immutable('first', 'second', 'splits');
    var next = function (child, group, splits) {
      var fallback = result(child, $_dx6m1ljhjcun3z22.none(), splits);
      if (isTop(child))
        return result(child, group, splits);
      else {
        return universe.property().parent(child).bind(function (parent) {
          return breaker(universe, parent, child).map(function (breakage) {
            var extra = [{
                first: breakage.left,
                second: breakage.right
              }];
            var nextChild = isTop(parent) ? parent : breakage.left();
            return next(nextChild, $_dx6m1ljhjcun3z22.some(breakage.right()), splits.concat(extra));
          }).getOr(fallback);
        });
      }
    };
    return next(item, $_dx6m1ljhjcun3z22.none(), []);
  };
  var $_a2v7y8l9jcun3za9 = {
    breakToLeft: breakToLeft$2,
    breakToRight: breakToRight$2,
    breakPath: breakPath$2
  };

  var all$3 = function (universe, look, elements, f) {
    var head = elements[0];
    var tail = elements.slice(1);
    return f(universe, look, head, tail);
  };
  var oneAll = function (universe, look, elements) {
    return elements.length > 0 ? all$3(universe, look, elements, unsafeOne) : $_dx6m1ljhjcun3z22.none();
  };
  var unsafeOne = function (universe, look, head, tail) {
    var start = look(universe, head);
    return $_cirynjgjcun3z1x.foldr(tail, function (b, a) {
      var current = look(universe, a);
      return commonElement(universe, b, current);
    }, start);
  };
  var commonElement = function (universe, start, end) {
    return start.bind(function (s) {
      return end.filter($_b55bxvjijcun3z24.curry(universe.eq, s));
    });
  };
  var $_egmus3lajcun3zaf = { oneAll: oneAll };

  var eq$1 = function (universe, item) {
    return $_b55bxvjijcun3z24.curry(universe.eq, item);
  };
  var unsafeSubset = function (universe, common, ps1, ps2) {
    var children = universe.property().children(common);
    if (universe.eq(common, ps1[0]))
      return $_dx6m1ljhjcun3z22.some([ps1[0]]);
    if (universe.eq(common, ps2[0]))
      return $_dx6m1ljhjcun3z22.some([ps2[0]]);
    var finder = function (ps) {
      var topDown = $_cirynjgjcun3z1x.reverse(ps);
      var index = $_cirynjgjcun3z1x.findIndex(topDown, eq$1(universe, common)).getOr(-1);
      var item = index < topDown.length - 1 ? topDown[index + 1] : topDown[index];
      return $_cirynjgjcun3z1x.findIndex(children, eq$1(universe, item));
    };
    var startIndex = finder(ps1);
    var endIndex = finder(ps2);
    return startIndex.bind(function (sIndex) {
      return endIndex.map(function (eIndex) {
        var first = Math.min(sIndex, eIndex);
        var last = Math.max(sIndex, eIndex);
        return children.slice(first, last + 1);
      });
    });
  };
  var ancestors$4 = function (universe, start, end, _isRoot) {
    var isRoot = _isRoot !== undefined ? _isRoot : $_b55bxvjijcun3z24.constant(false);
    var ps1 = [start].concat(universe.up().all(start));
    var ps2 = [end].concat(universe.up().all(end));
    var prune = function (path) {
      var index = $_cirynjgjcun3z1x.findIndex(path, isRoot);
      return index.fold(function () {
        return path;
      }, function (ind) {
        return path.slice(0, ind + 1);
      });
    };
    var pruned1 = prune(ps1);
    var pruned2 = prune(ps2);
    var shared = $_cirynjgjcun3z1x.find(pruned1, function (x) {
      return $_cirynjgjcun3z1x.exists(pruned2, eq$1(universe, x));
    });
    return {
      firstpath: $_b55bxvjijcun3z24.constant(pruned1),
      secondpath: $_b55bxvjijcun3z24.constant(pruned2),
      shared: $_b55bxvjijcun3z24.constant(shared)
    };
  };
  var subset$2 = function (universe, start, end) {
    var ancs = ancestors$4(universe, start, end);
    return ancs.shared().bind(function (shared) {
      return unsafeSubset(universe, shared, ancs.firstpath(), ancs.secondpath());
    });
  };
  var $_3585yclbjcun3zan = {
    subset: subset$2,
    ancestors: ancestors$4
  };

  var sharedOne$1 = function (universe, look, elements) {
    return $_egmus3lajcun3zaf.oneAll(universe, look, elements);
  };
  var subset$1 = function (universe, start, finish) {
    return $_3585yclbjcun3zan.subset(universe, start, finish);
  };
  var ancestors$3 = function (universe, start, finish, _isRoot) {
    return $_3585yclbjcun3zan.ancestors(universe, start, finish, _isRoot);
  };
  var breakToLeft$1 = function (universe, parent, child) {
    return $_a2v7y8l9jcun3za9.breakToLeft(universe, parent, child);
  };
  var breakToRight$1 = function (universe, parent, child) {
    return $_a2v7y8l9jcun3za9.breakToRight(universe, parent, child);
  };
  var breakPath$1 = function (universe, child, isTop, breaker) {
    return $_a2v7y8l9jcun3za9.breakPath(universe, child, isTop, breaker);
  };
  var $_cfwffwl8jcun3za6 = {
    sharedOne: sharedOne$1,
    subset: subset$1,
    ancestors: ancestors$3,
    breakToLeft: breakToLeft$1,
    breakToRight: breakToRight$1,
    breakPath: breakPath$1
  };

  var universe = DomUniverse();
  var sharedOne = function (look, elements) {
    return $_cfwffwl8jcun3za6.sharedOne(universe, function (universe, element) {
      return look(element);
    }, elements);
  };
  var subset = function (start, finish) {
    return $_cfwffwl8jcun3za6.subset(universe, start, finish);
  };
  var ancestors$2 = function (start, finish, _isRoot) {
    return $_cfwffwl8jcun3za6.ancestors(universe, start, finish, _isRoot);
  };
  var breakToLeft = function (parent, child) {
    return $_cfwffwl8jcun3za6.breakToLeft(universe, parent, child);
  };
  var breakToRight = function (parent, child) {
    return $_cfwffwl8jcun3za6.breakToRight(universe, parent, child);
  };
  var breakPath = function (child, isTop, breaker) {
    return $_cfwffwl8jcun3za6.breakPath(universe, child, isTop, function (u, p, c) {
      return breaker(p, c);
    });
  };
  var $_60dg2xl5jcun3z9c = {
    sharedOne: sharedOne,
    subset: subset,
    ancestors: ancestors$2,
    breakToLeft: breakToLeft,
    breakToRight: breakToRight,
    breakPath: breakPath
  };

  var inSelection = function (bounds, detail) {
    var leftEdge = detail.column();
    var rightEdge = detail.column() + detail.colspan() - 1;
    var topEdge = detail.row();
    var bottomEdge = detail.row() + detail.rowspan() - 1;
    return leftEdge <= bounds.finishCol() && rightEdge >= bounds.startCol() && (topEdge <= bounds.finishRow() && bottomEdge >= bounds.startRow());
  };
  var isWithin = function (bounds, detail) {
    return detail.column() >= bounds.startCol() && detail.column() + detail.colspan() - 1 <= bounds.finishCol() && detail.row() >= bounds.startRow() && detail.row() + detail.rowspan() - 1 <= bounds.finishRow();
  };
  var isRectangular = function (warehouse, bounds) {
    var isRect = true;
    var detailIsWithin = $_b55bxvjijcun3z24.curry(isWithin, bounds);
    for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
      for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
        isRect = isRect && $_dxqn88kojcun3z6j.getAt(warehouse, i, j).exists(detailIsWithin);
      }
    }
    return isRect ? $_dx6m1ljhjcun3z22.some(bounds) : $_dx6m1ljhjcun3z22.none();
  };
  var $_6pzsp1lejcun3zb3 = {
    inSelection: inSelection,
    isWithin: isWithin,
    isRectangular: isRectangular
  };

  var getBounds = function (detailA, detailB) {
    return $_bt8aj2jrjcun3z34.bounds(Math.min(detailA.row(), detailB.row()), Math.min(detailA.column(), detailB.column()), Math.max(detailA.row() + detailA.rowspan() - 1, detailB.row() + detailB.rowspan() - 1), Math.max(detailA.column() + detailA.colspan() - 1, detailB.column() + detailB.colspan() - 1));
  };
  var getAnyBox = function (warehouse, startCell, finishCell) {
    var startCoords = $_dxqn88kojcun3z6j.findItem(warehouse, startCell, $_bw6rudjzjcun3z4g.eq);
    var finishCoords = $_dxqn88kojcun3z6j.findItem(warehouse, finishCell, $_bw6rudjzjcun3z4g.eq);
    return startCoords.bind(function (sc) {
      return finishCoords.map(function (fc) {
        return getBounds(sc, fc);
      });
    });
  };
  var getBox$1 = function (warehouse, startCell, finishCell) {
    return getAnyBox(warehouse, startCell, finishCell).bind(function (bounds) {
      return $_6pzsp1lejcun3zb3.isRectangular(warehouse, bounds);
    });
  };
  var $_1091lslfjcun3zb8 = {
    getAnyBox: getAnyBox,
    getBox: getBox$1
  };

  var moveBy$1 = function (warehouse, cell, row, column) {
    return $_dxqn88kojcun3z6j.findItem(warehouse, cell, $_bw6rudjzjcun3z4g.eq).bind(function (detail) {
      var startRow = row > 0 ? detail.row() + detail.rowspan() - 1 : detail.row();
      var startCol = column > 0 ? detail.column() + detail.colspan() - 1 : detail.column();
      var dest = $_dxqn88kojcun3z6j.getAt(warehouse, startRow + row, startCol + column);
      return dest.map(function (d) {
        return d.element();
      });
    });
  };
  var intercepts$1 = function (warehouse, start, finish) {
    return $_1091lslfjcun3zb8.getAnyBox(warehouse, start, finish).map(function (bounds) {
      var inside = $_dxqn88kojcun3z6j.filterItems(warehouse, $_b55bxvjijcun3z24.curry($_6pzsp1lejcun3zb3.inSelection, bounds));
      return $_cirynjgjcun3z1x.map(inside, function (detail) {
        return detail.element();
      });
    });
  };
  var parentCell = function (warehouse, innerCell) {
    var isContainedBy = function (c1, c2) {
      return $_bw6rudjzjcun3z4g.contains(c2, c1);
    };
    return $_dxqn88kojcun3z6j.findItem(warehouse, innerCell, isContainedBy).bind(function (detail) {
      return detail.element();
    });
  };
  var $_47ftljldjcun3zax = {
    moveBy: moveBy$1,
    intercepts: intercepts$1,
    parentCell: parentCell
  };

  var moveBy = function (cell, deltaRow, deltaColumn) {
    return $_b7drosjsjcun3z37.table(cell).bind(function (table) {
      var warehouse = getWarehouse(table);
      return $_47ftljldjcun3zax.moveBy(warehouse, cell, deltaRow, deltaColumn);
    });
  };
  var intercepts = function (table, first, last) {
    var warehouse = getWarehouse(table);
    return $_47ftljldjcun3zax.intercepts(warehouse, first, last);
  };
  var nestedIntercepts = function (table, first, firstTable, last, lastTable) {
    var warehouse = getWarehouse(table);
    var startCell = $_bw6rudjzjcun3z4g.eq(table, firstTable) ? first : $_47ftljldjcun3zax.parentCell(warehouse, first);
    var lastCell = $_bw6rudjzjcun3z4g.eq(table, lastTable) ? last : $_47ftljldjcun3zax.parentCell(warehouse, last);
    return $_47ftljldjcun3zax.intercepts(warehouse, startCell, lastCell);
  };
  var getBox = function (table, first, last) {
    var warehouse = getWarehouse(table);
    return $_1091lslfjcun3zb8.getBox(warehouse, first, last);
  };
  var getWarehouse = function (table) {
    var list = $_cwbx7zjqjcun3z2x.fromTable(table);
    return $_dxqn88kojcun3z6j.generate(list);
  };
  var $_49r3yclcjcun3zat = {
    moveBy: moveBy,
    intercepts: intercepts,
    nestedIntercepts: nestedIntercepts,
    getBox: getBox
  };

  var lookupTable = function (container, isRoot) {
    return $_avmzmkkljcun3z67.ancestor(container, 'table');
  };
  var identified = $_asy2ehjljcun3z2p.immutableBag([
    'boxes',
    'start',
    'finish'
  ], []);
  var identify = function (start, finish, isRoot) {
    var getIsRoot = function (rootTable) {
      return function (element) {
        return isRoot(element) || $_bw6rudjzjcun3z4g.eq(element, rootTable);
      };
    };
    if ($_bw6rudjzjcun3z4g.eq(start, finish)) {
      return $_dx6m1ljhjcun3z22.some(identified({
        boxes: $_dx6m1ljhjcun3z22.some([start]),
        start: start,
        finish: finish
      }));
    } else {
      return lookupTable(start, isRoot).bind(function (startTable) {
        return lookupTable(finish, isRoot).bind(function (finishTable) {
          if ($_bw6rudjzjcun3z4g.eq(startTable, finishTable)) {
            return $_dx6m1ljhjcun3z22.some(identified({
              boxes: $_49r3yclcjcun3zat.intercepts(startTable, start, finish),
              start: start,
              finish: finish
            }));
          } else if ($_bw6rudjzjcun3z4g.contains(startTable, finishTable)) {
            var ancestorCells = $_7pi6mukijcun3z61.ancestors(finish, 'td,th', getIsRoot(startTable));
            var finishCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : finish;
            return $_dx6m1ljhjcun3z22.some(identified({
              boxes: $_49r3yclcjcun3zat.nestedIntercepts(startTable, start, startTable, finish, finishTable),
              start: start,
              finish: finishCell
            }));
          } else if ($_bw6rudjzjcun3z4g.contains(finishTable, startTable)) {
            var ancestorCells = $_7pi6mukijcun3z61.ancestors(start, 'td,th', getIsRoot(finishTable));
            var startCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : start;
            return $_dx6m1ljhjcun3z22.some(identified({
              boxes: $_49r3yclcjcun3zat.nestedIntercepts(finishTable, start, startTable, finish, finishTable),
              start: start,
              finish: startCell
            }));
          } else {
            return $_60dg2xl5jcun3z9c.ancestors(start, finish).shared().bind(function (lca) {
              return $_avmzmkkljcun3z67.closest(lca, 'table', isRoot).bind(function (lcaTable) {
                var finishAncestorCells = $_7pi6mukijcun3z61.ancestors(finish, 'td,th', getIsRoot(lcaTable));
                var finishCell = finishAncestorCells.length > 0 ? finishAncestorCells[finishAncestorCells.length - 1] : finish;
                var startAncestorCells = $_7pi6mukijcun3z61.ancestors(start, 'td,th', getIsRoot(lcaTable));
                var startCell = startAncestorCells.length > 0 ? startAncestorCells[startAncestorCells.length - 1] : start;
                return $_dx6m1ljhjcun3z22.some(identified({
                  boxes: $_49r3yclcjcun3zat.nestedIntercepts(lcaTable, start, startTable, finish, finishTable),
                  start: startCell,
                  finish: finishCell
                }));
              });
            });
          }
        });
      });
    }
  };
  var retrieve$1 = function (container, selector) {
    var sels = $_7pi6mukijcun3z61.descendants(container, selector);
    return sels.length > 0 ? $_dx6m1ljhjcun3z22.some(sels) : $_dx6m1ljhjcun3z22.none();
  };
  var getLast = function (boxes, lastSelectedSelector) {
    return $_cirynjgjcun3z1x.find(boxes, function (box) {
      return $_aeohlsjujcun3z3x.is(box, lastSelectedSelector);
    });
  };
  var getEdges = function (container, firstSelectedSelector, lastSelectedSelector) {
    return $_avmzmkkljcun3z67.descendant(container, firstSelectedSelector).bind(function (first) {
      return $_avmzmkkljcun3z67.descendant(container, lastSelectedSelector).bind(function (last) {
        return $_60dg2xl5jcun3z9c.sharedOne(lookupTable, [
          first,
          last
        ]).map(function (tbl) {
          return {
            first: $_b55bxvjijcun3z24.constant(first),
            last: $_b55bxvjijcun3z24.constant(last),
            table: $_b55bxvjijcun3z24.constant(tbl)
          };
        });
      });
    });
  };
  var expandTo = function (finish, firstSelectedSelector) {
    return $_avmzmkkljcun3z67.ancestor(finish, 'table').bind(function (table) {
      return $_avmzmkkljcun3z67.descendant(table, firstSelectedSelector).bind(function (start) {
        return identify(start, finish).bind(function (identified) {
          return identified.boxes().map(function (boxes) {
            return {
              boxes: $_b55bxvjijcun3z24.constant(boxes),
              start: $_b55bxvjijcun3z24.constant(identified.start()),
              finish: $_b55bxvjijcun3z24.constant(identified.finish())
            };
          });
        });
      });
    });
  };
  var shiftSelection = function (boxes, deltaRow, deltaColumn, firstSelectedSelector, lastSelectedSelector) {
    return getLast(boxes, lastSelectedSelector).bind(function (last) {
      return $_49r3yclcjcun3zat.moveBy(last, deltaRow, deltaColumn).bind(function (finish) {
        return expandTo(finish, firstSelectedSelector);
      });
    });
  };
  var $_9d2c5ml4jcun3z8x = {
    identify: identify,
    retrieve: retrieve$1,
    shiftSelection: shiftSelection,
    getEdges: getEdges
  };

  var retrieve = function (container, selector) {
    return $_9d2c5ml4jcun3z8x.retrieve(container, selector);
  };
  var retrieveBox = function (container, firstSelectedSelector, lastSelectedSelector) {
    return $_9d2c5ml4jcun3z8x.getEdges(container, firstSelectedSelector, lastSelectedSelector).bind(function (edges) {
      var isRoot = function (ancestor) {
        return $_bw6rudjzjcun3z4g.eq(container, ancestor);
      };
      var firstAncestor = $_avmzmkkljcun3z67.ancestor(edges.first(), 'thead,tfoot,tbody,table', isRoot);
      var lastAncestor = $_avmzmkkljcun3z67.ancestor(edges.last(), 'thead,tfoot,tbody,table', isRoot);
      return firstAncestor.bind(function (fA) {
        return lastAncestor.bind(function (lA) {
          return $_bw6rudjzjcun3z4g.eq(fA, lA) ? $_49r3yclcjcun3zat.getBox(edges.table(), edges.first(), edges.last()) : $_dx6m1ljhjcun3z22.none();
        });
      });
    });
  };
  var $_7itsw3l3jcun3z8q = {
    retrieve: retrieve,
    retrieveBox: retrieveBox
  };

  var selected = 'data-mce-selected';
  var selectedSelector = 'td[' + selected + '],th[' + selected + ']';
  var attributeSelector = '[' + selected + ']';
  var firstSelected = 'data-mce-first-selected';
  var firstSelectedSelector = 'td[' + firstSelected + '],th[' + firstSelected + ']';
  var lastSelected = 'data-mce-last-selected';
  var lastSelectedSelector = 'td[' + lastSelected + '],th[' + lastSelected + ']';
  var $_8e88qlgjcun3zbc = {
    selected: $_b55bxvjijcun3z24.constant(selected),
    selectedSelector: $_b55bxvjijcun3z24.constant(selectedSelector),
    attributeSelector: $_b55bxvjijcun3z24.constant(attributeSelector),
    firstSelected: $_b55bxvjijcun3z24.constant(firstSelected),
    firstSelectedSelector: $_b55bxvjijcun3z24.constant(firstSelectedSelector),
    lastSelected: $_b55bxvjijcun3z24.constant(lastSelected),
    lastSelectedSelector: $_b55bxvjijcun3z24.constant(lastSelectedSelector)
  };

  var generate$1 = function (cases) {
    if (!$_5lospcjpjcun3z2w.isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    $_cirynjgjcun3z1x.each(cases, function (acase, count) {
      var keys = $_ds59i8jkjcun3z2m.keys(acase);
      if (keys.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!$_5lospcjpjcun3z2w.isArray(value)) {
        throw new Error('case arguments must be an array');
      }
      constructors.push(key);
      adt[key] = function () {
        var argLength = arguments.length;
        if (argLength !== value.length) {
          throw new Error('Wrong number of arguments to case ' + key + '. Expected ' + value.length + ' (' + value + '), got ' + argLength);
        }
        var args = new Array(argLength);
        for (var i = 0; i < args.length; i++)
          args[i] = arguments[i];
        var match = function (branches) {
          var branchKeys = $_ds59i8jkjcun3z2m.keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = $_cirynjgjcun3z1x.forall(constructors, function (reqKey) {
            return $_cirynjgjcun3z1x.contains(branchKeys, reqKey);
          });
          if (!allReqd)
            throw new Error('Not all branches were specified when using match. Specified: ' + branchKeys.join(', ') + '\nRequired: ' + constructors.join(', '));
          return branches[key].apply(null, args);
        };
        return {
          fold: function () {
            if (arguments.length !== cases.length) {
              throw new Error('Wrong number of arguments to fold. Expected ' + cases.length + ', got ' + arguments.length);
            }
            var target = arguments[count];
            return target.apply(null, args);
          },
          match: match,
          log: function (label) {
            console.log(label, {
              constructors: constructors,
              constructor: key,
              params: args
            });
          }
        };
      };
    });
    return adt;
  };
  var $_4r392mlijcun3zbf = { generate: generate$1 };

  var type$1 = $_4r392mlijcun3zbf.generate([
    { none: [] },
    { multiple: ['elements'] },
    { single: ['selection'] }
  ]);
  var cata = function (subject, onNone, onMultiple, onSingle) {
    return subject.fold(onNone, onMultiple, onSingle);
  };
  var $_4tfhcdlhjcun3zbd = {
    cata: cata,
    none: type$1.none,
    multiple: type$1.multiple,
    single: type$1.single
  };

  var selection = function (cell, selections) {
    return $_4tfhcdlhjcun3zbd.cata(selections.get(), $_b55bxvjijcun3z24.constant([]), $_b55bxvjijcun3z24.identity, $_b55bxvjijcun3z24.constant([cell]));
  };
  var unmergable = function (cell, selections) {
    var hasSpan = function (elem) {
      return $_5qpsynkgjcun3z5t.has(elem, 'rowspan') && parseInt($_5qpsynkgjcun3z5t.get(elem, 'rowspan'), 10) > 1 || $_5qpsynkgjcun3z5t.has(elem, 'colspan') && parseInt($_5qpsynkgjcun3z5t.get(elem, 'colspan'), 10) > 1;
    };
    var candidates = selection(cell, selections);
    return candidates.length > 0 && $_cirynjgjcun3z1x.forall(candidates, hasSpan) ? $_dx6m1ljhjcun3z22.some(candidates) : $_dx6m1ljhjcun3z22.none();
  };
  var mergable = function (table, selections) {
    return $_4tfhcdlhjcun3zbd.cata(selections.get(), $_dx6m1ljhjcun3z22.none, function (cells, _env) {
      if (cells.length === 0) {
        return $_dx6m1ljhjcun3z22.none();
      }
      return $_7itsw3l3jcun3z8q.retrieveBox(table, $_8e88qlgjcun3zbc.firstSelectedSelector(), $_8e88qlgjcun3zbc.lastSelectedSelector()).bind(function (bounds) {
        return cells.length > 1 ? $_dx6m1ljhjcun3z22.some({
          bounds: $_b55bxvjijcun3z24.constant(bounds),
          cells: $_b55bxvjijcun3z24.constant(cells)
        }) : $_dx6m1ljhjcun3z22.none();
      });
    }, $_dx6m1ljhjcun3z22.none);
  };
  var $_dka007l2jcun3z8i = {
    mergable: mergable,
    unmergable: unmergable,
    selection: selection
  };

  var noMenu = function (cell) {
    return {
      element: $_b55bxvjijcun3z24.constant(cell),
      mergable: $_dx6m1ljhjcun3z22.none,
      unmergable: $_dx6m1ljhjcun3z22.none,
      selection: $_b55bxvjijcun3z24.constant([cell])
    };
  };
  var forMenu = function (selections, table, cell) {
    return {
      element: $_b55bxvjijcun3z24.constant(cell),
      mergable: $_b55bxvjijcun3z24.constant($_dka007l2jcun3z8i.mergable(table, selections)),
      unmergable: $_b55bxvjijcun3z24.constant($_dka007l2jcun3z8i.unmergable(cell, selections)),
      selection: $_b55bxvjijcun3z24.constant($_dka007l2jcun3z8i.selection(cell, selections))
    };
  };
  var notCell$1 = function (element) {
    return noMenu(element);
  };
  var paste$1 = $_asy2ehjljcun3z2p.immutable('element', 'clipboard', 'generators');
  var pasteRows = function (selections, table, cell, clipboard, generators) {
    return {
      element: $_b55bxvjijcun3z24.constant(cell),
      mergable: $_dx6m1ljhjcun3z22.none,
      unmergable: $_dx6m1ljhjcun3z22.none,
      selection: $_b55bxvjijcun3z24.constant($_dka007l2jcun3z8i.selection(cell, selections)),
      clipboard: $_b55bxvjijcun3z24.constant(clipboard),
      generators: $_b55bxvjijcun3z24.constant(generators)
    };
  };
  var $_bncpsrl1jcun3z8e = {
    noMenu: noMenu,
    forMenu: forMenu,
    notCell: notCell$1,
    paste: paste$1,
    pasteRows: pasteRows
  };

  var extractSelected = function (cells) {
    return $_b7drosjsjcun3z37.table(cells[0]).map($_367bwxkvjcun3z7t.deep).map(function (replica) {
      return [$_e14a23jjjcun3z28.extract(replica, $_8e88qlgjcun3zbc.attributeSelector())];
    });
  };
  var serializeElement = function (editor, elm) {
    return editor.selection.serializer.serialize(elm.dom(), {});
  };
  var registerEvents = function (editor, selections, actions, cellSelection) {
    editor.on('BeforeGetContent', function (e) {
      var multiCellContext = function (cells) {
        e.preventDefault();
        extractSelected(cells).each(function (elements) {
          e.content = $_cirynjgjcun3z1x.map(elements, function (elm) {
            return serializeElement(editor, elm);
          }).join('');
        });
      };
      if (e.selection === true) {
        $_4tfhcdlhjcun3zbd.cata(selections.get(), $_b55bxvjijcun3z24.noop, multiCellContext, $_b55bxvjijcun3z24.noop);
      }
    });
    editor.on('BeforeSetContent', function (e) {
      if (e.selection === true && e.paste === true) {
        var cellOpt = $_dx6m1ljhjcun3z22.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        cellOpt.each(function (domCell) {
          var cell = $_cycgn2jvjcun3z41.fromDom(domCell);
          var table = $_b7drosjsjcun3z37.table(cell);
          table.bind(function (table) {
            var elements = $_cirynjgjcun3z1x.filter($_g83pk4l0jcun3z8c.fromHtml(e.content), function (content) {
              return $_148ei0khjcun3z5z.name(content) !== 'meta';
            });
            if (elements.length === 1 && $_148ei0khjcun3z5z.name(elements[0]) === 'table') {
              e.preventDefault();
              var doc = $_cycgn2jvjcun3z41.fromDom(editor.getDoc());
              var generators = $_6ldhx1kujcun3z76.paste(doc);
              var targets = $_bncpsrl1jcun3z8e.paste(cell, elements[0], generators);
              actions.pasteCells(table, targets).each(function (rng) {
                editor.selection.setRng(rng);
                editor.focus();
                cellSelection.clear(table);
              });
            }
          });
        });
      }
    });
  };
  var $_bw0vxbjfjcun3z1i = { registerEvents: registerEvents };

  var makeTable = function () {
    return $_cycgn2jvjcun3z41.fromTag('table');
  };
  var tableBody = function () {
    return $_cycgn2jvjcun3z41.fromTag('tbody');
  };
  var tableRow = function () {
    return $_cycgn2jvjcun3z41.fromTag('tr');
  };
  var tableHeaderCell = function () {
    return $_cycgn2jvjcun3z41.fromTag('th');
  };
  var tableCell = function () {
    return $_cycgn2jvjcun3z41.fromTag('td');
  };
  var render = function (rows, columns, rowHeaders, columnHeaders) {
    var table = makeTable();
    $_7vp61rkpjcun3z6o.setAll(table, {
      'border-collapse': 'collapse',
      width: '100%'
    });
    $_5qpsynkgjcun3z5t.set(table, 'border', '1');
    var tbody = tableBody();
    $_f610dckrjcun3z6y.append(table, tbody);
    var trs = [];
    for (var i = 0; i < rows; i++) {
      var tr = tableRow();
      for (var j = 0; j < columns; j++) {
        var td = i < rowHeaders || j < columnHeaders ? tableHeaderCell() : tableCell();
        if (j < columnHeaders) {
          $_5qpsynkgjcun3z5t.set(td, 'scope', 'row');
        }
        if (i < rowHeaders) {
          $_5qpsynkgjcun3z5t.set(td, 'scope', 'col');
        }
        $_f610dckrjcun3z6y.append(td, $_cycgn2jvjcun3z41.fromTag('br'));
        $_7vp61rkpjcun3z6o.set(td, 'width', 100 / columns + '%');
        $_f610dckrjcun3z6y.append(tr, td);
      }
      trs.push(tr);
    }
    $_47qp7xktjcun3z72.append(tbody, trs);
    return table;
  };
  var $_5683m4lljcun3zbu = { render: render };

  var $_2ki74plkjcun3zbs = { render: $_5683m4lljcun3zbu.render };

  var get$3 = function (element) {
    return element.dom().innerHTML;
  };
  var set$3 = function (element, content) {
    var owner = $_9elq0ajxjcun3z47.owner(element);
    var docDom = owner.dom();
    var fragment = $_cycgn2jvjcun3z41.fromDom(docDom.createDocumentFragment());
    var contentElements = $_g83pk4l0jcun3z8c.fromHtml(content, docDom);
    $_47qp7xktjcun3z72.append(fragment, contentElements);
    $_6u25ksksjcun3z70.empty(element);
    $_f610dckrjcun3z6y.append(element, fragment);
  };
  var getOuter = function (element) {
    var container = $_cycgn2jvjcun3z41.fromTag('div');
    var clone = $_cycgn2jvjcun3z41.fromDom(element.dom().cloneNode(true));
    $_f610dckrjcun3z6y.append(container, clone);
    return get$3(container);
  };
  var $_8ule13lmjcun3zc1 = {
    get: get$3,
    set: set$3,
    getOuter: getOuter
  };

  var placeCaretInCell = function (editor, cell) {
    editor.selection.select(cell.dom(), true);
    editor.selection.collapse(true);
  };
  var selectFirstCellInTable = function (editor, tableElm) {
    $_avmzmkkljcun3z67.descendant(tableElm, 'td,th').each($_b55bxvjijcun3z24.curry(placeCaretInCell, editor));
  };
  var insert = function (editor, columns, rows) {
    var tableElm;
    var renderedHtml = $_2ki74plkjcun3zbs.render(rows, columns, 0, 0);
    $_5qpsynkgjcun3z5t.set(renderedHtml, 'id', '__mce');
    var html = $_8ule13lmjcun3zc1.getOuter(renderedHtml);
    editor.insertContent(html);
    tableElm = editor.dom.get('__mce');
    editor.dom.setAttrib(tableElm, 'id', null);
    editor.$('tr', tableElm).each(function (index, row) {
      editor.fire('newrow', { node: row });
      editor.$('th,td', row).each(function (index, cell) {
        editor.fire('newcell', { node: cell });
      });
    });
    editor.dom.setAttribs(tableElm, editor.settings.table_default_attributes || {});
    editor.dom.setStyles(tableElm, editor.settings.table_default_styles || {});
    selectFirstCellInTable(editor, $_cycgn2jvjcun3z41.fromDom(tableElm));
    return tableElm;
  };
  var $_ecfdziljjcun3zbi = { insert: insert };

  var Dimension = function (name, getOffset) {
    var set = function (element, h) {
      if (!$_5lospcjpjcun3z2w.isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_ao69gnkqjcun3z6x.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_7vp61rkpjcun3z6o.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return $_cirynjgjcun3z1x.foldl(properties, function (acc, property) {
        var val = $_7vp61rkpjcun3z6o.get(element, property);
        var value = val === undefined ? 0 : parseInt(val, 10);
        return isNaN(value) ? acc : acc + value;
      }, 0);
    };
    var max = function (element, value, properties) {
      var cumulativeInclusions = aggregate(element, properties);
      var absoluteMax = value > cumulativeInclusions ? value - cumulativeInclusions : 0;
      return absoluteMax;
    };
    return {
      set: set,
      get: get,
      getOuter: getOuter,
      aggregate: aggregate,
      max: max
    };
  };

  var api$1 = Dimension('height', function (element) {
    return $_2wq0b9kkjcun3z65.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
  });
  var set$4 = function (element, h) {
    api$1.set(element, h);
  };
  var get$5 = function (element) {
    return api$1.get(element);
  };
  var getOuter$1 = function (element) {
    return api$1.getOuter(element);
  };
  var setMax = function (element, value) {
    var inclusions = [
      'margin-top',
      'border-top-width',
      'padding-top',
      'padding-bottom',
      'border-bottom-width',
      'margin-bottom'
    ];
    var absMax = api$1.max(element, value, inclusions);
    $_7vp61rkpjcun3z6o.set(element, 'max-height', absMax + 'px');
  };
  var $_4ev4k9lrjcun3zd0 = {
    set: set$4,
    get: get$5,
    getOuter: getOuter$1,
    setMax: setMax
  };

  var api$2 = Dimension('width', function (element) {
    return element.dom().offsetWidth;
  });
  var set$5 = function (element, h) {
    api$2.set(element, h);
  };
  var get$6 = function (element) {
    return api$2.get(element);
  };
  var getOuter$2 = function (element) {
    return api$2.getOuter(element);
  };
  var setMax$1 = function (element, value) {
    var inclusions = [
      'margin-left',
      'border-left-width',
      'padding-left',
      'padding-right',
      'border-right-width',
      'margin-right'
    ];
    var absMax = api$2.max(element, value, inclusions);
    $_7vp61rkpjcun3z6o.set(element, 'max-width', absMax + 'px');
  };
  var $_1a9a5mltjcun3zd7 = {
    set: set$5,
    get: get$6,
    getOuter: getOuter$2,
    setMax: setMax$1
  };

  var platform = $_d4zrqkk4jcun3z4r.detect();
  var needManualCalc = function () {
    return platform.browser.isIE() || platform.browser.isEdge();
  };
  var toNumber = function (px, fallback) {
    var num = parseFloat(px);
    return isNaN(num) ? fallback : num;
  };
  var getProp = function (elm, name, fallback) {
    return toNumber($_7vp61rkpjcun3z6o.get(elm, name), fallback);
  };
  var getCalculatedHeight = function (cell) {
    var paddingTop = getProp(cell, 'padding-top', 0);
    var paddingBottom = getProp(cell, 'padding-bottom', 0);
    var borderTop = getProp(cell, 'border-top-width', 0);
    var borderBottom = getProp(cell, 'border-bottom-width', 0);
    var height = cell.dom().getBoundingClientRect().height;
    var boxSizing = $_7vp61rkpjcun3z6o.get(cell, 'box-sizing');
    var borders = borderTop + borderBottom;
    return boxSizing === 'border-box' ? height : height - paddingTop - paddingBottom - borders;
  };
  var getWidth = function (cell) {
    return getProp(cell, 'width', $_1a9a5mltjcun3zd7.get(cell));
  };
  var getHeight$1 = function (cell) {
    return needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', $_4ev4k9lrjcun3zd0.get(cell));
  };
  var $_dxhwhwlqjcun3zcu = {
    getWidth: getWidth,
    getHeight: getHeight$1
  };

  var genericSizeRegex = /(\d+(\.\d+)?)(\w|%)*/;
  var percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
  var pixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;
  var setPixelWidth = function (cell, amount) {
    $_7vp61rkpjcun3z6o.set(cell, 'width', amount + 'px');
  };
  var setPercentageWidth = function (cell, amount) {
    $_7vp61rkpjcun3z6o.set(cell, 'width', amount + '%');
  };
  var setHeight = function (cell, amount) {
    $_7vp61rkpjcun3z6o.set(cell, 'height', amount + 'px');
  };
  var getHeightValue = function (cell) {
    return $_7vp61rkpjcun3z6o.getRaw(cell, 'height').getOrThunk(function () {
      return $_dxhwhwlqjcun3zcu.getHeight(cell) + 'px';
    });
  };
  var convert = function (cell, number, getter, setter) {
    var newSize = $_b7drosjsjcun3z37.table(cell).map(function (table) {
      var total = getter(table);
      return Math.floor(number / 100 * total);
    }).getOr(number);
    setter(cell, newSize);
    return newSize;
  };
  var normalizePixelSize = function (value, cell, getter, setter) {
    var number = parseInt(value, 10);
    return $_bs9f57kdjcun3z5b.endsWith(value, '%') && $_148ei0khjcun3z5z.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
  };
  var getTotalHeight = function (cell) {
    var value = getHeightValue(cell);
    if (!value)
      return $_4ev4k9lrjcun3zd0.get(cell);
    return normalizePixelSize(value, cell, $_4ev4k9lrjcun3zd0.get, setHeight);
  };
  var get$4 = function (cell, type, f) {
    var v = f(cell);
    var span = getSpan(cell, type);
    return v / span;
  };
  var getSpan = function (cell, type) {
    return $_5qpsynkgjcun3z5t.has(cell, type) ? parseInt($_5qpsynkgjcun3z5t.get(cell, type), 10) : 1;
  };
  var getRawWidth = function (element) {
    var cssWidth = $_7vp61rkpjcun3z6o.getRaw(element, 'width');
    return cssWidth.fold(function () {
      return $_dx6m1ljhjcun3z22.from($_5qpsynkgjcun3z5t.get(element, 'width'));
    }, function (width) {
      return $_dx6m1ljhjcun3z22.some(width);
    });
  };
  var normalizePercentageWidth = function (cellWidth, tableSize) {
    return cellWidth / tableSize.pixelWidth() * 100;
  };
  var choosePercentageSize = function (element, width, tableSize) {
    if (percentageBasedSizeRegex.test(width)) {
      var percentMatch = percentageBasedSizeRegex.exec(width);
      return parseFloat(percentMatch[1]);
    } else {
      var fallbackWidth = $_1a9a5mltjcun3zd7.get(element);
      var intWidth = parseInt(fallbackWidth, 10);
      return normalizePercentageWidth(intWidth, tableSize);
    }
  };
  var getPercentageWidth = function (cell, tableSize) {
    var width = getRawWidth(cell);
    return width.fold(function () {
      var width = $_1a9a5mltjcun3zd7.get(cell);
      var intWidth = parseInt(width, 10);
      return normalizePercentageWidth(intWidth, tableSize);
    }, function (width) {
      return choosePercentageSize(cell, width, tableSize);
    });
  };
  var normalizePixelWidth = function (cellWidth, tableSize) {
    return cellWidth / 100 * tableSize.pixelWidth();
  };
  var choosePixelSize = function (element, width, tableSize) {
    if (pixelBasedSizeRegex.test(width)) {
      var pixelMatch = pixelBasedSizeRegex.exec(width);
      return parseInt(pixelMatch[1], 10);
    } else if (percentageBasedSizeRegex.test(width)) {
      var percentMatch = percentageBasedSizeRegex.exec(width);
      var floatWidth = parseFloat(percentMatch[1]);
      return normalizePixelWidth(floatWidth, tableSize);
    } else {
      var fallbackWidth = $_1a9a5mltjcun3zd7.get(element);
      return parseInt(fallbackWidth, 10);
    }
  };
  var getPixelWidth = function (cell, tableSize) {
    var width = getRawWidth(cell);
    return width.fold(function () {
      var width = $_1a9a5mltjcun3zd7.get(cell);
      var intWidth = parseInt(width, 10);
      return intWidth;
    }, function (width) {
      return choosePixelSize(cell, width, tableSize);
    });
  };
  var getHeight = function (cell) {
    return get$4(cell, 'rowspan', getTotalHeight);
  };
  var getGenericWidth = function (cell) {
    var width = getRawWidth(cell);
    return width.bind(function (width) {
      if (genericSizeRegex.test(width)) {
        var match = genericSizeRegex.exec(width);
        return $_dx6m1ljhjcun3z22.some({
          width: $_b55bxvjijcun3z24.constant(match[1]),
          unit: $_b55bxvjijcun3z24.constant(match[3])
        });
      } else {
        return $_dx6m1ljhjcun3z22.none();
      }
    });
  };
  var setGenericWidth = function (cell, amount, unit) {
    $_7vp61rkpjcun3z6o.set(cell, 'width', amount + unit);
  };
  var $_dhvlh5lpjcun3zci = {
    percentageBasedSizeRegex: $_b55bxvjijcun3z24.constant(percentageBasedSizeRegex),
    pixelBasedSizeRegex: $_b55bxvjijcun3z24.constant(pixelBasedSizeRegex),
    setPixelWidth: setPixelWidth,
    setPercentageWidth: setPercentageWidth,
    setHeight: setHeight,
    getPixelWidth: getPixelWidth,
    getPercentageWidth: getPercentageWidth,
    getGenericWidth: getGenericWidth,
    setGenericWidth: setGenericWidth,
    getHeight: getHeight,
    getRawWidth: getRawWidth
  };

  var halve = function (main, other) {
    var width = $_dhvlh5lpjcun3zci.getGenericWidth(main);
    width.each(function (width) {
      var newWidth = width.width() / 2;
      $_dhvlh5lpjcun3zci.setGenericWidth(main, newWidth, width.unit());
      $_dhvlh5lpjcun3zci.setGenericWidth(other, newWidth, width.unit());
    });
  };
  var $_9y7qx7lojcun3zcg = { halve: halve };

  var attached = function (element, scope) {
    var doc = scope || $_cycgn2jvjcun3z41.fromDom(document.documentElement);
    return $_8cztmfkmjcun3z69.ancestor(element, $_b55bxvjijcun3z24.curry($_bw6rudjzjcun3z4g.eq, doc)).isSome();
  };
  var windowOf = function (element) {
    var dom = element.dom();
    if (dom === dom.window)
      return element;
    return $_148ei0khjcun3z5z.isDocument(element) ? dom.defaultView || dom.parentWindow : null;
  };
  var $_f7qi33lyjcun3zdm = {
    attached: attached,
    windowOf: windowOf
  };

  var r = function (left, top) {
    var translate = function (x, y) {
      return r(left + x, top + y);
    };
    return {
      left: $_b55bxvjijcun3z24.constant(left),
      top: $_b55bxvjijcun3z24.constant(top),
      translate: translate
    };
  };

  var boxPosition = function (dom) {
    var box = dom.getBoundingClientRect();
    return r(box.left, box.top);
  };
  var firstDefinedOrZero = function (a, b) {
    return a !== undefined ? a : b !== undefined ? b : 0;
  };
  var absolute = function (element) {
    var doc = element.dom().ownerDocument;
    var body = doc.body;
    var win = $_f7qi33lyjcun3zdm.windowOf($_cycgn2jvjcun3z41.fromDom(doc));
    var html = doc.documentElement;
    var scrollTop = firstDefinedOrZero(win.pageYOffset, html.scrollTop);
    var scrollLeft = firstDefinedOrZero(win.pageXOffset, html.scrollLeft);
    var clientTop = firstDefinedOrZero(html.clientTop, body.clientTop);
    var clientLeft = firstDefinedOrZero(html.clientLeft, body.clientLeft);
    return viewport(element).translate(scrollLeft - clientLeft, scrollTop - clientTop);
  };
  var relative = function (element) {
    var dom = element.dom();
    return r(dom.offsetLeft, dom.offsetTop);
  };
  var viewport = function (element) {
    var dom = element.dom();
    var doc = dom.ownerDocument;
    var body = doc.body;
    var html = $_cycgn2jvjcun3z41.fromDom(doc.documentElement);
    if (body === dom)
      return r(body.offsetLeft, body.offsetTop);
    if (!$_f7qi33lyjcun3zdm.attached(element, html))
      return r(0, 0);
    return boxPosition(dom);
  };
  var $_3qiue4lxjcun3zdk = {
    absolute: absolute,
    relative: relative,
    viewport: viewport
  };

  var rowInfo = $_asy2ehjljcun3z2p.immutable('row', 'y');
  var colInfo = $_asy2ehjljcun3z2p.immutable('col', 'x');
  var rtlEdge = function (cell) {
    var pos = $_3qiue4lxjcun3zdk.absolute(cell);
    return pos.left() + $_1a9a5mltjcun3zd7.getOuter(cell);
  };
  var ltrEdge = function (cell) {
    return $_3qiue4lxjcun3zdk.absolute(cell).left();
  };
  var getLeftEdge = function (index, cell) {
    return colInfo(index, ltrEdge(cell));
  };
  var getRightEdge = function (index, cell) {
    return colInfo(index, rtlEdge(cell));
  };
  var getTop = function (cell) {
    return $_3qiue4lxjcun3zdk.absolute(cell).top();
  };
  var getTopEdge = function (index, cell) {
    return rowInfo(index, getTop(cell));
  };
  var getBottomEdge = function (index, cell) {
    return rowInfo(index, getTop(cell) + $_4ev4k9lrjcun3zd0.getOuter(cell));
  };
  var findPositions = function (getInnerEdge, getOuterEdge, array) {
    if (array.length === 0)
      return [];
    var lines = $_cirynjgjcun3z1x.map(array.slice(1), function (cellOption, index) {
      return cellOption.map(function (cell) {
        return getInnerEdge(index, cell);
      });
    });
    var lastLine = array[array.length - 1].map(function (cell) {
      return getOuterEdge(array.length - 1, cell);
    });
    return lines.concat([lastLine]);
  };
  var negate = function (step, _table) {
    return -step;
  };
  var height = {
    delta: $_b55bxvjijcun3z24.identity,
    positions: $_b55bxvjijcun3z24.curry(findPositions, getTopEdge, getBottomEdge),
    edge: getTop
  };
  var ltr = {
    delta: $_b55bxvjijcun3z24.identity,
    edge: ltrEdge,
    positions: $_b55bxvjijcun3z24.curry(findPositions, getLeftEdge, getRightEdge)
  };
  var rtl = {
    delta: negate,
    edge: rtlEdge,
    positions: $_b55bxvjijcun3z24.curry(findPositions, getRightEdge, getLeftEdge)
  };
  var $_ea5q41lwjcun3zdb = {
    height: height,
    rtl: rtl,
    ltr: ltr
  };

  var $_brwyialvjcun3zda = {
    ltr: $_ea5q41lwjcun3zdb.ltr,
    rtl: $_ea5q41lwjcun3zdb.rtl
  };

  var TableDirection = function (directionAt) {
    var auto = function (table) {
      return directionAt(table).isRtl() ? $_brwyialvjcun3zda.rtl : $_brwyialvjcun3zda.ltr;
    };
    var delta = function (amount, table) {
      return auto(table).delta(amount, table);
    };
    var positions = function (cols, table) {
      return auto(table).positions(cols, table);
    };
    var edge = function (cell) {
      return auto(cell).edge(cell);
    };
    return {
      delta: delta,
      edge: edge,
      positions: positions
    };
  };

  var getGridSize = function (table) {
    var input = $_cwbx7zjqjcun3z2x.fromTable(table);
    var warehouse = $_dxqn88kojcun3z6j.generate(input);
    return warehouse.grid();
  };
  var $_2isyvhm0jcun3zdy = { getGridSize: getGridSize };

  var Cell = function (initial) {
    var value = initial;
    var get = function () {
      return value;
    };
    var set = function (v) {
      value = v;
    };
    var clone = function () {
      return Cell(get());
    };
    return {
      get: get,
      set: set,
      clone: clone
    };
  };

  var base = function (handleUnsupported, required) {
    return baseWith(handleUnsupported, required, {
      validate: $_5lospcjpjcun3z2w.isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    $_bzgn0gjojcun3z2u.validateStrArr('required', required);
    $_bzgn0gjojcun3z2u.checkDupes(required);
    return function (obj) {
      var keys = $_ds59i8jkjcun3z2m.keys(obj);
      var allReqd = $_cirynjgjcun3z1x.forall(required, function (req) {
        return $_cirynjgjcun3z1x.contains(keys, req);
      });
      if (!allReqd)
        $_bzgn0gjojcun3z2u.reqMessage(required, keys);
      handleUnsupported(required, keys);
      var invalidKeys = $_cirynjgjcun3z1x.filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        $_bzgn0gjojcun3z2u.invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys) {
    var unsupported = $_cirynjgjcun3z1x.filter(keys, function (key) {
      return !$_cirynjgjcun3z1x.contains(required, key);
    });
    if (unsupported.length > 0)
      $_bzgn0gjojcun3z2u.unsuppMessage(unsupported);
  };
  var allowExtra = $_b55bxvjijcun3z24.noop;
  var $_6j1cv2m4jcun3zeo = {
    exactly: $_b55bxvjijcun3z24.curry(base, handleExact),
    ensure: $_b55bxvjijcun3z24.curry(base, allowExtra),
    ensureWith: $_b55bxvjijcun3z24.curry(baseWith, allowExtra)
  };

  var elementToData = function (element) {
    var colspan = $_5qpsynkgjcun3z5t.has(element, 'colspan') ? parseInt($_5qpsynkgjcun3z5t.get(element, 'colspan'), 10) : 1;
    var rowspan = $_5qpsynkgjcun3z5t.has(element, 'rowspan') ? parseInt($_5qpsynkgjcun3z5t.get(element, 'rowspan'), 10) : 1;
    return {
      element: $_b55bxvjijcun3z24.constant(element),
      colspan: $_b55bxvjijcun3z24.constant(colspan),
      rowspan: $_b55bxvjijcun3z24.constant(rowspan)
    };
  };
  var modification = function (generators, _toData) {
    contract(generators);
    var position = Cell($_dx6m1ljhjcun3z22.none());
    var toData = _toData !== undefined ? _toData : elementToData;
    var nu = function (data) {
      return generators.cell(data);
    };
    var nuFrom = function (element) {
      var data = toData(element);
      return nu(data);
    };
    var add = function (element) {
      var replacement = nuFrom(element);
      if (position.get().isNone())
        position.set($_dx6m1ljhjcun3z22.some(replacement));
      recent = $_dx6m1ljhjcun3z22.some({
        item: element,
        replacement: replacement
      });
      return replacement;
    };
    var recent = $_dx6m1ljhjcun3z22.none();
    var getOrInit = function (element, comparator) {
      return recent.fold(function () {
        return add(element);
      }, function (p) {
        return comparator(element, p.item) ? p.replacement : add(element);
      });
    };
    return {
      getOrInit: getOrInit,
      cursor: position.get
    };
  };
  var transform = function (scope, tag) {
    return function (generators) {
      var position = Cell($_dx6m1ljhjcun3z22.none());
      contract(generators);
      var list = [];
      var find = function (element, comparator) {
        return $_cirynjgjcun3z1x.find(list, function (x) {
          return comparator(x.item, element);
        });
      };
      var makeNew = function (element) {
        var cell = generators.replace(element, tag, { scope: scope });
        list.push({
          item: element,
          sub: cell
        });
        if (position.get().isNone())
          position.set($_dx6m1ljhjcun3z22.some(cell));
        return cell;
      };
      var replaceOrInit = function (element, comparator) {
        return find(element, comparator).fold(function () {
          return makeNew(element);
        }, function (p) {
          return comparator(element, p.item) ? p.sub : makeNew(element);
        });
      };
      return {
        replaceOrInit: replaceOrInit,
        cursor: position.get
      };
    };
  };
  var merging = function (generators) {
    contract(generators);
    var position = Cell($_dx6m1ljhjcun3z22.none());
    var combine = function (cell) {
      if (position.get().isNone())
        position.set($_dx6m1ljhjcun3z22.some(cell));
      return function () {
        var raw = generators.cell({
          element: $_b55bxvjijcun3z24.constant(cell),
          colspan: $_b55bxvjijcun3z24.constant(1),
          rowspan: $_b55bxvjijcun3z24.constant(1)
        });
        $_7vp61rkpjcun3z6o.remove(raw, 'width');
        $_7vp61rkpjcun3z6o.remove(cell, 'width');
        return raw;
      };
    };
    return {
      combine: combine,
      cursor: position.get
    };
  };
  var contract = $_6j1cv2m4jcun3zeo.exactly([
    'cell',
    'row',
    'replace',
    'gap'
  ]);
  var $_cce589m2jcun3zed = {
    modification: modification,
    transform: transform,
    merging: merging
  };

  var blockList = [
    'body',
    'p',
    'div',
    'article',
    'aside',
    'figcaption',
    'figure',
    'footer',
    'header',
    'nav',
    'section',
    'ol',
    'ul',
    'table',
    'thead',
    'tfoot',
    'tbody',
    'caption',
    'tr',
    'td',
    'th',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'address'
  ];
  var isList$1 = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_cirynjgjcun3z1x.contains([
      'ol',
      'ul'
    ], tagName);
  };
  var isBlock$1 = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_cirynjgjcun3z1x.contains(blockList, tagName);
  };
  var isFormatting$1 = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_cirynjgjcun3z1x.contains([
      'address',
      'pre',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ], tagName);
  };
  var isHeading$1 = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_cirynjgjcun3z1x.contains([
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ], tagName);
  };
  var isContainer$1 = function (universe, item) {
    return $_cirynjgjcun3z1x.contains([
      'div',
      'li',
      'td',
      'th',
      'blockquote',
      'body',
      'caption'
    ], universe.property().name(item));
  };
  var isEmptyTag$1 = function (universe, item) {
    return $_cirynjgjcun3z1x.contains([
      'br',
      'img',
      'hr',
      'input'
    ], universe.property().name(item));
  };
  var isFrame$1 = function (universe, item) {
    return universe.property().name(item) === 'iframe';
  };
  var isInline$1 = function (universe, item) {
    return !(isBlock$1(universe, item) || isEmptyTag$1(universe, item)) && universe.property().name(item) !== 'li';
  };
  var $_fxw1mqm7jcun3zf6 = {
    isBlock: isBlock$1,
    isList: isList$1,
    isFormatting: isFormatting$1,
    isHeading: isHeading$1,
    isContainer: isContainer$1,
    isEmptyTag: isEmptyTag$1,
    isFrame: isFrame$1,
    isInline: isInline$1
  };

  var universe$1 = DomUniverse();
  var isBlock = function (element) {
    return $_fxw1mqm7jcun3zf6.isBlock(universe$1, element);
  };
  var isList = function (element) {
    return $_fxw1mqm7jcun3zf6.isList(universe$1, element);
  };
  var isFormatting = function (element) {
    return $_fxw1mqm7jcun3zf6.isFormatting(universe$1, element);
  };
  var isHeading = function (element) {
    return $_fxw1mqm7jcun3zf6.isHeading(universe$1, element);
  };
  var isContainer = function (element) {
    return $_fxw1mqm7jcun3zf6.isContainer(universe$1, element);
  };
  var isEmptyTag = function (element) {
    return $_fxw1mqm7jcun3zf6.isEmptyTag(universe$1, element);
  };
  var isFrame = function (element) {
    return $_fxw1mqm7jcun3zf6.isFrame(universe$1, element);
  };
  var isInline = function (element) {
    return $_fxw1mqm7jcun3zf6.isInline(universe$1, element);
  };
  var $_1xyd24m6jcun3zf3 = {
    isBlock: isBlock,
    isList: isList,
    isFormatting: isFormatting,
    isHeading: isHeading,
    isContainer: isContainer,
    isEmptyTag: isEmptyTag,
    isFrame: isFrame,
    isInline: isInline
  };

  var merge = function (cells) {
    var isBr = function (el) {
      return $_148ei0khjcun3z5z.name(el) === 'br';
    };
    var advancedBr = function (children) {
      return $_cirynjgjcun3z1x.forall(children, function (c) {
        return isBr(c) || $_148ei0khjcun3z5z.isText(c) && $_b4faswkyjcun3z84.get(c).trim().length === 0;
      });
    };
    var isListItem = function (el) {
      return $_148ei0khjcun3z5z.name(el) === 'li' || $_8cztmfkmjcun3z69.ancestor(el, $_1xyd24m6jcun3zf3.isList).isSome();
    };
    var siblingIsBlock = function (el) {
      return $_9elq0ajxjcun3z47.nextSibling(el).map(function (rightSibling) {
        if ($_1xyd24m6jcun3zf3.isBlock(rightSibling))
          return true;
        if ($_1xyd24m6jcun3zf3.isEmptyTag(rightSibling)) {
          return $_148ei0khjcun3z5z.name(rightSibling) === 'img' ? false : true;
        }
      }).getOr(false);
    };
    var markCell = function (cell) {
      return $_1thrsskwjcun3z7w.last(cell).bind(function (rightEdge) {
        var rightSiblingIsBlock = siblingIsBlock(rightEdge);
        return $_9elq0ajxjcun3z47.parent(rightEdge).map(function (parent) {
          return rightSiblingIsBlock === true || isListItem(parent) || isBr(rightEdge) || $_1xyd24m6jcun3zf3.isBlock(parent) && !$_bw6rudjzjcun3z4g.eq(cell, parent) ? [] : [$_cycgn2jvjcun3z41.fromTag('br')];
        });
      }).getOr([]);
    };
    var markContent = function () {
      var content = $_cirynjgjcun3z1x.bind(cells, function (cell) {
        var children = $_9elq0ajxjcun3z47.children(cell);
        return advancedBr(children) ? [] : children.concat(markCell(cell));
      });
      return content.length === 0 ? [$_cycgn2jvjcun3z41.fromTag('br')] : content;
    };
    var contents = markContent();
    $_6u25ksksjcun3z70.empty(cells[0]);
    $_47qp7xktjcun3z72.append(cells[0], contents);
  };
  var $_2n0szym5jcun3zer = { merge: merge };

  var shallow$1 = function (old, nu) {
    return nu;
  };
  var deep$1 = function (old, nu) {
    var bothObjects = $_5lospcjpjcun3z2w.isObject(old) && $_5lospcjpjcun3z2w.isObject(nu);
    return bothObjects ? deepMerge(old, nu) : nu;
  };
  var baseMerge = function (merger) {
    return function () {
      var objects = new Array(arguments.length);
      for (var i = 0; i < objects.length; i++)
        objects[i] = arguments[i];
      if (objects.length === 0)
        throw new Error('Can\'t merge zero objects');
      var ret = {};
      for (var j = 0; j < objects.length; j++) {
        var curObject = objects[j];
        for (var key in curObject)
          if (curObject.hasOwnProperty(key)) {
            ret[key] = merger(ret[key], curObject[key]);
          }
      }
      return ret;
    };
  };
  var deepMerge = baseMerge(deep$1);
  var merge$1 = baseMerge(shallow$1);
  var $_3n7fqum9jcun3zfw = {
    deepMerge: deepMerge,
    merge: merge$1
  };

  var cat = function (arr) {
    var r = [];
    var push = function (x) {
      r.push(x);
    };
    for (var i = 0; i < arr.length; i++) {
      arr[i].each(push);
    }
    return r;
  };
  var findMap = function (arr, f) {
    for (var i = 0; i < arr.length; i++) {
      var r = f(arr[i], i);
      if (r.isSome()) {
        return r;
      }
    }
    return $_dx6m1ljhjcun3z22.none();
  };
  var liftN = function (arr, f) {
    var r = [];
    for (var i = 0; i < arr.length; i++) {
      var x = arr[i];
      if (x.isSome()) {
        r.push(x.getOrDie());
      } else {
        return $_dx6m1ljhjcun3z22.none();
      }
    }
    return $_dx6m1ljhjcun3z22.some(f.apply(null, r));
  };
  var $_cat2nnmajcun3zfy = {
    cat: cat,
    findMap: findMap,
    liftN: liftN
  };

  var addCell = function (gridRow, index, cell) {
    var cells = gridRow.cells();
    var before = cells.slice(0, index);
    var after = cells.slice(index);
    var newCells = before.concat([cell]).concat(after);
    return setCells(gridRow, newCells);
  };
  var mutateCell = function (gridRow, index, cell) {
    var cells = gridRow.cells();
    cells[index] = cell;
  };
  var setCells = function (gridRow, cells) {
    return $_bt8aj2jrjcun3z34.rowcells(cells, gridRow.section());
  };
  var mapCells = function (gridRow, f) {
    var cells = gridRow.cells();
    var r = $_cirynjgjcun3z1x.map(cells, f);
    return $_bt8aj2jrjcun3z34.rowcells(r, gridRow.section());
  };
  var getCell = function (gridRow, index) {
    return gridRow.cells()[index];
  };
  var getCellElement = function (gridRow, index) {
    return getCell(gridRow, index).element();
  };
  var cellLength = function (gridRow) {
    return gridRow.cells().length;
  };
  var $_28uu0smdjcun3zgb = {
    addCell: addCell,
    setCells: setCells,
    mutateCell: mutateCell,
    getCell: getCell,
    getCellElement: getCellElement,
    mapCells: mapCells,
    cellLength: cellLength
  };

  var getColumn = function (grid, index) {
    return $_cirynjgjcun3z1x.map(grid, function (row) {
      return $_28uu0smdjcun3zgb.getCell(row, index);
    });
  };
  var getRow = function (grid, index) {
    return grid[index];
  };
  var findDiff = function (xs, comp) {
    if (xs.length === 0)
      return 0;
    var first = xs[0];
    var index = $_cirynjgjcun3z1x.findIndex(xs, function (x) {
      return !comp(first.element(), x.element());
    });
    return index.fold(function () {
      return xs.length;
    }, function (ind) {
      return ind;
    });
  };
  var subgrid = function (grid, row, column, comparator) {
    var restOfRow = getRow(grid, row).cells().slice(column);
    var endColIndex = findDiff(restOfRow, comparator);
    var restOfColumn = getColumn(grid, column).slice(row);
    var endRowIndex = findDiff(restOfColumn, comparator);
    return {
      colspan: $_b55bxvjijcun3z24.constant(endColIndex),
      rowspan: $_b55bxvjijcun3z24.constant(endRowIndex)
    };
  };
  var $_g2m5eymcjcun3zg6 = { subgrid: subgrid };

  var toDetails = function (grid, comparator) {
    var seen = $_cirynjgjcun3z1x.map(grid, function (row, ri) {
      return $_cirynjgjcun3z1x.map(row.cells(), function (col, ci) {
        return false;
      });
    });
    var updateSeen = function (ri, ci, rowspan, colspan) {
      for (var r = ri; r < ri + rowspan; r++) {
        for (var c = ci; c < ci + colspan; c++) {
          seen[r][c] = true;
        }
      }
    };
    return $_cirynjgjcun3z1x.map(grid, function (row, ri) {
      var details = $_cirynjgjcun3z1x.bind(row.cells(), function (cell, ci) {
        if (seen[ri][ci] === false) {
          var result = $_g2m5eymcjcun3zg6.subgrid(grid, ri, ci, comparator);
          updateSeen(ri, ci, result.rowspan(), result.colspan());
          return [$_bt8aj2jrjcun3z34.detailnew(cell.element(), result.rowspan(), result.colspan(), cell.isNew())];
        } else {
          return [];
        }
      });
      return $_bt8aj2jrjcun3z34.rowdetails(details, row.section());
    });
  };
  var toGrid = function (warehouse, generators, isNew) {
    var grid = [];
    for (var i = 0; i < warehouse.grid().rows(); i++) {
      var rowCells = [];
      for (var j = 0; j < warehouse.grid().columns(); j++) {
        var element = $_dxqn88kojcun3z6j.getAt(warehouse, i, j).map(function (item) {
          return $_bt8aj2jrjcun3z34.elementnew(item.element(), isNew);
        }).getOrThunk(function () {
          return $_bt8aj2jrjcun3z34.elementnew(generators.gap(), true);
        });
        rowCells.push(element);
      }
      var row = $_bt8aj2jrjcun3z34.rowcells(rowCells, warehouse.all()[i].section());
      grid.push(row);
    }
    return grid;
  };
  var $_af2k94mbjcun3zg1 = {
    toDetails: toDetails,
    toGrid: toGrid
  };

  var setIfNot = function (element, property, value, ignore) {
    if (value === ignore)
      $_5qpsynkgjcun3z5t.remove(element, property);
    else
      $_5qpsynkgjcun3z5t.set(element, property, value);
  };
  var render$1 = function (table, grid) {
    var newRows = [];
    var newCells = [];
    var renderSection = function (gridSection, sectionName) {
      var section = $_avmzmkkljcun3z67.child(table, sectionName).getOrThunk(function () {
        var tb = $_cycgn2jvjcun3z41.fromTag(sectionName, $_9elq0ajxjcun3z47.owner(table).dom());
        $_f610dckrjcun3z6y.append(table, tb);
        return tb;
      });
      $_6u25ksksjcun3z70.empty(section);
      var rows = $_cirynjgjcun3z1x.map(gridSection, function (row) {
        if (row.isNew()) {
          newRows.push(row.element());
        }
        var tr = row.element();
        $_6u25ksksjcun3z70.empty(tr);
        $_cirynjgjcun3z1x.each(row.cells(), function (cell) {
          if (cell.isNew()) {
            newCells.push(cell.element());
          }
          setIfNot(cell.element(), 'colspan', cell.colspan(), 1);
          setIfNot(cell.element(), 'rowspan', cell.rowspan(), 1);
          $_f610dckrjcun3z6y.append(tr, cell.element());
        });
        return tr;
      });
      $_47qp7xktjcun3z72.append(section, rows);
    };
    var removeSection = function (sectionName) {
      $_avmzmkkljcun3z67.child(table, sectionName).bind($_6u25ksksjcun3z70.remove);
    };
    var renderOrRemoveSection = function (gridSection, sectionName) {
      if (gridSection.length > 0) {
        renderSection(gridSection, sectionName);
      } else {
        removeSection(sectionName);
      }
    };
    var headSection = [];
    var bodySection = [];
    var footSection = [];
    $_cirynjgjcun3z1x.each(grid, function (row) {
      switch (row.section()) {
      case 'thead':
        headSection.push(row);
        break;
      case 'tbody':
        bodySection.push(row);
        break;
      case 'tfoot':
        footSection.push(row);
        break;
      }
    });
    renderOrRemoveSection(headSection, 'thead');
    renderOrRemoveSection(bodySection, 'tbody');
    renderOrRemoveSection(footSection, 'tfoot');
    return {
      newRows: $_b55bxvjijcun3z24.constant(newRows),
      newCells: $_b55bxvjijcun3z24.constant(newCells)
    };
  };
  var copy$2 = function (grid) {
    var rows = $_cirynjgjcun3z1x.map(grid, function (row) {
      var tr = $_367bwxkvjcun3z7t.shallow(row.element());
      $_cirynjgjcun3z1x.each(row.cells(), function (cell) {
        var clonedCell = $_367bwxkvjcun3z7t.deep(cell.element());
        setIfNot(clonedCell, 'colspan', cell.colspan(), 1);
        setIfNot(clonedCell, 'rowspan', cell.rowspan(), 1);
        $_f610dckrjcun3z6y.append(tr, clonedCell);
      });
      return tr;
    });
    return rows;
  };
  var $_2ng4vdmejcun3zge = {
    render: render$1,
    copy: copy$2
  };

  var repeat = function (repititions, f) {
    var r = [];
    for (var i = 0; i < repititions; i++) {
      r.push(f(i));
    }
    return r;
  };
  var range$1 = function (start, end) {
    var r = [];
    for (var i = start; i < end; i++) {
      r.push(i);
    }
    return r;
  };
  var unique = function (xs, comparator) {
    var result = [];
    $_cirynjgjcun3z1x.each(xs, function (x, i) {
      if (i < xs.length - 1 && !comparator(x, xs[i + 1])) {
        result.push(x);
      } else if (i === xs.length - 1) {
        result.push(x);
      }
    });
    return result;
  };
  var deduce = function (xs, index) {
    if (index < 0 || index >= xs.length - 1)
      return $_dx6m1ljhjcun3z22.none();
    var current = xs[index].fold(function () {
      var rest = $_cirynjgjcun3z1x.reverse(xs.slice(0, index));
      return $_cat2nnmajcun3zfy.findMap(rest, function (a, i) {
        return a.map(function (aa) {
          return {
            value: aa,
            delta: i + 1
          };
        });
      });
    }, function (c) {
      return $_dx6m1ljhjcun3z22.some({
        value: c,
        delta: 0
      });
    });
    var next = xs[index + 1].fold(function () {
      var rest = xs.slice(index + 1);
      return $_cat2nnmajcun3zfy.findMap(rest, function (a, i) {
        return a.map(function (aa) {
          return {
            value: aa,
            delta: i + 1
          };
        });
      });
    }, function (n) {
      return $_dx6m1ljhjcun3z22.some({
        value: n,
        delta: 1
      });
    });
    return current.bind(function (c) {
      return next.map(function (n) {
        var extras = n.delta + c.delta;
        return Math.abs(n.value - c.value) / extras;
      });
    });
  };
  var $_1vmg04mhjcun3zh9 = {
    repeat: repeat,
    range: range$1,
    unique: unique,
    deduce: deduce
  };

  var columns = function (warehouse) {
    var grid = warehouse.grid();
    var cols = $_1vmg04mhjcun3zh9.range(0, grid.columns());
    var rows = $_1vmg04mhjcun3zh9.range(0, grid.rows());
    return $_cirynjgjcun3z1x.map(cols, function (col) {
      var getBlock = function () {
        return $_cirynjgjcun3z1x.bind(rows, function (r) {
          return $_dxqn88kojcun3z6j.getAt(warehouse, r, col).filter(function (detail) {
            return detail.column() === col;
          }).fold($_b55bxvjijcun3z24.constant([]), function (detail) {
            return [detail];
          });
        });
      };
      var isSingle = function (detail) {
        return detail.colspan() === 1;
      };
      var getFallback = function () {
        return $_dxqn88kojcun3z6j.getAt(warehouse, 0, col);
      };
      return decide(getBlock, isSingle, getFallback);
    });
  };
  var decide = function (getBlock, isSingle, getFallback) {
    var inBlock = getBlock();
    var singleInBlock = $_cirynjgjcun3z1x.find(inBlock, isSingle);
    var detailOption = singleInBlock.orThunk(function () {
      return $_dx6m1ljhjcun3z22.from(inBlock[0]).orThunk(getFallback);
    });
    return detailOption.map(function (detail) {
      return detail.element();
    });
  };
  var rows$1 = function (warehouse) {
    var grid = warehouse.grid();
    var rows = $_1vmg04mhjcun3zh9.range(0, grid.rows());
    var cols = $_1vmg04mhjcun3zh9.range(0, grid.columns());
    return $_cirynjgjcun3z1x.map(rows, function (row) {
      var getBlock = function () {
        return $_cirynjgjcun3z1x.bind(cols, function (c) {
          return $_dxqn88kojcun3z6j.getAt(warehouse, row, c).filter(function (detail) {
            return detail.row() === row;
          }).fold($_b55bxvjijcun3z24.constant([]), function (detail) {
            return [detail];
          });
        });
      };
      var isSingle = function (detail) {
        return detail.rowspan() === 1;
      };
      var getFallback = function () {
        return $_dxqn88kojcun3z6j.getAt(warehouse, row, 0);
      };
      return decide(getBlock, isSingle, getFallback);
    });
  };
  var $_5a8m1bmgjcun3zh3 = {
    columns: columns,
    rows: rows$1
  };

  var col = function (column, x, y, w, h) {
    var blocker = $_cycgn2jvjcun3z41.fromTag('div');
    $_7vp61rkpjcun3z6o.setAll(blocker, {
      position: 'absolute',
      left: x - w / 2 + 'px',
      top: y + 'px',
      height: h + 'px',
      width: w + 'px'
    });
    $_5qpsynkgjcun3z5t.setAll(blocker, {
      'data-column': column,
      'role': 'presentation'
    });
    return blocker;
  };
  var row$1 = function (row, x, y, w, h) {
    var blocker = $_cycgn2jvjcun3z41.fromTag('div');
    $_7vp61rkpjcun3z6o.setAll(blocker, {
      position: 'absolute',
      left: x + 'px',
      top: y - h / 2 + 'px',
      height: h + 'px',
      width: w + 'px'
    });
    $_5qpsynkgjcun3z5t.setAll(blocker, {
      'data-row': row,
      'role': 'presentation'
    });
    return blocker;
  };
  var $_60o8w3mijcun3zhl = {
    col: col,
    row: row$1
  };

  var css = function (namespace) {
    var dashNamespace = namespace.replace(/\./g, '-');
    var resolve = function (str) {
      return dashNamespace + '-' + str;
    };
    return { resolve: resolve };
  };
  var $_dzxsgqmkjcun3zht = { css: css };

  var styles = $_dzxsgqmkjcun3zht.css('ephox-snooker');
  var $_2gwvwimjjcun3zhq = { resolve: styles.resolve };

  var Toggler = function (turnOff, turnOn, initial) {
    var active = initial || false;
    var on = function () {
      turnOn();
      active = true;
    };
    var off = function () {
      turnOff();
      active = false;
    };
    var toggle = function () {
      var f = active ? off : on;
      f();
    };
    var isOn = function () {
      return active;
    };
    return {
      on: on,
      off: off,
      toggle: toggle,
      isOn: isOn
    };
  };

  var read = function (element, attr) {
    var value = $_5qpsynkgjcun3z5t.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add$2 = function (element, attr, id) {
    var old = read(element, attr);
    var nu = old.concat([id]);
    $_5qpsynkgjcun3z5t.set(element, attr, nu.join(' '));
  };
  var remove$5 = function (element, attr, id) {
    var nu = $_cirynjgjcun3z1x.filter(read(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_5qpsynkgjcun3z5t.set(element, attr, nu.join(' '));
    else
      $_5qpsynkgjcun3z5t.remove(element, attr);
  };
  var $_73o5vdmojcun3zi0 = {
    read: read,
    add: add$2,
    remove: remove$5
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$7 = function (element) {
    return $_73o5vdmojcun3zi0.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_73o5vdmojcun3zi0.add(element, 'class', clazz);
  };
  var remove$4 = function (element, clazz) {
    return $_73o5vdmojcun3zi0.remove(element, 'class', clazz);
  };
  var toggle$1 = function (element, clazz) {
    if ($_cirynjgjcun3z1x.contains(get$7(element), clazz)) {
      remove$4(element, clazz);
    } else {
      add$1(element, clazz);
    }
  };
  var $_fea8v5mnjcun3zhy = {
    get: get$7,
    add: add$1,
    remove: remove$4,
    toggle: toggle$1,
    supports: supports
  };

  var add = function (element, clazz) {
    if ($_fea8v5mnjcun3zhy.supports(element))
      element.dom().classList.add(clazz);
    else
      $_fea8v5mnjcun3zhy.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_fea8v5mnjcun3zhy.supports(element) ? element.dom().classList : $_fea8v5mnjcun3zhy.get(element);
    if (classList.length === 0) {
      $_5qpsynkgjcun3z5t.remove(element, 'class');
    }
  };
  var remove$3 = function (element, clazz) {
    if ($_fea8v5mnjcun3zhy.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_fea8v5mnjcun3zhy.remove(element, clazz);
    cleanClass(element);
  };
  var toggle = function (element, clazz) {
    return $_fea8v5mnjcun3zhy.supports(element) ? element.dom().classList.toggle(clazz) : $_fea8v5mnjcun3zhy.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_fea8v5mnjcun3zhy.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_fea8v5mnjcun3zhy.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_fea8v5mnjcun3zhy.add(element, clazz);
    };
    return Toggler(off, on, has$1(element, clazz));
  };
  var has$1 = function (element, clazz) {
    return $_fea8v5mnjcun3zhy.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_6f75fomljcun3zhv = {
    add: add,
    remove: remove$3,
    toggle: toggle,
    toggler: toggler,
    has: has$1
  };

  var resizeBar = $_2gwvwimjjcun3zhq.resolve('resizer-bar');
  var resizeRowBar = $_2gwvwimjjcun3zhq.resolve('resizer-rows');
  var resizeColBar = $_2gwvwimjjcun3zhq.resolve('resizer-cols');
  var BAR_THICKNESS = 7;
  var clear = function (wire) {
    var previous = $_7pi6mukijcun3z61.descendants(wire.parent(), '.' + resizeBar);
    $_cirynjgjcun3z1x.each(previous, $_6u25ksksjcun3z70.remove);
  };
  var drawBar = function (wire, positions, create) {
    var origin = wire.origin();
    $_cirynjgjcun3z1x.each(positions, function (cpOption, i) {
      cpOption.each(function (cp) {
        var bar = create(origin, cp);
        $_6f75fomljcun3zhv.add(bar, resizeBar);
        $_f610dckrjcun3z6y.append(wire.parent(), bar);
      });
    });
  };
  var refreshCol = function (wire, colPositions, position, tableHeight) {
    drawBar(wire, colPositions, function (origin, cp) {
      var colBar = $_60o8w3mijcun3zhl.col(cp.col(), cp.x() - origin.left(), position.top() - origin.top(), BAR_THICKNESS, tableHeight);
      $_6f75fomljcun3zhv.add(colBar, resizeColBar);
      return colBar;
    });
  };
  var refreshRow = function (wire, rowPositions, position, tableWidth) {
    drawBar(wire, rowPositions, function (origin, cp) {
      var rowBar = $_60o8w3mijcun3zhl.row(cp.row(), position.left() - origin.left(), cp.y() - origin.top(), tableWidth, BAR_THICKNESS);
      $_6f75fomljcun3zhv.add(rowBar, resizeRowBar);
      return rowBar;
    });
  };
  var refreshGrid = function (wire, table, rows, cols, hdirection, vdirection) {
    var position = $_3qiue4lxjcun3zdk.absolute(table);
    var rowPositions = rows.length > 0 ? hdirection.positions(rows, table) : [];
    refreshRow(wire, rowPositions, position, $_1a9a5mltjcun3zd7.getOuter(table));
    var colPositions = cols.length > 0 ? vdirection.positions(cols, table) : [];
    refreshCol(wire, colPositions, position, $_4ev4k9lrjcun3zd0.getOuter(table));
  };
  var refresh = function (wire, table, hdirection, vdirection) {
    clear(wire);
    var list = $_cwbx7zjqjcun3z2x.fromTable(table);
    var warehouse = $_dxqn88kojcun3z6j.generate(list);
    var rows = $_5a8m1bmgjcun3zh3.rows(warehouse);
    var cols = $_5a8m1bmgjcun3zh3.columns(warehouse);
    refreshGrid(wire, table, rows, cols, hdirection, vdirection);
  };
  var each$2 = function (wire, f) {
    var bars = $_7pi6mukijcun3z61.descendants(wire.parent(), '.' + resizeBar);
    $_cirynjgjcun3z1x.each(bars, f);
  };
  var hide = function (wire) {
    each$2(wire, function (bar) {
      $_7vp61rkpjcun3z6o.set(bar, 'display', 'none');
    });
  };
  var show = function (wire) {
    each$2(wire, function (bar) {
      $_7vp61rkpjcun3z6o.set(bar, 'display', 'block');
    });
  };
  var isRowBar = function (element) {
    return $_6f75fomljcun3zhv.has(element, resizeRowBar);
  };
  var isColBar = function (element) {
    return $_6f75fomljcun3zhv.has(element, resizeColBar);
  };
  var $_f8c83cmfjcun3zgr = {
    refresh: refresh,
    hide: hide,
    show: show,
    destroy: clear,
    isRowBar: isRowBar,
    isColBar: isColBar
  };

  var fromWarehouse = function (warehouse, generators) {
    return $_af2k94mbjcun3zg1.toGrid(warehouse, generators, false);
  };
  var deriveRows = function (rendered, generators) {
    var findRow = function (details) {
      var rowOfCells = $_cat2nnmajcun3zfy.findMap(details, function (detail) {
        return $_9elq0ajxjcun3z47.parent(detail.element()).map(function (row) {
          var isNew = $_9elq0ajxjcun3z47.parent(row).isNone();
          return $_bt8aj2jrjcun3z34.elementnew(row, isNew);
        });
      });
      return rowOfCells.getOrThunk(function () {
        return $_bt8aj2jrjcun3z34.elementnew(generators.row(), true);
      });
    };
    return $_cirynjgjcun3z1x.map(rendered, function (details) {
      var row = findRow(details.details());
      return $_bt8aj2jrjcun3z34.rowdatanew(row.element(), details.details(), details.section(), row.isNew());
    });
  };
  var toDetailList = function (grid, generators) {
    var rendered = $_af2k94mbjcun3zg1.toDetails(grid, $_bw6rudjzjcun3z4g.eq);
    return deriveRows(rendered, generators);
  };
  var findInWarehouse = function (warehouse, element) {
    var all = $_cirynjgjcun3z1x.flatten($_cirynjgjcun3z1x.map(warehouse.all(), function (r) {
      return r.cells();
    }));
    return $_cirynjgjcun3z1x.find(all, function (e) {
      return $_bw6rudjzjcun3z4g.eq(element, e.element());
    });
  };
  var run = function (operation, extract, adjustment, postAction, genWrappers) {
    return function (wire, table, target, generators, direction) {
      var input = $_cwbx7zjqjcun3z2x.fromTable(table);
      var warehouse = $_dxqn88kojcun3z6j.generate(input);
      var output = extract(warehouse, target).map(function (info) {
        var model = fromWarehouse(warehouse, generators);
        var result = operation(model, info, $_bw6rudjzjcun3z4g.eq, genWrappers(generators));
        var grid = toDetailList(result.grid(), generators);
        return {
          grid: $_b55bxvjijcun3z24.constant(grid),
          cursor: result.cursor
        };
      });
      return output.fold(function () {
        return $_dx6m1ljhjcun3z22.none();
      }, function (out) {
        var newElements = $_2ng4vdmejcun3zge.render(table, out.grid());
        adjustment(table, out.grid(), direction);
        postAction(table);
        $_f8c83cmfjcun3zgr.refresh(wire, table, $_ea5q41lwjcun3zdb.height, direction);
        return $_dx6m1ljhjcun3z22.some({
          cursor: out.cursor,
          newRows: newElements.newRows,
          newCells: newElements.newCells
        });
      });
    };
  };
  var onCell = function (warehouse, target) {
    return $_b7drosjsjcun3z37.cell(target.element()).bind(function (cell) {
      return findInWarehouse(warehouse, cell);
    });
  };
  var onPaste = function (warehouse, target) {
    return $_b7drosjsjcun3z37.cell(target.element()).bind(function (cell) {
      return findInWarehouse(warehouse, cell).map(function (details) {
        return $_3n7fqum9jcun3zfw.merge(details, {
          generators: target.generators,
          clipboard: target.clipboard
        });
      });
    });
  };
  var onPasteRows = function (warehouse, target) {
    var details = $_cirynjgjcun3z1x.map(target.selection(), function (cell) {
      return $_b7drosjsjcun3z37.cell(cell).bind(function (lc) {
        return findInWarehouse(warehouse, lc);
      });
    });
    var cells = $_cat2nnmajcun3zfy.cat(details);
    return cells.length > 0 ? $_dx6m1ljhjcun3z22.some($_3n7fqum9jcun3zfw.merge({ cells: cells }, {
      generators: target.generators,
      clipboard: target.clipboard
    })) : $_dx6m1ljhjcun3z22.none();
  };
  var onMergable = function (warehouse, target) {
    return target.mergable();
  };
  var onUnmergable = function (warehouse, target) {
    return target.unmergable();
  };
  var onCells = function (warehouse, target) {
    var details = $_cirynjgjcun3z1x.map(target.selection(), function (cell) {
      return $_b7drosjsjcun3z37.cell(cell).bind(function (lc) {
        return findInWarehouse(warehouse, lc);
      });
    });
    var cells = $_cat2nnmajcun3zfy.cat(details);
    return cells.length > 0 ? $_dx6m1ljhjcun3z22.some(cells) : $_dx6m1ljhjcun3z22.none();
  };
  var $_dlm5k2m8jcun3zfc = {
    run: run,
    toDetailList: toDetailList,
    onCell: onCell,
    onCells: onCells,
    onPaste: onPaste,
    onPasteRows: onPasteRows,
    onMergable: onMergable,
    onUnmergable: onUnmergable
  };

  var value$1 = function (o) {
    var is = function (v) {
      return o === v;
    };
    var or = function (opt) {
      return value$1(o);
    };
    var orThunk = function (f) {
      return value$1(o);
    };
    var map = function (f) {
      return value$1(f(o));
    };
    var each = function (f) {
      f(o);
    };
    var bind = function (f) {
      return f(o);
    };
    var fold = function (_, onValue) {
      return onValue(o);
    };
    var exists = function (f) {
      return f(o);
    };
    var forall = function (f) {
      return f(o);
    };
    var toOption = function () {
      return $_dx6m1ljhjcun3z22.some(o);
    };
    return {
      is: is,
      isValue: $_b55bxvjijcun3z24.constant(true),
      isError: $_b55bxvjijcun3z24.constant(false),
      getOr: $_b55bxvjijcun3z24.constant(o),
      getOrThunk: $_b55bxvjijcun3z24.constant(o),
      getOrDie: $_b55bxvjijcun3z24.constant(o),
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: each,
      bind: bind,
      exists: exists,
      forall: forall,
      toOption: toOption
    };
  };
  var error = function (message) {
    var getOrThunk = function (f) {
      return f();
    };
    var getOrDie = function () {
      return $_b55bxvjijcun3z24.die(message)();
    };
    var or = function (opt) {
      return opt;
    };
    var orThunk = function (f) {
      return f();
    };
    var map = function (f) {
      return error(message);
    };
    var bind = function (f) {
      return error(message);
    };
    var fold = function (onError, _) {
      return onError(message);
    };
    return {
      is: $_b55bxvjijcun3z24.constant(false),
      isValue: $_b55bxvjijcun3z24.constant(false),
      isError: $_b55bxvjijcun3z24.constant(true),
      getOr: $_b55bxvjijcun3z24.identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: $_b55bxvjijcun3z24.noop,
      bind: bind,
      exists: $_b55bxvjijcun3z24.constant(false),
      forall: $_b55bxvjijcun3z24.constant(true),
      toOption: $_dx6m1ljhjcun3z22.none
    };
  };
  var $_b05o8omrjcun3zic = {
    value: value$1,
    error: error
  };

  var measure = function (startAddress, gridA, gridB) {
    if (startAddress.row() >= gridA.length || startAddress.column() > $_28uu0smdjcun3zgb.cellLength(gridA[0]))
      return $_b05o8omrjcun3zic.error('invalid start address out of table bounds, row: ' + startAddress.row() + ', column: ' + startAddress.column());
    var rowRemainder = gridA.slice(startAddress.row());
    var colRemainder = rowRemainder[0].cells().slice(startAddress.column());
    var colRequired = $_28uu0smdjcun3zgb.cellLength(gridB[0]);
    var rowRequired = gridB.length;
    return $_b05o8omrjcun3zic.value({
      rowDelta: $_b55bxvjijcun3z24.constant(rowRemainder.length - rowRequired),
      colDelta: $_b55bxvjijcun3z24.constant(colRemainder.length - colRequired)
    });
  };
  var measureWidth = function (gridA, gridB) {
    var colLengthA = $_28uu0smdjcun3zgb.cellLength(gridA[0]);
    var colLengthB = $_28uu0smdjcun3zgb.cellLength(gridB[0]);
    return {
      rowDelta: $_b55bxvjijcun3z24.constant(0),
      colDelta: $_b55bxvjijcun3z24.constant(colLengthA - colLengthB)
    };
  };
  var fill = function (cells, generator) {
    return $_cirynjgjcun3z1x.map(cells, function () {
      return $_bt8aj2jrjcun3z34.elementnew(generator.cell(), true);
    });
  };
  var rowFill = function (grid, amount, generator) {
    return grid.concat($_1vmg04mhjcun3zh9.repeat(amount, function (_row) {
      return $_28uu0smdjcun3zgb.setCells(grid[grid.length - 1], fill(grid[grid.length - 1].cells(), generator));
    }));
  };
  var colFill = function (grid, amount, generator) {
    return $_cirynjgjcun3z1x.map(grid, function (row) {
      return $_28uu0smdjcun3zgb.setCells(row, row.cells().concat(fill($_1vmg04mhjcun3zh9.range(0, amount), generator)));
    });
  };
  var tailor = function (gridA, delta, generator) {
    var fillCols = delta.colDelta() < 0 ? colFill : $_b55bxvjijcun3z24.identity;
    var fillRows = delta.rowDelta() < 0 ? rowFill : $_b55bxvjijcun3z24.identity;
    var modifiedCols = fillCols(gridA, Math.abs(delta.colDelta()), generator);
    var tailoredGrid = fillRows(modifiedCols, Math.abs(delta.rowDelta()), generator);
    return tailoredGrid;
  };
  var $_evp9wemqjcun3zi7 = {
    measure: measure,
    measureWidth: measureWidth,
    tailor: tailor
  };

  var merge$3 = function (grid, bounds, comparator, substitution) {
    if (grid.length === 0)
      return grid;
    for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
      for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
        $_28uu0smdjcun3zgb.mutateCell(grid[i], j, $_bt8aj2jrjcun3z34.elementnew(substitution(), false));
      }
    }
    return grid;
  };
  var unmerge = function (grid, target, comparator, substitution) {
    var first = true;
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < $_28uu0smdjcun3zgb.cellLength(grid[0]); j++) {
        var current = $_28uu0smdjcun3zgb.getCellElement(grid[i], j);
        var isToReplace = comparator(current, target);
        if (isToReplace === true && first === false) {
          $_28uu0smdjcun3zgb.mutateCell(grid[i], j, $_bt8aj2jrjcun3z34.elementnew(substitution(), true));
        } else if (isToReplace === true) {
          first = false;
        }
      }
    }
    return grid;
  };
  var uniqueCells = function (row, comparator) {
    return $_cirynjgjcun3z1x.foldl(row, function (rest, cell) {
      return $_cirynjgjcun3z1x.exists(rest, function (currentCell) {
        return comparator(currentCell.element(), cell.element());
      }) ? rest : rest.concat([cell]);
    }, []);
  };
  var splitRows = function (grid, index, comparator, substitution) {
    if (index > 0 && index < grid.length) {
      var rowPrevCells = grid[index - 1].cells();
      var cells = uniqueCells(rowPrevCells, comparator);
      $_cirynjgjcun3z1x.each(cells, function (cell) {
        var replacement = $_dx6m1ljhjcun3z22.none();
        for (var i = index; i < grid.length; i++) {
          for (var j = 0; j < $_28uu0smdjcun3zgb.cellLength(grid[0]); j++) {
            var current = grid[i].cells()[j];
            var isToReplace = comparator(current.element(), cell.element());
            if (isToReplace) {
              if (replacement.isNone()) {
                replacement = $_dx6m1ljhjcun3z22.some(substitution());
              }
              replacement.each(function (sub) {
                $_28uu0smdjcun3zgb.mutateCell(grid[i], j, $_bt8aj2jrjcun3z34.elementnew(sub, true));
              });
            }
          }
        }
      });
    }
    return grid;
  };
  var $_99zyjcmsjcun3zif = {
    merge: merge$3,
    unmerge: unmerge,
    splitRows: splitRows
  };

  var isSpanning = function (grid, row, col, comparator) {
    var candidate = $_28uu0smdjcun3zgb.getCell(grid[row], col);
    var matching = $_b55bxvjijcun3z24.curry(comparator, candidate.element());
    var currentRow = grid[row];
    return grid.length > 1 && $_28uu0smdjcun3zgb.cellLength(currentRow) > 1 && (col > 0 && matching($_28uu0smdjcun3zgb.getCellElement(currentRow, col - 1)) || col < currentRow.length - 1 && matching($_28uu0smdjcun3zgb.getCellElement(currentRow, col + 1)) || row > 0 && matching($_28uu0smdjcun3zgb.getCellElement(grid[row - 1], col)) || row < grid.length - 1 && matching($_28uu0smdjcun3zgb.getCellElement(grid[row + 1], col)));
  };
  var mergeTables = function (startAddress, gridA, gridB, generator, comparator) {
    var startRow = startAddress.row();
    var startCol = startAddress.column();
    var mergeHeight = gridB.length;
    var mergeWidth = $_28uu0smdjcun3zgb.cellLength(gridB[0]);
    var endRow = startRow + mergeHeight;
    var endCol = startCol + mergeWidth;
    for (var r = startRow; r < endRow; r++) {
      for (var c = startCol; c < endCol; c++) {
        if (isSpanning(gridA, r, c, comparator)) {
          $_99zyjcmsjcun3zif.unmerge(gridA, $_28uu0smdjcun3zgb.getCellElement(gridA[r], c), comparator, generator.cell);
        }
        var newCell = $_28uu0smdjcun3zgb.getCellElement(gridB[r - startRow], c - startCol);
        var replacement = generator.replace(newCell);
        $_28uu0smdjcun3zgb.mutateCell(gridA[r], c, $_bt8aj2jrjcun3z34.elementnew(replacement, true));
      }
    }
    return gridA;
  };
  var merge$2 = function (startAddress, gridA, gridB, generator, comparator) {
    var result = $_evp9wemqjcun3zi7.measure(startAddress, gridA, gridB);
    return result.map(function (delta) {
      var fittedGrid = $_evp9wemqjcun3zi7.tailor(gridA, delta, generator);
      return mergeTables(startAddress, fittedGrid, gridB, generator, comparator);
    });
  };
  var insert$1 = function (index, gridA, gridB, generator, comparator) {
    $_99zyjcmsjcun3zif.splitRows(gridA, index, comparator, generator.cell);
    var delta = $_evp9wemqjcun3zi7.measureWidth(gridB, gridA);
    var fittedNewGrid = $_evp9wemqjcun3zi7.tailor(gridB, delta, generator);
    var secondDelta = $_evp9wemqjcun3zi7.measureWidth(gridA, fittedNewGrid);
    var fittedOldGrid = $_evp9wemqjcun3zi7.tailor(gridA, secondDelta, generator);
    return fittedOldGrid.slice(0, index).concat(fittedNewGrid).concat(fittedOldGrid.slice(index, fittedOldGrid.length));
  };
  var $_47ogrdmpjcun3zi4 = {
    merge: merge$2,
    insert: insert$1
  };

  var insertRowAt = function (grid, index, example, comparator, substitution) {
    var before = grid.slice(0, index);
    var after = grid.slice(index);
    var between = $_28uu0smdjcun3zgb.mapCells(grid[example], function (ex, c) {
      var withinSpan = index > 0 && index < grid.length && comparator($_28uu0smdjcun3zgb.getCellElement(grid[index - 1], c), $_28uu0smdjcun3zgb.getCellElement(grid[index], c));
      var ret = withinSpan ? $_28uu0smdjcun3zgb.getCell(grid[index], c) : $_bt8aj2jrjcun3z34.elementnew(substitution(ex.element(), comparator), true);
      return ret;
    });
    return before.concat([between]).concat(after);
  };
  var insertColumnAt = function (grid, index, example, comparator, substitution) {
    return $_cirynjgjcun3z1x.map(grid, function (row) {
      var withinSpan = index > 0 && index < $_28uu0smdjcun3zgb.cellLength(row) && comparator($_28uu0smdjcun3zgb.getCellElement(row, index - 1), $_28uu0smdjcun3zgb.getCellElement(row, index));
      var sub = withinSpan ? $_28uu0smdjcun3zgb.getCell(row, index) : $_bt8aj2jrjcun3z34.elementnew(substitution($_28uu0smdjcun3zgb.getCellElement(row, example), comparator), true);
      return $_28uu0smdjcun3zgb.addCell(row, index, sub);
    });
  };
  var splitCellIntoColumns$1 = function (grid, exampleRow, exampleCol, comparator, substitution) {
    var index = exampleCol + 1;
    return $_cirynjgjcun3z1x.map(grid, function (row, i) {
      var isTargetCell = i === exampleRow;
      var sub = isTargetCell ? $_bt8aj2jrjcun3z34.elementnew(substitution($_28uu0smdjcun3zgb.getCellElement(row, exampleCol), comparator), true) : $_28uu0smdjcun3zgb.getCell(row, exampleCol);
      return $_28uu0smdjcun3zgb.addCell(row, index, sub);
    });
  };
  var splitCellIntoRows$1 = function (grid, exampleRow, exampleCol, comparator, substitution) {
    var index = exampleRow + 1;
    var before = grid.slice(0, index);
    var after = grid.slice(index);
    var between = $_28uu0smdjcun3zgb.mapCells(grid[exampleRow], function (ex, i) {
      var isTargetCell = i === exampleCol;
      return isTargetCell ? $_bt8aj2jrjcun3z34.elementnew(substitution(ex.element(), comparator), true) : ex;
    });
    return before.concat([between]).concat(after);
  };
  var deleteColumnsAt = function (grid, start, finish) {
    var rows = $_cirynjgjcun3z1x.map(grid, function (row) {
      var cells = row.cells().slice(0, start).concat(row.cells().slice(finish + 1));
      return $_bt8aj2jrjcun3z34.rowcells(cells, row.section());
    });
    return $_cirynjgjcun3z1x.filter(rows, function (row) {
      return row.cells().length > 0;
    });
  };
  var deleteRowsAt = function (grid, start, finish) {
    return grid.slice(0, start).concat(grid.slice(finish + 1));
  };
  var $_ylmshmtjcun3zil = {
    insertRowAt: insertRowAt,
    insertColumnAt: insertColumnAt,
    splitCellIntoColumns: splitCellIntoColumns$1,
    splitCellIntoRows: splitCellIntoRows$1,
    deleteRowsAt: deleteRowsAt,
    deleteColumnsAt: deleteColumnsAt
  };

  var replaceIn = function (grid, targets, comparator, substitution) {
    var isTarget = function (cell) {
      return $_cirynjgjcun3z1x.exists(targets, function (target) {
        return comparator(cell.element(), target.element());
      });
    };
    return $_cirynjgjcun3z1x.map(grid, function (row) {
      return $_28uu0smdjcun3zgb.mapCells(row, function (cell) {
        return isTarget(cell) ? $_bt8aj2jrjcun3z34.elementnew(substitution(cell.element(), comparator), true) : cell;
      });
    });
  };
  var notStartRow = function (grid, rowIndex, colIndex, comparator) {
    return $_28uu0smdjcun3zgb.getCellElement(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator($_28uu0smdjcun3zgb.getCellElement(grid[rowIndex - 1], colIndex), $_28uu0smdjcun3zgb.getCellElement(grid[rowIndex], colIndex)));
  };
  var notStartColumn = function (row, index, comparator) {
    return index > 0 && comparator($_28uu0smdjcun3zgb.getCellElement(row, index - 1), $_28uu0smdjcun3zgb.getCellElement(row, index));
  };
  var replaceColumn = function (grid, index, comparator, substitution) {
    var targets = $_cirynjgjcun3z1x.bind(grid, function (row, i) {
      var alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
      return alreadyAdded ? [] : [$_28uu0smdjcun3zgb.getCell(row, index)];
    });
    return replaceIn(grid, targets, comparator, substitution);
  };
  var replaceRow = function (grid, index, comparator, substitution) {
    var targetRow = grid[index];
    var targets = $_cirynjgjcun3z1x.bind(targetRow.cells(), function (item, i) {
      var alreadyAdded = notStartRow(grid, index, i, comparator) || notStartColumn(targetRow, i, comparator);
      return alreadyAdded ? [] : [item];
    });
    return replaceIn(grid, targets, comparator, substitution);
  };
  var $_8as9txmujcun3zir = {
    replaceColumn: replaceColumn,
    replaceRow: replaceRow
  };

  var none$1 = function () {
    return folder(function (n, o, l, m, r) {
      return n();
    });
  };
  var only = function (index) {
    return folder(function (n, o, l, m, r) {
      return o(index);
    });
  };
  var left = function (index, next) {
    return folder(function (n, o, l, m, r) {
      return l(index, next);
    });
  };
  var middle = function (prev, index, next) {
    return folder(function (n, o, l, m, r) {
      return m(prev, index, next);
    });
  };
  var right = function (prev, index) {
    return folder(function (n, o, l, m, r) {
      return r(prev, index);
    });
  };
  var folder = function (fold) {
    return { fold: fold };
  };
  var $_fd4r0ymxjcun3zj6 = {
    none: none$1,
    only: only,
    left: left,
    middle: middle,
    right: right
  };

  var neighbours$1 = function (input, index) {
    if (input.length === 0)
      return $_fd4r0ymxjcun3zj6.none();
    if (input.length === 1)
      return $_fd4r0ymxjcun3zj6.only(0);
    if (index === 0)
      return $_fd4r0ymxjcun3zj6.left(0, 1);
    if (index === input.length - 1)
      return $_fd4r0ymxjcun3zj6.right(index - 1, index);
    if (index > 0 && index < input.length - 1)
      return $_fd4r0ymxjcun3zj6.middle(index - 1, index, index + 1);
    return $_fd4r0ymxjcun3zj6.none();
  };
  var determine = function (input, column, step, tableSize) {
    var result = input.slice(0);
    var context = neighbours$1(input, column);
    var zero = function (array) {
      return $_cirynjgjcun3z1x.map(array, $_b55bxvjijcun3z24.constant(0));
    };
    var onNone = $_b55bxvjijcun3z24.constant(zero(result));
    var onOnly = function (index) {
      return tableSize.singleColumnWidth(result[index], step);
    };
    var onChange = function (index, next) {
      if (step >= 0) {
        var newNext = Math.max(tableSize.minCellWidth(), result[next] - step);
        return zero(result.slice(0, index)).concat([
          step,
          newNext - result[next]
        ]).concat(zero(result.slice(next + 1)));
      } else {
        var newThis = Math.max(tableSize.minCellWidth(), result[index] + step);
        var diffx = result[index] - newThis;
        return zero(result.slice(0, index)).concat([
          newThis - result[index],
          diffx
        ]).concat(zero(result.slice(next + 1)));
      }
    };
    var onLeft = onChange;
    var onMiddle = function (prev, index, next) {
      return onChange(index, next);
    };
    var onRight = function (prev, index) {
      if (step >= 0) {
        return zero(result.slice(0, index)).concat([step]);
      } else {
        var size = Math.max(tableSize.minCellWidth(), result[index] + step);
        return zero(result.slice(0, index)).concat([size - result[index]]);
      }
    };
    return context.fold(onNone, onOnly, onLeft, onMiddle, onRight);
  };
  var $_37iimwmwjcun3zj1 = { determine: determine };

  var getSpan$1 = function (cell, type) {
    return $_5qpsynkgjcun3z5t.has(cell, type) && parseInt($_5qpsynkgjcun3z5t.get(cell, type), 10) > 1;
  };
  var hasColspan = function (cell) {
    return getSpan$1(cell, 'colspan');
  };
  var hasRowspan = function (cell) {
    return getSpan$1(cell, 'rowspan');
  };
  var getInt = function (element, property) {
    return parseInt($_7vp61rkpjcun3z6o.get(element, property), 10);
  };
  var $_d6aivvmzjcun3zjd = {
    hasColspan: hasColspan,
    hasRowspan: hasRowspan,
    minWidth: $_b55bxvjijcun3z24.constant(10),
    minHeight: $_b55bxvjijcun3z24.constant(10),
    getInt: getInt
  };

  var getRaw$1 = function (cell, property, getter) {
    return $_7vp61rkpjcun3z6o.getRaw(cell, property).fold(function () {
      return getter(cell) + 'px';
    }, function (raw) {
      return raw;
    });
  };
  var getRawW = function (cell) {
    return getRaw$1(cell, 'width', $_dhvlh5lpjcun3zci.getPixelWidth);
  };
  var getRawH = function (cell) {
    return getRaw$1(cell, 'height', $_dhvlh5lpjcun3zci.getHeight);
  };
  var getWidthFrom = function (warehouse, direction, getWidth, fallback, tableSize) {
    var columns = $_5a8m1bmgjcun3zh3.columns(warehouse);
    var backups = $_cirynjgjcun3z1x.map(columns, function (cellOption) {
      return cellOption.map(direction.edge);
    });
    return $_cirynjgjcun3z1x.map(columns, function (cellOption, c) {
      var columnCell = cellOption.filter($_b55bxvjijcun3z24.not($_d6aivvmzjcun3zjd.hasColspan));
      return columnCell.fold(function () {
        var deduced = $_1vmg04mhjcun3zh9.deduce(backups, c);
        return fallback(deduced);
      }, function (cell) {
        return getWidth(cell, tableSize);
      });
    });
  };
  var getDeduced = function (deduced) {
    return deduced.map(function (d) {
      return d + 'px';
    }).getOr('');
  };
  var getRawWidths = function (warehouse, direction) {
    return getWidthFrom(warehouse, direction, getRawW, getDeduced);
  };
  var getPercentageWidths = function (warehouse, direction, tableSize) {
    return getWidthFrom(warehouse, direction, $_dhvlh5lpjcun3zci.getPercentageWidth, function (deduced) {
      return deduced.fold(function () {
        return tableSize.minCellWidth();
      }, function (cellWidth) {
        return cellWidth / tableSize.pixelWidth() * 100;
      });
    }, tableSize);
  };
  var getPixelWidths = function (warehouse, direction, tableSize) {
    return getWidthFrom(warehouse, direction, $_dhvlh5lpjcun3zci.getPixelWidth, function (deduced) {
      return deduced.getOrThunk(tableSize.minCellWidth);
    }, tableSize);
  };
  var getHeightFrom = function (warehouse, direction, getHeight, fallback) {
    var rows = $_5a8m1bmgjcun3zh3.rows(warehouse);
    var backups = $_cirynjgjcun3z1x.map(rows, function (cellOption) {
      return cellOption.map(direction.edge);
    });
    return $_cirynjgjcun3z1x.map(rows, function (cellOption, c) {
      var rowCell = cellOption.filter($_b55bxvjijcun3z24.not($_d6aivvmzjcun3zjd.hasRowspan));
      return rowCell.fold(function () {
        var deduced = $_1vmg04mhjcun3zh9.deduce(backups, c);
        return fallback(deduced);
      }, function (cell) {
        return getHeight(cell);
      });
    });
  };
  var getPixelHeights = function (warehouse, direction) {
    return getHeightFrom(warehouse, direction, $_dhvlh5lpjcun3zci.getHeight, function (deduced) {
      return deduced.getOrThunk($_d6aivvmzjcun3zjd.minHeight);
    });
  };
  var getRawHeights = function (warehouse, direction) {
    return getHeightFrom(warehouse, direction, getRawH, getDeduced);
  };
  var $_9ay4cbmyjcun3zj8 = {
    getRawWidths: getRawWidths,
    getPixelWidths: getPixelWidths,
    getPercentageWidths: getPercentageWidths,
    getPixelHeights: getPixelHeights,
    getRawHeights: getRawHeights
  };

  var total = function (start, end, measures) {
    var r = 0;
    for (var i = start; i < end; i++) {
      r += measures[i] !== undefined ? measures[i] : 0;
    }
    return r;
  };
  var recalculateWidth = function (warehouse, widths) {
    var all = $_dxqn88kojcun3z6j.justCells(warehouse);
    return $_cirynjgjcun3z1x.map(all, function (cell) {
      var width = total(cell.column(), cell.column() + cell.colspan(), widths);
      return {
        element: cell.element,
        width: $_b55bxvjijcun3z24.constant(width),
        colspan: cell.colspan
      };
    });
  };
  var recalculateHeight = function (warehouse, heights) {
    var all = $_dxqn88kojcun3z6j.justCells(warehouse);
    return $_cirynjgjcun3z1x.map(all, function (cell) {
      var height = total(cell.row(), cell.row() + cell.rowspan(), heights);
      return {
        element: cell.element,
        height: $_b55bxvjijcun3z24.constant(height),
        rowspan: cell.rowspan
      };
    });
  };
  var matchRowHeight = function (warehouse, heights) {
    return $_cirynjgjcun3z1x.map(warehouse.all(), function (row, i) {
      return {
        element: row.element,
        height: $_b55bxvjijcun3z24.constant(heights[i])
      };
    });
  };
  var $_bspymln0jcun3zjq = {
    recalculateWidth: recalculateWidth,
    recalculateHeight: recalculateHeight,
    matchRowHeight: matchRowHeight
  };

  var percentageSize = function (width, element) {
    var floatWidth = parseFloat(width);
    var pixelWidth = $_1a9a5mltjcun3zd7.get(element);
    var getCellDelta = function (delta) {
      return delta / pixelWidth * 100;
    };
    var singleColumnWidth = function (width, _delta) {
      return [100 - width];
    };
    var minCellWidth = function () {
      return $_d6aivvmzjcun3zjd.minWidth() / pixelWidth * 100;
    };
    var setTableWidth = function (table, _newWidths, delta) {
      var total = floatWidth + delta;
      $_dhvlh5lpjcun3zci.setPercentageWidth(table, total);
    };
    return {
      width: $_b55bxvjijcun3z24.constant(floatWidth),
      pixelWidth: $_b55bxvjijcun3z24.constant(pixelWidth),
      getWidths: $_9ay4cbmyjcun3zj8.getPercentageWidths,
      getCellDelta: getCellDelta,
      singleColumnWidth: singleColumnWidth,
      minCellWidth: minCellWidth,
      setElementWidth: $_dhvlh5lpjcun3zci.setPercentageWidth,
      setTableWidth: setTableWidth
    };
  };
  var pixelSize = function (width) {
    var intWidth = parseInt(width, 10);
    var getCellDelta = $_b55bxvjijcun3z24.identity;
    var singleColumnWidth = function (width, delta) {
      var newNext = Math.max($_d6aivvmzjcun3zjd.minWidth(), width + delta);
      return [newNext - width];
    };
    var setTableWidth = function (table, newWidths, _delta) {
      var total = $_cirynjgjcun3z1x.foldr(newWidths, function (b, a) {
        return b + a;
      }, 0);
      $_dhvlh5lpjcun3zci.setPixelWidth(table, total);
    };
    return {
      width: $_b55bxvjijcun3z24.constant(intWidth),
      pixelWidth: $_b55bxvjijcun3z24.constant(intWidth),
      getWidths: $_9ay4cbmyjcun3zj8.getPixelWidths,
      getCellDelta: getCellDelta,
      singleColumnWidth: singleColumnWidth,
      minCellWidth: $_d6aivvmzjcun3zjd.minWidth,
      setElementWidth: $_dhvlh5lpjcun3zci.setPixelWidth,
      setTableWidth: setTableWidth
    };
  };
  var chooseSize = function (element, width) {
    if ($_dhvlh5lpjcun3zci.percentageBasedSizeRegex().test(width)) {
      var percentMatch = $_dhvlh5lpjcun3zci.percentageBasedSizeRegex().exec(width);
      return percentageSize(percentMatch[1], element);
    } else if ($_dhvlh5lpjcun3zci.pixelBasedSizeRegex().test(width)) {
      var pixelMatch = $_dhvlh5lpjcun3zci.pixelBasedSizeRegex().exec(width);
      return pixelSize(pixelMatch[1]);
    } else {
      var fallbackWidth = $_1a9a5mltjcun3zd7.get(element);
      return pixelSize(fallbackWidth);
    }
  };
  var getTableSize = function (element) {
    var width = $_dhvlh5lpjcun3zci.getRawWidth(element);
    return width.fold(function () {
      var fallbackWidth = $_1a9a5mltjcun3zd7.get(element);
      return pixelSize(fallbackWidth);
    }, function (width) {
      return chooseSize(element, width);
    });
  };
  var $_auop2cn1jcun3zju = { getTableSize: getTableSize };

  var getWarehouse$1 = function (list) {
    return $_dxqn88kojcun3z6j.generate(list);
  };
  var sumUp = function (newSize) {
    return $_cirynjgjcun3z1x.foldr(newSize, function (b, a) {
      return b + a;
    }, 0);
  };
  var getTableWarehouse = function (table) {
    var list = $_cwbx7zjqjcun3z2x.fromTable(table);
    return getWarehouse$1(list);
  };
  var adjustWidth = function (table, delta, index, direction) {
    var tableSize = $_auop2cn1jcun3zju.getTableSize(table);
    var step = tableSize.getCellDelta(delta);
    var warehouse = getTableWarehouse(table);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);
    var deltas = $_37iimwmwjcun3zj1.determine(widths, index, step, tableSize);
    var newWidths = $_cirynjgjcun3z1x.map(deltas, function (dx, i) {
      return dx + widths[i];
    });
    var newSizes = $_bspymln0jcun3zjq.recalculateWidth(warehouse, newWidths);
    $_cirynjgjcun3z1x.each(newSizes, function (cell) {
      tableSize.setElementWidth(cell.element(), cell.width());
    });
    if (index === warehouse.grid().columns() - 1) {
      tableSize.setTableWidth(table, newWidths, step);
    }
  };
  var adjustHeight = function (table, delta, index, direction) {
    var warehouse = getTableWarehouse(table);
    var heights = $_9ay4cbmyjcun3zj8.getPixelHeights(warehouse, direction);
    var newHeights = $_cirynjgjcun3z1x.map(heights, function (dy, i) {
      return index === i ? Math.max(delta + dy, $_d6aivvmzjcun3zjd.minHeight()) : dy;
    });
    var newCellSizes = $_bspymln0jcun3zjq.recalculateHeight(warehouse, newHeights);
    var newRowSizes = $_bspymln0jcun3zjq.matchRowHeight(warehouse, newHeights);
    $_cirynjgjcun3z1x.each(newRowSizes, function (row) {
      $_dhvlh5lpjcun3zci.setHeight(row.element(), row.height());
    });
    $_cirynjgjcun3z1x.each(newCellSizes, function (cell) {
      $_dhvlh5lpjcun3zci.setHeight(cell.element(), cell.height());
    });
    var total = sumUp(newHeights);
    $_dhvlh5lpjcun3zci.setHeight(table, total);
  };
  var adjustWidthTo = function (table, list, direction) {
    var tableSize = $_auop2cn1jcun3zju.getTableSize(table);
    var warehouse = getWarehouse$1(list);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);
    var newSizes = $_bspymln0jcun3zjq.recalculateWidth(warehouse, widths);
    $_cirynjgjcun3z1x.each(newSizes, function (cell) {
      tableSize.setElementWidth(cell.element(), cell.width());
    });
    var total = $_cirynjgjcun3z1x.foldr(widths, function (b, a) {
      return a + b;
    }, 0);
    if (newSizes.length > 0) {
      tableSize.setElementWidth(table, total);
    }
  };
  var $_1or5qumvjcun3ziw = {
    adjustWidth: adjustWidth,
    adjustHeight: adjustHeight,
    adjustWidthTo: adjustWidthTo
  };

  var prune = function (table) {
    var cells = $_b7drosjsjcun3z37.cells(table);
    if (cells.length === 0)
      $_6u25ksksjcun3z70.remove(table);
  };
  var outcome = $_asy2ehjljcun3z2p.immutable('grid', 'cursor');
  var elementFromGrid = function (grid, row, column) {
    return findIn(grid, row, column).orThunk(function () {
      return findIn(grid, 0, 0);
    });
  };
  var findIn = function (grid, row, column) {
    return $_dx6m1ljhjcun3z22.from(grid[row]).bind(function (r) {
      return $_dx6m1ljhjcun3z22.from(r.cells()[column]).bind(function (c) {
        return $_dx6m1ljhjcun3z22.from(c.element());
      });
    });
  };
  var bundle = function (grid, row, column) {
    return outcome(grid, findIn(grid, row, column));
  };
  var uniqueRows = function (details) {
    return $_cirynjgjcun3z1x.foldl(details, function (rest, detail) {
      return $_cirynjgjcun3z1x.exists(rest, function (currentDetail) {
        return currentDetail.row() === detail.row();
      }) ? rest : rest.concat([detail]);
    }, []).sort(function (detailA, detailB) {
      return detailA.row() - detailB.row();
    });
  };
  var uniqueColumns = function (details) {
    return $_cirynjgjcun3z1x.foldl(details, function (rest, detail) {
      return $_cirynjgjcun3z1x.exists(rest, function (currentDetail) {
        return currentDetail.column() === detail.column();
      }) ? rest : rest.concat([detail]);
    }, []).sort(function (detailA, detailB) {
      return detailA.column() - detailB.column();
    });
  };
  var insertRowBefore = function (grid, detail, comparator, genWrappers) {
    var example = detail.row();
    var targetIndex = detail.row();
    var newGrid = $_ylmshmtjcun3zil.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, targetIndex, detail.column());
  };
  var insertRowsBefore = function (grid, details, comparator, genWrappers) {
    var example = details[0].row();
    var targetIndex = details[0].row();
    var rows = uniqueRows(details);
    var newGrid = $_cirynjgjcun3z1x.foldl(rows, function (newGrid, _row) {
      return $_ylmshmtjcun3zil.insertRowAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, targetIndex, details[0].column());
  };
  var insertRowAfter = function (grid, detail, comparator, genWrappers) {
    var example = detail.row();
    var targetIndex = detail.row() + detail.rowspan();
    var newGrid = $_ylmshmtjcun3zil.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, targetIndex, detail.column());
  };
  var insertRowsAfter = function (grid, details, comparator, genWrappers) {
    var rows = uniqueRows(details);
    var example = rows[rows.length - 1].row();
    var targetIndex = rows[rows.length - 1].row() + rows[rows.length - 1].rowspan();
    var newGrid = $_cirynjgjcun3z1x.foldl(rows, function (newGrid, _row) {
      return $_ylmshmtjcun3zil.insertRowAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, targetIndex, details[0].column());
  };
  var insertColumnBefore = function (grid, detail, comparator, genWrappers) {
    var example = detail.column();
    var targetIndex = detail.column();
    var newGrid = $_ylmshmtjcun3zil.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), targetIndex);
  };
  var insertColumnsBefore = function (grid, details, comparator, genWrappers) {
    var columns = uniqueColumns(details);
    var example = columns[0].column();
    var targetIndex = columns[0].column();
    var newGrid = $_cirynjgjcun3z1x.foldl(columns, function (newGrid, _row) {
      return $_ylmshmtjcun3zil.insertColumnAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, details[0].row(), targetIndex);
  };
  var insertColumnAfter = function (grid, detail, comparator, genWrappers) {
    var example = detail.column();
    var targetIndex = detail.column() + detail.colspan();
    var newGrid = $_ylmshmtjcun3zil.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), targetIndex);
  };
  var insertColumnsAfter = function (grid, details, comparator, genWrappers) {
    var example = details[details.length - 1].column();
    var targetIndex = details[details.length - 1].column() + details[details.length - 1].colspan();
    var columns = uniqueColumns(details);
    var newGrid = $_cirynjgjcun3z1x.foldl(columns, function (newGrid, _row) {
      return $_ylmshmtjcun3zil.insertColumnAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, details[0].row(), targetIndex);
  };
  var makeRowHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8as9txmujcun3zir.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var makeColumnHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8as9txmujcun3zir.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var unmakeRowHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8as9txmujcun3zir.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var unmakeColumnHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8as9txmujcun3zir.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var splitCellIntoColumns = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_ylmshmtjcun3zil.splitCellIntoColumns(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var splitCellIntoRows = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_ylmshmtjcun3zil.splitCellIntoRows(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var eraseColumns = function (grid, details, comparator, _genWrappers) {
    var columns = uniqueColumns(details);
    var newGrid = $_ylmshmtjcun3zil.deleteColumnsAt(grid, columns[0].column(), columns[columns.length - 1].column());
    var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
    return outcome(newGrid, cursor);
  };
  var eraseRows = function (grid, details, comparator, _genWrappers) {
    var rows = uniqueRows(details);
    var newGrid = $_ylmshmtjcun3zil.deleteRowsAt(grid, rows[0].row(), rows[rows.length - 1].row());
    var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
    return outcome(newGrid, cursor);
  };
  var mergeCells = function (grid, mergable, comparator, _genWrappers) {
    var cells = mergable.cells();
    $_2n0szym5jcun3zer.merge(cells);
    var newGrid = $_99zyjcmsjcun3zif.merge(grid, mergable.bounds(), comparator, $_b55bxvjijcun3z24.constant(cells[0]));
    return outcome(newGrid, $_dx6m1ljhjcun3z22.from(cells[0]));
  };
  var unmergeCells = function (grid, unmergable, comparator, genWrappers) {
    var newGrid = $_cirynjgjcun3z1x.foldr(unmergable, function (b, cell) {
      return $_99zyjcmsjcun3zif.unmerge(b, cell, comparator, genWrappers.combine(cell));
    }, grid);
    return outcome(newGrid, $_dx6m1ljhjcun3z22.from(unmergable[0]));
  };
  var pasteCells = function (grid, pasteDetails, comparator, genWrappers) {
    var gridify = function (table, generators) {
      var list = $_cwbx7zjqjcun3z2x.fromTable(table);
      var wh = $_dxqn88kojcun3z6j.generate(list);
      return $_af2k94mbjcun3zg1.toGrid(wh, generators, true);
    };
    var gridB = gridify(pasteDetails.clipboard(), pasteDetails.generators());
    var startAddress = $_bt8aj2jrjcun3z34.address(pasteDetails.row(), pasteDetails.column());
    var mergedGrid = $_47ogrdmpjcun3zi4.merge(startAddress, grid, gridB, pasteDetails.generators(), comparator);
    return mergedGrid.fold(function () {
      return outcome(grid, $_dx6m1ljhjcun3z22.some(pasteDetails.element()));
    }, function (nuGrid) {
      var cursor = elementFromGrid(nuGrid, pasteDetails.row(), pasteDetails.column());
      return outcome(nuGrid, cursor);
    });
  };
  var gridifyRows = function (rows, generators, example) {
    var pasteDetails = $_cwbx7zjqjcun3z2x.fromPastedRows(rows, example);
    var wh = $_dxqn88kojcun3z6j.generate(pasteDetails);
    return $_af2k94mbjcun3zg1.toGrid(wh, generators, true);
  };
  var pasteRowsBefore = function (grid, pasteDetails, comparator, genWrappers) {
    var example = grid[pasteDetails.cells[0].row()];
    var index = pasteDetails.cells[0].row();
    var gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
    var mergedGrid = $_47ogrdmpjcun3zi4.insert(index, grid, gridB, pasteDetails.generators(), comparator);
    var cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
    return outcome(mergedGrid, cursor);
  };
  var pasteRowsAfter = function (grid, pasteDetails, comparator, genWrappers) {
    var example = grid[pasteDetails.cells[0].row()];
    var index = pasteDetails.cells[pasteDetails.cells.length - 1].row() + pasteDetails.cells[pasteDetails.cells.length - 1].rowspan();
    var gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
    var mergedGrid = $_47ogrdmpjcun3zi4.insert(index, grid, gridB, pasteDetails.generators(), comparator);
    var cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
    return outcome(mergedGrid, cursor);
  };
  var resize = $_1or5qumvjcun3ziw.adjustWidthTo;
  var $_ascblfm1jcun3ze1 = {
    insertRowBefore: $_dlm5k2m8jcun3zfc.run(insertRowBefore, $_dlm5k2m8jcun3zfc.onCell, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    insertRowsBefore: $_dlm5k2m8jcun3zfc.run(insertRowsBefore, $_dlm5k2m8jcun3zfc.onCells, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    insertRowAfter: $_dlm5k2m8jcun3zfc.run(insertRowAfter, $_dlm5k2m8jcun3zfc.onCell, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    insertRowsAfter: $_dlm5k2m8jcun3zfc.run(insertRowsAfter, $_dlm5k2m8jcun3zfc.onCells, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    insertColumnBefore: $_dlm5k2m8jcun3zfc.run(insertColumnBefore, $_dlm5k2m8jcun3zfc.onCell, resize, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    insertColumnsBefore: $_dlm5k2m8jcun3zfc.run(insertColumnsBefore, $_dlm5k2m8jcun3zfc.onCells, resize, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    insertColumnAfter: $_dlm5k2m8jcun3zfc.run(insertColumnAfter, $_dlm5k2m8jcun3zfc.onCell, resize, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    insertColumnsAfter: $_dlm5k2m8jcun3zfc.run(insertColumnsAfter, $_dlm5k2m8jcun3zfc.onCells, resize, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    splitCellIntoColumns: $_dlm5k2m8jcun3zfc.run(splitCellIntoColumns, $_dlm5k2m8jcun3zfc.onCell, resize, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    splitCellIntoRows: $_dlm5k2m8jcun3zfc.run(splitCellIntoRows, $_dlm5k2m8jcun3zfc.onCell, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    eraseColumns: $_dlm5k2m8jcun3zfc.run(eraseColumns, $_dlm5k2m8jcun3zfc.onCells, resize, prune, $_cce589m2jcun3zed.modification),
    eraseRows: $_dlm5k2m8jcun3zfc.run(eraseRows, $_dlm5k2m8jcun3zfc.onCells, $_b55bxvjijcun3z24.noop, prune, $_cce589m2jcun3zed.modification),
    makeColumnHeader: $_dlm5k2m8jcun3zfc.run(makeColumnHeader, $_dlm5k2m8jcun3zfc.onCell, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.transform('row', 'th')),
    unmakeColumnHeader: $_dlm5k2m8jcun3zfc.run(unmakeColumnHeader, $_dlm5k2m8jcun3zfc.onCell, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.transform(null, 'td')),
    makeRowHeader: $_dlm5k2m8jcun3zfc.run(makeRowHeader, $_dlm5k2m8jcun3zfc.onCell, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.transform('col', 'th')),
    unmakeRowHeader: $_dlm5k2m8jcun3zfc.run(unmakeRowHeader, $_dlm5k2m8jcun3zfc.onCell, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.transform(null, 'td')),
    mergeCells: $_dlm5k2m8jcun3zfc.run(mergeCells, $_dlm5k2m8jcun3zfc.onMergable, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.merging),
    unmergeCells: $_dlm5k2m8jcun3zfc.run(unmergeCells, $_dlm5k2m8jcun3zfc.onUnmergable, resize, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.merging),
    pasteCells: $_dlm5k2m8jcun3zfc.run(pasteCells, $_dlm5k2m8jcun3zfc.onPaste, resize, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    pasteRowsBefore: $_dlm5k2m8jcun3zfc.run(pasteRowsBefore, $_dlm5k2m8jcun3zfc.onPasteRows, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification),
    pasteRowsAfter: $_dlm5k2m8jcun3zfc.run(pasteRowsAfter, $_dlm5k2m8jcun3zfc.onPasteRows, $_b55bxvjijcun3z24.noop, $_b55bxvjijcun3z24.noop, $_cce589m2jcun3zed.modification)
  };

  var getBody$1 = function (editor) {
    return $_cycgn2jvjcun3z41.fromDom(editor.getBody());
  };
  var getIsRoot = function (editor) {
    return function (element) {
      return $_bw6rudjzjcun3z4g.eq(element, getBody$1(editor));
    };
  };
  var removePxSuffix = function (size) {
    return size ? size.replace(/px$/, '') : '';
  };
  var addSizeSuffix = function (size) {
    if (/^[0-9]+$/.test(size)) {
      size += 'px';
    }
    return size;
  };
  var $_aqr6ugn2jcun3zk0 = {
    getBody: getBody$1,
    getIsRoot: getIsRoot,
    addSizeSuffix: addSizeSuffix,
    removePxSuffix: removePxSuffix
  };

  var onDirection = function (isLtr, isRtl) {
    return function (element) {
      return getDirection(element) === 'rtl' ? isRtl : isLtr;
    };
  };
  var getDirection = function (element) {
    return $_7vp61rkpjcun3z6o.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_c1s38pn4jcun3zk5 = {
    onDirection: onDirection,
    getDirection: getDirection
  };

  var ltr$1 = { isRtl: $_b55bxvjijcun3z24.constant(false) };
  var rtl$1 = { isRtl: $_b55bxvjijcun3z24.constant(true) };
  var directionAt = function (element) {
    var dir = $_c1s38pn4jcun3zk5.getDirection(element);
    return dir === 'rtl' ? rtl$1 : ltr$1;
  };
  var $_6xdltbn3jcun3zk3 = { directionAt: directionAt };

  var TableActions = function (editor, lazyWire) {
    var isTableBody = function (editor) {
      return $_148ei0khjcun3z5z.name($_aqr6ugn2jcun3zk0.getBody(editor)) === 'table';
    };
    var lastRowGuard = function (table) {
      var size = $_2isyvhm0jcun3zdy.getGridSize(table);
      return isTableBody(editor) === false || size.rows() > 1;
    };
    var lastColumnGuard = function (table) {
      var size = $_2isyvhm0jcun3zdy.getGridSize(table);
      return isTableBody(editor) === false || size.columns() > 1;
    };
    var fireNewRow = function (node) {
      editor.fire('newrow', { node: node.dom() });
      return node.dom();
    };
    var fireNewCell = function (node) {
      editor.fire('newcell', { node: node.dom() });
      return node.dom();
    };
    var cloneFormatsArray;
    if (editor.settings.table_clone_elements !== false) {
      if (typeof editor.settings.table_clone_elements === 'string') {
        cloneFormatsArray = editor.settings.table_clone_elements.split(/[ ,]/);
      } else if (Array.isArray(editor.settings.table_clone_elements)) {
        cloneFormatsArray = editor.settings.table_clone_elements;
      }
    }
    var cloneFormats = $_dx6m1ljhjcun3z22.from(cloneFormatsArray);
    var execute = function (operation, guard, mutate, lazyWire) {
      return function (table, target) {
        var dataStyleCells = $_7pi6mukijcun3z61.descendants(table, 'td[data-mce-style],th[data-mce-style]');
        $_cirynjgjcun3z1x.each(dataStyleCells, function (cell) {
          $_5qpsynkgjcun3z5t.remove(cell, 'data-mce-style');
        });
        var wire = lazyWire();
        var doc = $_cycgn2jvjcun3z41.fromDom(editor.getDoc());
        var direction = TableDirection($_6xdltbn3jcun3zk3.directionAt);
        var generators = $_6ldhx1kujcun3z76.cellOperations(mutate, doc, cloneFormats);
        return guard(table) ? operation(wire, table, target, generators, direction).bind(function (result) {
          $_cirynjgjcun3z1x.each(result.newRows(), function (row) {
            fireNewRow(row);
          });
          $_cirynjgjcun3z1x.each(result.newCells(), function (cell) {
            fireNewCell(cell);
          });
          return result.cursor().map(function (cell) {
            var rng = editor.dom.createRng();
            rng.setStart(cell.dom(), 0);
            rng.setEnd(cell.dom(), 0);
            return rng;
          });
        }) : $_dx6m1ljhjcun3z22.none();
      };
    };
    var deleteRow = execute($_ascblfm1jcun3ze1.eraseRows, lastRowGuard, $_b55bxvjijcun3z24.noop, lazyWire);
    var deleteColumn = execute($_ascblfm1jcun3ze1.eraseColumns, lastColumnGuard, $_b55bxvjijcun3z24.noop, lazyWire);
    var insertRowsBefore = execute($_ascblfm1jcun3ze1.insertRowsBefore, $_b55bxvjijcun3z24.always, $_b55bxvjijcun3z24.noop, lazyWire);
    var insertRowsAfter = execute($_ascblfm1jcun3ze1.insertRowsAfter, $_b55bxvjijcun3z24.always, $_b55bxvjijcun3z24.noop, lazyWire);
    var insertColumnsBefore = execute($_ascblfm1jcun3ze1.insertColumnsBefore, $_b55bxvjijcun3z24.always, $_9y7qx7lojcun3zcg.halve, lazyWire);
    var insertColumnsAfter = execute($_ascblfm1jcun3ze1.insertColumnsAfter, $_b55bxvjijcun3z24.always, $_9y7qx7lojcun3zcg.halve, lazyWire);
    var mergeCells = execute($_ascblfm1jcun3ze1.mergeCells, $_b55bxvjijcun3z24.always, $_b55bxvjijcun3z24.noop, lazyWire);
    var unmergeCells = execute($_ascblfm1jcun3ze1.unmergeCells, $_b55bxvjijcun3z24.always, $_b55bxvjijcun3z24.noop, lazyWire);
    var pasteRowsBefore = execute($_ascblfm1jcun3ze1.pasteRowsBefore, $_b55bxvjijcun3z24.always, $_b55bxvjijcun3z24.noop, lazyWire);
    var pasteRowsAfter = execute($_ascblfm1jcun3ze1.pasteRowsAfter, $_b55bxvjijcun3z24.always, $_b55bxvjijcun3z24.noop, lazyWire);
    var pasteCells = execute($_ascblfm1jcun3ze1.pasteCells, $_b55bxvjijcun3z24.always, $_b55bxvjijcun3z24.noop, lazyWire);
    return {
      deleteRow: deleteRow,
      deleteColumn: deleteColumn,
      insertRowsBefore: insertRowsBefore,
      insertRowsAfter: insertRowsAfter,
      insertColumnsBefore: insertColumnsBefore,
      insertColumnsAfter: insertColumnsAfter,
      mergeCells: mergeCells,
      unmergeCells: unmergeCells,
      pasteRowsBefore: pasteRowsBefore,
      pasteRowsAfter: pasteRowsAfter,
      pasteCells: pasteCells
    };
  };

  var copyRows = function (table, target, generators) {
    var list = $_cwbx7zjqjcun3z2x.fromTable(table);
    var house = $_dxqn88kojcun3z6j.generate(list);
    var details = $_dlm5k2m8jcun3zfc.onCells(house, target);
    return details.map(function (selectedCells) {
      var grid = $_af2k94mbjcun3zg1.toGrid(house, generators, false);
      var slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
      var slicedDetails = $_dlm5k2m8jcun3zfc.toDetailList(slicedGrid, generators);
      return $_2ng4vdmejcun3zge.copy(slicedDetails);
    });
  };
  var $_7vghvln6jcun3zki = { copyRows: copyRows };

  var Tools = tinymce.util.Tools.resolve('tinymce.util.Tools');

  var Env = tinymce.util.Tools.resolve('tinymce.Env');

  var getTDTHOverallStyle = function (dom, elm, name) {
    var cells = dom.select('td,th', elm);
    var firstChildStyle;
    var checkChildren = function (firstChildStyle, elms) {
      for (var i = 0; i < elms.length; i++) {
        var currentStyle = dom.getStyle(elms[i], name);
        if (typeof firstChildStyle === 'undefined') {
          firstChildStyle = currentStyle;
        }
        if (firstChildStyle !== currentStyle) {
          return '';
        }
      }
      return firstChildStyle;
    };
    firstChildStyle = checkChildren(firstChildStyle, cells);
    return firstChildStyle;
  };
  var applyAlign = function (editor, elm, name) {
    if (name) {
      editor.formatter.apply('align' + name, {}, elm);
    }
  };
  var applyVAlign = function (editor, elm, name) {
    if (name) {
      editor.formatter.apply('valign' + name, {}, elm);
    }
  };
  var unApplyAlign = function (editor, elm) {
    Tools.each('left center right'.split(' '), function (name) {
      editor.formatter.remove('align' + name, {}, elm);
    });
  };
  var unApplyVAlign = function (editor, elm) {
    Tools.each('top middle bottom'.split(' '), function (name) {
      editor.formatter.remove('valign' + name, {}, elm);
    });
  };
  var $_4nxmwlnajcun3zku = {
    applyAlign: applyAlign,
    applyVAlign: applyVAlign,
    unApplyAlign: unApplyAlign,
    unApplyVAlign: unApplyVAlign,
    getTDTHOverallStyle: getTDTHOverallStyle
  };

  var buildListItems = function (inputList, itemCallback, startItems) {
    var appendItems = function (values, output) {
      output = output || [];
      Tools.each(values, function (item) {
        var menuItem = { text: item.text || item.title };
        if (item.menu) {
          menuItem.menu = appendItems(item.menu);
        } else {
          menuItem.value = item.value;
          if (itemCallback) {
            itemCallback(menuItem);
          }
        }
        output.push(menuItem);
      });
      return output;
    };
    return appendItems(inputList, startItems || []);
  };
  var updateStyleField = function (editor, evt) {
    var dom = editor.dom;
    var rootControl = evt.control.rootControl;
    var data = rootControl.toJSON();
    var css = dom.parseStyle(data.style);
    if (evt.control.name() === 'style') {
      rootControl.find('#borderStyle').value(css['border-style'] || '')[0].fire('select');
      rootControl.find('#borderColor').value(css['border-color'] || '')[0].fire('change');
      rootControl.find('#backgroundColor').value(css['background-color'] || '')[0].fire('change');
      rootControl.find('#width').value(css.width || '').fire('change');
      rootControl.find('#height').value(css.height || '').fire('change');
    } else {
      css['border-style'] = data.borderStyle;
      css['border-color'] = data.borderColor;
      css['background-color'] = data.backgroundColor;
      css.width = data.width ? $_aqr6ugn2jcun3zk0.addSizeSuffix(data.width) : '';
      css.height = data.height ? $_aqr6ugn2jcun3zk0.addSizeSuffix(data.height) : '';
    }
    rootControl.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
  };
  var extractAdvancedStyles = function (dom, elm) {
    var css = dom.parseStyle(dom.getAttrib(elm, 'style'));
    var data = {};
    if (css['border-style']) {
      data.borderStyle = css['border-style'];
    }
    if (css['border-color']) {
      data.borderColor = css['border-color'];
    }
    if (css['background-color']) {
      data.backgroundColor = css['background-color'];
    }
    data.style = dom.serializeStyle(css);
    return data;
  };
  var createStyleForm = function (editor) {
    var createColorPickAction = function () {
      var colorPickerCallback = editor.settings.color_picker_callback;
      if (colorPickerCallback) {
        return function (evt) {
          return colorPickerCallback.call(editor, function (value) {
            evt.control.value(value).fire('change');
          }, evt.control.value());
        };
      }
    };
    return {
      title: 'Advanced',
      type: 'form',
      defaults: { onchange: $_b55bxvjijcun3z24.curry(updateStyleField, editor) },
      items: [
        {
          label: 'Style',
          name: 'style',
          type: 'textbox'
        },
        {
          type: 'form',
          padding: 0,
          formItemDefaults: {
            layout: 'grid',
            alignH: [
              'start',
              'right'
            ]
          },
          defaults: { size: 7 },
          items: [
            {
              label: 'Border style',
              type: 'listbox',
              name: 'borderStyle',
              width: 90,
              onselect: $_b55bxvjijcun3z24.curry(updateStyleField, editor),
              values: [
                {
                  text: 'Select...',
                  value: ''
                },
                {
                  text: 'Solid',
                  value: 'solid'
                },
                {
                  text: 'Dotted',
                  value: 'dotted'
                },
                {
                  text: 'Dashed',
                  value: 'dashed'
                },
                {
                  text: 'Double',
                  value: 'double'
                },
                {
                  text: 'Groove',
                  value: 'groove'
                },
                {
                  text: 'Ridge',
                  value: 'ridge'
                },
                {
                  text: 'Inset',
                  value: 'inset'
                },
                {
                  text: 'Outset',
                  value: 'outset'
                },
                {
                  text: 'None',
                  value: 'none'
                },
                {
                  text: 'Hidden',
                  value: 'hidden'
                }
              ]
            },
            {
              label: 'Border color',
              type: 'colorbox',
              name: 'borderColor',
              onaction: createColorPickAction()
            },
            {
              label: 'Background color',
              type: 'colorbox',
              name: 'backgroundColor',
              onaction: createColorPickAction()
            }
          ]
        }
      ]
    };
  };
  var $_7039iynbjcun3zkv = {
    createStyleForm: createStyleForm,
    buildListItems: buildListItems,
    updateStyleField: updateStyleField,
    extractAdvancedStyles: extractAdvancedStyles
  };

  function styleTDTH(dom, elm, name, value) {
    if (elm.tagName === 'TD' || elm.tagName === 'TH') {
      dom.setStyle(elm, name, value);
    } else {
      if (elm.children) {
        for (var i = 0; i < elm.children.length; i++) {
          styleTDTH(dom, elm.children[i], name, value);
        }
      }
    }
  }
  var extractDataFromElement = function (editor, tableElm) {
    var dom = editor.dom;
    var data = {
      width: dom.getStyle(tableElm, 'width') || dom.getAttrib(tableElm, 'width'),
      height: dom.getStyle(tableElm, 'height') || dom.getAttrib(tableElm, 'height'),
      cellspacing: dom.getStyle(tableElm, 'border-spacing') || dom.getAttrib(tableElm, 'cellspacing'),
      cellpadding: dom.getAttrib(tableElm, 'data-mce-cell-padding') || dom.getAttrib(tableElm, 'cellpadding') || $_4nxmwlnajcun3zku.getTDTHOverallStyle(editor.dom, tableElm, 'padding'),
      border: dom.getAttrib(tableElm, 'data-mce-border') || dom.getAttrib(tableElm, 'border') || $_4nxmwlnajcun3zku.getTDTHOverallStyle(editor.dom, tableElm, 'border'),
      borderColor: dom.getAttrib(tableElm, 'data-mce-border-color'),
      caption: !!dom.select('caption', tableElm)[0],
      class: dom.getAttrib(tableElm, 'class')
    };
    Tools.each('left center right'.split(' '), function (name) {
      if (editor.formatter.matchNode(tableElm, 'align' + name)) {
        data.align = name;
      }
    });
    if (editor.settings.table_advtab !== false) {
      Tools.extend(data, $_7039iynbjcun3zkv.extractAdvancedStyles(dom, tableElm));
    }
    return data;
  };
  var applyDataToElement = function (editor, tableElm, data) {
    var dom = editor.dom;
    var attrs = {};
    var styles = {};
    attrs.class = data.class;
    styles.height = $_aqr6ugn2jcun3zk0.addSizeSuffix(data.height);
    if (dom.getAttrib(tableElm, 'width') && !editor.settings.table_style_by_css) {
      attrs.width = $_aqr6ugn2jcun3zk0.removePxSuffix(data.width);
    } else {
      styles.width = $_aqr6ugn2jcun3zk0.addSizeSuffix(data.width);
    }
    if (editor.settings.table_style_by_css) {
      styles['border-width'] = $_aqr6ugn2jcun3zk0.addSizeSuffix(data.border);
      styles['border-spacing'] = $_aqr6ugn2jcun3zk0.addSizeSuffix(data.cellspacing);
      Tools.extend(attrs, {
        'data-mce-border-color': data.borderColor,
        'data-mce-cell-padding': data.cellpadding,
        'data-mce-border': data.border
      });
    } else {
      Tools.extend(attrs, {
        border: data.border,
        cellpadding: data.cellpadding,
        cellspacing: data.cellspacing
      });
    }
    if (editor.settings.table_style_by_css) {
      if (tableElm.children) {
        for (var i = 0; i < tableElm.children.length; i++) {
          styleTDTH(dom, tableElm.children[i], {
            'border-width': $_aqr6ugn2jcun3zk0.addSizeSuffix(data.border),
            'border-color': data.borderColor,
            'padding': $_aqr6ugn2jcun3zk0.addSizeSuffix(data.cellpadding)
          });
        }
      }
    }
    if (data.style) {
      Tools.extend(styles, dom.parseStyle(data.style));
    } else {
      styles = Tools.extend({}, dom.parseStyle(dom.getAttrib(tableElm, 'style')), styles);
    }
    attrs.style = dom.serializeStyle(styles);
    dom.setAttribs(tableElm, attrs);
  };
  var onSubmitTableForm = function (editor, tableElm, evt) {
    var dom = editor.dom;
    var captionElm;
    var data;
    $_7039iynbjcun3zkv.updateStyleField(editor, evt);
    data = evt.control.rootControl.toJSON();
    if (data.class === false) {
      delete data.class;
    }
    editor.undoManager.transact(function () {
      if (!tableElm) {
        tableElm = $_ecfdziljjcun3zbi.insert(editor, data.cols || 1, data.rows || 1);
      }
      applyDataToElement(editor, tableElm, data);
      captionElm = dom.select('caption', tableElm)[0];
      if (captionElm && !data.caption) {
        dom.remove(captionElm);
      }
      if (!captionElm && data.caption) {
        captionElm = dom.create('caption');
        captionElm.innerHTML = !Env.ie ? '<br data-mce-bogus="1"/>' : '\xA0';
        tableElm.insertBefore(captionElm, tableElm.firstChild);
      }
      $_4nxmwlnajcun3zku.unApplyAlign(editor, tableElm);
      if (data.align) {
        $_4nxmwlnajcun3zku.applyAlign(editor, tableElm, data.align);
      }
      editor.focus();
      editor.addVisual();
    });
  };
  var open = function (editor, isProps) {
    var dom = editor.dom;
    var tableElm, colsCtrl, rowsCtrl, classListCtrl, data = {}, generalTableForm;
    if (isProps === true) {
      tableElm = dom.getParent(editor.selection.getStart(), 'table');
      if (tableElm) {
        data = extractDataFromElement(editor, tableElm);
      }
    } else {
      colsCtrl = {
        label: 'Cols',
        name: 'cols'
      };
      rowsCtrl = {
        label: 'Rows',
        name: 'rows'
      };
    }
    if (editor.settings.table_class_list) {
      if (data.class) {
        data.class = data.class.replace(/\s*mce\-item\-table\s*/g, '');
      }
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Class',
        values: $_7039iynbjcun3zkv.buildListItems(editor.settings.table_class_list, function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({
                block: 'table',
                classes: [item.value]
              });
            };
          }
        })
      };
    }
    generalTableForm = {
      type: 'form',
      layout: 'flex',
      direction: 'column',
      labelGapCalc: 'children',
      padding: 0,
      items: [
        {
          type: 'form',
          labelGapCalc: false,
          padding: 0,
          layout: 'grid',
          columns: 2,
          defaults: {
            type: 'textbox',
            maxWidth: 50
          },
          items: editor.settings.table_appearance_options !== false ? [
            colsCtrl,
            rowsCtrl,
            {
              label: 'Width',
              name: 'width',
              onchange: $_b55bxvjijcun3z24.curry($_7039iynbjcun3zkv.updateStyleField, editor)
            },
            {
              label: 'Height',
              name: 'height',
              onchange: $_b55bxvjijcun3z24.curry($_7039iynbjcun3zkv.updateStyleField, editor)
            },
            {
              label: 'Cell spacing',
              name: 'cellspacing'
            },
            {
              label: 'Cell padding',
              name: 'cellpadding'
            },
            {
              label: 'Border',
              name: 'border'
            },
            {
              label: 'Caption',
              name: 'caption',
              type: 'checkbox'
            }
          ] : [
            colsCtrl,
            rowsCtrl,
            {
              label: 'Width',
              name: 'width',
              onchange: $_b55bxvjijcun3z24.curry($_7039iynbjcun3zkv.updateStyleField, editor)
            },
            {
              label: 'Height',
              name: 'height',
              onchange: $_b55bxvjijcun3z24.curry($_7039iynbjcun3zkv.updateStyleField, editor)
            }
          ]
        },
        {
          label: 'Alignment',
          name: 'align',
          type: 'listbox',
          text: 'None',
          values: [
            {
              text: 'None',
              value: ''
            },
            {
              text: 'Left',
              value: 'left'
            },
            {
              text: 'Center',
              value: 'center'
            },
            {
              text: 'Right',
              value: 'right'
            }
          ]
        },
        classListCtrl
      ]
    };
    if (editor.settings.table_advtab !== false) {
      editor.windowManager.open({
        title: 'Table properties',
        data: data,
        bodyType: 'tabpanel',
        body: [
          {
            title: 'General',
            type: 'form',
            items: generalTableForm
          },
          $_7039iynbjcun3zkv.createStyleForm(editor)
        ],
        onsubmit: $_b55bxvjijcun3z24.curry(onSubmitTableForm, editor, tableElm)
      });
    } else {
      editor.windowManager.open({
        title: 'Table properties',
        data: data,
        body: generalTableForm,
        onsubmit: $_b55bxvjijcun3z24.curry(onSubmitTableForm, editor, tableElm)
      });
    }
  };
  var $_8im4gjn8jcun3zkn = { open: open };

  var extractDataFromElement$1 = function (editor, elm) {
    var dom = editor.dom;
    var data = {
      height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
      scope: dom.getAttrib(elm, 'scope'),
      class: dom.getAttrib(elm, 'class')
    };
    data.type = elm.parentNode.nodeName.toLowerCase();
    Tools.each('left center right'.split(' '), function (name) {
      if (editor.formatter.matchNode(elm, 'align' + name)) {
        data.align = name;
      }
    });
    if (editor.settings.table_row_advtab !== false) {
      Tools.extend(data, $_7039iynbjcun3zkv.extractAdvancedStyles(dom, elm));
    }
    return data;
  };
  var switchRowType = function (dom, rowElm, toType) {
    var tableElm = dom.getParent(rowElm, 'table');
    var oldParentElm = rowElm.parentNode;
    var parentElm = dom.select(toType, tableElm)[0];
    if (!parentElm) {
      parentElm = dom.create(toType);
      if (tableElm.firstChild) {
        if (tableElm.firstChild.nodeName === 'CAPTION') {
          dom.insertAfter(parentElm, tableElm.firstChild);
        } else {
          tableElm.insertBefore(parentElm, tableElm.firstChild);
        }
      } else {
        tableElm.appendChild(parentElm);
      }
    }
    parentElm.appendChild(rowElm);
    if (!oldParentElm.hasChildNodes()) {
      dom.remove(oldParentElm);
    }
  };
  function onSubmitRowForm(editor, rows, evt) {
    var dom = editor.dom;
    var data;
    function setAttrib(elm, name, value) {
      if (value) {
        dom.setAttrib(elm, name, value);
      }
    }
    function setStyle(elm, name, value) {
      if (value) {
        dom.setStyle(elm, name, value);
      }
    }
    $_7039iynbjcun3zkv.updateStyleField(editor, evt);
    data = evt.control.rootControl.toJSON();
    editor.undoManager.transact(function () {
      Tools.each(rows, function (rowElm) {
        setAttrib(rowElm, 'scope', data.scope);
        setAttrib(rowElm, 'style', data.style);
        setAttrib(rowElm, 'class', data.class);
        setStyle(rowElm, 'height', $_aqr6ugn2jcun3zk0.addSizeSuffix(data.height));
        if (data.type !== rowElm.parentNode.nodeName.toLowerCase()) {
          switchRowType(editor.dom, rowElm, data.type);
        }
        if (rows.length === 1) {
          $_4nxmwlnajcun3zku.unApplyAlign(editor, rowElm);
        }
        if (data.align) {
          $_4nxmwlnajcun3zku.applyAlign(editor, rowElm, data.align);
        }
      });
      editor.focus();
    });
  }
  var open$1 = function (editor) {
    var dom = editor.dom;
    var tableElm, cellElm, rowElm, classListCtrl, data;
    var rows = [];
    var generalRowForm;
    tableElm = dom.getParent(editor.selection.getStart(), 'table');
    cellElm = dom.getParent(editor.selection.getStart(), 'td,th');
    Tools.each(tableElm.rows, function (row) {
      Tools.each(row.cells, function (cell) {
        if (dom.getAttrib(cell, 'data-mce-selected') || cell === cellElm) {
          rows.push(row);
          return false;
        }
      });
    });
    rowElm = rows[0];
    if (!rowElm) {
      return;
    }
    if (rows.length > 1) {
      data = {
        height: '',
        scope: '',
        class: '',
        align: '',
        type: rowElm.parentNode.nodeName.toLowerCase()
      };
    } else {
      data = extractDataFromElement$1(editor, rowElm);
    }
    if (editor.settings.table_row_class_list) {
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Class',
        values: $_7039iynbjcun3zkv.buildListItems(editor.settings.table_row_class_list, function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({
                block: 'tr',
                classes: [item.value]
              });
            };
          }
        })
      };
    }
    generalRowForm = {
      type: 'form',
      columns: 2,
      padding: 0,
      defaults: { type: 'textbox' },
      items: [
        {
          type: 'listbox',
          name: 'type',
          label: 'Row type',
          text: 'Header',
          maxWidth: null,
          values: [
            {
              text: 'Header',
              value: 'thead'
            },
            {
              text: 'Body',
              value: 'tbody'
            },
            {
              text: 'Footer',
              value: 'tfoot'
            }
          ]
        },
        {
          type: 'listbox',
          name: 'align',
          label: 'Alignment',
          text: 'None',
          maxWidth: null,
          values: [
            {
              text: 'None',
              value: ''
            },
            {
              text: 'Left',
              value: 'left'
            },
            {
              text: 'Center',
              value: 'center'
            },
            {
              text: 'Right',
              value: 'right'
            }
          ]
        },
        {
          label: 'Height',
          name: 'height'
        },
        classListCtrl
      ]
    };
    if (editor.settings.table_row_advtab !== false) {
      editor.windowManager.open({
        title: 'Row properties',
        data: data,
        bodyType: 'tabpanel',
        body: [
          {
            title: 'General',
            type: 'form',
            items: generalRowForm
          },
          $_7039iynbjcun3zkv.createStyleForm(editor)
        ],
        onsubmit: $_b55bxvjijcun3z24.curry(onSubmitRowForm, editor, rows)
      });
    } else {
      editor.windowManager.open({
        title: 'Row properties',
        data: data,
        body: generalRowForm,
        onsubmit: $_b55bxvjijcun3z24.curry(onSubmitRowForm, editor, rows)
      });
    }
  };
  var $_439pobncjcun3zl0 = { open: open$1 };

  var updateStyles = function (elm, cssText) {
    elm.style.cssText += ';' + cssText;
  };
  var extractDataFromElement$2 = function (editor, elm) {
    var dom = editor.dom;
    var data = {
      width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
      height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
      scope: dom.getAttrib(elm, 'scope'),
      class: dom.getAttrib(elm, 'class')
    };
    data.type = elm.nodeName.toLowerCase();
    Tools.each('left center right'.split(' '), function (name) {
      if (editor.formatter.matchNode(elm, 'align' + name)) {
        data.align = name;
      }
    });
    Tools.each('top middle bottom'.split(' '), function (name) {
      if (editor.formatter.matchNode(elm, 'valign' + name)) {
        data.valign = name;
      }
    });
    if (editor.settings.table_cell_advtab !== false) {
      Tools.extend(data, $_7039iynbjcun3zkv.extractAdvancedStyles(dom, elm));
    }
    return data;
  };
  var onSubmitCellForm = function (editor, cells, evt) {
    var dom = editor.dom;
    var data;
    function setAttrib(elm, name, value) {
      if (value) {
        dom.setAttrib(elm, name, value);
      }
    }
    function setStyle(elm, name, value) {
      if (value) {
        dom.setStyle(elm, name, value);
      }
    }
    $_7039iynbjcun3zkv.updateStyleField(editor, evt);
    data = evt.control.rootControl.toJSON();
    editor.undoManager.transact(function () {
      Tools.each(cells, function (cellElm) {
        setAttrib(cellElm, 'scope', data.scope);
        if (cells.length === 1) {
          setAttrib(cellElm, 'style', data.style);
        } else {
          updateStyles(cellElm, data.style);
        }
        setAttrib(cellElm, 'class', data.class);
        setStyle(cellElm, 'width', $_aqr6ugn2jcun3zk0.addSizeSuffix(data.width));
        setStyle(cellElm, 'height', $_aqr6ugn2jcun3zk0.addSizeSuffix(data.height));
        if (data.type && cellElm.nodeName.toLowerCase() !== data.type) {
          cellElm = dom.rename(cellElm, data.type);
        }
        if (cells.length === 1) {
          $_4nxmwlnajcun3zku.unApplyAlign(editor, cellElm);
          $_4nxmwlnajcun3zku.unApplyVAlign(editor, cellElm);
        }
        if (data.align) {
          $_4nxmwlnajcun3zku.applyAlign(editor, cellElm, data.align);
        }
        if (data.valign) {
          $_4nxmwlnajcun3zku.applyVAlign(editor, cellElm, data.valign);
        }
      });
      editor.focus();
    });
  };
  var open$2 = function (editor) {
    var cellElm, data, classListCtrl, cells = [];
    cells = editor.dom.select('td[data-mce-selected],th[data-mce-selected]');
    cellElm = editor.dom.getParent(editor.selection.getStart(), 'td,th');
    if (!cells.length && cellElm) {
      cells.push(cellElm);
    }
    cellElm = cellElm || cells[0];
    if (!cellElm) {
      return;
    }
    if (cells.length > 1) {
      data = {
        width: '',
        height: '',
        scope: '',
        class: '',
        align: '',
        style: '',
        type: cellElm.nodeName.toLowerCase()
      };
    } else {
      data = extractDataFromElement$2(editor, cellElm);
    }
    if (editor.settings.table_cell_class_list) {
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Class',
        values: $_7039iynbjcun3zkv.buildListItems(editor.settings.table_cell_class_list, function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({
                block: 'td',
                classes: [item.value]
              });
            };
          }
        })
      };
    }
    var generalCellForm = {
      type: 'form',
      layout: 'flex',
      direction: 'column',
      labelGapCalc: 'children',
      padding: 0,
      items: [
        {
          type: 'form',
          layout: 'grid',
          columns: 2,
          labelGapCalc: false,
          padding: 0,
          defaults: {
            type: 'textbox',
            maxWidth: 50
          },
          items: [
            {
              label: 'Width',
              name: 'width',
              onchange: $_b55bxvjijcun3z24.curry($_7039iynbjcun3zkv.updateStyleField, editor)
            },
            {
              label: 'Height',
              name: 'height',
              onchange: $_b55bxvjijcun3z24.curry($_7039iynbjcun3zkv.updateStyleField, editor)
            },
            {
              label: 'Cell type',
              name: 'type',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'Cell',
                  value: 'td'
                },
                {
                  text: 'Header cell',
                  value: 'th'
                }
              ]
            },
            {
              label: 'Scope',
              name: 'scope',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'None',
                  value: ''
                },
                {
                  text: 'Row',
                  value: 'row'
                },
                {
                  text: 'Column',
                  value: 'col'
                },
                {
                  text: 'Row group',
                  value: 'rowgroup'
                },
                {
                  text: 'Column group',
                  value: 'colgroup'
                }
              ]
            },
            {
              label: 'H Align',
              name: 'align',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'None',
                  value: ''
                },
                {
                  text: 'Left',
                  value: 'left'
                },
                {
                  text: 'Center',
                  value: 'center'
                },
                {
                  text: 'Right',
                  value: 'right'
                }
              ]
            },
            {
              label: 'V Align',
              name: 'valign',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'None',
                  value: ''
                },
                {
                  text: 'Top',
                  value: 'top'
                },
                {
                  text: 'Middle',
                  value: 'middle'
                },
                {
                  text: 'Bottom',
                  value: 'bottom'
                }
              ]
            }
          ]
        },
        classListCtrl
      ]
    };
    if (editor.settings.table_cell_advtab !== false) {
      editor.windowManager.open({
        title: 'Cell properties',
        bodyType: 'tabpanel',
        data: data,
        body: [
          {
            title: 'General',
            type: 'form',
            items: generalCellForm
          },
          $_7039iynbjcun3zkv.createStyleForm(editor)
        ],
        onsubmit: $_b55bxvjijcun3z24.curry(onSubmitCellForm, editor, cells)
      });
    } else {
      editor.windowManager.open({
        title: 'Cell properties',
        data: data,
        body: generalCellForm,
        onsubmit: $_b55bxvjijcun3z24.curry(onSubmitCellForm, editor, cells)
      });
    }
  };
  var $_595dxvndjcun3zl5 = { open: open$2 };

  var each$3 = Tools.each;
  var clipboardRows = $_dx6m1ljhjcun3z22.none();
  var getClipboardRows = function () {
    return clipboardRows.fold(function () {
      return;
    }, function (rows) {
      return $_cirynjgjcun3z1x.map(rows, function (row) {
        return row.dom();
      });
    });
  };
  var setClipboardRows = function (rows) {
    var sugarRows = $_cirynjgjcun3z1x.map(rows, $_cycgn2jvjcun3z41.fromDom);
    clipboardRows = $_dx6m1ljhjcun3z22.from(sugarRows);
  };
  var registerCommands = function (editor, actions, cellSelection, selections) {
    var isRoot = $_aqr6ugn2jcun3zk0.getIsRoot(editor);
    var eraseTable = function () {
      var cell = $_cycgn2jvjcun3z41.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      var table = $_b7drosjsjcun3z37.table(cell, isRoot);
      table.filter($_b55bxvjijcun3z24.not(isRoot)).each(function (table) {
        var cursor = $_cycgn2jvjcun3z41.fromText('');
        $_f610dckrjcun3z6y.after(table, cursor);
        $_6u25ksksjcun3z70.remove(table);
        var rng = editor.dom.createRng();
        rng.setStart(cursor.dom(), 0);
        rng.setEnd(cursor.dom(), 0);
        editor.selection.setRng(rng);
      });
    };
    var getSelectionStartCell = function () {
      return $_cycgn2jvjcun3z41.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
    };
    var getTableFromCell = function (cell) {
      return $_b7drosjsjcun3z37.table(cell, isRoot);
    };
    var actOnSelection = function (execute) {
      var cell = getSelectionStartCell();
      var table = getTableFromCell(cell);
      table.each(function (table) {
        var targets = $_bncpsrl1jcun3z8e.forMenu(selections, table, cell);
        execute(table, targets).each(function (rng) {
          editor.selection.setRng(rng);
          editor.focus();
          cellSelection.clear(table);
        });
      });
    };
    var copyRowSelection = function (execute) {
      var cell = getSelectionStartCell();
      var table = getTableFromCell(cell);
      return table.bind(function (table) {
        var doc = $_cycgn2jvjcun3z41.fromDom(editor.getDoc());
        var targets = $_bncpsrl1jcun3z8e.forMenu(selections, table, cell);
        var generators = $_6ldhx1kujcun3z76.cellOperations($_b55bxvjijcun3z24.noop, doc, $_dx6m1ljhjcun3z22.none());
        return $_7vghvln6jcun3zki.copyRows(table, targets, generators);
      });
    };
    var pasteOnSelection = function (execute) {
      clipboardRows.each(function (rows) {
        var clonedRows = $_cirynjgjcun3z1x.map(rows, function (row) {
          return $_367bwxkvjcun3z7t.deep(row);
        });
        var cell = getSelectionStartCell();
        var table = getTableFromCell(cell);
        table.bind(function (table) {
          var doc = $_cycgn2jvjcun3z41.fromDom(editor.getDoc());
          var generators = $_6ldhx1kujcun3z76.paste(doc);
          var targets = $_bncpsrl1jcun3z8e.pasteRows(selections, table, cell, clonedRows, generators);
          execute(table, targets).each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
            cellSelection.clear(table);
          });
        });
      });
    };
    each$3({
      mceTableSplitCells: function () {
        actOnSelection(actions.unmergeCells);
      },
      mceTableMergeCells: function () {
        actOnSelection(actions.mergeCells);
      },
      mceTableInsertRowBefore: function () {
        actOnSelection(actions.insertRowsBefore);
      },
      mceTableInsertRowAfter: function () {
        actOnSelection(actions.insertRowsAfter);
      },
      mceTableInsertColBefore: function () {
        actOnSelection(actions.insertColumnsBefore);
      },
      mceTableInsertColAfter: function () {
        actOnSelection(actions.insertColumnsAfter);
      },
      mceTableDeleteCol: function () {
        actOnSelection(actions.deleteColumn);
      },
      mceTableDeleteRow: function () {
        actOnSelection(actions.deleteRow);
      },
      mceTableCutRow: function (grid) {
        clipboardRows = copyRowSelection();
        actOnSelection(actions.deleteRow);
      },
      mceTableCopyRow: function (grid) {
        clipboardRows = copyRowSelection();
      },
      mceTablePasteRowBefore: function (grid) {
        pasteOnSelection(actions.pasteRowsBefore);
      },
      mceTablePasteRowAfter: function (grid) {
        pasteOnSelection(actions.pasteRowsAfter);
      },
      mceTableDelete: eraseTable
    }, function (func, name) {
      editor.addCommand(name, func);
    });
    each$3({
      mceInsertTable: $_b55bxvjijcun3z24.curry($_8im4gjn8jcun3zkn.open, editor),
      mceTableProps: $_b55bxvjijcun3z24.curry($_8im4gjn8jcun3zkn.open, editor, true),
      mceTableRowProps: $_b55bxvjijcun3z24.curry($_439pobncjcun3zl0.open, editor),
      mceTableCellProps: $_b55bxvjijcun3z24.curry($_595dxvndjcun3zl5.open, editor)
    }, function (func, name) {
      editor.addCommand(name, function (ui, val) {
        func(val);
      });
    });
  };
  var $_a9lln3n5jcun3zk8 = {
    registerCommands: registerCommands,
    getClipboardRows: getClipboardRows,
    setClipboardRows: setClipboardRows
  };

  var only$1 = function (element) {
    var parent = $_dx6m1ljhjcun3z22.from(element.dom().documentElement).map($_cycgn2jvjcun3z41.fromDom).getOr(element);
    return {
      parent: $_b55bxvjijcun3z24.constant(parent),
      view: $_b55bxvjijcun3z24.constant(element),
      origin: $_b55bxvjijcun3z24.constant(r(0, 0))
    };
  };
  var detached = function (editable, chrome) {
    var origin = $_b55bxvjijcun3z24.curry($_3qiue4lxjcun3zdk.absolute, chrome);
    return {
      parent: $_b55bxvjijcun3z24.constant(chrome),
      view: $_b55bxvjijcun3z24.constant(editable),
      origin: origin
    };
  };
  var body$1 = function (editable, chrome) {
    return {
      parent: $_b55bxvjijcun3z24.constant(chrome),
      view: $_b55bxvjijcun3z24.constant(editable),
      origin: $_b55bxvjijcun3z24.constant(r(0, 0))
    };
  };
  var $_8r4hfinfjcun3zlr = {
    only: only$1,
    detached: detached,
    body: body$1
  };

  var Event = function (fields) {
    var struct = $_asy2ehjljcun3z2p.immutable.apply(null, fields);
    var handlers = [];
    var bind = function (handler) {
      if (handler === undefined) {
        throw 'Event bind error: undefined handler';
      }
      handlers.push(handler);
    };
    var unbind = function (handler) {
      handlers = $_cirynjgjcun3z1x.filter(handlers, function (h) {
        return h !== handler;
      });
    };
    var trigger = function () {
      var event = struct.apply(null, arguments);
      $_cirynjgjcun3z1x.each(handlers, function (handler) {
        handler(event);
      });
    };
    return {
      bind: bind,
      unbind: unbind,
      trigger: trigger
    };
  };

  var create = function (typeDefs) {
    var registry = $_ds59i8jkjcun3z2m.map(typeDefs, function (event) {
      return {
        bind: event.bind,
        unbind: event.unbind
      };
    });
    var trigger = $_ds59i8jkjcun3z2m.map(typeDefs, function (event) {
      return event.trigger;
    });
    return {
      registry: registry,
      trigger: trigger
    };
  };
  var $_2ta6shnijcun3zma = { create: create };

  var mode = $_6j1cv2m4jcun3zeo.exactly([
    'compare',
    'extract',
    'mutate',
    'sink'
  ]);
  var sink$1 = $_6j1cv2m4jcun3zeo.exactly([
    'element',
    'start',
    'stop',
    'destroy'
  ]);
  var api$3 = $_6j1cv2m4jcun3zeo.exactly([
    'forceDrop',
    'drop',
    'move',
    'delayDrop'
  ]);
  var $_e3ct66nmjcun3zn7 = {
    mode: mode,
    sink: sink$1,
    api: api$3
  };

  var styles$1 = $_dzxsgqmkjcun3zht.css('ephox-dragster');
  var $_9wi4hmnojcun3zno = { resolve: styles$1.resolve };

  var Blocker = function (options) {
    var settings = $_3n7fqum9jcun3zfw.merge({ 'layerClass': $_9wi4hmnojcun3zno.resolve('blocker') }, options);
    var div = $_cycgn2jvjcun3z41.fromTag('div');
    $_5qpsynkgjcun3z5t.set(div, 'role', 'presentation');
    $_7vp61rkpjcun3z6o.setAll(div, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%'
    });
    $_6f75fomljcun3zhv.add(div, $_9wi4hmnojcun3zno.resolve('blocker'));
    $_6f75fomljcun3zhv.add(div, settings.layerClass);
    var element = function () {
      return div;
    };
    var destroy = function () {
      $_6u25ksksjcun3z70.remove(div);
    };
    return {
      element: element,
      destroy: destroy
    };
  };

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': $_b55bxvjijcun3z24.constant(target),
      'x': $_b55bxvjijcun3z24.constant(x),
      'y': $_b55bxvjijcun3z24.constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': $_b55bxvjijcun3z24.constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = $_cycgn2jvjcun3z41.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = $_b55bxvjijcun3z24.compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: $_b55bxvjijcun3z24.curry(unbind, element, event, wrapped, useCapture) };
  };
  var bind$2 = function (element, event, filter, handler) {
    return binder(element, event, filter, handler, false);
  };
  var capture$1 = function (element, event, filter, handler) {
    return binder(element, event, filter, handler, true);
  };
  var unbind = function (element, event, handler, useCapture) {
    element.dom().removeEventListener(event, handler, useCapture);
  };
  var $_ejnnl1nqjcun3znt = {
    bind: bind$2,
    capture: capture$1
  };

  var filter$1 = $_b55bxvjijcun3z24.constant(true);
  var bind$1 = function (element, event, handler) {
    return $_ejnnl1nqjcun3znt.bind(element, event, filter$1, handler);
  };
  var capture = function (element, event, handler) {
    return $_ejnnl1nqjcun3znt.capture(element, event, filter$1, handler);
  };
  var $_dgjafbnpjcun3znr = {
    bind: bind$1,
    capture: capture
  };

  var compare = function (old, nu) {
    return r(nu.left() - old.left(), nu.top() - old.top());
  };
  var extract$1 = function (event) {
    return $_dx6m1ljhjcun3z22.some(r(event.x(), event.y()));
  };
  var mutate$1 = function (mutation, info) {
    mutation.mutate(info.left(), info.top());
  };
  var sink = function (dragApi, settings) {
    var blocker = Blocker(settings);
    var mdown = $_dgjafbnpjcun3znr.bind(blocker.element(), 'mousedown', dragApi.forceDrop);
    var mup = $_dgjafbnpjcun3znr.bind(blocker.element(), 'mouseup', dragApi.drop);
    var mmove = $_dgjafbnpjcun3znr.bind(blocker.element(), 'mousemove', dragApi.move);
    var mout = $_dgjafbnpjcun3znr.bind(blocker.element(), 'mouseout', dragApi.delayDrop);
    var destroy = function () {
      blocker.destroy();
      mup.unbind();
      mmove.unbind();
      mout.unbind();
      mdown.unbind();
    };
    var start = function (parent) {
      $_f610dckrjcun3z6y.append(parent, blocker.element());
    };
    var stop = function () {
      $_6u25ksksjcun3z70.remove(blocker.element());
    };
    return $_e3ct66nmjcun3zn7.sink({
      element: blocker.element,
      start: start,
      stop: stop,
      destroy: destroy
    });
  };
  var MouseDrag = $_e3ct66nmjcun3zn7.mode({
    compare: compare,
    extract: extract$1,
    sink: sink,
    mutate: mutate$1
  });

  var InDrag = function () {
    var previous = $_dx6m1ljhjcun3z22.none();
    var reset = function () {
      previous = $_dx6m1ljhjcun3z22.none();
    };
    var update = function (mode, nu) {
      var result = previous.map(function (old) {
        return mode.compare(old, nu);
      });
      previous = $_dx6m1ljhjcun3z22.some(nu);
      return result;
    };
    var onEvent = function (event, mode) {
      var dataOption = mode.extract(event);
      dataOption.each(function (data) {
        var offset = update(mode, data);
        offset.each(function (d) {
          events.trigger.move(d);
        });
      });
    };
    var events = $_2ta6shnijcun3zma.create({ move: Event(['info']) });
    return {
      onEvent: onEvent,
      reset: reset,
      events: events.registry
    };
  };

  var NoDrag = function (anchor) {
    var onEvent = function (event, mode) {
    };
    return {
      onEvent: onEvent,
      reset: $_b55bxvjijcun3z24.noop
    };
  };

  var Movement = function () {
    var noDragState = NoDrag();
    var inDragState = InDrag();
    var dragState = noDragState;
    var on = function () {
      dragState.reset();
      dragState = inDragState;
    };
    var off = function () {
      dragState.reset();
      dragState = noDragState;
    };
    var onEvent = function (event, mode) {
      dragState.onEvent(event, mode);
    };
    var isOn = function () {
      return dragState === inDragState;
    };
    return {
      on: on,
      off: off,
      isOn: isOn,
      onEvent: onEvent,
      events: inDragState.events
    };
  };

  var adaptable = function (fn, rate) {
    var timer = null;
    var args = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
        args = null;
      }
    };
    var throttle = function () {
      args = arguments;
      if (timer === null) {
        timer = setTimeout(function () {
          fn.apply(null, args);
          timer = null;
          args = null;
        }, rate);
      }
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };
  var first$4 = function (fn, rate) {
    var timer = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    var throttle = function () {
      var args = arguments;
      if (timer === null) {
        timer = setTimeout(function () {
          fn.apply(null, args);
          timer = null;
          args = null;
        }, rate);
      }
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };
  var last$3 = function (fn, rate) {
    var timer = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    var throttle = function () {
      var args = arguments;
      if (timer !== null)
        clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(null, args);
        timer = null;
        args = null;
      }, rate);
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };
  var $_165kanvjcun3zoa = {
    adaptable: adaptable,
    first: first$4,
    last: last$3
  };

  var setup = function (mutation, mode, settings) {
    var active = false;
    var events = $_2ta6shnijcun3zma.create({
      start: Event([]),
      stop: Event([])
    });
    var movement = Movement();
    var drop = function () {
      sink.stop();
      if (movement.isOn()) {
        movement.off();
        events.trigger.stop();
      }
    };
    var throttledDrop = $_165kanvjcun3zoa.last(drop, 200);
    var go = function (parent) {
      sink.start(parent);
      movement.on();
      events.trigger.start();
    };
    var mousemove = function (event, ui) {
      throttledDrop.cancel();
      movement.onEvent(event, mode);
    };
    movement.events.move.bind(function (event) {
      mode.mutate(mutation, event.info());
    });
    var on = function () {
      active = true;
    };
    var off = function () {
      active = false;
    };
    var runIfActive = function (f) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        if (active) {
          return f.apply(null, args);
        }
      };
    };
    var sink = mode.sink($_e3ct66nmjcun3zn7.api({
      forceDrop: drop,
      drop: runIfActive(drop),
      move: runIfActive(mousemove),
      delayDrop: runIfActive(throttledDrop.throttle)
    }), settings);
    var destroy = function () {
      sink.destroy();
    };
    return {
      element: sink.element,
      go: go,
      on: on,
      off: off,
      destroy: destroy,
      events: events.registry
    };
  };
  var $_fng9cpnrjcun3znx = { setup: setup };

  var transform$1 = function (mutation, options) {
    var settings = options !== undefined ? options : {};
    var mode = settings.mode !== undefined ? settings.mode : MouseDrag;
    return $_fng9cpnrjcun3znx.setup(mutation, mode, options);
  };
  var $_7knunsnkjcun3zmz = { transform: transform$1 };

  var Mutation = function () {
    var events = $_2ta6shnijcun3zma.create({
      'drag': Event([
        'xDelta',
        'yDelta'
      ])
    });
    var mutate = function (x, y) {
      events.trigger.drag(x, y);
    };
    return {
      mutate: mutate,
      events: events.registry
    };
  };

  var BarMutation = function () {
    var events = $_2ta6shnijcun3zma.create({
      drag: Event([
        'xDelta',
        'yDelta',
        'target'
      ])
    });
    var target = $_dx6m1ljhjcun3z22.none();
    var delegate = Mutation();
    delegate.events.drag.bind(function (event) {
      target.each(function (t) {
        events.trigger.drag(event.xDelta(), event.yDelta(), t);
      });
    });
    var assign = function (t) {
      target = $_dx6m1ljhjcun3z22.some(t);
    };
    var get = function () {
      return target;
    };
    return {
      assign: assign,
      get: get,
      mutate: delegate.mutate,
      events: events.registry
    };
  };

  var any = function (selector) {
    return $_avmzmkkljcun3z67.first(selector).isSome();
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_avmzmkkljcun3z67.ancestor(scope, selector, isRoot).isSome();
  };
  var sibling$2 = function (scope, selector) {
    return $_avmzmkkljcun3z67.sibling(scope, selector).isSome();
  };
  var child$3 = function (scope, selector) {
    return $_avmzmkkljcun3z67.child(scope, selector).isSome();
  };
  var descendant$2 = function (scope, selector) {
    return $_avmzmkkljcun3z67.descendant(scope, selector).isSome();
  };
  var closest$2 = function (scope, selector, isRoot) {
    return $_avmzmkkljcun3z67.closest(scope, selector, isRoot).isSome();
  };
  var $_a7chpgnyjcun3zol = {
    any: any,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var resizeBarDragging = $_2gwvwimjjcun3zhq.resolve('resizer-bar-dragging');
  var BarManager = function (wire, direction, hdirection) {
    var mutation = BarMutation();
    var resizing = $_7knunsnkjcun3zmz.transform(mutation, {});
    var hoverTable = $_dx6m1ljhjcun3z22.none();
    var getResizer = function (element, type) {
      return $_dx6m1ljhjcun3z22.from($_5qpsynkgjcun3z5t.get(element, type));
    };
    mutation.events.drag.bind(function (event) {
      getResizer(event.target(), 'data-row').each(function (_dataRow) {
        var currentRow = $_d6aivvmzjcun3zjd.getInt(event.target(), 'top');
        $_7vp61rkpjcun3z6o.set(event.target(), 'top', currentRow + event.yDelta() + 'px');
      });
      getResizer(event.target(), 'data-column').each(function (_dataCol) {
        var currentCol = $_d6aivvmzjcun3zjd.getInt(event.target(), 'left');
        $_7vp61rkpjcun3z6o.set(event.target(), 'left', currentCol + event.xDelta() + 'px');
      });
    });
    var getDelta = function (target, direction) {
      var newX = $_d6aivvmzjcun3zjd.getInt(target, direction);
      var oldX = parseInt($_5qpsynkgjcun3z5t.get(target, 'data-initial-' + direction), 10);
      return newX - oldX;
    };
    resizing.events.stop.bind(function () {
      mutation.get().each(function (target) {
        hoverTable.each(function (table) {
          getResizer(target, 'data-row').each(function (row) {
            var delta = getDelta(target, 'top');
            $_5qpsynkgjcun3z5t.remove(target, 'data-initial-top');
            events.trigger.adjustHeight(table, delta, parseInt(row, 10));
          });
          getResizer(target, 'data-column').each(function (column) {
            var delta = getDelta(target, 'left');
            $_5qpsynkgjcun3z5t.remove(target, 'data-initial-left');
            events.trigger.adjustWidth(table, delta, parseInt(column, 10));
          });
          $_f8c83cmfjcun3zgr.refresh(wire, table, hdirection, direction);
        });
      });
    });
    var handler = function (target, direction) {
      events.trigger.startAdjust();
      mutation.assign(target);
      $_5qpsynkgjcun3z5t.set(target, 'data-initial-' + direction, parseInt($_7vp61rkpjcun3z6o.get(target, direction), 10));
      $_6f75fomljcun3zhv.add(target, resizeBarDragging);
      $_7vp61rkpjcun3z6o.set(target, 'opacity', '0.2');
      resizing.go(wire.parent());
    };
    var mousedown = $_dgjafbnpjcun3znr.bind(wire.parent(), 'mousedown', function (event) {
      if ($_f8c83cmfjcun3zgr.isRowBar(event.target()))
        handler(event.target(), 'top');
      if ($_f8c83cmfjcun3zgr.isColBar(event.target()))
        handler(event.target(), 'left');
    });
    var isRoot = function (e) {
      return $_bw6rudjzjcun3z4g.eq(e, wire.view());
    };
    var mouseover = $_dgjafbnpjcun3znr.bind(wire.view(), 'mouseover', function (event) {
      if ($_148ei0khjcun3z5z.name(event.target()) === 'table' || $_a7chpgnyjcun3zol.ancestor(event.target(), 'table', isRoot)) {
        hoverTable = $_148ei0khjcun3z5z.name(event.target()) === 'table' ? $_dx6m1ljhjcun3z22.some(event.target()) : $_avmzmkkljcun3z67.ancestor(event.target(), 'table', isRoot);
        hoverTable.each(function (ht) {
          $_f8c83cmfjcun3zgr.refresh(wire, ht, hdirection, direction);
        });
      } else if ($_2wq0b9kkjcun3z65.inBody(event.target())) {
        $_f8c83cmfjcun3zgr.destroy(wire);
      }
    });
    var destroy = function () {
      mousedown.unbind();
      mouseover.unbind();
      resizing.destroy();
      $_f8c83cmfjcun3zgr.destroy(wire);
    };
    var refresh = function (tbl) {
      $_f8c83cmfjcun3zgr.refresh(wire, tbl, hdirection, direction);
    };
    var events = $_2ta6shnijcun3zma.create({
      adjustHeight: Event([
        'table',
        'delta',
        'row'
      ]),
      adjustWidth: Event([
        'table',
        'delta',
        'column'
      ]),
      startAdjust: Event([])
    });
    return {
      destroy: destroy,
      refresh: refresh,
      on: resizing.on,
      off: resizing.off,
      hideBars: $_b55bxvjijcun3z24.curry($_f8c83cmfjcun3zgr.hide, wire),
      showBars: $_b55bxvjijcun3z24.curry($_f8c83cmfjcun3zgr.show, wire),
      events: events.registry
    };
  };

  var TableResize = function (wire, vdirection) {
    var hdirection = $_ea5q41lwjcun3zdb.height;
    var manager = BarManager(wire, vdirection, hdirection);
    var events = $_2ta6shnijcun3zma.create({
      beforeResize: Event(['table']),
      afterResize: Event(['table']),
      startDrag: Event([])
    });
    manager.events.adjustHeight.bind(function (event) {
      events.trigger.beforeResize(event.table());
      var delta = hdirection.delta(event.delta(), event.table());
      $_1or5qumvjcun3ziw.adjustHeight(event.table(), delta, event.row(), hdirection);
      events.trigger.afterResize(event.table());
    });
    manager.events.startAdjust.bind(function (event) {
      events.trigger.startDrag();
    });
    manager.events.adjustWidth.bind(function (event) {
      events.trigger.beforeResize(event.table());
      var delta = vdirection.delta(event.delta(), event.table());
      $_1or5qumvjcun3ziw.adjustWidth(event.table(), delta, event.column(), vdirection);
      events.trigger.afterResize(event.table());
    });
    return {
      on: manager.on,
      off: manager.off,
      hideBars: manager.hideBars,
      showBars: manager.showBars,
      destroy: manager.destroy,
      events: events.registry
    };
  };

  var createContainer = function () {
    var container = $_cycgn2jvjcun3z41.fromTag('div');
    $_7vp61rkpjcun3z6o.setAll(container, {
      position: 'static',
      height: '0',
      width: '0',
      padding: '0',
      margin: '0',
      border: '0'
    });
    $_f610dckrjcun3z6y.append($_2wq0b9kkjcun3z65.body(), container);
    return container;
  };
  var get$8 = function (editor, container) {
    return editor.inline ? $_8r4hfinfjcun3zlr.body($_aqr6ugn2jcun3zk0.getBody(editor), createContainer()) : $_8r4hfinfjcun3zlr.only($_cycgn2jvjcun3z41.fromDom(editor.getDoc()));
  };
  var remove$6 = function (editor, wire) {
    if (editor.inline) {
      $_6u25ksksjcun3z70.remove(wire.parent());
    }
  };
  var $_r4d6pnzjcun3zom = {
    get: get$8,
    remove: remove$6
  };

  var ResizeHandler = function (editor) {
    var selectionRng = $_dx6m1ljhjcun3z22.none();
    var resize = $_dx6m1ljhjcun3z22.none();
    var wire = $_dx6m1ljhjcun3z22.none();
    var percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
    var startW, startRawW;
    var isTable = function (elm) {
      return elm.nodeName === 'TABLE';
    };
    var getRawWidth = function (elm) {
      return editor.dom.getStyle(elm, 'width') || editor.dom.getAttrib(elm, 'width');
    };
    var lazyResize = function () {
      return resize;
    };
    var lazyWire = function () {
      return wire.getOr($_8r4hfinfjcun3zlr.only($_cycgn2jvjcun3z41.fromDom(editor.getBody())));
    };
    var destroy = function () {
      resize.each(function (sz) {
        sz.destroy();
      });
      wire.each(function (w) {
        $_r4d6pnzjcun3zom.remove(editor, w);
      });
    };
    editor.on('init', function () {
      var direction = TableDirection($_6xdltbn3jcun3zk3.directionAt);
      var rawWire = $_r4d6pnzjcun3zom.get(editor);
      wire = $_dx6m1ljhjcun3z22.some(rawWire);
      if (editor.settings.object_resizing && editor.settings.table_resize_bars !== false && (editor.settings.object_resizing === true || editor.settings.object_resizing === 'table')) {
        var sz = TableResize(rawWire, direction);
        sz.on();
        sz.events.startDrag.bind(function (event) {
          selectionRng = $_dx6m1ljhjcun3z22.some(editor.selection.getRng());
        });
        sz.events.afterResize.bind(function (event) {
          var table = event.table();
          var dataStyleCells = $_7pi6mukijcun3z61.descendants(table, 'td[data-mce-style],th[data-mce-style]');
          $_cirynjgjcun3z1x.each(dataStyleCells, function (cell) {
            $_5qpsynkgjcun3z5t.remove(cell, 'data-mce-style');
          });
          selectionRng.each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
          });
          editor.undoManager.add();
        });
        resize = $_dx6m1ljhjcun3z22.some(sz);
      }
    });
    editor.on('ObjectResizeStart', function (e) {
      if (isTable(e.target)) {
        startW = e.width;
        startRawW = getRawWidth(e.target);
      }
    });
    editor.on('ObjectResized', function (e) {
      if (isTable(e.target)) {
        var table = e.target;
        if (percentageBasedSizeRegex.test(startRawW)) {
          var percentW = parseFloat(percentageBasedSizeRegex.exec(startRawW)[1]);
          var targetPercentW = e.width * percentW / startW;
          editor.dom.setStyle(table, 'width', targetPercentW + '%');
        } else {
          var newCellSizes_1 = [];
          Tools.each(table.rows, function (row) {
            Tools.each(row.cells, function (cell) {
              var width = editor.dom.getStyle(cell, 'width', true);
              newCellSizes_1.push({
                cell: cell,
                width: width
              });
            });
          });
          Tools.each(newCellSizes_1, function (newCellSize) {
            editor.dom.setStyle(newCellSize.cell, 'width', newCellSize.width);
            editor.dom.setAttrib(newCellSize.cell, 'width', null);
          });
        }
      }
    });
    return {
      lazyResize: lazyResize,
      lazyWire: lazyWire,
      destroy: destroy
    };
  };

  var none$2 = function (current) {
    return folder$1(function (n, f, m, l) {
      return n(current);
    });
  };
  var first$5 = function (current) {
    return folder$1(function (n, f, m, l) {
      return f(current);
    });
  };
  var middle$1 = function (current, target) {
    return folder$1(function (n, f, m, l) {
      return m(current, target);
    });
  };
  var last$4 = function (current) {
    return folder$1(function (n, f, m, l) {
      return l(current);
    });
  };
  var folder$1 = function (fold) {
    return { fold: fold };
  };
  var $_dgd1coo2jcun3zpa = {
    none: none$2,
    first: first$5,
    middle: middle$1,
    last: last$4
  };

  var detect$4 = function (current, isRoot) {
    return $_b7drosjsjcun3z37.table(current, isRoot).bind(function (table) {
      var all = $_b7drosjsjcun3z37.cells(table);
      var index = $_cirynjgjcun3z1x.findIndex(all, function (x) {
        return $_bw6rudjzjcun3z4g.eq(current, x);
      });
      return index.map(function (ind) {
        return {
          index: $_b55bxvjijcun3z24.constant(ind),
          all: $_b55bxvjijcun3z24.constant(all)
        };
      });
    });
  };
  var next = function (current, isRoot) {
    var detection = detect$4(current, isRoot);
    return detection.fold(function () {
      return $_dgd1coo2jcun3zpa.none(current);
    }, function (info) {
      return info.index() + 1 < info.all().length ? $_dgd1coo2jcun3zpa.middle(current, info.all()[info.index() + 1]) : $_dgd1coo2jcun3zpa.last(current);
    });
  };
  var prev = function (current, isRoot) {
    var detection = detect$4(current, isRoot);
    return detection.fold(function () {
      return $_dgd1coo2jcun3zpa.none();
    }, function (info) {
      return info.index() - 1 >= 0 ? $_dgd1coo2jcun3zpa.middle(current, info.all()[info.index() - 1]) : $_dgd1coo2jcun3zpa.first(current);
    });
  };
  var $_fo10f0o1jcun3zp2 = {
    next: next,
    prev: prev
  };

  var adt = $_4r392mlijcun3zbf.generate([
    { 'before': ['element'] },
    {
      'on': [
        'element',
        'offset'
      ]
    },
    { after: ['element'] }
  ]);
  var cata$1 = function (subject, onBefore, onOn, onAfter) {
    return subject.fold(onBefore, onOn, onAfter);
  };
  var getStart$1 = function (situ) {
    return situ.fold($_b55bxvjijcun3z24.identity, $_b55bxvjijcun3z24.identity, $_b55bxvjijcun3z24.identity);
  };
  var $_6j7efvo4jcun3zpm = {
    before: adt.before,
    on: adt.on,
    after: adt.after,
    cata: cata$1,
    getStart: getStart$1
  };

  var type$2 = $_4r392mlijcun3zbf.generate([
    { domRange: ['rng'] },
    {
      relative: [
        'startSitu',
        'finishSitu'
      ]
    },
    {
      exact: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    }
  ]);
  var range$2 = $_asy2ehjljcun3z2p.immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$2.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return $_cycgn2jvjcun3z41.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_6j7efvo4jcun3zpm.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart(selection);
    return $_9elq0ajxjcun3z47.defaultView(start);
  };
  var $_u2xe9o3jcun3zpj = {
    domRange: type$2.domRange,
    relative: type$2.relative,
    exact: type$2.exact,
    exactFromRange: exactFromRange,
    range: range$2,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_9elq0ajxjcun3z47.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return $_cycgn2jvjcun3z41.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_bw6rudjzjcun3z4g.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_7fp37ko6jcun3zpx = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    $_cirynjgjcun3z1x.each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return $_cycgn2jvjcun3z41.fromDom(fragment);
  };
  var $_eozd6io7jcun3zpz = { fromElements: fromElements };

  var selectNodeContents = function (win, element) {
    var rng = win.document.createRange();
    selectNodeContentsUsing(rng, element);
    return rng;
  };
  var selectNodeContentsUsing = function (rng, element) {
    rng.selectNodeContents(element.dom());
  };
  var isWithin$1 = function (outerRange, innerRange) {
    return innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 && innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;
  };
  var create$1 = function (win) {
    return win.document.createRange();
  };
  var setStart = function (rng, situ) {
    situ.fold(function (e) {
      rng.setStartBefore(e.dom());
    }, function (e, o) {
      rng.setStart(e.dom(), o);
    }, function (e) {
      rng.setStartAfter(e.dom());
    });
  };
  var setFinish = function (rng, situ) {
    situ.fold(function (e) {
      rng.setEndBefore(e.dom());
    }, function (e, o) {
      rng.setEnd(e.dom(), o);
    }, function (e) {
      rng.setEndAfter(e.dom());
    });
  };
  var replaceWith = function (rng, fragment) {
    deleteContents(rng);
    rng.insertNode(fragment.dom());
  };
  var relativeToNative = function (win, startSitu, finishSitu) {
    var range = win.document.createRange();
    setStart(range, startSitu);
    setFinish(range, finishSitu);
    return range;
  };
  var exactToNative = function (win, start, soffset, finish, foffset) {
    var rng = win.document.createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var deleteContents = function (rng) {
    rng.deleteContents();
  };
  var cloneFragment = function (rng) {
    var fragment = rng.cloneContents();
    return $_cycgn2jvjcun3z41.fromDom(fragment);
  };
  var toRect = function (rect) {
    return {
      left: $_b55bxvjijcun3z24.constant(rect.left),
      top: $_b55bxvjijcun3z24.constant(rect.top),
      right: $_b55bxvjijcun3z24.constant(rect.right),
      bottom: $_b55bxvjijcun3z24.constant(rect.bottom),
      width: $_b55bxvjijcun3z24.constant(rect.width),
      height: $_b55bxvjijcun3z24.constant(rect.height)
    };
  };
  var getFirstRect$1 = function (rng) {
    var rects = rng.getClientRects();
    var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? $_dx6m1ljhjcun3z22.some(rect).map(toRect) : $_dx6m1ljhjcun3z22.none();
  };
  var getBounds$2 = function (rng) {
    var rect = rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? $_dx6m1ljhjcun3z22.some(rect).map(toRect) : $_dx6m1ljhjcun3z22.none();
  };
  var toString = function (rng) {
    return rng.toString();
  };
  var $_4d907zo8jcun3zq2 = {
    create: create$1,
    replaceWith: replaceWith,
    selectNodeContents: selectNodeContents,
    selectNodeContentsUsing: selectNodeContentsUsing,
    relativeToNative: relativeToNative,
    exactToNative: exactToNative,
    deleteContents: deleteContents,
    cloneFragment: cloneFragment,
    getFirstRect: getFirstRect$1,
    getBounds: getBounds$2,
    isWithin: isWithin$1,
    toString: toString
  };

  var adt$1 = $_4r392mlijcun3zbf.generate([
    {
      ltr: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    },
    {
      rtl: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    }
  ]);
  var fromRange = function (win, type, range) {
    return type($_cycgn2jvjcun3z41.fromDom(range.startContainer), range.startOffset, $_cycgn2jvjcun3z41.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: $_b55bxvjijcun3z24.constant(rng),
          rtl: $_dx6m1ljhjcun3z22.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: $_fokurjk5jcun3z4t.cached(function () {
            return $_4d907zo8jcun3zq2.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: $_fokurjk5jcun3z4t.cached(function () {
            return $_dx6m1ljhjcun3z22.some($_4d907zo8jcun3zq2.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: $_fokurjk5jcun3z4t.cached(function () {
            return $_4d907zo8jcun3zq2.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: $_fokurjk5jcun3z4t.cached(function () {
            return $_dx6m1ljhjcun3z22.some($_4d907zo8jcun3zq2.exactToNative(win, finish, foffset, start, soffset));
          })
        };
      }
    });
  };
  var doDiagnose = function (win, ranges) {
    var rng = ranges.ltr();
    if (rng.collapsed) {
      var reversed = ranges.rtl().filter(function (rev) {
        return rev.collapsed === false;
      });
      return reversed.map(function (rev) {
        return adt$1.rtl($_cycgn2jvjcun3z41.fromDom(rev.endContainer), rev.endOffset, $_cycgn2jvjcun3z41.fromDom(rev.startContainer), rev.startOffset);
      }).getOrThunk(function () {
        return fromRange(win, adt$1.ltr, rng);
      });
    } else {
      return fromRange(win, adt$1.ltr, rng);
    }
  };
  var diagnose = function (win, selection) {
    var ranges = getRanges(win, selection);
    return doDiagnose(win, ranges);
  };
  var asLtrRange = function (win, selection) {
    var diagnosis = diagnose(win, selection);
    return diagnosis.match({
      ltr: function (start, soffset, finish, foffset) {
        var rng = win.document.createRange();
        rng.setStart(start.dom(), soffset);
        rng.setEnd(finish.dom(), foffset);
        return rng;
      },
      rtl: function (start, soffset, finish, foffset) {
        var rng = win.document.createRange();
        rng.setStart(finish.dom(), foffset);
        rng.setEnd(start.dom(), soffset);
        return rng;
      }
    });
  };
  var $_77b2rdo9jcun3zqb = {
    ltr: adt$1.ltr,
    rtl: adt$1.rtl,
    diagnose: diagnose,
    asLtrRange: asLtrRange
  };

  var searchForPoint = function (rectForOffset, x, y, maxX, length) {
    if (length === 0)
      return 0;
    else if (x === maxX)
      return length - 1;
    var xDelta = maxX;
    for (var i = 1; i < length; i++) {
      var rect = rectForOffset(i);
      var curDeltaX = Math.abs(x - rect.left);
      if (y > rect.bottom) {
      } else if (y < rect.top || curDeltaX > xDelta) {
        return i - 1;
      } else {
        xDelta = curDeltaX;
      }
    }
    return 0;
  };
  var inRect = function (rect, x, y) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };
  var $_1236dzocjcun3zqq = {
    inRect: inRect,
    searchForPoint: searchForPoint
  };

  var locateOffset = function (doc, textnode, x, y, rect) {
    var rangeForOffset = function (offset) {
      var r = doc.dom().createRange();
      r.setStart(textnode.dom(), offset);
      r.collapse(true);
      return r;
    };
    var rectForOffset = function (offset) {
      var r = rangeForOffset(offset);
      return r.getBoundingClientRect();
    };
    var length = $_b4faswkyjcun3z84.get(textnode).length;
    var offset = $_1236dzocjcun3zqq.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate$1 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = $_cat2nnmajcun3zfy.findMap(rects, function (rect) {
      return $_1236dzocjcun3zqq.inRect(rect, x, y) ? $_dx6m1ljhjcun3z22.some(rect) : $_dx6m1ljhjcun3z22.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_1pg55lodjcun3zqs = { locate: locate$1 };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_9elq0ajxjcun3z47.children(node);
    return $_cat2nnmajcun3zfy.findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_1236dzocjcun3zqq.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : $_dx6m1ljhjcun3z22.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_148ei0khjcun3z5z.isText(node) ? $_1pg55lodjcun3zqs.locate : searchInChildren;
    return locator(doc, node, x, y);
  };
  var locate = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return locateNode(doc, node, boundedX, boundedY);
  };
  var $_b8lobjcun3zqm = { locate: locate };

  var COLLAPSE_TO_LEFT = true;
  var COLLAPSE_TO_RIGHT = false;
  var getCollapseDirection = function (rect, x) {
    return x - rect.left < rect.right - x ? COLLAPSE_TO_LEFT : COLLAPSE_TO_RIGHT;
  };
  var createCollapsedNode = function (doc, target, collapseDirection) {
    var r = doc.dom().createRange();
    r.selectNode(target.dom());
    r.collapse(collapseDirection);
    return r;
  };
  var locateInElement = function (doc, node, x) {
    var cursorRange = doc.dom().createRange();
    cursorRange.selectNode(node.dom());
    var rect = cursorRange.getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_1thrsskwjcun3z7w.first : $_1thrsskwjcun3z7w.last;
    return f(node).map(function (target) {
      return createCollapsedNode(doc, target, collapseDirection);
    });
  };
  var locateInEmpty = function (doc, node, x) {
    var rect = node.dom().getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    return $_dx6m1ljhjcun3z22.some(createCollapsedNode(doc, node, collapseDirection));
  };
  var search = function (doc, node, x) {
    var f = $_9elq0ajxjcun3z47.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_8qzb7woejcun3zqw = { search: search };

  var caretPositionFromPoint = function (doc, x, y) {
    return $_dx6m1ljhjcun3z22.from(doc.dom().caretPositionFromPoint(x, y)).bind(function (pos) {
      if (pos.offsetNode === null)
        return $_dx6m1ljhjcun3z22.none();
      var r = doc.dom().createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse();
      return $_dx6m1ljhjcun3z22.some(r);
    });
  };
  var caretRangeFromPoint = function (doc, x, y) {
    return $_dx6m1ljhjcun3z22.from(doc.dom().caretRangeFromPoint(x, y));
  };
  var searchTextNodes = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return $_b8lobjcun3zqm.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return $_cycgn2jvjcun3z41.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_8qzb7woejcun3zqw.search(doc, elem, x);
      };
      return $_9elq0ajxjcun3z47.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = $_cycgn2jvjcun3z41.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_u2xe9o3jcun3zpj.range($_cycgn2jvjcun3z41.fromDom(rng.startContainer), rng.startOffset, $_cycgn2jvjcun3z41.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_9f9gomoajcun3zqi = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_4d907zo8jcun3zq2.create(win);
    var self = $_aeohlsjujcun3z3x.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_7pi6mukijcun3z61.descendants(ancestor, selector));
    return $_cirynjgjcun3z1x.filter(elements, function (elem) {
      $_4d907zo8jcun3zq2.selectNodeContentsUsing(innerRange, elem);
      return $_4d907zo8jcun3zq2.isWithin(outerRange, innerRange);
    });
  };
  var find$3 = function (win, selection, selector) {
    var outerRange = $_77b2rdo9jcun3zqb.asLtrRange(win, selection);
    var ancestor = $_cycgn2jvjcun3z41.fromDom(outerRange.commonAncestorContainer);
    return $_148ei0khjcun3z5z.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_87wo0cofjcun3zqz = { find: find$3 };

  var beforeSpecial = function (element, offset) {
    var name = $_148ei0khjcun3z5z.name(element);
    if ('input' === name)
      return $_6j7efvo4jcun3zpm.after(element);
    else if (!$_cirynjgjcun3z1x.contains([
        'br',
        'img'
      ], name))
      return $_6j7efvo4jcun3zpm.on(element, offset);
    else
      return offset === 0 ? $_6j7efvo4jcun3zpm.before(element) : $_6j7efvo4jcun3zpm.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_6j7efvo4jcun3zpm.before, beforeSpecial, $_6j7efvo4jcun3zpm.after);
    var finish = finishSitu.fold($_6j7efvo4jcun3zpm.before, beforeSpecial, $_6j7efvo4jcun3zpm.after);
    return $_u2xe9o3jcun3zpj.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_u2xe9o3jcun3zpj.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = $_cycgn2jvjcun3z41.fromDom(rng.startContainer);
        var finish = $_cycgn2jvjcun3z41.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_5wko9oogjcun3zr3 = {
    beforeSpecial: beforeSpecial,
    preprocess: preprocess,
    preprocessRelative: preprocessRelative,
    preprocessExact: preprocessExact
  };

  var doSetNativeRange = function (win, rng) {
    $_dx6m1ljhjcun3z22.from(win.getSelection()).each(function (selection) {
      selection.removeAllRanges();
      selection.addRange(rng);
    });
  };
  var doSetRange = function (win, start, soffset, finish, foffset) {
    var rng = $_4d907zo8jcun3zq2.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_87wo0cofjcun3zqz.find(win, selection, selector);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_77b2rdo9jcun3zqb.diagnose(win, relative).match({
      ltr: function (start, soffset, finish, foffset) {
        doSetRange(win, start, soffset, finish, foffset);
      },
      rtl: function (start, soffset, finish, foffset) {
        var selection = win.getSelection();
        if (selection.extend) {
          selection.collapse(start.dom(), soffset);
          selection.extend(finish.dom(), foffset);
        } else {
          doSetRange(win, finish, foffset, start, soffset);
        }
      }
    });
  };
  var setExact = function (win, start, soffset, finish, foffset) {
    var relative = $_5wko9oogjcun3zr3.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_5wko9oogjcun3zr3.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_u2xe9o3jcun3zpj.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_4d907zo8jcun3zq2.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_5wko9oogjcun3zr3.preprocess(selection);
    return $_77b2rdo9jcun3zqb.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return $_dx6m1ljhjcun3z22.some($_u2xe9o3jcun3zpj.range($_cycgn2jvjcun3z41.fromDom(firstRng.startContainer), firstRng.startOffset, $_cycgn2jvjcun3z41.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return $_dx6m1ljhjcun3z22.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = $_cycgn2jvjcun3z41.fromDom(selection.anchorNode);
    var focusNode = $_cycgn2jvjcun3z41.fromDom(selection.focusNode);
    return $_7fp37ko6jcun3zpx.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? $_dx6m1ljhjcun3z22.some($_u2xe9o3jcun3zpj.range($_cycgn2jvjcun3z41.fromDom(selection.anchorNode), selection.anchorOffset, $_cycgn2jvjcun3z41.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_4d907zo8jcun3zq2.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_4d907zo8jcun3zq2.selectNodeContents(win, element);
    return $_u2xe9o3jcun3zpj.range($_cycgn2jvjcun3z41.fromDom(rng.startContainer), rng.startOffset, $_cycgn2jvjcun3z41.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    var selection = win.getSelection();
    return selection.rangeCount > 0 ? doGetExact(selection) : $_dx6m1ljhjcun3z22.none();
  };
  var get$9 = function (win) {
    return getExact(win).map(function (range) {
      return $_u2xe9o3jcun3zpj.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect = function (win, selection) {
    var rng = $_77b2rdo9jcun3zqb.asLtrRange(win, selection);
    return $_4d907zo8jcun3zq2.getFirstRect(rng);
  };
  var getBounds$1 = function (win, selection) {
    var rng = $_77b2rdo9jcun3zqb.asLtrRange(win, selection);
    return $_4d907zo8jcun3zq2.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_9f9gomoajcun3zqi.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_77b2rdo9jcun3zqb.asLtrRange(win, selection);
    return $_4d907zo8jcun3zq2.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$2 = function (win, selection) {
    var rng = $_77b2rdo9jcun3zqb.asLtrRange(win, selection);
    return $_4d907zo8jcun3zq2.cloneFragment(rng);
  };
  var replace$1 = function (win, selection, elements) {
    var rng = $_77b2rdo9jcun3zqb.asLtrRange(win, selection);
    var fragment = $_eozd6io7jcun3zpz.fromElements(elements, win.document);
    $_4d907zo8jcun3zq2.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_77b2rdo9jcun3zqb.asLtrRange(win, selection);
    $_4d907zo8jcun3zq2.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_bw6rudjzjcun3z4g.eq(start, finish) && soffset === foffset;
  };
  var $_h24m2o5jcun3zpq = {
    setExact: setExact,
    getExact: getExact,
    get: get$9,
    setRelative: setRelative,
    toNative: toNative,
    setToElement: setToElement,
    clear: clear$1,
    clone: clone$2,
    replace: replace$1,
    deleteAt: deleteAt,
    forElement: forElement,
    getFirstRect: getFirstRect,
    getBounds: getBounds$1,
    getAtPoint: getAtPoint,
    findWithin: findWithin,
    getAsString: getAsString,
    isCollapsed: isCollapsed
  };

  var VK = tinymce.util.Tools.resolve('tinymce.util.VK');

  var forward = function (editor, isRoot, cell, lazyWire) {
    return go(editor, isRoot, $_fo10f0o1jcun3zp2.next(cell), lazyWire);
  };
  var backward = function (editor, isRoot, cell, lazyWire) {
    return go(editor, isRoot, $_fo10f0o1jcun3zp2.prev(cell), lazyWire);
  };
  var getCellFirstCursorPosition = function (editor, cell) {
    var selection = $_u2xe9o3jcun3zpj.exact(cell, 0, cell, 0);
    return $_h24m2o5jcun3zpq.toNative(selection);
  };
  var getNewRowCursorPosition = function (editor, table) {
    var rows = $_7pi6mukijcun3z61.descendants(table, 'tr');
    return $_cirynjgjcun3z1x.last(rows).bind(function (last) {
      return $_avmzmkkljcun3z67.descendant(last, 'td,th').map(function (first) {
        return getCellFirstCursorPosition(editor, first);
      });
    });
  };
  var go = function (editor, isRoot, cell, actions, lazyWire) {
    return cell.fold($_dx6m1ljhjcun3z22.none, $_dx6m1ljhjcun3z22.none, function (current, next) {
      return $_1thrsskwjcun3z7w.first(next).map(function (cell) {
        return getCellFirstCursorPosition(editor, cell);
      });
    }, function (current) {
      return $_b7drosjsjcun3z37.table(current, isRoot).bind(function (table) {
        var targets = $_bncpsrl1jcun3z8e.noMenu(current);
        editor.undoManager.transact(function () {
          actions.insertRowsAfter(table, targets);
        });
        return getNewRowCursorPosition(editor, table);
      });
    });
  };
  var rootElements = [
    'table',
    'li',
    'dl'
  ];
  var handle$1 = function (event, editor, actions, lazyWire) {
    if (event.keyCode === VK.TAB) {
      var body_1 = $_aqr6ugn2jcun3zk0.getBody(editor);
      var isRoot_1 = function (element) {
        var name = $_148ei0khjcun3z5z.name(element);
        return $_bw6rudjzjcun3z4g.eq(element, body_1) || $_cirynjgjcun3z1x.contains(rootElements, name);
      };
      var rng = editor.selection.getRng();
      if (rng.collapsed) {
        var start = $_cycgn2jvjcun3z41.fromDom(rng.startContainer);
        $_b7drosjsjcun3z37.cell(start, isRoot_1).each(function (cell) {
          event.preventDefault();
          var navigation = event.shiftKey ? backward : forward;
          var rng = navigation(editor, isRoot_1, cell, actions, lazyWire);
          rng.each(function (range) {
            editor.selection.setRng(range);
          });
        });
      }
    }
  };
  var $_8xt4xo0jcun3zos = { handle: handle$1 };

  var response = $_asy2ehjljcun3z2p.immutable('selection', 'kill');
  var $_2ger1jokjcun3zs3 = { response: response };

  var isKey = function (key) {
    return function (keycode) {
      return keycode === key;
    };
  };
  var isUp = isKey(38);
  var isDown = isKey(40);
  var isNavigation = function (keycode) {
    return keycode >= 37 && keycode <= 40;
  };
  var $_bj7b4eoljcun3zs6 = {
    ltr: {
      isBackward: isKey(37),
      isForward: isKey(39)
    },
    rtl: {
      isBackward: isKey(39),
      isForward: isKey(37)
    },
    isUp: isUp,
    isDown: isDown,
    isNavigation: isNavigation
  };

  var convertToRange = function (win, selection) {
    var rng = $_77b2rdo9jcun3zqb.asLtrRange(win, selection);
    return {
      start: $_b55bxvjijcun3z24.constant($_cycgn2jvjcun3z41.fromDom(rng.startContainer)),
      soffset: $_b55bxvjijcun3z24.constant(rng.startOffset),
      finish: $_b55bxvjijcun3z24.constant($_cycgn2jvjcun3z41.fromDom(rng.endContainer)),
      foffset: $_b55bxvjijcun3z24.constant(rng.endOffset)
    };
  };
  var makeSitus = function (start, soffset, finish, foffset) {
    return {
      start: $_b55bxvjijcun3z24.constant($_6j7efvo4jcun3zpm.on(start, soffset)),
      finish: $_b55bxvjijcun3z24.constant($_6j7efvo4jcun3zpm.on(finish, foffset))
    };
  };
  var $_5dqjs9onjcun3zsk = {
    convertToRange: convertToRange,
    makeSitus: makeSitus
  };

  var isSafari = $_d4zrqkk4jcun3z4r.detect().browser.isSafari();
  var get$10 = function (_doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    var x = doc.body.scrollLeft || doc.documentElement.scrollLeft;
    var y = doc.body.scrollTop || doc.documentElement.scrollTop;
    return r(x, y);
  };
  var to = function (x, y, _doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    var win = doc.defaultView;
    win.scrollTo(x, y);
  };
  var by = function (x, y, _doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    var win = doc.defaultView;
    win.scrollBy(x, y);
  };
  var setToElement$1 = function (win, element) {
    var pos = $_3qiue4lxjcun3zdk.absolute(element);
    var doc = $_cycgn2jvjcun3z41.fromDom(win.document);
    to(pos.left(), pos.top(), doc);
  };
  var preserve$1 = function (doc, f) {
    var before = get$10(doc);
    f();
    var after = get$10(doc);
    if (before.top() !== after.top() || before.left() !== after.left()) {
      to(before.left(), before.top(), doc);
    }
  };
  var capture$2 = function (doc) {
    var previous = $_dx6m1ljhjcun3z22.none();
    var save = function () {
      previous = $_dx6m1ljhjcun3z22.some(get$10(doc));
    };
    var restore = function () {
      previous.each(function (p) {
        to(p.left(), p.top(), doc);
      });
    };
    save();
    return {
      save: save,
      restore: restore
    };
  };
  var intoView = function (element, alignToTop) {
    if (isSafari && $_5lospcjpjcun3z2w.isFunction(element.dom().scrollIntoViewIfNeeded)) {
      element.dom().scrollIntoViewIfNeeded(false);
    } else {
      element.dom().scrollIntoView(alignToTop);
    }
  };
  var intoViewIfNeeded = function (element, container) {
    var containerBox = container.dom().getBoundingClientRect();
    var elementBox = element.dom().getBoundingClientRect();
    if (elementBox.top < containerBox.top) {
      intoView(element, true);
    } else if (elementBox.bottom > containerBox.bottom) {
      intoView(element, false);
    }
  };
  var scrollBarWidth = function () {
    var scrollDiv = $_cycgn2jvjcun3z41.fromHtml('<div style="width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;"></div>');
    $_f610dckrjcun3z6y.after($_2wq0b9kkjcun3z65.body(), scrollDiv);
    var w = scrollDiv.dom().offsetWidth - scrollDiv.dom().clientWidth;
    $_6u25ksksjcun3z70.remove(scrollDiv);
    return w;
  };
  var $_3ezyn8oojcun3zsr = {
    get: get$10,
    to: to,
    by: by,
    preserve: preserve$1,
    capture: capture$2,
    intoView: intoView,
    intoViewIfNeeded: intoViewIfNeeded,
    setToElement: setToElement$1,
    scrollBarWidth: scrollBarWidth
  };

  var WindowBridge = function (win) {
    var elementFromPoint = function (x, y) {
      return $_dx6m1ljhjcun3z22.from(win.document.elementFromPoint(x, y)).map($_cycgn2jvjcun3z41.fromDom);
    };
    var getRect = function (element) {
      return element.dom().getBoundingClientRect();
    };
    var getRangedRect = function (start, soffset, finish, foffset) {
      var sel = $_u2xe9o3jcun3zpj.exact(start, soffset, finish, foffset);
      return $_h24m2o5jcun3zpq.getFirstRect(win, sel).map(function (structRect) {
        return $_ds59i8jkjcun3z2m.map(structRect, $_b55bxvjijcun3z24.apply);
      });
    };
    var getSelection = function () {
      return $_h24m2o5jcun3zpq.get(win).map(function (exactAdt) {
        return $_5dqjs9onjcun3zsk.convertToRange(win, exactAdt);
      });
    };
    var fromSitus = function (situs) {
      var relative = $_u2xe9o3jcun3zpj.relative(situs.start(), situs.finish());
      return $_5dqjs9onjcun3zsk.convertToRange(win, relative);
    };
    var situsFromPoint = function (x, y) {
      return $_h24m2o5jcun3zpq.getAtPoint(win, x, y).map(function (exact) {
        return {
          start: $_b55bxvjijcun3z24.constant($_6j7efvo4jcun3zpm.on(exact.start(), exact.soffset())),
          finish: $_b55bxvjijcun3z24.constant($_6j7efvo4jcun3zpm.on(exact.finish(), exact.foffset()))
        };
      });
    };
    var clearSelection = function () {
      $_h24m2o5jcun3zpq.clear(win);
    };
    var selectContents = function (element) {
      $_h24m2o5jcun3zpq.setToElement(win, element);
    };
    var setSelection = function (sel) {
      $_h24m2o5jcun3zpq.setExact(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
    };
    var setRelativeSelection = function (start, finish) {
      $_h24m2o5jcun3zpq.setRelative(win, start, finish);
    };
    var getInnerHeight = function () {
      return win.innerHeight;
    };
    var getScrollY = function () {
      var pos = $_3ezyn8oojcun3zsr.get($_cycgn2jvjcun3z41.fromDom(win.document));
      return pos.top();
    };
    var scrollBy = function (x, y) {
      $_3ezyn8oojcun3zsr.by(x, y, $_cycgn2jvjcun3z41.fromDom(win.document));
    };
    return {
      elementFromPoint: elementFromPoint,
      getRect: getRect,
      getRangedRect: getRangedRect,
      getSelection: getSelection,
      fromSitus: fromSitus,
      situsFromPoint: situsFromPoint,
      clearSelection: clearSelection,
      setSelection: setSelection,
      setRelativeSelection: setRelativeSelection,
      selectContents: selectContents,
      getInnerHeight: getInnerHeight,
      getScrollY: getScrollY,
      scrollBy: scrollBy
    };
  };

  var sync = function (container, isRoot, start, soffset, finish, foffset, selectRange) {
    if (!($_bw6rudjzjcun3z4g.eq(start, finish) && soffset === foffset)) {
      return $_avmzmkkljcun3z67.closest(start, 'td,th', isRoot).bind(function (s) {
        return $_avmzmkkljcun3z67.closest(finish, 'td,th', isRoot).bind(function (f) {
          return detect$5(container, isRoot, s, f, selectRange);
        });
      });
    } else {
      return $_dx6m1ljhjcun3z22.none();
    }
  };
  var detect$5 = function (container, isRoot, start, finish, selectRange) {
    if (!$_bw6rudjzjcun3z4g.eq(start, finish)) {
      return $_9d2c5ml4jcun3z8x.identify(start, finish, isRoot).bind(function (cellSel) {
        var boxes = cellSel.boxes().getOr([]);
        if (boxes.length > 0) {
          selectRange(container, boxes, cellSel.start(), cellSel.finish());
          return $_dx6m1ljhjcun3z22.some($_2ger1jokjcun3zs3.response($_dx6m1ljhjcun3z22.some($_5dqjs9onjcun3zsk.makeSitus(start, 0, start, $_alw4qlkxjcun3z80.getEnd(start))), true));
        } else {
          return $_dx6m1ljhjcun3z22.none();
        }
      });
    }
  };
  var update = function (rows, columns, container, selected, annotations) {
    var updateSelection = function (newSels) {
      annotations.clear(container);
      annotations.selectRange(container, newSels.boxes(), newSels.start(), newSels.finish());
      return newSels.boxes();
    };
    return $_9d2c5ml4jcun3z8x.shiftSelection(selected, rows, columns, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(updateSelection);
  };
  var $_5u4guaopjcun3zsx = {
    sync: sync,
    detect: detect$5,
    update: update
  };

  var nu$3 = $_asy2ehjljcun3z2p.immutableBag([
    'left',
    'top',
    'right',
    'bottom'
  ], []);
  var moveDown = function (caret, amount) {
    return nu$3({
      left: caret.left(),
      top: caret.top() + amount,
      right: caret.right(),
      bottom: caret.bottom() + amount
    });
  };
  var moveUp = function (caret, amount) {
    return nu$3({
      left: caret.left(),
      top: caret.top() - amount,
      right: caret.right(),
      bottom: caret.bottom() - amount
    });
  };
  var moveBottomTo = function (caret, bottom) {
    var height = caret.bottom() - caret.top();
    return nu$3({
      left: caret.left(),
      top: bottom - height,
      right: caret.right(),
      bottom: bottom
    });
  };
  var moveTopTo = function (caret, top) {
    var height = caret.bottom() - caret.top();
    return nu$3({
      left: caret.left(),
      top: top,
      right: caret.right(),
      bottom: top + height
    });
  };
  var translate = function (caret, xDelta, yDelta) {
    return nu$3({
      left: caret.left() + xDelta,
      top: caret.top() + yDelta,
      right: caret.right() + xDelta,
      bottom: caret.bottom() + yDelta
    });
  };
  var getTop$1 = function (caret) {
    return caret.top();
  };
  var getBottom = function (caret) {
    return caret.bottom();
  };
  var toString$1 = function (caret) {
    return '(' + caret.left() + ', ' + caret.top() + ') -> (' + caret.right() + ', ' + caret.bottom() + ')';
  };
  var $_3ylvd0osjcun3zu2 = {
    nu: nu$3,
    moveUp: moveUp,
    moveDown: moveDown,
    moveBottomTo: moveBottomTo,
    moveTopTo: moveTopTo,
    getTop: getTop$1,
    getBottom: getBottom,
    translate: translate,
    toString: toString$1
  };

  var getPartialBox = function (bridge, element, offset) {
    if (offset >= 0 && offset < $_alw4qlkxjcun3z80.getEnd(element))
      return bridge.getRangedRect(element, offset, element, offset + 1);
    else if (offset > 0)
      return bridge.getRangedRect(element, offset - 1, element, offset);
    return $_dx6m1ljhjcun3z22.none();
  };
  var toCaret = function (rect) {
    return $_3ylvd0osjcun3zu2.nu({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom
    });
  };
  var getElemBox = function (bridge, element) {
    return $_dx6m1ljhjcun3z22.some(bridge.getRect(element));
  };
  var getBoxAt = function (bridge, element, offset) {
    if ($_148ei0khjcun3z5z.isElement(element))
      return getElemBox(bridge, element).map(toCaret);
    else if ($_148ei0khjcun3z5z.isText(element))
      return getPartialBox(bridge, element, offset).map(toCaret);
    else
      return $_dx6m1ljhjcun3z22.none();
  };
  var getEntireBox = function (bridge, element) {
    if ($_148ei0khjcun3z5z.isElement(element))
      return getElemBox(bridge, element).map(toCaret);
    else if ($_148ei0khjcun3z5z.isText(element))
      return bridge.getRangedRect(element, 0, element, $_alw4qlkxjcun3z80.getEnd(element)).map(toCaret);
    else
      return $_dx6m1ljhjcun3z22.none();
  };
  var $_1wayinotjcun3zu5 = {
    getBoxAt: getBoxAt,
    getEntireBox: getEntireBox
  };

  var traverse = $_asy2ehjljcun3z2p.immutable('item', 'mode');
  var backtrack = function (universe, item, direction, _transition) {
    var transition = _transition !== undefined ? _transition : sidestep;
    return universe.property().parent(item).map(function (p) {
      return traverse(p, transition);
    });
  };
  var sidestep = function (universe, item, direction, _transition) {
    var transition = _transition !== undefined ? _transition : advance;
    return direction.sibling(universe, item).map(function (p) {
      return traverse(p, transition);
    });
  };
  var advance = function (universe, item, direction, _transition) {
    var transition = _transition !== undefined ? _transition : advance;
    var children = universe.property().children(item);
    var result = direction.first(children);
    return result.map(function (r) {
      return traverse(r, transition);
    });
  };
  var successors = [
    {
      current: backtrack,
      next: sidestep,
      fallback: $_dx6m1ljhjcun3z22.none()
    },
    {
      current: sidestep,
      next: advance,
      fallback: $_dx6m1ljhjcun3z22.some(backtrack)
    },
    {
      current: advance,
      next: advance,
      fallback: $_dx6m1ljhjcun3z22.some(sidestep)
    }
  ];
  var go$1 = function (universe, item, mode, direction, rules) {
    var rules = rules !== undefined ? rules : successors;
    var ruleOpt = $_cirynjgjcun3z1x.find(rules, function (succ) {
      return succ.current === mode;
    });
    return ruleOpt.bind(function (rule) {
      return rule.current(universe, item, direction, rule.next).orThunk(function () {
        return rule.fallback.bind(function (fb) {
          return go$1(universe, item, fb, direction);
        });
      });
    });
  };
  var $_o0j37oyjcun3zuw = {
    backtrack: backtrack,
    sidestep: sidestep,
    advance: advance,
    go: go$1
  };

  var left$2 = function () {
    var sibling = function (universe, item) {
      return universe.query().prevSibling(item);
    };
    var first = function (children) {
      return children.length > 0 ? $_dx6m1ljhjcun3z22.some(children[children.length - 1]) : $_dx6m1ljhjcun3z22.none();
    };
    return {
      sibling: sibling,
      first: first
    };
  };
  var right$2 = function () {
    var sibling = function (universe, item) {
      return universe.query().nextSibling(item);
    };
    var first = function (children) {
      return children.length > 0 ? $_dx6m1ljhjcun3z22.some(children[0]) : $_dx6m1ljhjcun3z22.none();
    };
    return {
      sibling: sibling,
      first: first
    };
  };
  var $_nnerqozjcun3zv3 = {
    left: left$2,
    right: right$2
  };

  var hone = function (universe, item, predicate, mode, direction, isRoot) {
    var next = $_o0j37oyjcun3zuw.go(universe, item, mode, direction);
    return next.bind(function (n) {
      if (isRoot(n.item()))
        return $_dx6m1ljhjcun3z22.none();
      else
        return predicate(n.item()) ? $_dx6m1ljhjcun3z22.some(n.item()) : hone(universe, n.item(), predicate, n.mode(), direction, isRoot);
    });
  };
  var left$1 = function (universe, item, predicate, isRoot) {
    return hone(universe, item, predicate, $_o0j37oyjcun3zuw.sidestep, $_nnerqozjcun3zv3.left(), isRoot);
  };
  var right$1 = function (universe, item, predicate, isRoot) {
    return hone(universe, item, predicate, $_o0j37oyjcun3zuw.sidestep, $_nnerqozjcun3zv3.right(), isRoot);
  };
  var $_g9i3b3oxjcun3zut = {
    left: left$1,
    right: right$1
  };

  var isLeaf = function (universe, element) {
    return universe.property().children(element).length === 0;
  };
  var before$3 = function (universe, item, isRoot) {
    return seekLeft$1(universe, item, $_b55bxvjijcun3z24.curry(isLeaf, universe), isRoot);
  };
  var after$4 = function (universe, item, isRoot) {
    return seekRight$1(universe, item, $_b55bxvjijcun3z24.curry(isLeaf, universe), isRoot);
  };
  var seekLeft$1 = function (universe, item, predicate, isRoot) {
    return $_g9i3b3oxjcun3zut.left(universe, item, predicate, isRoot);
  };
  var seekRight$1 = function (universe, item, predicate, isRoot) {
    return $_g9i3b3oxjcun3zut.right(universe, item, predicate, isRoot);
  };
  var walkers$1 = function () {
    return {
      left: $_nnerqozjcun3zv3.left,
      right: $_nnerqozjcun3zv3.right
    };
  };
  var walk$1 = function (universe, item, mode, direction, _rules) {
    return $_o0j37oyjcun3zuw.go(universe, item, mode, direction, _rules);
  };
  var $_7nsk30owjcun3zuo = {
    before: before$3,
    after: after$4,
    seekLeft: seekLeft$1,
    seekRight: seekRight$1,
    walkers: walkers$1,
    walk: walk$1,
    backtrack: $_o0j37oyjcun3zuw.backtrack,
    sidestep: $_o0j37oyjcun3zuw.sidestep,
    advance: $_o0j37oyjcun3zuw.advance
  };

  var universe$2 = DomUniverse();
  var gather = function (element, prune, transform) {
    return $_7nsk30owjcun3zuo.gather(universe$2, element, prune, transform);
  };
  var before$2 = function (element, isRoot) {
    return $_7nsk30owjcun3zuo.before(universe$2, element, isRoot);
  };
  var after$3 = function (element, isRoot) {
    return $_7nsk30owjcun3zuo.after(universe$2, element, isRoot);
  };
  var seekLeft = function (element, predicate, isRoot) {
    return $_7nsk30owjcun3zuo.seekLeft(universe$2, element, predicate, isRoot);
  };
  var seekRight = function (element, predicate, isRoot) {
    return $_7nsk30owjcun3zuo.seekRight(universe$2, element, predicate, isRoot);
  };
  var walkers = function () {
    return $_7nsk30owjcun3zuo.walkers();
  };
  var walk = function (item, mode, direction, _rules) {
    return $_7nsk30owjcun3zuo.walk(universe$2, item, mode, direction, _rules);
  };
  var $_florj4ovjcun3zul = {
    gather: gather,
    before: before$2,
    after: after$3,
    seekLeft: seekLeft,
    seekRight: seekRight,
    walkers: walkers,
    walk: walk
  };

  var JUMP_SIZE = 5;
  var NUM_RETRIES = 100;
  var adt$2 = $_4r392mlijcun3zbf.generate([
    { 'none': [] },
    { 'retry': ['caret'] }
  ]);
  var isOutside = function (caret, box) {
    return caret.left() < box.left() || Math.abs(box.right() - caret.left()) < 1 || caret.left() > box.right();
  };
  var inOutsideBlock = function (bridge, element, caret) {
    return $_8cztmfkmjcun3z69.closest(element, $_1xyd24m6jcun3zf3.isBlock).fold($_b55bxvjijcun3z24.constant(false), function (cell) {
      return $_1wayinotjcun3zu5.getEntireBox(bridge, cell).exists(function (box) {
        return isOutside(caret, box);
      });
    });
  };
  var adjustDown = function (bridge, element, guessBox, original, caret) {
    var lowerCaret = $_3ylvd0osjcun3zu2.moveDown(caret, JUMP_SIZE);
    if (Math.abs(guessBox.bottom() - original.bottom()) < 1)
      return adt$2.retry(lowerCaret);
    else if (guessBox.top() > caret.bottom())
      return adt$2.retry(lowerCaret);
    else if (guessBox.top() === caret.bottom())
      return adt$2.retry($_3ylvd0osjcun3zu2.moveDown(caret, 1));
    else
      return inOutsideBlock(bridge, element, caret) ? adt$2.retry($_3ylvd0osjcun3zu2.translate(lowerCaret, JUMP_SIZE, 0)) : adt$2.none();
  };
  var adjustUp = function (bridge, element, guessBox, original, caret) {
    var higherCaret = $_3ylvd0osjcun3zu2.moveUp(caret, JUMP_SIZE);
    if (Math.abs(guessBox.top() - original.top()) < 1)
      return adt$2.retry(higherCaret);
    else if (guessBox.bottom() < caret.top())
      return adt$2.retry(higherCaret);
    else if (guessBox.bottom() === caret.top())
      return adt$2.retry($_3ylvd0osjcun3zu2.moveUp(caret, 1));
    else
      return inOutsideBlock(bridge, element, caret) ? adt$2.retry($_3ylvd0osjcun3zu2.translate(higherCaret, JUMP_SIZE, 0)) : adt$2.none();
  };
  var upMovement = {
    point: $_3ylvd0osjcun3zu2.getTop,
    adjuster: adjustUp,
    move: $_3ylvd0osjcun3zu2.moveUp,
    gather: $_florj4ovjcun3zul.before
  };
  var downMovement = {
    point: $_3ylvd0osjcun3zu2.getBottom,
    adjuster: adjustDown,
    move: $_3ylvd0osjcun3zu2.moveDown,
    gather: $_florj4ovjcun3zul.after
  };
  var isAtTable = function (bridge, x, y) {
    return bridge.elementFromPoint(x, y).filter(function (elm) {
      return $_148ei0khjcun3z5z.name(elm) === 'table';
    }).isSome();
  };
  var adjustForTable = function (bridge, movement, original, caret, numRetries) {
    return adjustTil(bridge, movement, original, movement.move(caret, JUMP_SIZE), numRetries);
  };
  var adjustTil = function (bridge, movement, original, caret, numRetries) {
    if (numRetries === 0)
      return $_dx6m1ljhjcun3z22.some(caret);
    if (isAtTable(bridge, caret.left(), movement.point(caret)))
      return adjustForTable(bridge, movement, original, caret, numRetries - 1);
    return bridge.situsFromPoint(caret.left(), movement.point(caret)).bind(function (guess) {
      return guess.start().fold($_dx6m1ljhjcun3z22.none, function (element, offset) {
        return $_1wayinotjcun3zu5.getEntireBox(bridge, element, offset).bind(function (guessBox) {
          return movement.adjuster(bridge, element, guessBox, original, caret).fold($_dx6m1ljhjcun3z22.none, function (newCaret) {
            return adjustTil(bridge, movement, original, newCaret, numRetries - 1);
          });
        }).orThunk(function () {
          return $_dx6m1ljhjcun3z22.some(caret);
        });
      }, $_dx6m1ljhjcun3z22.none);
    });
  };
  var ieTryDown = function (bridge, caret) {
    return bridge.situsFromPoint(caret.left(), caret.bottom() + JUMP_SIZE);
  };
  var ieTryUp = function (bridge, caret) {
    return bridge.situsFromPoint(caret.left(), caret.top() - JUMP_SIZE);
  };
  var checkScroll = function (movement, adjusted, bridge) {
    if (movement.point(adjusted) > bridge.getInnerHeight())
      return $_dx6m1ljhjcun3z22.some(movement.point(adjusted) - bridge.getInnerHeight());
    else if (movement.point(adjusted) < 0)
      return $_dx6m1ljhjcun3z22.some(-movement.point(adjusted));
    else
      return $_dx6m1ljhjcun3z22.none();
  };
  var retry = function (movement, bridge, caret) {
    var moved = movement.move(caret, JUMP_SIZE);
    var adjusted = adjustTil(bridge, movement, caret, moved, NUM_RETRIES).getOr(moved);
    return checkScroll(movement, adjusted, bridge).fold(function () {
      return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted));
    }, function (delta) {
      bridge.scrollBy(0, delta);
      return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted) - delta);
    });
  };
  var $_fjs6dcoujcun3zua = {
    tryUp: $_b55bxvjijcun3z24.curry(retry, upMovement),
    tryDown: $_b55bxvjijcun3z24.curry(retry, downMovement),
    ieTryUp: ieTryUp,
    ieTryDown: ieTryDown,
    getJumpSize: $_b55bxvjijcun3z24.constant(JUMP_SIZE)
  };

  var adt$3 = $_4r392mlijcun3zbf.generate([
    { 'none': ['message'] },
    { 'success': [] },
    { 'failedUp': ['cell'] },
    { 'failedDown': ['cell'] }
  ]);
  var isOverlapping = function (bridge, before, after) {
    var beforeBounds = bridge.getRect(before);
    var afterBounds = bridge.getRect(after);
    return afterBounds.right > beforeBounds.left && afterBounds.left < beforeBounds.right;
  };
  var verify = function (bridge, before, beforeOffset, after, afterOffset, failure, isRoot) {
    return $_avmzmkkljcun3z67.closest(after, 'td,th', isRoot).bind(function (afterCell) {
      return $_avmzmkkljcun3z67.closest(before, 'td,th', isRoot).map(function (beforeCell) {
        if (!$_bw6rudjzjcun3z4g.eq(afterCell, beforeCell)) {
          return $_60dg2xl5jcun3z9c.sharedOne(isRow, [
            afterCell,
            beforeCell
          ]).fold(function () {
            return isOverlapping(bridge, beforeCell, afterCell) ? adt$3.success() : failure(beforeCell);
          }, function (sharedRow) {
            return failure(beforeCell);
          });
        } else {
          return $_bw6rudjzjcun3z4g.eq(after, afterCell) && $_alw4qlkxjcun3z80.getEnd(afterCell) === afterOffset ? failure(beforeCell) : adt$3.none('in same cell');
        }
      });
    }).getOr(adt$3.none('default'));
  };
  var isRow = function (elem) {
    return $_avmzmkkljcun3z67.closest(elem, 'tr');
  };
  var cata$2 = function (subject, onNone, onSuccess, onFailedUp, onFailedDown) {
    return subject.fold(onNone, onSuccess, onFailedUp, onFailedDown);
  };
  var $_bk95tlp0jcun3zv7 = {
    verify: verify,
    cata: cata$2,
    adt: adt$3
  };

  var point = $_asy2ehjljcun3z2p.immutable('element', 'offset');
  var delta = $_asy2ehjljcun3z2p.immutable('element', 'deltaOffset');
  var range$3 = $_asy2ehjljcun3z2p.immutable('element', 'start', 'finish');
  var points = $_asy2ehjljcun3z2p.immutable('begin', 'end');
  var text = $_asy2ehjljcun3z2p.immutable('element', 'text');
  var $_bl3g0np2jcun3zvz = {
    point: point,
    delta: delta,
    range: range$3,
    points: points,
    text: text
  };

  var inAncestor = $_asy2ehjljcun3z2p.immutable('ancestor', 'descendants', 'element', 'index');
  var inParent = $_asy2ehjljcun3z2p.immutable('parent', 'children', 'element', 'index');
  var childOf = function (element, ancestor) {
    return $_8cztmfkmjcun3z69.closest(element, function (elem) {
      return $_9elq0ajxjcun3z47.parent(elem).exists(function (parent) {
        return $_bw6rudjzjcun3z4g.eq(parent, ancestor);
      });
    });
  };
  var indexInParent = function (element) {
    return $_9elq0ajxjcun3z47.parent(element).bind(function (parent) {
      var children = $_9elq0ajxjcun3z47.children(parent);
      return indexOf$1(children, element).map(function (index) {
        return inParent(parent, children, element, index);
      });
    });
  };
  var indexOf$1 = function (elements, element) {
    return $_cirynjgjcun3z1x.findIndex(elements, $_b55bxvjijcun3z24.curry($_bw6rudjzjcun3z4g.eq, element));
  };
  var selectorsInParent = function (element, selector) {
    return $_9elq0ajxjcun3z47.parent(element).bind(function (parent) {
      var children = $_7pi6mukijcun3z61.children(parent, selector);
      return indexOf$1(children, element).map(function (index) {
        return inParent(parent, children, element, index);
      });
    });
  };
  var descendantsInAncestor = function (element, ancestorSelector, descendantSelector) {
    return $_avmzmkkljcun3z67.closest(element, ancestorSelector).bind(function (ancestor) {
      var descendants = $_7pi6mukijcun3z61.descendants(ancestor, descendantSelector);
      return indexOf$1(descendants, element).map(function (index) {
        return inAncestor(ancestor, descendants, element, index);
      });
    });
  };
  var $_54heivp3jcun3zw1 = {
    childOf: childOf,
    indexOf: indexOf$1,
    indexInParent: indexInParent,
    selectorsInParent: selectorsInParent,
    descendantsInAncestor: descendantsInAncestor
  };

  var isBr = function (elem) {
    return $_148ei0khjcun3z5z.name(elem) === 'br';
  };
  var gatherer = function (cand, gather, isRoot) {
    return gather(cand, isRoot).bind(function (target) {
      return $_148ei0khjcun3z5z.isText(target) && $_b4faswkyjcun3z84.get(target).trim().length === 0 ? gatherer(target, gather, isRoot) : $_dx6m1ljhjcun3z22.some(target);
    });
  };
  var handleBr = function (isRoot, element, direction) {
    return direction.traverse(element).orThunk(function () {
      return gatherer(element, direction.gather, isRoot);
    }).map(direction.relative);
  };
  var findBr = function (element, offset) {
    return $_9elq0ajxjcun3z47.child(element, offset).filter(isBr).orThunk(function () {
      return $_9elq0ajxjcun3z47.child(element, offset - 1).filter(isBr);
    });
  };
  var handleParent = function (isRoot, element, offset, direction) {
    return findBr(element, offset).bind(function (br) {
      return direction.traverse(br).fold(function () {
        return gatherer(br, direction.gather, isRoot).map(direction.relative);
      }, function (adjacent) {
        return $_54heivp3jcun3zw1.indexInParent(adjacent).map(function (info) {
          return $_6j7efvo4jcun3zpm.on(info.parent(), info.index());
        });
      });
    });
  };
  var tryBr = function (isRoot, element, offset, direction) {
    var target = isBr(element) ? handleBr(isRoot, element, direction) : handleParent(isRoot, element, offset, direction);
    return target.map(function (tgt) {
      return {
        start: $_b55bxvjijcun3z24.constant(tgt),
        finish: $_b55bxvjijcun3z24.constant(tgt)
      };
    });
  };
  var process = function (analysis) {
    return $_bk95tlp0jcun3zv7.cata(analysis, function (message) {
      return $_dx6m1ljhjcun3z22.none('BR ADT: none');
    }, function () {
      return $_dx6m1ljhjcun3z22.none();
    }, function (cell) {
      return $_dx6m1ljhjcun3z22.some($_bl3g0np2jcun3zvz.point(cell, 0));
    }, function (cell) {
      return $_dx6m1ljhjcun3z22.some($_bl3g0np2jcun3zvz.point(cell, $_alw4qlkxjcun3z80.getEnd(cell)));
    });
  };
  var $_2q1jekp1jcun3zvg = {
    tryBr: tryBr,
    process: process
  };

  var MAX_RETRIES = 20;
  var platform$1 = $_d4zrqkk4jcun3z4r.detect();
  var findSpot = function (bridge, isRoot, direction) {
    return bridge.getSelection().bind(function (sel) {
      return $_2q1jekp1jcun3zvg.tryBr(isRoot, sel.finish(), sel.foffset(), direction).fold(function () {
        return $_dx6m1ljhjcun3z22.some($_bl3g0np2jcun3zvz.point(sel.finish(), sel.foffset()));
      }, function (brNeighbour) {
        var range = bridge.fromSitus(brNeighbour);
        var analysis = $_bk95tlp0jcun3zv7.verify(bridge, sel.finish(), sel.foffset(), range.finish(), range.foffset(), direction.failure, isRoot);
        return $_2q1jekp1jcun3zvg.process(analysis);
      });
    });
  };
  var scan = function (bridge, isRoot, element, offset, direction, numRetries) {
    if (numRetries === 0)
      return $_dx6m1ljhjcun3z22.none();
    return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
      var range = bridge.fromSitus(situs);
      var analysis = $_bk95tlp0jcun3zv7.verify(bridge, element, offset, range.finish(), range.foffset(), direction.failure, isRoot);
      return $_bk95tlp0jcun3zv7.cata(analysis, function () {
        return $_dx6m1ljhjcun3z22.none();
      }, function () {
        return $_dx6m1ljhjcun3z22.some(situs);
      }, function (cell) {
        if ($_bw6rudjzjcun3z4g.eq(element, cell) && offset === 0)
          return tryAgain(bridge, element, offset, $_3ylvd0osjcun3zu2.moveUp, direction);
        else
          return scan(bridge, isRoot, cell, 0, direction, numRetries - 1);
      }, function (cell) {
        if ($_bw6rudjzjcun3z4g.eq(element, cell) && offset === $_alw4qlkxjcun3z80.getEnd(cell))
          return tryAgain(bridge, element, offset, $_3ylvd0osjcun3zu2.moveDown, direction);
        else
          return scan(bridge, isRoot, cell, $_alw4qlkxjcun3z80.getEnd(cell), direction, numRetries - 1);
      });
    });
  };
  var tryAgain = function (bridge, element, offset, move, direction) {
    return $_1wayinotjcun3zu5.getBoxAt(bridge, element, offset).bind(function (box) {
      return tryAt(bridge, direction, move(box, $_fjs6dcoujcun3zua.getJumpSize()));
    });
  };
  var tryAt = function (bridge, direction, box) {
    if (platform$1.browser.isChrome() || platform$1.browser.isSafari() || platform$1.browser.isFirefox() || platform$1.browser.isEdge())
      return direction.otherRetry(bridge, box);
    else if (platform$1.browser.isIE())
      return direction.ieRetry(bridge, box);
    else
      return $_dx6m1ljhjcun3z22.none();
  };
  var tryCursor = function (bridge, isRoot, element, offset, direction) {
    return $_1wayinotjcun3zu5.getBoxAt(bridge, element, offset).bind(function (box) {
      return tryAt(bridge, direction, box);
    });
  };
  var handle$2 = function (bridge, isRoot, direction) {
    return findSpot(bridge, isRoot, direction).bind(function (spot) {
      return scan(bridge, isRoot, spot.element(), spot.offset(), direction, MAX_RETRIES).map(bridge.fromSitus);
    });
  };
  var $_5pxv3horjcun3ztu = { handle: handle$2 };

  var any$1 = function (predicate) {
    return $_8cztmfkmjcun3z69.first(predicate).isSome();
  };
  var ancestor$3 = function (scope, predicate, isRoot) {
    return $_8cztmfkmjcun3z69.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest$3 = function (scope, predicate, isRoot) {
    return $_8cztmfkmjcun3z69.closest(scope, predicate, isRoot).isSome();
  };
  var sibling$3 = function (scope, predicate) {
    return $_8cztmfkmjcun3z69.sibling(scope, predicate).isSome();
  };
  var child$4 = function (scope, predicate) {
    return $_8cztmfkmjcun3z69.child(scope, predicate).isSome();
  };
  var descendant$3 = function (scope, predicate) {
    return $_8cztmfkmjcun3z69.descendant(scope, predicate).isSome();
  };
  var $_a85ymwp4jcun3zw7 = {
    any: any$1,
    ancestor: ancestor$3,
    closest: closest$3,
    sibling: sibling$3,
    child: child$4,
    descendant: descendant$3
  };

  var detection = $_d4zrqkk4jcun3z4r.detect();
  var inSameTable = function (elem, table) {
    return $_a85ymwp4jcun3zw7.ancestor(elem, function (e) {
      return $_9elq0ajxjcun3z47.parent(e).exists(function (p) {
        return $_bw6rudjzjcun3z4g.eq(p, table);
      });
    });
  };
  var simulate = function (bridge, isRoot, direction, initial, anchor) {
    return $_avmzmkkljcun3z67.closest(initial, 'td,th', isRoot).bind(function (start) {
      return $_avmzmkkljcun3z67.closest(start, 'table', isRoot).bind(function (table) {
        if (!inSameTable(anchor, table))
          return $_dx6m1ljhjcun3z22.none();
        return $_5pxv3horjcun3ztu.handle(bridge, isRoot, direction).bind(function (range) {
          return $_avmzmkkljcun3z67.closest(range.finish(), 'td,th', isRoot).map(function (finish) {
            return {
              start: $_b55bxvjijcun3z24.constant(start),
              finish: $_b55bxvjijcun3z24.constant(finish),
              range: $_b55bxvjijcun3z24.constant(range)
            };
          });
        });
      });
    });
  };
  var navigate = function (bridge, isRoot, direction, initial, anchor, precheck) {
    if (detection.browser.isIE()) {
      return $_dx6m1ljhjcun3z22.none();
    } else {
      return precheck(initial, isRoot).orThunk(function () {
        return simulate(bridge, isRoot, direction, initial, anchor).map(function (info) {
          var range = info.range();
          return $_2ger1jokjcun3zs3.response($_dx6m1ljhjcun3z22.some($_5dqjs9onjcun3zsk.makeSitus(range.start(), range.soffset(), range.finish(), range.foffset())), true);
        });
      });
    }
  };
  var firstUpCheck = function (initial, isRoot) {
    return $_avmzmkkljcun3z67.closest(initial, 'tr', isRoot).bind(function (startRow) {
      return $_avmzmkkljcun3z67.closest(startRow, 'table', isRoot).bind(function (table) {
        var rows = $_7pi6mukijcun3z61.descendants(table, 'tr');
        if ($_bw6rudjzjcun3z4g.eq(startRow, rows[0])) {
          return $_florj4ovjcun3zul.seekLeft(table, function (element) {
            return $_1thrsskwjcun3z7w.last(element).isSome();
          }, isRoot).map(function (last) {
            var lastOffset = $_alw4qlkxjcun3z80.getEnd(last);
            return $_2ger1jokjcun3zs3.response($_dx6m1ljhjcun3z22.some($_5dqjs9onjcun3zsk.makeSitus(last, lastOffset, last, lastOffset)), true);
          });
        } else {
          return $_dx6m1ljhjcun3z22.none();
        }
      });
    });
  };
  var lastDownCheck = function (initial, isRoot) {
    return $_avmzmkkljcun3z67.closest(initial, 'tr', isRoot).bind(function (startRow) {
      return $_avmzmkkljcun3z67.closest(startRow, 'table', isRoot).bind(function (table) {
        var rows = $_7pi6mukijcun3z61.descendants(table, 'tr');
        if ($_bw6rudjzjcun3z4g.eq(startRow, rows[rows.length - 1])) {
          return $_florj4ovjcun3zul.seekRight(table, function (element) {
            return $_1thrsskwjcun3z7w.first(element).isSome();
          }, isRoot).map(function (first) {
            return $_2ger1jokjcun3zs3.response($_dx6m1ljhjcun3z22.some($_5dqjs9onjcun3zsk.makeSitus(first, 0, first, 0)), true);
          });
        } else {
          return $_dx6m1ljhjcun3z22.none();
        }
      });
    });
  };
  var select = function (bridge, container, isRoot, direction, initial, anchor, selectRange) {
    return simulate(bridge, isRoot, direction, initial, anchor).bind(function (info) {
      return $_5u4guaopjcun3zsx.detect(container, isRoot, info.start(), info.finish(), selectRange);
    });
  };
  var $_9m2svvoqjcun3zt4 = {
    navigate: navigate,
    select: select,
    firstUpCheck: firstUpCheck,
    lastDownCheck: lastDownCheck
  };

  var findCell = function (target, isRoot) {
    return $_avmzmkkljcun3z67.closest(target, 'td,th', isRoot);
  };
  var MouseSelection = function (bridge, container, isRoot, annotations) {
    var cursor = $_dx6m1ljhjcun3z22.none();
    var clearState = function () {
      cursor = $_dx6m1ljhjcun3z22.none();
    };
    var mousedown = function (event) {
      annotations.clear(container);
      cursor = findCell(event.target(), isRoot);
    };
    var mouseover = function (event) {
      cursor.each(function (start) {
        annotations.clear(container);
        findCell(event.target(), isRoot).each(function (finish) {
          $_9d2c5ml4jcun3z8x.identify(start, finish, isRoot).each(function (cellSel) {
            var boxes = cellSel.boxes().getOr([]);
            if (boxes.length > 1 || boxes.length === 1 && !$_bw6rudjzjcun3z4g.eq(start, finish)) {
              annotations.selectRange(container, boxes, cellSel.start(), cellSel.finish());
              bridge.selectContents(finish);
            }
          });
        });
      });
    };
    var mouseup = function () {
      cursor.each(clearState);
    };
    return {
      mousedown: mousedown,
      mouseover: mouseover,
      mouseup: mouseup
    };
  };

  var $_2kh02hp6jcun3zwf = {
    down: {
      traverse: $_9elq0ajxjcun3z47.nextSibling,
      gather: $_florj4ovjcun3zul.after,
      relative: $_6j7efvo4jcun3zpm.before,
      otherRetry: $_fjs6dcoujcun3zua.tryDown,
      ieRetry: $_fjs6dcoujcun3zua.ieTryDown,
      failure: $_bk95tlp0jcun3zv7.adt.failedDown
    },
    up: {
      traverse: $_9elq0ajxjcun3z47.prevSibling,
      gather: $_florj4ovjcun3zul.before,
      relative: $_6j7efvo4jcun3zpm.before,
      otherRetry: $_fjs6dcoujcun3zua.tryUp,
      ieRetry: $_fjs6dcoujcun3zua.ieTryUp,
      failure: $_bk95tlp0jcun3zv7.adt.failedUp
    }
  };

  var rc = $_asy2ehjljcun3z2p.immutable('rows', 'cols');
  var mouse = function (win, container, isRoot, annotations) {
    var bridge = WindowBridge(win);
    var handlers = MouseSelection(bridge, container, isRoot, annotations);
    return {
      mousedown: handlers.mousedown,
      mouseover: handlers.mouseover,
      mouseup: handlers.mouseup
    };
  };
  var keyboard = function (win, container, isRoot, annotations) {
    var bridge = WindowBridge(win);
    var clearToNavigate = function () {
      annotations.clear(container);
      return $_dx6m1ljhjcun3z22.none();
    };
    var keydown = function (event, start, soffset, finish, foffset, direction) {
      var keycode = event.raw().which;
      var shiftKey = event.raw().shiftKey === true;
      var handler = $_9d2c5ml4jcun3z8x.retrieve(container, annotations.selectedSelector()).fold(function () {
        if ($_bj7b4eoljcun3zs6.isDown(keycode) && shiftKey) {
          return $_b55bxvjijcun3z24.curry($_9m2svvoqjcun3zt4.select, bridge, container, isRoot, $_2kh02hp6jcun3zwf.down, finish, start, annotations.selectRange);
        } else if ($_bj7b4eoljcun3zs6.isUp(keycode) && shiftKey) {
          return $_b55bxvjijcun3z24.curry($_9m2svvoqjcun3zt4.select, bridge, container, isRoot, $_2kh02hp6jcun3zwf.up, finish, start, annotations.selectRange);
        } else if ($_bj7b4eoljcun3zs6.isDown(keycode)) {
          return $_b55bxvjijcun3z24.curry($_9m2svvoqjcun3zt4.navigate, bridge, isRoot, $_2kh02hp6jcun3zwf.down, finish, start, $_9m2svvoqjcun3zt4.lastDownCheck);
        } else if ($_bj7b4eoljcun3zs6.isUp(keycode)) {
          return $_b55bxvjijcun3z24.curry($_9m2svvoqjcun3zt4.navigate, bridge, isRoot, $_2kh02hp6jcun3zwf.up, finish, start, $_9m2svvoqjcun3zt4.firstUpCheck);
        } else {
          return $_dx6m1ljhjcun3z22.none;
        }
      }, function (selected) {
        var update = function (attempts) {
          return function () {
            var navigation = $_cat2nnmajcun3zfy.findMap(attempts, function (delta) {
              return $_5u4guaopjcun3zsx.update(delta.rows(), delta.cols(), container, selected, annotations);
            });
            return navigation.fold(function () {
              return $_9d2c5ml4jcun3z8x.getEdges(container, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(function (edges) {
                var relative = $_bj7b4eoljcun3zs6.isDown(keycode) || direction.isForward(keycode) ? $_6j7efvo4jcun3zpm.after : $_6j7efvo4jcun3zpm.before;
                bridge.setRelativeSelection($_6j7efvo4jcun3zpm.on(edges.first(), 0), relative(edges.table()));
                annotations.clear(container);
                return $_2ger1jokjcun3zs3.response($_dx6m1ljhjcun3z22.none(), true);
              });
            }, function (_) {
              return $_dx6m1ljhjcun3z22.some($_2ger1jokjcun3zs3.response($_dx6m1ljhjcun3z22.none(), true));
            });
          };
        };
        if ($_bj7b4eoljcun3zs6.isDown(keycode) && shiftKey)
          return update([rc(+1, 0)]);
        else if ($_bj7b4eoljcun3zs6.isUp(keycode) && shiftKey)
          return update([rc(-1, 0)]);
        else if (direction.isBackward(keycode) && shiftKey)
          return update([
            rc(0, -1),
            rc(-1, 0)
          ]);
        else if (direction.isForward(keycode) && shiftKey)
          return update([
            rc(0, +1),
            rc(+1, 0)
          ]);
        else if ($_bj7b4eoljcun3zs6.isNavigation(keycode) && shiftKey === false)
          return clearToNavigate;
        else
          return $_dx6m1ljhjcun3z22.none;
      });
      return handler();
    };
    var keyup = function (event, start, soffset, finish, foffset) {
      return $_9d2c5ml4jcun3z8x.retrieve(container, annotations.selectedSelector()).fold(function () {
        var keycode = event.raw().which;
        var shiftKey = event.raw().shiftKey === true;
        if (shiftKey === false)
          return $_dx6m1ljhjcun3z22.none();
        if ($_bj7b4eoljcun3zs6.isNavigation(keycode))
          return $_5u4guaopjcun3zsx.sync(container, isRoot, start, soffset, finish, foffset, annotations.selectRange);
        else
          return $_dx6m1ljhjcun3z22.none();
      }, $_dx6m1ljhjcun3z22.none);
    };
    return {
      keydown: keydown,
      keyup: keyup
    };
  };
  var $_9t03lnojjcun3zrt = {
    mouse: mouse,
    keyboard: keyboard
  };

  var add$3 = function (element, classes) {
    $_cirynjgjcun3z1x.each(classes, function (x) {
      $_6f75fomljcun3zhv.add(element, x);
    });
  };
  var remove$7 = function (element, classes) {
    $_cirynjgjcun3z1x.each(classes, function (x) {
      $_6f75fomljcun3zhv.remove(element, x);
    });
  };
  var toggle$2 = function (element, classes) {
    $_cirynjgjcun3z1x.each(classes, function (x) {
      $_6f75fomljcun3zhv.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return $_cirynjgjcun3z1x.forall(classes, function (clazz) {
      return $_6f75fomljcun3zhv.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return $_cirynjgjcun3z1x.exists(classes, function (clazz) {
      return $_6f75fomljcun3zhv.has(element, clazz);
    });
  };
  var getNative = function (element) {
    var classList = element.dom().classList;
    var r = new Array(classList.length);
    for (var i = 0; i < classList.length; i++) {
      r[i] = classList.item(i);
    }
    return r;
  };
  var get$11 = function (element) {
    return $_fea8v5mnjcun3zhy.supports(element) ? getNative(element) : $_fea8v5mnjcun3zhy.get(element);
  };
  var $_a485x7p9jcun3zws = {
    add: add$3,
    remove: remove$7,
    toggle: toggle$2,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$11
  };

  var addClass = function (clazz) {
    return function (element) {
      $_6f75fomljcun3zhv.add(element, clazz);
    };
  };
  var removeClass = function (clazz) {
    return function (element) {
      $_6f75fomljcun3zhv.remove(element, clazz);
    };
  };
  var removeClasses = function (classes) {
    return function (element) {
      $_a485x7p9jcun3zws.remove(element, classes);
    };
  };
  var hasClass = function (clazz) {
    return function (element) {
      return $_6f75fomljcun3zhv.has(element, clazz);
    };
  };
  var $_acn8nsp8jcun3zwr = {
    addClass: addClass,
    removeClass: removeClass,
    removeClasses: removeClasses,
    hasClass: hasClass
  };

  var byClass = function (ephemera) {
    var addSelectionClass = $_acn8nsp8jcun3zwr.addClass(ephemera.selected());
    var removeSelectionClasses = $_acn8nsp8jcun3zwr.removeClasses([
      ephemera.selected(),
      ephemera.lastSelected(),
      ephemera.firstSelected()
    ]);
    var clear = function (container) {
      var sels = $_7pi6mukijcun3z61.descendants(container, ephemera.selectedSelector());
      $_cirynjgjcun3z1x.each(sels, removeSelectionClasses);
    };
    var selectRange = function (container, cells, start, finish) {
      clear(container);
      $_cirynjgjcun3z1x.each(cells, addSelectionClass);
      $_6f75fomljcun3zhv.add(start, ephemera.firstSelected());
      $_6f75fomljcun3zhv.add(finish, ephemera.lastSelected());
    };
    return {
      clear: clear,
      selectRange: selectRange,
      selectedSelector: ephemera.selectedSelector,
      firstSelectedSelector: ephemera.firstSelectedSelector,
      lastSelectedSelector: ephemera.lastSelectedSelector
    };
  };
  var byAttr = function (ephemera) {
    var removeSelectionAttributes = function (element) {
      $_5qpsynkgjcun3z5t.remove(element, ephemera.selected());
      $_5qpsynkgjcun3z5t.remove(element, ephemera.firstSelected());
      $_5qpsynkgjcun3z5t.remove(element, ephemera.lastSelected());
    };
    var addSelectionAttribute = function (element) {
      $_5qpsynkgjcun3z5t.set(element, ephemera.selected(), '1');
    };
    var clear = function (container) {
      var sels = $_7pi6mukijcun3z61.descendants(container, ephemera.selectedSelector());
      $_cirynjgjcun3z1x.each(sels, removeSelectionAttributes);
    };
    var selectRange = function (container, cells, start, finish) {
      clear(container);
      $_cirynjgjcun3z1x.each(cells, addSelectionAttribute);
      $_5qpsynkgjcun3z5t.set(start, ephemera.firstSelected(), '1');
      $_5qpsynkgjcun3z5t.set(finish, ephemera.lastSelected(), '1');
    };
    return {
      clear: clear,
      selectRange: selectRange,
      selectedSelector: ephemera.selectedSelector,
      firstSelectedSelector: ephemera.firstSelectedSelector,
      lastSelectedSelector: ephemera.lastSelectedSelector
    };
  };
  var $_2va2w3p7jcun3zwk = {
    byClass: byClass,
    byAttr: byAttr
  };

  var CellSelection$1 = function (editor, lazyResize) {
    var handlerStruct = $_asy2ehjljcun3z2p.immutableBag([
      'mousedown',
      'mouseover',
      'mouseup',
      'keyup',
      'keydown'
    ], []);
    var handlers = $_dx6m1ljhjcun3z22.none();
    var annotations = $_2va2w3p7jcun3zwk.byAttr($_8e88qlgjcun3zbc);
    editor.on('init', function (e) {
      var win = editor.getWin();
      var body = $_aqr6ugn2jcun3zk0.getBody(editor);
      var isRoot = $_aqr6ugn2jcun3zk0.getIsRoot(editor);
      var syncSelection = function () {
        var sel = editor.selection;
        var start = $_cycgn2jvjcun3z41.fromDom(sel.getStart());
        var end = $_cycgn2jvjcun3z41.fromDom(sel.getEnd());
        var startTable = $_b7drosjsjcun3z37.table(start);
        var endTable = $_b7drosjsjcun3z37.table(end);
        var sameTable = startTable.bind(function (tableStart) {
          return endTable.bind(function (tableEnd) {
            return $_bw6rudjzjcun3z4g.eq(tableStart, tableEnd) ? $_dx6m1ljhjcun3z22.some(true) : $_dx6m1ljhjcun3z22.none();
          });
        });
        sameTable.fold(function () {
          annotations.clear(body);
        }, $_b55bxvjijcun3z24.noop);
      };
      var mouseHandlers = $_9t03lnojjcun3zrt.mouse(win, body, isRoot, annotations);
      var keyHandlers = $_9t03lnojjcun3zrt.keyboard(win, body, isRoot, annotations);
      var handleResponse = function (event, response) {
        if (response.kill()) {
          event.kill();
        }
        response.selection().each(function (ns) {
          var relative = $_u2xe9o3jcun3zpj.relative(ns.start(), ns.finish());
          var rng = $_77b2rdo9jcun3zqb.asLtrRange(win, relative);
          editor.selection.setRng(rng);
        });
      };
      var keyup = function (event) {
        var wrappedEvent = wrapEvent(event);
        if (wrappedEvent.raw().shiftKey && $_bj7b4eoljcun3zs6.isNavigation(wrappedEvent.raw().which)) {
          var rng = editor.selection.getRng();
          var start = $_cycgn2jvjcun3z41.fromDom(rng.startContainer);
          var end = $_cycgn2jvjcun3z41.fromDom(rng.endContainer);
          keyHandlers.keyup(wrappedEvent, start, rng.startOffset, end, rng.endOffset).each(function (response) {
            handleResponse(wrappedEvent, response);
          });
        }
      };
      var checkLast = function (last) {
        return !$_5qpsynkgjcun3z5t.has(last, 'data-mce-bogus') && $_148ei0khjcun3z5z.name(last) !== 'br' && !($_148ei0khjcun3z5z.isText(last) && $_b4faswkyjcun3z84.get(last).length === 0);
      };
      var getLast = function () {
        var body = $_cycgn2jvjcun3z41.fromDom(editor.getBody());
        var lastChild = $_9elq0ajxjcun3z47.lastChild(body);
        var getPrevLast = function (last) {
          return $_9elq0ajxjcun3z47.prevSibling(last).bind(function (prevLast) {
            return checkLast(prevLast) ? $_dx6m1ljhjcun3z22.some(prevLast) : getPrevLast(prevLast);
          });
        };
        return lastChild.bind(function (last) {
          return checkLast(last) ? $_dx6m1ljhjcun3z22.some(last) : getPrevLast(last);
        });
      };
      var keydown = function (event) {
        var wrappedEvent = wrapEvent(event);
        lazyResize().each(function (resize) {
          resize.hideBars();
        });
        if (event.which === 40) {
          getLast().each(function (last) {
            if ($_148ei0khjcun3z5z.name(last) === 'table') {
              if (editor.settings.forced_root_block) {
                editor.dom.add(editor.getBody(), editor.settings.forced_root_block, editor.settings.forced_root_block_attrs, '<br/>');
              } else {
                editor.dom.add(editor.getBody(), 'br');
              }
            }
          });
        }
        var rng = editor.selection.getRng();
        var startContainer = $_cycgn2jvjcun3z41.fromDom(editor.selection.getStart());
        var start = $_cycgn2jvjcun3z41.fromDom(rng.startContainer);
        var end = $_cycgn2jvjcun3z41.fromDom(rng.endContainer);
        var direction = $_6xdltbn3jcun3zk3.directionAt(startContainer).isRtl() ? $_bj7b4eoljcun3zs6.rtl : $_bj7b4eoljcun3zs6.ltr;
        keyHandlers.keydown(wrappedEvent, start, rng.startOffset, end, rng.endOffset, direction).each(function (response) {
          handleResponse(wrappedEvent, response);
        });
        lazyResize().each(function (resize) {
          resize.showBars();
        });
      };
      var wrapEvent = function (event) {
        var target = $_cycgn2jvjcun3z41.fromDom(event.target);
        var stop = function () {
          event.stopPropagation();
        };
        var prevent = function () {
          event.preventDefault();
        };
        var kill = $_b55bxvjijcun3z24.compose(prevent, stop);
        return {
          target: $_b55bxvjijcun3z24.constant(target),
          x: $_b55bxvjijcun3z24.constant(event.x),
          y: $_b55bxvjijcun3z24.constant(event.y),
          stop: stop,
          prevent: prevent,
          kill: kill,
          raw: $_b55bxvjijcun3z24.constant(event)
        };
      };
      var isLeftMouse = function (raw) {
        return raw.button === 0;
      };
      var isLeftButtonPressed = function (raw) {
        if (raw.buttons === undefined) {
          return true;
        }
        return (raw.buttons & 1) !== 0;
      };
      var mouseDown = function (e) {
        if (isLeftMouse(e)) {
          mouseHandlers.mousedown(wrapEvent(e));
        }
      };
      var mouseOver = function (e) {
        if (isLeftButtonPressed(e)) {
          mouseHandlers.mouseover(wrapEvent(e));
        }
      };
      var mouseUp = function (e) {
        if (isLeftMouse) {
          mouseHandlers.mouseup(wrapEvent(e));
        }
      };
      editor.on('mousedown', mouseDown);
      editor.on('mouseover', mouseOver);
      editor.on('mouseup', mouseUp);
      editor.on('keyup', keyup);
      editor.on('keydown', keydown);
      editor.on('nodechange', syncSelection);
      handlers = $_dx6m1ljhjcun3z22.some(handlerStruct({
        mousedown: mouseDown,
        mouseover: mouseOver,
        mouseup: mouseUp,
        keyup: keyup,
        keydown: keydown
      }));
    });
    var destroy = function () {
      handlers.each(function (handlers) {
      });
    };
    return {
      clear: annotations.clear,
      destroy: destroy
    };
  };

  var Selections = function (editor) {
    var get = function () {
      var body = $_aqr6ugn2jcun3zk0.getBody(editor);
      return $_7itsw3l3jcun3z8q.retrieve(body, $_8e88qlgjcun3zbc.selectedSelector()).fold(function () {
        if (editor.selection.getStart() === undefined) {
          return $_4tfhcdlhjcun3zbd.none();
        } else {
          return $_4tfhcdlhjcun3zbd.single(editor.selection);
        }
      }, function (cells) {
        return $_4tfhcdlhjcun3zbd.multiple(cells);
      });
    };
    return { get: get };
  };

  var each$4 = Tools.each;
  var addButtons = function (editor) {
    var menuItems = [];
    each$4('inserttable tableprops deletetable | cell row column'.split(' '), function (name) {
      if (name === '|') {
        menuItems.push({ text: '-' });
      } else {
        menuItems.push(editor.menuItems[name]);
      }
    });
    editor.addButton('table', {
      type: 'menubutton',
      title: 'Table',
      menu: menuItems
    });
    function cmd(command) {
      return function () {
        editor.execCommand(command);
      };
    }
    editor.addButton('tableprops', {
      title: 'Table properties',
      onclick: $_b55bxvjijcun3z24.curry($_8im4gjn8jcun3zkn.open, editor, true),
      icon: 'table'
    });
    editor.addButton('tabledelete', {
      title: 'Delete table',
      onclick: cmd('mceTableDelete')
    });
    editor.addButton('tablecellprops', {
      title: 'Cell properties',
      onclick: cmd('mceTableCellProps')
    });
    editor.addButton('tablemergecells', {
      title: 'Merge cells',
      onclick: cmd('mceTableMergeCells')
    });
    editor.addButton('tablesplitcells', {
      title: 'Split cell',
      onclick: cmd('mceTableSplitCells')
    });
    editor.addButton('tableinsertrowbefore', {
      title: 'Insert row before',
      onclick: cmd('mceTableInsertRowBefore')
    });
    editor.addButton('tableinsertrowafter', {
      title: 'Insert row after',
      onclick: cmd('mceTableInsertRowAfter')
    });
    editor.addButton('tabledeleterow', {
      title: 'Delete row',
      onclick: cmd('mceTableDeleteRow')
    });
    editor.addButton('tablerowprops', {
      title: 'Row properties',
      onclick: cmd('mceTableRowProps')
    });
    editor.addButton('tablecutrow', {
      title: 'Cut row',
      onclick: cmd('mceTableCutRow')
    });
    editor.addButton('tablecopyrow', {
      title: 'Copy row',
      onclick: cmd('mceTableCopyRow')
    });
    editor.addButton('tablepasterowbefore', {
      title: 'Paste row before',
      onclick: cmd('mceTablePasteRowBefore')
    });
    editor.addButton('tablepasterowafter', {
      title: 'Paste row after',
      onclick: cmd('mceTablePasteRowAfter')
    });
    editor.addButton('tableinsertcolbefore', {
      title: 'Insert column before',
      onclick: cmd('mceTableInsertColBefore')
    });
    editor.addButton('tableinsertcolafter', {
      title: 'Insert column after',
      onclick: cmd('mceTableInsertColAfter')
    });
    editor.addButton('tabledeletecol', {
      title: 'Delete column',
      onclick: cmd('mceTableDeleteCol')
    });
  };
  var addToolbars = function (editor) {
    var isTable = function (table) {
      var selectorMatched = editor.dom.is(table, 'table') && editor.getBody().contains(table);
      return selectorMatched;
    };
    var toolbarItems = editor.settings.table_toolbar;
    if (toolbarItems === '' || toolbarItems === false) {
      return;
    }
    if (!toolbarItems) {
      toolbarItems = 'tableprops tabledelete | ' + 'tableinsertrowbefore tableinsertrowafter tabledeleterow | ' + 'tableinsertcolbefore tableinsertcolafter tabledeletecol';
    }
    editor.addContextToolbar(isTable, toolbarItems);
  };
  var $_eials7pbjcun3zwy = {
    addButtons: addButtons,
    addToolbars: addToolbars
  };

  var addMenuItems = function (editor, selections) {
    var targets = $_dx6m1ljhjcun3z22.none();
    var tableCtrls = [];
    var cellCtrls = [];
    var mergeCtrls = [];
    var unmergeCtrls = [];
    var noTargetDisable = function (ctrl) {
      ctrl.disabled(true);
    };
    var ctrlEnable = function (ctrl) {
      ctrl.disabled(false);
    };
    var pushTable = function () {
      var self = this;
      tableCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        ctrlEnable(self);
      });
    };
    var pushCell = function () {
      var self = this;
      cellCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        ctrlEnable(self);
      });
    };
    var pushMerge = function () {
      var self = this;
      mergeCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        self.disabled(targets.mergable().isNone());
      });
    };
    var pushUnmerge = function () {
      var self = this;
      unmergeCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        self.disabled(targets.unmergable().isNone());
      });
    };
    var setDisabledCtrls = function () {
      targets.fold(function () {
        $_cirynjgjcun3z1x.each(tableCtrls, noTargetDisable);
        $_cirynjgjcun3z1x.each(cellCtrls, noTargetDisable);
        $_cirynjgjcun3z1x.each(mergeCtrls, noTargetDisable);
        $_cirynjgjcun3z1x.each(unmergeCtrls, noTargetDisable);
      }, function (targets) {
        $_cirynjgjcun3z1x.each(tableCtrls, ctrlEnable);
        $_cirynjgjcun3z1x.each(cellCtrls, ctrlEnable);
        $_cirynjgjcun3z1x.each(mergeCtrls, function (mergeCtrl) {
          mergeCtrl.disabled(targets.mergable().isNone());
        });
        $_cirynjgjcun3z1x.each(unmergeCtrls, function (unmergeCtrl) {
          unmergeCtrl.disabled(targets.unmergable().isNone());
        });
      });
    };
    editor.on('init', function () {
      editor.on('nodechange', function (e) {
        var cellOpt = $_dx6m1ljhjcun3z22.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        targets = cellOpt.bind(function (cellDom) {
          var cell = $_cycgn2jvjcun3z41.fromDom(cellDom);
          var table = $_b7drosjsjcun3z37.table(cell);
          return table.map(function (table) {
            return $_bncpsrl1jcun3z8e.forMenu(selections, table, cell);
          });
        });
        setDisabledCtrls();
      });
    });
    var generateTableGrid = function () {
      var html = '';
      html = '<table role="grid" class="mce-grid mce-grid-border" aria-readonly="true">';
      for (var y = 0; y < 10; y++) {
        html += '<tr>';
        for (var x = 0; x < 10; x++) {
          html += '<td role="gridcell" tabindex="-1"><a id="mcegrid' + (y * 10 + x) + '" href="#" ' + 'data-mce-x="' + x + '" data-mce-y="' + y + '"></a></td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      html += '<div class="mce-text-center" role="presentation">1 x 1</div>';
      return html;
    };
    var selectGrid = function (editor, tx, ty, control) {
      var table = control.getEl().getElementsByTagName('table')[0];
      var x, y, focusCell, cell, active;
      var rtl = control.isRtl() || control.parent().rel === 'tl-tr';
      table.nextSibling.innerHTML = tx + 1 + ' x ' + (ty + 1);
      if (rtl) {
        tx = 9 - tx;
      }
      for (y = 0; y < 10; y++) {
        for (x = 0; x < 10; x++) {
          cell = table.rows[y].childNodes[x].firstChild;
          active = (rtl ? x >= tx : x <= tx) && y <= ty;
          editor.dom.toggleClass(cell, 'mce-active', active);
          if (active) {
            focusCell = cell;
          }
        }
      }
      return focusCell.parentNode;
    };
    var insertTable = editor.settings.table_grid === false ? {
      text: 'Table',
      icon: 'table',
      context: 'table',
      onclick: $_b55bxvjijcun3z24.curry($_8im4gjn8jcun3zkn.open, editor)
    } : {
      text: 'Table',
      icon: 'table',
      context: 'table',
      ariaHideMenu: true,
      onclick: function (e) {
        if (e.aria) {
          this.parent().hideAll();
          e.stopImmediatePropagation();
          $_8im4gjn8jcun3zkn.open(editor);
        }
      },
      onshow: function () {
        selectGrid(editor, 0, 0, this.menu.items()[0]);
      },
      onhide: function () {
        var elements = this.menu.items()[0].getEl().getElementsByTagName('a');
        editor.dom.removeClass(elements, 'mce-active');
        editor.dom.addClass(elements[0], 'mce-active');
      },
      menu: [{
          type: 'container',
          html: generateTableGrid(),
          onPostRender: function () {
            this.lastX = this.lastY = 0;
          },
          onmousemove: function (e) {
            var target = e.target;
            var x, y;
            if (target.tagName.toUpperCase() === 'A') {
              x = parseInt(target.getAttribute('data-mce-x'), 10);
              y = parseInt(target.getAttribute('data-mce-y'), 10);
              if (this.isRtl() || this.parent().rel === 'tl-tr') {
                x = 9 - x;
              }
              if (x !== this.lastX || y !== this.lastY) {
                selectGrid(editor, x, y, e.control);
                this.lastX = x;
                this.lastY = y;
              }
            }
          },
          onclick: function (e) {
            var self = this;
            if (e.target.tagName.toUpperCase() === 'A') {
              e.preventDefault();
              e.stopPropagation();
              self.parent().cancel();
              editor.undoManager.transact(function () {
                $_ecfdziljjcun3zbi.insert(editor, self.lastX + 1, self.lastY + 1);
              });
              editor.addVisual();
            }
          }
        }]
    };
    function cmd(command) {
      return function () {
        editor.execCommand(command);
      };
    }
    var tableProperties = {
      text: 'Table properties',
      context: 'table',
      onPostRender: pushTable,
      onclick: $_b55bxvjijcun3z24.curry($_8im4gjn8jcun3zkn.open, editor, true)
    };
    var deleteTable = {
      text: 'Delete table',
      context: 'table',
      onPostRender: pushTable,
      cmd: 'mceTableDelete'
    };
    var row = {
      text: 'Row',
      context: 'table',
      menu: [
        {
          text: 'Insert row before',
          onclick: cmd('mceTableInsertRowBefore'),
          onPostRender: pushCell
        },
        {
          text: 'Insert row after',
          onclick: cmd('mceTableInsertRowAfter'),
          onPostRender: pushCell
        },
        {
          text: 'Delete row',
          onclick: cmd('mceTableDeleteRow'),
          onPostRender: pushCell
        },
        {
          text: 'Row properties',
          onclick: cmd('mceTableRowProps'),
          onPostRender: pushCell
        },
        { text: '-' },
        {
          text: 'Cut row',
          onclick: cmd('mceTableCutRow'),
          onPostRender: pushCell
        },
        {
          text: 'Copy row',
          onclick: cmd('mceTableCopyRow'),
          onPostRender: pushCell
        },
        {
          text: 'Paste row before',
          onclick: cmd('mceTablePasteRowBefore'),
          onPostRender: pushCell
        },
        {
          text: 'Paste row after',
          onclick: cmd('mceTablePasteRowAfter'),
          onPostRender: pushCell
        }
      ]
    };
    var column = {
      text: 'Column',
      context: 'table',
      menu: [
        {
          text: 'Insert column before',
          onclick: cmd('mceTableInsertColBefore'),
          onPostRender: pushCell
        },
        {
          text: 'Insert column after',
          onclick: cmd('mceTableInsertColAfter'),
          onPostRender: pushCell
        },
        {
          text: 'Delete column',
          onclick: cmd('mceTableDeleteCol'),
          onPostRender: pushCell
        }
      ]
    };
    var cell = {
      separator: 'before',
      text: 'Cell',
      context: 'table',
      menu: [
        {
          text: 'Cell properties',
          onclick: cmd('mceTableCellProps'),
          onPostRender: pushCell
        },
        {
          text: 'Merge cells',
          onclick: cmd('mceTableMergeCells'),
          onPostRender: pushMerge
        },
        {
          text: 'Split cell',
          onclick: cmd('mceTableSplitCells'),
          onPostRender: pushUnmerge
        }
      ]
    };
    editor.addMenuItem('inserttable', insertTable);
    editor.addMenuItem('tableprops', tableProperties);
    editor.addMenuItem('deletetable', deleteTable);
    editor.addMenuItem('row', row);
    editor.addMenuItem('column', column);
    editor.addMenuItem('cell', cell);
  };
  var $_4cqp1hpcjcun3zx2 = { addMenuItems: addMenuItems };

  function Plugin(editor) {
    var self = this;
    var resizeHandler = ResizeHandler(editor);
    var cellSelection = CellSelection$1(editor, resizeHandler.lazyResize);
    var actions = TableActions(editor, resizeHandler.lazyWire);
    var selections = Selections(editor);
    $_a9lln3n5jcun3zk8.registerCommands(editor, actions, cellSelection, selections);
    $_bw0vxbjfjcun3z1i.registerEvents(editor, selections, actions, cellSelection);
    $_4cqp1hpcjcun3zx2.addMenuItems(editor, selections);
    $_eials7pbjcun3zwy.addButtons(editor);
    $_eials7pbjcun3zwy.addToolbars(editor);
    editor.on('PreInit', function () {
      editor.serializer.addTempAttr($_8e88qlgjcun3zbc.firstSelected());
      editor.serializer.addTempAttr($_8e88qlgjcun3zbc.lastSelected());
    });
    if (editor.settings.table_tab_navigation !== false) {
      editor.on('keydown', function (e) {
        $_8xt4xo0jcun3zos.handle(e, editor, actions, resizeHandler.lazyWire);
      });
    }
    editor.on('remove', function () {
      resizeHandler.destroy();
      cellSelection.destroy();
    });
    self.insertTable = function (columns, rows) {
      return $_ecfdziljjcun3zbi.insert(editor, columns, rows);
    };
    self.setClipboardRows = $_a9lln3n5jcun3zk8.setClipboardRows;
    self.getClipboardRows = $_a9lln3n5jcun3zk8.getClipboardRows;
  }
  PluginManager.add('table', Plugin);
  var Plugin$1 = function () {
  };

  return Plugin$1;

}());
})()
