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
  var $_3z1bpnjhjcg89dgu = {
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

  var never = $_3z1bpnjhjcg89dgu.never;
  var always = $_3z1bpnjhjcg89dgu.always;
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
      toString: $_3z1bpnjhjcg89dgu.constant('none()')
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
  var $_gj9ujrjgjcg89dgs = {
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
    return r === -1 ? $_gj9ujrjgjcg89dgs.none() : $_gj9ujrjgjcg89dgs.some(r);
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
        return $_gj9ujrjgjcg89dgs.some(x);
      }
    }
    return $_gj9ujrjgjcg89dgs.none();
  };
  var findIndex = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return $_gj9ujrjgjcg89dgs.some(i);
      }
    }
    return $_gj9ujrjgjcg89dgs.none();
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
    return xs.length === 0 ? $_gj9ujrjgjcg89dgs.none() : $_gj9ujrjgjcg89dgs.some(xs[0]);
  };
  var last = function (xs) {
    return xs.length === 0 ? $_gj9ujrjgjcg89dgs.none() : $_gj9ujrjgjcg89dgs.some(xs[xs.length - 1]);
  };
  var $_9786xxjfjcg89dgm = {
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
        return $_gj9ujrjgjcg89dgs.some(x);
      }
    }
    return $_gj9ujrjgjcg89dgs.none();
  };
  var values = function (obj) {
    return mapToArray(obj, function (v) {
      return v;
    });
  };
  var size = function (obj) {
    return values(obj).length;
  };
  var $_7p93f5jjjcg89dh9 = {
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
      $_9786xxjfjcg89dgm.each(fields, function (name, i) {
        struct[name] = $_3z1bpnjhjcg89dgu.constant(values[i]);
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
  var $_4jzhk7jojcg89dhh = {
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
    if (!$_4jzhk7jojcg89dhh.isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    $_9786xxjfjcg89dgm.each(array, function (a) {
      if (!$_4jzhk7jojcg89dhh.isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = $_9786xxjfjcg89dgm.find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };
  var $_a2gp2pjnjcg89dhf = {
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
    $_a2gp2pjnjcg89dhf.validateStrArr('required', required);
    $_a2gp2pjnjcg89dhf.validateStrArr('optional', optional);
    $_a2gp2pjnjcg89dhf.checkDupes(everything);
    return function (obj) {
      var keys = $_7p93f5jjjcg89dh9.keys(obj);
      var allReqd = $_9786xxjfjcg89dgm.forall(required, function (req) {
        return $_9786xxjfjcg89dgm.contains(keys, req);
      });
      if (!allReqd)
        $_a2gp2pjnjcg89dhf.reqMessage(required, keys);
      var unsupported = $_9786xxjfjcg89dgm.filter(keys, function (key) {
        return !$_9786xxjfjcg89dgm.contains(everything, key);
      });
      if (unsupported.length > 0)
        $_a2gp2pjnjcg89dhf.unsuppMessage(unsupported);
      var r = {};
      $_9786xxjfjcg89dgm.each(required, function (req) {
        r[req] = $_3z1bpnjhjcg89dgu.constant(obj[req]);
      });
      $_9786xxjfjcg89dgm.each(optional, function (opt) {
        r[opt] = $_3z1bpnjhjcg89dgu.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? $_gj9ujrjgjcg89dgs.some(obj[opt]) : $_gj9ujrjgjcg89dgs.none());
      });
      return r;
    };
  };

  var $_mgt0hjkjcg89dhb = {
    immutable: Immutable,
    immutableBag: MixedBag
  };

  var dimensions = $_mgt0hjkjcg89dhb.immutable('width', 'height');
  var grid = $_mgt0hjkjcg89dhb.immutable('rows', 'columns');
  var address = $_mgt0hjkjcg89dhb.immutable('row', 'column');
  var coords = $_mgt0hjkjcg89dhb.immutable('x', 'y');
  var detail = $_mgt0hjkjcg89dhb.immutable('element', 'rowspan', 'colspan');
  var detailnew = $_mgt0hjkjcg89dhb.immutable('element', 'rowspan', 'colspan', 'isNew');
  var extended = $_mgt0hjkjcg89dhb.immutable('element', 'rowspan', 'colspan', 'row', 'column');
  var rowdata = $_mgt0hjkjcg89dhb.immutable('element', 'cells', 'section');
  var elementnew = $_mgt0hjkjcg89dhb.immutable('element', 'isNew');
  var rowdatanew = $_mgt0hjkjcg89dhb.immutable('element', 'cells', 'section', 'isNew');
  var rowcells = $_mgt0hjkjcg89dhb.immutable('cells', 'section');
  var rowdetails = $_mgt0hjkjcg89dhb.immutable('details', 'section');
  var bounds = $_mgt0hjkjcg89dhb.immutable('startRow', 'startCol', 'finishRow', 'finishCol');
  var $_fmvzq0jqjcg89dhq = {
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
    return { dom: $_3z1bpnjhjcg89dgu.constant(node) };
  };
  var fromPoint = function (doc, x, y) {
    return $_gj9ujrjgjcg89dgs.from(doc.dom().elementFromPoint(x, y)).map(fromDom);
  };
  var $_a8yw3ijujcg89dik = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_1p3qykjvjcg89dio = {
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

  var ELEMENT = $_1p3qykjvjcg89dio.ELEMENT;
  var DOCUMENT = $_1p3qykjvjcg89dio.DOCUMENT;
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
    return bypassSelector(base) ? [] : $_9786xxjfjcg89dgm.map(base.querySelectorAll(selector), $_a8yw3ijujcg89dik.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? $_gj9ujrjgjcg89dgs.none() : $_gj9ujrjgjcg89dgs.from(base.querySelector(selector)).map($_a8yw3ijujcg89dik.fromDom);
  };
  var $_2vvdyijtjcg89dig = {
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
  var $_7lhtlcjxjcg89dix = { toArray: toArray };

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
  var $_auyv33k1jcg89dj8 = {
    path: path,
    resolve: resolve,
    forge: forge,
    namespace: namespace
  };

  var unsafe = function (name, scope) {
    return $_auyv33k1jcg89dj8.resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_80dfv5k0jcg89dj6 = { getOrDie: getOrDie };

  var node = function () {
    var f = $_80dfv5k0jcg89dj6.getOrDie('Node');
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
  var $_fdvpepjzjcg89dj5 = {
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
  var $_zksnkk4jcg89djb = { cached: cached };

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
  var $_b06x6kk7jcg89dji = {
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
      version: $_b06x6kk7jcg89dji.unknown()
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
  var $_9o1cyxk6jcg89dje = {
    unknown: unknown,
    nu: nu,
    edge: $_3z1bpnjhjcg89dgu.constant(edge),
    chrome: $_3z1bpnjhjcg89dgu.constant(chrome),
    ie: $_3z1bpnjhjcg89dgu.constant(ie),
    opera: $_3z1bpnjhjcg89dgu.constant(opera),
    firefox: $_3z1bpnjhjcg89dgu.constant(firefox),
    safari: $_3z1bpnjhjcg89dgu.constant(safari)
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
      version: $_b06x6kk7jcg89dji.unknown()
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
  var $_2w083kk8jcg89djk = {
    unknown: unknown$2,
    nu: nu$2,
    windows: $_3z1bpnjhjcg89dgu.constant(windows),
    ios: $_3z1bpnjhjcg89dgu.constant(ios),
    android: $_3z1bpnjhjcg89dgu.constant(android),
    linux: $_3z1bpnjhjcg89dgu.constant(linux),
    osx: $_3z1bpnjhjcg89dgu.constant(osx),
    solaris: $_3z1bpnjhjcg89dgu.constant(solaris),
    freebsd: $_3z1bpnjhjcg89dgu.constant(freebsd)
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
      isiPad: $_3z1bpnjhjcg89dgu.constant(isiPad),
      isiPhone: $_3z1bpnjhjcg89dgu.constant(isiPhone),
      isTablet: $_3z1bpnjhjcg89dgu.constant(isTablet),
      isPhone: $_3z1bpnjhjcg89dgu.constant(isPhone),
      isTouch: $_3z1bpnjhjcg89dgu.constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: $_3z1bpnjhjcg89dgu.constant(iOSwebview)
    };
  };

  var detect$3 = function (candidates, userAgent) {
    var agent = String(userAgent).toLowerCase();
    return $_9786xxjfjcg89dgm.find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$3(browsers, userAgent).map(function (browser) {
      var version = $_b06x6kk7jcg89dji.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$3(oses, userAgent).map(function (os) {
      var version = $_b06x6kk7jcg89dji.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_1lqrj9kajcg89djs = {
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
  var $_5z6n3zkdjcg89dka = {
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
    return str === '' ? $_gj9ujrjgjcg89dgs.none() : $_gj9ujrjgjcg89dgs.some(str.substr(0, 1));
  };
  var tail = function (str) {
    return str === '' ? $_gj9ujrjgjcg89dgs.none() : $_gj9ujrjgjcg89dgs.some(str.substring(1));
  };
  var $_79mbeokejcg89dkb = {
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
    return startsWith(str, prefix) ? $_5z6n3zkdjcg89dka.removeFromStart(str, prefix.length) : str;
  };
  var removeTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? $_5z6n3zkdjcg89dka.removeFromEnd(str, prefix.length) : str;
  };
  var ensureLeading = function (str, prefix) {
    return startsWith(str, prefix) ? str : $_5z6n3zkdjcg89dka.addToStart(str, prefix);
  };
  var ensureTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? str : $_5z6n3zkdjcg89dka.addToEnd(str, prefix);
  };
  var contains$2 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };
  var capitalize = function (str) {
    return $_79mbeokejcg89dkb.head(str).bind(function (head) {
      return $_79mbeokejcg89dkb.tail(str).map(function (tail) {
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
  var $_enq84kcjcg89dk8 = {
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
      return $_enq84kcjcg89dk8.contains(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = $_enq84kcjcg89dk8.contains(uastring, 'edge/') && $_enq84kcjcg89dk8.contains(uastring, 'chrome') && $_enq84kcjcg89dk8.contains(uastring, 'safari') && $_enq84kcjcg89dk8.contains(uastring, 'applewebkit');
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
        return $_enq84kcjcg89dk8.contains(uastring, 'chrome') && !$_enq84kcjcg89dk8.contains(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return $_enq84kcjcg89dk8.contains(uastring, 'msie') || $_enq84kcjcg89dk8.contains(uastring, 'trident');
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
        return ($_enq84kcjcg89dk8.contains(uastring, 'safari') || $_enq84kcjcg89dk8.contains(uastring, 'mobile/')) && $_enq84kcjcg89dk8.contains(uastring, 'applewebkit');
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
        return $_enq84kcjcg89dk8.contains(uastring, 'iphone') || $_enq84kcjcg89dk8.contains(uastring, 'ipad');
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
  var $_ftgf55kbjcg89djw = {
    browsers: $_3z1bpnjhjcg89dgu.constant(browsers),
    oses: $_3z1bpnjhjcg89dgu.constant(oses)
  };

  var detect$1 = function (userAgent) {
    var browsers = $_ftgf55kbjcg89djw.browsers();
    var oses = $_ftgf55kbjcg89djw.oses();
    var browser = $_1lqrj9kajcg89djs.detectBrowser(browsers, userAgent).fold($_9o1cyxk6jcg89dje.unknown, $_9o1cyxk6jcg89dje.nu);
    var os = $_1lqrj9kajcg89djs.detectOs(oses, userAgent).fold($_2w083kk8jcg89djk.unknown, $_2w083kk8jcg89djk.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_eajakpk5jcg89djd = { detect: detect$1 };

  var detect = $_zksnkk4jcg89djb.cached(function () {
    var userAgent = navigator.userAgent;
    return $_eajakpk5jcg89djd.detect(userAgent);
  });
  var $_7o3y0ok3jcg89dja = { detect: detect };

  var eq = function (e1, e2) {
    return e1.dom() === e2.dom();
  };
  var isEqualNode = function (e1, e2) {
    return e1.dom().isEqualNode(e2.dom());
  };
  var member = function (element, elements) {
    return $_9786xxjfjcg89dgm.exists(elements, $_3z1bpnjhjcg89dgu.curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_fdvpepjzjcg89dj5.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_7o3y0ok3jcg89dja.detect().browser;
  var contains$1 = browser.isIE() ? ieContains : regularContains;
  var $_fqkoktjyjcg89diy = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains$1,
    is: $_2vvdyijtjcg89dig.is
  };

  var owner = function (element) {
    return $_a8yw3ijujcg89dik.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    var doc = owner(element);
    return $_a8yw3ijujcg89dik.fromDom(doc.dom().documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return $_a8yw3ijujcg89dik.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return $_gj9ujrjgjcg89dgs.from(dom.parentNode).map($_a8yw3ijujcg89dik.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return $_9786xxjfjcg89dgm.findIndex(kin, function (elem) {
        return $_fqkoktjyjcg89diy.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = $_4jzhk7jojcg89dhh.isFunction(isRoot) ? isRoot : $_3z1bpnjhjcg89dgu.constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = $_a8yw3ijujcg89dik.fromDom(rawParent);
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
      return $_9786xxjfjcg89dgm.filter(elements, function (x) {
        return !$_fqkoktjyjcg89diy.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return $_gj9ujrjgjcg89dgs.from(dom.offsetParent).map($_a8yw3ijujcg89dik.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return $_gj9ujrjgjcg89dgs.from(dom.previousSibling).map($_a8yw3ijujcg89dik.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return $_gj9ujrjgjcg89dgs.from(dom.nextSibling).map($_a8yw3ijujcg89dik.fromDom);
  };
  var prevSiblings = function (element) {
    return $_9786xxjfjcg89dgm.reverse($_7lhtlcjxjcg89dix.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_7lhtlcjxjcg89dix.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return $_9786xxjfjcg89dgm.map(dom.childNodes, $_a8yw3ijujcg89dik.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return $_gj9ujrjgjcg89dgs.from(children[index]).map($_a8yw3ijujcg89dik.fromDom);
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
  var spot = $_mgt0hjkjcg89dhb.immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_e07z69jwjcg89dip = {
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
    return filterFirstLayer(scope, selector, $_3z1bpnjhjcg89dgu.constant(true));
  };
  var filterFirstLayer = function (scope, selector, predicate) {
    return $_9786xxjfjcg89dgm.bind($_e07z69jwjcg89dip.children(scope), function (x) {
      return $_2vvdyijtjcg89dig.is(x, selector) ? predicate(x) ? [x] : [] : filterFirstLayer(x, selector, predicate);
    });
  };
  var $_aifoacjsjcg89dia = {
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
    return type(element) === $_1p3qykjvjcg89dio.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_1p3qykjvjcg89dio.ELEMENT);
  var isText = isType$1($_1p3qykjvjcg89dio.TEXT);
  var isDocument = isType$1($_1p3qykjvjcg89dio.DOCUMENT);
  var $_a7udttkgjcg89dkj = {
    name: name,
    type: type,
    value: value,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var rawSet = function (dom, key, value) {
    if ($_4jzhk7jojcg89dhh.isString(value) || $_4jzhk7jojcg89dhh.isBoolean(value) || $_4jzhk7jojcg89dhh.isNumber(value)) {
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
    $_7p93f5jjjcg89dh9.each(attrs, function (v, k) {
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
    return $_9786xxjfjcg89dgm.foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has(source, attr) && !has(destination, attr))
      set(destination, attr, get(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_a7udttkgjcg89dkj.isElement(source) || !$_a7udttkgjcg89dkj.isElement(destination))
      return;
    $_9786xxjfjcg89dgm.each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_d6i8c7kfjcg89dkd = {
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
    var dom = $_a7udttkgjcg89dkj.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = $_zksnkk4jcg89djb.cached(function () {
    return getBody($_a8yw3ijujcg89dik.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return $_a8yw3ijujcg89dik.fromDom(body);
  };
  var $_9klllckjjcg89dko = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var all$2 = function (predicate) {
    return descendants$1($_9klllckjjcg89dko.body(), predicate);
  };
  var ancestors$1 = function (scope, predicate, isRoot) {
    return $_9786xxjfjcg89dgm.filter($_e07z69jwjcg89dip.parents(scope, isRoot), predicate);
  };
  var siblings$2 = function (scope, predicate) {
    return $_9786xxjfjcg89dgm.filter($_e07z69jwjcg89dip.siblings(scope), predicate);
  };
  var children$2 = function (scope, predicate) {
    return $_9786xxjfjcg89dgm.filter($_e07z69jwjcg89dip.children(scope), predicate);
  };
  var descendants$1 = function (scope, predicate) {
    var result = [];
    $_9786xxjfjcg89dgm.each($_e07z69jwjcg89dip.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants$1(x, predicate));
    });
    return result;
  };
  var $_f0ef8ykijcg89dkm = {
    all: all$2,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  var all$1 = function (selector) {
    return $_2vvdyijtjcg89dig.all(selector);
  };
  var ancestors = function (scope, selector, isRoot) {
    return $_f0ef8ykijcg89dkm.ancestors(scope, function (e) {
      return $_2vvdyijtjcg89dig.is(e, selector);
    }, isRoot);
  };
  var siblings$1 = function (scope, selector) {
    return $_f0ef8ykijcg89dkm.siblings(scope, function (e) {
      return $_2vvdyijtjcg89dig.is(e, selector);
    });
  };
  var children$1 = function (scope, selector) {
    return $_f0ef8ykijcg89dkm.children(scope, function (e) {
      return $_2vvdyijtjcg89dig.is(e, selector);
    });
  };
  var descendants = function (scope, selector) {
    return $_2vvdyijtjcg89dig.all(selector, scope);
  };
  var $_6f7vtwkhjcg89dkl = {
    all: all$1,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var ClosestOrAncestor = function (is, ancestor, scope, a, isRoot) {
    return is(scope, a) ? $_gj9ujrjgjcg89dgs.some(scope) : $_4jzhk7jojcg89dhh.isFunction(isRoot) && isRoot(scope) ? $_gj9ujrjgjcg89dgs.none() : ancestor(scope, a, isRoot);
  };

  var first$2 = function (predicate) {
    return descendant$1($_9klllckjjcg89dko.body(), predicate);
  };
  var ancestor$1 = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = $_4jzhk7jojcg89dhh.isFunction(isRoot) ? isRoot : $_3z1bpnjhjcg89dgu.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_a8yw3ijujcg89dik.fromDom(element);
      if (predicate(el))
        return $_gj9ujrjgjcg89dgs.some(el);
      else if (stop(el))
        break;
    }
    return $_gj9ujrjgjcg89dgs.none();
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
      return $_gj9ujrjgjcg89dgs.none();
    return child$2($_a8yw3ijujcg89dik.fromDom(element.parentNode), function (x) {
      return !$_fqkoktjyjcg89diy.eq(scope, x) && predicate(x);
    });
  };
  var child$2 = function (scope, predicate) {
    var result = $_9786xxjfjcg89dgm.find(scope.dom().childNodes, $_3z1bpnjhjcg89dgu.compose(predicate, $_a8yw3ijujcg89dik.fromDom));
    return result.map($_a8yw3ijujcg89dik.fromDom);
  };
  var descendant$1 = function (scope, predicate) {
    var descend = function (element) {
      for (var i = 0; i < element.childNodes.length; i++) {
        if (predicate($_a8yw3ijujcg89dik.fromDom(element.childNodes[i])))
          return $_gj9ujrjgjcg89dgs.some($_a8yw3ijujcg89dik.fromDom(element.childNodes[i]));
        var res = descend(element.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return $_gj9ujrjgjcg89dgs.none();
    };
    return descend(scope.dom());
  };
  var $_dnhfqskljcg89dkt = {
    first: first$2,
    ancestor: ancestor$1,
    closest: closest$1,
    sibling: sibling$1,
    child: child$2,
    descendant: descendant$1
  };

  var first$1 = function (selector) {
    return $_2vvdyijtjcg89dig.one(selector);
  };
  var ancestor = function (scope, selector, isRoot) {
    return $_dnhfqskljcg89dkt.ancestor(scope, function (e) {
      return $_2vvdyijtjcg89dig.is(e, selector);
    }, isRoot);
  };
  var sibling = function (scope, selector) {
    return $_dnhfqskljcg89dkt.sibling(scope, function (e) {
      return $_2vvdyijtjcg89dig.is(e, selector);
    });
  };
  var child$1 = function (scope, selector) {
    return $_dnhfqskljcg89dkt.child(scope, function (e) {
      return $_2vvdyijtjcg89dig.is(e, selector);
    });
  };
  var descendant = function (scope, selector) {
    return $_2vvdyijtjcg89dig.one(selector, scope);
  };
  var closest = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_2vvdyijtjcg89dig.is, ancestor, scope, selector, isRoot);
  };
  var $_a6sun7kkjcg89dks = {
    first: first$1,
    ancestor: ancestor,
    sibling: sibling,
    child: child$1,
    descendant: descendant,
    closest: closest
  };

  var lookup = function (tags, element, _isRoot) {
    var isRoot = _isRoot !== undefined ? _isRoot : $_3z1bpnjhjcg89dgu.constant(false);
    if (isRoot(element))
      return $_gj9ujrjgjcg89dgs.none();
    if ($_9786xxjfjcg89dgm.contains(tags, $_a7udttkgjcg89dkj.name(element)))
      return $_gj9ujrjgjcg89dgs.some(element);
    var isRootOrUpperTable = function (element) {
      return $_2vvdyijtjcg89dig.is(element, 'table') || isRoot(element);
    };
    return $_a6sun7kkjcg89dks.ancestor(element, tags.join(','), isRootOrUpperTable);
  };
  var cell = function (element, isRoot) {
    return lookup([
      'td',
      'th'
    ], element, isRoot);
  };
  var cells = function (ancestor) {
    return $_aifoacjsjcg89dia.firstLayer(ancestor, 'th,td');
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
    return $_e07z69jwjcg89dip.parent(element).map(function (parent) {
      return $_6f7vtwkhjcg89dkl.children(parent, selector);
    });
  };
  var neighbourCells = $_3z1bpnjhjcg89dgu.curry(neighbours, 'th,td');
  var neighbourRows = $_3z1bpnjhjcg89dgu.curry(neighbours, 'tr');
  var firstCell = function (ancestor) {
    return $_a6sun7kkjcg89dks.descendant(ancestor, 'th,td');
  };
  var table = function (element, isRoot) {
    return $_a6sun7kkjcg89dks.closest(element, 'table', isRoot);
  };
  var row = function (element, isRoot) {
    return lookup(['tr'], element, isRoot);
  };
  var rows = function (ancestor) {
    return $_aifoacjsjcg89dia.firstLayer(ancestor, 'tr');
  };
  var attr = function (element, property) {
    return parseInt($_d6i8c7kfjcg89dkd.get(element, property), 10);
  };
  var grid$1 = function (element, rowProp, colProp) {
    var rows = attr(element, rowProp);
    var cols = attr(element, colProp);
    return $_fmvzq0jqjcg89dhq.grid(rows, cols);
  };
  var $_5igemtjrjcg89dhs = {
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
    var rows = $_5igemtjrjcg89dhs.rows(table);
    return $_9786xxjfjcg89dgm.map(rows, function (row) {
      var element = row;
      var parent = $_e07z69jwjcg89dip.parent(element);
      var parentSection = parent.bind(function (parent) {
        var parentName = $_a7udttkgjcg89dkj.name(parent);
        return parentName === 'tfoot' || parentName === 'thead' || parentName === 'tbody' ? parentName : 'tbody';
      });
      var cells = $_9786xxjfjcg89dgm.map($_5igemtjrjcg89dhs.cells(row), function (cell) {
        var rowspan = $_d6i8c7kfjcg89dkd.has(cell, 'rowspan') ? parseInt($_d6i8c7kfjcg89dkd.get(cell, 'rowspan'), 10) : 1;
        var colspan = $_d6i8c7kfjcg89dkd.has(cell, 'colspan') ? parseInt($_d6i8c7kfjcg89dkd.get(cell, 'colspan'), 10) : 1;
        return $_fmvzq0jqjcg89dhq.detail(cell, rowspan, colspan);
      });
      return $_fmvzq0jqjcg89dhq.rowdata(element, cells, parentSection);
    });
  };
  var fromPastedRows = function (rows, example) {
    return $_9786xxjfjcg89dgm.map(rows, function (row) {
      var cells = $_9786xxjfjcg89dgm.map($_5igemtjrjcg89dhs.cells(row), function (cell) {
        var rowspan = $_d6i8c7kfjcg89dkd.has(cell, 'rowspan') ? parseInt($_d6i8c7kfjcg89dkd.get(cell, 'rowspan'), 10) : 1;
        var colspan = $_d6i8c7kfjcg89dkd.has(cell, 'colspan') ? parseInt($_d6i8c7kfjcg89dkd.get(cell, 'colspan'), 10) : 1;
        return $_fmvzq0jqjcg89dhq.detail(cell, rowspan, colspan);
      });
      return $_fmvzq0jqjcg89dhq.rowdata(row, cells, example.section());
    });
  };
  var $_28wd6ujpjcg89dhi = {
    fromTable: fromTable,
    fromPastedRows: fromPastedRows
  };

  var key = function (row, column) {
    return row + ',' + column;
  };
  var getAt = function (warehouse, row, column) {
    var raw = warehouse.access()[key(row, column)];
    return raw !== undefined ? $_gj9ujrjgjcg89dgs.some(raw) : $_gj9ujrjgjcg89dgs.none();
  };
  var findItem = function (warehouse, item, comparator) {
    var filtered = filterItems(warehouse, function (detail) {
      return comparator(item, detail.element());
    });
    return filtered.length > 0 ? $_gj9ujrjgjcg89dgs.some(filtered[0]) : $_gj9ujrjgjcg89dgs.none();
  };
  var filterItems = function (warehouse, predicate) {
    var all = $_9786xxjfjcg89dgm.bind(warehouse.all(), function (r) {
      return r.cells();
    });
    return $_9786xxjfjcg89dgm.filter(all, predicate);
  };
  var generate = function (list) {
    var access = {};
    var cells = [];
    var maxRows = list.length;
    var maxColumns = 0;
    $_9786xxjfjcg89dgm.each(list, function (details, r) {
      var currentRow = [];
      $_9786xxjfjcg89dgm.each(details.cells(), function (detail, c) {
        var start = 0;
        while (access[key(r, start)] !== undefined) {
          start++;
        }
        var current = $_fmvzq0jqjcg89dhq.extended(detail.element(), detail.rowspan(), detail.colspan(), r, start);
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
      cells.push($_fmvzq0jqjcg89dhq.rowdata(details.element(), currentRow, details.section()));
    });
    var grid = $_fmvzq0jqjcg89dhq.grid(maxRows, maxColumns);
    return {
      grid: $_3z1bpnjhjcg89dgu.constant(grid),
      access: $_3z1bpnjhjcg89dgu.constant(access),
      all: $_3z1bpnjhjcg89dgu.constant(cells)
    };
  };
  var justCells = function (warehouse) {
    var rows = $_9786xxjfjcg89dgm.map(warehouse.all(), function (w) {
      return w.cells();
    });
    return $_9786xxjfjcg89dgm.flatten(rows);
  };
  var $_74qbohknjcg89dl3 = {
    generate: generate,
    getAt: getAt,
    findItem: findItem,
    filterItems: filterItems,
    justCells: justCells
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_aej8trkpjcg89dlm = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!$_4jzhk7jojcg89dhh.isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_aej8trkpjcg89dlm.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_aej8trkpjcg89dlm.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$1 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    $_7p93f5jjjcg89dh9.each(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    $_7p93f5jjjcg89dh9.each(css, function (v, k) {
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
    var v = r === '' && !$_9klllckjjcg89dko.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_aej8trkpjcg89dlm.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
  };
  var getRaw = function (element, property) {
    var dom = element.dom();
    var raw = getUnsafeProperty(dom, property);
    return $_gj9ujrjgjcg89dgs.from(raw).filter(function (r) {
      return r.length > 0;
    });
  };
  var getAllRaw = function (element) {
    var css = {};
    var dom = element.dom();
    if ($_aej8trkpjcg89dlm.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = $_a8yw3ijujcg89dik.fromTag(tag);
    set$1(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$1 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_d6i8c7kfjcg89dkd.has(element, 'style') && $_enq84kcjcg89dk8.trim($_d6i8c7kfjcg89dkd.get(element, 'style')) === '') {
      $_d6i8c7kfjcg89dkd.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_d6i8c7kfjcg89dkd.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_d6i8c7kfjcg89dkd.remove : $_d6i8c7kfjcg89dkd.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_aej8trkpjcg89dlm.isSupported(sourceDom) && $_aej8trkpjcg89dlm.isSupported(targetDom)) {
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
    if (!$_a7udttkgjcg89dkj.isElement(source) || !$_a7udttkgjcg89dkj.isElement(destination))
      return;
    $_9786xxjfjcg89dgm.each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_3m41takojcg89dla = {
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
    var parent = $_e07z69jwjcg89dip.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_e07z69jwjcg89dip.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_e07z69jwjcg89dip.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_e07z69jwjcg89dip.firstChild(parent);
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
    $_e07z69jwjcg89dip.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_2xc490kqjcg89dln = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap
  };

  var before$1 = function (marker, elements) {
    $_9786xxjfjcg89dgm.each(elements, function (x) {
      $_2xc490kqjcg89dln.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    $_9786xxjfjcg89dgm.each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_2xc490kqjcg89dln.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    $_9786xxjfjcg89dgm.each(elements.slice().reverse(), function (x) {
      $_2xc490kqjcg89dln.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    $_9786xxjfjcg89dgm.each(elements, function (x) {
      $_2xc490kqjcg89dln.append(parent, x);
    });
  };
  var $_gij8gmksjcg89dlt = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    $_9786xxjfjcg89dgm.each($_e07z69jwjcg89dip.children(element), function (rogue) {
      remove$2(rogue);
    });
  };
  var remove$2 = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_e07z69jwjcg89dip.children(wrapper);
    if (children.length > 0)
      $_gij8gmksjcg89dlt.before(wrapper, children);
    remove$2(wrapper);
  };
  var $_9fofwxkrjcg89dlq = {
    empty: empty,
    remove: remove$2,
    unwrap: unwrap
  };

  var stats = $_mgt0hjkjcg89dhb.immutable('minRow', 'minCol', 'maxRow', 'maxCol');
  var findSelectedStats = function (house, isSelected) {
    var totalColumns = house.grid().columns();
    var totalRows = house.grid().rows();
    var minRow = totalRows;
    var minCol = totalColumns;
    var maxRow = 0;
    var maxCol = 0;
    $_7p93f5jjjcg89dh9.each(house.access(), function (detail) {
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
    var td = $_a8yw3ijujcg89dik.fromTag('td');
    $_2xc490kqjcg89dln.append(td, $_a8yw3ijujcg89dik.fromTag('br'));
    var f = seenSelected ? $_2xc490kqjcg89dln.append : $_2xc490kqjcg89dln.prepend;
    f(row, td);
  };
  var fillInGaps = function (list, house, stats, isSelected) {
    var totalColumns = house.grid().columns();
    var totalRows = house.grid().rows();
    for (var i = 0; i < totalRows; i++) {
      var seenSelected = false;
      for (var j = 0; j < totalColumns; j++) {
        if (!(i < stats.minRow() || i > stats.maxRow() || j < stats.minCol() || j > stats.maxCol())) {
          var needCell = $_74qbohknjcg89dl3.getAt(house, i, j).filter(isSelected).isNone();
          if (needCell)
            makeCell(list, seenSelected, i);
          else
            seenSelected = true;
        }
      }
    }
  };
  var clean = function (table, stats) {
    var emptyRows = $_9786xxjfjcg89dgm.filter($_aifoacjsjcg89dia.firstLayer(table, 'tr'), function (row) {
      return row.dom().childElementCount === 0;
    });
    $_9786xxjfjcg89dgm.each(emptyRows, $_9fofwxkrjcg89dlq.remove);
    if (stats.minCol() === stats.maxCol() || stats.minRow() === stats.maxRow()) {
      $_9786xxjfjcg89dgm.each($_aifoacjsjcg89dia.firstLayer(table, 'th,td'), function (cell) {
        $_d6i8c7kfjcg89dkd.remove(cell, 'rowspan');
        $_d6i8c7kfjcg89dkd.remove(cell, 'colspan');
      });
    }
    $_d6i8c7kfjcg89dkd.remove(table, 'width');
    $_d6i8c7kfjcg89dkd.remove(table, 'height');
    $_3m41takojcg89dla.remove(table, 'width');
    $_3m41takojcg89dla.remove(table, 'height');
  };
  var extract = function (table, selectedSelector) {
    var isSelected = function (detail) {
      return $_2vvdyijtjcg89dig.is(detail.element(), selectedSelector);
    };
    var list = $_28wd6ujpjcg89dhi.fromTable(table);
    var house = $_74qbohknjcg89dl3.generate(list);
    var stats = findSelectedStats(house, isSelected);
    var selector = 'th:not(' + selectedSelector + ')' + ',td:not(' + selectedSelector + ')';
    var unselectedCells = $_aifoacjsjcg89dia.filterFirstLayer(table, 'th,td', function (cell) {
      return $_2vvdyijtjcg89dig.is(cell, selector);
    });
    $_9786xxjfjcg89dgm.each(unselectedCells, $_9fofwxkrjcg89dlq.remove);
    fillInGaps(list, house, stats, isSelected);
    clean(table, stats);
    return table;
  };
  var $_9bgnrxjijcg89dgx = { extract: extract };

  var clone$1 = function (original, deep) {
    return $_a8yw3ijujcg89dik.fromDom(original.dom().cloneNode(deep));
  };
  var shallow = function (original) {
    return clone$1(original, false);
  };
  var deep = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = $_a8yw3ijujcg89dik.fromTag(tag);
    var attributes = $_d6i8c7kfjcg89dkd.clone(original);
    $_d6i8c7kfjcg89dkd.setAll(nu, attributes);
    return nu;
  };
  var copy$1 = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_e07z69jwjcg89dip.children(deep(original));
    $_gij8gmksjcg89dlt.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_2xc490kqjcg89dln.before(original, nu);
    var children = $_e07z69jwjcg89dip.children(original);
    $_gij8gmksjcg89dlt.append(nu, children);
    $_9fofwxkrjcg89dlq.remove(original);
    return nu;
  };
  var $_58b4rtkujcg89dmj = {
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
        return $_gj9ujrjgjcg89dgs.none();
      }
    };
    var getOptionSafe = function (element) {
      return is(element) ? $_gj9ujrjgjcg89dgs.from(element.dom().nodeValue) : $_gj9ujrjgjcg89dgs.none();
    };
    var browser = $_7o3y0ok3jcg89dja.detect().browser;
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

  var api = NodeValue($_a7udttkgjcg89dkj.isText, 'text');
  var get$2 = function (element) {
    return api.get(element);
  };
  var getOption = function (element) {
    return api.getOption(element);
  };
  var set$2 = function (element, value) {
    api.set(element, value);
  };
  var $_8lwn8skxjcg89dmq = {
    get: get$2,
    getOption: getOption,
    set: set$2
  };

  var getEnd = function (element) {
    return $_a7udttkgjcg89dkj.name(element) === 'img' ? 1 : $_8lwn8skxjcg89dmq.getOption(element).fold(function () {
      return $_e07z69jwjcg89dip.children(element).length;
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
    return $_8lwn8skxjcg89dmq.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || $_9786xxjfjcg89dgm.contains(elementsWithCursorPosition, $_a7udttkgjcg89dkj.name(elem));
  };
  var $_5pzxh2kwjcg89dmn = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var first$3 = function (element) {
    return $_dnhfqskljcg89dkt.descendant(element, $_5pzxh2kwjcg89dmn.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_5pzxh2kwjcg89dmn.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_e07z69jwjcg89dip.children(element);
      for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (predicate(child))
          return $_gj9ujrjgjcg89dgs.some(child);
        var res = descend(child);
        if (res.isSome())
          return res;
      }
      return $_gj9ujrjgjcg89dgs.none();
    };
    return descend(scope);
  };
  var $_4u334mkvjcg89dml = {
    first: first$3,
    last: last$2
  };

  var cell$1 = function () {
    var td = $_a8yw3ijujcg89dik.fromTag('td');
    $_2xc490kqjcg89dln.append(td, $_a8yw3ijujcg89dik.fromTag('br'));
    return td;
  };
  var replace = function (cell, tag, attrs) {
    var replica = $_58b4rtkujcg89dmj.copy(cell, tag);
    $_7p93f5jjjcg89dh9.each(attrs, function (v, k) {
      if (v === null)
        $_d6i8c7kfjcg89dkd.remove(replica, k);
      else
        $_d6i8c7kfjcg89dkd.set(replica, k, v);
    });
    return replica;
  };
  var pasteReplace = function (cellContent) {
    return cellContent;
  };
  var newRow = function (doc) {
    return function () {
      return $_a8yw3ijujcg89dik.fromTag('tr', doc.dom());
    };
  };
  var cloneFormats = function (oldCell, newCell, formats) {
    var first = $_4u334mkvjcg89dml.first(oldCell);
    return first.map(function (firstText) {
      var formatSelector = formats.join(',');
      var parents = $_6f7vtwkhjcg89dkl.ancestors(firstText, formatSelector, function (element) {
        return $_fqkoktjyjcg89diy.eq(element, oldCell);
      });
      return $_9786xxjfjcg89dgm.foldr(parents, function (last, parent) {
        var clonedFormat = $_58b4rtkujcg89dmj.shallow(parent);
        $_2xc490kqjcg89dln.append(last, clonedFormat);
        return clonedFormat;
      }, newCell);
    }).getOr(newCell);
  };
  var cellOperations = function (mutate, doc, formatsToClone) {
    var newCell = function (prev) {
      var doc = $_e07z69jwjcg89dip.owner(prev.element());
      var td = $_a8yw3ijujcg89dik.fromTag($_a7udttkgjcg89dkj.name(prev.element()), doc.dom());
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
      $_2xc490kqjcg89dln.append(lastNode, $_a8yw3ijujcg89dik.fromTag('br'));
      $_3m41takojcg89dla.copy(prev.element(), td);
      $_3m41takojcg89dla.remove(td, 'height');
      if (prev.colspan() !== 1)
        $_3m41takojcg89dla.remove(prev.element(), 'width');
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
  var $_2zlupktjcg89dlx = {
    cellOperations: cellOperations,
    paste: paste
  };

  var fromHtml$1 = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    return $_e07z69jwjcg89dip.children($_a8yw3ijujcg89dik.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return $_9786xxjfjcg89dgm.map(tags, function (x) {
      return $_a8yw3ijujcg89dik.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return $_9786xxjfjcg89dgm.map(texts, function (x) {
      return $_a8yw3ijujcg89dik.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return $_9786xxjfjcg89dgm.map(nodes, $_a8yw3ijujcg89dik.fromDom);
  };
  var $_8ekj74kzjcg89dmv = {
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
      return $_a8yw3ijujcg89dik.fromDom(element.dom().cloneNode(false));
    };
    var isBoundary = function (element) {
      if (!$_a7udttkgjcg89dkj.isElement(element))
        return false;
      if ($_a7udttkgjcg89dkj.name(element) === 'body')
        return true;
      return $_9786xxjfjcg89dgm.contains(TagBoundaries, $_a7udttkgjcg89dkj.name(element));
    };
    var isEmptyTag = function (element) {
      if (!$_a7udttkgjcg89dkj.isElement(element))
        return false;
      return $_9786xxjfjcg89dgm.contains([
        'br',
        'img',
        'hr',
        'input'
      ], $_a7udttkgjcg89dkj.name(element));
    };
    var comparePosition = function (element, other) {
      return element.dom().compareDocumentPosition(other.dom());
    };
    var copyAttributesTo = function (source, destination) {
      var as = $_d6i8c7kfjcg89dkd.clone(source);
      $_d6i8c7kfjcg89dkd.setAll(destination, as);
    };
    return {
      up: $_3z1bpnjhjcg89dgu.constant({
        selector: $_a6sun7kkjcg89dks.ancestor,
        closest: $_a6sun7kkjcg89dks.closest,
        predicate: $_dnhfqskljcg89dkt.ancestor,
        all: $_e07z69jwjcg89dip.parents
      }),
      down: $_3z1bpnjhjcg89dgu.constant({
        selector: $_6f7vtwkhjcg89dkl.descendants,
        predicate: $_f0ef8ykijcg89dkm.descendants
      }),
      styles: $_3z1bpnjhjcg89dgu.constant({
        get: $_3m41takojcg89dla.get,
        getRaw: $_3m41takojcg89dla.getRaw,
        set: $_3m41takojcg89dla.set,
        remove: $_3m41takojcg89dla.remove
      }),
      attrs: $_3z1bpnjhjcg89dgu.constant({
        get: $_d6i8c7kfjcg89dkd.get,
        set: $_d6i8c7kfjcg89dkd.set,
        remove: $_d6i8c7kfjcg89dkd.remove,
        copyTo: copyAttributesTo
      }),
      insert: $_3z1bpnjhjcg89dgu.constant({
        before: $_2xc490kqjcg89dln.before,
        after: $_2xc490kqjcg89dln.after,
        afterAll: $_gij8gmksjcg89dlt.after,
        append: $_2xc490kqjcg89dln.append,
        appendAll: $_gij8gmksjcg89dlt.append,
        prepend: $_2xc490kqjcg89dln.prepend,
        wrap: $_2xc490kqjcg89dln.wrap
      }),
      remove: $_3z1bpnjhjcg89dgu.constant({
        unwrap: $_9fofwxkrjcg89dlq.unwrap,
        remove: $_9fofwxkrjcg89dlq.remove
      }),
      create: $_3z1bpnjhjcg89dgu.constant({
        nu: $_a8yw3ijujcg89dik.fromTag,
        clone: clone,
        text: $_a8yw3ijujcg89dik.fromText
      }),
      query: $_3z1bpnjhjcg89dgu.constant({
        comparePosition: comparePosition,
        prevSibling: $_e07z69jwjcg89dip.prevSibling,
        nextSibling: $_e07z69jwjcg89dip.nextSibling
      }),
      property: $_3z1bpnjhjcg89dgu.constant({
        children: $_e07z69jwjcg89dip.children,
        name: $_a7udttkgjcg89dkj.name,
        parent: $_e07z69jwjcg89dip.parent,
        isText: $_a7udttkgjcg89dkj.isText,
        isComment: $_a7udttkgjcg89dkj.isComment,
        isElement: $_a7udttkgjcg89dkj.isElement,
        getText: $_8lwn8skxjcg89dmq.get,
        setText: $_8lwn8skxjcg89dmq.set,
        isBoundary: isBoundary,
        isEmptyTag: isEmptyTag
      }),
      eq: $_fqkoktjyjcg89diy.eq,
      is: $_fqkoktjyjcg89diy.is
    };
  };

  var leftRight = $_mgt0hjkjcg89dhb.immutable('left', 'right');
  var bisect = function (universe, parent, child) {
    var children = universe.property().children(parent);
    var index = $_9786xxjfjcg89dgm.findIndex(children, $_3z1bpnjhjcg89dgu.curry(universe.eq, child));
    return index.map(function (ind) {
      return {
        before: $_3z1bpnjhjcg89dgu.constant(children.slice(0, ind)),
        after: $_3z1bpnjhjcg89dgu.constant(children.slice(ind + 1))
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
    var result = $_mgt0hjkjcg89dhb.immutable('first', 'second', 'splits');
    var next = function (child, group, splits) {
      var fallback = result(child, $_gj9ujrjgjcg89dgs.none(), splits);
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
            return next(nextChild, $_gj9ujrjgjcg89dgs.some(breakage.right()), splits.concat(extra));
          }).getOr(fallback);
        });
      }
    };
    return next(item, $_gj9ujrjgjcg89dgs.none(), []);
  };
  var $_6y7mvfl8jcg89dor = {
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
    return elements.length > 0 ? all$3(universe, look, elements, unsafeOne) : $_gj9ujrjgjcg89dgs.none();
  };
  var unsafeOne = function (universe, look, head, tail) {
    var start = look(universe, head);
    return $_9786xxjfjcg89dgm.foldr(tail, function (b, a) {
      var current = look(universe, a);
      return commonElement(universe, b, current);
    }, start);
  };
  var commonElement = function (universe, start, end) {
    return start.bind(function (s) {
      return end.filter($_3z1bpnjhjcg89dgu.curry(universe.eq, s));
    });
  };
  var $_1cqz46l9jcg89dox = { oneAll: oneAll };

  var eq$1 = function (universe, item) {
    return $_3z1bpnjhjcg89dgu.curry(universe.eq, item);
  };
  var unsafeSubset = function (universe, common, ps1, ps2) {
    var children = universe.property().children(common);
    if (universe.eq(common, ps1[0]))
      return $_gj9ujrjgjcg89dgs.some([ps1[0]]);
    if (universe.eq(common, ps2[0]))
      return $_gj9ujrjgjcg89dgs.some([ps2[0]]);
    var finder = function (ps) {
      var topDown = $_9786xxjfjcg89dgm.reverse(ps);
      var index = $_9786xxjfjcg89dgm.findIndex(topDown, eq$1(universe, common)).getOr(-1);
      var item = index < topDown.length - 1 ? topDown[index + 1] : topDown[index];
      return $_9786xxjfjcg89dgm.findIndex(children, eq$1(universe, item));
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
    var isRoot = _isRoot !== undefined ? _isRoot : $_3z1bpnjhjcg89dgu.constant(false);
    var ps1 = [start].concat(universe.up().all(start));
    var ps2 = [end].concat(universe.up().all(end));
    var prune = function (path) {
      var index = $_9786xxjfjcg89dgm.findIndex(path, isRoot);
      return index.fold(function () {
        return path;
      }, function (ind) {
        return path.slice(0, ind + 1);
      });
    };
    var pruned1 = prune(ps1);
    var pruned2 = prune(ps2);
    var shared = $_9786xxjfjcg89dgm.find(pruned1, function (x) {
      return $_9786xxjfjcg89dgm.exists(pruned2, eq$1(universe, x));
    });
    return {
      firstpath: $_3z1bpnjhjcg89dgu.constant(pruned1),
      secondpath: $_3z1bpnjhjcg89dgu.constant(pruned2),
      shared: $_3z1bpnjhjcg89dgu.constant(shared)
    };
  };
  var subset$2 = function (universe, start, end) {
    var ancs = ancestors$4(universe, start, end);
    return ancs.shared().bind(function (shared) {
      return unsafeSubset(universe, shared, ancs.firstpath(), ancs.secondpath());
    });
  };
  var $_4h5yyvlajcg89dp1 = {
    subset: subset$2,
    ancestors: ancestors$4
  };

  var sharedOne$1 = function (universe, look, elements) {
    return $_1cqz46l9jcg89dox.oneAll(universe, look, elements);
  };
  var subset$1 = function (universe, start, finish) {
    return $_4h5yyvlajcg89dp1.subset(universe, start, finish);
  };
  var ancestors$3 = function (universe, start, finish, _isRoot) {
    return $_4h5yyvlajcg89dp1.ancestors(universe, start, finish, _isRoot);
  };
  var breakToLeft$1 = function (universe, parent, child) {
    return $_6y7mvfl8jcg89dor.breakToLeft(universe, parent, child);
  };
  var breakToRight$1 = function (universe, parent, child) {
    return $_6y7mvfl8jcg89dor.breakToRight(universe, parent, child);
  };
  var breakPath$1 = function (universe, child, isTop, breaker) {
    return $_6y7mvfl8jcg89dor.breakPath(universe, child, isTop, breaker);
  };
  var $_azw8bil7jcg89doq = {
    sharedOne: sharedOne$1,
    subset: subset$1,
    ancestors: ancestors$3,
    breakToLeft: breakToLeft$1,
    breakToRight: breakToRight$1,
    breakPath: breakPath$1
  };

  var universe = DomUniverse();
  var sharedOne = function (look, elements) {
    return $_azw8bil7jcg89doq.sharedOne(universe, function (universe, element) {
      return look(element);
    }, elements);
  };
  var subset = function (start, finish) {
    return $_azw8bil7jcg89doq.subset(universe, start, finish);
  };
  var ancestors$2 = function (start, finish, _isRoot) {
    return $_azw8bil7jcg89doq.ancestors(universe, start, finish, _isRoot);
  };
  var breakToLeft = function (parent, child) {
    return $_azw8bil7jcg89doq.breakToLeft(universe, parent, child);
  };
  var breakToRight = function (parent, child) {
    return $_azw8bil7jcg89doq.breakToRight(universe, parent, child);
  };
  var breakPath = function (child, isTop, breaker) {
    return $_azw8bil7jcg89doq.breakPath(universe, child, isTop, function (u, p, c) {
      return breaker(p, c);
    });
  };
  var $_5ecxohl4jcg89dnw = {
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
    var detailIsWithin = $_3z1bpnjhjcg89dgu.curry(isWithin, bounds);
    for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
      for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
        isRect = isRect && $_74qbohknjcg89dl3.getAt(warehouse, i, j).exists(detailIsWithin);
      }
    }
    return isRect ? $_gj9ujrjgjcg89dgs.some(bounds) : $_gj9ujrjgjcg89dgs.none();
  };
  var $_21vl7tldjcg89dpe = {
    inSelection: inSelection,
    isWithin: isWithin,
    isRectangular: isRectangular
  };

  var getBounds = function (detailA, detailB) {
    return $_fmvzq0jqjcg89dhq.bounds(Math.min(detailA.row(), detailB.row()), Math.min(detailA.column(), detailB.column()), Math.max(detailA.row() + detailA.rowspan() - 1, detailB.row() + detailB.rowspan() - 1), Math.max(detailA.column() + detailA.colspan() - 1, detailB.column() + detailB.colspan() - 1));
  };
  var getAnyBox = function (warehouse, startCell, finishCell) {
    var startCoords = $_74qbohknjcg89dl3.findItem(warehouse, startCell, $_fqkoktjyjcg89diy.eq);
    var finishCoords = $_74qbohknjcg89dl3.findItem(warehouse, finishCell, $_fqkoktjyjcg89diy.eq);
    return startCoords.bind(function (sc) {
      return finishCoords.map(function (fc) {
        return getBounds(sc, fc);
      });
    });
  };
  var getBox$1 = function (warehouse, startCell, finishCell) {
    return getAnyBox(warehouse, startCell, finishCell).bind(function (bounds) {
      return $_21vl7tldjcg89dpe.isRectangular(warehouse, bounds);
    });
  };
  var $_51rd79lejcg89dpi = {
    getAnyBox: getAnyBox,
    getBox: getBox$1
  };

  var moveBy$1 = function (warehouse, cell, row, column) {
    return $_74qbohknjcg89dl3.findItem(warehouse, cell, $_fqkoktjyjcg89diy.eq).bind(function (detail) {
      var startRow = row > 0 ? detail.row() + detail.rowspan() - 1 : detail.row();
      var startCol = column > 0 ? detail.column() + detail.colspan() - 1 : detail.column();
      var dest = $_74qbohknjcg89dl3.getAt(warehouse, startRow + row, startCol + column);
      return dest.map(function (d) {
        return d.element();
      });
    });
  };
  var intercepts$1 = function (warehouse, start, finish) {
    return $_51rd79lejcg89dpi.getAnyBox(warehouse, start, finish).map(function (bounds) {
      var inside = $_74qbohknjcg89dl3.filterItems(warehouse, $_3z1bpnjhjcg89dgu.curry($_21vl7tldjcg89dpe.inSelection, bounds));
      return $_9786xxjfjcg89dgm.map(inside, function (detail) {
        return detail.element();
      });
    });
  };
  var parentCell = function (warehouse, innerCell) {
    var isContainedBy = function (c1, c2) {
      return $_fqkoktjyjcg89diy.contains(c2, c1);
    };
    return $_74qbohknjcg89dl3.findItem(warehouse, innerCell, isContainedBy).bind(function (detail) {
      return detail.element();
    });
  };
  var $_1ad4ehlcjcg89dp9 = {
    moveBy: moveBy$1,
    intercepts: intercepts$1,
    parentCell: parentCell
  };

  var moveBy = function (cell, deltaRow, deltaColumn) {
    return $_5igemtjrjcg89dhs.table(cell).bind(function (table) {
      var warehouse = getWarehouse(table);
      return $_1ad4ehlcjcg89dp9.moveBy(warehouse, cell, deltaRow, deltaColumn);
    });
  };
  var intercepts = function (table, first, last) {
    var warehouse = getWarehouse(table);
    return $_1ad4ehlcjcg89dp9.intercepts(warehouse, first, last);
  };
  var nestedIntercepts = function (table, first, firstTable, last, lastTable) {
    var warehouse = getWarehouse(table);
    var startCell = $_fqkoktjyjcg89diy.eq(table, firstTable) ? first : $_1ad4ehlcjcg89dp9.parentCell(warehouse, first);
    var lastCell = $_fqkoktjyjcg89diy.eq(table, lastTable) ? last : $_1ad4ehlcjcg89dp9.parentCell(warehouse, last);
    return $_1ad4ehlcjcg89dp9.intercepts(warehouse, startCell, lastCell);
  };
  var getBox = function (table, first, last) {
    var warehouse = getWarehouse(table);
    return $_51rd79lejcg89dpi.getBox(warehouse, first, last);
  };
  var getWarehouse = function (table) {
    var list = $_28wd6ujpjcg89dhi.fromTable(table);
    return $_74qbohknjcg89dl3.generate(list);
  };
  var $_59yes3lbjcg89dp6 = {
    moveBy: moveBy,
    intercepts: intercepts,
    nestedIntercepts: nestedIntercepts,
    getBox: getBox
  };

  var lookupTable = function (container, isRoot) {
    return $_a6sun7kkjcg89dks.ancestor(container, 'table');
  };
  var identified = $_mgt0hjkjcg89dhb.immutableBag([
    'boxes',
    'start',
    'finish'
  ], []);
  var identify = function (start, finish, isRoot) {
    var getIsRoot = function (rootTable) {
      return function (element) {
        return isRoot(element) || $_fqkoktjyjcg89diy.eq(element, rootTable);
      };
    };
    if ($_fqkoktjyjcg89diy.eq(start, finish)) {
      return $_gj9ujrjgjcg89dgs.some(identified({
        boxes: $_gj9ujrjgjcg89dgs.some([start]),
        start: start,
        finish: finish
      }));
    } else {
      return lookupTable(start, isRoot).bind(function (startTable) {
        return lookupTable(finish, isRoot).bind(function (finishTable) {
          if ($_fqkoktjyjcg89diy.eq(startTable, finishTable)) {
            return $_gj9ujrjgjcg89dgs.some(identified({
              boxes: $_59yes3lbjcg89dp6.intercepts(startTable, start, finish),
              start: start,
              finish: finish
            }));
          } else if ($_fqkoktjyjcg89diy.contains(startTable, finishTable)) {
            var ancestorCells = $_6f7vtwkhjcg89dkl.ancestors(finish, 'td,th', getIsRoot(startTable));
            var finishCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : finish;
            return $_gj9ujrjgjcg89dgs.some(identified({
              boxes: $_59yes3lbjcg89dp6.nestedIntercepts(startTable, start, startTable, finish, finishTable),
              start: start,
              finish: finishCell
            }));
          } else if ($_fqkoktjyjcg89diy.contains(finishTable, startTable)) {
            var ancestorCells = $_6f7vtwkhjcg89dkl.ancestors(start, 'td,th', getIsRoot(finishTable));
            var startCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : start;
            return $_gj9ujrjgjcg89dgs.some(identified({
              boxes: $_59yes3lbjcg89dp6.nestedIntercepts(finishTable, start, startTable, finish, finishTable),
              start: start,
              finish: startCell
            }));
          } else {
            return $_5ecxohl4jcg89dnw.ancestors(start, finish).shared().bind(function (lca) {
              return $_a6sun7kkjcg89dks.closest(lca, 'table', isRoot).bind(function (lcaTable) {
                var finishAncestorCells = $_6f7vtwkhjcg89dkl.ancestors(finish, 'td,th', getIsRoot(lcaTable));
                var finishCell = finishAncestorCells.length > 0 ? finishAncestorCells[finishAncestorCells.length - 1] : finish;
                var startAncestorCells = $_6f7vtwkhjcg89dkl.ancestors(start, 'td,th', getIsRoot(lcaTable));
                var startCell = startAncestorCells.length > 0 ? startAncestorCells[startAncestorCells.length - 1] : start;
                return $_gj9ujrjgjcg89dgs.some(identified({
                  boxes: $_59yes3lbjcg89dp6.nestedIntercepts(lcaTable, start, startTable, finish, finishTable),
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
    var sels = $_6f7vtwkhjcg89dkl.descendants(container, selector);
    return sels.length > 0 ? $_gj9ujrjgjcg89dgs.some(sels) : $_gj9ujrjgjcg89dgs.none();
  };
  var getLast = function (boxes, lastSelectedSelector) {
    return $_9786xxjfjcg89dgm.find(boxes, function (box) {
      return $_2vvdyijtjcg89dig.is(box, lastSelectedSelector);
    });
  };
  var getEdges = function (container, firstSelectedSelector, lastSelectedSelector) {
    return $_a6sun7kkjcg89dks.descendant(container, firstSelectedSelector).bind(function (first) {
      return $_a6sun7kkjcg89dks.descendant(container, lastSelectedSelector).bind(function (last) {
        return $_5ecxohl4jcg89dnw.sharedOne(lookupTable, [
          first,
          last
        ]).map(function (tbl) {
          return {
            first: $_3z1bpnjhjcg89dgu.constant(first),
            last: $_3z1bpnjhjcg89dgu.constant(last),
            table: $_3z1bpnjhjcg89dgu.constant(tbl)
          };
        });
      });
    });
  };
  var expandTo = function (finish, firstSelectedSelector) {
    return $_a6sun7kkjcg89dks.ancestor(finish, 'table').bind(function (table) {
      return $_a6sun7kkjcg89dks.descendant(table, firstSelectedSelector).bind(function (start) {
        return identify(start, finish).bind(function (identified) {
          return identified.boxes().map(function (boxes) {
            return {
              boxes: $_3z1bpnjhjcg89dgu.constant(boxes),
              start: $_3z1bpnjhjcg89dgu.constant(identified.start()),
              finish: $_3z1bpnjhjcg89dgu.constant(identified.finish())
            };
          });
        });
      });
    });
  };
  var shiftSelection = function (boxes, deltaRow, deltaColumn, firstSelectedSelector, lastSelectedSelector) {
    return getLast(boxes, lastSelectedSelector).bind(function (last) {
      return $_59yes3lbjcg89dp6.moveBy(last, deltaRow, deltaColumn).bind(function (finish) {
        return expandTo(finish, firstSelectedSelector);
      });
    });
  };
  var $_84g87ml3jcg89dnh = {
    identify: identify,
    retrieve: retrieve$1,
    shiftSelection: shiftSelection,
    getEdges: getEdges
  };

  var retrieve = function (container, selector) {
    return $_84g87ml3jcg89dnh.retrieve(container, selector);
  };
  var retrieveBox = function (container, firstSelectedSelector, lastSelectedSelector) {
    return $_84g87ml3jcg89dnh.getEdges(container, firstSelectedSelector, lastSelectedSelector).bind(function (edges) {
      var isRoot = function (ancestor) {
        return $_fqkoktjyjcg89diy.eq(container, ancestor);
      };
      var firstAncestor = $_a6sun7kkjcg89dks.ancestor(edges.first(), 'thead,tfoot,tbody,table', isRoot);
      var lastAncestor = $_a6sun7kkjcg89dks.ancestor(edges.last(), 'thead,tfoot,tbody,table', isRoot);
      return firstAncestor.bind(function (fA) {
        return lastAncestor.bind(function (lA) {
          return $_fqkoktjyjcg89diy.eq(fA, lA) ? $_59yes3lbjcg89dp6.getBox(edges.table(), edges.first(), edges.last()) : $_gj9ujrjgjcg89dgs.none();
        });
      });
    });
  };
  var $_7rfz9el2jcg89dnb = {
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
  var $_aq10s8lfjcg89dpm = {
    selected: $_3z1bpnjhjcg89dgu.constant(selected),
    selectedSelector: $_3z1bpnjhjcg89dgu.constant(selectedSelector),
    attributeSelector: $_3z1bpnjhjcg89dgu.constant(attributeSelector),
    firstSelected: $_3z1bpnjhjcg89dgu.constant(firstSelected),
    firstSelectedSelector: $_3z1bpnjhjcg89dgu.constant(firstSelectedSelector),
    lastSelected: $_3z1bpnjhjcg89dgu.constant(lastSelected),
    lastSelectedSelector: $_3z1bpnjhjcg89dgu.constant(lastSelectedSelector)
  };

  var generate$1 = function (cases) {
    if (!$_4jzhk7jojcg89dhh.isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    $_9786xxjfjcg89dgm.each(cases, function (acase, count) {
      var keys = $_7p93f5jjjcg89dh9.keys(acase);
      if (keys.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!$_4jzhk7jojcg89dhh.isArray(value)) {
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
          var branchKeys = $_7p93f5jjjcg89dh9.keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = $_9786xxjfjcg89dgm.forall(constructors, function (reqKey) {
            return $_9786xxjfjcg89dgm.contains(branchKeys, reqKey);
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
  var $_46qooqlhjcg89dpr = { generate: generate$1 };

  var type$1 = $_46qooqlhjcg89dpr.generate([
    { none: [] },
    { multiple: ['elements'] },
    { single: ['selection'] }
  ]);
  var cata = function (subject, onNone, onMultiple, onSingle) {
    return subject.fold(onNone, onMultiple, onSingle);
  };
  var $_fpa5brlgjcg89dpp = {
    cata: cata,
    none: type$1.none,
    multiple: type$1.multiple,
    single: type$1.single
  };

  var selection = function (cell, selections) {
    return $_fpa5brlgjcg89dpp.cata(selections.get(), $_3z1bpnjhjcg89dgu.constant([]), $_3z1bpnjhjcg89dgu.identity, $_3z1bpnjhjcg89dgu.constant([cell]));
  };
  var unmergable = function (cell, selections) {
    var hasSpan = function (elem) {
      return $_d6i8c7kfjcg89dkd.has(elem, 'rowspan') && parseInt($_d6i8c7kfjcg89dkd.get(elem, 'rowspan'), 10) > 1 || $_d6i8c7kfjcg89dkd.has(elem, 'colspan') && parseInt($_d6i8c7kfjcg89dkd.get(elem, 'colspan'), 10) > 1;
    };
    var candidates = selection(cell, selections);
    return candidates.length > 0 && $_9786xxjfjcg89dgm.forall(candidates, hasSpan) ? $_gj9ujrjgjcg89dgs.some(candidates) : $_gj9ujrjgjcg89dgs.none();
  };
  var mergable = function (table, selections) {
    return $_fpa5brlgjcg89dpp.cata(selections.get(), $_gj9ujrjgjcg89dgs.none, function (cells, _env) {
      if (cells.length === 0) {
        return $_gj9ujrjgjcg89dgs.none();
      }
      return $_7rfz9el2jcg89dnb.retrieveBox(table, $_aq10s8lfjcg89dpm.firstSelectedSelector(), $_aq10s8lfjcg89dpm.lastSelectedSelector()).bind(function (bounds) {
        return cells.length > 1 ? $_gj9ujrjgjcg89dgs.some({
          bounds: $_3z1bpnjhjcg89dgu.constant(bounds),
          cells: $_3z1bpnjhjcg89dgu.constant(cells)
        }) : $_gj9ujrjgjcg89dgs.none();
      });
    }, $_gj9ujrjgjcg89dgs.none);
  };
  var $_ehh0qgl1jcg89dn4 = {
    mergable: mergable,
    unmergable: unmergable,
    selection: selection
  };

  var noMenu = function (cell) {
    return {
      element: $_3z1bpnjhjcg89dgu.constant(cell),
      mergable: $_gj9ujrjgjcg89dgs.none,
      unmergable: $_gj9ujrjgjcg89dgs.none,
      selection: $_3z1bpnjhjcg89dgu.constant([cell])
    };
  };
  var forMenu = function (selections, table, cell) {
    return {
      element: $_3z1bpnjhjcg89dgu.constant(cell),
      mergable: $_3z1bpnjhjcg89dgu.constant($_ehh0qgl1jcg89dn4.mergable(table, selections)),
      unmergable: $_3z1bpnjhjcg89dgu.constant($_ehh0qgl1jcg89dn4.unmergable(cell, selections)),
      selection: $_3z1bpnjhjcg89dgu.constant($_ehh0qgl1jcg89dn4.selection(cell, selections))
    };
  };
  var notCell$1 = function (element) {
    return noMenu(element);
  };
  var paste$1 = $_mgt0hjkjcg89dhb.immutable('element', 'clipboard', 'generators');
  var pasteRows = function (selections, table, cell, clipboard, generators) {
    return {
      element: $_3z1bpnjhjcg89dgu.constant(cell),
      mergable: $_gj9ujrjgjcg89dgs.none,
      unmergable: $_gj9ujrjgjcg89dgs.none,
      selection: $_3z1bpnjhjcg89dgu.constant($_ehh0qgl1jcg89dn4.selection(cell, selections)),
      clipboard: $_3z1bpnjhjcg89dgu.constant(clipboard),
      generators: $_3z1bpnjhjcg89dgu.constant(generators)
    };
  };
  var $_1mg2tjl0jcg89dmz = {
    noMenu: noMenu,
    forMenu: forMenu,
    notCell: notCell$1,
    paste: paste$1,
    pasteRows: pasteRows
  };

  var extractSelected = function (cells) {
    return $_5igemtjrjcg89dhs.table(cells[0]).map($_58b4rtkujcg89dmj.deep).map(function (replica) {
      return [$_9bgnrxjijcg89dgx.extract(replica, $_aq10s8lfjcg89dpm.attributeSelector())];
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
          e.content = $_9786xxjfjcg89dgm.map(elements, function (elm) {
            return serializeElement(editor, elm);
          }).join('');
        });
      };
      if (e.selection === true) {
        $_fpa5brlgjcg89dpp.cata(selections.get(), $_3z1bpnjhjcg89dgu.noop, multiCellContext, $_3z1bpnjhjcg89dgu.noop);
      }
    });
    editor.on('BeforeSetContent', function (e) {
      if (e.selection === true && e.paste === true) {
        var cellOpt = $_gj9ujrjgjcg89dgs.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        cellOpt.each(function (domCell) {
          var cell = $_a8yw3ijujcg89dik.fromDom(domCell);
          var table = $_5igemtjrjcg89dhs.table(cell);
          table.bind(function (table) {
            var elements = $_9786xxjfjcg89dgm.filter($_8ekj74kzjcg89dmv.fromHtml(e.content), function (content) {
              return $_a7udttkgjcg89dkj.name(content) !== 'meta';
            });
            if (elements.length === 1 && $_a7udttkgjcg89dkj.name(elements[0]) === 'table') {
              e.preventDefault();
              var doc = $_a8yw3ijujcg89dik.fromDom(editor.getDoc());
              var generators = $_2zlupktjcg89dlx.paste(doc);
              var targets = $_1mg2tjl0jcg89dmz.paste(cell, elements[0], generators);
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
  var $_2j8czijejcg89dg7 = { registerEvents: registerEvents };

  var makeTable = function () {
    return $_a8yw3ijujcg89dik.fromTag('table');
  };
  var tableBody = function () {
    return $_a8yw3ijujcg89dik.fromTag('tbody');
  };
  var tableRow = function () {
    return $_a8yw3ijujcg89dik.fromTag('tr');
  };
  var tableHeaderCell = function () {
    return $_a8yw3ijujcg89dik.fromTag('th');
  };
  var tableCell = function () {
    return $_a8yw3ijujcg89dik.fromTag('td');
  };
  var render = function (rows, columns, rowHeaders, columnHeaders) {
    var table = makeTable();
    $_3m41takojcg89dla.setAll(table, {
      'border-collapse': 'collapse',
      width: '100%'
    });
    $_d6i8c7kfjcg89dkd.set(table, 'border', '1');
    var tbody = tableBody();
    $_2xc490kqjcg89dln.append(table, tbody);
    var trs = [];
    for (var i = 0; i < rows; i++) {
      var tr = tableRow();
      for (var j = 0; j < columns; j++) {
        var td = i < rowHeaders || j < columnHeaders ? tableHeaderCell() : tableCell();
        if (j < columnHeaders) {
          $_d6i8c7kfjcg89dkd.set(td, 'scope', 'row');
        }
        if (i < rowHeaders) {
          $_d6i8c7kfjcg89dkd.set(td, 'scope', 'col');
        }
        $_2xc490kqjcg89dln.append(td, $_a8yw3ijujcg89dik.fromTag('br'));
        $_3m41takojcg89dla.set(td, 'width', 100 / columns + '%');
        $_2xc490kqjcg89dln.append(tr, td);
      }
      trs.push(tr);
    }
    $_gij8gmksjcg89dlt.append(tbody, trs);
    return table;
  };
  var $_a3xr0nlkjcg89dq9 = { render: render };

  var $_el9dbaljjcg89dq8 = { render: $_a3xr0nlkjcg89dq9.render };

  var get$3 = function (element) {
    return element.dom().innerHTML;
  };
  var set$3 = function (element, content) {
    var owner = $_e07z69jwjcg89dip.owner(element);
    var docDom = owner.dom();
    var fragment = $_a8yw3ijujcg89dik.fromDom(docDom.createDocumentFragment());
    var contentElements = $_8ekj74kzjcg89dmv.fromHtml(content, docDom);
    $_gij8gmksjcg89dlt.append(fragment, contentElements);
    $_9fofwxkrjcg89dlq.empty(element);
    $_2xc490kqjcg89dln.append(element, fragment);
  };
  var getOuter = function (element) {
    var container = $_a8yw3ijujcg89dik.fromTag('div');
    var clone = $_a8yw3ijujcg89dik.fromDom(element.dom().cloneNode(true));
    $_2xc490kqjcg89dln.append(container, clone);
    return get$3(container);
  };
  var $_u9cmflljcg89dqg = {
    get: get$3,
    set: set$3,
    getOuter: getOuter
  };

  var placeCaretInCell = function (editor, cell) {
    editor.selection.select(cell.dom(), true);
    editor.selection.collapse(true);
  };
  var selectFirstCellInTable = function (editor, tableElm) {
    $_a6sun7kkjcg89dks.descendant(tableElm, 'td,th').each($_3z1bpnjhjcg89dgu.curry(placeCaretInCell, editor));
  };
  var insert = function (editor, columns, rows) {
    var tableElm;
    var renderedHtml = $_el9dbaljjcg89dq8.render(rows, columns, 0, 0);
    $_d6i8c7kfjcg89dkd.set(renderedHtml, 'id', '__mce');
    var html = $_u9cmflljcg89dqg.getOuter(renderedHtml);
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
    selectFirstCellInTable(editor, $_a8yw3ijujcg89dik.fromDom(tableElm));
    return tableElm;
  };
  var $_c7vlp7lijcg89dpt = { insert: insert };

  var Dimension = function (name, getOffset) {
    var set = function (element, h) {
      if (!$_4jzhk7jojcg89dhh.isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_aej8trkpjcg89dlm.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_3m41takojcg89dla.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return $_9786xxjfjcg89dgm.foldl(properties, function (acc, property) {
        var val = $_3m41takojcg89dla.get(element, property);
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
    return $_9klllckjjcg89dko.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
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
    $_3m41takojcg89dla.set(element, 'max-height', absMax + 'px');
  };
  var $_5ytj96lqjcg89drf = {
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
    $_3m41takojcg89dla.set(element, 'max-width', absMax + 'px');
  };
  var $_7wd8l4lsjcg89drk = {
    set: set$5,
    get: get$6,
    getOuter: getOuter$2,
    setMax: setMax$1
  };

  var platform = $_7o3y0ok3jcg89dja.detect();
  var needManualCalc = function () {
    return platform.browser.isIE() || platform.browser.isEdge();
  };
  var toNumber = function (px, fallback) {
    var num = parseFloat(px);
    return isNaN(num) ? fallback : num;
  };
  var getProp = function (elm, name, fallback) {
    return toNumber($_3m41takojcg89dla.get(elm, name), fallback);
  };
  var getCalculatedHeight = function (cell) {
    var paddingTop = getProp(cell, 'padding-top', 0);
    var paddingBottom = getProp(cell, 'padding-bottom', 0);
    var borderTop = getProp(cell, 'border-top-width', 0);
    var borderBottom = getProp(cell, 'border-bottom-width', 0);
    var height = cell.dom().getBoundingClientRect().height;
    var boxSizing = $_3m41takojcg89dla.get(cell, 'box-sizing');
    var borders = borderTop + borderBottom;
    return boxSizing === 'border-box' ? height : height - paddingTop - paddingBottom - borders;
  };
  var getWidth = function (cell) {
    return getProp(cell, 'width', $_7wd8l4lsjcg89drk.get(cell));
  };
  var getHeight$1 = function (cell) {
    return needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', $_5ytj96lqjcg89drf.get(cell));
  };
  var $_d6gjz3lpjcg89dr9 = {
    getWidth: getWidth,
    getHeight: getHeight$1
  };

  var genericSizeRegex = /(\d+(\.\d+)?)(\w|%)*/;
  var percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
  var pixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;
  var setPixelWidth = function (cell, amount) {
    $_3m41takojcg89dla.set(cell, 'width', amount + 'px');
  };
  var setPercentageWidth = function (cell, amount) {
    $_3m41takojcg89dla.set(cell, 'width', amount + '%');
  };
  var setHeight = function (cell, amount) {
    $_3m41takojcg89dla.set(cell, 'height', amount + 'px');
  };
  var getHeightValue = function (cell) {
    return $_3m41takojcg89dla.getRaw(cell, 'height').getOrThunk(function () {
      return $_d6gjz3lpjcg89dr9.getHeight(cell) + 'px';
    });
  };
  var convert = function (cell, number, getter, setter) {
    var newSize = $_5igemtjrjcg89dhs.table(cell).map(function (table) {
      var total = getter(table);
      return Math.floor(number / 100 * total);
    }).getOr(number);
    setter(cell, newSize);
    return newSize;
  };
  var normalizePixelSize = function (value, cell, getter, setter) {
    var number = parseInt(value, 10);
    return $_enq84kcjcg89dk8.endsWith(value, '%') && $_a7udttkgjcg89dkj.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
  };
  var getTotalHeight = function (cell) {
    var value = getHeightValue(cell);
    if (!value)
      return $_5ytj96lqjcg89drf.get(cell);
    return normalizePixelSize(value, cell, $_5ytj96lqjcg89drf.get, setHeight);
  };
  var get$4 = function (cell, type, f) {
    var v = f(cell);
    var span = getSpan(cell, type);
    return v / span;
  };
  var getSpan = function (cell, type) {
    return $_d6i8c7kfjcg89dkd.has(cell, type) ? parseInt($_d6i8c7kfjcg89dkd.get(cell, type), 10) : 1;
  };
  var getRawWidth = function (element) {
    var cssWidth = $_3m41takojcg89dla.getRaw(element, 'width');
    return cssWidth.fold(function () {
      return $_gj9ujrjgjcg89dgs.from($_d6i8c7kfjcg89dkd.get(element, 'width'));
    }, function (width) {
      return $_gj9ujrjgjcg89dgs.some(width);
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
      var fallbackWidth = $_7wd8l4lsjcg89drk.get(element);
      var intWidth = parseInt(fallbackWidth, 10);
      return normalizePercentageWidth(intWidth, tableSize);
    }
  };
  var getPercentageWidth = function (cell, tableSize) {
    var width = getRawWidth(cell);
    return width.fold(function () {
      var width = $_7wd8l4lsjcg89drk.get(cell);
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
      var fallbackWidth = $_7wd8l4lsjcg89drk.get(element);
      return parseInt(fallbackWidth, 10);
    }
  };
  var getPixelWidth = function (cell, tableSize) {
    var width = getRawWidth(cell);
    return width.fold(function () {
      var width = $_7wd8l4lsjcg89drk.get(cell);
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
        return $_gj9ujrjgjcg89dgs.some({
          width: $_3z1bpnjhjcg89dgu.constant(match[1]),
          unit: $_3z1bpnjhjcg89dgu.constant(match[3])
        });
      } else {
        return $_gj9ujrjgjcg89dgs.none();
      }
    });
  };
  var setGenericWidth = function (cell, amount, unit) {
    $_3m41takojcg89dla.set(cell, 'width', amount + unit);
  };
  var $_58huxtlojcg89dqw = {
    percentageBasedSizeRegex: $_3z1bpnjhjcg89dgu.constant(percentageBasedSizeRegex),
    pixelBasedSizeRegex: $_3z1bpnjhjcg89dgu.constant(pixelBasedSizeRegex),
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
    var width = $_58huxtlojcg89dqw.getGenericWidth(main);
    width.each(function (width) {
      var newWidth = width.width() / 2;
      $_58huxtlojcg89dqw.setGenericWidth(main, newWidth, width.unit());
      $_58huxtlojcg89dqw.setGenericWidth(other, newWidth, width.unit());
    });
  };
  var $_cj8e57lnjcg89dqu = { halve: halve };

  var attached = function (element, scope) {
    var doc = scope || $_a8yw3ijujcg89dik.fromDom(document.documentElement);
    return $_dnhfqskljcg89dkt.ancestor(element, $_3z1bpnjhjcg89dgu.curry($_fqkoktjyjcg89diy.eq, doc)).isSome();
  };
  var windowOf = function (element) {
    var dom = element.dom();
    if (dom === dom.window)
      return element;
    return $_a7udttkgjcg89dkj.isDocument(element) ? dom.defaultView || dom.parentWindow : null;
  };
  var $_8wpcj1lxjcg89ds4 = {
    attached: attached,
    windowOf: windowOf
  };

  var r = function (left, top) {
    var translate = function (x, y) {
      return r(left + x, top + y);
    };
    return {
      left: $_3z1bpnjhjcg89dgu.constant(left),
      top: $_3z1bpnjhjcg89dgu.constant(top),
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
    var win = $_8wpcj1lxjcg89ds4.windowOf($_a8yw3ijujcg89dik.fromDom(doc));
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
    var html = $_a8yw3ijujcg89dik.fromDom(doc.documentElement);
    if (body === dom)
      return r(body.offsetLeft, body.offsetTop);
    if (!$_8wpcj1lxjcg89ds4.attached(element, html))
      return r(0, 0);
    return boxPosition(dom);
  };
  var $_41eijblwjcg89ds2 = {
    absolute: absolute,
    relative: relative,
    viewport: viewport
  };

  var rowInfo = $_mgt0hjkjcg89dhb.immutable('row', 'y');
  var colInfo = $_mgt0hjkjcg89dhb.immutable('col', 'x');
  var rtlEdge = function (cell) {
    var pos = $_41eijblwjcg89ds2.absolute(cell);
    return pos.left() + $_7wd8l4lsjcg89drk.getOuter(cell);
  };
  var ltrEdge = function (cell) {
    return $_41eijblwjcg89ds2.absolute(cell).left();
  };
  var getLeftEdge = function (index, cell) {
    return colInfo(index, ltrEdge(cell));
  };
  var getRightEdge = function (index, cell) {
    return colInfo(index, rtlEdge(cell));
  };
  var getTop = function (cell) {
    return $_41eijblwjcg89ds2.absolute(cell).top();
  };
  var getTopEdge = function (index, cell) {
    return rowInfo(index, getTop(cell));
  };
  var getBottomEdge = function (index, cell) {
    return rowInfo(index, getTop(cell) + $_5ytj96lqjcg89drf.getOuter(cell));
  };
  var findPositions = function (getInnerEdge, getOuterEdge, array) {
    if (array.length === 0)
      return [];
    var lines = $_9786xxjfjcg89dgm.map(array.slice(1), function (cellOption, index) {
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
    delta: $_3z1bpnjhjcg89dgu.identity,
    positions: $_3z1bpnjhjcg89dgu.curry(findPositions, getTopEdge, getBottomEdge),
    edge: getTop
  };
  var ltr = {
    delta: $_3z1bpnjhjcg89dgu.identity,
    edge: ltrEdge,
    positions: $_3z1bpnjhjcg89dgu.curry(findPositions, getLeftEdge, getRightEdge)
  };
  var rtl = {
    delta: negate,
    edge: rtlEdge,
    positions: $_3z1bpnjhjcg89dgu.curry(findPositions, getRightEdge, getLeftEdge)
  };
  var $_5e5maelvjcg89dro = {
    height: height,
    rtl: rtl,
    ltr: ltr
  };

  var $_7772nylujcg89drn = {
    ltr: $_5e5maelvjcg89dro.ltr,
    rtl: $_5e5maelvjcg89dro.rtl
  };

  var TableDirection = function (directionAt) {
    var auto = function (table) {
      return directionAt(table).isRtl() ? $_7772nylujcg89drn.rtl : $_7772nylujcg89drn.ltr;
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
    var input = $_28wd6ujpjcg89dhi.fromTable(table);
    var warehouse = $_74qbohknjcg89dl3.generate(input);
    return warehouse.grid();
  };
  var $_f5b255lzjcg89dsa = { getGridSize: getGridSize };

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
      validate: $_4jzhk7jojcg89dhh.isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    $_a2gp2pjnjcg89dhf.validateStrArr('required', required);
    $_a2gp2pjnjcg89dhf.checkDupes(required);
    return function (obj) {
      var keys = $_7p93f5jjjcg89dh9.keys(obj);
      var allReqd = $_9786xxjfjcg89dgm.forall(required, function (req) {
        return $_9786xxjfjcg89dgm.contains(keys, req);
      });
      if (!allReqd)
        $_a2gp2pjnjcg89dhf.reqMessage(required, keys);
      handleUnsupported(required, keys);
      var invalidKeys = $_9786xxjfjcg89dgm.filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        $_a2gp2pjnjcg89dhf.invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys) {
    var unsupported = $_9786xxjfjcg89dgm.filter(keys, function (key) {
      return !$_9786xxjfjcg89dgm.contains(required, key);
    });
    if (unsupported.length > 0)
      $_a2gp2pjnjcg89dhf.unsuppMessage(unsupported);
  };
  var allowExtra = $_3z1bpnjhjcg89dgu.noop;
  var $_2ours6m3jcg89dt2 = {
    exactly: $_3z1bpnjhjcg89dgu.curry(base, handleExact),
    ensure: $_3z1bpnjhjcg89dgu.curry(base, allowExtra),
    ensureWith: $_3z1bpnjhjcg89dgu.curry(baseWith, allowExtra)
  };

  var elementToData = function (element) {
    var colspan = $_d6i8c7kfjcg89dkd.has(element, 'colspan') ? parseInt($_d6i8c7kfjcg89dkd.get(element, 'colspan'), 10) : 1;
    var rowspan = $_d6i8c7kfjcg89dkd.has(element, 'rowspan') ? parseInt($_d6i8c7kfjcg89dkd.get(element, 'rowspan'), 10) : 1;
    return {
      element: $_3z1bpnjhjcg89dgu.constant(element),
      colspan: $_3z1bpnjhjcg89dgu.constant(colspan),
      rowspan: $_3z1bpnjhjcg89dgu.constant(rowspan)
    };
  };
  var modification = function (generators, _toData) {
    contract(generators);
    var position = Cell($_gj9ujrjgjcg89dgs.none());
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
        position.set($_gj9ujrjgjcg89dgs.some(replacement));
      recent = $_gj9ujrjgjcg89dgs.some({
        item: element,
        replacement: replacement
      });
      return replacement;
    };
    var recent = $_gj9ujrjgjcg89dgs.none();
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
      var position = Cell($_gj9ujrjgjcg89dgs.none());
      contract(generators);
      var list = [];
      var find = function (element, comparator) {
        return $_9786xxjfjcg89dgm.find(list, function (x) {
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
          position.set($_gj9ujrjgjcg89dgs.some(cell));
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
    var position = Cell($_gj9ujrjgjcg89dgs.none());
    var combine = function (cell) {
      if (position.get().isNone())
        position.set($_gj9ujrjgjcg89dgs.some(cell));
      return function () {
        var raw = generators.cell({
          element: $_3z1bpnjhjcg89dgu.constant(cell),
          colspan: $_3z1bpnjhjcg89dgu.constant(1),
          rowspan: $_3z1bpnjhjcg89dgu.constant(1)
        });
        $_3m41takojcg89dla.remove(raw, 'width');
        $_3m41takojcg89dla.remove(cell, 'width');
        return raw;
      };
    };
    return {
      combine: combine,
      cursor: position.get
    };
  };
  var contract = $_2ours6m3jcg89dt2.exactly([
    'cell',
    'row',
    'replace',
    'gap'
  ]);
  var $_2ld8zwm1jcg89dsp = {
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
    return $_9786xxjfjcg89dgm.contains([
      'ol',
      'ul'
    ], tagName);
  };
  var isBlock$1 = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_9786xxjfjcg89dgm.contains(blockList, tagName);
  };
  var isFormatting$1 = function (universe, item) {
    var tagName = universe.property().name(item);
    return $_9786xxjfjcg89dgm.contains([
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
    return $_9786xxjfjcg89dgm.contains([
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ], tagName);
  };
  var isContainer$1 = function (universe, item) {
    return $_9786xxjfjcg89dgm.contains([
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
    return $_9786xxjfjcg89dgm.contains([
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
  var $_2ajlsnm6jcg89dtl = {
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
    return $_2ajlsnm6jcg89dtl.isBlock(universe$1, element);
  };
  var isList = function (element) {
    return $_2ajlsnm6jcg89dtl.isList(universe$1, element);
  };
  var isFormatting = function (element) {
    return $_2ajlsnm6jcg89dtl.isFormatting(universe$1, element);
  };
  var isHeading = function (element) {
    return $_2ajlsnm6jcg89dtl.isHeading(universe$1, element);
  };
  var isContainer = function (element) {
    return $_2ajlsnm6jcg89dtl.isContainer(universe$1, element);
  };
  var isEmptyTag = function (element) {
    return $_2ajlsnm6jcg89dtl.isEmptyTag(universe$1, element);
  };
  var isFrame = function (element) {
    return $_2ajlsnm6jcg89dtl.isFrame(universe$1, element);
  };
  var isInline = function (element) {
    return $_2ajlsnm6jcg89dtl.isInline(universe$1, element);
  };
  var $_amc7enm5jcg89dti = {
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
      return $_a7udttkgjcg89dkj.name(el) === 'br';
    };
    var advancedBr = function (children) {
      return $_9786xxjfjcg89dgm.forall(children, function (c) {
        return isBr(c) || $_a7udttkgjcg89dkj.isText(c) && $_8lwn8skxjcg89dmq.get(c).trim().length === 0;
      });
    };
    var isListItem = function (el) {
      return $_a7udttkgjcg89dkj.name(el) === 'li' || $_dnhfqskljcg89dkt.ancestor(el, $_amc7enm5jcg89dti.isList).isSome();
    };
    var siblingIsBlock = function (el) {
      return $_e07z69jwjcg89dip.nextSibling(el).map(function (rightSibling) {
        if ($_amc7enm5jcg89dti.isBlock(rightSibling))
          return true;
        if ($_amc7enm5jcg89dti.isEmptyTag(rightSibling)) {
          return $_a7udttkgjcg89dkj.name(rightSibling) === 'img' ? false : true;
        }
      }).getOr(false);
    };
    var markCell = function (cell) {
      return $_4u334mkvjcg89dml.last(cell).bind(function (rightEdge) {
        var rightSiblingIsBlock = siblingIsBlock(rightEdge);
        return $_e07z69jwjcg89dip.parent(rightEdge).map(function (parent) {
          return rightSiblingIsBlock === true || isListItem(parent) || isBr(rightEdge) || $_amc7enm5jcg89dti.isBlock(parent) && !$_fqkoktjyjcg89diy.eq(cell, parent) ? [] : [$_a8yw3ijujcg89dik.fromTag('br')];
        });
      }).getOr([]);
    };
    var markContent = function () {
      var content = $_9786xxjfjcg89dgm.bind(cells, function (cell) {
        var children = $_e07z69jwjcg89dip.children(cell);
        return advancedBr(children) ? [] : children.concat(markCell(cell));
      });
      return content.length === 0 ? [$_a8yw3ijujcg89dik.fromTag('br')] : content;
    };
    var contents = markContent();
    $_9fofwxkrjcg89dlq.empty(cells[0]);
    $_gij8gmksjcg89dlt.append(cells[0], contents);
  };
  var $_92nqf5m4jcg89dt5 = { merge: merge };

  var shallow$1 = function (old, nu) {
    return nu;
  };
  var deep$1 = function (old, nu) {
    var bothObjects = $_4jzhk7jojcg89dhh.isObject(old) && $_4jzhk7jojcg89dhh.isObject(nu);
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
  var $_5mlpg3m8jcg89du5 = {
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
    return $_gj9ujrjgjcg89dgs.none();
  };
  var liftN = function (arr, f) {
    var r = [];
    for (var i = 0; i < arr.length; i++) {
      var x = arr[i];
      if (x.isSome()) {
        r.push(x.getOrDie());
      } else {
        return $_gj9ujrjgjcg89dgs.none();
      }
    }
    return $_gj9ujrjgjcg89dgs.some(f.apply(null, r));
  };
  var $_6epu4cm9jcg89du6 = {
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
    return $_fmvzq0jqjcg89dhq.rowcells(cells, gridRow.section());
  };
  var mapCells = function (gridRow, f) {
    var cells = gridRow.cells();
    var r = $_9786xxjfjcg89dgm.map(cells, f);
    return $_fmvzq0jqjcg89dhq.rowcells(r, gridRow.section());
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
  var $_7o1n1ymcjcg89dug = {
    addCell: addCell,
    setCells: setCells,
    mutateCell: mutateCell,
    getCell: getCell,
    getCellElement: getCellElement,
    mapCells: mapCells,
    cellLength: cellLength
  };

  var getColumn = function (grid, index) {
    return $_9786xxjfjcg89dgm.map(grid, function (row) {
      return $_7o1n1ymcjcg89dug.getCell(row, index);
    });
  };
  var getRow = function (grid, index) {
    return grid[index];
  };
  var findDiff = function (xs, comp) {
    if (xs.length === 0)
      return 0;
    var first = xs[0];
    var index = $_9786xxjfjcg89dgm.findIndex(xs, function (x) {
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
      colspan: $_3z1bpnjhjcg89dgu.constant(endColIndex),
      rowspan: $_3z1bpnjhjcg89dgu.constant(endRowIndex)
    };
  };
  var $_84ko4nmbjcg89duc = { subgrid: subgrid };

  var toDetails = function (grid, comparator) {
    var seen = $_9786xxjfjcg89dgm.map(grid, function (row, ri) {
      return $_9786xxjfjcg89dgm.map(row.cells(), function (col, ci) {
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
    return $_9786xxjfjcg89dgm.map(grid, function (row, ri) {
      var details = $_9786xxjfjcg89dgm.bind(row.cells(), function (cell, ci) {
        if (seen[ri][ci] === false) {
          var result = $_84ko4nmbjcg89duc.subgrid(grid, ri, ci, comparator);
          updateSeen(ri, ci, result.rowspan(), result.colspan());
          return [$_fmvzq0jqjcg89dhq.detailnew(cell.element(), result.rowspan(), result.colspan(), cell.isNew())];
        } else {
          return [];
        }
      });
      return $_fmvzq0jqjcg89dhq.rowdetails(details, row.section());
    });
  };
  var toGrid = function (warehouse, generators, isNew) {
    var grid = [];
    for (var i = 0; i < warehouse.grid().rows(); i++) {
      var rowCells = [];
      for (var j = 0; j < warehouse.grid().columns(); j++) {
        var element = $_74qbohknjcg89dl3.getAt(warehouse, i, j).map(function (item) {
          return $_fmvzq0jqjcg89dhq.elementnew(item.element(), isNew);
        }).getOrThunk(function () {
          return $_fmvzq0jqjcg89dhq.elementnew(generators.gap(), true);
        });
        rowCells.push(element);
      }
      var row = $_fmvzq0jqjcg89dhq.rowcells(rowCells, warehouse.all()[i].section());
      grid.push(row);
    }
    return grid;
  };
  var $_a2vcqqmajcg89du9 = {
    toDetails: toDetails,
    toGrid: toGrid
  };

  var setIfNot = function (element, property, value, ignore) {
    if (value === ignore)
      $_d6i8c7kfjcg89dkd.remove(element, property);
    else
      $_d6i8c7kfjcg89dkd.set(element, property, value);
  };
  var render$1 = function (table, grid) {
    var newRows = [];
    var newCells = [];
    var renderSection = function (gridSection, sectionName) {
      var section = $_a6sun7kkjcg89dks.child(table, sectionName).getOrThunk(function () {
        var tb = $_a8yw3ijujcg89dik.fromTag(sectionName, $_e07z69jwjcg89dip.owner(table).dom());
        $_2xc490kqjcg89dln.append(table, tb);
        return tb;
      });
      $_9fofwxkrjcg89dlq.empty(section);
      var rows = $_9786xxjfjcg89dgm.map(gridSection, function (row) {
        if (row.isNew()) {
          newRows.push(row.element());
        }
        var tr = row.element();
        $_9fofwxkrjcg89dlq.empty(tr);
        $_9786xxjfjcg89dgm.each(row.cells(), function (cell) {
          if (cell.isNew()) {
            newCells.push(cell.element());
          }
          setIfNot(cell.element(), 'colspan', cell.colspan(), 1);
          setIfNot(cell.element(), 'rowspan', cell.rowspan(), 1);
          $_2xc490kqjcg89dln.append(tr, cell.element());
        });
        return tr;
      });
      $_gij8gmksjcg89dlt.append(section, rows);
    };
    var removeSection = function (sectionName) {
      $_a6sun7kkjcg89dks.child(table, sectionName).bind($_9fofwxkrjcg89dlq.remove);
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
    $_9786xxjfjcg89dgm.each(grid, function (row) {
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
      newRows: $_3z1bpnjhjcg89dgu.constant(newRows),
      newCells: $_3z1bpnjhjcg89dgu.constant(newCells)
    };
  };
  var copy$2 = function (grid) {
    var rows = $_9786xxjfjcg89dgm.map(grid, function (row) {
      var tr = $_58b4rtkujcg89dmj.shallow(row.element());
      $_9786xxjfjcg89dgm.each(row.cells(), function (cell) {
        var clonedCell = $_58b4rtkujcg89dmj.deep(cell.element());
        setIfNot(clonedCell, 'colspan', cell.colspan(), 1);
        setIfNot(clonedCell, 'rowspan', cell.rowspan(), 1);
        $_2xc490kqjcg89dln.append(tr, clonedCell);
      });
      return tr;
    });
    return rows;
  };
  var $_3gv68umdjcg89duk = {
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
    $_9786xxjfjcg89dgm.each(xs, function (x, i) {
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
      return $_gj9ujrjgjcg89dgs.none();
    var current = xs[index].fold(function () {
      var rest = $_9786xxjfjcg89dgm.reverse(xs.slice(0, index));
      return $_6epu4cm9jcg89du6.findMap(rest, function (a, i) {
        return a.map(function (aa) {
          return {
            value: aa,
            delta: i + 1
          };
        });
      });
    }, function (c) {
      return $_gj9ujrjgjcg89dgs.some({
        value: c,
        delta: 0
      });
    });
    var next = xs[index + 1].fold(function () {
      var rest = xs.slice(index + 1);
      return $_6epu4cm9jcg89du6.findMap(rest, function (a, i) {
        return a.map(function (aa) {
          return {
            value: aa,
            delta: i + 1
          };
        });
      });
    }, function (n) {
      return $_gj9ujrjgjcg89dgs.some({
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
  var $_bbcs5bmgjcg89dvh = {
    repeat: repeat,
    range: range$1,
    unique: unique,
    deduce: deduce
  };

  var columns = function (warehouse) {
    var grid = warehouse.grid();
    var cols = $_bbcs5bmgjcg89dvh.range(0, grid.columns());
    var rows = $_bbcs5bmgjcg89dvh.range(0, grid.rows());
    return $_9786xxjfjcg89dgm.map(cols, function (col) {
      var getBlock = function () {
        return $_9786xxjfjcg89dgm.bind(rows, function (r) {
          return $_74qbohknjcg89dl3.getAt(warehouse, r, col).filter(function (detail) {
            return detail.column() === col;
          }).fold($_3z1bpnjhjcg89dgu.constant([]), function (detail) {
            return [detail];
          });
        });
      };
      var isSingle = function (detail) {
        return detail.colspan() === 1;
      };
      var getFallback = function () {
        return $_74qbohknjcg89dl3.getAt(warehouse, 0, col);
      };
      return decide(getBlock, isSingle, getFallback);
    });
  };
  var decide = function (getBlock, isSingle, getFallback) {
    var inBlock = getBlock();
    var singleInBlock = $_9786xxjfjcg89dgm.find(inBlock, isSingle);
    var detailOption = singleInBlock.orThunk(function () {
      return $_gj9ujrjgjcg89dgs.from(inBlock[0]).orThunk(getFallback);
    });
    return detailOption.map(function (detail) {
      return detail.element();
    });
  };
  var rows$1 = function (warehouse) {
    var grid = warehouse.grid();
    var rows = $_bbcs5bmgjcg89dvh.range(0, grid.rows());
    var cols = $_bbcs5bmgjcg89dvh.range(0, grid.columns());
    return $_9786xxjfjcg89dgm.map(rows, function (row) {
      var getBlock = function () {
        return $_9786xxjfjcg89dgm.bind(cols, function (c) {
          return $_74qbohknjcg89dl3.getAt(warehouse, row, c).filter(function (detail) {
            return detail.row() === row;
          }).fold($_3z1bpnjhjcg89dgu.constant([]), function (detail) {
            return [detail];
          });
        });
      };
      var isSingle = function (detail) {
        return detail.rowspan() === 1;
      };
      var getFallback = function () {
        return $_74qbohknjcg89dl3.getAt(warehouse, row, 0);
      };
      return decide(getBlock, isSingle, getFallback);
    });
  };
  var $_6f176rmfjcg89dvc = {
    columns: columns,
    rows: rows$1
  };

  var col = function (column, x, y, w, h) {
    var blocker = $_a8yw3ijujcg89dik.fromTag('div');
    $_3m41takojcg89dla.setAll(blocker, {
      position: 'absolute',
      left: x - w / 2 + 'px',
      top: y + 'px',
      height: h + 'px',
      width: w + 'px'
    });
    $_d6i8c7kfjcg89dkd.setAll(blocker, {
      'data-column': column,
      'role': 'presentation'
    });
    return blocker;
  };
  var row$1 = function (row, x, y, w, h) {
    var blocker = $_a8yw3ijujcg89dik.fromTag('div');
    $_3m41takojcg89dla.setAll(blocker, {
      position: 'absolute',
      left: x + 'px',
      top: y - h / 2 + 'px',
      height: h + 'px',
      width: w + 'px'
    });
    $_d6i8c7kfjcg89dkd.setAll(blocker, {
      'data-row': row,
      'role': 'presentation'
    });
    return blocker;
  };
  var $_aaqqwrmhjcg89dvt = {
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
  var $_79h836mjjcg89dw0 = { css: css };

  var styles = $_79h836mjjcg89dw0.css('ephox-snooker');
  var $_4n60kjmijcg89dvy = { resolve: styles.resolve };

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
    var value = $_d6i8c7kfjcg89dkd.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add$2 = function (element, attr, id) {
    var old = read(element, attr);
    var nu = old.concat([id]);
    $_d6i8c7kfjcg89dkd.set(element, attr, nu.join(' '));
  };
  var remove$5 = function (element, attr, id) {
    var nu = $_9786xxjfjcg89dgm.filter(read(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_d6i8c7kfjcg89dkd.set(element, attr, nu.join(' '));
    else
      $_d6i8c7kfjcg89dkd.remove(element, attr);
  };
  var $_f0us5mnjcg89dw6 = {
    read: read,
    add: add$2,
    remove: remove$5
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$7 = function (element) {
    return $_f0us5mnjcg89dw6.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_f0us5mnjcg89dw6.add(element, 'class', clazz);
  };
  var remove$4 = function (element, clazz) {
    return $_f0us5mnjcg89dw6.remove(element, 'class', clazz);
  };
  var toggle$1 = function (element, clazz) {
    if ($_9786xxjfjcg89dgm.contains(get$7(element), clazz)) {
      remove$4(element, clazz);
    } else {
      add$1(element, clazz);
    }
  };
  var $_4elenmmmjcg89dw4 = {
    get: get$7,
    add: add$1,
    remove: remove$4,
    toggle: toggle$1,
    supports: supports
  };

  var add = function (element, clazz) {
    if ($_4elenmmmjcg89dw4.supports(element))
      element.dom().classList.add(clazz);
    else
      $_4elenmmmjcg89dw4.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_4elenmmmjcg89dw4.supports(element) ? element.dom().classList : $_4elenmmmjcg89dw4.get(element);
    if (classList.length === 0) {
      $_d6i8c7kfjcg89dkd.remove(element, 'class');
    }
  };
  var remove$3 = function (element, clazz) {
    if ($_4elenmmmjcg89dw4.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_4elenmmmjcg89dw4.remove(element, clazz);
    cleanClass(element);
  };
  var toggle = function (element, clazz) {
    return $_4elenmmmjcg89dw4.supports(element) ? element.dom().classList.toggle(clazz) : $_4elenmmmjcg89dw4.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_4elenmmmjcg89dw4.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_4elenmmmjcg89dw4.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_4elenmmmjcg89dw4.add(element, clazz);
    };
    return Toggler(off, on, has$1(element, clazz));
  };
  var has$1 = function (element, clazz) {
    return $_4elenmmmjcg89dw4.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_f0bxp7mkjcg89dw1 = {
    add: add,
    remove: remove$3,
    toggle: toggle,
    toggler: toggler,
    has: has$1
  };

  var resizeBar = $_4n60kjmijcg89dvy.resolve('resizer-bar');
  var resizeRowBar = $_4n60kjmijcg89dvy.resolve('resizer-rows');
  var resizeColBar = $_4n60kjmijcg89dvy.resolve('resizer-cols');
  var BAR_THICKNESS = 7;
  var clear = function (wire) {
    var previous = $_6f7vtwkhjcg89dkl.descendants(wire.parent(), '.' + resizeBar);
    $_9786xxjfjcg89dgm.each(previous, $_9fofwxkrjcg89dlq.remove);
  };
  var drawBar = function (wire, positions, create) {
    var origin = wire.origin();
    $_9786xxjfjcg89dgm.each(positions, function (cpOption, i) {
      cpOption.each(function (cp) {
        var bar = create(origin, cp);
        $_f0bxp7mkjcg89dw1.add(bar, resizeBar);
        $_2xc490kqjcg89dln.append(wire.parent(), bar);
      });
    });
  };
  var refreshCol = function (wire, colPositions, position, tableHeight) {
    drawBar(wire, colPositions, function (origin, cp) {
      var colBar = $_aaqqwrmhjcg89dvt.col(cp.col(), cp.x() - origin.left(), position.top() - origin.top(), BAR_THICKNESS, tableHeight);
      $_f0bxp7mkjcg89dw1.add(colBar, resizeColBar);
      return colBar;
    });
  };
  var refreshRow = function (wire, rowPositions, position, tableWidth) {
    drawBar(wire, rowPositions, function (origin, cp) {
      var rowBar = $_aaqqwrmhjcg89dvt.row(cp.row(), position.left() - origin.left(), cp.y() - origin.top(), tableWidth, BAR_THICKNESS);
      $_f0bxp7mkjcg89dw1.add(rowBar, resizeRowBar);
      return rowBar;
    });
  };
  var refreshGrid = function (wire, table, rows, cols, hdirection, vdirection) {
    var position = $_41eijblwjcg89ds2.absolute(table);
    var rowPositions = rows.length > 0 ? hdirection.positions(rows, table) : [];
    refreshRow(wire, rowPositions, position, $_7wd8l4lsjcg89drk.getOuter(table));
    var colPositions = cols.length > 0 ? vdirection.positions(cols, table) : [];
    refreshCol(wire, colPositions, position, $_5ytj96lqjcg89drf.getOuter(table));
  };
  var refresh = function (wire, table, hdirection, vdirection) {
    clear(wire);
    var list = $_28wd6ujpjcg89dhi.fromTable(table);
    var warehouse = $_74qbohknjcg89dl3.generate(list);
    var rows = $_6f176rmfjcg89dvc.rows(warehouse);
    var cols = $_6f176rmfjcg89dvc.columns(warehouse);
    refreshGrid(wire, table, rows, cols, hdirection, vdirection);
  };
  var each$2 = function (wire, f) {
    var bars = $_6f7vtwkhjcg89dkl.descendants(wire.parent(), '.' + resizeBar);
    $_9786xxjfjcg89dgm.each(bars, f);
  };
  var hide = function (wire) {
    each$2(wire, function (bar) {
      $_3m41takojcg89dla.set(bar, 'display', 'none');
    });
  };
  var show = function (wire) {
    each$2(wire, function (bar) {
      $_3m41takojcg89dla.set(bar, 'display', 'block');
    });
  };
  var isRowBar = function (element) {
    return $_f0bxp7mkjcg89dw1.has(element, resizeRowBar);
  };
  var isColBar = function (element) {
    return $_f0bxp7mkjcg89dw1.has(element, resizeColBar);
  };
  var $_7gwmfimejcg89dv0 = {
    refresh: refresh,
    hide: hide,
    show: show,
    destroy: clear,
    isRowBar: isRowBar,
    isColBar: isColBar
  };

  var fromWarehouse = function (warehouse, generators) {
    return $_a2vcqqmajcg89du9.toGrid(warehouse, generators, false);
  };
  var deriveRows = function (rendered, generators) {
    var findRow = function (details) {
      var rowOfCells = $_6epu4cm9jcg89du6.findMap(details, function (detail) {
        return $_e07z69jwjcg89dip.parent(detail.element()).map(function (row) {
          var isNew = $_e07z69jwjcg89dip.parent(row).isNone();
          return $_fmvzq0jqjcg89dhq.elementnew(row, isNew);
        });
      });
      return rowOfCells.getOrThunk(function () {
        return $_fmvzq0jqjcg89dhq.elementnew(generators.row(), true);
      });
    };
    return $_9786xxjfjcg89dgm.map(rendered, function (details) {
      var row = findRow(details.details());
      return $_fmvzq0jqjcg89dhq.rowdatanew(row.element(), details.details(), details.section(), row.isNew());
    });
  };
  var toDetailList = function (grid, generators) {
    var rendered = $_a2vcqqmajcg89du9.toDetails(grid, $_fqkoktjyjcg89diy.eq);
    return deriveRows(rendered, generators);
  };
  var findInWarehouse = function (warehouse, element) {
    var all = $_9786xxjfjcg89dgm.flatten($_9786xxjfjcg89dgm.map(warehouse.all(), function (r) {
      return r.cells();
    }));
    return $_9786xxjfjcg89dgm.find(all, function (e) {
      return $_fqkoktjyjcg89diy.eq(element, e.element());
    });
  };
  var run = function (operation, extract, adjustment, postAction, genWrappers) {
    return function (wire, table, target, generators, direction) {
      var input = $_28wd6ujpjcg89dhi.fromTable(table);
      var warehouse = $_74qbohknjcg89dl3.generate(input);
      var output = extract(warehouse, target).map(function (info) {
        var model = fromWarehouse(warehouse, generators);
        var result = operation(model, info, $_fqkoktjyjcg89diy.eq, genWrappers(generators));
        var grid = toDetailList(result.grid(), generators);
        return {
          grid: $_3z1bpnjhjcg89dgu.constant(grid),
          cursor: result.cursor
        };
      });
      return output.fold(function () {
        return $_gj9ujrjgjcg89dgs.none();
      }, function (out) {
        var newElements = $_3gv68umdjcg89duk.render(table, out.grid());
        adjustment(table, out.grid(), direction);
        postAction(table);
        $_7gwmfimejcg89dv0.refresh(wire, table, $_5e5maelvjcg89dro.height, direction);
        return $_gj9ujrjgjcg89dgs.some({
          cursor: out.cursor,
          newRows: newElements.newRows,
          newCells: newElements.newCells
        });
      });
    };
  };
  var onCell = function (warehouse, target) {
    return $_5igemtjrjcg89dhs.cell(target.element()).bind(function (cell) {
      return findInWarehouse(warehouse, cell);
    });
  };
  var onPaste = function (warehouse, target) {
    return $_5igemtjrjcg89dhs.cell(target.element()).bind(function (cell) {
      return findInWarehouse(warehouse, cell).map(function (details) {
        return $_5mlpg3m8jcg89du5.merge(details, {
          generators: target.generators,
          clipboard: target.clipboard
        });
      });
    });
  };
  var onPasteRows = function (warehouse, target) {
    var details = $_9786xxjfjcg89dgm.map(target.selection(), function (cell) {
      return $_5igemtjrjcg89dhs.cell(cell).bind(function (lc) {
        return findInWarehouse(warehouse, lc);
      });
    });
    var cells = $_6epu4cm9jcg89du6.cat(details);
    return cells.length > 0 ? $_gj9ujrjgjcg89dgs.some($_5mlpg3m8jcg89du5.merge({ cells: cells }, {
      generators: target.generators,
      clipboard: target.clipboard
    })) : $_gj9ujrjgjcg89dgs.none();
  };
  var onMergable = function (warehouse, target) {
    return target.mergable();
  };
  var onUnmergable = function (warehouse, target) {
    return target.unmergable();
  };
  var onCells = function (warehouse, target) {
    var details = $_9786xxjfjcg89dgm.map(target.selection(), function (cell) {
      return $_5igemtjrjcg89dhs.cell(cell).bind(function (lc) {
        return findInWarehouse(warehouse, lc);
      });
    });
    var cells = $_6epu4cm9jcg89du6.cat(details);
    return cells.length > 0 ? $_gj9ujrjgjcg89dgs.some(cells) : $_gj9ujrjgjcg89dgs.none();
  };
  var $_9hqf5dm7jcg89dto = {
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
      return $_gj9ujrjgjcg89dgs.some(o);
    };
    return {
      is: is,
      isValue: $_3z1bpnjhjcg89dgu.constant(true),
      isError: $_3z1bpnjhjcg89dgu.constant(false),
      getOr: $_3z1bpnjhjcg89dgu.constant(o),
      getOrThunk: $_3z1bpnjhjcg89dgu.constant(o),
      getOrDie: $_3z1bpnjhjcg89dgu.constant(o),
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
      return $_3z1bpnjhjcg89dgu.die(message)();
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
      is: $_3z1bpnjhjcg89dgu.constant(false),
      isValue: $_3z1bpnjhjcg89dgu.constant(false),
      isError: $_3z1bpnjhjcg89dgu.constant(true),
      getOr: $_3z1bpnjhjcg89dgu.identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: $_3z1bpnjhjcg89dgu.noop,
      bind: bind,
      exists: $_3z1bpnjhjcg89dgu.constant(false),
      forall: $_3z1bpnjhjcg89dgu.constant(true),
      toOption: $_gj9ujrjgjcg89dgs.none
    };
  };
  var $_99fh1pmqjcg89dwm = {
    value: value$1,
    error: error
  };

  var measure = function (startAddress, gridA, gridB) {
    if (startAddress.row() >= gridA.length || startAddress.column() > $_7o1n1ymcjcg89dug.cellLength(gridA[0]))
      return $_99fh1pmqjcg89dwm.error('invalid start address out of table bounds, row: ' + startAddress.row() + ', column: ' + startAddress.column());
    var rowRemainder = gridA.slice(startAddress.row());
    var colRemainder = rowRemainder[0].cells().slice(startAddress.column());
    var colRequired = $_7o1n1ymcjcg89dug.cellLength(gridB[0]);
    var rowRequired = gridB.length;
    return $_99fh1pmqjcg89dwm.value({
      rowDelta: $_3z1bpnjhjcg89dgu.constant(rowRemainder.length - rowRequired),
      colDelta: $_3z1bpnjhjcg89dgu.constant(colRemainder.length - colRequired)
    });
  };
  var measureWidth = function (gridA, gridB) {
    var colLengthA = $_7o1n1ymcjcg89dug.cellLength(gridA[0]);
    var colLengthB = $_7o1n1ymcjcg89dug.cellLength(gridB[0]);
    return {
      rowDelta: $_3z1bpnjhjcg89dgu.constant(0),
      colDelta: $_3z1bpnjhjcg89dgu.constant(colLengthA - colLengthB)
    };
  };
  var fill = function (cells, generator) {
    return $_9786xxjfjcg89dgm.map(cells, function () {
      return $_fmvzq0jqjcg89dhq.elementnew(generator.cell(), true);
    });
  };
  var rowFill = function (grid, amount, generator) {
    return grid.concat($_bbcs5bmgjcg89dvh.repeat(amount, function (_row) {
      return $_7o1n1ymcjcg89dug.setCells(grid[grid.length - 1], fill(grid[grid.length - 1].cells(), generator));
    }));
  };
  var colFill = function (grid, amount, generator) {
    return $_9786xxjfjcg89dgm.map(grid, function (row) {
      return $_7o1n1ymcjcg89dug.setCells(row, row.cells().concat(fill($_bbcs5bmgjcg89dvh.range(0, amount), generator)));
    });
  };
  var tailor = function (gridA, delta, generator) {
    var fillCols = delta.colDelta() < 0 ? colFill : $_3z1bpnjhjcg89dgu.identity;
    var fillRows = delta.rowDelta() < 0 ? rowFill : $_3z1bpnjhjcg89dgu.identity;
    var modifiedCols = fillCols(gridA, Math.abs(delta.colDelta()), generator);
    var tailoredGrid = fillRows(modifiedCols, Math.abs(delta.rowDelta()), generator);
    return tailoredGrid;
  };
  var $_4ittpnmpjcg89dwe = {
    measure: measure,
    measureWidth: measureWidth,
    tailor: tailor
  };

  var merge$3 = function (grid, bounds, comparator, substitution) {
    if (grid.length === 0)
      return grid;
    for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
      for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
        $_7o1n1ymcjcg89dug.mutateCell(grid[i], j, $_fmvzq0jqjcg89dhq.elementnew(substitution(), false));
      }
    }
    return grid;
  };
  var unmerge = function (grid, target, comparator, substitution) {
    var first = true;
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < $_7o1n1ymcjcg89dug.cellLength(grid[0]); j++) {
        var current = $_7o1n1ymcjcg89dug.getCellElement(grid[i], j);
        var isToReplace = comparator(current, target);
        if (isToReplace === true && first === false) {
          $_7o1n1ymcjcg89dug.mutateCell(grid[i], j, $_fmvzq0jqjcg89dhq.elementnew(substitution(), true));
        } else if (isToReplace === true) {
          first = false;
        }
      }
    }
    return grid;
  };
  var uniqueCells = function (row, comparator) {
    return $_9786xxjfjcg89dgm.foldl(row, function (rest, cell) {
      return $_9786xxjfjcg89dgm.exists(rest, function (currentCell) {
        return comparator(currentCell.element(), cell.element());
      }) ? rest : rest.concat([cell]);
    }, []);
  };
  var splitRows = function (grid, index, comparator, substitution) {
    if (index > 0 && index < grid.length) {
      var rowPrevCells = grid[index - 1].cells();
      var cells = uniqueCells(rowPrevCells, comparator);
      $_9786xxjfjcg89dgm.each(cells, function (cell) {
        var replacement = $_gj9ujrjgjcg89dgs.none();
        for (var i = index; i < grid.length; i++) {
          for (var j = 0; j < $_7o1n1ymcjcg89dug.cellLength(grid[0]); j++) {
            var current = grid[i].cells()[j];
            var isToReplace = comparator(current.element(), cell.element());
            if (isToReplace) {
              if (replacement.isNone()) {
                replacement = $_gj9ujrjgjcg89dgs.some(substitution());
              }
              replacement.each(function (sub) {
                $_7o1n1ymcjcg89dug.mutateCell(grid[i], j, $_fmvzq0jqjcg89dhq.elementnew(sub, true));
              });
            }
          }
        }
      });
    }
    return grid;
  };
  var $_8iciakmrjcg89dwp = {
    merge: merge$3,
    unmerge: unmerge,
    splitRows: splitRows
  };

  var isSpanning = function (grid, row, col, comparator) {
    var candidate = $_7o1n1ymcjcg89dug.getCell(grid[row], col);
    var matching = $_3z1bpnjhjcg89dgu.curry(comparator, candidate.element());
    var currentRow = grid[row];
    return grid.length > 1 && $_7o1n1ymcjcg89dug.cellLength(currentRow) > 1 && (col > 0 && matching($_7o1n1ymcjcg89dug.getCellElement(currentRow, col - 1)) || col < currentRow.length - 1 && matching($_7o1n1ymcjcg89dug.getCellElement(currentRow, col + 1)) || row > 0 && matching($_7o1n1ymcjcg89dug.getCellElement(grid[row - 1], col)) || row < grid.length - 1 && matching($_7o1n1ymcjcg89dug.getCellElement(grid[row + 1], col)));
  };
  var mergeTables = function (startAddress, gridA, gridB, generator, comparator) {
    var startRow = startAddress.row();
    var startCol = startAddress.column();
    var mergeHeight = gridB.length;
    var mergeWidth = $_7o1n1ymcjcg89dug.cellLength(gridB[0]);
    var endRow = startRow + mergeHeight;
    var endCol = startCol + mergeWidth;
    for (var r = startRow; r < endRow; r++) {
      for (var c = startCol; c < endCol; c++) {
        if (isSpanning(gridA, r, c, comparator)) {
          $_8iciakmrjcg89dwp.unmerge(gridA, $_7o1n1ymcjcg89dug.getCellElement(gridA[r], c), comparator, generator.cell);
        }
        var newCell = $_7o1n1ymcjcg89dug.getCellElement(gridB[r - startRow], c - startCol);
        var replacement = generator.replace(newCell);
        $_7o1n1ymcjcg89dug.mutateCell(gridA[r], c, $_fmvzq0jqjcg89dhq.elementnew(replacement, true));
      }
    }
    return gridA;
  };
  var merge$2 = function (startAddress, gridA, gridB, generator, comparator) {
    var result = $_4ittpnmpjcg89dwe.measure(startAddress, gridA, gridB);
    return result.map(function (delta) {
      var fittedGrid = $_4ittpnmpjcg89dwe.tailor(gridA, delta, generator);
      return mergeTables(startAddress, fittedGrid, gridB, generator, comparator);
    });
  };
  var insert$1 = function (index, gridA, gridB, generator, comparator) {
    $_8iciakmrjcg89dwp.splitRows(gridA, index, comparator, generator.cell);
    var delta = $_4ittpnmpjcg89dwe.measureWidth(gridB, gridA);
    var fittedNewGrid = $_4ittpnmpjcg89dwe.tailor(gridB, delta, generator);
    var secondDelta = $_4ittpnmpjcg89dwe.measureWidth(gridA, fittedNewGrid);
    var fittedOldGrid = $_4ittpnmpjcg89dwe.tailor(gridA, secondDelta, generator);
    return fittedOldGrid.slice(0, index).concat(fittedNewGrid).concat(fittedOldGrid.slice(index, fittedOldGrid.length));
  };
  var $_93xao1mojcg89dwa = {
    merge: merge$2,
    insert: insert$1
  };

  var insertRowAt = function (grid, index, example, comparator, substitution) {
    var before = grid.slice(0, index);
    var after = grid.slice(index);
    var between = $_7o1n1ymcjcg89dug.mapCells(grid[example], function (ex, c) {
      var withinSpan = index > 0 && index < grid.length && comparator($_7o1n1ymcjcg89dug.getCellElement(grid[index - 1], c), $_7o1n1ymcjcg89dug.getCellElement(grid[index], c));
      var ret = withinSpan ? $_7o1n1ymcjcg89dug.getCell(grid[index], c) : $_fmvzq0jqjcg89dhq.elementnew(substitution(ex.element(), comparator), true);
      return ret;
    });
    return before.concat([between]).concat(after);
  };
  var insertColumnAt = function (grid, index, example, comparator, substitution) {
    return $_9786xxjfjcg89dgm.map(grid, function (row) {
      var withinSpan = index > 0 && index < $_7o1n1ymcjcg89dug.cellLength(row) && comparator($_7o1n1ymcjcg89dug.getCellElement(row, index - 1), $_7o1n1ymcjcg89dug.getCellElement(row, index));
      var sub = withinSpan ? $_7o1n1ymcjcg89dug.getCell(row, index) : $_fmvzq0jqjcg89dhq.elementnew(substitution($_7o1n1ymcjcg89dug.getCellElement(row, example), comparator), true);
      return $_7o1n1ymcjcg89dug.addCell(row, index, sub);
    });
  };
  var splitCellIntoColumns$1 = function (grid, exampleRow, exampleCol, comparator, substitution) {
    var index = exampleCol + 1;
    return $_9786xxjfjcg89dgm.map(grid, function (row, i) {
      var isTargetCell = i === exampleRow;
      var sub = isTargetCell ? $_fmvzq0jqjcg89dhq.elementnew(substitution($_7o1n1ymcjcg89dug.getCellElement(row, exampleCol), comparator), true) : $_7o1n1ymcjcg89dug.getCell(row, exampleCol);
      return $_7o1n1ymcjcg89dug.addCell(row, index, sub);
    });
  };
  var splitCellIntoRows$1 = function (grid, exampleRow, exampleCol, comparator, substitution) {
    var index = exampleRow + 1;
    var before = grid.slice(0, index);
    var after = grid.slice(index);
    var between = $_7o1n1ymcjcg89dug.mapCells(grid[exampleRow], function (ex, i) {
      var isTargetCell = i === exampleCol;
      return isTargetCell ? $_fmvzq0jqjcg89dhq.elementnew(substitution(ex.element(), comparator), true) : ex;
    });
    return before.concat([between]).concat(after);
  };
  var deleteColumnsAt = function (grid, start, finish) {
    var rows = $_9786xxjfjcg89dgm.map(grid, function (row) {
      var cells = row.cells().slice(0, start).concat(row.cells().slice(finish + 1));
      return $_fmvzq0jqjcg89dhq.rowcells(cells, row.section());
    });
    return $_9786xxjfjcg89dgm.filter(rows, function (row) {
      return row.cells().length > 0;
    });
  };
  var deleteRowsAt = function (grid, start, finish) {
    return grid.slice(0, start).concat(grid.slice(finish + 1));
  };
  var $_bu74msjcg89dwu = {
    insertRowAt: insertRowAt,
    insertColumnAt: insertColumnAt,
    splitCellIntoColumns: splitCellIntoColumns$1,
    splitCellIntoRows: splitCellIntoRows$1,
    deleteRowsAt: deleteRowsAt,
    deleteColumnsAt: deleteColumnsAt
  };

  var replaceIn = function (grid, targets, comparator, substitution) {
    var isTarget = function (cell) {
      return $_9786xxjfjcg89dgm.exists(targets, function (target) {
        return comparator(cell.element(), target.element());
      });
    };
    return $_9786xxjfjcg89dgm.map(grid, function (row) {
      return $_7o1n1ymcjcg89dug.mapCells(row, function (cell) {
        return isTarget(cell) ? $_fmvzq0jqjcg89dhq.elementnew(substitution(cell.element(), comparator), true) : cell;
      });
    });
  };
  var notStartRow = function (grid, rowIndex, colIndex, comparator) {
    return $_7o1n1ymcjcg89dug.getCellElement(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator($_7o1n1ymcjcg89dug.getCellElement(grid[rowIndex - 1], colIndex), $_7o1n1ymcjcg89dug.getCellElement(grid[rowIndex], colIndex)));
  };
  var notStartColumn = function (row, index, comparator) {
    return index > 0 && comparator($_7o1n1ymcjcg89dug.getCellElement(row, index - 1), $_7o1n1ymcjcg89dug.getCellElement(row, index));
  };
  var replaceColumn = function (grid, index, comparator, substitution) {
    var targets = $_9786xxjfjcg89dgm.bind(grid, function (row, i) {
      var alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
      return alreadyAdded ? [] : [$_7o1n1ymcjcg89dug.getCell(row, index)];
    });
    return replaceIn(grid, targets, comparator, substitution);
  };
  var replaceRow = function (grid, index, comparator, substitution) {
    var targetRow = grid[index];
    var targets = $_9786xxjfjcg89dgm.bind(targetRow.cells(), function (item, i) {
      var alreadyAdded = notStartRow(grid, index, i, comparator) || notStartColumn(targetRow, i, comparator);
      return alreadyAdded ? [] : [item];
    });
    return replaceIn(grid, targets, comparator, substitution);
  };
  var $_8xlv63mtjcg89dwy = {
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
  var $_8e5ofmmwjcg89dxa = {
    none: none$1,
    only: only,
    left: left,
    middle: middle,
    right: right
  };

  var neighbours$1 = function (input, index) {
    if (input.length === 0)
      return $_8e5ofmmwjcg89dxa.none();
    if (input.length === 1)
      return $_8e5ofmmwjcg89dxa.only(0);
    if (index === 0)
      return $_8e5ofmmwjcg89dxa.left(0, 1);
    if (index === input.length - 1)
      return $_8e5ofmmwjcg89dxa.right(index - 1, index);
    if (index > 0 && index < input.length - 1)
      return $_8e5ofmmwjcg89dxa.middle(index - 1, index, index + 1);
    return $_8e5ofmmwjcg89dxa.none();
  };
  var determine = function (input, column, step, tableSize) {
    var result = input.slice(0);
    var context = neighbours$1(input, column);
    var zero = function (array) {
      return $_9786xxjfjcg89dgm.map(array, $_3z1bpnjhjcg89dgu.constant(0));
    };
    var onNone = $_3z1bpnjhjcg89dgu.constant(zero(result));
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
  var $_4qposwmvjcg89dx5 = { determine: determine };

  var getSpan$1 = function (cell, type) {
    return $_d6i8c7kfjcg89dkd.has(cell, type) && parseInt($_d6i8c7kfjcg89dkd.get(cell, type), 10) > 1;
  };
  var hasColspan = function (cell) {
    return getSpan$1(cell, 'colspan');
  };
  var hasRowspan = function (cell) {
    return getSpan$1(cell, 'rowspan');
  };
  var getInt = function (element, property) {
    return parseInt($_3m41takojcg89dla.get(element, property), 10);
  };
  var $_at5adomyjcg89dxs = {
    hasColspan: hasColspan,
    hasRowspan: hasRowspan,
    minWidth: $_3z1bpnjhjcg89dgu.constant(10),
    minHeight: $_3z1bpnjhjcg89dgu.constant(10),
    getInt: getInt
  };

  var getRaw$1 = function (cell, property, getter) {
    return $_3m41takojcg89dla.getRaw(cell, property).fold(function () {
      return getter(cell) + 'px';
    }, function (raw) {
      return raw;
    });
  };
  var getRawW = function (cell) {
    return getRaw$1(cell, 'width', $_58huxtlojcg89dqw.getPixelWidth);
  };
  var getRawH = function (cell) {
    return getRaw$1(cell, 'height', $_58huxtlojcg89dqw.getHeight);
  };
  var getWidthFrom = function (warehouse, direction, getWidth, fallback, tableSize) {
    var columns = $_6f176rmfjcg89dvc.columns(warehouse);
    var backups = $_9786xxjfjcg89dgm.map(columns, function (cellOption) {
      return cellOption.map(direction.edge);
    });
    return $_9786xxjfjcg89dgm.map(columns, function (cellOption, c) {
      var columnCell = cellOption.filter($_3z1bpnjhjcg89dgu.not($_at5adomyjcg89dxs.hasColspan));
      return columnCell.fold(function () {
        var deduced = $_bbcs5bmgjcg89dvh.deduce(backups, c);
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
    return getWidthFrom(warehouse, direction, $_58huxtlojcg89dqw.getPercentageWidth, function (deduced) {
      return deduced.fold(function () {
        return tableSize.minCellWidth();
      }, function (cellWidth) {
        return cellWidth / tableSize.pixelWidth() * 100;
      });
    }, tableSize);
  };
  var getPixelWidths = function (warehouse, direction, tableSize) {
    return getWidthFrom(warehouse, direction, $_58huxtlojcg89dqw.getPixelWidth, function (deduced) {
      return deduced.getOrThunk(tableSize.minCellWidth);
    }, tableSize);
  };
  var getHeightFrom = function (warehouse, direction, getHeight, fallback) {
    var rows = $_6f176rmfjcg89dvc.rows(warehouse);
    var backups = $_9786xxjfjcg89dgm.map(rows, function (cellOption) {
      return cellOption.map(direction.edge);
    });
    return $_9786xxjfjcg89dgm.map(rows, function (cellOption, c) {
      var rowCell = cellOption.filter($_3z1bpnjhjcg89dgu.not($_at5adomyjcg89dxs.hasRowspan));
      return rowCell.fold(function () {
        var deduced = $_bbcs5bmgjcg89dvh.deduce(backups, c);
        return fallback(deduced);
      }, function (cell) {
        return getHeight(cell);
      });
    });
  };
  var getPixelHeights = function (warehouse, direction) {
    return getHeightFrom(warehouse, direction, $_58huxtlojcg89dqw.getHeight, function (deduced) {
      return deduced.getOrThunk($_at5adomyjcg89dxs.minHeight);
    });
  };
  var getRawHeights = function (warehouse, direction) {
    return getHeightFrom(warehouse, direction, getRawH, getDeduced);
  };
  var $_dmxnypmxjcg89dxc = {
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
    var all = $_74qbohknjcg89dl3.justCells(warehouse);
    return $_9786xxjfjcg89dgm.map(all, function (cell) {
      var width = total(cell.column(), cell.column() + cell.colspan(), widths);
      return {
        element: cell.element,
        width: $_3z1bpnjhjcg89dgu.constant(width),
        colspan: cell.colspan
      };
    });
  };
  var recalculateHeight = function (warehouse, heights) {
    var all = $_74qbohknjcg89dl3.justCells(warehouse);
    return $_9786xxjfjcg89dgm.map(all, function (cell) {
      var height = total(cell.row(), cell.row() + cell.rowspan(), heights);
      return {
        element: cell.element,
        height: $_3z1bpnjhjcg89dgu.constant(height),
        rowspan: cell.rowspan
      };
    });
  };
  var matchRowHeight = function (warehouse, heights) {
    return $_9786xxjfjcg89dgm.map(warehouse.all(), function (row, i) {
      return {
        element: row.element,
        height: $_3z1bpnjhjcg89dgu.constant(heights[i])
      };
    });
  };
  var $_1wnyhmzjcg89dy1 = {
    recalculateWidth: recalculateWidth,
    recalculateHeight: recalculateHeight,
    matchRowHeight: matchRowHeight
  };

  var percentageSize = function (width, element) {
    var floatWidth = parseFloat(width);
    var pixelWidth = $_7wd8l4lsjcg89drk.get(element);
    var getCellDelta = function (delta) {
      return delta / pixelWidth * 100;
    };
    var singleColumnWidth = function (width, _delta) {
      return [100 - width];
    };
    var minCellWidth = function () {
      return $_at5adomyjcg89dxs.minWidth() / pixelWidth * 100;
    };
    var setTableWidth = function (table, _newWidths, delta) {
      var total = floatWidth + delta;
      $_58huxtlojcg89dqw.setPercentageWidth(table, total);
    };
    return {
      width: $_3z1bpnjhjcg89dgu.constant(floatWidth),
      pixelWidth: $_3z1bpnjhjcg89dgu.constant(pixelWidth),
      getWidths: $_dmxnypmxjcg89dxc.getPercentageWidths,
      getCellDelta: getCellDelta,
      singleColumnWidth: singleColumnWidth,
      minCellWidth: minCellWidth,
      setElementWidth: $_58huxtlojcg89dqw.setPercentageWidth,
      setTableWidth: setTableWidth
    };
  };
  var pixelSize = function (width) {
    var intWidth = parseInt(width, 10);
    var getCellDelta = $_3z1bpnjhjcg89dgu.identity;
    var singleColumnWidth = function (width, delta) {
      var newNext = Math.max($_at5adomyjcg89dxs.minWidth(), width + delta);
      return [newNext - width];
    };
    var setTableWidth = function (table, newWidths, _delta) {
      var total = $_9786xxjfjcg89dgm.foldr(newWidths, function (b, a) {
        return b + a;
      }, 0);
      $_58huxtlojcg89dqw.setPixelWidth(table, total);
    };
    return {
      width: $_3z1bpnjhjcg89dgu.constant(intWidth),
      pixelWidth: $_3z1bpnjhjcg89dgu.constant(intWidth),
      getWidths: $_dmxnypmxjcg89dxc.getPixelWidths,
      getCellDelta: getCellDelta,
      singleColumnWidth: singleColumnWidth,
      minCellWidth: $_at5adomyjcg89dxs.minWidth,
      setElementWidth: $_58huxtlojcg89dqw.setPixelWidth,
      setTableWidth: setTableWidth
    };
  };
  var chooseSize = function (element, width) {
    if ($_58huxtlojcg89dqw.percentageBasedSizeRegex().test(width)) {
      var percentMatch = $_58huxtlojcg89dqw.percentageBasedSizeRegex().exec(width);
      return percentageSize(percentMatch[1], element);
    } else if ($_58huxtlojcg89dqw.pixelBasedSizeRegex().test(width)) {
      var pixelMatch = $_58huxtlojcg89dqw.pixelBasedSizeRegex().exec(width);
      return pixelSize(pixelMatch[1]);
    } else {
      var fallbackWidth = $_7wd8l4lsjcg89drk.get(element);
      return pixelSize(fallbackWidth);
    }
  };
  var getTableSize = function (element) {
    var width = $_58huxtlojcg89dqw.getRawWidth(element);
    return width.fold(function () {
      var fallbackWidth = $_7wd8l4lsjcg89drk.get(element);
      return pixelSize(fallbackWidth);
    }, function (width) {
      return chooseSize(element, width);
    });
  };
  var $_1mc6rnn0jcg89dy8 = { getTableSize: getTableSize };

  var getWarehouse$1 = function (list) {
    return $_74qbohknjcg89dl3.generate(list);
  };
  var sumUp = function (newSize) {
    return $_9786xxjfjcg89dgm.foldr(newSize, function (b, a) {
      return b + a;
    }, 0);
  };
  var getTableWarehouse = function (table) {
    var list = $_28wd6ujpjcg89dhi.fromTable(table);
    return getWarehouse$1(list);
  };
  var adjustWidth = function (table, delta, index, direction) {
    var tableSize = $_1mc6rnn0jcg89dy8.getTableSize(table);
    var step = tableSize.getCellDelta(delta);
    var warehouse = getTableWarehouse(table);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);
    var deltas = $_4qposwmvjcg89dx5.determine(widths, index, step, tableSize);
    var newWidths = $_9786xxjfjcg89dgm.map(deltas, function (dx, i) {
      return dx + widths[i];
    });
    var newSizes = $_1wnyhmzjcg89dy1.recalculateWidth(warehouse, newWidths);
    $_9786xxjfjcg89dgm.each(newSizes, function (cell) {
      tableSize.setElementWidth(cell.element(), cell.width());
    });
    if (index === warehouse.grid().columns() - 1) {
      tableSize.setTableWidth(table, newWidths, step);
    }
  };
  var adjustHeight = function (table, delta, index, direction) {
    var warehouse = getTableWarehouse(table);
    var heights = $_dmxnypmxjcg89dxc.getPixelHeights(warehouse, direction);
    var newHeights = $_9786xxjfjcg89dgm.map(heights, function (dy, i) {
      return index === i ? Math.max(delta + dy, $_at5adomyjcg89dxs.minHeight()) : dy;
    });
    var newCellSizes = $_1wnyhmzjcg89dy1.recalculateHeight(warehouse, newHeights);
    var newRowSizes = $_1wnyhmzjcg89dy1.matchRowHeight(warehouse, newHeights);
    $_9786xxjfjcg89dgm.each(newRowSizes, function (row) {
      $_58huxtlojcg89dqw.setHeight(row.element(), row.height());
    });
    $_9786xxjfjcg89dgm.each(newCellSizes, function (cell) {
      $_58huxtlojcg89dqw.setHeight(cell.element(), cell.height());
    });
    var total = sumUp(newHeights);
    $_58huxtlojcg89dqw.setHeight(table, total);
  };
  var adjustWidthTo = function (table, list, direction) {
    var tableSize = $_1mc6rnn0jcg89dy8.getTableSize(table);
    var warehouse = getWarehouse$1(list);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);
    var newSizes = $_1wnyhmzjcg89dy1.recalculateWidth(warehouse, widths);
    $_9786xxjfjcg89dgm.each(newSizes, function (cell) {
      tableSize.setElementWidth(cell.element(), cell.width());
    });
    var total = $_9786xxjfjcg89dgm.foldr(widths, function (b, a) {
      return a + b;
    }, 0);
    if (newSizes.length > 0) {
      tableSize.setElementWidth(table, total);
    }
  };
  var $_cifd2nmujcg89dx1 = {
    adjustWidth: adjustWidth,
    adjustHeight: adjustHeight,
    adjustWidthTo: adjustWidthTo
  };

  var prune = function (table) {
    var cells = $_5igemtjrjcg89dhs.cells(table);
    if (cells.length === 0)
      $_9fofwxkrjcg89dlq.remove(table);
  };
  var outcome = $_mgt0hjkjcg89dhb.immutable('grid', 'cursor');
  var elementFromGrid = function (grid, row, column) {
    return findIn(grid, row, column).orThunk(function () {
      return findIn(grid, 0, 0);
    });
  };
  var findIn = function (grid, row, column) {
    return $_gj9ujrjgjcg89dgs.from(grid[row]).bind(function (r) {
      return $_gj9ujrjgjcg89dgs.from(r.cells()[column]).bind(function (c) {
        return $_gj9ujrjgjcg89dgs.from(c.element());
      });
    });
  };
  var bundle = function (grid, row, column) {
    return outcome(grid, findIn(grid, row, column));
  };
  var uniqueRows = function (details) {
    return $_9786xxjfjcg89dgm.foldl(details, function (rest, detail) {
      return $_9786xxjfjcg89dgm.exists(rest, function (currentDetail) {
        return currentDetail.row() === detail.row();
      }) ? rest : rest.concat([detail]);
    }, []).sort(function (detailA, detailB) {
      return detailA.row() - detailB.row();
    });
  };
  var uniqueColumns = function (details) {
    return $_9786xxjfjcg89dgm.foldl(details, function (rest, detail) {
      return $_9786xxjfjcg89dgm.exists(rest, function (currentDetail) {
        return currentDetail.column() === detail.column();
      }) ? rest : rest.concat([detail]);
    }, []).sort(function (detailA, detailB) {
      return detailA.column() - detailB.column();
    });
  };
  var insertRowBefore = function (grid, detail, comparator, genWrappers) {
    var example = detail.row();
    var targetIndex = detail.row();
    var newGrid = $_bu74msjcg89dwu.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, targetIndex, detail.column());
  };
  var insertRowsBefore = function (grid, details, comparator, genWrappers) {
    var example = details[0].row();
    var targetIndex = details[0].row();
    var rows = uniqueRows(details);
    var newGrid = $_9786xxjfjcg89dgm.foldl(rows, function (newGrid, _row) {
      return $_bu74msjcg89dwu.insertRowAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, targetIndex, details[0].column());
  };
  var insertRowAfter = function (grid, detail, comparator, genWrappers) {
    var example = detail.row();
    var targetIndex = detail.row() + detail.rowspan();
    var newGrid = $_bu74msjcg89dwu.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, targetIndex, detail.column());
  };
  var insertRowsAfter = function (grid, details, comparator, genWrappers) {
    var rows = uniqueRows(details);
    var example = rows[rows.length - 1].row();
    var targetIndex = rows[rows.length - 1].row() + rows[rows.length - 1].rowspan();
    var newGrid = $_9786xxjfjcg89dgm.foldl(rows, function (newGrid, _row) {
      return $_bu74msjcg89dwu.insertRowAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, targetIndex, details[0].column());
  };
  var insertColumnBefore = function (grid, detail, comparator, genWrappers) {
    var example = detail.column();
    var targetIndex = detail.column();
    var newGrid = $_bu74msjcg89dwu.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), targetIndex);
  };
  var insertColumnsBefore = function (grid, details, comparator, genWrappers) {
    var columns = uniqueColumns(details);
    var example = columns[0].column();
    var targetIndex = columns[0].column();
    var newGrid = $_9786xxjfjcg89dgm.foldl(columns, function (newGrid, _row) {
      return $_bu74msjcg89dwu.insertColumnAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, details[0].row(), targetIndex);
  };
  var insertColumnAfter = function (grid, detail, comparator, genWrappers) {
    var example = detail.column();
    var targetIndex = detail.column() + detail.colspan();
    var newGrid = $_bu74msjcg89dwu.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), targetIndex);
  };
  var insertColumnsAfter = function (grid, details, comparator, genWrappers) {
    var example = details[details.length - 1].column();
    var targetIndex = details[details.length - 1].column() + details[details.length - 1].colspan();
    var columns = uniqueColumns(details);
    var newGrid = $_9786xxjfjcg89dgm.foldl(columns, function (newGrid, _row) {
      return $_bu74msjcg89dwu.insertColumnAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, details[0].row(), targetIndex);
  };
  var makeRowHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8xlv63mtjcg89dwy.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var makeColumnHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8xlv63mtjcg89dwy.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var unmakeRowHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8xlv63mtjcg89dwy.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var unmakeColumnHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_8xlv63mtjcg89dwy.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var splitCellIntoColumns = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_bu74msjcg89dwu.splitCellIntoColumns(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var splitCellIntoRows = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_bu74msjcg89dwu.splitCellIntoRows(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var eraseColumns = function (grid, details, comparator, _genWrappers) {
    var columns = uniqueColumns(details);
    var newGrid = $_bu74msjcg89dwu.deleteColumnsAt(grid, columns[0].column(), columns[columns.length - 1].column());
    var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
    return outcome(newGrid, cursor);
  };
  var eraseRows = function (grid, details, comparator, _genWrappers) {
    var rows = uniqueRows(details);
    var newGrid = $_bu74msjcg89dwu.deleteRowsAt(grid, rows[0].row(), rows[rows.length - 1].row());
    var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
    return outcome(newGrid, cursor);
  };
  var mergeCells = function (grid, mergable, comparator, _genWrappers) {
    var cells = mergable.cells();
    $_92nqf5m4jcg89dt5.merge(cells);
    var newGrid = $_8iciakmrjcg89dwp.merge(grid, mergable.bounds(), comparator, $_3z1bpnjhjcg89dgu.constant(cells[0]));
    return outcome(newGrid, $_gj9ujrjgjcg89dgs.from(cells[0]));
  };
  var unmergeCells = function (grid, unmergable, comparator, genWrappers) {
    var newGrid = $_9786xxjfjcg89dgm.foldr(unmergable, function (b, cell) {
      return $_8iciakmrjcg89dwp.unmerge(b, cell, comparator, genWrappers.combine(cell));
    }, grid);
    return outcome(newGrid, $_gj9ujrjgjcg89dgs.from(unmergable[0]));
  };
  var pasteCells = function (grid, pasteDetails, comparator, genWrappers) {
    var gridify = function (table, generators) {
      var list = $_28wd6ujpjcg89dhi.fromTable(table);
      var wh = $_74qbohknjcg89dl3.generate(list);
      return $_a2vcqqmajcg89du9.toGrid(wh, generators, true);
    };
    var gridB = gridify(pasteDetails.clipboard(), pasteDetails.generators());
    var startAddress = $_fmvzq0jqjcg89dhq.address(pasteDetails.row(), pasteDetails.column());
    var mergedGrid = $_93xao1mojcg89dwa.merge(startAddress, grid, gridB, pasteDetails.generators(), comparator);
    return mergedGrid.fold(function () {
      return outcome(grid, $_gj9ujrjgjcg89dgs.some(pasteDetails.element()));
    }, function (nuGrid) {
      var cursor = elementFromGrid(nuGrid, pasteDetails.row(), pasteDetails.column());
      return outcome(nuGrid, cursor);
    });
  };
  var gridifyRows = function (rows, generators, example) {
    var pasteDetails = $_28wd6ujpjcg89dhi.fromPastedRows(rows, example);
    var wh = $_74qbohknjcg89dl3.generate(pasteDetails);
    return $_a2vcqqmajcg89du9.toGrid(wh, generators, true);
  };
  var pasteRowsBefore = function (grid, pasteDetails, comparator, genWrappers) {
    var example = grid[pasteDetails.cells[0].row()];
    var index = pasteDetails.cells[0].row();
    var gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
    var mergedGrid = $_93xao1mojcg89dwa.insert(index, grid, gridB, pasteDetails.generators(), comparator);
    var cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
    return outcome(mergedGrid, cursor);
  };
  var pasteRowsAfter = function (grid, pasteDetails, comparator, genWrappers) {
    var example = grid[pasteDetails.cells[0].row()];
    var index = pasteDetails.cells[pasteDetails.cells.length - 1].row() + pasteDetails.cells[pasteDetails.cells.length - 1].rowspan();
    var gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
    var mergedGrid = $_93xao1mojcg89dwa.insert(index, grid, gridB, pasteDetails.generators(), comparator);
    var cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
    return outcome(mergedGrid, cursor);
  };
  var resize = $_cifd2nmujcg89dx1.adjustWidthTo;
  var $_1nflymm0jcg89dsd = {
    insertRowBefore: $_9hqf5dm7jcg89dto.run(insertRowBefore, $_9hqf5dm7jcg89dto.onCell, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    insertRowsBefore: $_9hqf5dm7jcg89dto.run(insertRowsBefore, $_9hqf5dm7jcg89dto.onCells, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    insertRowAfter: $_9hqf5dm7jcg89dto.run(insertRowAfter, $_9hqf5dm7jcg89dto.onCell, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    insertRowsAfter: $_9hqf5dm7jcg89dto.run(insertRowsAfter, $_9hqf5dm7jcg89dto.onCells, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    insertColumnBefore: $_9hqf5dm7jcg89dto.run(insertColumnBefore, $_9hqf5dm7jcg89dto.onCell, resize, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    insertColumnsBefore: $_9hqf5dm7jcg89dto.run(insertColumnsBefore, $_9hqf5dm7jcg89dto.onCells, resize, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    insertColumnAfter: $_9hqf5dm7jcg89dto.run(insertColumnAfter, $_9hqf5dm7jcg89dto.onCell, resize, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    insertColumnsAfter: $_9hqf5dm7jcg89dto.run(insertColumnsAfter, $_9hqf5dm7jcg89dto.onCells, resize, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    splitCellIntoColumns: $_9hqf5dm7jcg89dto.run(splitCellIntoColumns, $_9hqf5dm7jcg89dto.onCell, resize, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    splitCellIntoRows: $_9hqf5dm7jcg89dto.run(splitCellIntoRows, $_9hqf5dm7jcg89dto.onCell, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    eraseColumns: $_9hqf5dm7jcg89dto.run(eraseColumns, $_9hqf5dm7jcg89dto.onCells, resize, prune, $_2ld8zwm1jcg89dsp.modification),
    eraseRows: $_9hqf5dm7jcg89dto.run(eraseRows, $_9hqf5dm7jcg89dto.onCells, $_3z1bpnjhjcg89dgu.noop, prune, $_2ld8zwm1jcg89dsp.modification),
    makeColumnHeader: $_9hqf5dm7jcg89dto.run(makeColumnHeader, $_9hqf5dm7jcg89dto.onCell, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.transform('row', 'th')),
    unmakeColumnHeader: $_9hqf5dm7jcg89dto.run(unmakeColumnHeader, $_9hqf5dm7jcg89dto.onCell, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.transform(null, 'td')),
    makeRowHeader: $_9hqf5dm7jcg89dto.run(makeRowHeader, $_9hqf5dm7jcg89dto.onCell, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.transform('col', 'th')),
    unmakeRowHeader: $_9hqf5dm7jcg89dto.run(unmakeRowHeader, $_9hqf5dm7jcg89dto.onCell, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.transform(null, 'td')),
    mergeCells: $_9hqf5dm7jcg89dto.run(mergeCells, $_9hqf5dm7jcg89dto.onMergable, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.merging),
    unmergeCells: $_9hqf5dm7jcg89dto.run(unmergeCells, $_9hqf5dm7jcg89dto.onUnmergable, resize, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.merging),
    pasteCells: $_9hqf5dm7jcg89dto.run(pasteCells, $_9hqf5dm7jcg89dto.onPaste, resize, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    pasteRowsBefore: $_9hqf5dm7jcg89dto.run(pasteRowsBefore, $_9hqf5dm7jcg89dto.onPasteRows, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification),
    pasteRowsAfter: $_9hqf5dm7jcg89dto.run(pasteRowsAfter, $_9hqf5dm7jcg89dto.onPasteRows, $_3z1bpnjhjcg89dgu.noop, $_3z1bpnjhjcg89dgu.noop, $_2ld8zwm1jcg89dsp.modification)
  };

  var getBody$1 = function (editor) {
    return $_a8yw3ijujcg89dik.fromDom(editor.getBody());
  };
  var getIsRoot = function (editor) {
    return function (element) {
      return $_fqkoktjyjcg89diy.eq(element, getBody$1(editor));
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
  var $_9sl17zn1jcg89dyf = {
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
    return $_3m41takojcg89dla.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_eym85cn3jcg89dyp = {
    onDirection: onDirection,
    getDirection: getDirection
  };

  var ltr$1 = { isRtl: $_3z1bpnjhjcg89dgu.constant(false) };
  var rtl$1 = { isRtl: $_3z1bpnjhjcg89dgu.constant(true) };
  var directionAt = function (element) {
    var dir = $_eym85cn3jcg89dyp.getDirection(element);
    return dir === 'rtl' ? rtl$1 : ltr$1;
  };
  var $_4ff18n2jcg89dyk = { directionAt: directionAt };

  var TableActions = function (editor, lazyWire) {
    var isTableBody = function (editor) {
      return $_a7udttkgjcg89dkj.name($_9sl17zn1jcg89dyf.getBody(editor)) === 'table';
    };
    var lastRowGuard = function (table) {
      var size = $_f5b255lzjcg89dsa.getGridSize(table);
      return isTableBody(editor) === false || size.rows() > 1;
    };
    var lastColumnGuard = function (table) {
      var size = $_f5b255lzjcg89dsa.getGridSize(table);
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
    var cloneFormats = $_gj9ujrjgjcg89dgs.from(cloneFormatsArray);
    var execute = function (operation, guard, mutate, lazyWire) {
      return function (table, target) {
        var dataStyleCells = $_6f7vtwkhjcg89dkl.descendants(table, 'td[data-mce-style],th[data-mce-style]');
        $_9786xxjfjcg89dgm.each(dataStyleCells, function (cell) {
          $_d6i8c7kfjcg89dkd.remove(cell, 'data-mce-style');
        });
        var wire = lazyWire();
        var doc = $_a8yw3ijujcg89dik.fromDom(editor.getDoc());
        var direction = TableDirection($_4ff18n2jcg89dyk.directionAt);
        var generators = $_2zlupktjcg89dlx.cellOperations(mutate, doc, cloneFormats);
        return guard(table) ? operation(wire, table, target, generators, direction).bind(function (result) {
          $_9786xxjfjcg89dgm.each(result.newRows(), function (row) {
            fireNewRow(row);
          });
          $_9786xxjfjcg89dgm.each(result.newCells(), function (cell) {
            fireNewCell(cell);
          });
          return result.cursor().map(function (cell) {
            var rng = editor.dom.createRng();
            rng.setStart(cell.dom(), 0);
            rng.setEnd(cell.dom(), 0);
            return rng;
          });
        }) : $_gj9ujrjgjcg89dgs.none();
      };
    };
    var deleteRow = execute($_1nflymm0jcg89dsd.eraseRows, lastRowGuard, $_3z1bpnjhjcg89dgu.noop, lazyWire);
    var deleteColumn = execute($_1nflymm0jcg89dsd.eraseColumns, lastColumnGuard, $_3z1bpnjhjcg89dgu.noop, lazyWire);
    var insertRowsBefore = execute($_1nflymm0jcg89dsd.insertRowsBefore, $_3z1bpnjhjcg89dgu.always, $_3z1bpnjhjcg89dgu.noop, lazyWire);
    var insertRowsAfter = execute($_1nflymm0jcg89dsd.insertRowsAfter, $_3z1bpnjhjcg89dgu.always, $_3z1bpnjhjcg89dgu.noop, lazyWire);
    var insertColumnsBefore = execute($_1nflymm0jcg89dsd.insertColumnsBefore, $_3z1bpnjhjcg89dgu.always, $_cj8e57lnjcg89dqu.halve, lazyWire);
    var insertColumnsAfter = execute($_1nflymm0jcg89dsd.insertColumnsAfter, $_3z1bpnjhjcg89dgu.always, $_cj8e57lnjcg89dqu.halve, lazyWire);
    var mergeCells = execute($_1nflymm0jcg89dsd.mergeCells, $_3z1bpnjhjcg89dgu.always, $_3z1bpnjhjcg89dgu.noop, lazyWire);
    var unmergeCells = execute($_1nflymm0jcg89dsd.unmergeCells, $_3z1bpnjhjcg89dgu.always, $_3z1bpnjhjcg89dgu.noop, lazyWire);
    var pasteRowsBefore = execute($_1nflymm0jcg89dsd.pasteRowsBefore, $_3z1bpnjhjcg89dgu.always, $_3z1bpnjhjcg89dgu.noop, lazyWire);
    var pasteRowsAfter = execute($_1nflymm0jcg89dsd.pasteRowsAfter, $_3z1bpnjhjcg89dgu.always, $_3z1bpnjhjcg89dgu.noop, lazyWire);
    var pasteCells = execute($_1nflymm0jcg89dsd.pasteCells, $_3z1bpnjhjcg89dgu.always, $_3z1bpnjhjcg89dgu.noop, lazyWire);
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
    var list = $_28wd6ujpjcg89dhi.fromTable(table);
    var house = $_74qbohknjcg89dl3.generate(list);
    var details = $_9hqf5dm7jcg89dto.onCells(house, target);
    return details.map(function (selectedCells) {
      var grid = $_a2vcqqmajcg89du9.toGrid(house, generators, false);
      var slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
      var slicedDetails = $_9hqf5dm7jcg89dto.toDetailList(slicedGrid, generators);
      return $_3gv68umdjcg89duk.copy(slicedDetails);
    });
  };
  var $_eb41udn5jcg89dz6 = { copyRows: copyRows };

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
  var $_aeulf8n9jcg89dzl = {
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
      css.width = data.width ? $_9sl17zn1jcg89dyf.addSizeSuffix(data.width) : '';
      css.height = data.height ? $_9sl17zn1jcg89dyf.addSizeSuffix(data.height) : '';
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
      defaults: { onchange: $_3z1bpnjhjcg89dgu.curry(updateStyleField, editor) },
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
              onselect: $_3z1bpnjhjcg89dgu.curry(updateStyleField, editor),
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
  var $_7v5efhnajcg89dzn = {
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
      cellpadding: dom.getAttrib(tableElm, 'data-mce-cell-padding') || dom.getAttrib(tableElm, 'cellpadding') || $_aeulf8n9jcg89dzl.getTDTHOverallStyle(editor.dom, tableElm, 'padding'),
      border: dom.getAttrib(tableElm, 'data-mce-border') || dom.getAttrib(tableElm, 'border') || $_aeulf8n9jcg89dzl.getTDTHOverallStyle(editor.dom, tableElm, 'border'),
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
      Tools.extend(data, $_7v5efhnajcg89dzn.extractAdvancedStyles(dom, tableElm));
    }
    return data;
  };
  var applyDataToElement = function (editor, tableElm, data) {
    var dom = editor.dom;
    var attrs = {};
    var styles = {};
    attrs.class = data.class;
    styles.height = $_9sl17zn1jcg89dyf.addSizeSuffix(data.height);
    if (dom.getAttrib(tableElm, 'width') && !editor.settings.table_style_by_css) {
      attrs.width = $_9sl17zn1jcg89dyf.removePxSuffix(data.width);
    } else {
      styles.width = $_9sl17zn1jcg89dyf.addSizeSuffix(data.width);
    }
    if (editor.settings.table_style_by_css) {
      styles['border-width'] = $_9sl17zn1jcg89dyf.addSizeSuffix(data.border);
      styles['border-spacing'] = $_9sl17zn1jcg89dyf.addSizeSuffix(data.cellspacing);
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
            'border-width': $_9sl17zn1jcg89dyf.addSizeSuffix(data.border),
            'border-color': data.borderColor,
            'padding': $_9sl17zn1jcg89dyf.addSizeSuffix(data.cellpadding)
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
    $_7v5efhnajcg89dzn.updateStyleField(editor, evt);
    data = evt.control.rootControl.toJSON();
    if (data.class === false) {
      delete data.class;
    }
    editor.undoManager.transact(function () {
      if (!tableElm) {
        tableElm = $_c7vlp7lijcg89dpt.insert(editor, data.cols || 1, data.rows || 1);
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
      $_aeulf8n9jcg89dzl.unApplyAlign(editor, tableElm);
      if (data.align) {
        $_aeulf8n9jcg89dzl.applyAlign(editor, tableElm, data.align);
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
        values: $_7v5efhnajcg89dzn.buildListItems(editor.settings.table_class_list, function (item) {
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
              onchange: $_3z1bpnjhjcg89dgu.curry($_7v5efhnajcg89dzn.updateStyleField, editor)
            },
            {
              label: 'Height',
              name: 'height',
              onchange: $_3z1bpnjhjcg89dgu.curry($_7v5efhnajcg89dzn.updateStyleField, editor)
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
              onchange: $_3z1bpnjhjcg89dgu.curry($_7v5efhnajcg89dzn.updateStyleField, editor)
            },
            {
              label: 'Height',
              name: 'height',
              onchange: $_3z1bpnjhjcg89dgu.curry($_7v5efhnajcg89dzn.updateStyleField, editor)
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
          $_7v5efhnajcg89dzn.createStyleForm(editor)
        ],
        onsubmit: $_3z1bpnjhjcg89dgu.curry(onSubmitTableForm, editor, tableElm)
      });
    } else {
      editor.windowManager.open({
        title: 'Table properties',
        data: data,
        body: generalTableForm,
        onsubmit: $_3z1bpnjhjcg89dgu.curry(onSubmitTableForm, editor, tableElm)
      });
    }
  };
  var $_2nublxn7jcg89dzc = { open: open };

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
      Tools.extend(data, $_7v5efhnajcg89dzn.extractAdvancedStyles(dom, elm));
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
    $_7v5efhnajcg89dzn.updateStyleField(editor, evt);
    data = evt.control.rootControl.toJSON();
    editor.undoManager.transact(function () {
      Tools.each(rows, function (rowElm) {
        setAttrib(rowElm, 'scope', data.scope);
        setAttrib(rowElm, 'style', data.style);
        setAttrib(rowElm, 'class', data.class);
        setStyle(rowElm, 'height', $_9sl17zn1jcg89dyf.addSizeSuffix(data.height));
        if (data.type !== rowElm.parentNode.nodeName.toLowerCase()) {
          switchRowType(editor.dom, rowElm, data.type);
        }
        if (rows.length === 1) {
          $_aeulf8n9jcg89dzl.unApplyAlign(editor, rowElm);
        }
        if (data.align) {
          $_aeulf8n9jcg89dzl.applyAlign(editor, rowElm, data.align);
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
    tableElm = editor.dom.getParent(editor.selection.getStart(), 'table');
    cellElm = editor.dom.getParent(editor.selection.getStart(), 'td,th');
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
        values: $_7v5efhnajcg89dzn.buildListItems(editor.settings.table_row_class_list, function (item) {
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
          $_7v5efhnajcg89dzn.createStyleForm(dom)
        ],
        onsubmit: $_3z1bpnjhjcg89dgu.curry(onSubmitRowForm, editor, rows)
      });
    } else {
      editor.windowManager.open({
        title: 'Row properties',
        data: data,
        body: generalRowForm,
        onsubmit: $_3z1bpnjhjcg89dgu.curry(onSubmitRowForm, editor, rows)
      });
    }
  };
  var $_f5p3ijnbjcg89dzs = { open: open$1 };

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
      Tools.extend(data, $_7v5efhnajcg89dzn.extractAdvancedStyles(dom, elm));
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
    $_7v5efhnajcg89dzn.updateStyleField(editor, evt);
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
        setStyle(cellElm, 'width', $_9sl17zn1jcg89dyf.addSizeSuffix(data.width));
        setStyle(cellElm, 'height', $_9sl17zn1jcg89dyf.addSizeSuffix(data.height));
        if (data.type && cellElm.nodeName.toLowerCase() !== data.type) {
          cellElm = dom.rename(cellElm, data.type);
        }
        if (cells.length === 1) {
          $_aeulf8n9jcg89dzl.unApplyAlign(editor, cellElm);
          $_aeulf8n9jcg89dzl.unApplyVAlign(editor, cellElm);
        }
        if (data.align) {
          $_aeulf8n9jcg89dzl.applyAlign(editor, cellElm, data.align);
        }
        if (data.valign) {
          $_aeulf8n9jcg89dzl.applyVAlign(editor, cellElm, data.valign);
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
        values: $_7v5efhnajcg89dzn.buildListItems(editor.settings.table_cell_class_list, function (item) {
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
              onchange: $_3z1bpnjhjcg89dgu.curry($_7v5efhnajcg89dzn.updateStyleField, editor)
            },
            {
              label: 'Height',
              name: 'height',
              onchange: $_3z1bpnjhjcg89dgu.curry($_7v5efhnajcg89dzn.updateStyleField, editor)
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
          $_7v5efhnajcg89dzn.createStyleForm(editor)
        ],
        onsubmit: $_3z1bpnjhjcg89dgu.curry(onSubmitCellForm, editor, cells)
      });
    } else {
      editor.windowManager.open({
        title: 'Cell properties',
        data: data,
        body: generalCellForm,
        onsubmit: $_3z1bpnjhjcg89dgu.curry(onSubmitCellForm, editor, cells)
      });
    }
  };
  var $_29r92xncjcg89e0a = { open: open$2 };

  var each$3 = Tools.each;
  var clipboardRows = $_gj9ujrjgjcg89dgs.none();
  var getClipboardRows = function () {
    return clipboardRows.fold(function () {
      return;
    }, function (rows) {
      return $_9786xxjfjcg89dgm.map(rows, function (row) {
        return row.dom();
      });
    });
  };
  var setClipboardRows = function (rows) {
    var sugarRows = $_9786xxjfjcg89dgm.map(rows, $_a8yw3ijujcg89dik.fromDom);
    clipboardRows = $_gj9ujrjgjcg89dgs.from(sugarRows);
  };
  var registerCommands = function (editor, actions, cellSelection, selections) {
    var isRoot = $_9sl17zn1jcg89dyf.getIsRoot(editor);
    var eraseTable = function () {
      var cell = $_a8yw3ijujcg89dik.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      var table = $_5igemtjrjcg89dhs.table(cell, isRoot);
      table.filter($_3z1bpnjhjcg89dgu.not(isRoot)).each(function (table) {
        var cursor = $_a8yw3ijujcg89dik.fromText('');
        $_2xc490kqjcg89dln.after(table, cursor);
        $_9fofwxkrjcg89dlq.remove(table);
        var rng = editor.dom.createRng();
        rng.setStart(cursor.dom(), 0);
        rng.setEnd(cursor.dom(), 0);
        editor.selection.setRng(rng);
      });
    };
    var getSelectionStartCell = function () {
      return $_a8yw3ijujcg89dik.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
    };
    var getTableFromCell = function (cell) {
      return $_5igemtjrjcg89dhs.table(cell, isRoot);
    };
    var actOnSelection = function (execute) {
      var cell = getSelectionStartCell();
      var table = getTableFromCell(cell);
      table.each(function (table) {
        var targets = $_1mg2tjl0jcg89dmz.forMenu(selections, table, cell);
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
        var doc = $_a8yw3ijujcg89dik.fromDom(editor.getDoc());
        var targets = $_1mg2tjl0jcg89dmz.forMenu(selections, table, cell);
        var generators = $_2zlupktjcg89dlx.cellOperations($_3z1bpnjhjcg89dgu.noop, doc, $_gj9ujrjgjcg89dgs.none());
        return $_eb41udn5jcg89dz6.copyRows(table, targets, generators);
      });
    };
    var pasteOnSelection = function (execute) {
      clipboardRows.each(function (rows) {
        var clonedRows = $_9786xxjfjcg89dgm.map(rows, function (row) {
          return $_58b4rtkujcg89dmj.deep(row);
        });
        var cell = getSelectionStartCell();
        var table = getTableFromCell(cell);
        table.bind(function (table) {
          var doc = $_a8yw3ijujcg89dik.fromDom(editor.getDoc());
          var generators = $_2zlupktjcg89dlx.paste(doc);
          var targets = $_1mg2tjl0jcg89dmz.pasteRows(selections, table, cell, clonedRows, generators);
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
      mceInsertTable: $_3z1bpnjhjcg89dgu.curry($_2nublxn7jcg89dzc.open, editor),
      mceTableProps: $_3z1bpnjhjcg89dgu.curry($_2nublxn7jcg89dzc.open, editor, true),
      mceTableRowProps: $_3z1bpnjhjcg89dgu.curry($_f5p3ijnbjcg89dzs.open, editor),
      mceTableCellProps: $_3z1bpnjhjcg89dgu.curry($_29r92xncjcg89e0a.open, editor)
    }, function (func, name) {
      editor.addCommand(name, function (ui, val) {
        func(val);
      });
    });
  };
  var $_bq1mz1n4jcg89dys = {
    registerCommands: registerCommands,
    getClipboardRows: getClipboardRows,
    setClipboardRows: setClipboardRows
  };

  var only$1 = function (element) {
    var parent = $_gj9ujrjgjcg89dgs.from(element.dom().documentElement).map($_a8yw3ijujcg89dik.fromDom).getOr(element);
    return {
      parent: $_3z1bpnjhjcg89dgu.constant(parent),
      view: $_3z1bpnjhjcg89dgu.constant(element),
      origin: $_3z1bpnjhjcg89dgu.constant(r(0, 0))
    };
  };
  var detached = function (editable, chrome) {
    var origin = $_3z1bpnjhjcg89dgu.curry($_41eijblwjcg89ds2.absolute, chrome);
    return {
      parent: $_3z1bpnjhjcg89dgu.constant(chrome),
      view: $_3z1bpnjhjcg89dgu.constant(editable),
      origin: origin
    };
  };
  var body$1 = function (editable, chrome) {
    return {
      parent: $_3z1bpnjhjcg89dgu.constant(chrome),
      view: $_3z1bpnjhjcg89dgu.constant(editable),
      origin: $_3z1bpnjhjcg89dgu.constant(r(0, 0))
    };
  };
  var $_5jpxmnnejcg89e0x = {
    only: only$1,
    detached: detached,
    body: body$1
  };

  var Event = function (fields) {
    var struct = $_mgt0hjkjcg89dhb.immutable.apply(null, fields);
    var handlers = [];
    var bind = function (handler) {
      if (handler === undefined) {
        throw 'Event bind error: undefined handler';
      }
      handlers.push(handler);
    };
    var unbind = function (handler) {
      handlers = $_9786xxjfjcg89dgm.filter(handlers, function (h) {
        return h !== handler;
      });
    };
    var trigger = function () {
      var event = struct.apply(null, arguments);
      $_9786xxjfjcg89dgm.each(handlers, function (handler) {
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
    var registry = $_7p93f5jjjcg89dh9.map(typeDefs, function (event) {
      return {
        bind: event.bind,
        unbind: event.unbind
      };
    });
    var trigger = $_7p93f5jjjcg89dh9.map(typeDefs, function (event) {
      return event.trigger;
    });
    return {
      registry: registry,
      trigger: trigger
    };
  };
  var $_3lbp7nnhjcg89e1c = { create: create };

  var mode = $_2ours6m3jcg89dt2.exactly([
    'compare',
    'extract',
    'mutate',
    'sink'
  ]);
  var sink$1 = $_2ours6m3jcg89dt2.exactly([
    'element',
    'start',
    'stop',
    'destroy'
  ]);
  var api$3 = $_2ours6m3jcg89dt2.exactly([
    'forceDrop',
    'drop',
    'move',
    'delayDrop'
  ]);
  var $_817v5nnljcg89e2g = {
    mode: mode,
    sink: sink$1,
    api: api$3
  };

  var styles$1 = $_79h836mjjcg89dw0.css('ephox-dragster');
  var $_47d6bhnnjcg89e32 = { resolve: styles$1.resolve };

  var Blocker = function (options) {
    var settings = $_5mlpg3m8jcg89du5.merge({ 'layerClass': $_47d6bhnnjcg89e32.resolve('blocker') }, options);
    var div = $_a8yw3ijujcg89dik.fromTag('div');
    $_d6i8c7kfjcg89dkd.set(div, 'role', 'presentation');
    $_3m41takojcg89dla.setAll(div, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%'
    });
    $_f0bxp7mkjcg89dw1.add(div, $_47d6bhnnjcg89e32.resolve('blocker'));
    $_f0bxp7mkjcg89dw1.add(div, settings.layerClass);
    var element = function () {
      return div;
    };
    var destroy = function () {
      $_9fofwxkrjcg89dlq.remove(div);
    };
    return {
      element: element,
      destroy: destroy
    };
  };

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': $_3z1bpnjhjcg89dgu.constant(target),
      'x': $_3z1bpnjhjcg89dgu.constant(x),
      'y': $_3z1bpnjhjcg89dgu.constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': $_3z1bpnjhjcg89dgu.constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = $_a8yw3ijujcg89dik.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = $_3z1bpnjhjcg89dgu.compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: $_3z1bpnjhjcg89dgu.curry(unbind, element, event, wrapped, useCapture) };
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
  var $_esmsx8npjcg89e38 = {
    bind: bind$2,
    capture: capture$1
  };

  var filter$1 = $_3z1bpnjhjcg89dgu.constant(true);
  var bind$1 = function (element, event, handler) {
    return $_esmsx8npjcg89e38.bind(element, event, filter$1, handler);
  };
  var capture = function (element, event, handler) {
    return $_esmsx8npjcg89e38.capture(element, event, filter$1, handler);
  };
  var $_3kzk93nojcg89e35 = {
    bind: bind$1,
    capture: capture
  };

  var compare = function (old, nu) {
    return r(nu.left() - old.left(), nu.top() - old.top());
  };
  var extract$1 = function (event) {
    return $_gj9ujrjgjcg89dgs.some(r(event.x(), event.y()));
  };
  var mutate$1 = function (mutation, info) {
    mutation.mutate(info.left(), info.top());
  };
  var sink = function (dragApi, settings) {
    var blocker = Blocker(settings);
    var mdown = $_3kzk93nojcg89e35.bind(blocker.element(), 'mousedown', dragApi.forceDrop);
    var mup = $_3kzk93nojcg89e35.bind(blocker.element(), 'mouseup', dragApi.drop);
    var mmove = $_3kzk93nojcg89e35.bind(blocker.element(), 'mousemove', dragApi.move);
    var mout = $_3kzk93nojcg89e35.bind(blocker.element(), 'mouseout', dragApi.delayDrop);
    var destroy = function () {
      blocker.destroy();
      mup.unbind();
      mmove.unbind();
      mout.unbind();
      mdown.unbind();
    };
    var start = function (parent) {
      $_2xc490kqjcg89dln.append(parent, blocker.element());
    };
    var stop = function () {
      $_9fofwxkrjcg89dlq.remove(blocker.element());
    };
    return $_817v5nnljcg89e2g.sink({
      element: blocker.element,
      start: start,
      stop: stop,
      destroy: destroy
    });
  };
  var MouseDrag = $_817v5nnljcg89e2g.mode({
    compare: compare,
    extract: extract$1,
    sink: sink,
    mutate: mutate$1
  });

  var InDrag = function () {
    var previous = $_gj9ujrjgjcg89dgs.none();
    var reset = function () {
      previous = $_gj9ujrjgjcg89dgs.none();
    };
    var update = function (mode, nu) {
      var result = previous.map(function (old) {
        return mode.compare(old, nu);
      });
      previous = $_gj9ujrjgjcg89dgs.some(nu);
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
    var events = $_3lbp7nnhjcg89e1c.create({ move: Event(['info']) });
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
      reset: $_3z1bpnjhjcg89dgu.noop
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
  var $_bqi8ytnujcg89e3p = {
    adaptable: adaptable,
    first: first$4,
    last: last$3
  };

  var setup = function (mutation, mode, settings) {
    var active = false;
    var events = $_3lbp7nnhjcg89e1c.create({
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
    var throttledDrop = $_bqi8ytnujcg89e3p.last(drop, 200);
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
    var sink = mode.sink($_817v5nnljcg89e2g.api({
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
  var $_g6za5qnqjcg89e3b = { setup: setup };

  var transform$1 = function (mutation, options) {
    var settings = options !== undefined ? options : {};
    var mode = settings.mode !== undefined ? settings.mode : MouseDrag;
    return $_g6za5qnqjcg89e3b.setup(mutation, mode, options);
  };
  var $_77fk86njjcg89e27 = { transform: transform$1 };

  var Mutation = function () {
    var events = $_3lbp7nnhjcg89e1c.create({
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
    var events = $_3lbp7nnhjcg89e1c.create({
      drag: Event([
        'xDelta',
        'yDelta',
        'target'
      ])
    });
    var target = $_gj9ujrjgjcg89dgs.none();
    var delegate = Mutation();
    delegate.events.drag.bind(function (event) {
      target.each(function (t) {
        events.trigger.drag(event.xDelta(), event.yDelta(), t);
      });
    });
    var assign = function (t) {
      target = $_gj9ujrjgjcg89dgs.some(t);
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
    return $_a6sun7kkjcg89dks.first(selector).isSome();
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_a6sun7kkjcg89dks.ancestor(scope, selector, isRoot).isSome();
  };
  var sibling$2 = function (scope, selector) {
    return $_a6sun7kkjcg89dks.sibling(scope, selector).isSome();
  };
  var child$3 = function (scope, selector) {
    return $_a6sun7kkjcg89dks.child(scope, selector).isSome();
  };
  var descendant$2 = function (scope, selector) {
    return $_a6sun7kkjcg89dks.descendant(scope, selector).isSome();
  };
  var closest$2 = function (scope, selector, isRoot) {
    return $_a6sun7kkjcg89dks.closest(scope, selector, isRoot).isSome();
  };
  var $_9w1atwnxjcg89e3z = {
    any: any,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var resizeBarDragging = $_4n60kjmijcg89dvy.resolve('resizer-bar-dragging');
  var BarManager = function (wire, direction, hdirection) {
    var mutation = BarMutation();
    var resizing = $_77fk86njjcg89e27.transform(mutation, {});
    var hoverTable = $_gj9ujrjgjcg89dgs.none();
    var getResizer = function (element, type) {
      return $_gj9ujrjgjcg89dgs.from($_d6i8c7kfjcg89dkd.get(element, type));
    };
    mutation.events.drag.bind(function (event) {
      getResizer(event.target(), 'data-row').each(function (_dataRow) {
        var currentRow = $_at5adomyjcg89dxs.getInt(event.target(), 'top');
        $_3m41takojcg89dla.set(event.target(), 'top', currentRow + event.yDelta() + 'px');
      });
      getResizer(event.target(), 'data-column').each(function (_dataCol) {
        var currentCol = $_at5adomyjcg89dxs.getInt(event.target(), 'left');
        $_3m41takojcg89dla.set(event.target(), 'left', currentCol + event.xDelta() + 'px');
      });
    });
    var getDelta = function (target, direction) {
      var newX = $_at5adomyjcg89dxs.getInt(target, direction);
      var oldX = parseInt($_d6i8c7kfjcg89dkd.get(target, 'data-initial-' + direction), 10);
      return newX - oldX;
    };
    resizing.events.stop.bind(function () {
      mutation.get().each(function (target) {
        hoverTable.each(function (table) {
          getResizer(target, 'data-row').each(function (row) {
            var delta = getDelta(target, 'top');
            $_d6i8c7kfjcg89dkd.remove(target, 'data-initial-top');
            events.trigger.adjustHeight(table, delta, parseInt(row, 10));
          });
          getResizer(target, 'data-column').each(function (column) {
            var delta = getDelta(target, 'left');
            $_d6i8c7kfjcg89dkd.remove(target, 'data-initial-left');
            events.trigger.adjustWidth(table, delta, parseInt(column, 10));
          });
          $_7gwmfimejcg89dv0.refresh(wire, table, hdirection, direction);
        });
      });
    });
    var handler = function (target, direction) {
      events.trigger.startAdjust();
      mutation.assign(target);
      $_d6i8c7kfjcg89dkd.set(target, 'data-initial-' + direction, parseInt($_3m41takojcg89dla.get(target, direction), 10));
      $_f0bxp7mkjcg89dw1.add(target, resizeBarDragging);
      $_3m41takojcg89dla.set(target, 'opacity', '0.2');
      resizing.go(wire.parent());
    };
    var mousedown = $_3kzk93nojcg89e35.bind(wire.parent(), 'mousedown', function (event) {
      if ($_7gwmfimejcg89dv0.isRowBar(event.target()))
        handler(event.target(), 'top');
      if ($_7gwmfimejcg89dv0.isColBar(event.target()))
        handler(event.target(), 'left');
    });
    var isRoot = function (e) {
      return $_fqkoktjyjcg89diy.eq(e, wire.view());
    };
    var mouseover = $_3kzk93nojcg89e35.bind(wire.view(), 'mouseover', function (event) {
      if ($_a7udttkgjcg89dkj.name(event.target()) === 'table' || $_9w1atwnxjcg89e3z.ancestor(event.target(), 'table', isRoot)) {
        hoverTable = $_a7udttkgjcg89dkj.name(event.target()) === 'table' ? $_gj9ujrjgjcg89dgs.some(event.target()) : $_a6sun7kkjcg89dks.ancestor(event.target(), 'table', isRoot);
        hoverTable.each(function (ht) {
          $_7gwmfimejcg89dv0.refresh(wire, ht, hdirection, direction);
        });
      } else if ($_9klllckjjcg89dko.inBody(event.target())) {
        $_7gwmfimejcg89dv0.destroy(wire);
      }
    });
    var destroy = function () {
      mousedown.unbind();
      mouseover.unbind();
      resizing.destroy();
      $_7gwmfimejcg89dv0.destroy(wire);
    };
    var refresh = function (tbl) {
      $_7gwmfimejcg89dv0.refresh(wire, tbl, hdirection, direction);
    };
    var events = $_3lbp7nnhjcg89e1c.create({
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
      hideBars: $_3z1bpnjhjcg89dgu.curry($_7gwmfimejcg89dv0.hide, wire),
      showBars: $_3z1bpnjhjcg89dgu.curry($_7gwmfimejcg89dv0.show, wire),
      events: events.registry
    };
  };

  var TableResize = function (wire, vdirection) {
    var hdirection = $_5e5maelvjcg89dro.height;
    var manager = BarManager(wire, vdirection, hdirection);
    var events = $_3lbp7nnhjcg89e1c.create({
      beforeResize: Event(['table']),
      afterResize: Event(['table']),
      startDrag: Event([])
    });
    manager.events.adjustHeight.bind(function (event) {
      events.trigger.beforeResize(event.table());
      var delta = hdirection.delta(event.delta(), event.table());
      $_cifd2nmujcg89dx1.adjustHeight(event.table(), delta, event.row(), hdirection);
      events.trigger.afterResize(event.table());
    });
    manager.events.startAdjust.bind(function (event) {
      events.trigger.startDrag();
    });
    manager.events.adjustWidth.bind(function (event) {
      events.trigger.beforeResize(event.table());
      var delta = vdirection.delta(event.delta(), event.table());
      $_cifd2nmujcg89dx1.adjustWidth(event.table(), delta, event.column(), vdirection);
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
    var container = $_a8yw3ijujcg89dik.fromTag('div');
    $_3m41takojcg89dla.setAll(container, {
      position: 'static',
      height: '0',
      width: '0',
      padding: '0',
      margin: '0',
      border: '0'
    });
    $_2xc490kqjcg89dln.append($_9klllckjjcg89dko.body(), container);
    return container;
  };
  var get$8 = function (editor, container) {
    return editor.inline ? $_5jpxmnnejcg89e0x.body($_9sl17zn1jcg89dyf.getBody(editor), createContainer()) : $_5jpxmnnejcg89e0x.only($_a8yw3ijujcg89dik.fromDom(editor.getDoc()));
  };
  var remove$6 = function (editor, wire) {
    if (editor.inline) {
      $_9fofwxkrjcg89dlq.remove(wire.parent());
    }
  };
  var $_3j6zvsnyjcg89e40 = {
    get: get$8,
    remove: remove$6
  };

  var ResizeHandler = function (editor) {
    var selectionRng = $_gj9ujrjgjcg89dgs.none();
    var resize = $_gj9ujrjgjcg89dgs.none();
    var wire = $_gj9ujrjgjcg89dgs.none();
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
      return wire.getOr($_5jpxmnnejcg89e0x.only($_a8yw3ijujcg89dik.fromDom(editor.getBody())));
    };
    var destroy = function () {
      resize.each(function (sz) {
        sz.destroy();
      });
      wire.each(function (w) {
        $_3j6zvsnyjcg89e40.remove(editor, w);
      });
    };
    editor.on('init', function () {
      var direction = TableDirection($_4ff18n2jcg89dyk.directionAt);
      var rawWire = $_3j6zvsnyjcg89e40.get(editor);
      wire = $_gj9ujrjgjcg89dgs.some(rawWire);
      if (editor.settings.object_resizing && editor.settings.table_resize_bars !== false && (editor.settings.object_resizing === true || editor.settings.object_resizing === 'table')) {
        var sz = TableResize(rawWire, direction);
        sz.on();
        sz.events.startDrag.bind(function (event) {
          selectionRng = $_gj9ujrjgjcg89dgs.some(editor.selection.getRng());
        });
        sz.events.afterResize.bind(function (event) {
          var table = event.table();
          var dataStyleCells = $_6f7vtwkhjcg89dkl.descendants(table, 'td[data-mce-style],th[data-mce-style]');
          $_9786xxjfjcg89dgm.each(dataStyleCells, function (cell) {
            $_d6i8c7kfjcg89dkd.remove(cell, 'data-mce-style');
          });
          selectionRng.each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
          });
          editor.undoManager.add();
        });
        resize = $_gj9ujrjgjcg89dgs.some(sz);
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
  var $_1wpmco1jcg89e58 = {
    none: none$2,
    first: first$5,
    middle: middle$1,
    last: last$4
  };

  var detect$4 = function (current, isRoot) {
    return $_5igemtjrjcg89dhs.table(current, isRoot).bind(function (table) {
      var all = $_5igemtjrjcg89dhs.cells(table);
      var index = $_9786xxjfjcg89dgm.findIndex(all, function (x) {
        return $_fqkoktjyjcg89diy.eq(current, x);
      });
      return index.map(function (ind) {
        return {
          index: $_3z1bpnjhjcg89dgu.constant(ind),
          all: $_3z1bpnjhjcg89dgu.constant(all)
        };
      });
    });
  };
  var next = function (current, isRoot) {
    var detection = detect$4(current, isRoot);
    return detection.fold(function () {
      return $_1wpmco1jcg89e58.none(current);
    }, function (info) {
      return info.index() + 1 < info.all().length ? $_1wpmco1jcg89e58.middle(current, info.all()[info.index() + 1]) : $_1wpmco1jcg89e58.last(current);
    });
  };
  var prev = function (current, isRoot) {
    var detection = detect$4(current, isRoot);
    return detection.fold(function () {
      return $_1wpmco1jcg89e58.none();
    }, function (info) {
      return info.index() - 1 >= 0 ? $_1wpmco1jcg89e58.middle(current, info.all()[info.index() - 1]) : $_1wpmco1jcg89e58.first(current);
    });
  };
  var $_395bq3o0jcg89e4x = {
    next: next,
    prev: prev
  };

  var adt = $_46qooqlhjcg89dpr.generate([
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
    return situ.fold($_3z1bpnjhjcg89dgu.identity, $_3z1bpnjhjcg89dgu.identity, $_3z1bpnjhjcg89dgu.identity);
  };
  var $_6lemaso3jcg89e5d = {
    before: adt.before,
    on: adt.on,
    after: adt.after,
    cata: cata$1,
    getStart: getStart$1
  };

  var type$2 = $_46qooqlhjcg89dpr.generate([
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
  var range$2 = $_mgt0hjkjcg89dhb.immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$2.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return $_a8yw3ijujcg89dik.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_6lemaso3jcg89e5d.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart(selection);
    return $_e07z69jwjcg89dip.defaultView(start);
  };
  var $_ddz9kfo2jcg89e59 = {
    domRange: type$2.domRange,
    relative: type$2.relative,
    exact: type$2.exact,
    exactFromRange: exactFromRange,
    range: range$2,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_e07z69jwjcg89dip.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return $_a8yw3ijujcg89dik.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_fqkoktjyjcg89diy.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_elt8k3o5jcg89e5o = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    $_9786xxjfjcg89dgm.each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return $_a8yw3ijujcg89dik.fromDom(fragment);
  };
  var $_3ayliro6jcg89e5r = { fromElements: fromElements };

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
    return $_a8yw3ijujcg89dik.fromDom(fragment);
  };
  var toRect = function (rect) {
    return {
      left: $_3z1bpnjhjcg89dgu.constant(rect.left),
      top: $_3z1bpnjhjcg89dgu.constant(rect.top),
      right: $_3z1bpnjhjcg89dgu.constant(rect.right),
      bottom: $_3z1bpnjhjcg89dgu.constant(rect.bottom),
      width: $_3z1bpnjhjcg89dgu.constant(rect.width),
      height: $_3z1bpnjhjcg89dgu.constant(rect.height)
    };
  };
  var getFirstRect$1 = function (rng) {
    var rects = rng.getClientRects();
    var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? $_gj9ujrjgjcg89dgs.some(rect).map(toRect) : $_gj9ujrjgjcg89dgs.none();
  };
  var getBounds$2 = function (rng) {
    var rect = rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? $_gj9ujrjgjcg89dgs.some(rect).map(toRect) : $_gj9ujrjgjcg89dgs.none();
  };
  var toString = function (rng) {
    return rng.toString();
  };
  var $_ap8pano7jcg89e5x = {
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

  var adt$1 = $_46qooqlhjcg89dpr.generate([
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
    return type($_a8yw3ijujcg89dik.fromDom(range.startContainer), range.startOffset, $_a8yw3ijujcg89dik.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: $_3z1bpnjhjcg89dgu.constant(rng),
          rtl: $_gj9ujrjgjcg89dgs.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: $_zksnkk4jcg89djb.cached(function () {
            return $_ap8pano7jcg89e5x.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: $_zksnkk4jcg89djb.cached(function () {
            return $_gj9ujrjgjcg89dgs.some($_ap8pano7jcg89e5x.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: $_zksnkk4jcg89djb.cached(function () {
            return $_ap8pano7jcg89e5x.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: $_zksnkk4jcg89djb.cached(function () {
            return $_gj9ujrjgjcg89dgs.some($_ap8pano7jcg89e5x.exactToNative(win, finish, foffset, start, soffset));
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
        return adt$1.rtl($_a8yw3ijujcg89dik.fromDom(rev.endContainer), rev.endOffset, $_a8yw3ijujcg89dik.fromDom(rev.startContainer), rev.startOffset);
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
  var $_b3o9hbo8jcg89e64 = {
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
  var $_au30zcobjcg89e6o = {
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
    var length = $_8lwn8skxjcg89dmq.get(textnode).length;
    var offset = $_au30zcobjcg89e6o.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate$1 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = $_6epu4cm9jcg89du6.findMap(rects, function (rect) {
      return $_au30zcobjcg89e6o.inRect(rect, x, y) ? $_gj9ujrjgjcg89dgs.some(rect) : $_gj9ujrjgjcg89dgs.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_fyuo4docjcg89e6q = { locate: locate$1 };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_e07z69jwjcg89dip.children(node);
    return $_6epu4cm9jcg89du6.findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_au30zcobjcg89e6o.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : $_gj9ujrjgjcg89dgs.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_a7udttkgjcg89dkj.isText(node) ? $_fyuo4docjcg89e6q.locate : searchInChildren;
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
  var $_73zvadoajcg89e6k = { locate: locate };

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
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_4u334mkvjcg89dml.first : $_4u334mkvjcg89dml.last;
    return f(node).map(function (target) {
      return createCollapsedNode(doc, target, collapseDirection);
    });
  };
  var locateInEmpty = function (doc, node, x) {
    var rect = node.dom().getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    return $_gj9ujrjgjcg89dgs.some(createCollapsedNode(doc, node, collapseDirection));
  };
  var search = function (doc, node, x) {
    var f = $_e07z69jwjcg89dip.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_89djnhodjcg89e6u = { search: search };

  var caretPositionFromPoint = function (doc, x, y) {
    return $_gj9ujrjgjcg89dgs.from(doc.dom().caretPositionFromPoint(x, y)).bind(function (pos) {
      if (pos.offsetNode === null)
        return $_gj9ujrjgjcg89dgs.none();
      var r = doc.dom().createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse();
      return $_gj9ujrjgjcg89dgs.some(r);
    });
  };
  var caretRangeFromPoint = function (doc, x, y) {
    return $_gj9ujrjgjcg89dgs.from(doc.dom().caretRangeFromPoint(x, y));
  };
  var searchTextNodes = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return $_73zvadoajcg89e6k.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return $_a8yw3ijujcg89dik.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_89djnhodjcg89e6u.search(doc, elem, x);
      };
      return $_e07z69jwjcg89dip.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = $_a8yw3ijujcg89dik.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_ddz9kfo2jcg89e59.range($_a8yw3ijujcg89dik.fromDom(rng.startContainer), rng.startOffset, $_a8yw3ijujcg89dik.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_cuk3a8o9jcg89e6h = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_ap8pano7jcg89e5x.create(win);
    var self = $_2vvdyijtjcg89dig.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_6f7vtwkhjcg89dkl.descendants(ancestor, selector));
    return $_9786xxjfjcg89dgm.filter(elements, function (elem) {
      $_ap8pano7jcg89e5x.selectNodeContentsUsing(innerRange, elem);
      return $_ap8pano7jcg89e5x.isWithin(outerRange, innerRange);
    });
  };
  var find$3 = function (win, selection, selector) {
    var outerRange = $_b3o9hbo8jcg89e64.asLtrRange(win, selection);
    var ancestor = $_a8yw3ijujcg89dik.fromDom(outerRange.commonAncestorContainer);
    return $_a7udttkgjcg89dkj.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_dak6qboejcg89e6y = { find: find$3 };

  var beforeSpecial = function (element, offset) {
    var name = $_a7udttkgjcg89dkj.name(element);
    if ('input' === name)
      return $_6lemaso3jcg89e5d.after(element);
    else if (!$_9786xxjfjcg89dgm.contains([
        'br',
        'img'
      ], name))
      return $_6lemaso3jcg89e5d.on(element, offset);
    else
      return offset === 0 ? $_6lemaso3jcg89e5d.before(element) : $_6lemaso3jcg89e5d.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_6lemaso3jcg89e5d.before, beforeSpecial, $_6lemaso3jcg89e5d.after);
    var finish = finishSitu.fold($_6lemaso3jcg89e5d.before, beforeSpecial, $_6lemaso3jcg89e5d.after);
    return $_ddz9kfo2jcg89e59.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_ddz9kfo2jcg89e59.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = $_a8yw3ijujcg89dik.fromDom(rng.startContainer);
        var finish = $_a8yw3ijujcg89dik.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_dcsmzpofjcg89e74 = {
    beforeSpecial: beforeSpecial,
    preprocess: preprocess,
    preprocessRelative: preprocessRelative,
    preprocessExact: preprocessExact
  };

  var doSetNativeRange = function (win, rng) {
    $_gj9ujrjgjcg89dgs.from(win.getSelection()).each(function (selection) {
      selection.removeAllRanges();
      selection.addRange(rng);
    });
  };
  var doSetRange = function (win, start, soffset, finish, foffset) {
    var rng = $_ap8pano7jcg89e5x.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_dak6qboejcg89e6y.find(win, selection, selector);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_b3o9hbo8jcg89e64.diagnose(win, relative).match({
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
    var relative = $_dcsmzpofjcg89e74.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_dcsmzpofjcg89e74.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_ddz9kfo2jcg89e59.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_ap8pano7jcg89e5x.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_dcsmzpofjcg89e74.preprocess(selection);
    return $_b3o9hbo8jcg89e64.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return $_gj9ujrjgjcg89dgs.some($_ddz9kfo2jcg89e59.range($_a8yw3ijujcg89dik.fromDom(firstRng.startContainer), firstRng.startOffset, $_a8yw3ijujcg89dik.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return $_gj9ujrjgjcg89dgs.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = $_a8yw3ijujcg89dik.fromDom(selection.anchorNode);
    var focusNode = $_a8yw3ijujcg89dik.fromDom(selection.focusNode);
    return $_elt8k3o5jcg89e5o.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? $_gj9ujrjgjcg89dgs.some($_ddz9kfo2jcg89e59.range($_a8yw3ijujcg89dik.fromDom(selection.anchorNode), selection.anchorOffset, $_a8yw3ijujcg89dik.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_ap8pano7jcg89e5x.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_ap8pano7jcg89e5x.selectNodeContents(win, element);
    return $_ddz9kfo2jcg89e59.range($_a8yw3ijujcg89dik.fromDom(rng.startContainer), rng.startOffset, $_a8yw3ijujcg89dik.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    var selection = win.getSelection();
    return selection.rangeCount > 0 ? doGetExact(selection) : $_gj9ujrjgjcg89dgs.none();
  };
  var get$9 = function (win) {
    return getExact(win).map(function (range) {
      return $_ddz9kfo2jcg89e59.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect = function (win, selection) {
    var rng = $_b3o9hbo8jcg89e64.asLtrRange(win, selection);
    return $_ap8pano7jcg89e5x.getFirstRect(rng);
  };
  var getBounds$1 = function (win, selection) {
    var rng = $_b3o9hbo8jcg89e64.asLtrRange(win, selection);
    return $_ap8pano7jcg89e5x.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_cuk3a8o9jcg89e6h.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_b3o9hbo8jcg89e64.asLtrRange(win, selection);
    return $_ap8pano7jcg89e5x.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$2 = function (win, selection) {
    var rng = $_b3o9hbo8jcg89e64.asLtrRange(win, selection);
    return $_ap8pano7jcg89e5x.cloneFragment(rng);
  };
  var replace$1 = function (win, selection, elements) {
    var rng = $_b3o9hbo8jcg89e64.asLtrRange(win, selection);
    var fragment = $_3ayliro6jcg89e5r.fromElements(elements, win.document);
    $_ap8pano7jcg89e5x.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_b3o9hbo8jcg89e64.asLtrRange(win, selection);
    $_ap8pano7jcg89e5x.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_fqkoktjyjcg89diy.eq(start, finish) && soffset === foffset;
  };
  var $_4lh9xxo4jcg89e5h = {
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
    return go(editor, isRoot, $_395bq3o0jcg89e4x.next(cell), lazyWire);
  };
  var backward = function (editor, isRoot, cell, lazyWire) {
    return go(editor, isRoot, $_395bq3o0jcg89e4x.prev(cell), lazyWire);
  };
  var getCellFirstCursorPosition = function (editor, cell) {
    var selection = $_ddz9kfo2jcg89e59.exact(cell, 0, cell, 0);
    return $_4lh9xxo4jcg89e5h.toNative(selection);
  };
  var getNewRowCursorPosition = function (editor, table) {
    var rows = $_6f7vtwkhjcg89dkl.descendants(table, 'tr');
    return $_9786xxjfjcg89dgm.last(rows).bind(function (last) {
      return $_a6sun7kkjcg89dks.descendant(last, 'td,th').map(function (first) {
        return getCellFirstCursorPosition(editor, first);
      });
    });
  };
  var go = function (editor, isRoot, cell, actions, lazyWire) {
    return cell.fold($_gj9ujrjgjcg89dgs.none, $_gj9ujrjgjcg89dgs.none, function (current, next) {
      return $_4u334mkvjcg89dml.first(next).map(function (cell) {
        return getCellFirstCursorPosition(editor, cell);
      });
    }, function (current) {
      return $_5igemtjrjcg89dhs.table(current, isRoot).bind(function (table) {
        var targets = $_1mg2tjl0jcg89dmz.noMenu(current);
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
      var body_1 = $_9sl17zn1jcg89dyf.getBody(editor);
      var isRoot_1 = function (element) {
        var name = $_a7udttkgjcg89dkj.name(element);
        return $_fqkoktjyjcg89diy.eq(element, body_1) || $_9786xxjfjcg89dgm.contains(rootElements, name);
      };
      var rng = editor.selection.getRng();
      if (rng.collapsed) {
        var start = $_a8yw3ijujcg89dik.fromDom(rng.startContainer);
        $_5igemtjrjcg89dhs.cell(start, isRoot_1).each(function (cell) {
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
  var $_52ccoknzjcg89e4a = { handle: handle$1 };

  var response = $_mgt0hjkjcg89dhb.immutable('selection', 'kill');
  var $_cqtvwqojjcg89e8a = { response: response };

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
  var $_46w8v5okjcg89e8f = {
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
    var rng = $_b3o9hbo8jcg89e64.asLtrRange(win, selection);
    return {
      start: $_3z1bpnjhjcg89dgu.constant($_a8yw3ijujcg89dik.fromDom(rng.startContainer)),
      soffset: $_3z1bpnjhjcg89dgu.constant(rng.startOffset),
      finish: $_3z1bpnjhjcg89dgu.constant($_a8yw3ijujcg89dik.fromDom(rng.endContainer)),
      foffset: $_3z1bpnjhjcg89dgu.constant(rng.endOffset)
    };
  };
  var makeSitus = function (start, soffset, finish, foffset) {
    return {
      start: $_3z1bpnjhjcg89dgu.constant($_6lemaso3jcg89e5d.on(start, soffset)),
      finish: $_3z1bpnjhjcg89dgu.constant($_6lemaso3jcg89e5d.on(finish, foffset))
    };
  };
  var $_91hm5komjcg89e8x = {
    convertToRange: convertToRange,
    makeSitus: makeSitus
  };

  var isSafari = $_7o3y0ok3jcg89dja.detect().browser.isSafari();
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
    var pos = $_41eijblwjcg89ds2.absolute(element);
    var doc = $_a8yw3ijujcg89dik.fromDom(win.document);
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
    var previous = $_gj9ujrjgjcg89dgs.none();
    var save = function () {
      previous = $_gj9ujrjgjcg89dgs.some(get$10(doc));
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
    if (isSafari && $_4jzhk7jojcg89dhh.isFunction(element.dom().scrollIntoViewIfNeeded)) {
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
    var scrollDiv = $_a8yw3ijujcg89dik.fromHtml('<div style="width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;"></div>');
    $_2xc490kqjcg89dln.after($_9klllckjjcg89dko.body(), scrollDiv);
    var w = scrollDiv.dom().offsetWidth - scrollDiv.dom().clientWidth;
    $_9fofwxkrjcg89dlq.remove(scrollDiv);
    return w;
  };
  var $_firk0bonjcg89e9a = {
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
      return $_gj9ujrjgjcg89dgs.from(win.document.elementFromPoint(x, y)).map($_a8yw3ijujcg89dik.fromDom);
    };
    var getRect = function (element) {
      return element.dom().getBoundingClientRect();
    };
    var getRangedRect = function (start, soffset, finish, foffset) {
      var sel = $_ddz9kfo2jcg89e59.exact(start, soffset, finish, foffset);
      return $_4lh9xxo4jcg89e5h.getFirstRect(win, sel).map(function (structRect) {
        return $_7p93f5jjjcg89dh9.map(structRect, $_3z1bpnjhjcg89dgu.apply);
      });
    };
    var getSelection = function () {
      return $_4lh9xxo4jcg89e5h.get(win).map(function (exactAdt) {
        return $_91hm5komjcg89e8x.convertToRange(win, exactAdt);
      });
    };
    var fromSitus = function (situs) {
      var relative = $_ddz9kfo2jcg89e59.relative(situs.start(), situs.finish());
      return $_91hm5komjcg89e8x.convertToRange(win, relative);
    };
    var situsFromPoint = function (x, y) {
      return $_4lh9xxo4jcg89e5h.getAtPoint(win, x, y).map(function (exact) {
        return {
          start: $_3z1bpnjhjcg89dgu.constant($_6lemaso3jcg89e5d.on(exact.start(), exact.soffset())),
          finish: $_3z1bpnjhjcg89dgu.constant($_6lemaso3jcg89e5d.on(exact.finish(), exact.foffset()))
        };
      });
    };
    var clearSelection = function () {
      $_4lh9xxo4jcg89e5h.clear(win);
    };
    var selectContents = function (element) {
      $_4lh9xxo4jcg89e5h.setToElement(win, element);
    };
    var setSelection = function (sel) {
      $_4lh9xxo4jcg89e5h.setExact(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
    };
    var setRelativeSelection = function (start, finish) {
      $_4lh9xxo4jcg89e5h.setRelative(win, start, finish);
    };
    var getInnerHeight = function () {
      return win.innerHeight;
    };
    var getScrollY = function () {
      var pos = $_firk0bonjcg89e9a.get($_a8yw3ijujcg89dik.fromDom(win.document));
      return pos.top();
    };
    var scrollBy = function (x, y) {
      $_firk0bonjcg89e9a.by(x, y, $_a8yw3ijujcg89dik.fromDom(win.document));
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
    if (!($_fqkoktjyjcg89diy.eq(start, finish) && soffset === foffset)) {
      return $_a6sun7kkjcg89dks.closest(start, 'td,th', isRoot).bind(function (s) {
        return $_a6sun7kkjcg89dks.closest(finish, 'td,th', isRoot).bind(function (f) {
          return detect$5(container, isRoot, s, f, selectRange);
        });
      });
    } else {
      return $_gj9ujrjgjcg89dgs.none();
    }
  };
  var detect$5 = function (container, isRoot, start, finish, selectRange) {
    if (!$_fqkoktjyjcg89diy.eq(start, finish)) {
      return $_84g87ml3jcg89dnh.identify(start, finish, isRoot).bind(function (cellSel) {
        var boxes = cellSel.boxes().getOr([]);
        if (boxes.length > 0) {
          selectRange(container, boxes, cellSel.start(), cellSel.finish());
          return $_gj9ujrjgjcg89dgs.some($_cqtvwqojjcg89e8a.response($_gj9ujrjgjcg89dgs.some($_91hm5komjcg89e8x.makeSitus(start, 0, start, $_5pzxh2kwjcg89dmn.getEnd(start))), true));
        } else {
          return $_gj9ujrjgjcg89dgs.none();
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
    return $_84g87ml3jcg89dnh.shiftSelection(selected, rows, columns, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(updateSelection);
  };
  var $_bmnj1oojcg89e9i = {
    sync: sync,
    detect: detect$5,
    update: update
  };

  var nu$3 = $_mgt0hjkjcg89dhb.immutableBag([
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
  var $_f5qenorjcg89eat = {
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
    if (offset >= 0 && offset < $_5pzxh2kwjcg89dmn.getEnd(element))
      return bridge.getRangedRect(element, offset, element, offset + 1);
    else if (offset > 0)
      return bridge.getRangedRect(element, offset - 1, element, offset);
    return $_gj9ujrjgjcg89dgs.none();
  };
  var toCaret = function (rect) {
    return $_f5qenorjcg89eat.nu({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom
    });
  };
  var getElemBox = function (bridge, element) {
    return $_gj9ujrjgjcg89dgs.some(bridge.getRect(element));
  };
  var getBoxAt = function (bridge, element, offset) {
    if ($_a7udttkgjcg89dkj.isElement(element))
      return getElemBox(bridge, element).map(toCaret);
    else if ($_a7udttkgjcg89dkj.isText(element))
      return getPartialBox(bridge, element, offset).map(toCaret);
    else
      return $_gj9ujrjgjcg89dgs.none();
  };
  var getEntireBox = function (bridge, element) {
    if ($_a7udttkgjcg89dkj.isElement(element))
      return getElemBox(bridge, element).map(toCaret);
    else if ($_a7udttkgjcg89dkj.isText(element))
      return bridge.getRangedRect(element, 0, element, $_5pzxh2kwjcg89dmn.getEnd(element)).map(toCaret);
    else
      return $_gj9ujrjgjcg89dgs.none();
  };
  var $_cdwbv5osjcg89eaw = {
    getBoxAt: getBoxAt,
    getEntireBox: getEntireBox
  };

  var traverse = $_mgt0hjkjcg89dhb.immutable('item', 'mode');
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
      fallback: $_gj9ujrjgjcg89dgs.none()
    },
    {
      current: sidestep,
      next: advance,
      fallback: $_gj9ujrjgjcg89dgs.some(backtrack)
    },
    {
      current: advance,
      next: advance,
      fallback: $_gj9ujrjgjcg89dgs.some(sidestep)
    }
  ];
  var go$1 = function (universe, item, mode, direction, rules) {
    var rules = rules !== undefined ? rules : successors;
    var ruleOpt = $_9786xxjfjcg89dgm.find(rules, function (succ) {
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
  var $_dm5bioxjcg89ec0 = {
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
      return children.length > 0 ? $_gj9ujrjgjcg89dgs.some(children[children.length - 1]) : $_gj9ujrjgjcg89dgs.none();
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
      return children.length > 0 ? $_gj9ujrjgjcg89dgs.some(children[0]) : $_gj9ujrjgjcg89dgs.none();
    };
    return {
      sibling: sibling,
      first: first
    };
  };
  var $_g050e2oyjcg89ec5 = {
    left: left$2,
    right: right$2
  };

  var hone = function (universe, item, predicate, mode, direction, isRoot) {
    var next = $_dm5bioxjcg89ec0.go(universe, item, mode, direction);
    return next.bind(function (n) {
      if (isRoot(n.item()))
        return $_gj9ujrjgjcg89dgs.none();
      else
        return predicate(n.item()) ? $_gj9ujrjgjcg89dgs.some(n.item()) : hone(universe, n.item(), predicate, n.mode(), direction, isRoot);
    });
  };
  var left$1 = function (universe, item, predicate, isRoot) {
    return hone(universe, item, predicate, $_dm5bioxjcg89ec0.sidestep, $_g050e2oyjcg89ec5.left(), isRoot);
  };
  var right$1 = function (universe, item, predicate, isRoot) {
    return hone(universe, item, predicate, $_dm5bioxjcg89ec0.sidestep, $_g050e2oyjcg89ec5.right(), isRoot);
  };
  var $_2vkcduowjcg89ebu = {
    left: left$1,
    right: right$1
  };

  var isLeaf = function (universe, element) {
    return universe.property().children(element).length === 0;
  };
  var before$3 = function (universe, item, isRoot) {
    return seekLeft$1(universe, item, $_3z1bpnjhjcg89dgu.curry(isLeaf, universe), isRoot);
  };
  var after$4 = function (universe, item, isRoot) {
    return seekRight$1(universe, item, $_3z1bpnjhjcg89dgu.curry(isLeaf, universe), isRoot);
  };
  var seekLeft$1 = function (universe, item, predicate, isRoot) {
    return $_2vkcduowjcg89ebu.left(universe, item, predicate, isRoot);
  };
  var seekRight$1 = function (universe, item, predicate, isRoot) {
    return $_2vkcduowjcg89ebu.right(universe, item, predicate, isRoot);
  };
  var walkers$1 = function () {
    return {
      left: $_g050e2oyjcg89ec5.left,
      right: $_g050e2oyjcg89ec5.right
    };
  };
  var walk$1 = function (universe, item, mode, direction, _rules) {
    return $_dm5bioxjcg89ec0.go(universe, item, mode, direction, _rules);
  };
  var $_ge04vpovjcg89ebo = {
    before: before$3,
    after: after$4,
    seekLeft: seekLeft$1,
    seekRight: seekRight$1,
    walkers: walkers$1,
    walk: walk$1,
    backtrack: $_dm5bioxjcg89ec0.backtrack,
    sidestep: $_dm5bioxjcg89ec0.sidestep,
    advance: $_dm5bioxjcg89ec0.advance
  };

  var universe$2 = DomUniverse();
  var gather = function (element, prune, transform) {
    return $_ge04vpovjcg89ebo.gather(universe$2, element, prune, transform);
  };
  var before$2 = function (element, isRoot) {
    return $_ge04vpovjcg89ebo.before(universe$2, element, isRoot);
  };
  var after$3 = function (element, isRoot) {
    return $_ge04vpovjcg89ebo.after(universe$2, element, isRoot);
  };
  var seekLeft = function (element, predicate, isRoot) {
    return $_ge04vpovjcg89ebo.seekLeft(universe$2, element, predicate, isRoot);
  };
  var seekRight = function (element, predicate, isRoot) {
    return $_ge04vpovjcg89ebo.seekRight(universe$2, element, predicate, isRoot);
  };
  var walkers = function () {
    return $_ge04vpovjcg89ebo.walkers();
  };
  var walk = function (item, mode, direction, _rules) {
    return $_ge04vpovjcg89ebo.walk(universe$2, item, mode, direction, _rules);
  };
  var $_33lu9coujcg89ebl = {
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
  var adt$2 = $_46qooqlhjcg89dpr.generate([
    { 'none': [] },
    { 'retry': ['caret'] }
  ]);
  var isOutside = function (caret, box) {
    return caret.left() < box.left() || Math.abs(box.right() - caret.left()) < 1 || caret.left() > box.right();
  };
  var inOutsideBlock = function (bridge, element, caret) {
    return $_dnhfqskljcg89dkt.closest(element, $_amc7enm5jcg89dti.isBlock).fold($_3z1bpnjhjcg89dgu.constant(false), function (cell) {
      return $_cdwbv5osjcg89eaw.getEntireBox(bridge, cell).exists(function (box) {
        return isOutside(caret, box);
      });
    });
  };
  var adjustDown = function (bridge, element, guessBox, original, caret) {
    var lowerCaret = $_f5qenorjcg89eat.moveDown(caret, JUMP_SIZE);
    if (Math.abs(guessBox.bottom() - original.bottom()) < 1)
      return adt$2.retry(lowerCaret);
    else if (guessBox.top() > caret.bottom())
      return adt$2.retry(lowerCaret);
    else if (guessBox.top() === caret.bottom())
      return adt$2.retry($_f5qenorjcg89eat.moveDown(caret, 1));
    else
      return inOutsideBlock(bridge, element, caret) ? adt$2.retry($_f5qenorjcg89eat.translate(lowerCaret, JUMP_SIZE, 0)) : adt$2.none();
  };
  var adjustUp = function (bridge, element, guessBox, original, caret) {
    var higherCaret = $_f5qenorjcg89eat.moveUp(caret, JUMP_SIZE);
    if (Math.abs(guessBox.top() - original.top()) < 1)
      return adt$2.retry(higherCaret);
    else if (guessBox.bottom() < caret.top())
      return adt$2.retry(higherCaret);
    else if (guessBox.bottom() === caret.top())
      return adt$2.retry($_f5qenorjcg89eat.moveUp(caret, 1));
    else
      return inOutsideBlock(bridge, element, caret) ? adt$2.retry($_f5qenorjcg89eat.translate(higherCaret, JUMP_SIZE, 0)) : adt$2.none();
  };
  var upMovement = {
    point: $_f5qenorjcg89eat.getTop,
    adjuster: adjustUp,
    move: $_f5qenorjcg89eat.moveUp,
    gather: $_33lu9coujcg89ebl.before
  };
  var downMovement = {
    point: $_f5qenorjcg89eat.getBottom,
    adjuster: adjustDown,
    move: $_f5qenorjcg89eat.moveDown,
    gather: $_33lu9coujcg89ebl.after
  };
  var isAtTable = function (bridge, x, y) {
    return bridge.elementFromPoint(x, y).filter(function (elm) {
      return $_a7udttkgjcg89dkj.name(elm) === 'table';
    }).isSome();
  };
  var adjustForTable = function (bridge, movement, original, caret, numRetries) {
    return adjustTil(bridge, movement, original, movement.move(caret, JUMP_SIZE), numRetries);
  };
  var adjustTil = function (bridge, movement, original, caret, numRetries) {
    if (numRetries === 0)
      return $_gj9ujrjgjcg89dgs.some(caret);
    if (isAtTable(bridge, caret.left(), movement.point(caret)))
      return adjustForTable(bridge, movement, original, caret, numRetries - 1);
    return bridge.situsFromPoint(caret.left(), movement.point(caret)).bind(function (guess) {
      return guess.start().fold($_gj9ujrjgjcg89dgs.none, function (element, offset) {
        return $_cdwbv5osjcg89eaw.getEntireBox(bridge, element, offset).bind(function (guessBox) {
          return movement.adjuster(bridge, element, guessBox, original, caret).fold($_gj9ujrjgjcg89dgs.none, function (newCaret) {
            return adjustTil(bridge, movement, original, newCaret, numRetries - 1);
          });
        }).orThunk(function () {
          return $_gj9ujrjgjcg89dgs.some(caret);
        });
      }, $_gj9ujrjgjcg89dgs.none);
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
      return $_gj9ujrjgjcg89dgs.some(movement.point(adjusted) - bridge.getInnerHeight());
    else if (movement.point(adjusted) < 0)
      return $_gj9ujrjgjcg89dgs.some(-movement.point(adjusted));
    else
      return $_gj9ujrjgjcg89dgs.none();
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
  var $_50su7eotjcg89eb3 = {
    tryUp: $_3z1bpnjhjcg89dgu.curry(retry, upMovement),
    tryDown: $_3z1bpnjhjcg89dgu.curry(retry, downMovement),
    ieTryUp: ieTryUp,
    ieTryDown: ieTryDown,
    getJumpSize: $_3z1bpnjhjcg89dgu.constant(JUMP_SIZE)
  };

  var adt$3 = $_46qooqlhjcg89dpr.generate([
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
    return $_a6sun7kkjcg89dks.closest(after, 'td,th', isRoot).bind(function (afterCell) {
      return $_a6sun7kkjcg89dks.closest(before, 'td,th', isRoot).map(function (beforeCell) {
        if (!$_fqkoktjyjcg89diy.eq(afterCell, beforeCell)) {
          return $_5ecxohl4jcg89dnw.sharedOne(isRow, [
            afterCell,
            beforeCell
          ]).fold(function () {
            return isOverlapping(bridge, beforeCell, afterCell) ? adt$3.success() : failure(beforeCell);
          }, function (sharedRow) {
            return failure(beforeCell);
          });
        } else {
          return $_fqkoktjyjcg89diy.eq(after, afterCell) && $_5pzxh2kwjcg89dmn.getEnd(afterCell) === afterOffset ? failure(beforeCell) : adt$3.none('in same cell');
        }
      });
    }).getOr(adt$3.none('default'));
  };
  var isRow = function (elem) {
    return $_a6sun7kkjcg89dks.closest(elem, 'tr');
  };
  var cata$2 = function (subject, onNone, onSuccess, onFailedUp, onFailedDown) {
    return subject.fold(onNone, onSuccess, onFailedUp, onFailedDown);
  };
  var $_eogmugozjcg89ec8 = {
    verify: verify,
    cata: cata$2,
    adt: adt$3
  };

  var point = $_mgt0hjkjcg89dhb.immutable('element', 'offset');
  var delta = $_mgt0hjkjcg89dhb.immutable('element', 'deltaOffset');
  var range$3 = $_mgt0hjkjcg89dhb.immutable('element', 'start', 'finish');
  var points = $_mgt0hjkjcg89dhb.immutable('begin', 'end');
  var text = $_mgt0hjkjcg89dhb.immutable('element', 'text');
  var $_a80hx5p1jcg89ed4 = {
    point: point,
    delta: delta,
    range: range$3,
    points: points,
    text: text
  };

  var inAncestor = $_mgt0hjkjcg89dhb.immutable('ancestor', 'descendants', 'element', 'index');
  var inParent = $_mgt0hjkjcg89dhb.immutable('parent', 'children', 'element', 'index');
  var childOf = function (element, ancestor) {
    return $_dnhfqskljcg89dkt.closest(element, function (elem) {
      return $_e07z69jwjcg89dip.parent(elem).exists(function (parent) {
        return $_fqkoktjyjcg89diy.eq(parent, ancestor);
      });
    });
  };
  var indexInParent = function (element) {
    return $_e07z69jwjcg89dip.parent(element).bind(function (parent) {
      var children = $_e07z69jwjcg89dip.children(parent);
      return indexOf$1(children, element).map(function (index) {
        return inParent(parent, children, element, index);
      });
    });
  };
  var indexOf$1 = function (elements, element) {
    return $_9786xxjfjcg89dgm.findIndex(elements, $_3z1bpnjhjcg89dgu.curry($_fqkoktjyjcg89diy.eq, element));
  };
  var selectorsInParent = function (element, selector) {
    return $_e07z69jwjcg89dip.parent(element).bind(function (parent) {
      var children = $_6f7vtwkhjcg89dkl.children(parent, selector);
      return indexOf$1(children, element).map(function (index) {
        return inParent(parent, children, element, index);
      });
    });
  };
  var descendantsInAncestor = function (element, ancestorSelector, descendantSelector) {
    return $_a6sun7kkjcg89dks.closest(element, ancestorSelector).bind(function (ancestor) {
      var descendants = $_6f7vtwkhjcg89dkl.descendants(ancestor, descendantSelector);
      return indexOf$1(descendants, element).map(function (index) {
        return inAncestor(ancestor, descendants, element, index);
      });
    });
  };
  var $_4dcjlup2jcg89ed9 = {
    childOf: childOf,
    indexOf: indexOf$1,
    indexInParent: indexInParent,
    selectorsInParent: selectorsInParent,
    descendantsInAncestor: descendantsInAncestor
  };

  var isBr = function (elem) {
    return $_a7udttkgjcg89dkj.name(elem) === 'br';
  };
  var gatherer = function (cand, gather, isRoot) {
    return gather(cand, isRoot).bind(function (target) {
      return $_a7udttkgjcg89dkj.isText(target) && $_8lwn8skxjcg89dmq.get(target).trim().length === 0 ? gatherer(target, gather, isRoot) : $_gj9ujrjgjcg89dgs.some(target);
    });
  };
  var handleBr = function (isRoot, element, direction) {
    return direction.traverse(element).orThunk(function () {
      return gatherer(element, direction.gather, isRoot);
    }).map(direction.relative);
  };
  var findBr = function (element, offset) {
    return $_e07z69jwjcg89dip.child(element, offset).filter(isBr).orThunk(function () {
      return $_e07z69jwjcg89dip.child(element, offset - 1).filter(isBr);
    });
  };
  var handleParent = function (isRoot, element, offset, direction) {
    return findBr(element, offset).bind(function (br) {
      return direction.traverse(br).fold(function () {
        return gatherer(br, direction.gather, isRoot).map(direction.relative);
      }, function (adjacent) {
        return $_4dcjlup2jcg89ed9.indexInParent(adjacent).map(function (info) {
          return $_6lemaso3jcg89e5d.on(info.parent(), info.index());
        });
      });
    });
  };
  var tryBr = function (isRoot, element, offset, direction) {
    var target = isBr(element) ? handleBr(isRoot, element, direction) : handleParent(isRoot, element, offset, direction);
    return target.map(function (tgt) {
      return {
        start: $_3z1bpnjhjcg89dgu.constant(tgt),
        finish: $_3z1bpnjhjcg89dgu.constant(tgt)
      };
    });
  };
  var process = function (analysis) {
    return $_eogmugozjcg89ec8.cata(analysis, function (message) {
      return $_gj9ujrjgjcg89dgs.none('BR ADT: none');
    }, function () {
      return $_gj9ujrjgjcg89dgs.none();
    }, function (cell) {
      return $_gj9ujrjgjcg89dgs.some($_a80hx5p1jcg89ed4.point(cell, 0));
    }, function (cell) {
      return $_gj9ujrjgjcg89dgs.some($_a80hx5p1jcg89ed4.point(cell, $_5pzxh2kwjcg89dmn.getEnd(cell)));
    });
  };
  var $_bs49irp0jcg89ech = {
    tryBr: tryBr,
    process: process
  };

  var MAX_RETRIES = 20;
  var platform$1 = $_7o3y0ok3jcg89dja.detect();
  var findSpot = function (bridge, isRoot, direction) {
    return bridge.getSelection().bind(function (sel) {
      return $_bs49irp0jcg89ech.tryBr(isRoot, sel.finish(), sel.foffset(), direction).fold(function () {
        return $_gj9ujrjgjcg89dgs.some($_a80hx5p1jcg89ed4.point(sel.finish(), sel.foffset()));
      }, function (brNeighbour) {
        var range = bridge.fromSitus(brNeighbour);
        var analysis = $_eogmugozjcg89ec8.verify(bridge, sel.finish(), sel.foffset(), range.finish(), range.foffset(), direction.failure, isRoot);
        return $_bs49irp0jcg89ech.process(analysis);
      });
    });
  };
  var scan = function (bridge, isRoot, element, offset, direction, numRetries) {
    if (numRetries === 0)
      return $_gj9ujrjgjcg89dgs.none();
    return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
      var range = bridge.fromSitus(situs);
      var analysis = $_eogmugozjcg89ec8.verify(bridge, element, offset, range.finish(), range.foffset(), direction.failure, isRoot);
      return $_eogmugozjcg89ec8.cata(analysis, function () {
        return $_gj9ujrjgjcg89dgs.none();
      }, function () {
        return $_gj9ujrjgjcg89dgs.some(situs);
      }, function (cell) {
        if ($_fqkoktjyjcg89diy.eq(element, cell) && offset === 0)
          return tryAgain(bridge, element, offset, $_f5qenorjcg89eat.moveUp, direction);
        else
          return scan(bridge, isRoot, cell, 0, direction, numRetries - 1);
      }, function (cell) {
        if ($_fqkoktjyjcg89diy.eq(element, cell) && offset === $_5pzxh2kwjcg89dmn.getEnd(cell))
          return tryAgain(bridge, element, offset, $_f5qenorjcg89eat.moveDown, direction);
        else
          return scan(bridge, isRoot, cell, $_5pzxh2kwjcg89dmn.getEnd(cell), direction, numRetries - 1);
      });
    });
  };
  var tryAgain = function (bridge, element, offset, move, direction) {
    return $_cdwbv5osjcg89eaw.getBoxAt(bridge, element, offset).bind(function (box) {
      return tryAt(bridge, direction, move(box, $_50su7eotjcg89eb3.getJumpSize()));
    });
  };
  var tryAt = function (bridge, direction, box) {
    if (platform$1.browser.isChrome() || platform$1.browser.isSafari() || platform$1.browser.isFirefox() || platform$1.browser.isEdge())
      return direction.otherRetry(bridge, box);
    else if (platform$1.browser.isIE())
      return direction.ieRetry(bridge, box);
    else
      return $_gj9ujrjgjcg89dgs.none();
  };
  var tryCursor = function (bridge, isRoot, element, offset, direction) {
    return $_cdwbv5osjcg89eaw.getBoxAt(bridge, element, offset).bind(function (box) {
      return tryAt(bridge, direction, box);
    });
  };
  var handle$2 = function (bridge, isRoot, direction) {
    return findSpot(bridge, isRoot, direction).bind(function (spot) {
      return scan(bridge, isRoot, spot.element(), spot.offset(), direction, MAX_RETRIES).map(bridge.fromSitus);
    });
  };
  var $_7eqcrkoqjcg89eam = { handle: handle$2 };

  var any$1 = function (predicate) {
    return $_dnhfqskljcg89dkt.first(predicate).isSome();
  };
  var ancestor$3 = function (scope, predicate, isRoot) {
    return $_dnhfqskljcg89dkt.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest$3 = function (scope, predicate, isRoot) {
    return $_dnhfqskljcg89dkt.closest(scope, predicate, isRoot).isSome();
  };
  var sibling$3 = function (scope, predicate) {
    return $_dnhfqskljcg89dkt.sibling(scope, predicate).isSome();
  };
  var child$4 = function (scope, predicate) {
    return $_dnhfqskljcg89dkt.child(scope, predicate).isSome();
  };
  var descendant$3 = function (scope, predicate) {
    return $_dnhfqskljcg89dkt.descendant(scope, predicate).isSome();
  };
  var $_fjxxdsp3jcg89edg = {
    any: any$1,
    ancestor: ancestor$3,
    closest: closest$3,
    sibling: sibling$3,
    child: child$4,
    descendant: descendant$3
  };

  var detection = $_7o3y0ok3jcg89dja.detect();
  var inSameTable = function (elem, table) {
    return $_fjxxdsp3jcg89edg.ancestor(elem, function (e) {
      return $_e07z69jwjcg89dip.parent(e).exists(function (p) {
        return $_fqkoktjyjcg89diy.eq(p, table);
      });
    });
  };
  var simulate = function (bridge, isRoot, direction, initial, anchor) {
    return $_a6sun7kkjcg89dks.closest(initial, 'td,th', isRoot).bind(function (start) {
      return $_a6sun7kkjcg89dks.closest(start, 'table', isRoot).bind(function (table) {
        if (!inSameTable(anchor, table))
          return $_gj9ujrjgjcg89dgs.none();
        return $_7eqcrkoqjcg89eam.handle(bridge, isRoot, direction).bind(function (range) {
          return $_a6sun7kkjcg89dks.closest(range.finish(), 'td,th', isRoot).map(function (finish) {
            return {
              start: $_3z1bpnjhjcg89dgu.constant(start),
              finish: $_3z1bpnjhjcg89dgu.constant(finish),
              range: $_3z1bpnjhjcg89dgu.constant(range)
            };
          });
        });
      });
    });
  };
  var navigate = function (bridge, isRoot, direction, initial, anchor, precheck) {
    if (detection.browser.isIE()) {
      return $_gj9ujrjgjcg89dgs.none();
    } else {
      return precheck(initial, isRoot).orThunk(function () {
        return simulate(bridge, isRoot, direction, initial, anchor).map(function (info) {
          var range = info.range();
          return $_cqtvwqojjcg89e8a.response($_gj9ujrjgjcg89dgs.some($_91hm5komjcg89e8x.makeSitus(range.start(), range.soffset(), range.finish(), range.foffset())), true);
        });
      });
    }
  };
  var firstUpCheck = function (initial, isRoot) {
    return $_a6sun7kkjcg89dks.closest(initial, 'tr', isRoot).bind(function (startRow) {
      return $_a6sun7kkjcg89dks.closest(startRow, 'table', isRoot).bind(function (table) {
        var rows = $_6f7vtwkhjcg89dkl.descendants(table, 'tr');
        if ($_fqkoktjyjcg89diy.eq(startRow, rows[0])) {
          return $_33lu9coujcg89ebl.seekLeft(table, function (element) {
            return $_4u334mkvjcg89dml.last(element).isSome();
          }, isRoot).map(function (last) {
            var lastOffset = $_5pzxh2kwjcg89dmn.getEnd(last);
            return $_cqtvwqojjcg89e8a.response($_gj9ujrjgjcg89dgs.some($_91hm5komjcg89e8x.makeSitus(last, lastOffset, last, lastOffset)), true);
          });
        } else {
          return $_gj9ujrjgjcg89dgs.none();
        }
      });
    });
  };
  var lastDownCheck = function (initial, isRoot) {
    return $_a6sun7kkjcg89dks.closest(initial, 'tr', isRoot).bind(function (startRow) {
      return $_a6sun7kkjcg89dks.closest(startRow, 'table', isRoot).bind(function (table) {
        var rows = $_6f7vtwkhjcg89dkl.descendants(table, 'tr');
        if ($_fqkoktjyjcg89diy.eq(startRow, rows[rows.length - 1])) {
          return $_33lu9coujcg89ebl.seekRight(table, function (element) {
            return $_4u334mkvjcg89dml.first(element).isSome();
          }, isRoot).map(function (first) {
            return $_cqtvwqojjcg89e8a.response($_gj9ujrjgjcg89dgs.some($_91hm5komjcg89e8x.makeSitus(first, 0, first, 0)), true);
          });
        } else {
          return $_gj9ujrjgjcg89dgs.none();
        }
      });
    });
  };
  var select = function (bridge, container, isRoot, direction, initial, anchor, selectRange) {
    return simulate(bridge, isRoot, direction, initial, anchor).bind(function (info) {
      return $_bmnj1oojcg89e9i.detect(container, isRoot, info.start(), info.finish(), selectRange);
    });
  };
  var $_91diwzopjcg89e9t = {
    navigate: navigate,
    select: select,
    firstUpCheck: firstUpCheck,
    lastDownCheck: lastDownCheck
  };

  var findCell = function (target, isRoot) {
    return $_a6sun7kkjcg89dks.closest(target, 'td,th', isRoot);
  };
  var MouseSelection = function (bridge, container, isRoot, annotations) {
    var cursor = $_gj9ujrjgjcg89dgs.none();
    var clearState = function () {
      cursor = $_gj9ujrjgjcg89dgs.none();
    };
    var mousedown = function (event) {
      annotations.clear(container);
      cursor = findCell(event.target(), isRoot);
    };
    var mouseover = function (event) {
      cursor.each(function (start) {
        annotations.clear(container);
        findCell(event.target(), isRoot).each(function (finish) {
          $_84g87ml3jcg89dnh.identify(start, finish, isRoot).each(function (cellSel) {
            var boxes = cellSel.boxes().getOr([]);
            if (boxes.length > 1 || boxes.length === 1 && !$_fqkoktjyjcg89diy.eq(start, finish)) {
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

  var $_9gcudnp5jcg89edm = {
    down: {
      traverse: $_e07z69jwjcg89dip.nextSibling,
      gather: $_33lu9coujcg89ebl.after,
      relative: $_6lemaso3jcg89e5d.before,
      otherRetry: $_50su7eotjcg89eb3.tryDown,
      ieRetry: $_50su7eotjcg89eb3.ieTryDown,
      failure: $_eogmugozjcg89ec8.adt.failedDown
    },
    up: {
      traverse: $_e07z69jwjcg89dip.prevSibling,
      gather: $_33lu9coujcg89ebl.before,
      relative: $_6lemaso3jcg89e5d.before,
      otherRetry: $_50su7eotjcg89eb3.tryUp,
      ieRetry: $_50su7eotjcg89eb3.ieTryUp,
      failure: $_eogmugozjcg89ec8.adt.failedUp
    }
  };

  var rc = $_mgt0hjkjcg89dhb.immutable('rows', 'cols');
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
      return $_gj9ujrjgjcg89dgs.none();
    };
    var keydown = function (event, start, soffset, finish, foffset, direction) {
      var keycode = event.raw().which;
      var shiftKey = event.raw().shiftKey === true;
      var handler = $_84g87ml3jcg89dnh.retrieve(container, annotations.selectedSelector()).fold(function () {
        if ($_46w8v5okjcg89e8f.isDown(keycode) && shiftKey) {
          return $_3z1bpnjhjcg89dgu.curry($_91diwzopjcg89e9t.select, bridge, container, isRoot, $_9gcudnp5jcg89edm.down, finish, start, annotations.selectRange);
        } else if ($_46w8v5okjcg89e8f.isUp(keycode) && shiftKey) {
          return $_3z1bpnjhjcg89dgu.curry($_91diwzopjcg89e9t.select, bridge, container, isRoot, $_9gcudnp5jcg89edm.up, finish, start, annotations.selectRange);
        } else if ($_46w8v5okjcg89e8f.isDown(keycode)) {
          return $_3z1bpnjhjcg89dgu.curry($_91diwzopjcg89e9t.navigate, bridge, isRoot, $_9gcudnp5jcg89edm.down, finish, start, $_91diwzopjcg89e9t.lastDownCheck);
        } else if ($_46w8v5okjcg89e8f.isUp(keycode)) {
          return $_3z1bpnjhjcg89dgu.curry($_91diwzopjcg89e9t.navigate, bridge, isRoot, $_9gcudnp5jcg89edm.up, finish, start, $_91diwzopjcg89e9t.firstUpCheck);
        } else {
          return $_gj9ujrjgjcg89dgs.none;
        }
      }, function (selected) {
        var update = function (attempts) {
          return function () {
            var navigation = $_6epu4cm9jcg89du6.findMap(attempts, function (delta) {
              return $_bmnj1oojcg89e9i.update(delta.rows(), delta.cols(), container, selected, annotations);
            });
            return navigation.fold(function () {
              return $_84g87ml3jcg89dnh.getEdges(container, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(function (edges) {
                var relative = $_46w8v5okjcg89e8f.isDown(keycode) || direction.isForward(keycode) ? $_6lemaso3jcg89e5d.after : $_6lemaso3jcg89e5d.before;
                bridge.setRelativeSelection($_6lemaso3jcg89e5d.on(edges.first(), 0), relative(edges.table()));
                annotations.clear(container);
                return $_cqtvwqojjcg89e8a.response($_gj9ujrjgjcg89dgs.none(), true);
              });
            }, function (_) {
              return $_gj9ujrjgjcg89dgs.some($_cqtvwqojjcg89e8a.response($_gj9ujrjgjcg89dgs.none(), true));
            });
          };
        };
        if ($_46w8v5okjcg89e8f.isDown(keycode) && shiftKey)
          return update([rc(+1, 0)]);
        else if ($_46w8v5okjcg89e8f.isUp(keycode) && shiftKey)
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
        else if ($_46w8v5okjcg89e8f.isNavigation(keycode) && shiftKey === false)
          return clearToNavigate;
        else
          return $_gj9ujrjgjcg89dgs.none;
      });
      return handler();
    };
    var keyup = function (event, start, soffset, finish, foffset) {
      return $_84g87ml3jcg89dnh.retrieve(container, annotations.selectedSelector()).fold(function () {
        var keycode = event.raw().which;
        var shiftKey = event.raw().shiftKey === true;
        if (shiftKey === false)
          return $_gj9ujrjgjcg89dgs.none();
        if ($_46w8v5okjcg89e8f.isNavigation(keycode))
          return $_bmnj1oojcg89e9i.sync(container, isRoot, start, soffset, finish, foffset, annotations.selectRange);
        else
          return $_gj9ujrjgjcg89dgs.none();
      }, $_gj9ujrjgjcg89dgs.none);
    };
    return {
      keydown: keydown,
      keyup: keyup
    };
  };
  var $_3l7m6toijcg89e80 = {
    mouse: mouse,
    keyboard: keyboard
  };

  var add$3 = function (element, classes) {
    $_9786xxjfjcg89dgm.each(classes, function (x) {
      $_f0bxp7mkjcg89dw1.add(element, x);
    });
  };
  var remove$7 = function (element, classes) {
    $_9786xxjfjcg89dgm.each(classes, function (x) {
      $_f0bxp7mkjcg89dw1.remove(element, x);
    });
  };
  var toggle$2 = function (element, classes) {
    $_9786xxjfjcg89dgm.each(classes, function (x) {
      $_f0bxp7mkjcg89dw1.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return $_9786xxjfjcg89dgm.forall(classes, function (clazz) {
      return $_f0bxp7mkjcg89dw1.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return $_9786xxjfjcg89dgm.exists(classes, function (clazz) {
      return $_f0bxp7mkjcg89dw1.has(element, clazz);
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
    return $_4elenmmmjcg89dw4.supports(element) ? getNative(element) : $_4elenmmmjcg89dw4.get(element);
  };
  var $_d8j2t2p8jcg89ee6 = {
    add: add$3,
    remove: remove$7,
    toggle: toggle$2,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$11
  };

  var addClass = function (clazz) {
    return function (element) {
      $_f0bxp7mkjcg89dw1.add(element, clazz);
    };
  };
  var removeClass = function (clazz) {
    return function (element) {
      $_f0bxp7mkjcg89dw1.remove(element, clazz);
    };
  };
  var removeClasses = function (classes) {
    return function (element) {
      $_d8j2t2p8jcg89ee6.remove(element, classes);
    };
  };
  var hasClass = function (clazz) {
    return function (element) {
      return $_f0bxp7mkjcg89dw1.has(element, clazz);
    };
  };
  var $_9dyh3tp7jcg89ee4 = {
    addClass: addClass,
    removeClass: removeClass,
    removeClasses: removeClasses,
    hasClass: hasClass
  };

  var byClass = function (ephemera) {
    var addSelectionClass = $_9dyh3tp7jcg89ee4.addClass(ephemera.selected());
    var removeSelectionClasses = $_9dyh3tp7jcg89ee4.removeClasses([
      ephemera.selected(),
      ephemera.lastSelected(),
      ephemera.firstSelected()
    ]);
    var clear = function (container) {
      var sels = $_6f7vtwkhjcg89dkl.descendants(container, ephemera.selectedSelector());
      $_9786xxjfjcg89dgm.each(sels, removeSelectionClasses);
    };
    var selectRange = function (container, cells, start, finish) {
      clear(container);
      $_9786xxjfjcg89dgm.each(cells, addSelectionClass);
      $_f0bxp7mkjcg89dw1.add(start, ephemera.firstSelected());
      $_f0bxp7mkjcg89dw1.add(finish, ephemera.lastSelected());
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
      $_d6i8c7kfjcg89dkd.remove(element, ephemera.selected());
      $_d6i8c7kfjcg89dkd.remove(element, ephemera.firstSelected());
      $_d6i8c7kfjcg89dkd.remove(element, ephemera.lastSelected());
    };
    var addSelectionAttribute = function (element) {
      $_d6i8c7kfjcg89dkd.set(element, ephemera.selected(), '1');
    };
    var clear = function (container) {
      var sels = $_6f7vtwkhjcg89dkl.descendants(container, ephemera.selectedSelector());
      $_9786xxjfjcg89dgm.each(sels, removeSelectionAttributes);
    };
    var selectRange = function (container, cells, start, finish) {
      clear(container);
      $_9786xxjfjcg89dgm.each(cells, addSelectionAttribute);
      $_d6i8c7kfjcg89dkd.set(start, ephemera.firstSelected(), '1');
      $_d6i8c7kfjcg89dkd.set(finish, ephemera.lastSelected(), '1');
    };
    return {
      clear: clear,
      selectRange: selectRange,
      selectedSelector: ephemera.selectedSelector,
      firstSelectedSelector: ephemera.firstSelectedSelector,
      lastSelectedSelector: ephemera.lastSelectedSelector
    };
  };
  var $_duko2op6jcg89edt = {
    byClass: byClass,
    byAttr: byAttr
  };

  var CellSelection$1 = function (editor, lazyResize) {
    var handlerStruct = $_mgt0hjkjcg89dhb.immutableBag([
      'mousedown',
      'mouseover',
      'mouseup',
      'keyup',
      'keydown'
    ], []);
    var handlers = $_gj9ujrjgjcg89dgs.none();
    var annotations = $_duko2op6jcg89edt.byAttr($_aq10s8lfjcg89dpm);
    editor.on('init', function (e) {
      var win = editor.getWin();
      var body = $_9sl17zn1jcg89dyf.getBody(editor);
      var isRoot = $_9sl17zn1jcg89dyf.getIsRoot(editor);
      var syncSelection = function () {
        var sel = editor.selection;
        var start = $_a8yw3ijujcg89dik.fromDom(sel.getStart());
        var end = $_a8yw3ijujcg89dik.fromDom(sel.getEnd());
        var startTable = $_5igemtjrjcg89dhs.table(start);
        var endTable = $_5igemtjrjcg89dhs.table(end);
        var sameTable = startTable.bind(function (tableStart) {
          return endTable.bind(function (tableEnd) {
            return $_fqkoktjyjcg89diy.eq(tableStart, tableEnd) ? $_gj9ujrjgjcg89dgs.some(true) : $_gj9ujrjgjcg89dgs.none();
          });
        });
        sameTable.fold(function () {
          annotations.clear(body);
        }, $_3z1bpnjhjcg89dgu.noop);
      };
      var mouseHandlers = $_3l7m6toijcg89e80.mouse(win, body, isRoot, annotations);
      var keyHandlers = $_3l7m6toijcg89e80.keyboard(win, body, isRoot, annotations);
      var handleResponse = function (event, response) {
        if (response.kill()) {
          event.kill();
        }
        response.selection().each(function (ns) {
          var relative = $_ddz9kfo2jcg89e59.relative(ns.start(), ns.finish());
          var rng = $_b3o9hbo8jcg89e64.asLtrRange(win, relative);
          editor.selection.setRng(rng);
        });
      };
      var keyup = function (event) {
        var wrappedEvent = wrapEvent(event);
        if (wrappedEvent.raw().shiftKey && $_46w8v5okjcg89e8f.isNavigation(wrappedEvent.raw().which)) {
          var rng = editor.selection.getRng();
          var start = $_a8yw3ijujcg89dik.fromDom(rng.startContainer);
          var end = $_a8yw3ijujcg89dik.fromDom(rng.endContainer);
          keyHandlers.keyup(wrappedEvent, start, rng.startOffset, end, rng.endOffset).each(function (response) {
            handleResponse(wrappedEvent, response);
          });
        }
      };
      var checkLast = function (last) {
        return !$_d6i8c7kfjcg89dkd.has(last, 'data-mce-bogus') && $_a7udttkgjcg89dkj.name(last) !== 'br' && !($_a7udttkgjcg89dkj.isText(last) && $_8lwn8skxjcg89dmq.get(last).length === 0);
      };
      var getLast = function () {
        var body = $_a8yw3ijujcg89dik.fromDom(editor.getBody());
        var lastChild = $_e07z69jwjcg89dip.lastChild(body);
        var getPrevLast = function (last) {
          return $_e07z69jwjcg89dip.prevSibling(last).bind(function (prevLast) {
            return checkLast(prevLast) ? $_gj9ujrjgjcg89dgs.some(prevLast) : getPrevLast(prevLast);
          });
        };
        return lastChild.bind(function (last) {
          return checkLast(last) ? $_gj9ujrjgjcg89dgs.some(last) : getPrevLast(last);
        });
      };
      var keydown = function (event) {
        var wrappedEvent = wrapEvent(event);
        lazyResize().each(function (resize) {
          resize.hideBars();
        });
        if (event.which === 40) {
          getLast().each(function (last) {
            if ($_a7udttkgjcg89dkj.name(last) === 'table') {
              if (editor.settings.forced_root_block) {
                editor.dom.add(editor.getBody(), editor.settings.forced_root_block, editor.settings.forced_root_block_attrs, '<br/>');
              } else {
                editor.dom.add(editor.getBody(), 'br');
              }
            }
          });
        }
        var rng = editor.selection.getRng();
        var startContainer = $_a8yw3ijujcg89dik.fromDom(editor.selection.getStart());
        var start = $_a8yw3ijujcg89dik.fromDom(rng.startContainer);
        var end = $_a8yw3ijujcg89dik.fromDom(rng.endContainer);
        var direction = $_4ff18n2jcg89dyk.directionAt(startContainer).isRtl() ? $_46w8v5okjcg89e8f.rtl : $_46w8v5okjcg89e8f.ltr;
        keyHandlers.keydown(wrappedEvent, start, rng.startOffset, end, rng.endOffset, direction).each(function (response) {
          handleResponse(wrappedEvent, response);
        });
        lazyResize().each(function (resize) {
          resize.showBars();
        });
      };
      var wrapEvent = function (event) {
        var target = $_a8yw3ijujcg89dik.fromDom(event.target);
        var stop = function () {
          event.stopPropagation();
        };
        var prevent = function () {
          event.preventDefault();
        };
        var kill = $_3z1bpnjhjcg89dgu.compose(prevent, stop);
        return {
          target: $_3z1bpnjhjcg89dgu.constant(target),
          x: $_3z1bpnjhjcg89dgu.constant(event.x),
          y: $_3z1bpnjhjcg89dgu.constant(event.y),
          stop: stop,
          prevent: prevent,
          kill: kill,
          raw: $_3z1bpnjhjcg89dgu.constant(event)
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
      handlers = $_gj9ujrjgjcg89dgs.some(handlerStruct({
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
      var body = $_9sl17zn1jcg89dyf.getBody(editor);
      return $_7rfz9el2jcg89dnb.retrieve(body, $_aq10s8lfjcg89dpm.selectedSelector()).fold(function () {
        if (editor.selection.getStart() === undefined) {
          return $_fpa5brlgjcg89dpp.none();
        } else {
          return $_fpa5brlgjcg89dpp.single(editor.selection);
        }
      }, function (cells) {
        return $_fpa5brlgjcg89dpp.multiple(cells);
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
      onclick: $_3z1bpnjhjcg89dgu.curry($_2nublxn7jcg89dzc.open, editor, true),
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
  var $_b1fi5zpajcg89eei = {
    addButtons: addButtons,
    addToolbars: addToolbars
  };

  var addMenuItems = function (editor, selections) {
    var targets = $_gj9ujrjgjcg89dgs.none();
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
        $_9786xxjfjcg89dgm.each(tableCtrls, noTargetDisable);
        $_9786xxjfjcg89dgm.each(cellCtrls, noTargetDisable);
        $_9786xxjfjcg89dgm.each(mergeCtrls, noTargetDisable);
        $_9786xxjfjcg89dgm.each(unmergeCtrls, noTargetDisable);
      }, function (targets) {
        $_9786xxjfjcg89dgm.each(tableCtrls, ctrlEnable);
        $_9786xxjfjcg89dgm.each(cellCtrls, ctrlEnable);
        $_9786xxjfjcg89dgm.each(mergeCtrls, function (mergeCtrl) {
          mergeCtrl.disabled(targets.mergable().isNone());
        });
        $_9786xxjfjcg89dgm.each(unmergeCtrls, function (unmergeCtrl) {
          unmergeCtrl.disabled(targets.unmergable().isNone());
        });
      });
    };
    editor.on('init', function () {
      editor.on('nodechange', function (e) {
        var cellOpt = $_gj9ujrjgjcg89dgs.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        targets = cellOpt.bind(function (cellDom) {
          var cell = $_a8yw3ijujcg89dik.fromDom(cellDom);
          var table = $_5igemtjrjcg89dhs.table(cell);
          return table.map(function (table) {
            return $_1mg2tjl0jcg89dmz.forMenu(selections, table, cell);
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
      onclick: $_3z1bpnjhjcg89dgu.curry($_2nublxn7jcg89dzc.open, editor)
    } : {
      text: 'Table',
      icon: 'table',
      context: 'table',
      ariaHideMenu: true,
      onclick: function (e) {
        if (e.aria) {
          this.parent().hideAll();
          e.stopImmediatePropagation();
          $_2nublxn7jcg89dzc.open(editor);
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
                $_c7vlp7lijcg89dpt.insert(editor, self.lastX + 1, self.lastY + 1);
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
      onclick: $_3z1bpnjhjcg89dgu.curry($_2nublxn7jcg89dzc.open, editor, true)
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
  var $_ek0lumpbjcg89eem = { addMenuItems: addMenuItems };

  function Plugin(editor) {
    var self = this;
    var resizeHandler = ResizeHandler(editor);
    var cellSelection = CellSelection$1(editor, resizeHandler.lazyResize);
    var actions = TableActions(editor, resizeHandler.lazyWire);
    var selections = Selections(editor);
    $_bq1mz1n4jcg89dys.registerCommands(editor, actions, cellSelection, selections);
    $_2j8czijejcg89dg7.registerEvents(editor, selections, actions, cellSelection);
    $_ek0lumpbjcg89eem.addMenuItems(editor, selections);
    $_b1fi5zpajcg89eei.addButtons(editor);
    $_b1fi5zpajcg89eei.addToolbars(editor);
    editor.on('PreInit', function () {
      editor.serializer.addTempAttr($_aq10s8lfjcg89dpm.firstSelected());
      editor.serializer.addTempAttr($_aq10s8lfjcg89dpm.lastSelected());
    });
    if (editor.settings.table_tab_navigation !== false) {
      editor.on('keydown', function (e) {
        $_52ccoknzjcg89e4a.handle(e, editor, actions, resizeHandler.lazyWire);
      });
    }
    editor.on('remove', function () {
      resizeHandler.destroy();
      cellSelection.destroy();
    });
    self.insertTable = function (columns, rows) {
      return $_c7vlp7lijcg89dpt.insert(editor, columns, rows);
    };
    self.setClipboardRows = $_bq1mz1n4jcg89dys.setClipboardRows;
    self.getClipboardRows = $_bq1mz1n4jcg89dys.getClipboardRows;
  }
  PluginManager.add('table', Plugin);
  var Plugin$1 = function () {
  };

  return Plugin$1;

}());
})()
