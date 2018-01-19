(function () {
var mobile = (function () {
  'use strict';

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
  var $_9m9qz3wajcg89g5n = {
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

  var never = $_9m9qz3wajcg89g5n.never;
  var always = $_9m9qz3wajcg89g5n.always;
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
      toString: $_9m9qz3wajcg89g5n.constant('none()')
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
  var $_en0sddw9jcg89g5j = {
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
    return r === -1 ? $_en0sddw9jcg89g5j.none() : $_en0sddw9jcg89g5j.some(r);
  };
  var contains$1 = function (xs, x) {
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
        return $_en0sddw9jcg89g5j.some(x);
      }
    }
    return $_en0sddw9jcg89g5j.none();
  };
  var findIndex = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return $_en0sddw9jcg89g5j.some(i);
      }
    }
    return $_en0sddw9jcg89g5j.none();
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
      return !contains$1(a2, x);
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
    return xs.length === 0 ? $_en0sddw9jcg89g5j.none() : $_en0sddw9jcg89g5j.some(xs[0]);
  };
  var last = function (xs) {
    return xs.length === 0 ? $_en0sddw9jcg89g5j.none() : $_en0sddw9jcg89g5j.some(xs[xs.length - 1]);
  };
  var $_89wx8cw8jcg89g5d = {
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
    contains: contains$1,
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
  var $_3bpvjmwdjcg89g5v = {
    path: path,
    resolve: resolve,
    forge: forge,
    namespace: namespace
  };

  var unsafe = function (name, scope) {
    return $_3bpvjmwdjcg89g5v.resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_ujec4wcjcg89g5r = { getOrDie: getOrDie };

  var node = function () {
    var f = $_ujec4wcjcg89g5r.getOrDie('Node');
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
  var $_1y4l36wbjcg89g5p = {
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
  var $_4mkzmwgjcg89g60 = { cached: cached };

  var firstMatch = function (regexes, s) {
    for (var i = 0; i < regexes.length; i++) {
      var x = regexes[i];
      if (x.test(s))
        return x;
    }
    return undefined;
  };
  var find$1 = function (regexes, agent) {
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
    return find$1(versionRegexes, cleanedAgent);
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
  var $_e3h0gcwjjcg89g6b = {
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
      version: $_e3h0gcwjjcg89g6b.unknown()
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
  var $_djxqvrwijcg89g63 = {
    unknown: unknown,
    nu: nu,
    edge: $_9m9qz3wajcg89g5n.constant(edge),
    chrome: $_9m9qz3wajcg89g5n.constant(chrome),
    ie: $_9m9qz3wajcg89g5n.constant(ie),
    opera: $_9m9qz3wajcg89g5n.constant(opera),
    firefox: $_9m9qz3wajcg89g5n.constant(firefox),
    safari: $_9m9qz3wajcg89g5n.constant(safari)
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
      version: $_e3h0gcwjjcg89g6b.unknown()
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
  var $_bxsr0iwkjcg89g6c = {
    unknown: unknown$2,
    nu: nu$2,
    windows: $_9m9qz3wajcg89g5n.constant(windows),
    ios: $_9m9qz3wajcg89g5n.constant(ios),
    android: $_9m9qz3wajcg89g5n.constant(android),
    linux: $_9m9qz3wajcg89g5n.constant(linux),
    osx: $_9m9qz3wajcg89g5n.constant(osx),
    solaris: $_9m9qz3wajcg89g5n.constant(solaris),
    freebsd: $_9m9qz3wajcg89g5n.constant(freebsd)
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
      isiPad: $_9m9qz3wajcg89g5n.constant(isiPad),
      isiPhone: $_9m9qz3wajcg89g5n.constant(isiPhone),
      isTablet: $_9m9qz3wajcg89g5n.constant(isTablet),
      isPhone: $_9m9qz3wajcg89g5n.constant(isPhone),
      isTouch: $_9m9qz3wajcg89g5n.constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: $_9m9qz3wajcg89g5n.constant(iOSwebview)
    };
  };

  var detect$3 = function (candidates, userAgent) {
    var agent = String(userAgent).toLowerCase();
    return $_89wx8cw8jcg89g5d.find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$3(browsers, userAgent).map(function (browser) {
      var version = $_e3h0gcwjjcg89g6b.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$3(oses, userAgent).map(function (os) {
      var version = $_e3h0gcwjjcg89g6b.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_76t642wmjcg89g6i = {
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
  var $_5bz7cwpjcg89g6r = {
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
    return str === '' ? $_en0sddw9jcg89g5j.none() : $_en0sddw9jcg89g5j.some(str.substr(0, 1));
  };
  var tail = function (str) {
    return str === '' ? $_en0sddw9jcg89g5j.none() : $_en0sddw9jcg89g5j.some(str.substring(1));
  };
  var $_9mu7vawqjcg89g6s = {
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
    return startsWith(str, prefix) ? $_5bz7cwpjcg89g6r.removeFromStart(str, prefix.length) : str;
  };
  var removeTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? $_5bz7cwpjcg89g6r.removeFromEnd(str, prefix.length) : str;
  };
  var ensureLeading = function (str, prefix) {
    return startsWith(str, prefix) ? str : $_5bz7cwpjcg89g6r.addToStart(str, prefix);
  };
  var ensureTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? str : $_5bz7cwpjcg89g6r.addToEnd(str, prefix);
  };
  var contains$2 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };
  var capitalize = function (str) {
    return $_9mu7vawqjcg89g6s.head(str).bind(function (head) {
      return $_9mu7vawqjcg89g6s.tail(str).map(function (tail) {
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
  var $_g4nyklwojcg89g6p = {
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
      return $_g4nyklwojcg89g6p.contains(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = $_g4nyklwojcg89g6p.contains(uastring, 'edge/') && $_g4nyklwojcg89g6p.contains(uastring, 'chrome') && $_g4nyklwojcg89g6p.contains(uastring, 'safari') && $_g4nyklwojcg89g6p.contains(uastring, 'applewebkit');
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
        return $_g4nyklwojcg89g6p.contains(uastring, 'chrome') && !$_g4nyklwojcg89g6p.contains(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return $_g4nyklwojcg89g6p.contains(uastring, 'msie') || $_g4nyklwojcg89g6p.contains(uastring, 'trident');
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
        return ($_g4nyklwojcg89g6p.contains(uastring, 'safari') || $_g4nyklwojcg89g6p.contains(uastring, 'mobile/')) && $_g4nyklwojcg89g6p.contains(uastring, 'applewebkit');
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
        return $_g4nyklwojcg89g6p.contains(uastring, 'iphone') || $_g4nyklwojcg89g6p.contains(uastring, 'ipad');
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
  var $_etxya2wnjcg89g6l = {
    browsers: $_9m9qz3wajcg89g5n.constant(browsers),
    oses: $_9m9qz3wajcg89g5n.constant(oses)
  };

  var detect$1 = function (userAgent) {
    var browsers = $_etxya2wnjcg89g6l.browsers();
    var oses = $_etxya2wnjcg89g6l.oses();
    var browser = $_76t642wmjcg89g6i.detectBrowser(browsers, userAgent).fold($_djxqvrwijcg89g63.unknown, $_djxqvrwijcg89g63.nu);
    var os = $_76t642wmjcg89g6i.detectOs(oses, userAgent).fold($_bxsr0iwkjcg89g6c.unknown, $_bxsr0iwkjcg89g6c.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_ccytqzwhjcg89g62 = { detect: detect$1 };

  var detect = $_4mkzmwgjcg89g60.cached(function () {
    var userAgent = navigator.userAgent;
    return $_ccytqzwhjcg89g62.detect(userAgent);
  });
  var $_aoftmbwfjcg89g5y = { detect: detect };

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
    return { dom: $_9m9qz3wajcg89g5n.constant(node) };
  };
  var fromPoint = function (doc, x, y) {
    return $_en0sddw9jcg89g5j.from(doc.dom().elementFromPoint(x, y)).map(fromDom);
  };
  var $_a3ihziwsjcg89g6w = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_5zticpwtjcg89g72 = {
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

  var ELEMENT = $_5zticpwtjcg89g72.ELEMENT;
  var DOCUMENT = $_5zticpwtjcg89g72.DOCUMENT;
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
    return bypassSelector(base) ? [] : $_89wx8cw8jcg89g5d.map(base.querySelectorAll(selector), $_a3ihziwsjcg89g6w.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? $_en0sddw9jcg89g5j.none() : $_en0sddw9jcg89g5j.from(base.querySelector(selector)).map($_a3ihziwsjcg89g6w.fromDom);
  };
  var $_4cgirewrjcg89g6t = {
    all: all,
    is: is,
    one: one
  };

  var eq = function (e1, e2) {
    return e1.dom() === e2.dom();
  };
  var isEqualNode = function (e1, e2) {
    return e1.dom().isEqualNode(e2.dom());
  };
  var member = function (element, elements) {
    return $_89wx8cw8jcg89g5d.exists(elements, $_9m9qz3wajcg89g5n.curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_1y4l36wbjcg89g5p.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_aoftmbwfjcg89g5y.detect().browser;
  var contains = browser.isIE() ? ieContains : regularContains;
  var $_n5s8aw7jcg89g53 = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains,
    is: $_4cgirewrjcg89g6t.is
  };

  var isSource = function (component, simulatedEvent) {
    return $_n5s8aw7jcg89g53.eq(component.element(), simulatedEvent.event().target());
  };
  var $_7xtpkaw6jcg89g4x = { isSource: isSource };

  var $_3338ovwwjcg89g7g = {
    contextmenu: $_9m9qz3wajcg89g5n.constant('contextmenu'),
    touchstart: $_9m9qz3wajcg89g5n.constant('touchstart'),
    touchmove: $_9m9qz3wajcg89g5n.constant('touchmove'),
    touchend: $_9m9qz3wajcg89g5n.constant('touchend'),
    gesturestart: $_9m9qz3wajcg89g5n.constant('gesturestart'),
    mousedown: $_9m9qz3wajcg89g5n.constant('mousedown'),
    mousemove: $_9m9qz3wajcg89g5n.constant('mousemove'),
    mouseout: $_9m9qz3wajcg89g5n.constant('mouseout'),
    mouseup: $_9m9qz3wajcg89g5n.constant('mouseup'),
    mouseover: $_9m9qz3wajcg89g5n.constant('mouseover'),
    focusin: $_9m9qz3wajcg89g5n.constant('focusin'),
    keydown: $_9m9qz3wajcg89g5n.constant('keydown'),
    input: $_9m9qz3wajcg89g5n.constant('input'),
    change: $_9m9qz3wajcg89g5n.constant('change'),
    focus: $_9m9qz3wajcg89g5n.constant('focus'),
    click: $_9m9qz3wajcg89g5n.constant('click'),
    transitionend: $_9m9qz3wajcg89g5n.constant('transitionend'),
    selectstart: $_9m9qz3wajcg89g5n.constant('selectstart')
  };

  var alloy = { tap: $_9m9qz3wajcg89g5n.constant('alloy.tap') };
  var $_f1ifvdwvjcg89g7a = {
    focus: $_9m9qz3wajcg89g5n.constant('alloy.focus'),
    postBlur: $_9m9qz3wajcg89g5n.constant('alloy.blur.post'),
    receive: $_9m9qz3wajcg89g5n.constant('alloy.receive'),
    execute: $_9m9qz3wajcg89g5n.constant('alloy.execute'),
    focusItem: $_9m9qz3wajcg89g5n.constant('alloy.focus.item'),
    tap: alloy.tap,
    tapOrClick: $_aoftmbwfjcg89g5y.detect().deviceType.isTouch() ? alloy.tap : $_3338ovwwjcg89g7g.click,
    longpress: $_9m9qz3wajcg89g5n.constant('alloy.longpress'),
    sandboxClose: $_9m9qz3wajcg89g5n.constant('alloy.sandbox.close'),
    systemInit: $_9m9qz3wajcg89g5n.constant('alloy.system.init'),
    windowScroll: $_9m9qz3wajcg89g5n.constant('alloy.system.scroll'),
    attachedToDom: $_9m9qz3wajcg89g5n.constant('alloy.system.attached'),
    detachedFromDom: $_9m9qz3wajcg89g5n.constant('alloy.system.detached'),
    changeTab: $_9m9qz3wajcg89g5n.constant('alloy.change.tab'),
    dismissTab: $_9m9qz3wajcg89g5n.constant('alloy.dismiss.tab')
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
  var $_405i8jwyjcg89g7l = {
    isString: isType('string'),
    isObject: isType('object'),
    isArray: isType('array'),
    isNull: isType('null'),
    isBoolean: isType('boolean'),
    isUndefined: isType('undefined'),
    isFunction: isType('function'),
    isNumber: isType('number')
  };

  var shallow = function (old, nu) {
    return nu;
  };
  var deep = function (old, nu) {
    var bothObjects = $_405i8jwyjcg89g7l.isObject(old) && $_405i8jwyjcg89g7l.isObject(nu);
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
  var deepMerge = baseMerge(deep);
  var merge = baseMerge(shallow);
  var $_5mo1ztwxjcg89g7j = {
    deepMerge: deepMerge,
    merge: merge
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
  var find$2 = function (obj, pred) {
    var props = keys(obj);
    for (var k = 0, len = props.length; k < len; k++) {
      var i = props[k];
      var x = obj[i];
      if (pred(x, i, obj)) {
        return $_en0sddw9jcg89g5j.some(x);
      }
    }
    return $_en0sddw9jcg89g5j.none();
  };
  var values = function (obj) {
    return mapToArray(obj, function (v) {
      return v;
    });
  };
  var size = function (obj) {
    return values(obj).length;
  };
  var $_gbrpaqwzjcg89g7p = {
    bifilter: bifilter,
    each: each$1,
    map: objectMap,
    mapToArray: mapToArray,
    tupleMap: tupleMap,
    find: find$2,
    keys: keys,
    values: values,
    size: size
  };

  var emit = function (component, event) {
    dispatchWith(component, component.element(), event, {});
  };
  var emitWith = function (component, event, properties) {
    dispatchWith(component, component.element(), event, properties);
  };
  var emitExecute = function (component) {
    emit(component, $_f1ifvdwvjcg89g7a.execute());
  };
  var dispatch = function (component, target, event) {
    dispatchWith(component, target, event, {});
  };
  var dispatchWith = function (component, target, event, properties) {
    var data = $_5mo1ztwxjcg89g7j.deepMerge({ target: target }, properties);
    component.getSystem().triggerEvent(event, target, $_gbrpaqwzjcg89g7p.map(data, $_9m9qz3wajcg89g5n.constant));
  };
  var dispatchEvent = function (component, target, event, simulatedEvent) {
    component.getSystem().triggerEvent(event, target, simulatedEvent.event());
  };
  var dispatchFocus = function (component, target) {
    component.getSystem().triggerFocus(target, component.element());
  };
  var $_fpm2ctwujcg89g73 = {
    emit: emit,
    emitWith: emitWith,
    emitExecute: emitExecute,
    dispatch: dispatch,
    dispatchWith: dispatchWith,
    dispatchEvent: dispatchEvent,
    dispatchFocus: dispatchFocus
  };

  var generate = function (cases) {
    if (!$_405i8jwyjcg89g7l.isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    $_89wx8cw8jcg89g5d.each(cases, function (acase, count) {
      var keys = $_gbrpaqwzjcg89g7p.keys(acase);
      if (keys.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!$_405i8jwyjcg89g7l.isArray(value)) {
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
          var branchKeys = $_gbrpaqwzjcg89g7p.keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = $_89wx8cw8jcg89g5d.forall(constructors, function (reqKey) {
            return $_89wx8cw8jcg89g5d.contains(branchKeys, reqKey);
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
  var $_6nnct0x3jcg89g8q = { generate: generate };

  var adt = $_6nnct0x3jcg89g8q.generate([
    { strict: [] },
    { defaultedThunk: ['fallbackThunk'] },
    { asOption: [] },
    { asDefaultedOptionThunk: ['fallbackThunk'] },
    { mergeWithThunk: ['baseThunk'] }
  ]);
  var defaulted$1 = function (fallback) {
    return adt.defaultedThunk($_9m9qz3wajcg89g5n.constant(fallback));
  };
  var asDefaultedOption = function (fallback) {
    return adt.asDefaultedOptionThunk($_9m9qz3wajcg89g5n.constant(fallback));
  };
  var mergeWith = function (base) {
    return adt.mergeWithThunk($_9m9qz3wajcg89g5n.constant(base));
  };
  var $_562y16x2jcg89g8j = {
    strict: adt.strict,
    asOption: adt.asOption,
    defaulted: defaulted$1,
    defaultedThunk: adt.defaultedThunk,
    asDefaultedOption: asDefaultedOption,
    asDefaultedOptionThunk: adt.asDefaultedOptionThunk,
    mergeWith: mergeWith,
    mergeWithThunk: adt.mergeWithThunk
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
      return $_en0sddw9jcg89g5j.some(o);
    };
    return {
      is: is,
      isValue: $_9m9qz3wajcg89g5n.constant(true),
      isError: $_9m9qz3wajcg89g5n.constant(false),
      getOr: $_9m9qz3wajcg89g5n.constant(o),
      getOrThunk: $_9m9qz3wajcg89g5n.constant(o),
      getOrDie: $_9m9qz3wajcg89g5n.constant(o),
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
      return $_9m9qz3wajcg89g5n.die(message)();
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
      is: $_9m9qz3wajcg89g5n.constant(false),
      isValue: $_9m9qz3wajcg89g5n.constant(false),
      isError: $_9m9qz3wajcg89g5n.constant(true),
      getOr: $_9m9qz3wajcg89g5n.identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: $_9m9qz3wajcg89g5n.noop,
      bind: bind,
      exists: $_9m9qz3wajcg89g5n.constant(false),
      forall: $_9m9qz3wajcg89g5n.constant(true),
      toOption: $_en0sddw9jcg89g5j.none
    };
  };
  var $_b8l9yux7jcg89g9z = {
    value: value$1,
    error: error
  };

  var comparison = $_6nnct0x3jcg89g8q.generate([
    {
      bothErrors: [
        'error1',
        'error2'
      ]
    },
    {
      firstError: [
        'error1',
        'value2'
      ]
    },
    {
      secondError: [
        'value1',
        'error2'
      ]
    },
    {
      bothValues: [
        'value1',
        'value2'
      ]
    }
  ]);
  var partition$1 = function (results) {
    var errors = [];
    var values = [];
    $_89wx8cw8jcg89g5d.each(results, function (result) {
      result.fold(function (err) {
        errors.push(err);
      }, function (value) {
        values.push(value);
      });
    });
    return {
      errors: errors,
      values: values
    };
  };
  var compare = function (result1, result2) {
    return result1.fold(function (err1) {
      return result2.fold(function (err2) {
        return comparison.bothErrors(err1, err2);
      }, function (val2) {
        return comparison.firstError(err1, val2);
      });
    }, function (val1) {
      return result2.fold(function (err2) {
        return comparison.secondError(val1, err2);
      }, function (val2) {
        return comparison.bothValues(val1, val2);
      });
    });
  };
  var $_dpp7msx8jcg89ga2 = {
    partition: partition$1,
    compare: compare
  };

  var mergeValues = function (values, base) {
    return $_b8l9yux7jcg89g9z.value($_5mo1ztwxjcg89g7j.deepMerge.apply(undefined, [base].concat(values)));
  };
  var mergeErrors = function (errors) {
    return $_9m9qz3wajcg89g5n.compose($_b8l9yux7jcg89g9z.error, $_89wx8cw8jcg89g5d.flatten)(errors);
  };
  var consolidateObj = function (objects, base) {
    var partitions = $_dpp7msx8jcg89ga2.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
  };
  var consolidateArr = function (objects) {
    var partitions = $_dpp7msx8jcg89ga2.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : $_b8l9yux7jcg89g9z.value(partitions.values);
  };
  var $_c1fbwpx6jcg89g9n = {
    consolidateObj: consolidateObj,
    consolidateArr: consolidateArr
  };

  var narrow$1 = function (obj, fields) {
    var r = {};
    $_89wx8cw8jcg89g5d.each(fields, function (field) {
      if (obj[field] !== undefined && obj.hasOwnProperty(field))
        r[field] = obj[field];
    });
    return r;
  };
  var indexOnKey$1 = function (array, key) {
    var obj = {};
    $_89wx8cw8jcg89g5d.each(array, function (a) {
      var keyValue = a[key];
      obj[keyValue] = a;
    });
    return obj;
  };
  var exclude$1 = function (obj, fields) {
    var r = {};
    $_gbrpaqwzjcg89g7p.each(obj, function (v, k) {
      if (!$_89wx8cw8jcg89g5d.contains(fields, k)) {
        r[k] = v;
      }
    });
    return r;
  };
  var $_dpj05ex9jcg89ga4 = {
    narrow: narrow$1,
    exclude: exclude$1,
    indexOnKey: indexOnKey$1
  };

  var readOpt$1 = function (key) {
    return function (obj) {
      return obj.hasOwnProperty(key) ? $_en0sddw9jcg89g5j.from(obj[key]) : $_en0sddw9jcg89g5j.none();
    };
  };
  var readOr$1 = function (key, fallback) {
    return function (obj) {
      return readOpt$1(key)(obj).getOr(fallback);
    };
  };
  var readOptFrom$1 = function (obj, key) {
    return readOpt$1(key)(obj);
  };
  var hasKey$1 = function (obj, key) {
    return obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null;
  };
  var $_cbaepkxajcg89ga8 = {
    readOpt: readOpt$1,
    readOr: readOr$1,
    readOptFrom: readOptFrom$1,
    hasKey: hasKey$1
  };

  var wrap$1 = function (key, value) {
    var r = {};
    r[key] = value;
    return r;
  };
  var wrapAll$1 = function (keyvalues) {
    var r = {};
    $_89wx8cw8jcg89g5d.each(keyvalues, function (kv) {
      r[kv.key] = kv.value;
    });
    return r;
  };
  var $_4467wexbjcg89gac = {
    wrap: wrap$1,
    wrapAll: wrapAll$1
  };

  var narrow = function (obj, fields) {
    return $_dpj05ex9jcg89ga4.narrow(obj, fields);
  };
  var exclude = function (obj, fields) {
    return $_dpj05ex9jcg89ga4.exclude(obj, fields);
  };
  var readOpt = function (key) {
    return $_cbaepkxajcg89ga8.readOpt(key);
  };
  var readOr = function (key, fallback) {
    return $_cbaepkxajcg89ga8.readOr(key, fallback);
  };
  var readOptFrom = function (obj, key) {
    return $_cbaepkxajcg89ga8.readOptFrom(obj, key);
  };
  var wrap = function (key, value) {
    return $_4467wexbjcg89gac.wrap(key, value);
  };
  var wrapAll = function (keyvalues) {
    return $_4467wexbjcg89gac.wrapAll(keyvalues);
  };
  var indexOnKey = function (array, key) {
    return $_dpj05ex9jcg89ga4.indexOnKey(array, key);
  };
  var consolidate = function (objs, base) {
    return $_c1fbwpx6jcg89g9n.consolidateObj(objs, base);
  };
  var hasKey = function (obj, key) {
    return $_cbaepkxajcg89ga8.hasKey(obj, key);
  };
  var $_b52oxhx5jcg89g9l = {
    narrow: narrow,
    exclude: exclude,
    readOpt: readOpt,
    readOr: readOr,
    readOptFrom: readOptFrom,
    wrap: wrap,
    wrapAll: wrapAll,
    indexOnKey: indexOnKey,
    hasKey: hasKey,
    consolidate: consolidate
  };

  var json = function () {
    return $_ujec4wcjcg89g5r.getOrDie('JSON');
  };
  var parse = function (obj) {
    return json().parse(obj);
  };
  var stringify = function (obj, replacer, space) {
    return json().stringify(obj, replacer, space);
  };
  var $_3nrfsfxejcg89gat = {
    parse: parse,
    stringify: stringify
  };

  var formatObj = function (input) {
    return $_405i8jwyjcg89g7l.isObject(input) && $_gbrpaqwzjcg89g7p.keys(input).length > 100 ? ' removed due to size' : $_3nrfsfxejcg89gat.stringify(input, null, 2);
  };
  var formatErrors = function (errors) {
    var es = errors.length > 10 ? errors.slice(0, 10).concat([{
        path: [],
        getErrorInfo: function () {
          return '... (only showing first ten failures)';
        }
      }]) : errors;
    return $_89wx8cw8jcg89g5d.map(es, function (e) {
      return 'Failed path: (' + e.path.join(' > ') + ')\n' + e.getErrorInfo();
    });
  };
  var $_ev34wxxdjcg89gal = {
    formatObj: formatObj,
    formatErrors: formatErrors
  };

  var nu$4 = function (path, getErrorInfo) {
    return $_b8l9yux7jcg89g9z.error([{
        path: path,
        getErrorInfo: getErrorInfo
      }]);
  };
  var missingStrict = function (path, key, obj) {
    return nu$4(path, function () {
      return 'Could not find valid *strict* value for "' + key + '" in ' + $_ev34wxxdjcg89gal.formatObj(obj);
    });
  };
  var missingKey = function (path, key) {
    return nu$4(path, function () {
      return 'Choice schema did not contain choice key: "' + key + '"';
    });
  };
  var missingBranch = function (path, branches, branch) {
    return nu$4(path, function () {
      return 'The chosen schema: "' + branch + '" did not exist in branches: ' + $_ev34wxxdjcg89gal.formatObj(branches);
    });
  };
  var unsupportedFields = function (path, unsupported) {
    return nu$4(path, function () {
      return 'There are unsupported fields: [' + unsupported.join(', ') + '] specified';
    });
  };
  var custom = function (path, err) {
    return nu$4(path, function () {
      return err;
    });
  };
  var toString = function (error) {
    return 'Failed path: (' + error.path.join(' > ') + ')\n' + error.getErrorInfo();
  };
  var $_bggewgxcjcg89gah = {
    missingStrict: missingStrict,
    missingKey: missingKey,
    missingBranch: missingBranch,
    unsupportedFields: unsupportedFields,
    custom: custom,
    toString: toString
  };

  var typeAdt = $_6nnct0x3jcg89g8q.generate([
    {
      setOf: [
        'validator',
        'valueType'
      ]
    },
    { arrOf: ['valueType'] },
    { objOf: ['fields'] },
    { itemOf: ['validator'] },
    {
      choiceOf: [
        'key',
        'branches'
      ]
    }
  ]);
  var fieldAdt = $_6nnct0x3jcg89g8q.generate([
    {
      field: [
        'name',
        'presence',
        'type'
      ]
    },
    { state: ['name'] }
  ]);
  var $_9c4pmfxfjcg89gau = {
    typeAdt: typeAdt,
    fieldAdt: fieldAdt
  };

  var adt$1 = $_6nnct0x3jcg89g8q.generate([
    {
      field: [
        'key',
        'okey',
        'presence',
        'prop'
      ]
    },
    {
      state: [
        'okey',
        'instantiator'
      ]
    }
  ]);
  var output = function (okey, value) {
    return adt$1.state(okey, $_9m9qz3wajcg89g5n.constant(value));
  };
  var snapshot = function (okey) {
    return adt$1.state(okey, $_9m9qz3wajcg89g5n.identity);
  };
  var strictAccess = function (path, obj, key) {
    return $_cbaepkxajcg89ga8.readOptFrom(obj, key).fold(function () {
      return $_bggewgxcjcg89gah.missingStrict(path, key, obj);
    }, $_b8l9yux7jcg89g9z.value);
  };
  var fallbackAccess = function (obj, key, fallbackThunk) {
    var v = $_cbaepkxajcg89ga8.readOptFrom(obj, key).fold(function () {
      return fallbackThunk(obj);
    }, $_9m9qz3wajcg89g5n.identity);
    return $_b8l9yux7jcg89g9z.value(v);
  };
  var optionAccess = function (obj, key) {
    return $_b8l9yux7jcg89g9z.value($_cbaepkxajcg89ga8.readOptFrom(obj, key));
  };
  var optionDefaultedAccess = function (obj, key, fallback) {
    var opt = $_cbaepkxajcg89ga8.readOptFrom(obj, key).map(function (val) {
      return val === true ? fallback(obj) : val;
    });
    return $_b8l9yux7jcg89g9z.value(opt);
  };
  var cExtractOne = function (path, obj, field, strength) {
    return field.fold(function (key, okey, presence, prop) {
      var bundle = function (av) {
        return prop.extract(path.concat([key]), strength, av).map(function (res) {
          return $_4467wexbjcg89gac.wrap(okey, strength(res));
        });
      };
      var bundleAsOption = function (optValue) {
        return optValue.fold(function () {
          var outcome = $_4467wexbjcg89gac.wrap(okey, strength($_en0sddw9jcg89g5j.none()));
          return $_b8l9yux7jcg89g9z.value(outcome);
        }, function (ov) {
          return prop.extract(path.concat([key]), strength, ov).map(function (res) {
            return $_4467wexbjcg89gac.wrap(okey, strength($_en0sddw9jcg89g5j.some(res)));
          });
        });
      };
      return function () {
        return presence.fold(function () {
          return strictAccess(path, obj, key).bind(bundle);
        }, function (fallbackThunk) {
          return fallbackAccess(obj, key, fallbackThunk).bind(bundle);
        }, function () {
          return optionAccess(obj, key).bind(bundleAsOption);
        }, function (fallbackThunk) {
          return optionDefaultedAccess(obj, key, fallbackThunk).bind(bundleAsOption);
        }, function (baseThunk) {
          var base = baseThunk(obj);
          return fallbackAccess(obj, key, $_9m9qz3wajcg89g5n.constant({})).map(function (v) {
            return $_5mo1ztwxjcg89g7j.deepMerge(base, v);
          }).bind(bundle);
        });
      }();
    }, function (okey, instantiator) {
      var state = instantiator(obj);
      return $_b8l9yux7jcg89g9z.value($_4467wexbjcg89gac.wrap(okey, strength(state)));
    });
  };
  var cExtract = function (path, obj, fields, strength) {
    var results = $_89wx8cw8jcg89g5d.map(fields, function (field) {
      return cExtractOne(path, obj, field, strength);
    });
    return $_c1fbwpx6jcg89g9n.consolidateObj(results, {});
  };
  var value = function (validator) {
    var extract = function (path, strength, val) {
      return validator(val).fold(function (err) {
        return $_bggewgxcjcg89gah.custom(path, err);
      }, $_b8l9yux7jcg89g9z.value);
    };
    var toString = function () {
      return 'val';
    };
    var toDsl = function () {
      return $_9c4pmfxfjcg89gau.typeAdt.itemOf(validator);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var getSetKeys = function (obj) {
    var keys = $_gbrpaqwzjcg89g7p.keys(obj);
    return $_89wx8cw8jcg89g5d.filter(keys, function (k) {
      return $_b52oxhx5jcg89g9l.hasKey(obj, k);
    });
  };
  var objOnly = function (fields) {
    var delegate = obj(fields);
    var fieldNames = $_89wx8cw8jcg89g5d.foldr(fields, function (acc, f) {
      return f.fold(function (key) {
        return $_5mo1ztwxjcg89g7j.deepMerge(acc, $_b52oxhx5jcg89g9l.wrap(key, true));
      }, $_9m9qz3wajcg89g5n.constant(acc));
    }, {});
    var extract = function (path, strength, o) {
      var keys = $_405i8jwyjcg89g7l.isBoolean(o) ? [] : getSetKeys(o);
      var extra = $_89wx8cw8jcg89g5d.filter(keys, function (k) {
        return !$_b52oxhx5jcg89g9l.hasKey(fieldNames, k);
      });
      return extra.length === 0 ? delegate.extract(path, strength, o) : $_bggewgxcjcg89gah.unsupportedFields(path, extra);
    };
    return {
      extract: extract,
      toString: delegate.toString,
      toDsl: delegate.toDsl
    };
  };
  var obj = function (fields) {
    var extract = function (path, strength, o) {
      return cExtract(path, o, fields, strength);
    };
    var toString = function () {
      var fieldStrings = $_89wx8cw8jcg89g5d.map(fields, function (field) {
        return field.fold(function (key, okey, presence, prop) {
          return key + ' -> ' + prop.toString();
        }, function (okey, instantiator) {
          return 'state(' + okey + ')';
        });
      });
      return 'obj{\n' + fieldStrings.join('\n') + '}';
    };
    var toDsl = function () {
      return $_9c4pmfxfjcg89gau.typeAdt.objOf($_89wx8cw8jcg89g5d.map(fields, function (f) {
        return f.fold(function (key, okey, presence, prop) {
          return $_9c4pmfxfjcg89gau.fieldAdt.field(key, presence, prop);
        }, function (okey, instantiator) {
          return $_9c4pmfxfjcg89gau.fieldAdt.state(okey);
        });
      }));
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var arr = function (prop) {
    var extract = function (path, strength, array) {
      var results = $_89wx8cw8jcg89g5d.map(array, function (a, i) {
        return prop.extract(path.concat(['[' + i + ']']), strength, a);
      });
      return $_c1fbwpx6jcg89g9n.consolidateArr(results);
    };
    var toString = function () {
      return 'array(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_9c4pmfxfjcg89gau.typeAdt.arrOf(prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var setOf = function (validator, prop) {
    var validateKeys = function (path, keys) {
      return arr(value(validator)).extract(path, $_9m9qz3wajcg89g5n.identity, keys);
    };
    var extract = function (path, strength, o) {
      var keys = $_gbrpaqwzjcg89g7p.keys(o);
      return validateKeys(path, keys).bind(function (validKeys) {
        var schema = $_89wx8cw8jcg89g5d.map(validKeys, function (vk) {
          return adt$1.field(vk, vk, $_562y16x2jcg89g8j.strict(), prop);
        });
        return obj(schema).extract(path, strength, o);
      });
    };
    var toString = function () {
      return 'setOf(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_9c4pmfxfjcg89gau.typeAdt.setOf(validator, prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var anyValue = value($_b8l9yux7jcg89g9z.value);
  var arrOfObj = $_9m9qz3wajcg89g5n.compose(arr, obj);
  var $_998ptmx4jcg89g8w = {
    anyValue: $_9m9qz3wajcg89g5n.constant(anyValue),
    value: value,
    obj: obj,
    objOnly: objOnly,
    arr: arr,
    setOf: setOf,
    arrOfObj: arrOfObj,
    state: adt$1.state,
    field: adt$1.field,
    output: output,
    snapshot: snapshot
  };

  var strict = function (key) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.strict(), $_998ptmx4jcg89g8w.anyValue());
  };
  var strictOf = function (key, schema) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.strict(), schema);
  };
  var strictFunction = function (key) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.strict(), $_998ptmx4jcg89g8w.value(function (f) {
      return $_405i8jwyjcg89g7l.isFunction(f) ? $_b8l9yux7jcg89g9z.value(f) : $_b8l9yux7jcg89g9z.error('Not a function');
    }));
  };
  var forbid = function (key, message) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.asOption(), $_998ptmx4jcg89g8w.value(function (v) {
      return $_b8l9yux7jcg89g9z.error('The field: ' + key + ' is forbidden. ' + message);
    }));
  };
  var strictArrayOf = function (key, prop) {
    return strictOf(key, prop);
  };
  var strictObjOf = function (key, objSchema) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.strict(), $_998ptmx4jcg89g8w.obj(objSchema));
  };
  var strictArrayOfObj = function (key, objFields) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.strict(), $_998ptmx4jcg89g8w.arrOfObj(objFields));
  };
  var option = function (key) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.asOption(), $_998ptmx4jcg89g8w.anyValue());
  };
  var optionOf = function (key, schema) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.asOption(), schema);
  };
  var optionObjOf = function (key, objSchema) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.asOption(), $_998ptmx4jcg89g8w.obj(objSchema));
  };
  var optionObjOfOnly = function (key, objSchema) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.asOption(), $_998ptmx4jcg89g8w.objOnly(objSchema));
  };
  var defaulted = function (key, fallback) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.defaulted(fallback), $_998ptmx4jcg89g8w.anyValue());
  };
  var defaultedOf = function (key, fallback, schema) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.defaulted(fallback), schema);
  };
  var defaultedObjOf = function (key, fallback, objSchema) {
    return $_998ptmx4jcg89g8w.field(key, key, $_562y16x2jcg89g8j.defaulted(fallback), $_998ptmx4jcg89g8w.obj(objSchema));
  };
  var field = function (key, okey, presence, prop) {
    return $_998ptmx4jcg89g8w.field(key, okey, presence, prop);
  };
  var state = function (okey, instantiator) {
    return $_998ptmx4jcg89g8w.state(okey, instantiator);
  };
  var $_76kfpx1jcg89g86 = {
    strict: strict,
    strictOf: strictOf,
    strictObjOf: strictObjOf,
    strictArrayOf: strictArrayOf,
    strictArrayOfObj: strictArrayOfObj,
    strictFunction: strictFunction,
    forbid: forbid,
    option: option,
    optionOf: optionOf,
    optionObjOf: optionObjOf,
    optionObjOfOnly: optionObjOfOnly,
    defaulted: defaulted,
    defaultedOf: defaultedOf,
    defaultedObjOf: defaultedObjOf,
    field: field,
    state: state
  };

  var chooseFrom = function (path, strength, input, branches, ch) {
    var fields = $_b52oxhx5jcg89g9l.readOptFrom(branches, ch);
    return fields.fold(function () {
      return $_bggewgxcjcg89gah.missingBranch(path, branches, ch);
    }, function (fs) {
      return $_998ptmx4jcg89g8w.obj(fs).extract(path.concat(['branch: ' + ch]), strength, input);
    });
  };
  var choose$1 = function (key, branches) {
    var extract = function (path, strength, input) {
      var choice = $_b52oxhx5jcg89g9l.readOptFrom(input, key);
      return choice.fold(function () {
        return $_bggewgxcjcg89gah.missingKey(path, key);
      }, function (chosen) {
        return chooseFrom(path, strength, input, branches, chosen);
      });
    };
    var toString = function () {
      return 'chooseOn(' + key + '). Possible values: ' + $_gbrpaqwzjcg89g7p.keys(branches);
    };
    var toDsl = function () {
      return $_9c4pmfxfjcg89gau.typeAdt.choiceOf(key, branches);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var $_d7frflxhjcg89gb0 = { choose: choose$1 };

  var anyValue$1 = $_998ptmx4jcg89g8w.value($_b8l9yux7jcg89g9z.value);
  var arrOfObj$1 = function (objFields) {
    return $_998ptmx4jcg89g8w.arrOfObj(objFields);
  };
  var arrOfVal = function () {
    return $_998ptmx4jcg89g8w.arr(anyValue$1);
  };
  var arrOf = $_998ptmx4jcg89g8w.arr;
  var objOf = $_998ptmx4jcg89g8w.obj;
  var objOfOnly = $_998ptmx4jcg89g8w.objOnly;
  var setOf$1 = $_998ptmx4jcg89g8w.setOf;
  var valueOf = function (validator) {
    return $_998ptmx4jcg89g8w.value(validator);
  };
  var extract = function (label, prop, strength, obj) {
    return prop.extract([label], strength, obj).fold(function (errs) {
      return $_b8l9yux7jcg89g9z.error({
        input: obj,
        errors: errs
      });
    }, $_b8l9yux7jcg89g9z.value);
  };
  var asStruct = function (label, prop, obj) {
    return extract(label, prop, $_9m9qz3wajcg89g5n.constant, obj);
  };
  var asRaw = function (label, prop, obj) {
    return extract(label, prop, $_9m9qz3wajcg89g5n.identity, obj);
  };
  var getOrDie$1 = function (extraction) {
    return extraction.fold(function (errInfo) {
      throw new Error(formatError(errInfo));
    }, $_9m9qz3wajcg89g5n.identity);
  };
  var asRawOrDie = function (label, prop, obj) {
    return getOrDie$1(asRaw(label, prop, obj));
  };
  var asStructOrDie = function (label, prop, obj) {
    return getOrDie$1(asStruct(label, prop, obj));
  };
  var formatError = function (errInfo) {
    return 'Errors: \n' + $_ev34wxxdjcg89gal.formatErrors(errInfo.errors) + '\n\nInput object: ' + $_ev34wxxdjcg89gal.formatObj(errInfo.input);
  };
  var choose = function (key, branches) {
    return $_d7frflxhjcg89gb0.choose(key, branches);
  };
  var $_51tzzcxgjcg89gax = {
    anyValue: $_9m9qz3wajcg89g5n.constant(anyValue$1),
    arrOfObj: arrOfObj$1,
    arrOf: arrOf,
    arrOfVal: arrOfVal,
    valueOf: valueOf,
    setOf: setOf$1,
    objOf: objOf,
    objOfOnly: objOfOnly,
    asStruct: asStruct,
    asRaw: asRaw,
    asStructOrDie: asStructOrDie,
    asRawOrDie: asRawOrDie,
    getOrDie: getOrDie$1,
    formatError: formatError,
    choose: choose
  };

  var nu$3 = function (parts) {
    if (!$_b52oxhx5jcg89g9l.hasKey(parts, 'can') && !$_b52oxhx5jcg89g9l.hasKey(parts, 'abort') && !$_b52oxhx5jcg89g9l.hasKey(parts, 'run'))
      throw new Error('EventHandler defined by: ' + $_3nrfsfxejcg89gat.stringify(parts, null, 2) + ' does not have can, abort, or run!');
    return $_51tzzcxgjcg89gax.asRawOrDie('Extracting event.handler', $_51tzzcxgjcg89gax.objOfOnly([
      $_76kfpx1jcg89g86.defaulted('can', $_9m9qz3wajcg89g5n.constant(true)),
      $_76kfpx1jcg89g86.defaulted('abort', $_9m9qz3wajcg89g5n.constant(false)),
      $_76kfpx1jcg89g86.defaulted('run', $_9m9qz3wajcg89g5n.noop)
    ]), parts);
  };
  var all$1 = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_89wx8cw8jcg89g5d.foldl(handlers, function (acc, handler) {
        return acc && f(handler).apply(undefined, args);
      }, true);
    };
  };
  var any = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_89wx8cw8jcg89g5d.foldl(handlers, function (acc, handler) {
        return acc || f(handler).apply(undefined, args);
      }, false);
    };
  };
  var read = function (handler) {
    return $_405i8jwyjcg89g7l.isFunction(handler) ? {
      can: $_9m9qz3wajcg89g5n.constant(true),
      abort: $_9m9qz3wajcg89g5n.constant(false),
      run: handler
    } : handler;
  };
  var fuse = function (handlers) {
    var can = all$1(handlers, function (handler) {
      return handler.can;
    });
    var abort = any(handlers, function (handler) {
      return handler.abort;
    });
    var run = function () {
      var args = Array.prototype.slice.call(arguments, 0);
      $_89wx8cw8jcg89g5d.each(handlers, function (handler) {
        handler.run.apply(undefined, args);
      });
    };
    return nu$3({
      can: can,
      abort: abort,
      run: run
    });
  };
  var $_2mnikcx0jcg89g7t = {
    read: read,
    fuse: fuse,
    nu: nu$3
  };

  var derive$1 = $_b52oxhx5jcg89g9l.wrapAll;
  var abort = function (name, predicate) {
    return {
      key: name,
      value: $_2mnikcx0jcg89g7t.nu({ abort: predicate })
    };
  };
  var can = function (name, predicate) {
    return {
      key: name,
      value: $_2mnikcx0jcg89g7t.nu({ can: predicate })
    };
  };
  var preventDefault = function (name) {
    return {
      key: name,
      value: $_2mnikcx0jcg89g7t.nu({
        run: function (component, simulatedEvent) {
          simulatedEvent.event().prevent();
        }
      })
    };
  };
  var run = function (name, handler) {
    return {
      key: name,
      value: $_2mnikcx0jcg89g7t.nu({ run: handler })
    };
  };
  var runActionExtra = function (name, action, extra) {
    return {
      key: name,
      value: $_2mnikcx0jcg89g7t.nu({
        run: function (component) {
          action.apply(undefined, [component].concat(extra));
        }
      })
    };
  };
  var runOnName = function (name) {
    return function (handler) {
      return run(name, handler);
    };
  };
  var runOnSourceName = function (name) {
    return function (handler) {
      return {
        key: name,
        value: $_2mnikcx0jcg89g7t.nu({
          run: function (component, simulatedEvent) {
            if ($_7xtpkaw6jcg89g4x.isSource(component, simulatedEvent))
              handler(component, simulatedEvent);
          }
        })
      };
    };
  };
  var redirectToUid = function (name, uid) {
    return run(name, function (component, simulatedEvent) {
      component.getSystem().getByUid(uid).each(function (redirectee) {
        $_fpm2ctwujcg89g73.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
      });
    });
  };
  var redirectToPart = function (name, detail, partName) {
    var uid = detail.partUids()[partName];
    return redirectToUid(name, uid);
  };
  var runWithTarget = function (name, f) {
    return run(name, function (component, simulatedEvent) {
      component.getSystem().getByDom(simulatedEvent.event().target()).each(function (target) {
        f(component, target, simulatedEvent);
      });
    });
  };
  var cutter = function (name) {
    return run(name, function (component, simulatedEvent) {
      simulatedEvent.cut();
    });
  };
  var stopper = function (name) {
    return run(name, function (component, simulatedEvent) {
      simulatedEvent.stop();
    });
  };
  var $_1hggxlw5jcg89g4s = {
    derive: derive$1,
    run: run,
    preventDefault: preventDefault,
    runActionExtra: runActionExtra,
    runOnAttached: runOnSourceName($_f1ifvdwvjcg89g7a.attachedToDom()),
    runOnDetached: runOnSourceName($_f1ifvdwvjcg89g7a.detachedFromDom()),
    runOnInit: runOnSourceName($_f1ifvdwvjcg89g7a.systemInit()),
    runOnExecute: runOnName($_f1ifvdwvjcg89g7a.execute()),
    redirectToUid: redirectToUid,
    redirectToPart: redirectToPart,
    runWithTarget: runWithTarget,
    abort: abort,
    can: can,
    cutter: cutter,
    stopper: stopper
  };

  var markAsBehaviourApi = function (f, apiName, apiFunction) {
    return f;
  };
  var markAsExtraApi = function (f, extraName) {
    return f;
  };
  var markAsSketchApi = function (f, apiFunction) {
    return f;
  };
  var getAnnotation = $_en0sddw9jcg89g5j.none;
  var $_9maq7nxijcg89gbf = {
    markAsBehaviourApi: markAsBehaviourApi,
    markAsExtraApi: markAsExtraApi,
    markAsSketchApi: markAsSketchApi,
    getAnnotation: getAnnotation
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
      $_89wx8cw8jcg89g5d.each(fields, function (name, i) {
        struct[name] = $_9m9qz3wajcg89g5n.constant(values[i]);
      });
      return struct;
    };
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
    if (!$_405i8jwyjcg89g7l.isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    $_89wx8cw8jcg89g5d.each(array, function (a) {
      if (!$_405i8jwyjcg89g7l.isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = $_89wx8cw8jcg89g5d.find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };
  var $_5aknwcxojcg89gc7 = {
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
    $_5aknwcxojcg89gc7.validateStrArr('required', required);
    $_5aknwcxojcg89gc7.validateStrArr('optional', optional);
    $_5aknwcxojcg89gc7.checkDupes(everything);
    return function (obj) {
      var keys = $_gbrpaqwzjcg89g7p.keys(obj);
      var allReqd = $_89wx8cw8jcg89g5d.forall(required, function (req) {
        return $_89wx8cw8jcg89g5d.contains(keys, req);
      });
      if (!allReqd)
        $_5aknwcxojcg89gc7.reqMessage(required, keys);
      var unsupported = $_89wx8cw8jcg89g5d.filter(keys, function (key) {
        return !$_89wx8cw8jcg89g5d.contains(everything, key);
      });
      if (unsupported.length > 0)
        $_5aknwcxojcg89gc7.unsuppMessage(unsupported);
      var r = {};
      $_89wx8cw8jcg89g5d.each(required, function (req) {
        r[req] = $_9m9qz3wajcg89g5n.constant(obj[req]);
      });
      $_89wx8cw8jcg89g5d.each(optional, function (opt) {
        r[opt] = $_9m9qz3wajcg89g5n.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? $_en0sddw9jcg89g5j.some(obj[opt]) : $_en0sddw9jcg89g5j.none());
      });
      return r;
    };
  };

  var $_4pc2ltxljcg89gc2 = {
    immutable: Immutable,
    immutableBag: MixedBag
  };

  var nu$6 = $_4pc2ltxljcg89gc2.immutableBag(['tag'], [
    'classes',
    'attributes',
    'styles',
    'value',
    'innerHtml',
    'domChildren',
    'defChildren'
  ]);
  var defToStr = function (defn) {
    var raw = defToRaw(defn);
    return $_3nrfsfxejcg89gat.stringify(raw, null, 2);
  };
  var defToRaw = function (defn) {
    return {
      tag: defn.tag(),
      classes: defn.classes().getOr([]),
      attributes: defn.attributes().getOr({}),
      styles: defn.styles().getOr({}),
      value: defn.value().getOr('<none>'),
      innerHtml: defn.innerHtml().getOr('<none>'),
      defChildren: defn.defChildren().getOr('<none>'),
      domChildren: defn.domChildren().fold(function () {
        return '<none>';
      }, function (children) {
        return children.length === 0 ? '0 children, but still specified' : String(children.length);
      })
    };
  };
  var $_h3tzjxkjcg89gbx = {
    nu: nu$6,
    defToStr: defToStr,
    defToRaw: defToRaw
  };

  var fields = [
    'classes',
    'attributes',
    'styles',
    'value',
    'innerHtml',
    'defChildren',
    'domChildren'
  ];
  var nu$5 = $_4pc2ltxljcg89gc2.immutableBag([], fields);
  var derive$2 = function (settings) {
    var r = {};
    var keys = $_gbrpaqwzjcg89g7p.keys(settings);
    $_89wx8cw8jcg89g5d.each(keys, function (key) {
      settings[key].each(function (v) {
        r[key] = v;
      });
    });
    return nu$5(r);
  };
  var modToStr = function (mod) {
    var raw = modToRaw(mod);
    return $_3nrfsfxejcg89gat.stringify(raw, null, 2);
  };
  var modToRaw = function (mod) {
    return {
      classes: mod.classes().getOr('<none>'),
      attributes: mod.attributes().getOr('<none>'),
      styles: mod.styles().getOr('<none>'),
      value: mod.value().getOr('<none>'),
      innerHtml: mod.innerHtml().getOr('<none>'),
      defChildren: mod.defChildren().getOr('<none>'),
      domChildren: mod.domChildren().fold(function () {
        return '<none>';
      }, function (children) {
        return children.length === 0 ? '0 children, but still specified' : String(children.length);
      })
    };
  };
  var clashingOptArrays = function (key, oArr1, oArr2) {
    return oArr1.fold(function () {
      return oArr2.fold(function () {
        return {};
      }, function (arr2) {
        return $_b52oxhx5jcg89g9l.wrap(key, arr2);
      });
    }, function (arr1) {
      return oArr2.fold(function () {
        return $_b52oxhx5jcg89g9l.wrap(key, arr1);
      }, function (arr2) {
        return $_b52oxhx5jcg89g9l.wrap(key, arr2);
      });
    });
  };
  var merge$1 = function (defnA, mod) {
    var raw = $_5mo1ztwxjcg89g7j.deepMerge({
      tag: defnA.tag(),
      classes: mod.classes().getOr([]).concat(defnA.classes().getOr([])),
      attributes: $_5mo1ztwxjcg89g7j.merge(defnA.attributes().getOr({}), mod.attributes().getOr({})),
      styles: $_5mo1ztwxjcg89g7j.merge(defnA.styles().getOr({}), mod.styles().getOr({}))
    }, mod.innerHtml().or(defnA.innerHtml()).map(function (innerHtml) {
      return $_b52oxhx5jcg89g9l.wrap('innerHtml', innerHtml);
    }).getOr({}), clashingOptArrays('domChildren', mod.domChildren(), defnA.domChildren()), clashingOptArrays('defChildren', mod.defChildren(), defnA.defChildren()), mod.value().or(defnA.value()).map(function (value) {
      return $_b52oxhx5jcg89g9l.wrap('value', value);
    }).getOr({}));
    return $_h3tzjxkjcg89gbx.nu(raw);
  };
  var $_8qlllaxjjcg89gbk = {
    nu: nu$5,
    derive: derive$2,
    merge: merge$1,
    modToStr: modToStr,
    modToRaw: modToRaw
  };

  var executeEvent = function (bConfig, bState, executor) {
    return $_1hggxlw5jcg89g4s.runOnExecute(function (component) {
      executor(component, bConfig, bState);
    });
  };
  var loadEvent = function (bConfig, bState, f) {
    return $_1hggxlw5jcg89g4s.runOnInit(function (component, simulatedEvent) {
      f(component, bConfig, bState);
    });
  };
  var create$1 = function (schema, name, active, apis, extra, state) {
    var configSchema = $_51tzzcxgjcg89gax.objOfOnly(schema);
    var schemaSchema = $_76kfpx1jcg89g86.optionObjOf(name, [$_76kfpx1jcg89g86.optionObjOfOnly('config', schema)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var createModes$1 = function (modes, name, active, apis, extra, state) {
    var configSchema = modes;
    var schemaSchema = $_76kfpx1jcg89g86.optionObjOf(name, [$_76kfpx1jcg89g86.optionOf('config', modes)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var wrapApi = function (bName, apiFunction, apiName) {
    var f = function (component) {
      var args = arguments;
      return component.config({ name: $_9m9qz3wajcg89g5n.constant(bName) }).fold(function () {
        throw new Error('We could not find any behaviour configuration for: ' + bName + '. Using API: ' + apiName);
      }, function (info) {
        var rest = Array.prototype.slice.call(args, 1);
        return apiFunction.apply(undefined, [
          component,
          info.config,
          info.state
        ].concat(rest));
      });
    };
    return $_9maq7nxijcg89gbf.markAsBehaviourApi(f, apiName, apiFunction);
  };
  var revokeBehaviour = function (name) {
    return {
      key: name,
      value: undefined
    };
  };
  var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state) {
    var getConfig = function (info) {
      return $_b52oxhx5jcg89g9l.hasKey(info, name) ? info[name]() : $_en0sddw9jcg89g5j.none();
    };
    var wrappedApis = $_gbrpaqwzjcg89g7p.map(apis, function (apiF, apiName) {
      return wrapApi(name, apiF, apiName);
    });
    var wrappedExtra = $_gbrpaqwzjcg89g7p.map(extra, function (extraF, extraName) {
      return $_9maq7nxijcg89gbf.markAsExtraApi(extraF, extraName);
    });
    var me = $_5mo1ztwxjcg89g7j.deepMerge(wrappedExtra, wrappedApis, {
      revoke: $_9m9qz3wajcg89g5n.curry(revokeBehaviour, name),
      config: function (spec) {
        var prepared = $_51tzzcxgjcg89gax.asStructOrDie(name + '-config', configSchema, spec);
        return {
          key: name,
          value: {
            config: prepared,
            me: me,
            configAsRaw: $_4mkzmwgjcg89g60.cached(function () {
              return $_51tzzcxgjcg89gax.asRawOrDie(name + '-config', configSchema, spec);
            }),
            initialConfig: spec,
            state: state
          }
        };
      },
      schema: function () {
        return schemaSchema;
      },
      exhibit: function (info, base) {
        return getConfig(info).bind(function (behaviourInfo) {
          return $_b52oxhx5jcg89g9l.readOptFrom(active, 'exhibit').map(function (exhibitor) {
            return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr($_8qlllaxjjcg89gbk.nu({}));
      },
      name: function () {
        return name;
      },
      handlers: function (info) {
        return getConfig(info).bind(function (behaviourInfo) {
          return $_b52oxhx5jcg89g9l.readOptFrom(active, 'events').map(function (events) {
            return events(behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr({});
      }
    });
    return me;
  };
  var $_42if07w4jcg89g47 = {
    executeEvent: executeEvent,
    loadEvent: loadEvent,
    create: create$1,
    createModes: createModes$1
  };

  var base = function (handleUnsupported, required) {
    return baseWith(handleUnsupported, required, {
      validate: $_405i8jwyjcg89g7l.isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    $_5aknwcxojcg89gc7.validateStrArr('required', required);
    $_5aknwcxojcg89gc7.checkDupes(required);
    return function (obj) {
      var keys = $_gbrpaqwzjcg89g7p.keys(obj);
      var allReqd = $_89wx8cw8jcg89g5d.forall(required, function (req) {
        return $_89wx8cw8jcg89g5d.contains(keys, req);
      });
      if (!allReqd)
        $_5aknwcxojcg89gc7.reqMessage(required, keys);
      handleUnsupported(required, keys);
      var invalidKeys = $_89wx8cw8jcg89g5d.filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        $_5aknwcxojcg89gc7.invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys) {
    var unsupported = $_89wx8cw8jcg89g5d.filter(keys, function (key) {
      return !$_89wx8cw8jcg89g5d.contains(required, key);
    });
    if (unsupported.length > 0)
      $_5aknwcxojcg89gc7.unsuppMessage(unsupported);
  };
  var allowExtra = $_9m9qz3wajcg89g5n.noop;
  var $_g9rauexrjcg89gcc = {
    exactly: $_9m9qz3wajcg89g5n.curry(base, handleExact),
    ensure: $_9m9qz3wajcg89g5n.curry(base, allowExtra),
    ensureWith: $_9m9qz3wajcg89g5n.curry(baseWith, allowExtra)
  };

  var BehaviourState = $_g9rauexrjcg89gcc.ensure(['readState']);

  var init = function () {
    return BehaviourState({
      readState: function () {
        return 'No State required';
      }
    });
  };
  var $_960zyxxpjcg89gc9 = { init: init };

  var derive = function (capabilities) {
    return $_b52oxhx5jcg89g9l.wrapAll(capabilities);
  };
  var simpleSchema = $_51tzzcxgjcg89gax.objOfOnly([
    $_76kfpx1jcg89g86.strict('fields'),
    $_76kfpx1jcg89g86.strict('name'),
    $_76kfpx1jcg89g86.defaulted('active', {}),
    $_76kfpx1jcg89g86.defaulted('apis', {}),
    $_76kfpx1jcg89g86.defaulted('extra', {}),
    $_76kfpx1jcg89g86.defaulted('state', $_960zyxxpjcg89gc9)
  ]);
  var create = function (data) {
    var value = $_51tzzcxgjcg89gax.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
    return $_42if07w4jcg89g47.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
  };
  var modeSchema = $_51tzzcxgjcg89gax.objOfOnly([
    $_76kfpx1jcg89g86.strict('branchKey'),
    $_76kfpx1jcg89g86.strict('branches'),
    $_76kfpx1jcg89g86.strict('name'),
    $_76kfpx1jcg89g86.defaulted('active', {}),
    $_76kfpx1jcg89g86.defaulted('apis', {}),
    $_76kfpx1jcg89g86.defaulted('extra', {}),
    $_76kfpx1jcg89g86.defaulted('state', $_960zyxxpjcg89gc9)
  ]);
  var createModes = function (data) {
    var value = $_51tzzcxgjcg89gax.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
    return $_42if07w4jcg89g47.createModes($_51tzzcxgjcg89gax.choose(value.branchKey, value.branches), value.name, value.active, value.apis, value.extra, value.state);
  };
  var $_eid12yw3jcg89g3y = {
    derive: derive,
    revoke: $_9m9qz3wajcg89g5n.constant(undefined),
    noActive: $_9m9qz3wajcg89g5n.constant({}),
    noApis: $_9m9qz3wajcg89g5n.constant({}),
    noExtra: $_9m9qz3wajcg89g5n.constant({}),
    noState: $_9m9qz3wajcg89g5n.constant($_960zyxxpjcg89gc9),
    create: create,
    createModes: createModes
  };

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

  var name = function (element) {
    var r = element.dom().nodeName;
    return r.toLowerCase();
  };
  var type = function (element) {
    return element.dom().nodeType;
  };
  var value$2 = function (element) {
    return element.dom().nodeValue;
  };
  var isType$1 = function (t) {
    return function (element) {
      return type(element) === t;
    };
  };
  var isComment = function (element) {
    return type(element) === $_5zticpwtjcg89g72.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_5zticpwtjcg89g72.ELEMENT);
  var isText = isType$1($_5zticpwtjcg89g72.TEXT);
  var isDocument = isType$1($_5zticpwtjcg89g72.DOCUMENT);
  var $_xqscexwjcg89gct = {
    name: name,
    type: type,
    value: value$2,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var rawSet = function (dom, key, value) {
    if ($_405i8jwyjcg89g7l.isString(value) || $_405i8jwyjcg89g7l.isBoolean(value) || $_405i8jwyjcg89g7l.isNumber(value)) {
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
    $_gbrpaqwzjcg89g7p.each(attrs, function (v, k) {
      rawSet(dom, k, v);
    });
  };
  var get = function (element, key) {
    var v = element.dom().getAttribute(key);
    return v === null ? undefined : v;
  };
  var has$1 = function (element, key) {
    var dom = element.dom();
    return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
  };
  var remove$1 = function (element, key) {
    element.dom().removeAttribute(key);
  };
  var hasNone = function (element) {
    var attrs = element.dom().attributes;
    return attrs === undefined || attrs === null || attrs.length === 0;
  };
  var clone = function (element) {
    return $_89wx8cw8jcg89g5d.foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has$1(source, attr) && !has$1(destination, attr))
      set(destination, attr, get(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_xqscexwjcg89gct.isElement(source) || !$_xqscexwjcg89gct.isElement(destination))
      return;
    $_89wx8cw8jcg89g5d.each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_69krbwxvjcg89gck = {
    clone: clone,
    set: set,
    setAll: setAll,
    get: get,
    has: has$1,
    remove: remove$1,
    hasNone: hasNone,
    transfer: transfer
  };

  var read$1 = function (element, attr) {
    var value = $_69krbwxvjcg89gck.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add$2 = function (element, attr, id) {
    var old = read$1(element, attr);
    var nu = old.concat([id]);
    $_69krbwxvjcg89gck.set(element, attr, nu.join(' '));
  };
  var remove$3 = function (element, attr, id) {
    var nu = $_89wx8cw8jcg89g5d.filter(read$1(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_69krbwxvjcg89gck.set(element, attr, nu.join(' '));
    else
      $_69krbwxvjcg89gck.remove(element, attr);
  };
  var $_dj3zjaxyjcg89gcy = {
    read: read$1,
    add: add$2,
    remove: remove$3
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$1 = function (element) {
    return $_dj3zjaxyjcg89gcy.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_dj3zjaxyjcg89gcy.add(element, 'class', clazz);
  };
  var remove$2 = function (element, clazz) {
    return $_dj3zjaxyjcg89gcy.remove(element, 'class', clazz);
  };
  var toggle$1 = function (element, clazz) {
    if ($_89wx8cw8jcg89g5d.contains(get$1(element), clazz)) {
      remove$2(element, clazz);
    } else {
      add$1(element, clazz);
    }
  };
  var $_8hqfj3xxjcg89gcv = {
    get: get$1,
    add: add$1,
    remove: remove$2,
    toggle: toggle$1,
    supports: supports
  };

  var add = function (element, clazz) {
    if ($_8hqfj3xxjcg89gcv.supports(element))
      element.dom().classList.add(clazz);
    else
      $_8hqfj3xxjcg89gcv.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_8hqfj3xxjcg89gcv.supports(element) ? element.dom().classList : $_8hqfj3xxjcg89gcv.get(element);
    if (classList.length === 0) {
      $_69krbwxvjcg89gck.remove(element, 'class');
    }
  };
  var remove = function (element, clazz) {
    if ($_8hqfj3xxjcg89gcv.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_8hqfj3xxjcg89gcv.remove(element, clazz);
    cleanClass(element);
  };
  var toggle = function (element, clazz) {
    return $_8hqfj3xxjcg89gcv.supports(element) ? element.dom().classList.toggle(clazz) : $_8hqfj3xxjcg89gcv.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_8hqfj3xxjcg89gcv.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_8hqfj3xxjcg89gcv.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_8hqfj3xxjcg89gcv.add(element, clazz);
    };
    return Toggler(off, on, has(element, clazz));
  };
  var has = function (element, clazz) {
    return $_8hqfj3xxjcg89gcv.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_bhzm7gxtjcg89gcg = {
    add: add,
    remove: remove,
    toggle: toggle,
    toggler: toggler,
    has: has
  };

  var swap = function (element, addCls, removeCls) {
    $_bhzm7gxtjcg89gcg.remove(element, removeCls);
    $_bhzm7gxtjcg89gcg.add(element, addCls);
  };
  var toAlpha = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.alpha(), swapConfig.omega());
  };
  var toOmega = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.omega(), swapConfig.alpha());
  };
  var clear = function (component, swapConfig, swapState) {
    $_bhzm7gxtjcg89gcg.remove(component.element(), swapConfig.alpha());
    $_bhzm7gxtjcg89gcg.remove(component.element(), swapConfig.omega());
  };
  var isAlpha = function (component, swapConfig, swapState) {
    return $_bhzm7gxtjcg89gcg.has(component.element(), swapConfig.alpha());
  };
  var isOmega = function (component, swapConfig, swapState) {
    return $_bhzm7gxtjcg89gcg.has(component.element(), swapConfig.omega());
  };
  var $_zn2p4xsjcg89gce = {
    toAlpha: toAlpha,
    toOmega: toOmega,
    isAlpha: isAlpha,
    isOmega: isOmega,
    clear: clear
  };

  var SwapSchema = [
    $_76kfpx1jcg89g86.strict('alpha'),
    $_76kfpx1jcg89g86.strict('omega')
  ];

  var Swapping = $_eid12yw3jcg89g3y.create({
    fields: SwapSchema,
    name: 'swapping',
    apis: $_zn2p4xsjcg89gce
  });

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
  var $_2lfnyvy3jcg89ge2 = { toArray: toArray };

  var owner = function (element) {
    return $_a3ihziwsjcg89g6w.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    var doc = owner(element);
    return $_a3ihziwsjcg89g6w.fromDom(doc.dom().documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return $_a3ihziwsjcg89g6w.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return $_en0sddw9jcg89g5j.from(dom.parentNode).map($_a3ihziwsjcg89g6w.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return $_89wx8cw8jcg89g5d.findIndex(kin, function (elem) {
        return $_n5s8aw7jcg89g53.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = $_405i8jwyjcg89g7l.isFunction(isRoot) ? isRoot : $_9m9qz3wajcg89g5n.constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = $_a3ihziwsjcg89g6w.fromDom(rawParent);
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
      return $_89wx8cw8jcg89g5d.filter(elements, function (x) {
        return !$_n5s8aw7jcg89g53.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return $_en0sddw9jcg89g5j.from(dom.offsetParent).map($_a3ihziwsjcg89g6w.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return $_en0sddw9jcg89g5j.from(dom.previousSibling).map($_a3ihziwsjcg89g6w.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return $_en0sddw9jcg89g5j.from(dom.nextSibling).map($_a3ihziwsjcg89g6w.fromDom);
  };
  var prevSiblings = function (element) {
    return $_89wx8cw8jcg89g5d.reverse($_2lfnyvy3jcg89ge2.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_2lfnyvy3jcg89ge2.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return $_89wx8cw8jcg89g5d.map(dom.childNodes, $_a3ihziwsjcg89g6w.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return $_en0sddw9jcg89g5j.from(children[index]).map($_a3ihziwsjcg89g6w.fromDom);
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
  var spot = $_4pc2ltxljcg89gc2.immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_3ndsgfy2jcg89gdr = {
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

  var before = function (marker, element) {
    var parent = $_3ndsgfy2jcg89gdr.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_3ndsgfy2jcg89gdr.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_3ndsgfy2jcg89gdr.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_3ndsgfy2jcg89gdr.firstChild(parent);
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
    $_3ndsgfy2jcg89gdr.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap$2 = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_dhkjply1jcg89gdi = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap$2
  };

  var before$1 = function (marker, elements) {
    $_89wx8cw8jcg89g5d.each(elements, function (x) {
      $_dhkjply1jcg89gdi.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    $_89wx8cw8jcg89g5d.each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_dhkjply1jcg89gdi.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    $_89wx8cw8jcg89g5d.each(elements.slice().reverse(), function (x) {
      $_dhkjply1jcg89gdi.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    $_89wx8cw8jcg89g5d.each(elements, function (x) {
      $_dhkjply1jcg89gdi.append(parent, x);
    });
  };
  var $_6xk1mcy5jcg89ge8 = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    $_89wx8cw8jcg89g5d.each($_3ndsgfy2jcg89gdr.children(element), function (rogue) {
      remove$4(rogue);
    });
  };
  var remove$4 = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_3ndsgfy2jcg89gdr.children(wrapper);
    if (children.length > 0)
      $_6xk1mcy5jcg89ge8.before(wrapper, children);
    remove$4(wrapper);
  };
  var $_cs3l5zy4jcg89ge4 = {
    empty: empty,
    remove: remove$4,
    unwrap: unwrap
  };

  var inBody = function (element) {
    var dom = $_xqscexwjcg89gct.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = $_4mkzmwgjcg89g60.cached(function () {
    return getBody($_a3ihziwsjcg89g6w.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return $_a3ihziwsjcg89g6w.fromDom(body);
  };
  var $_c2mv10y6jcg89gec = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var fireDetaching = function (component) {
    $_fpm2ctwujcg89g73.emit(component, $_f1ifvdwvjcg89g7a.detachedFromDom());
    var children = component.components();
    $_89wx8cw8jcg89g5d.each(children, fireDetaching);
  };
  var fireAttaching = function (component) {
    var children = component.components();
    $_89wx8cw8jcg89g5d.each(children, fireAttaching);
    $_fpm2ctwujcg89g73.emit(component, $_f1ifvdwvjcg89g7a.attachedToDom());
  };
  var attach = function (parent, child) {
    attachWith(parent, child, $_dhkjply1jcg89gdi.append);
  };
  var attachWith = function (parent, child, insertion) {
    parent.getSystem().addToWorld(child);
    insertion(parent.element(), child.element());
    if ($_c2mv10y6jcg89gec.inBody(parent.element()))
      fireAttaching(child);
    parent.syncComponents();
  };
  var doDetach = function (component) {
    fireDetaching(component);
    $_cs3l5zy4jcg89ge4.remove(component.element());
    component.getSystem().removeFromWorld(component);
  };
  var detach = function (component) {
    var parent = $_3ndsgfy2jcg89gdr.parent(component.element()).bind(function (p) {
      return component.getSystem().getByDom(p).fold($_en0sddw9jcg89g5j.none, $_en0sddw9jcg89g5j.some);
    });
    doDetach(component);
    parent.each(function (p) {
      p.syncComponents();
    });
  };
  var detachChildren = function (component) {
    var subs = component.components();
    $_89wx8cw8jcg89g5d.each(subs, doDetach);
    $_cs3l5zy4jcg89ge4.empty(component.element());
    component.syncComponents();
  };
  var attachSystem = function (element, guiSystem) {
    $_dhkjply1jcg89gdi.append(element, guiSystem.element());
    var children = $_3ndsgfy2jcg89gdr.children(guiSystem.element());
    $_89wx8cw8jcg89g5d.each(children, function (child) {
      guiSystem.getByDom(child).each(fireAttaching);
    });
  };
  var detachSystem = function (guiSystem) {
    var children = $_3ndsgfy2jcg89gdr.children(guiSystem.element());
    $_89wx8cw8jcg89g5d.each(children, function (child) {
      guiSystem.getByDom(child).each(fireDetaching);
    });
    $_cs3l5zy4jcg89ge4.remove(guiSystem.element());
  };
  var $_d31i57y0jcg89gd5 = {
    attach: attach,
    attachWith: attachWith,
    detach: detach,
    detachChildren: detachChildren,
    attachSystem: attachSystem,
    detachSystem: detachSystem
  };

  var fromHtml$1 = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    return $_3ndsgfy2jcg89gdr.children($_a3ihziwsjcg89g6w.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return $_89wx8cw8jcg89g5d.map(tags, function (x) {
      return $_a3ihziwsjcg89g6w.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return $_89wx8cw8jcg89g5d.map(texts, function (x) {
      return $_a3ihziwsjcg89g6w.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return $_89wx8cw8jcg89g5d.map(nodes, $_a3ihziwsjcg89g6w.fromDom);
  };
  var $_728bolybjcg89gez = {
    fromHtml: fromHtml$1,
    fromTags: fromTags,
    fromText: fromText$1,
    fromDom: fromDom$1
  };

  var get$2 = function (element) {
    return element.dom().innerHTML;
  };
  var set$1 = function (element, content) {
    var owner = $_3ndsgfy2jcg89gdr.owner(element);
    var docDom = owner.dom();
    var fragment = $_a3ihziwsjcg89g6w.fromDom(docDom.createDocumentFragment());
    var contentElements = $_728bolybjcg89gez.fromHtml(content, docDom);
    $_6xk1mcy5jcg89ge8.append(fragment, contentElements);
    $_cs3l5zy4jcg89ge4.empty(element);
    $_dhkjply1jcg89gdi.append(element, fragment);
  };
  var getOuter = function (element) {
    var container = $_a3ihziwsjcg89g6w.fromTag('div');
    var clone = $_a3ihziwsjcg89g6w.fromDom(element.dom().cloneNode(true));
    $_dhkjply1jcg89gdi.append(container, clone);
    return get$2(container);
  };
  var $_6dv6zryajcg89gew = {
    get: get$2,
    set: set$1,
    getOuter: getOuter
  };

  var clone$1 = function (original, deep) {
    return $_a3ihziwsjcg89g6w.fromDom(original.dom().cloneNode(deep));
  };
  var shallow$1 = function (original) {
    return clone$1(original, false);
  };
  var deep$1 = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = $_a3ihziwsjcg89g6w.fromTag(tag);
    var attributes = $_69krbwxvjcg89gck.clone(original);
    $_69krbwxvjcg89gck.setAll(nu, attributes);
    return nu;
  };
  var copy = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_3ndsgfy2jcg89gdr.children(deep$1(original));
    $_6xk1mcy5jcg89ge8.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_dhkjply1jcg89gdi.before(original, nu);
    var children = $_3ndsgfy2jcg89gdr.children(original);
    $_6xk1mcy5jcg89ge8.append(nu, children);
    $_cs3l5zy4jcg89ge4.remove(original);
    return nu;
  };
  var $_8al4fbycjcg89gf1 = {
    shallow: shallow$1,
    shallowAs: shallowAs,
    deep: deep$1,
    copy: copy,
    mutate: mutate
  };

  var getHtml = function (element) {
    var clone = $_8al4fbycjcg89gf1.shallow(element);
    return $_6dv6zryajcg89gew.getOuter(clone);
  };
  var $_f7f28ny9jcg89ges = { getHtml: getHtml };

  var element = function (elem) {
    return $_f7f28ny9jcg89ges.getHtml(elem);
  };
  var $_8845a2y8jcg89ger = { element: element };

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
    return $_en0sddw9jcg89g5j.none();
  };
  var liftN = function (arr, f) {
    var r = [];
    for (var i = 0; i < arr.length; i++) {
      var x = arr[i];
      if (x.isSome()) {
        r.push(x.getOrDie());
      } else {
        return $_en0sddw9jcg89g5j.none();
      }
    }
    return $_en0sddw9jcg89g5j.some(f.apply(null, r));
  };
  var $_crwoiuydjcg89gf3 = {
    cat: cat,
    findMap: findMap,
    liftN: liftN
  };

  var unknown$3 = 'unknown';
  var debugging = true;
  var CHROME_INSPECTOR_GLOBAL = '__CHROME_INSPECTOR_CONNECTION_TO_ALLOY__';
  var eventsMonitored = [];
  var path$1 = [
    'alloy/data/Fields',
    'alloy/debugging/Debugging'
  ];
  var getTrace = function () {
    if (debugging === false)
      return unknown$3;
    var err = new Error();
    if (err.stack !== undefined) {
      var lines = err.stack.split('\n');
      return $_89wx8cw8jcg89g5d.find(lines, function (line) {
        return line.indexOf('alloy') > 0 && !$_89wx8cw8jcg89g5d.exists(path$1, function (p) {
          return line.indexOf(p) > -1;
        });
      }).getOr(unknown$3);
    } else {
      return unknown$3;
    }
  };
  var logHandler = function (label, handlerName, trace) {
  };
  var ignoreEvent = {
    logEventCut: $_9m9qz3wajcg89g5n.noop,
    logEventStopped: $_9m9qz3wajcg89g5n.noop,
    logNoParent: $_9m9qz3wajcg89g5n.noop,
    logEventNoHandlers: $_9m9qz3wajcg89g5n.noop,
    logEventResponse: $_9m9qz3wajcg89g5n.noop,
    write: $_9m9qz3wajcg89g5n.noop
  };
  var monitorEvent = function (eventName, initialTarget, f) {
    var logger = debugging && (eventsMonitored === '*' || $_89wx8cw8jcg89g5d.contains(eventsMonitored, eventName)) ? function () {
      var sequence = [];
      return {
        logEventCut: function (name, target, purpose) {
          sequence.push({
            outcome: 'cut',
            target: target,
            purpose: purpose
          });
        },
        logEventStopped: function (name, target, purpose) {
          sequence.push({
            outcome: 'stopped',
            target: target,
            purpose: purpose
          });
        },
        logNoParent: function (name, target, purpose) {
          sequence.push({
            outcome: 'no-parent',
            target: target,
            purpose: purpose
          });
        },
        logEventNoHandlers: function (name, target) {
          sequence.push({
            outcome: 'no-handlers-left',
            target: target
          });
        },
        logEventResponse: function (name, target, purpose) {
          sequence.push({
            outcome: 'response',
            purpose: purpose,
            target: target
          });
        },
        write: function () {
          if ($_89wx8cw8jcg89g5d.contains([
              'mousemove',
              'mouseover',
              'mouseout',
              $_f1ifvdwvjcg89g7a.systemInit()
            ], eventName))
            return;
          console.log(eventName, {
            event: eventName,
            target: initialTarget.dom(),
            sequence: $_89wx8cw8jcg89g5d.map(sequence, function (s) {
              if (!$_89wx8cw8jcg89g5d.contains([
                  'cut',
                  'stopped',
                  'response'
                ], s.outcome))
                return s.outcome;
              else
                return '{' + s.purpose + '} ' + s.outcome + ' at (' + $_8845a2y8jcg89ger.element(s.target) + ')';
            })
          });
        }
      };
    }() : ignoreEvent;
    var output = f(logger);
    logger.write();
    return output;
  };
  var inspectorInfo = function (comp) {
    var go = function (c) {
      var cSpec = c.spec();
      return {
        '(original.spec)': cSpec,
        '(dom.ref)': c.element().dom(),
        '(element)': $_8845a2y8jcg89ger.element(c.element()),
        '(initComponents)': $_89wx8cw8jcg89g5d.map(cSpec.components !== undefined ? cSpec.components : [], go),
        '(components)': $_89wx8cw8jcg89g5d.map(c.components(), go),
        '(bound.events)': $_gbrpaqwzjcg89g7p.mapToArray(c.events(), function (v, k) {
          return [k];
        }).join(', '),
        '(behaviours)': cSpec.behaviours !== undefined ? $_gbrpaqwzjcg89g7p.map(cSpec.behaviours, function (v, k) {
          return v === undefined ? '--revoked--' : {
            config: v.configAsRaw(),
            'original-config': v.initialConfig,
            state: c.readState(k)
          };
        }) : 'none'
      };
    };
    return go(comp);
  };
  var getOrInitConnection = function () {
    if (window[CHROME_INSPECTOR_GLOBAL] !== undefined)
      return window[CHROME_INSPECTOR_GLOBAL];
    else {
      window[CHROME_INSPECTOR_GLOBAL] = {
        systems: {},
        lookup: function (uid) {
          var systems = window[CHROME_INSPECTOR_GLOBAL].systems;
          var connections = $_gbrpaqwzjcg89g7p.keys(systems);
          return $_crwoiuydjcg89gf3.findMap(connections, function (conn) {
            var connGui = systems[conn];
            return connGui.getByUid(uid).toOption().map(function (comp) {
              return $_b52oxhx5jcg89g9l.wrap($_8845a2y8jcg89ger.element(comp.element()), inspectorInfo(comp));
            });
          });
        }
      };
      return window[CHROME_INSPECTOR_GLOBAL];
    }
  };
  var registerInspector = function (name, gui) {
    var connection = getOrInitConnection();
    connection.systems[name] = gui;
  };
  var $_bj47tfy7jcg89geh = {
    logHandler: logHandler,
    noLogger: $_9m9qz3wajcg89g5n.constant(ignoreEvent),
    getTrace: getTrace,
    monitorEvent: monitorEvent,
    isDebugging: $_9m9qz3wajcg89g5n.constant(debugging),
    registerInspector: registerInspector
  };

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

  var ClosestOrAncestor = function (is, ancestor, scope, a, isRoot) {
    return is(scope, a) ? $_en0sddw9jcg89g5j.some(scope) : $_405i8jwyjcg89g7l.isFunction(isRoot) && isRoot(scope) ? $_en0sddw9jcg89g5j.none() : ancestor(scope, a, isRoot);
  };

  var first$1 = function (predicate) {
    return descendant$1($_c2mv10y6jcg89gec.body(), predicate);
  };
  var ancestor$1 = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = $_405i8jwyjcg89g7l.isFunction(isRoot) ? isRoot : $_9m9qz3wajcg89g5n.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_a3ihziwsjcg89g6w.fromDom(element);
      if (predicate(el))
        return $_en0sddw9jcg89g5j.some(el);
      else if (stop(el))
        break;
    }
    return $_en0sddw9jcg89g5j.none();
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
      return $_en0sddw9jcg89g5j.none();
    return child$2($_a3ihziwsjcg89g6w.fromDom(element.parentNode), function (x) {
      return !$_n5s8aw7jcg89g53.eq(scope, x) && predicate(x);
    });
  };
  var child$2 = function (scope, predicate) {
    var result = $_89wx8cw8jcg89g5d.find(scope.dom().childNodes, $_9m9qz3wajcg89g5n.compose(predicate, $_a3ihziwsjcg89g6w.fromDom));
    return result.map($_a3ihziwsjcg89g6w.fromDom);
  };
  var descendant$1 = function (scope, predicate) {
    var descend = function (element) {
      for (var i = 0; i < element.childNodes.length; i++) {
        if (predicate($_a3ihziwsjcg89g6w.fromDom(element.childNodes[i])))
          return $_en0sddw9jcg89g5j.some($_a3ihziwsjcg89g6w.fromDom(element.childNodes[i]));
        var res = descend(element.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return $_en0sddw9jcg89g5j.none();
    };
    return descend(scope.dom());
  };
  var $_f4g77pyhjcg89gfa = {
    first: first$1,
    ancestor: ancestor$1,
    closest: closest$1,
    sibling: sibling$1,
    child: child$2,
    descendant: descendant$1
  };

  var any$1 = function (predicate) {
    return $_f4g77pyhjcg89gfa.first(predicate).isSome();
  };
  var ancestor = function (scope, predicate, isRoot) {
    return $_f4g77pyhjcg89gfa.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest = function (scope, predicate, isRoot) {
    return $_f4g77pyhjcg89gfa.closest(scope, predicate, isRoot).isSome();
  };
  var sibling = function (scope, predicate) {
    return $_f4g77pyhjcg89gfa.sibling(scope, predicate).isSome();
  };
  var child$1 = function (scope, predicate) {
    return $_f4g77pyhjcg89gfa.child(scope, predicate).isSome();
  };
  var descendant = function (scope, predicate) {
    return $_f4g77pyhjcg89gfa.descendant(scope, predicate).isSome();
  };
  var $_cmq5f1ygjcg89gf8 = {
    any: any$1,
    ancestor: ancestor,
    closest: closest,
    sibling: sibling,
    child: child$1,
    descendant: descendant
  };

  var focus = function (element) {
    element.dom().focus();
  };
  var blur = function (element) {
    element.dom().blur();
  };
  var hasFocus = function (element) {
    var doc = $_3ndsgfy2jcg89gdr.owner(element).dom();
    return element.dom() === doc.activeElement;
  };
  var active = function (_doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    return $_en0sddw9jcg89g5j.from(doc.activeElement).map($_a3ihziwsjcg89g6w.fromDom);
  };
  var focusInside = function (element) {
    var doc = $_3ndsgfy2jcg89gdr.owner(element);
    var inside = active(doc).filter(function (a) {
      return $_cmq5f1ygjcg89gf8.closest(a, $_9m9qz3wajcg89g5n.curry($_n5s8aw7jcg89g53.eq, element));
    });
    inside.fold(function () {
      focus(element);
    }, $_9m9qz3wajcg89g5n.noop);
  };
  var search = function (element) {
    return active($_3ndsgfy2jcg89gdr.owner(element)).filter(function (e) {
      return element.dom().contains(e.dom());
    });
  };
  var $_72ito4yfjcg89gf5 = {
    hasFocus: hasFocus,
    focus: focus,
    blur: blur,
    active: active,
    search: search,
    focusInside: focusInside
  };

  var ThemeManager = tinymce.util.Tools.resolve('tinymce.ThemeManager');

  var DOMUtils = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

  var openLink = function (target) {
    var link = document.createElement('a');
    link.target = '_blank';
    link.href = target.href;
    link.rel = 'noreferrer noopener';
    var nuEvt = document.createEvent('MouseEvents');
    nuEvt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    document.body.appendChild(link);
    link.dispatchEvent(nuEvt);
    document.body.removeChild(link);
  };
  var $_5hlo1nyljcg89gfv = { openLink: openLink };

  var isSkinDisabled = function (editor) {
    return editor.settings.skin === false;
  };
  var $_evcn8gymjcg89gfw = { isSkinDisabled: isSkinDisabled };

  var formatChanged = 'formatChanged';
  var orientationChanged = 'orientationChanged';
  var dropupDismissed = 'dropupDismissed';
  var $_3fc8hyynjcg89gfx = {
    formatChanged: $_9m9qz3wajcg89g5n.constant(formatChanged),
    orientationChanged: $_9m9qz3wajcg89g5n.constant(orientationChanged),
    dropupDismissed: $_9m9qz3wajcg89g5n.constant(dropupDismissed)
  };

  var chooseChannels = function (channels, message) {
    return message.universal() ? channels : $_89wx8cw8jcg89g5d.filter(channels, function (ch) {
      return $_89wx8cw8jcg89g5d.contains(message.channels(), ch);
    });
  };
  var events = function (receiveConfig) {
    return $_1hggxlw5jcg89g4s.derive([$_1hggxlw5jcg89g4s.run($_f1ifvdwvjcg89g7a.receive(), function (component, message) {
        var channelMap = receiveConfig.channels();
        var channels = $_gbrpaqwzjcg89g7p.keys(channelMap);
        var targetChannels = chooseChannels(channels, message);
        $_89wx8cw8jcg89g5d.each(targetChannels, function (ch) {
          var channelInfo = channelMap[ch]();
          var channelSchema = channelInfo.schema();
          var data = $_51tzzcxgjcg89gax.asStructOrDie('channel[' + ch + '] data\nReceiver: ' + $_8845a2y8jcg89ger.element(component.element()), channelSchema, message.data());
          channelInfo.onReceive()(component, data);
        });
      })]);
  };
  var $_ermk4qyqjcg89ggi = { events: events };

  var menuFields = [
    $_76kfpx1jcg89g86.strict('menu'),
    $_76kfpx1jcg89g86.strict('selectedMenu')
  ];
  var itemFields = [
    $_76kfpx1jcg89g86.strict('item'),
    $_76kfpx1jcg89g86.strict('selectedItem')
  ];
  var schema = $_51tzzcxgjcg89gax.objOfOnly(itemFields.concat(menuFields));
  var itemSchema = $_51tzzcxgjcg89gax.objOfOnly(itemFields);
  var $_3rdojxytjcg89gh7 = {
    menuFields: $_9m9qz3wajcg89g5n.constant(menuFields),
    itemFields: $_9m9qz3wajcg89g5n.constant(itemFields),
    schema: $_9m9qz3wajcg89g5n.constant(schema),
    itemSchema: $_9m9qz3wajcg89g5n.constant(itemSchema)
  };

  var initSize = $_76kfpx1jcg89g86.strictObjOf('initSize', [
    $_76kfpx1jcg89g86.strict('numColumns'),
    $_76kfpx1jcg89g86.strict('numRows')
  ]);
  var itemMarkers = function () {
    return $_76kfpx1jcg89g86.strictOf('markers', $_3rdojxytjcg89gh7.itemSchema());
  };
  var menuMarkers = function () {
    return $_76kfpx1jcg89g86.strictOf('markers', $_3rdojxytjcg89gh7.schema());
  };
  var tieredMenuMarkers = function () {
    return $_76kfpx1jcg89g86.strictObjOf('markers', [$_76kfpx1jcg89g86.strict('backgroundMenu')].concat($_3rdojxytjcg89gh7.menuFields()).concat($_3rdojxytjcg89gh7.itemFields()));
  };
  var markers = function (required) {
    return $_76kfpx1jcg89g86.strictObjOf('markers', $_89wx8cw8jcg89g5d.map(required, $_76kfpx1jcg89g86.strict));
  };
  var onPresenceHandler = function (label, fieldName, presence) {
    var trace = $_bj47tfy7jcg89geh.getTrace();
    return $_76kfpx1jcg89g86.field(fieldName, fieldName, presence, $_51tzzcxgjcg89gax.valueOf(function (f) {
      return $_b8l9yux7jcg89g9z.value(function () {
        $_bj47tfy7jcg89geh.logHandler(label, fieldName, trace);
        return f.apply(undefined, arguments);
      });
    }));
  };
  var onHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_562y16x2jcg89g8j.defaulted($_9m9qz3wajcg89g5n.noop));
  };
  var onKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_562y16x2jcg89g8j.defaulted($_en0sddw9jcg89g5j.none));
  };
  var onStrictHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_562y16x2jcg89g8j.strict());
  };
  var onStrictKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_562y16x2jcg89g8j.strict());
  };
  var output$1 = function (name, value) {
    return $_76kfpx1jcg89g86.state(name, $_9m9qz3wajcg89g5n.constant(value));
  };
  var snapshot$1 = function (name) {
    return $_76kfpx1jcg89g86.state(name, $_9m9qz3wajcg89g5n.identity);
  };
  var $_czln55ysjcg89ggs = {
    initSize: $_9m9qz3wajcg89g5n.constant(initSize),
    itemMarkers: itemMarkers,
    menuMarkers: menuMarkers,
    tieredMenuMarkers: tieredMenuMarkers,
    markers: markers,
    onHandler: onHandler,
    onKeyboardHandler: onKeyboardHandler,
    onStrictHandler: onStrictHandler,
    onStrictKeyboardHandler: onStrictKeyboardHandler,
    output: output$1,
    snapshot: snapshot$1
  };

  var ReceivingSchema = [$_76kfpx1jcg89g86.strictOf('channels', $_51tzzcxgjcg89gax.setOf($_b8l9yux7jcg89g9z.value, $_51tzzcxgjcg89gax.objOfOnly([
      $_czln55ysjcg89ggs.onStrictHandler('onReceive'),
      $_76kfpx1jcg89g86.defaulted('schema', $_51tzzcxgjcg89gax.anyValue())
    ])))];

  var Receiving = $_eid12yw3jcg89g3y.create({
    fields: ReceivingSchema,
    name: 'receiving',
    active: $_ermk4qyqjcg89ggi
  });

  var updateAriaState = function (component, toggleConfig) {
    var pressed = isOn(component, toggleConfig);
    var ariaInfo = toggleConfig.aria();
    ariaInfo.update()(component, ariaInfo, pressed);
  };
  var toggle$2 = function (component, toggleConfig, toggleState) {
    $_bhzm7gxtjcg89gcg.toggle(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var on = function (component, toggleConfig, toggleState) {
    $_bhzm7gxtjcg89gcg.add(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var off = function (component, toggleConfig, toggleState) {
    $_bhzm7gxtjcg89gcg.remove(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var isOn = function (component, toggleConfig) {
    return $_bhzm7gxtjcg89gcg.has(component.element(), toggleConfig.toggleClass());
  };
  var onLoad = function (component, toggleConfig, toggleState) {
    var api = toggleConfig.selected() ? on : off;
    api(component, toggleConfig, toggleState);
  };
  var $_4p624bywjcg89ghm = {
    onLoad: onLoad,
    toggle: toggle$2,
    isOn: isOn,
    on: on,
    off: off
  };

  var exhibit = function (base, toggleConfig, toggleState) {
    return $_8qlllaxjjcg89gbk.nu({});
  };
  var events$1 = function (toggleConfig, toggleState) {
    var execute = $_42if07w4jcg89g47.executeEvent(toggleConfig, toggleState, $_4p624bywjcg89ghm.toggle);
    var load = $_42if07w4jcg89g47.loadEvent(toggleConfig, toggleState, $_4p624bywjcg89ghm.onLoad);
    return $_1hggxlw5jcg89g4s.derive($_89wx8cw8jcg89g5d.flatten([
      toggleConfig.toggleOnExecute() ? [execute] : [],
      [load]
    ]));
  };
  var $_6l0tyryvjcg89ghh = {
    exhibit: exhibit,
    events: events$1
  };

  var updatePressed = function (component, ariaInfo, status) {
    $_69krbwxvjcg89gck.set(component.element(), 'aria-pressed', status);
    if (ariaInfo.syncWithExpanded())
      updateExpanded(component, ariaInfo, status);
  };
  var updateSelected = function (component, ariaInfo, status) {
    $_69krbwxvjcg89gck.set(component.element(), 'aria-selected', status);
  };
  var updateChecked = function (component, ariaInfo, status) {
    $_69krbwxvjcg89gck.set(component.element(), 'aria-checked', status);
  };
  var updateExpanded = function (component, ariaInfo, status) {
    $_69krbwxvjcg89gck.set(component.element(), 'aria-expanded', status);
  };
  var tagAttributes = {
    button: ['aria-pressed'],
    'input:checkbox': ['aria-checked']
  };
  var roleAttributes = {
    'button': ['aria-pressed'],
    'listbox': [
      'aria-pressed',
      'aria-expanded'
    ],
    'menuitemcheckbox': ['aria-checked']
  };
  var detectFromTag = function (component) {
    var elem = component.element();
    var rawTag = $_xqscexwjcg89gct.name(elem);
    var suffix = rawTag === 'input' && $_69krbwxvjcg89gck.has(elem, 'type') ? ':' + $_69krbwxvjcg89gck.get(elem, 'type') : '';
    return $_b52oxhx5jcg89g9l.readOptFrom(tagAttributes, rawTag + suffix);
  };
  var detectFromRole = function (component) {
    var elem = component.element();
    if (!$_69krbwxvjcg89gck.has(elem, 'role'))
      return $_en0sddw9jcg89g5j.none();
    else {
      var role = $_69krbwxvjcg89gck.get(elem, 'role');
      return $_b52oxhx5jcg89g9l.readOptFrom(roleAttributes, role);
    }
  };
  var updateAuto = function (component, ariaInfo, status) {
    var attributes = detectFromRole(component).orThunk(function () {
      return detectFromTag(component);
    }).getOr([]);
    $_89wx8cw8jcg89g5d.each(attributes, function (attr) {
      $_69krbwxvjcg89gck.set(component.element(), attr, status);
    });
  };
  var $_cxai9myyjcg89ghw = {
    updatePressed: updatePressed,
    updateSelected: updateSelected,
    updateChecked: updateChecked,
    updateExpanded: updateExpanded,
    updateAuto: updateAuto
  };

  var ToggleSchema = [
    $_76kfpx1jcg89g86.defaulted('selected', false),
    $_76kfpx1jcg89g86.strict('toggleClass'),
    $_76kfpx1jcg89g86.defaulted('toggleOnExecute', true),
    $_76kfpx1jcg89g86.defaultedOf('aria', { mode: 'none' }, $_51tzzcxgjcg89gax.choose('mode', {
      'pressed': [
        $_76kfpx1jcg89g86.defaulted('syncWithExpanded', false),
        $_czln55ysjcg89ggs.output('update', $_cxai9myyjcg89ghw.updatePressed)
      ],
      'checked': [$_czln55ysjcg89ggs.output('update', $_cxai9myyjcg89ghw.updateChecked)],
      'expanded': [$_czln55ysjcg89ggs.output('update', $_cxai9myyjcg89ghw.updateExpanded)],
      'selected': [$_czln55ysjcg89ggs.output('update', $_cxai9myyjcg89ghw.updateSelected)],
      'none': [$_czln55ysjcg89ggs.output('update', $_9m9qz3wajcg89g5n.noop)]
    }))
  ];

  var Toggling = $_eid12yw3jcg89g3y.create({
    fields: ToggleSchema,
    name: 'toggling',
    active: $_6l0tyryvjcg89ghh,
    apis: $_4p624bywjcg89ghm
  });

  var format = function (command, update) {
    return Receiving.config({
      channels: $_b52oxhx5jcg89g9l.wrap($_3fc8hyynjcg89gfx.formatChanged(), {
        onReceive: function (button, data) {
          if (data.command === command) {
            update(button, data.state);
          }
        }
      })
    });
  };
  var orientation = function (onReceive) {
    return Receiving.config({ channels: $_b52oxhx5jcg89g9l.wrap($_3fc8hyynjcg89gfx.orientationChanged(), { onReceive: onReceive }) });
  };
  var receive = function (channel, onReceive) {
    return {
      key: channel,
      value: { onReceive: onReceive }
    };
  };
  var $_8qmhfpyzjcg89gi8 = {
    format: format,
    orientation: orientation,
    receive: receive
  };

  var prefix = 'tinymce-mobile';
  var resolve$1 = function (p) {
    return prefix + '-' + p;
  };
  var $_452cgoz0jcg89gid = {
    resolve: resolve$1,
    prefix: $_9m9qz3wajcg89g5n.constant(prefix)
  };

  var exhibit$1 = function (base, unselectConfig) {
    return $_8qlllaxjjcg89gbk.nu({
      styles: {
        '-webkit-user-select': 'none',
        'user-select': 'none',
        '-ms-user-select': 'none',
        '-moz-user-select': '-moz-none'
      },
      attributes: { 'unselectable': 'on' }
    });
  };
  var events$2 = function (unselectConfig) {
    return $_1hggxlw5jcg89g4s.derive([$_1hggxlw5jcg89g4s.abort($_3338ovwwjcg89g7g.selectstart(), $_9m9qz3wajcg89g5n.constant(true))]);
  };
  var $_3niwnbz3jcg89giw = {
    events: events$2,
    exhibit: exhibit$1
  };

  var Unselecting = $_eid12yw3jcg89g3y.create({
    fields: [],
    name: 'unselecting',
    active: $_3niwnbz3jcg89giw
  });

  var focus$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_72ito4yfjcg89gf5.focus(component.element());
      focusConfig.onFocus()(component);
    }
  };
  var blur$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_72ito4yfjcg89gf5.blur(component.element());
    }
  };
  var isFocused = function (component) {
    return $_72ito4yfjcg89gf5.hasFocus(component.element());
  };
  var $_8h9eqrz7jcg89gj9 = {
    focus: focus$1,
    blur: blur$1,
    isFocused: isFocused
  };

  var exhibit$2 = function (base, focusConfig) {
    if (focusConfig.ignore())
      return $_8qlllaxjjcg89gbk.nu({});
    else
      return $_8qlllaxjjcg89gbk.nu({ attributes: { 'tabindex': '-1' } });
  };
  var events$3 = function (focusConfig) {
    return $_1hggxlw5jcg89g4s.derive([$_1hggxlw5jcg89g4s.run($_f1ifvdwvjcg89g7a.focus(), function (component, simulatedEvent) {
        $_8h9eqrz7jcg89gj9.focus(component, focusConfig);
        simulatedEvent.stop();
      })]);
  };
  var $_schk3z6jcg89gj7 = {
    exhibit: exhibit$2,
    events: events$3
  };

  var FocusSchema = [
    $_czln55ysjcg89ggs.onHandler('onFocus'),
    $_76kfpx1jcg89g86.defaulted('ignore', false)
  ];

  var Focusing = $_eid12yw3jcg89g3y.create({
    fields: FocusSchema,
    name: 'focusing',
    active: $_schk3z6jcg89gj7,
    apis: $_8h9eqrz7jcg89gj9
  });

  var $_8mskkgzdjcg89gk3 = {
    BACKSPACE: $_9m9qz3wajcg89g5n.constant([8]),
    TAB: $_9m9qz3wajcg89g5n.constant([9]),
    ENTER: $_9m9qz3wajcg89g5n.constant([13]),
    SHIFT: $_9m9qz3wajcg89g5n.constant([16]),
    CTRL: $_9m9qz3wajcg89g5n.constant([17]),
    ALT: $_9m9qz3wajcg89g5n.constant([18]),
    CAPSLOCK: $_9m9qz3wajcg89g5n.constant([20]),
    ESCAPE: $_9m9qz3wajcg89g5n.constant([27]),
    SPACE: $_9m9qz3wajcg89g5n.constant([32]),
    PAGEUP: $_9m9qz3wajcg89g5n.constant([33]),
    PAGEDOWN: $_9m9qz3wajcg89g5n.constant([34]),
    END: $_9m9qz3wajcg89g5n.constant([35]),
    HOME: $_9m9qz3wajcg89g5n.constant([36]),
    LEFT: $_9m9qz3wajcg89g5n.constant([37]),
    UP: $_9m9qz3wajcg89g5n.constant([38]),
    RIGHT: $_9m9qz3wajcg89g5n.constant([39]),
    DOWN: $_9m9qz3wajcg89g5n.constant([40]),
    INSERT: $_9m9qz3wajcg89g5n.constant([45]),
    DEL: $_9m9qz3wajcg89g5n.constant([46]),
    META: $_9m9qz3wajcg89g5n.constant([
      91,
      93,
      224
    ]),
    F10: $_9m9qz3wajcg89g5n.constant([121])
  };

  var cycleBy = function (value, delta, min, max) {
    var r = value + delta;
    if (r > max)
      return min;
    else
      return r < min ? max : r;
  };
  var cap = function (value, min, max) {
    if (value <= min)
      return min;
    else
      return value >= max ? max : value;
  };
  var $_colsgezijcg89gkx = {
    cycleBy: cycleBy,
    cap: cap
  };

  var all$3 = function (predicate) {
    return descendants$1($_c2mv10y6jcg89gec.body(), predicate);
  };
  var ancestors$1 = function (scope, predicate, isRoot) {
    return $_89wx8cw8jcg89g5d.filter($_3ndsgfy2jcg89gdr.parents(scope, isRoot), predicate);
  };
  var siblings$2 = function (scope, predicate) {
    return $_89wx8cw8jcg89g5d.filter($_3ndsgfy2jcg89gdr.siblings(scope), predicate);
  };
  var children$2 = function (scope, predicate) {
    return $_89wx8cw8jcg89g5d.filter($_3ndsgfy2jcg89gdr.children(scope), predicate);
  };
  var descendants$1 = function (scope, predicate) {
    var result = [];
    $_89wx8cw8jcg89g5d.each($_3ndsgfy2jcg89gdr.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants$1(x, predicate));
    });
    return result;
  };
  var $_6ff541zkjcg89gl1 = {
    all: all$3,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  var all$2 = function (selector) {
    return $_4cgirewrjcg89g6t.all(selector);
  };
  var ancestors = function (scope, selector, isRoot) {
    return $_6ff541zkjcg89gl1.ancestors(scope, function (e) {
      return $_4cgirewrjcg89g6t.is(e, selector);
    }, isRoot);
  };
  var siblings$1 = function (scope, selector) {
    return $_6ff541zkjcg89gl1.siblings(scope, function (e) {
      return $_4cgirewrjcg89g6t.is(e, selector);
    });
  };
  var children$1 = function (scope, selector) {
    return $_6ff541zkjcg89gl1.children(scope, function (e) {
      return $_4cgirewrjcg89g6t.is(e, selector);
    });
  };
  var descendants = function (scope, selector) {
    return $_4cgirewrjcg89g6t.all(selector, scope);
  };
  var $_63rwmczjjcg89gkz = {
    all: all$2,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var first$2 = function (selector) {
    return $_4cgirewrjcg89g6t.one(selector);
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_f4g77pyhjcg89gfa.ancestor(scope, function (e) {
      return $_4cgirewrjcg89g6t.is(e, selector);
    }, isRoot);
  };
  var sibling$2 = function (scope, selector) {
    return $_f4g77pyhjcg89gfa.sibling(scope, function (e) {
      return $_4cgirewrjcg89g6t.is(e, selector);
    });
  };
  var child$3 = function (scope, selector) {
    return $_f4g77pyhjcg89gfa.child(scope, function (e) {
      return $_4cgirewrjcg89g6t.is(e, selector);
    });
  };
  var descendant$2 = function (scope, selector) {
    return $_4cgirewrjcg89g6t.one(selector, scope);
  };
  var closest$2 = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_4cgirewrjcg89g6t.is, ancestor$2, scope, selector, isRoot);
  };
  var $_5rph7vzljcg89gl5 = {
    first: first$2,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var dehighlightAll = function (component, hConfig, hState) {
    var highlighted = $_63rwmczjjcg89gkz.descendants(component.element(), '.' + hConfig.highlightClass());
    $_89wx8cw8jcg89g5d.each(highlighted, function (h) {
      $_bhzm7gxtjcg89gcg.remove(h, hConfig.highlightClass());
      component.getSystem().getByDom(h).each(function (target) {
        hConfig.onDehighlight()(component, target);
      });
    });
  };
  var dehighlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    $_bhzm7gxtjcg89gcg.remove(target.element(), hConfig.highlightClass());
    if (wasHighlighted)
      hConfig.onDehighlight()(component, target);
  };
  var highlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    dehighlightAll(component, hConfig, hState);
    $_bhzm7gxtjcg89gcg.add(target.element(), hConfig.highlightClass());
    if (!wasHighlighted)
      hConfig.onHighlight()(component, target);
  };
  var highlightFirst = function (component, hConfig, hState) {
    getFirst(component, hConfig, hState).each(function (firstComp) {
      highlight(component, hConfig, hState, firstComp);
    });
  };
  var highlightLast = function (component, hConfig, hState) {
    getLast(component, hConfig, hState).each(function (lastComp) {
      highlight(component, hConfig, hState, lastComp);
    });
  };
  var highlightAt = function (component, hConfig, hState, index) {
    getByIndex(component, hConfig, hState, index).fold(function (err) {
      throw new Error(err);
    }, function (firstComp) {
      highlight(component, hConfig, hState, firstComp);
    });
  };
  var highlightBy = function (component, hConfig, hState, predicate) {
    var items = $_63rwmczjjcg89gkz.descendants(component.element(), '.' + hConfig.itemClass());
    var itemComps = $_crwoiuydjcg89gf3.cat($_89wx8cw8jcg89g5d.map(items, function (i) {
      return component.getSystem().getByDom(i).toOption();
    }));
    var targetComp = $_89wx8cw8jcg89g5d.find(itemComps, predicate);
    targetComp.each(function (c) {
      highlight(component, hConfig, hState, c);
    });
  };
  var isHighlighted = function (component, hConfig, hState, queryTarget) {
    return $_bhzm7gxtjcg89gcg.has(queryTarget.element(), hConfig.highlightClass());
  };
  var getHighlighted = function (component, hConfig, hState) {
    return $_5rph7vzljcg89gl5.descendant(component.element(), '.' + hConfig.highlightClass()).bind(component.getSystem().getByDom);
  };
  var getByIndex = function (component, hConfig, hState, index) {
    var items = $_63rwmczjjcg89gkz.descendants(component.element(), '.' + hConfig.itemClass());
    return $_en0sddw9jcg89g5j.from(items[index]).fold(function () {
      return $_b8l9yux7jcg89g9z.error('No element found with index ' + index);
    }, component.getSystem().getByDom);
  };
  var getFirst = function (component, hConfig, hState) {
    return $_5rph7vzljcg89gl5.descendant(component.element(), '.' + hConfig.itemClass()).bind(component.getSystem().getByDom);
  };
  var getLast = function (component, hConfig, hState) {
    var items = $_63rwmczjjcg89gkz.descendants(component.element(), '.' + hConfig.itemClass());
    var last = items.length > 0 ? $_en0sddw9jcg89g5j.some(items[items.length - 1]) : $_en0sddw9jcg89g5j.none();
    return last.bind(component.getSystem().getByDom);
  };
  var getDelta = function (component, hConfig, hState, delta) {
    var items = $_63rwmczjjcg89gkz.descendants(component.element(), '.' + hConfig.itemClass());
    var current = $_89wx8cw8jcg89g5d.findIndex(items, function (item) {
      return $_bhzm7gxtjcg89gcg.has(item, hConfig.highlightClass());
    });
    return current.bind(function (selected) {
      var dest = $_colsgezijcg89gkx.cycleBy(selected, delta, 0, items.length - 1);
      return component.getSystem().getByDom(items[dest]);
    });
  };
  var getPrevious = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, -1);
  };
  var getNext = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, +1);
  };
  var $_635eg9zhjcg89gkl = {
    dehighlightAll: dehighlightAll,
    dehighlight: dehighlight,
    highlight: highlight,
    highlightFirst: highlightFirst,
    highlightLast: highlightLast,
    highlightAt: highlightAt,
    highlightBy: highlightBy,
    isHighlighted: isHighlighted,
    getHighlighted: getHighlighted,
    getFirst: getFirst,
    getLast: getLast,
    getPrevious: getPrevious,
    getNext: getNext
  };

  var HighlightSchema = [
    $_76kfpx1jcg89g86.strict('highlightClass'),
    $_76kfpx1jcg89g86.strict('itemClass'),
    $_czln55ysjcg89ggs.onHandler('onHighlight'),
    $_czln55ysjcg89ggs.onHandler('onDehighlight')
  ];

  var Highlighting = $_eid12yw3jcg89g3y.create({
    fields: HighlightSchema,
    name: 'highlighting',
    apis: $_635eg9zhjcg89gkl
  });

  var dom = function () {
    var get = function (component) {
      return $_72ito4yfjcg89gf5.search(component.element());
    };
    var set = function (component, focusee) {
      component.getSystem().triggerFocus(focusee, component.element());
    };
    return {
      get: get,
      set: set
    };
  };
  var highlights = function () {
    var get = function (component) {
      return Highlighting.getHighlighted(component).map(function (item) {
        return item.element();
      });
    };
    var set = function (component, element) {
      component.getSystem().getByDom(element).fold($_9m9qz3wajcg89g5n.noop, function (item) {
        Highlighting.highlight(component, item);
      });
    };
    return {
      get: get,
      set: set
    };
  };
  var $_7j0m8dzfjcg89gkf = {
    dom: dom,
    highlights: highlights
  };

  var inSet = function (keys) {
    return function (event) {
      return $_89wx8cw8jcg89g5d.contains(keys, event.raw().which);
    };
  };
  var and = function (preds) {
    return function (event) {
      return $_89wx8cw8jcg89g5d.forall(preds, function (pred) {
        return pred(event);
      });
    };
  };
  var is$1 = function (key) {
    return function (event) {
      return event.raw().which === key;
    };
  };
  var isShift = function (event) {
    return event.raw().shiftKey === true;
  };
  var isControl = function (event) {
    return event.raw().ctrlKey === true;
  };
  var $_12d4g3zojcg89gll = {
    inSet: inSet,
    and: and,
    is: is$1,
    isShift: isShift,
    isNotShift: $_9m9qz3wajcg89g5n.not(isShift),
    isControl: isControl,
    isNotControl: $_9m9qz3wajcg89g5n.not(isControl)
  };

  var basic = function (key, action) {
    return {
      matches: $_12d4g3zojcg89gll.is(key),
      classification: action
    };
  };
  var rule = function (matches, action) {
    return {
      matches: matches,
      classification: action
    };
  };
  var choose$2 = function (transitions, event) {
    var transition = $_89wx8cw8jcg89g5d.find(transitions, function (t) {
      return t.matches(event);
    });
    return transition.map(function (t) {
      return t.classification;
    });
  };
  var $_vjhg8znjcg89glh = {
    basic: basic,
    rule: rule,
    choose: choose$2
  };

  var typical = function (infoSchema, stateInit, getRules, getEvents, getApis, optFocusIn) {
    var schema = function () {
      return infoSchema.concat([
        $_76kfpx1jcg89g86.defaulted('focusManager', $_7j0m8dzfjcg89gkf.dom()),
        $_czln55ysjcg89ggs.output('handler', me),
        $_czln55ysjcg89ggs.output('state', stateInit)
      ]);
    };
    var processKey = function (component, simulatedEvent, keyingConfig, keyingState) {
      var rules = getRules(component, simulatedEvent, keyingConfig, keyingState);
      return $_vjhg8znjcg89glh.choose(rules, simulatedEvent.event()).bind(function (rule) {
        return rule(component, simulatedEvent, keyingConfig, keyingState);
      });
    };
    var toEvents = function (keyingConfig, keyingState) {
      var otherEvents = getEvents(keyingConfig, keyingState);
      var keyEvents = $_1hggxlw5jcg89g4s.derive(optFocusIn.map(function (focusIn) {
        return $_1hggxlw5jcg89g4s.run($_f1ifvdwvjcg89g7a.focus(), function (component, simulatedEvent) {
          focusIn(component, keyingConfig, keyingState, simulatedEvent);
          simulatedEvent.stop();
        });
      }).toArray().concat([$_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.keydown(), function (component, simulatedEvent) {
          processKey(component, simulatedEvent, keyingConfig, keyingState).each(function (_) {
            simulatedEvent.stop();
          });
        })]));
      return $_5mo1ztwxjcg89g7j.deepMerge(otherEvents, keyEvents);
    };
    var me = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents,
      toApis: getApis
    };
    return me;
  };
  var $_1fxogyzejcg89gk8 = { typical: typical };

  var cyclePrev = function (values, index, predicate) {
    var before = $_89wx8cw8jcg89g5d.reverse(values.slice(0, index));
    var after = $_89wx8cw8jcg89g5d.reverse(values.slice(index + 1));
    return $_89wx8cw8jcg89g5d.find(before.concat(after), predicate);
  };
  var tryPrev = function (values, index, predicate) {
    var before = $_89wx8cw8jcg89g5d.reverse(values.slice(0, index));
    return $_89wx8cw8jcg89g5d.find(before, predicate);
  };
  var cycleNext = function (values, index, predicate) {
    var before = values.slice(0, index);
    var after = values.slice(index + 1);
    return $_89wx8cw8jcg89g5d.find(after.concat(before), predicate);
  };
  var tryNext = function (values, index, predicate) {
    var after = values.slice(index + 1);
    return $_89wx8cw8jcg89g5d.find(after, predicate);
  };
  var $_ersuwxzpjcg89glt = {
    cyclePrev: cyclePrev,
    cycleNext: cycleNext,
    tryPrev: tryPrev,
    tryNext: tryNext
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_3f2po3zsjcg89gm7 = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!$_405i8jwyjcg89g7l.isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_3f2po3zsjcg89gm7.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_3f2po3zsjcg89gm7.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$3 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    $_gbrpaqwzjcg89g7p.each(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    $_gbrpaqwzjcg89g7p.each(css, function (v, k) {
      v.fold(function () {
        internalRemove(dom, k);
      }, function (value) {
        internalSet(dom, k, value);
      });
    });
  };
  var get$4 = function (element, property) {
    var dom = element.dom();
    var styles = window.getComputedStyle(dom);
    var r = styles.getPropertyValue(property);
    var v = r === '' && !$_c2mv10y6jcg89gec.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_3f2po3zsjcg89gm7.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
  };
  var getRaw = function (element, property) {
    var dom = element.dom();
    var raw = getUnsafeProperty(dom, property);
    return $_en0sddw9jcg89g5j.from(raw).filter(function (r) {
      return r.length > 0;
    });
  };
  var getAllRaw = function (element) {
    var css = {};
    var dom = element.dom();
    if ($_3f2po3zsjcg89gm7.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = $_a3ihziwsjcg89g6w.fromTag(tag);
    set$3(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$5 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_69krbwxvjcg89gck.has(element, 'style') && $_g4nyklwojcg89g6p.trim($_69krbwxvjcg89gck.get(element, 'style')) === '') {
      $_69krbwxvjcg89gck.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_69krbwxvjcg89gck.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_69krbwxvjcg89gck.remove : $_69krbwxvjcg89gck.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy$1 = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_3f2po3zsjcg89gm7.isSupported(sourceDom) && $_3f2po3zsjcg89gm7.isSupported(targetDom)) {
      targetDom.style.cssText = sourceDom.style.cssText;
    }
  };
  var reflow = function (e) {
    return e.dom().offsetWidth;
  };
  var transferOne$1 = function (source, destination, style) {
    getRaw(source, style).each(function (value) {
      if (getRaw(destination, style).isNone())
        set$3(destination, style, value);
    });
  };
  var transfer$1 = function (source, destination, styles) {
    if (!$_xqscexwjcg89gct.isElement(source) || !$_xqscexwjcg89gct.isElement(destination))
      return;
    $_89wx8cw8jcg89g5d.each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_17fn7izrjcg89glz = {
    copy: copy$1,
    set: set$3,
    preserve: preserve,
    setAll: setAll$1,
    setOptions: setOptions,
    remove: remove$5,
    get: get$4,
    getRaw: getRaw,
    getAllRaw: getAllRaw,
    isValidValue: isValidValue,
    reflow: reflow,
    transfer: transfer$1
  };

  var Dimension = function (name, getOffset) {
    var set = function (element, h) {
      if (!$_405i8jwyjcg89g7l.isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_3f2po3zsjcg89gm7.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_17fn7izrjcg89glz.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return $_89wx8cw8jcg89g5d.foldl(properties, function (acc, property) {
        var val = $_17fn7izrjcg89glz.get(element, property);
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

  var api = Dimension('height', function (element) {
    return $_c2mv10y6jcg89gec.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
  });
  var set$2 = function (element, h) {
    api.set(element, h);
  };
  var get$3 = function (element) {
    return api.get(element);
  };
  var getOuter$1 = function (element) {
    return api.getOuter(element);
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
    var absMax = api.max(element, value, inclusions);
    $_17fn7izrjcg89glz.set(element, 'max-height', absMax + 'px');
  };
  var $_cpvhuyzqjcg89glx = {
    set: set$2,
    get: get$3,
    getOuter: getOuter$1,
    setMax: setMax
  };

  var create$2 = function (cyclicField) {
    var schema = [
      $_76kfpx1jcg89g86.option('onEscape'),
      $_76kfpx1jcg89g86.option('onEnter'),
      $_76kfpx1jcg89g86.defaulted('selector', '[data-alloy-tabstop="true"]'),
      $_76kfpx1jcg89g86.defaulted('firstTabstop', 0),
      $_76kfpx1jcg89g86.defaulted('useTabstopAt', $_9m9qz3wajcg89g5n.constant(true)),
      $_76kfpx1jcg89g86.option('visibilitySelector')
    ].concat([cyclicField]);
    var isVisible = function (tabbingConfig, element) {
      var target = tabbingConfig.visibilitySelector().bind(function (sel) {
        return $_5rph7vzljcg89gl5.closest(element, sel);
      }).getOr(element);
      return $_cpvhuyzqjcg89glx.get(target) > 0;
    };
    var findInitial = function (component, tabbingConfig) {
      var tabstops = $_63rwmczjjcg89gkz.descendants(component.element(), tabbingConfig.selector());
      var visibles = $_89wx8cw8jcg89g5d.filter(tabstops, function (elem) {
        return isVisible(tabbingConfig, elem);
      });
      return $_en0sddw9jcg89g5j.from(visibles[tabbingConfig.firstTabstop()]);
    };
    var findCurrent = function (component, tabbingConfig) {
      return tabbingConfig.focusManager().get(component).bind(function (elem) {
        return $_5rph7vzljcg89gl5.closest(elem, tabbingConfig.selector());
      });
    };
    var isTabstop = function (tabbingConfig, element) {
      return isVisible(tabbingConfig, element) && tabbingConfig.useTabstopAt()(element);
    };
    var focusIn = function (component, tabbingConfig, tabbingState) {
      findInitial(component, tabbingConfig).each(function (target) {
        tabbingConfig.focusManager().set(component, target);
      });
    };
    var goFromTabstop = function (component, tabstops, stopIndex, tabbingConfig, cycle) {
      return cycle(tabstops, stopIndex, function (elem) {
        return isTabstop(tabbingConfig, elem);
      }).fold(function () {
        return tabbingConfig.cyclic() ? $_en0sddw9jcg89g5j.some(true) : $_en0sddw9jcg89g5j.none();
      }, function (target) {
        tabbingConfig.focusManager().set(component, target);
        return $_en0sddw9jcg89g5j.some(true);
      });
    };
    var go = function (component, simulatedEvent, tabbingConfig, cycle) {
      var tabstops = $_63rwmczjjcg89gkz.descendants(component.element(), tabbingConfig.selector());
      return findCurrent(component, tabbingConfig).bind(function (tabstop) {
        var optStopIndex = $_89wx8cw8jcg89g5d.findIndex(tabstops, $_9m9qz3wajcg89g5n.curry($_n5s8aw7jcg89g53.eq, tabstop));
        return optStopIndex.bind(function (stopIndex) {
          return goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle);
        });
      });
    };
    var goBackwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_ersuwxzpjcg89glt.cyclePrev : $_ersuwxzpjcg89glt.tryPrev;
      return go(component, simulatedEvent, tabbingConfig, navigate);
    };
    var goForwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_ersuwxzpjcg89glt.cycleNext : $_ersuwxzpjcg89glt.tryNext;
      return go(component, simulatedEvent, tabbingConfig, navigate);
    };
    var execute = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      return tabbingConfig.onEnter().bind(function (f) {
        return f(component, simulatedEvent);
      });
    };
    var exit = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      return tabbingConfig.onEscape().bind(function (f) {
        return f(component, simulatedEvent);
      });
    };
    var getRules = $_9m9qz3wajcg89g5n.constant([
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
        $_12d4g3zojcg89gll.isShift,
        $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.TAB())
      ]), goBackwards),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.TAB()), goForwards),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.ESCAPE()), exit),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
        $_12d4g3zojcg89gll.isNotShift,
        $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.ENTER())
      ]), execute)
    ]);
    var getEvents = $_9m9qz3wajcg89g5n.constant({});
    var getApis = $_9m9qz3wajcg89g5n.constant({});
    return $_1fxogyzejcg89gk8.typical(schema, $_960zyxxpjcg89gc9.init, getRules, getEvents, getApis, $_en0sddw9jcg89g5j.some(focusIn));
  };
  var $_2vqlebzcjcg89gjl = { create: create$2 };

  var AcyclicType = $_2vqlebzcjcg89gjl.create($_76kfpx1jcg89g86.state('cyclic', $_9m9qz3wajcg89g5n.constant(false)));

  var CyclicType = $_2vqlebzcjcg89gjl.create($_76kfpx1jcg89g86.state('cyclic', $_9m9qz3wajcg89g5n.constant(true)));

  var inside = function (target) {
    return $_xqscexwjcg89gct.name(target) === 'input' && $_69krbwxvjcg89gck.get(target, 'type') !== 'radio' || $_xqscexwjcg89gct.name(target) === 'textarea';
  };
  var $_fkimqmzwjcg89gmv = { inside: inside };

  var doDefaultExecute = function (component, simulatedEvent, focused) {
    $_fpm2ctwujcg89g73.dispatch(component, focused, $_f1ifvdwvjcg89g7a.execute());
    return $_en0sddw9jcg89g5j.some(true);
  };
  var defaultExecute = function (component, simulatedEvent, focused) {
    return $_fkimqmzwjcg89gmv.inside(focused) && $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.SPACE())(simulatedEvent.event()) ? $_en0sddw9jcg89g5j.none() : doDefaultExecute(component, simulatedEvent, focused);
  };
  var $_1izhvdzxjcg89gn0 = { defaultExecute: defaultExecute };

  var schema$1 = [
    $_76kfpx1jcg89g86.defaulted('execute', $_1izhvdzxjcg89gn0.defaultExecute),
    $_76kfpx1jcg89g86.defaulted('useSpace', false),
    $_76kfpx1jcg89g86.defaulted('useEnter', true),
    $_76kfpx1jcg89g86.defaulted('useControlEnter', false),
    $_76kfpx1jcg89g86.defaulted('useDown', false)
  ];
  var execute = function (component, simulatedEvent, executeConfig, executeState) {
    return executeConfig.execute()(component, simulatedEvent, component.element());
  };
  var getRules = function (component, simulatedEvent, executeConfig, executeState) {
    var spaceExec = executeConfig.useSpace() && !$_fkimqmzwjcg89gmv.inside(component.element()) ? $_8mskkgzdjcg89gk3.SPACE() : [];
    var enterExec = executeConfig.useEnter() ? $_8mskkgzdjcg89gk3.ENTER() : [];
    var downExec = executeConfig.useDown() ? $_8mskkgzdjcg89gk3.DOWN() : [];
    var execKeys = spaceExec.concat(enterExec).concat(downExec);
    return [$_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet(execKeys), execute)].concat(executeConfig.useControlEnter() ? [$_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
        $_12d4g3zojcg89gll.isControl,
        $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.ENTER())
      ]), execute)] : []);
  };
  var getEvents = $_9m9qz3wajcg89g5n.constant({});
  var getApis = $_9m9qz3wajcg89g5n.constant({});
  var ExecutionType = $_1fxogyzejcg89gk8.typical(schema$1, $_960zyxxpjcg89gc9.init, getRules, getEvents, getApis, $_en0sddw9jcg89g5j.none());

  var flatgrid = function (spec) {
    var dimensions = Cell($_en0sddw9jcg89g5j.none());
    var setGridSize = function (numRows, numColumns) {
      dimensions.set($_en0sddw9jcg89g5j.some({
        numRows: $_9m9qz3wajcg89g5n.constant(numRows),
        numColumns: $_9m9qz3wajcg89g5n.constant(numColumns)
      }));
    };
    var getNumRows = function () {
      return dimensions.get().map(function (d) {
        return d.numRows();
      });
    };
    var getNumColumns = function () {
      return dimensions.get().map(function (d) {
        return d.numColumns();
      });
    };
    return BehaviourState({
      readState: $_9m9qz3wajcg89g5n.constant({}),
      setGridSize: setGridSize,
      getNumRows: getNumRows,
      getNumColumns: getNumColumns
    });
  };
  var init$1 = function (spec) {
    return spec.state()(spec);
  };
  var $_5xngs4zzjcg89gnc = {
    flatgrid: flatgrid,
    init: init$1
  };

  var onDirection = function (isLtr, isRtl) {
    return function (element) {
      return getDirection(element) === 'rtl' ? isRtl : isLtr;
    };
  };
  var getDirection = function (element) {
    return $_17fn7izrjcg89glz.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_973hb9101jcg89gnl = {
    onDirection: onDirection,
    getDirection: getDirection
  };

  var useH = function (movement) {
    return function (component, simulatedEvent, config, state) {
      var move = movement(component.element());
      return use(move, component, simulatedEvent, config, state);
    };
  };
  var west = function (moveLeft, moveRight) {
    var movement = $_973hb9101jcg89gnl.onDirection(moveLeft, moveRight);
    return useH(movement);
  };
  var east = function (moveLeft, moveRight) {
    var movement = $_973hb9101jcg89gnl.onDirection(moveRight, moveLeft);
    return useH(movement);
  };
  var useV = function (move) {
    return function (component, simulatedEvent, config, state) {
      return use(move, component, simulatedEvent, config, state);
    };
  };
  var use = function (move, component, simulatedEvent, config, state) {
    var outcome = config.focusManager().get(component).bind(function (focused) {
      return move(component.element(), focused, config, state);
    });
    return outcome.map(function (newFocus) {
      config.focusManager().set(component, newFocus);
      return true;
    });
  };
  var $_oi88x100jcg89gnh = {
    east: east,
    west: west,
    north: useV,
    south: useV,
    move: useV
  };

  var indexInfo = $_4pc2ltxljcg89gc2.immutableBag([
    'index',
    'candidates'
  ], []);
  var locate = function (candidates, predicate) {
    return $_89wx8cw8jcg89g5d.findIndex(candidates, predicate).map(function (index) {
      return indexInfo({
        index: index,
        candidates: candidates
      });
    });
  };
  var $_9251cw103jcg89go7 = { locate: locate };

  var visibilityToggler = function (element, property, hiddenValue, visibleValue) {
    var initial = $_17fn7izrjcg89glz.get(element, property);
    if (initial === undefined)
      initial = '';
    var value = initial === hiddenValue ? visibleValue : hiddenValue;
    var off = $_9m9qz3wajcg89g5n.curry($_17fn7izrjcg89glz.set, element, property, initial);
    var on = $_9m9qz3wajcg89g5n.curry($_17fn7izrjcg89glz.set, element, property, value);
    return Toggler(off, on, false);
  };
  var toggler$1 = function (element) {
    return visibilityToggler(element, 'visibility', 'hidden', 'visible');
  };
  var displayToggler = function (element, value) {
    return visibilityToggler(element, 'display', 'none', value);
  };
  var isHidden = function (dom) {
    return dom.offsetWidth <= 0 && dom.offsetHeight <= 0;
  };
  var isVisible = function (element) {
    var dom = element.dom();
    return !isHidden(dom);
  };
  var $_db4fhj104jcg89goe = {
    toggler: toggler$1,
    displayToggler: displayToggler,
    isVisible: isVisible
  };

  var locateVisible = function (container, current, selector) {
    var filter = $_db4fhj104jcg89goe.isVisible;
    return locateIn(container, current, selector, filter);
  };
  var locateIn = function (container, current, selector, filter) {
    var predicate = $_9m9qz3wajcg89g5n.curry($_n5s8aw7jcg89g53.eq, current);
    var candidates = $_63rwmczjjcg89gkz.descendants(container, selector);
    var visible = $_89wx8cw8jcg89g5d.filter(candidates, $_db4fhj104jcg89goe.isVisible);
    return $_9251cw103jcg89go7.locate(visible, predicate);
  };
  var findIndex$2 = function (elements, target) {
    return $_89wx8cw8jcg89g5d.findIndex(elements, function (elem) {
      return $_n5s8aw7jcg89g53.eq(target, elem);
    });
  };
  var $_9kcxax102jcg89gnn = {
    locateVisible: locateVisible,
    locateIn: locateIn,
    findIndex: findIndex$2
  };

  var withGrid = function (values, index, numCols, f) {
    var oldRow = Math.floor(index / numCols);
    var oldColumn = index % numCols;
    return f(oldRow, oldColumn).bind(function (address) {
      var newIndex = address.row() * numCols + address.column();
      return newIndex >= 0 && newIndex < values.length ? $_en0sddw9jcg89g5j.some(values[newIndex]) : $_en0sddw9jcg89g5j.none();
    });
  };
  var cycleHorizontal = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var onLastRow = oldRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - oldRow * numCols : numCols;
      var newColumn = $_colsgezijcg89gkx.cycleBy(oldColumn, delta, 0, colsInRow - 1);
      return $_en0sddw9jcg89g5j.some({
        row: $_9m9qz3wajcg89g5n.constant(oldRow),
        column: $_9m9qz3wajcg89g5n.constant(newColumn)
      });
    });
  };
  var cycleVertical = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var newRow = $_colsgezijcg89gkx.cycleBy(oldRow, delta, 0, numRows - 1);
      var onLastRow = newRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - newRow * numCols : numCols;
      var newCol = $_colsgezijcg89gkx.cap(oldColumn, 0, colsInRow - 1);
      return $_en0sddw9jcg89g5j.some({
        row: $_9m9qz3wajcg89g5n.constant(newRow),
        column: $_9m9qz3wajcg89g5n.constant(newCol)
      });
    });
  };
  var cycleRight = function (values, index, numRows, numCols) {
    return cycleHorizontal(values, index, numRows, numCols, +1);
  };
  var cycleLeft = function (values, index, numRows, numCols) {
    return cycleHorizontal(values, index, numRows, numCols, -1);
  };
  var cycleUp = function (values, index, numRows, numCols) {
    return cycleVertical(values, index, numRows, numCols, -1);
  };
  var cycleDown = function (values, index, numRows, numCols) {
    return cycleVertical(values, index, numRows, numCols, +1);
  };
  var $_41ilbr105jcg89gok = {
    cycleDown: cycleDown,
    cycleUp: cycleUp,
    cycleLeft: cycleLeft,
    cycleRight: cycleRight
  };

  var schema$2 = [
    $_76kfpx1jcg89g86.strict('selector'),
    $_76kfpx1jcg89g86.defaulted('execute', $_1izhvdzxjcg89gn0.defaultExecute),
    $_czln55ysjcg89ggs.onKeyboardHandler('onEscape'),
    $_76kfpx1jcg89g86.defaulted('captureTab', false),
    $_czln55ysjcg89ggs.initSize()
  ];
  var focusIn = function (component, gridConfig, gridState) {
    $_5rph7vzljcg89gl5.descendant(component.element(), gridConfig.selector()).each(function (first) {
      gridConfig.focusManager().set(component, first);
    });
  };
  var findCurrent = function (component, gridConfig) {
    return gridConfig.focusManager().get(component).bind(function (elem) {
      return $_5rph7vzljcg89gl5.closest(elem, gridConfig.selector());
    });
  };
  var execute$1 = function (component, simulatedEvent, gridConfig, gridState) {
    return findCurrent(component, gridConfig).bind(function (focused) {
      return gridConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var doMove = function (cycle) {
    return function (element, focused, gridConfig, gridState) {
      return $_9kcxax102jcg89gnn.locateVisible(element, focused, gridConfig.selector()).bind(function (identified) {
        return cycle(identified.candidates(), identified.index(), gridState.getNumRows().getOr(gridConfig.initSize().numRows()), gridState.getNumColumns().getOr(gridConfig.initSize().numColumns()));
      });
    };
  };
  var handleTab = function (component, simulatedEvent, gridConfig, gridState) {
    return gridConfig.captureTab() ? $_en0sddw9jcg89g5j.some(true) : $_en0sddw9jcg89g5j.none();
  };
  var doEscape = function (component, simulatedEvent, gridConfig, gridState) {
    return gridConfig.onEscape()(component, simulatedEvent);
  };
  var moveLeft = doMove($_41ilbr105jcg89gok.cycleLeft);
  var moveRight = doMove($_41ilbr105jcg89gok.cycleRight);
  var moveNorth = doMove($_41ilbr105jcg89gok.cycleUp);
  var moveSouth = doMove($_41ilbr105jcg89gok.cycleDown);
  var getRules$1 = $_9m9qz3wajcg89g5n.constant([
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.LEFT()), $_oi88x100jcg89gnh.west(moveLeft, moveRight)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.RIGHT()), $_oi88x100jcg89gnh.east(moveLeft, moveRight)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.UP()), $_oi88x100jcg89gnh.north(moveNorth)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.DOWN()), $_oi88x100jcg89gnh.south(moveSouth)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
      $_12d4g3zojcg89gll.isShift,
      $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.TAB())
    ]), handleTab),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
      $_12d4g3zojcg89gll.isNotShift,
      $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.TAB())
    ]), handleTab),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.ESCAPE()), doEscape),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.SPACE().concat($_8mskkgzdjcg89gk3.ENTER())), execute$1)
  ]);
  var getEvents$1 = $_9m9qz3wajcg89g5n.constant({});
  var getApis$1 = {};
  var FlatgridType = $_1fxogyzejcg89gk8.typical(schema$2, $_5xngs4zzjcg89gnc.flatgrid, getRules$1, getEvents$1, getApis$1, $_en0sddw9jcg89g5j.some(focusIn));

  var horizontal = function (container, selector, current, delta) {
    return $_9kcxax102jcg89gnn.locateVisible(container, current, selector, $_9m9qz3wajcg89g5n.constant(true)).bind(function (identified) {
      var index = identified.index();
      var candidates = identified.candidates();
      var newIndex = $_colsgezijcg89gkx.cycleBy(index, delta, 0, candidates.length - 1);
      return $_en0sddw9jcg89g5j.from(candidates[newIndex]);
    });
  };
  var $_8ox9sh107jcg89gow = { horizontal: horizontal };

  var schema$3 = [
    $_76kfpx1jcg89g86.strict('selector'),
    $_76kfpx1jcg89g86.defaulted('getInitial', $_en0sddw9jcg89g5j.none),
    $_76kfpx1jcg89g86.defaulted('execute', $_1izhvdzxjcg89gn0.defaultExecute),
    $_76kfpx1jcg89g86.defaulted('executeOnMove', false)
  ];
  var findCurrent$1 = function (component, flowConfig) {
    return flowConfig.focusManager().get(component).bind(function (elem) {
      return $_5rph7vzljcg89gl5.closest(elem, flowConfig.selector());
    });
  };
  var execute$2 = function (component, simulatedEvent, flowConfig) {
    return findCurrent$1(component, flowConfig).bind(function (focused) {
      return flowConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$1 = function (component, flowConfig) {
    flowConfig.getInitial()(component).or($_5rph7vzljcg89gl5.descendant(component.element(), flowConfig.selector())).each(function (first) {
      flowConfig.focusManager().set(component, first);
    });
  };
  var moveLeft$1 = function (element, focused, info) {
    return $_8ox9sh107jcg89gow.horizontal(element, info.selector(), focused, -1);
  };
  var moveRight$1 = function (element, focused, info) {
    return $_8ox9sh107jcg89gow.horizontal(element, info.selector(), focused, +1);
  };
  var doMove$1 = function (movement) {
    return function (component, simulatedEvent, flowConfig) {
      return movement(component, simulatedEvent, flowConfig).bind(function () {
        return flowConfig.executeOnMove() ? execute$2(component, simulatedEvent, flowConfig) : $_en0sddw9jcg89g5j.some(true);
      });
    };
  };
  var getRules$2 = function (_) {
    return [
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.LEFT().concat($_8mskkgzdjcg89gk3.UP())), doMove$1($_oi88x100jcg89gnh.west(moveLeft$1, moveRight$1))),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.RIGHT().concat($_8mskkgzdjcg89gk3.DOWN())), doMove$1($_oi88x100jcg89gnh.east(moveLeft$1, moveRight$1))),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.ENTER()), execute$2),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.SPACE()), execute$2)
    ];
  };
  var getEvents$2 = $_9m9qz3wajcg89g5n.constant({});
  var getApis$2 = $_9m9qz3wajcg89g5n.constant({});
  var FlowType = $_1fxogyzejcg89gk8.typical(schema$3, $_960zyxxpjcg89gc9.init, getRules$2, getEvents$2, getApis$2, $_en0sddw9jcg89g5j.some(focusIn$1));

  var outcome = $_4pc2ltxljcg89gc2.immutableBag([
    'rowIndex',
    'columnIndex',
    'cell'
  ], []);
  var toCell = function (matrix, rowIndex, columnIndex) {
    return $_en0sddw9jcg89g5j.from(matrix[rowIndex]).bind(function (row) {
      return $_en0sddw9jcg89g5j.from(row[columnIndex]).map(function (cell) {
        return outcome({
          rowIndex: rowIndex,
          columnIndex: columnIndex,
          cell: cell
        });
      });
    });
  };
  var cycleHorizontal$1 = function (matrix, rowIndex, startCol, deltaCol) {
    var row = matrix[rowIndex];
    var colsInRow = row.length;
    var newColIndex = $_colsgezijcg89gkx.cycleBy(startCol, deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var cycleVertical$1 = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_colsgezijcg89gkx.cycleBy(startRow, deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_colsgezijcg89gkx.cap(colIndex, 0, colsInNextRow - 1);
    return toCell(matrix, nextRowIndex, nextColIndex);
  };
  var moveHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
    var row = matrix[rowIndex];
    var colsInRow = row.length;
    var newColIndex = $_colsgezijcg89gkx.cap(startCol + deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var moveVertical = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_colsgezijcg89gkx.cap(startRow + deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_colsgezijcg89gkx.cap(colIndex, 0, colsInNextRow - 1);
    return toCell(matrix, nextRowIndex, nextColIndex);
  };
  var cycleRight$1 = function (matrix, startRow, startCol) {
    return cycleHorizontal$1(matrix, startRow, startCol, +1);
  };
  var cycleLeft$1 = function (matrix, startRow, startCol) {
    return cycleHorizontal$1(matrix, startRow, startCol, -1);
  };
  var cycleUp$1 = function (matrix, startRow, startCol) {
    return cycleVertical$1(matrix, startCol, startRow, -1);
  };
  var cycleDown$1 = function (matrix, startRow, startCol) {
    return cycleVertical$1(matrix, startCol, startRow, +1);
  };
  var moveLeft$3 = function (matrix, startRow, startCol) {
    return moveHorizontal(matrix, startRow, startCol, -1);
  };
  var moveRight$3 = function (matrix, startRow, startCol) {
    return moveHorizontal(matrix, startRow, startCol, +1);
  };
  var moveUp = function (matrix, startRow, startCol) {
    return moveVertical(matrix, startCol, startRow, -1);
  };
  var moveDown = function (matrix, startRow, startCol) {
    return moveVertical(matrix, startCol, startRow, +1);
  };
  var $_aa4yv8109jcg89gpg = {
    cycleRight: cycleRight$1,
    cycleLeft: cycleLeft$1,
    cycleUp: cycleUp$1,
    cycleDown: cycleDown$1,
    moveLeft: moveLeft$3,
    moveRight: moveRight$3,
    moveUp: moveUp,
    moveDown: moveDown
  };

  var schema$4 = [
    $_76kfpx1jcg89g86.strictObjOf('selectors', [
      $_76kfpx1jcg89g86.strict('row'),
      $_76kfpx1jcg89g86.strict('cell')
    ]),
    $_76kfpx1jcg89g86.defaulted('cycles', true),
    $_76kfpx1jcg89g86.defaulted('previousSelector', $_en0sddw9jcg89g5j.none),
    $_76kfpx1jcg89g86.defaulted('execute', $_1izhvdzxjcg89gn0.defaultExecute)
  ];
  var focusIn$2 = function (component, matrixConfig) {
    var focused = matrixConfig.previousSelector()(component).orThunk(function () {
      var selectors = matrixConfig.selectors();
      return $_5rph7vzljcg89gl5.descendant(component.element(), selectors.cell());
    });
    focused.each(function (cell) {
      matrixConfig.focusManager().set(component, cell);
    });
  };
  var execute$3 = function (component, simulatedEvent, matrixConfig) {
    return $_72ito4yfjcg89gf5.search(component.element()).bind(function (focused) {
      return matrixConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var toMatrix = function (rows, matrixConfig) {
    return $_89wx8cw8jcg89g5d.map(rows, function (row) {
      return $_63rwmczjjcg89gkz.descendants(row, matrixConfig.selectors().cell());
    });
  };
  var doMove$2 = function (ifCycle, ifMove) {
    return function (element, focused, matrixConfig) {
      var move = matrixConfig.cycles() ? ifCycle : ifMove;
      return $_5rph7vzljcg89gl5.closest(focused, matrixConfig.selectors().row()).bind(function (inRow) {
        var cellsInRow = $_63rwmczjjcg89gkz.descendants(inRow, matrixConfig.selectors().cell());
        return $_9kcxax102jcg89gnn.findIndex(cellsInRow, focused).bind(function (colIndex) {
          var allRows = $_63rwmczjjcg89gkz.descendants(element, matrixConfig.selectors().row());
          return $_9kcxax102jcg89gnn.findIndex(allRows, inRow).bind(function (rowIndex) {
            var matrix = toMatrix(allRows, matrixConfig);
            return move(matrix, rowIndex, colIndex).map(function (next) {
              return next.cell();
            });
          });
        });
      });
    };
  };
  var moveLeft$2 = doMove$2($_aa4yv8109jcg89gpg.cycleLeft, $_aa4yv8109jcg89gpg.moveLeft);
  var moveRight$2 = doMove$2($_aa4yv8109jcg89gpg.cycleRight, $_aa4yv8109jcg89gpg.moveRight);
  var moveNorth$1 = doMove$2($_aa4yv8109jcg89gpg.cycleUp, $_aa4yv8109jcg89gpg.moveUp);
  var moveSouth$1 = doMove$2($_aa4yv8109jcg89gpg.cycleDown, $_aa4yv8109jcg89gpg.moveDown);
  var getRules$3 = $_9m9qz3wajcg89g5n.constant([
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.LEFT()), $_oi88x100jcg89gnh.west(moveLeft$2, moveRight$2)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.RIGHT()), $_oi88x100jcg89gnh.east(moveLeft$2, moveRight$2)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.UP()), $_oi88x100jcg89gnh.north(moveNorth$1)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.DOWN()), $_oi88x100jcg89gnh.south(moveSouth$1)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.SPACE().concat($_8mskkgzdjcg89gk3.ENTER())), execute$3)
  ]);
  var getEvents$3 = $_9m9qz3wajcg89g5n.constant({});
  var getApis$3 = $_9m9qz3wajcg89g5n.constant({});
  var MatrixType = $_1fxogyzejcg89gk8.typical(schema$4, $_960zyxxpjcg89gc9.init, getRules$3, getEvents$3, getApis$3, $_en0sddw9jcg89g5j.some(focusIn$2));

  var schema$5 = [
    $_76kfpx1jcg89g86.strict('selector'),
    $_76kfpx1jcg89g86.defaulted('execute', $_1izhvdzxjcg89gn0.defaultExecute),
    $_76kfpx1jcg89g86.defaulted('moveOnTab', false)
  ];
  var execute$4 = function (component, simulatedEvent, menuConfig) {
    return menuConfig.focusManager().get(component).bind(function (focused) {
      return menuConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$3 = function (component, menuConfig, simulatedEvent) {
    $_5rph7vzljcg89gl5.descendant(component.element(), menuConfig.selector()).each(function (first) {
      menuConfig.focusManager().set(component, first);
    });
  };
  var moveUp$1 = function (element, focused, info) {
    return $_8ox9sh107jcg89gow.horizontal(element, info.selector(), focused, -1);
  };
  var moveDown$1 = function (element, focused, info) {
    return $_8ox9sh107jcg89gow.horizontal(element, info.selector(), focused, +1);
  };
  var fireShiftTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_oi88x100jcg89gnh.move(moveUp$1)(component, simulatedEvent, menuConfig) : $_en0sddw9jcg89g5j.none();
  };
  var fireTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_oi88x100jcg89gnh.move(moveDown$1)(component, simulatedEvent, menuConfig) : $_en0sddw9jcg89g5j.none();
  };
  var getRules$4 = $_9m9qz3wajcg89g5n.constant([
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.UP()), $_oi88x100jcg89gnh.move(moveUp$1)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.DOWN()), $_oi88x100jcg89gnh.move(moveDown$1)),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
      $_12d4g3zojcg89gll.isShift,
      $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.TAB())
    ]), fireShiftTab),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
      $_12d4g3zojcg89gll.isNotShift,
      $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.TAB())
    ]), fireTab),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.ENTER()), execute$4),
    $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.SPACE()), execute$4)
  ]);
  var getEvents$4 = $_9m9qz3wajcg89g5n.constant({});
  var getApis$4 = $_9m9qz3wajcg89g5n.constant({});
  var MenuType = $_1fxogyzejcg89gk8.typical(schema$5, $_960zyxxpjcg89gc9.init, getRules$4, getEvents$4, getApis$4, $_en0sddw9jcg89g5j.some(focusIn$3));

  var schema$6 = [
    $_czln55ysjcg89ggs.onKeyboardHandler('onSpace'),
    $_czln55ysjcg89ggs.onKeyboardHandler('onEnter'),
    $_czln55ysjcg89ggs.onKeyboardHandler('onShiftEnter'),
    $_czln55ysjcg89ggs.onKeyboardHandler('onLeft'),
    $_czln55ysjcg89ggs.onKeyboardHandler('onRight'),
    $_czln55ysjcg89ggs.onKeyboardHandler('onTab'),
    $_czln55ysjcg89ggs.onKeyboardHandler('onShiftTab'),
    $_czln55ysjcg89ggs.onKeyboardHandler('onUp'),
    $_czln55ysjcg89ggs.onKeyboardHandler('onDown'),
    $_czln55ysjcg89ggs.onKeyboardHandler('onEscape'),
    $_76kfpx1jcg89g86.option('focusIn')
  ];
  var getRules$5 = function (component, simulatedEvent, executeInfo) {
    return [
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.SPACE()), executeInfo.onSpace()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
        $_12d4g3zojcg89gll.isNotShift,
        $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.ENTER())
      ]), executeInfo.onEnter()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
        $_12d4g3zojcg89gll.isShift,
        $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.ENTER())
      ]), executeInfo.onShiftEnter()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
        $_12d4g3zojcg89gll.isShift,
        $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.TAB())
      ]), executeInfo.onShiftTab()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.and([
        $_12d4g3zojcg89gll.isNotShift,
        $_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.TAB())
      ]), executeInfo.onTab()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.UP()), executeInfo.onUp()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.DOWN()), executeInfo.onDown()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.LEFT()), executeInfo.onLeft()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.RIGHT()), executeInfo.onRight()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.SPACE()), executeInfo.onSpace()),
      $_vjhg8znjcg89glh.rule($_12d4g3zojcg89gll.inSet($_8mskkgzdjcg89gk3.ESCAPE()), executeInfo.onEscape())
    ];
  };
  var focusIn$4 = function (component, executeInfo) {
    return executeInfo.focusIn().bind(function (f) {
      return f(component, executeInfo);
    });
  };
  var getEvents$5 = $_9m9qz3wajcg89g5n.constant({});
  var getApis$5 = $_9m9qz3wajcg89g5n.constant({});
  var SpecialType = $_1fxogyzejcg89gk8.typical(schema$6, $_960zyxxpjcg89gc9.init, getRules$5, getEvents$5, getApis$5, $_en0sddw9jcg89g5j.some(focusIn$4));

  var $_3k3zn0zajcg89gjf = {
    acyclic: AcyclicType.schema(),
    cyclic: CyclicType.schema(),
    flow: FlowType.schema(),
    flatgrid: FlatgridType.schema(),
    matrix: MatrixType.schema(),
    execution: ExecutionType.schema(),
    menu: MenuType.schema(),
    special: SpecialType.schema()
  };

  var Keying = $_eid12yw3jcg89g3y.createModes({
    branchKey: 'mode',
    branches: $_3k3zn0zajcg89gjf,
    name: 'keying',
    active: {
      events: function (keyingConfig, keyingState) {
        var handler = keyingConfig.handler();
        return handler.toEvents(keyingConfig, keyingState);
      }
    },
    apis: {
      focusIn: function (component) {
        component.getSystem().triggerFocus(component.element(), component.element());
      },
      setGridSize: function (component, keyConfig, keyState, numRows, numColumns) {
        if (!$_b52oxhx5jcg89g9l.hasKey(keyState, 'setGridSize')) {
          console.error('Layout does not support setGridSize');
        } else {
          keyState.setGridSize(numRows, numColumns);
        }
      }
    },
    state: $_5xngs4zzjcg89gnc
  });

  var field$1 = function (name, forbidden) {
    return $_76kfpx1jcg89g86.defaultedObjOf(name, {}, $_89wx8cw8jcg89g5d.map(forbidden, function (f) {
      return $_76kfpx1jcg89g86.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
    }).concat([$_76kfpx1jcg89g86.state('dump', $_9m9qz3wajcg89g5n.identity)]));
  };
  var get$5 = function (data) {
    return data.dump();
  };
  var $_dltg8y10cjcg89gq4 = {
    field: field$1,
    get: get$5
  };

  var unique = 0;
  var generate$1 = function (prefix) {
    var date = new Date();
    var time = date.getTime();
    var random = Math.floor(Math.random() * 1000000000);
    unique++;
    return prefix + '_' + random + unique + String(time);
  };
  var $_302rtc10fjcg89gqt = { generate: generate$1 };

  var premadeTag = $_302rtc10fjcg89gqt.generate('alloy-premade');
  var apiConfig = $_302rtc10fjcg89gqt.generate('api');
  var premade = function (comp) {
    return $_b52oxhx5jcg89g9l.wrap(premadeTag, comp);
  };
  var getPremade = function (spec) {
    return $_b52oxhx5jcg89g9l.readOptFrom(spec, premadeTag);
  };
  var makeApi = function (f) {
    return $_9maq7nxijcg89gbf.markAsSketchApi(function (component) {
      var args = Array.prototype.slice.call(arguments, 0);
      var spi = component.config(apiConfig);
      return f.apply(undefined, [spi].concat(args));
    }, f);
  };
  var $_73jsa510ejcg89gqn = {
    apiConfig: $_9m9qz3wajcg89g5n.constant(apiConfig),
    makeApi: makeApi,
    premade: premade,
    getPremade: getPremade
  };

  var adt$2 = $_6nnct0x3jcg89g8q.generate([
    { required: ['data'] },
    { external: ['data'] },
    { optional: ['data'] },
    { group: ['data'] }
  ]);
  var fFactory = $_76kfpx1jcg89g86.defaulted('factory', { sketch: $_9m9qz3wajcg89g5n.identity });
  var fSchema = $_76kfpx1jcg89g86.defaulted('schema', []);
  var fName = $_76kfpx1jcg89g86.strict('name');
  var fPname = $_76kfpx1jcg89g86.field('pname', 'pname', $_562y16x2jcg89g8j.defaultedThunk(function (typeSpec) {
    return '<alloy.' + $_302rtc10fjcg89gqt.generate(typeSpec.name) + '>';
  }), $_51tzzcxgjcg89gax.anyValue());
  var fDefaults = $_76kfpx1jcg89g86.defaulted('defaults', $_9m9qz3wajcg89g5n.constant({}));
  var fOverrides = $_76kfpx1jcg89g86.defaulted('overrides', $_9m9qz3wajcg89g5n.constant({}));
  var requiredSpec = $_51tzzcxgjcg89gax.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var externalSpec = $_51tzzcxgjcg89gax.objOf([
    fFactory,
    fSchema,
    fName,
    fDefaults,
    fOverrides
  ]);
  var optionalSpec = $_51tzzcxgjcg89gax.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var groupSpec = $_51tzzcxgjcg89gax.objOf([
    fFactory,
    fSchema,
    fName,
    $_76kfpx1jcg89g86.strict('unit'),
    fPname,
    fDefaults,
    fOverrides
  ]);
  var asNamedPart = function (part) {
    return part.fold($_en0sddw9jcg89g5j.some, $_en0sddw9jcg89g5j.none, $_en0sddw9jcg89g5j.some, $_en0sddw9jcg89g5j.some);
  };
  var name$1 = function (part) {
    var get = function (data) {
      return data.name();
    };
    return part.fold(get, get, get, get);
  };
  var asCommon = function (part) {
    return part.fold($_9m9qz3wajcg89g5n.identity, $_9m9qz3wajcg89g5n.identity, $_9m9qz3wajcg89g5n.identity, $_9m9qz3wajcg89g5n.identity);
  };
  var convert = function (adtConstructor, partSpec) {
    return function (spec) {
      var data = $_51tzzcxgjcg89gax.asStructOrDie('Converting part type', partSpec, spec);
      return adtConstructor(data);
    };
  };
  var $_7yfrc10jjcg89gro = {
    required: convert(adt$2.required, requiredSpec),
    external: convert(adt$2.external, externalSpec),
    optional: convert(adt$2.optional, optionalSpec),
    group: convert(adt$2.group, groupSpec),
    asNamedPart: asNamedPart,
    name: name$1,
    asCommon: asCommon,
    original: $_9m9qz3wajcg89g5n.constant('entirety')
  };

  var placeholder = 'placeholder';
  var adt$3 = $_6nnct0x3jcg89g8q.generate([
    {
      single: [
        'required',
        'valueThunk'
      ]
    },
    {
      multiple: [
        'required',
        'valueThunks'
      ]
    }
  ]);
  var isSubstitute = function (uiType) {
    return $_89wx8cw8jcg89g5d.contains([placeholder], uiType);
  };
  var subPlaceholder = function (owner, detail, compSpec, placeholders) {
    if (owner.exists(function (o) {
        return o !== compSpec.owner;
      }))
      return adt$3.single(true, $_9m9qz3wajcg89g5n.constant(compSpec));
    return $_b52oxhx5jcg89g9l.readOptFrom(placeholders, compSpec.name).fold(function () {
      throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + $_gbrpaqwzjcg89g7p.keys(placeholders) + ']\nNamespace: ' + owner.getOr('none') + '\nSpec: ' + $_3nrfsfxejcg89gat.stringify(compSpec, null, 2));
    }, function (newSpec) {
      return newSpec.replace();
    });
  };
  var scan = function (owner, detail, compSpec, placeholders) {
    if (compSpec.uiType === placeholder)
      return subPlaceholder(owner, detail, compSpec, placeholders);
    else
      return adt$3.single(false, $_9m9qz3wajcg89g5n.constant(compSpec));
  };
  var substitute = function (owner, detail, compSpec, placeholders) {
    var base = scan(owner, detail, compSpec, placeholders);
    return base.fold(function (req, valueThunk) {
      var value = valueThunk(detail, compSpec.config, compSpec.validated);
      var childSpecs = $_b52oxhx5jcg89g9l.readOptFrom(value, 'components').getOr([]);
      var substituted = $_89wx8cw8jcg89g5d.bind(childSpecs, function (c) {
        return substitute(owner, detail, c, placeholders);
      });
      return [$_5mo1ztwxjcg89g7j.deepMerge(value, { components: substituted })];
    }, function (req, valuesThunk) {
      var values = valuesThunk(detail, compSpec.config, compSpec.validated);
      return values;
    });
  };
  var substituteAll = function (owner, detail, components, placeholders) {
    return $_89wx8cw8jcg89g5d.bind(components, function (c) {
      return substitute(owner, detail, c, placeholders);
    });
  };
  var oneReplace = function (label, replacements) {
    var called = false;
    var used = function () {
      return called;
    };
    var replace = function () {
      if (called === true)
        throw new Error('Trying to use the same placeholder more than once: ' + label);
      called = true;
      return replacements;
    };
    var required = function () {
      return replacements.fold(function (req, _) {
        return req;
      }, function (req, _) {
        return req;
      });
    };
    return {
      name: $_9m9qz3wajcg89g5n.constant(label),
      required: required,
      used: used,
      replace: replace
    };
  };
  var substitutePlaces = function (owner, detail, components, placeholders) {
    var ps = $_gbrpaqwzjcg89g7p.map(placeholders, function (ph, name) {
      return oneReplace(name, ph);
    });
    var outcome = substituteAll(owner, detail, components, ps);
    $_gbrpaqwzjcg89g7p.each(ps, function (p) {
      if (p.used() === false && p.required()) {
        throw new Error('Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' + $_3nrfsfxejcg89gat.stringify(detail.components(), null, 2));
      }
    });
    return outcome;
  };
  var singleReplace = function (detail, p) {
    var replacement = p;
    return replacement.fold(function (req, valueThunk) {
      return [valueThunk(detail)];
    }, function (req, valuesThunk) {
      return valuesThunk(detail);
    });
  };
  var $_csbpfh10kjcg89gs0 = {
    single: adt$3.single,
    multiple: adt$3.multiple,
    isSubstitute: isSubstitute,
    placeholder: $_9m9qz3wajcg89g5n.constant(placeholder),
    substituteAll: substituteAll,
    substitutePlaces: substitutePlaces,
    singleReplace: singleReplace
  };

  var combine = function (detail, data, partSpec, partValidated) {
    var spec = partSpec;
    return $_5mo1ztwxjcg89g7j.deepMerge(data.defaults()(detail, partSpec, partValidated), partSpec, { uid: detail.partUids()[data.name()] }, data.overrides()(detail, partSpec, partValidated), { 'debug.sketcher': $_b52oxhx5jcg89g9l.wrap('part-' + data.name(), spec) });
  };
  var subs = function (owner, detail, parts) {
    var internals = {};
    var externals = {};
    $_89wx8cw8jcg89g5d.each(parts, function (part) {
      part.fold(function (data) {
        internals[data.pname()] = $_csbpfh10kjcg89gs0.single(true, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        var partSpec = detail.parts()[data.name()]();
        externals[data.name()] = $_9m9qz3wajcg89g5n.constant(combine(detail, data, partSpec[$_7yfrc10jjcg89gro.original()]()));
      }, function (data) {
        internals[data.pname()] = $_csbpfh10kjcg89gs0.single(false, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        internals[data.pname()] = $_csbpfh10kjcg89gs0.multiple(true, function (detail, _partSpec, _partValidated) {
          var units = detail[data.name()]();
          return $_89wx8cw8jcg89g5d.map(units, function (u) {
            return data.factory().sketch($_5mo1ztwxjcg89g7j.deepMerge(data.defaults()(detail, u), u, data.overrides()(detail, u)));
          });
        });
      });
    });
    return {
      internals: $_9m9qz3wajcg89g5n.constant(internals),
      externals: $_9m9qz3wajcg89g5n.constant(externals)
    };
  };
  var $_auqowe10ijcg89gri = { subs: subs };

  var generate$2 = function (owner, parts) {
    var r = {};
    $_89wx8cw8jcg89g5d.each(parts, function (part) {
      $_7yfrc10jjcg89gro.asNamedPart(part).each(function (np) {
        var g = doGenerateOne(owner, np.pname());
        r[np.name()] = function (config) {
          var validated = $_51tzzcxgjcg89gax.asRawOrDie('Part: ' + np.name() + ' in ' + owner, $_51tzzcxgjcg89gax.objOf(np.schema()), config);
          return $_5mo1ztwxjcg89g7j.deepMerge(g, {
            config: config,
            validated: validated
          });
        };
      });
    });
    return r;
  };
  var doGenerateOne = function (owner, pname) {
    return {
      uiType: $_csbpfh10kjcg89gs0.placeholder(),
      owner: owner,
      name: pname
    };
  };
  var generateOne = function (owner, pname, config) {
    return {
      uiType: $_csbpfh10kjcg89gs0.placeholder(),
      owner: owner,
      name: pname,
      config: config,
      validated: {}
    };
  };
  var schemas = function (parts) {
    return $_89wx8cw8jcg89g5d.bind(parts, function (part) {
      return part.fold($_en0sddw9jcg89g5j.none, $_en0sddw9jcg89g5j.some, $_en0sddw9jcg89g5j.none, $_en0sddw9jcg89g5j.none).map(function (data) {
        return $_76kfpx1jcg89g86.strictObjOf(data.name(), data.schema().concat([$_czln55ysjcg89ggs.snapshot($_7yfrc10jjcg89gro.original())]));
      }).toArray();
    });
  };
  var names = function (parts) {
    return $_89wx8cw8jcg89g5d.map(parts, $_7yfrc10jjcg89gro.name);
  };
  var substitutes = function (owner, detail, parts) {
    return $_auqowe10ijcg89gri.subs(owner, detail, parts);
  };
  var components = function (owner, detail, internals) {
    return $_csbpfh10kjcg89gs0.substitutePlaces($_en0sddw9jcg89g5j.some(owner), detail, detail.components(), internals);
  };
  var getPart = function (component, detail, partKey) {
    var uid = detail.partUids()[partKey];
    return component.getSystem().getByUid(uid).toOption();
  };
  var getPartOrDie = function (component, detail, partKey) {
    return getPart(component, detail, partKey).getOrDie('Could not find part: ' + partKey);
  };
  var getParts = function (component, detail, partKeys) {
    var r = {};
    var uids = detail.partUids();
    var system = component.getSystem();
    $_89wx8cw8jcg89g5d.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]);
    });
    return $_gbrpaqwzjcg89g7p.map(r, $_9m9qz3wajcg89g5n.constant);
  };
  var getAllParts = function (component, detail) {
    var system = component.getSystem();
    return $_gbrpaqwzjcg89g7p.map(detail.partUids(), function (pUid, k) {
      return $_9m9qz3wajcg89g5n.constant(system.getByUid(pUid));
    });
  };
  var getPartsOrDie = function (component, detail, partKeys) {
    var r = {};
    var uids = detail.partUids();
    var system = component.getSystem();
    $_89wx8cw8jcg89g5d.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]).getOrDie();
    });
    return $_gbrpaqwzjcg89g7p.map(r, $_9m9qz3wajcg89g5n.constant);
  };
  var defaultUids = function (baseUid, partTypes) {
    var partNames = names(partTypes);
    return $_b52oxhx5jcg89g9l.wrapAll($_89wx8cw8jcg89g5d.map(partNames, function (pn) {
      return {
        key: pn,
        value: baseUid + '-' + pn
      };
    }));
  };
  var defaultUidsSchema = function (partTypes) {
    return $_76kfpx1jcg89g86.field('partUids', 'partUids', $_562y16x2jcg89g8j.mergeWithThunk(function (spec) {
      return defaultUids(spec.uid, partTypes);
    }), $_51tzzcxgjcg89gax.anyValue());
  };
  var $_1ep1bp10hjcg89gr1 = {
    generate: generate$2,
    generateOne: generateOne,
    schemas: schemas,
    names: names,
    substitutes: substitutes,
    components: components,
    defaultUids: defaultUids,
    defaultUidsSchema: defaultUidsSchema,
    getAllParts: getAllParts,
    getPart: getPart,
    getPartOrDie: getPartOrDie,
    getParts: getParts,
    getPartsOrDie: getPartsOrDie
  };

  var prefix$2 = 'alloy-id-';
  var idAttr$1 = 'data-alloy-id';
  var $_5sz1no10mjcg89gsu = {
    prefix: $_9m9qz3wajcg89g5n.constant(prefix$2),
    idAttr: $_9m9qz3wajcg89g5n.constant(idAttr$1)
  };

  var prefix$1 = $_5sz1no10mjcg89gsu.prefix();
  var idAttr = $_5sz1no10mjcg89gsu.idAttr();
  var write = function (label, elem) {
    var id = $_302rtc10fjcg89gqt.generate(prefix$1 + label);
    $_69krbwxvjcg89gck.set(elem, idAttr, id);
    return id;
  };
  var writeOnly = function (elem, uid) {
    $_69krbwxvjcg89gck.set(elem, idAttr, uid);
  };
  var read$2 = function (elem) {
    var id = $_xqscexwjcg89gct.isElement(elem) ? $_69krbwxvjcg89gck.get(elem, idAttr) : null;
    return $_en0sddw9jcg89g5j.from(id);
  };
  var find$3 = function (container, id) {
    return $_5rph7vzljcg89gl5.descendant(container, id);
  };
  var generate$3 = function (prefix) {
    return $_302rtc10fjcg89gqt.generate(prefix);
  };
  var revoke = function (elem) {
    $_69krbwxvjcg89gck.remove(elem, idAttr);
  };
  var $_fxeraw10ljcg89gsg = {
    revoke: revoke,
    write: write,
    writeOnly: writeOnly,
    read: read$2,
    find: find$3,
    generate: generate$3,
    attribute: $_9m9qz3wajcg89g5n.constant(idAttr)
  };

  var getPartsSchema = function (partNames, _optPartNames, _owner) {
    var owner = _owner !== undefined ? _owner : 'Unknown owner';
    var fallbackThunk = function () {
      return [$_czln55ysjcg89ggs.output('partUids', {})];
    };
    var optPartNames = _optPartNames !== undefined ? _optPartNames : fallbackThunk();
    if (partNames.length === 0 && optPartNames.length === 0)
      return fallbackThunk();
    var partsSchema = $_76kfpx1jcg89g86.strictObjOf('parts', $_89wx8cw8jcg89g5d.flatten([
      $_89wx8cw8jcg89g5d.map(partNames, $_76kfpx1jcg89g86.strict),
      $_89wx8cw8jcg89g5d.map(optPartNames, function (optPart) {
        return $_76kfpx1jcg89g86.defaulted(optPart, $_csbpfh10kjcg89gs0.single(false, function () {
          throw new Error('The optional part: ' + optPart + ' was not specified in the config, but it was used in components');
        }));
      })
    ]));
    var partUidsSchema = $_76kfpx1jcg89g86.state('partUids', function (spec) {
      if (!$_b52oxhx5jcg89g9l.hasKey(spec, 'parts')) {
        throw new Error('Part uid definition for owner: ' + owner + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' + $_3nrfsfxejcg89gat.stringify(spec, null, 2));
      }
      var uids = $_gbrpaqwzjcg89g7p.map(spec.parts, function (v, k) {
        return $_b52oxhx5jcg89g9l.readOptFrom(v, 'uid').getOrThunk(function () {
          return spec.uid + '-' + k;
        });
      });
      return uids;
    });
    return [
      partsSchema,
      partUidsSchema
    ];
  };
  var base$1 = function (label, partSchemas, partUidsSchemas, spec) {
    var ps = partSchemas.length > 0 ? [$_76kfpx1jcg89g86.strictObjOf('parts', partSchemas)] : [];
    return ps.concat([
      $_76kfpx1jcg89g86.strict('uid'),
      $_76kfpx1jcg89g86.defaulted('dom', {}),
      $_76kfpx1jcg89g86.defaulted('components', []),
      $_czln55ysjcg89ggs.snapshot('originalSpec'),
      $_76kfpx1jcg89g86.defaulted('debug.sketcher', {})
    ]).concat(partUidsSchemas);
  };
  var asRawOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, spec, partUidsSchemas);
    return $_51tzzcxgjcg89gax.asRawOrDie(label + ' [SpecSchema]', $_51tzzcxgjcg89gax.objOfOnly(baseS.concat(schema)), spec);
  };
  var asStructOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, partUidsSchemas, spec);
    return $_51tzzcxgjcg89gax.asStructOrDie(label + ' [SpecSchema]', $_51tzzcxgjcg89gax.objOfOnly(baseS.concat(schema)), spec);
  };
  var extend = function (builder, original, nu) {
    var newSpec = $_5mo1ztwxjcg89g7j.deepMerge(original, nu);
    return builder(newSpec);
  };
  var addBehaviours = function (original, behaviours) {
    return $_5mo1ztwxjcg89g7j.deepMerge(original, behaviours);
  };
  var $_fxyj2910njcg89gsw = {
    asRawOrDie: asRawOrDie$1,
    asStructOrDie: asStructOrDie$1,
    addBehaviours: addBehaviours,
    getPartsSchema: getPartsSchema,
    extend: extend
  };

  var single$1 = function (owner, schema, factory, spec) {
    var specWithUid = supplyUid(spec);
    var detail = $_fxyj2910njcg89gsw.asStructOrDie(owner, schema, specWithUid, [], []);
    return $_5mo1ztwxjcg89g7j.deepMerge(factory(detail, specWithUid), { 'debug.sketcher': $_b52oxhx5jcg89g9l.wrap(owner, spec) });
  };
  var composite$1 = function (owner, schema, partTypes, factory, spec) {
    var specWithUid = supplyUid(spec);
    var partSchemas = $_1ep1bp10hjcg89gr1.schemas(partTypes);
    var partUidsSchema = $_1ep1bp10hjcg89gr1.defaultUidsSchema(partTypes);
    var detail = $_fxyj2910njcg89gsw.asStructOrDie(owner, schema, specWithUid, partSchemas, [partUidsSchema]);
    var subs = $_1ep1bp10hjcg89gr1.substitutes(owner, detail, partTypes);
    var components = $_1ep1bp10hjcg89gr1.components(owner, detail, subs.internals());
    return $_5mo1ztwxjcg89g7j.deepMerge(factory(detail, components, specWithUid, subs.externals()), { 'debug.sketcher': $_b52oxhx5jcg89g9l.wrap(owner, spec) });
  };
  var supplyUid = function (spec) {
    return $_5mo1ztwxjcg89g7j.deepMerge({ uid: $_fxeraw10ljcg89gsg.generate('uid') }, spec);
  };
  var $_8k7tpq10gjcg89gqv = {
    supplyUid: supplyUid,
    single: single$1,
    composite: composite$1
  };

  var singleSchema = $_51tzzcxgjcg89gax.objOfOnly([
    $_76kfpx1jcg89g86.strict('name'),
    $_76kfpx1jcg89g86.strict('factory'),
    $_76kfpx1jcg89g86.strict('configFields'),
    $_76kfpx1jcg89g86.defaulted('apis', {}),
    $_76kfpx1jcg89g86.defaulted('extraApis', {})
  ]);
  var compositeSchema = $_51tzzcxgjcg89gax.objOfOnly([
    $_76kfpx1jcg89g86.strict('name'),
    $_76kfpx1jcg89g86.strict('factory'),
    $_76kfpx1jcg89g86.strict('configFields'),
    $_76kfpx1jcg89g86.strict('partFields'),
    $_76kfpx1jcg89g86.defaulted('apis', {}),
    $_76kfpx1jcg89g86.defaulted('extraApis', {})
  ]);
  var single = function (rawConfig) {
    var config = $_51tzzcxgjcg89gax.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);
    var sketch = function (spec) {
      return $_8k7tpq10gjcg89gqv.single(config.name, config.configFields, config.factory, spec);
    };
    var apis = $_gbrpaqwzjcg89g7p.map(config.apis, $_73jsa510ejcg89gqn.makeApi);
    var extraApis = $_gbrpaqwzjcg89g7p.map(config.extraApis, function (f, k) {
      return $_9maq7nxijcg89gbf.markAsExtraApi(f, k);
    });
    return $_5mo1ztwxjcg89g7j.deepMerge({
      name: $_9m9qz3wajcg89g5n.constant(config.name),
      partFields: $_9m9qz3wajcg89g5n.constant([]),
      configFields: $_9m9qz3wajcg89g5n.constant(config.configFields),
      sketch: sketch
    }, apis, extraApis);
  };
  var composite = function (rawConfig) {
    var config = $_51tzzcxgjcg89gax.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);
    var sketch = function (spec) {
      return $_8k7tpq10gjcg89gqv.composite(config.name, config.configFields, config.partFields, config.factory, spec);
    };
    var parts = $_1ep1bp10hjcg89gr1.generate(config.name, config.partFields);
    var apis = $_gbrpaqwzjcg89g7p.map(config.apis, $_73jsa510ejcg89gqn.makeApi);
    var extraApis = $_gbrpaqwzjcg89g7p.map(config.extraApis, function (f, k) {
      return $_9maq7nxijcg89gbf.markAsExtraApi(f, k);
    });
    return $_5mo1ztwxjcg89g7j.deepMerge({
      name: $_9m9qz3wajcg89g5n.constant(config.name),
      partFields: $_9m9qz3wajcg89g5n.constant(config.partFields),
      configFields: $_9m9qz3wajcg89g5n.constant(config.configFields),
      sketch: sketch,
      parts: $_9m9qz3wajcg89g5n.constant(parts)
    }, apis, extraApis);
  };
  var $_168cxl10djcg89gq9 = {
    single: single,
    composite: composite
  };

  var events$4 = function (optAction) {
    var executeHandler = function (action) {
      return $_1hggxlw5jcg89g4s.run($_f1ifvdwvjcg89g7a.execute(), function (component, simulatedEvent) {
        action(component);
        simulatedEvent.stop();
      });
    };
    var onClick = function (component, simulatedEvent) {
      simulatedEvent.stop();
      $_fpm2ctwujcg89g73.emitExecute(component);
    };
    var onMousedown = function (component, simulatedEvent) {
      simulatedEvent.cut();
    };
    var pointerEvents = $_aoftmbwfjcg89g5y.detect().deviceType.isTouch() ? [$_1hggxlw5jcg89g4s.run($_f1ifvdwvjcg89g7a.tap(), onClick)] : [
      $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.click(), onClick),
      $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.mousedown(), onMousedown)
    ];
    return $_1hggxlw5jcg89g4s.derive($_89wx8cw8jcg89g5d.flatten([
      optAction.map(executeHandler).toArray(),
      pointerEvents
    ]));
  };
  var $_dqk0in10ojcg89gt6 = { events: events$4 };

  var factory = function (detail, spec) {
    var events = $_dqk0in10ojcg89gt6.events(detail.action());
    var optType = $_b52oxhx5jcg89g9l.readOptFrom(detail.dom(), 'attributes').bind($_b52oxhx5jcg89g9l.readOpt('type'));
    var optTag = $_b52oxhx5jcg89g9l.readOptFrom(detail.dom(), 'tag');
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: detail.components(),
      events: events,
      behaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive([
        Focusing.config({}),
        Keying.config({
          mode: 'execution',
          useSpace: true,
          useEnter: true
        })
      ]), $_dltg8y10cjcg89gq4.get(detail.buttonBehaviours())),
      domModification: {
        attributes: $_5mo1ztwxjcg89g7j.deepMerge(optType.fold(function () {
          return optTag.is('button') ? { type: 'button' } : {};
        }, function (t) {
          return {};
        }), { role: detail.role().getOr('button') })
      },
      eventOrder: detail.eventOrder()
    };
  };
  var Button = $_168cxl10djcg89gq9.single({
    name: 'Button',
    factory: factory,
    configFields: [
      $_76kfpx1jcg89g86.defaulted('uid', undefined),
      $_76kfpx1jcg89g86.strict('dom'),
      $_76kfpx1jcg89g86.defaulted('components', []),
      $_dltg8y10cjcg89gq4.field('buttonBehaviours', [
        Focusing,
        Keying
      ]),
      $_76kfpx1jcg89g86.option('action'),
      $_76kfpx1jcg89g86.option('role'),
      $_76kfpx1jcg89g86.defaulted('eventOrder', {})
    ]
  });

  var getAttrs = function (elem) {
    var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [];
    return $_89wx8cw8jcg89g5d.foldl(attributes, function (b, attr) {
      if (attr.name === 'class')
        return b;
      else
        return $_5mo1ztwxjcg89g7j.deepMerge(b, $_b52oxhx5jcg89g9l.wrap(attr.name, attr.value));
    }, {});
  };
  var getClasses = function (elem) {
    return Array.prototype.slice.call(elem.dom().classList, 0);
  };
  var fromHtml$2 = function (html) {
    var elem = $_a3ihziwsjcg89g6w.fromHtml(html);
    var children = $_3ndsgfy2jcg89gdr.children(elem);
    var attrs = getAttrs(elem);
    var classes = getClasses(elem);
    var contents = children.length === 0 ? {} : { innerHtml: $_6dv6zryajcg89gew.get(elem) };
    return $_5mo1ztwxjcg89g7j.deepMerge({
      tag: $_xqscexwjcg89gct.name(elem),
      classes: classes,
      attributes: attrs
    }, contents);
  };
  var sketch = function (sketcher, html, config) {
    return sketcher.sketch($_5mo1ztwxjcg89g7j.deepMerge({ dom: fromHtml$2(html) }, config));
  };
  var $_gd5ocp10qjcg89gti = {
    fromHtml: fromHtml$2,
    sketch: sketch
  };

  var dom$1 = function (rawHtml) {
    var html = $_g4nyklwojcg89g6p.supplant(rawHtml, { prefix: $_452cgoz0jcg89gid.prefix() });
    return $_gd5ocp10qjcg89gti.fromHtml(html);
  };
  var spec = function (rawHtml) {
    var sDom = dom$1(rawHtml);
    return { dom: sDom };
  };
  var $_7103f610pjcg89gtd = {
    dom: dom$1,
    spec: spec
  };

  var forToolbarCommand = function (editor, command) {
    return forToolbar(command, function () {
      editor.execCommand(command);
    }, {});
  };
  var getToggleBehaviours = function (command) {
    return $_eid12yw3jcg89g3y.derive([
      Toggling.config({
        toggleClass: $_452cgoz0jcg89gid.resolve('toolbar-button-selected'),
        toggleOnExecute: false,
        aria: { mode: 'pressed' }
      }),
      $_8qmhfpyzjcg89gi8.format(command, function (button, status) {
        var toggle = status ? Toggling.on : Toggling.off;
        toggle(button);
      })
    ]);
  };
  var forToolbarStateCommand = function (editor, command) {
    var extraBehaviours = getToggleBehaviours(command);
    return forToolbar(command, function () {
      editor.execCommand(command);
    }, extraBehaviours);
  };
  var forToolbarStateAction = function (editor, clazz, command, action) {
    var extraBehaviours = getToggleBehaviours(command);
    return forToolbar(clazz, action, extraBehaviours);
  };
  var forToolbar = function (clazz, action, extraBehaviours) {
    return Button.sketch({
      dom: $_7103f610pjcg89gtd.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
      action: action,
      buttonBehaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive([Unselecting.config({})]), extraBehaviours)
    });
  };
  var $_5sd8nuz1jcg89gih = {
    forToolbar: forToolbar,
    forToolbarCommand: forToolbarCommand,
    forToolbarStateAction: forToolbarStateAction,
    forToolbarStateCommand: forToolbarStateCommand
  };

  var reduceBy = function (value, min, max, step) {
    if (value < min)
      return value;
    else if (value > max)
      return max;
    else if (value === min)
      return min - 1;
    else
      return Math.max(min, value - step);
  };
  var increaseBy = function (value, min, max, step) {
    if (value > max)
      return value;
    else if (value < min)
      return min;
    else if (value === max)
      return max + 1;
    else
      return Math.min(max, value + step);
  };
  var capValue = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };
  var snapValueOfX = function (bounds, value, min, max, step, snapStart) {
    return snapStart.fold(function () {
      var initValue = value - min;
      var extraValue = Math.round(initValue / step) * step;
      return capValue(min + extraValue, min - 1, max + 1);
    }, function (start) {
      var remainder = (value - start) % step;
      var adjustment = Math.round(remainder / step);
      var rawSteps = Math.floor((value - start) / step);
      var maxSteps = Math.floor((max - start) / step);
      var numSteps = Math.min(maxSteps, rawSteps + adjustment);
      var r = start + numSteps * step;
      return Math.max(start, r);
    });
  };
  var findValueOfX = function (bounds, min, max, xValue, step, snapToGrid, snapStart) {
    var range = max - min;
    if (xValue < bounds.left)
      return min - 1;
    else if (xValue > bounds.right)
      return max + 1;
    else {
      var xOffset = Math.min(bounds.right, Math.max(xValue, bounds.left)) - bounds.left;
      var newValue = capValue(xOffset / bounds.width * range + min, min - 1, max + 1);
      var roundedValue = Math.round(newValue);
      return snapToGrid && newValue >= min && newValue <= max ? snapValueOfX(bounds, newValue, min, max, step, snapStart) : roundedValue;
    }
  };
  var $_dqruh510vjcg89gus = {
    reduceBy: reduceBy,
    increaseBy: increaseBy,
    findValueOfX: findValueOfX
  };

  var changeEvent = 'slider.change.value';
  var isTouch$1 = $_aoftmbwfjcg89g5y.detect().deviceType.isTouch();
  var getEventSource = function (simulatedEvent) {
    var evt = simulatedEvent.event().raw();
    if (isTouch$1 && evt.touches !== undefined && evt.touches.length === 1)
      return $_en0sddw9jcg89g5j.some(evt.touches[0]);
    else if (isTouch$1 && evt.touches !== undefined)
      return $_en0sddw9jcg89g5j.none();
    else if (!isTouch$1 && evt.clientX !== undefined)
      return $_en0sddw9jcg89g5j.some(evt);
    else
      return $_en0sddw9jcg89g5j.none();
  };
  var getEventX = function (simulatedEvent) {
    var spot = getEventSource(simulatedEvent);
    return spot.map(function (s) {
      return s.clientX;
    });
  };
  var fireChange = function (component, value) {
    $_fpm2ctwujcg89g73.emitWith(component, changeEvent, { value: value });
  };
  var moveRightFromLedge = function (ledge, detail) {
    fireChange(ledge, detail.min());
  };
  var moveLeftFromRedge = function (redge, detail) {
    fireChange(redge, detail.max());
  };
  var setToRedge = function (redge, detail) {
    fireChange(redge, detail.max() + 1);
  };
  var setToLedge = function (ledge, detail) {
    fireChange(ledge, detail.min() - 1);
  };
  var setToX = function (spectrum, spectrumBounds, detail, xValue) {
    var value = $_dqruh510vjcg89gus.findValueOfX(spectrumBounds, detail.min(), detail.max(), xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart());
    fireChange(spectrum, value);
  };
  var setXFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
    return getEventX(simulatedEvent).map(function (xValue) {
      setToX(spectrum, spectrumBounds, detail, xValue);
      return xValue;
    });
  };
  var moveLeft$4 = function (spectrum, detail) {
    var newValue = $_dqruh510vjcg89gus.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var moveRight$4 = function (spectrum, detail) {
    var newValue = $_dqruh510vjcg89gus.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var $_1o5qt610ujcg89guj = {
    setXFromEvent: setXFromEvent,
    setToLedge: setToLedge,
    setToRedge: setToRedge,
    moveLeftFromRedge: moveLeftFromRedge,
    moveRightFromLedge: moveRightFromLedge,
    moveLeft: moveLeft$4,
    moveRight: moveRight$4,
    changeEvent: $_9m9qz3wajcg89g5n.constant(changeEvent)
  };

  var platform = $_aoftmbwfjcg89g5y.detect();
  var isTouch = platform.deviceType.isTouch();
  var edgePart = function (name, action) {
    return $_7yfrc10jjcg89gro.optional({
      name: '' + name + '-edge',
      overrides: function (detail) {
        var touchEvents = $_1hggxlw5jcg89g4s.derive([$_1hggxlw5jcg89g4s.runActionExtra($_3338ovwwjcg89g7g.touchstart(), action, [detail])]);
        var mouseEvents = $_1hggxlw5jcg89g4s.derive([
          $_1hggxlw5jcg89g4s.runActionExtra($_3338ovwwjcg89g7g.mousedown(), action, [detail]),
          $_1hggxlw5jcg89g4s.runActionExtra($_3338ovwwjcg89g7g.mousemove(), function (l, det) {
            if (det.mouseIsDown().get())
              action(l, det);
          }, [detail])
        ]);
        return { events: isTouch ? touchEvents : mouseEvents };
      }
    });
  };
  var ledgePart = edgePart('left', $_1o5qt610ujcg89guj.setToLedge);
  var redgePart = edgePart('right', $_1o5qt610ujcg89guj.setToRedge);
  var thumbPart = $_7yfrc10jjcg89gro.required({
    name: 'thumb',
    defaults: $_9m9qz3wajcg89g5n.constant({ dom: { styles: { position: 'absolute' } } }),
    overrides: function (detail) {
      return {
        events: $_1hggxlw5jcg89g4s.derive([
          $_1hggxlw5jcg89g4s.redirectToPart($_3338ovwwjcg89g7g.touchstart(), detail, 'spectrum'),
          $_1hggxlw5jcg89g4s.redirectToPart($_3338ovwwjcg89g7g.touchmove(), detail, 'spectrum'),
          $_1hggxlw5jcg89g4s.redirectToPart($_3338ovwwjcg89g7g.touchend(), detail, 'spectrum')
        ])
      };
    }
  });
  var spectrumPart = $_7yfrc10jjcg89gro.required({
    schema: [$_76kfpx1jcg89g86.state('mouseIsDown', function () {
        return Cell(false);
      })],
    name: 'spectrum',
    overrides: function (detail) {
      var moveToX = function (spectrum, simulatedEvent) {
        var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
        $_1o5qt610ujcg89guj.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
      };
      var touchEvents = $_1hggxlw5jcg89g4s.derive([
        $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.touchstart(), moveToX),
        $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.touchmove(), moveToX)
      ]);
      var mouseEvents = $_1hggxlw5jcg89g4s.derive([
        $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.mousedown(), moveToX),
        $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.mousemove(), function (spectrum, se) {
          if (detail.mouseIsDown().get())
            moveToX(spectrum, se);
        })
      ]);
      return {
        behaviours: $_eid12yw3jcg89g3y.derive(isTouch ? [] : [
          Keying.config({
            mode: 'special',
            onLeft: function (spectrum) {
              $_1o5qt610ujcg89guj.moveLeft(spectrum, detail);
              return $_en0sddw9jcg89g5j.some(true);
            },
            onRight: function (spectrum) {
              $_1o5qt610ujcg89guj.moveRight(spectrum, detail);
              return $_en0sddw9jcg89g5j.some(true);
            }
          }),
          Focusing.config({})
        ]),
        events: isTouch ? touchEvents : mouseEvents
      };
    }
  });
  var SliderParts = [
    ledgePart,
    redgePart,
    thumbPart,
    spectrumPart
  ];

  var onLoad$1 = function (component, repConfig, repState) {
    repConfig.store().manager().onLoad(component, repConfig, repState);
  };
  var onUnload = function (component, repConfig, repState) {
    repConfig.store().manager().onUnload(component, repConfig, repState);
  };
  var setValue = function (component, repConfig, repState, data) {
    repConfig.store().manager().setValue(component, repConfig, repState, data);
  };
  var getValue = function (component, repConfig, repState) {
    return repConfig.store().manager().getValue(component, repConfig, repState);
  };
  var $_2u6up810zjcg89gv9 = {
    onLoad: onLoad$1,
    onUnload: onUnload,
    setValue: setValue,
    getValue: getValue
  };

  var events$5 = function (repConfig, repState) {
    var es = repConfig.resetOnDom() ? [
      $_1hggxlw5jcg89g4s.runOnAttached(function (comp, se) {
        $_2u6up810zjcg89gv9.onLoad(comp, repConfig, repState);
      }),
      $_1hggxlw5jcg89g4s.runOnDetached(function (comp, se) {
        $_2u6up810zjcg89gv9.onUnload(comp, repConfig, repState);
      })
    ] : [$_42if07w4jcg89g47.loadEvent(repConfig, repState, $_2u6up810zjcg89gv9.onLoad)];
    return $_1hggxlw5jcg89g4s.derive(es);
  };
  var $_dfkku310yjcg89gv8 = { events: events$5 };

  var memory = function () {
    var data = Cell(null);
    var readState = function () {
      return {
        mode: 'memory',
        value: data.get()
      };
    };
    var isNotSet = function () {
      return data.get() === null;
    };
    var clear = function () {
      data.set(null);
    };
    return BehaviourState({
      set: data.set,
      get: data.get,
      isNotSet: isNotSet,
      clear: clear,
      readState: readState
    });
  };
  var manual = function () {
    var readState = function () {
    };
    return BehaviourState({ readState: readState });
  };
  var dataset = function () {
    var data = Cell({});
    var readState = function () {
      return {
        mode: 'dataset',
        dataset: data.get()
      };
    };
    return BehaviourState({
      readState: readState,
      set: data.set,
      get: data.get
    });
  };
  var init$2 = function (spec) {
    return spec.store().manager().state(spec);
  };
  var $_5uj57b112jcg89gvh = {
    memory: memory,
    dataset: dataset,
    manual: manual,
    init: init$2
  };

  var setValue$1 = function (component, repConfig, repState, data) {
    var dataKey = repConfig.store().getDataKey();
    repState.set({});
    repConfig.store().setData()(component, data);
    repConfig.onSetValue()(component, data);
  };
  var getValue$1 = function (component, repConfig, repState) {
    var key = repConfig.store().getDataKey()(component);
    var dataset = repState.get();
    return $_b52oxhx5jcg89g9l.readOptFrom(dataset, key).fold(function () {
      return repConfig.store().getFallbackEntry()(key);
    }, function (data) {
      return data;
    });
  };
  var onLoad$2 = function (component, repConfig, repState) {
    repConfig.store().initialValue().each(function (data) {
      setValue$1(component, repConfig, repState, data);
    });
  };
  var onUnload$1 = function (component, repConfig, repState) {
    repState.set({});
  };
  var DatasetStore = [
    $_76kfpx1jcg89g86.option('initialValue'),
    $_76kfpx1jcg89g86.strict('getFallbackEntry'),
    $_76kfpx1jcg89g86.strict('getDataKey'),
    $_76kfpx1jcg89g86.strict('setData'),
    $_czln55ysjcg89ggs.output('manager', {
      setValue: setValue$1,
      getValue: getValue$1,
      onLoad: onLoad$2,
      onUnload: onUnload$1,
      state: $_5uj57b112jcg89gvh.dataset
    })
  ];

  var getValue$2 = function (component, repConfig, repState) {
    return repConfig.store().getValue()(component);
  };
  var setValue$2 = function (component, repConfig, repState, data) {
    repConfig.store().setValue()(component, data);
    repConfig.onSetValue()(component, data);
  };
  var onLoad$3 = function (component, repConfig, repState) {
    repConfig.store().initialValue().each(function (data) {
      repConfig.store().setValue()(component, data);
    });
  };
  var ManualStore = [
    $_76kfpx1jcg89g86.strict('getValue'),
    $_76kfpx1jcg89g86.defaulted('setValue', $_9m9qz3wajcg89g5n.noop),
    $_76kfpx1jcg89g86.option('initialValue'),
    $_czln55ysjcg89ggs.output('manager', {
      setValue: setValue$2,
      getValue: getValue$2,
      onLoad: onLoad$3,
      onUnload: $_9m9qz3wajcg89g5n.noop,
      state: $_960zyxxpjcg89gc9.init
    })
  ];

  var setValue$3 = function (component, repConfig, repState, data) {
    repState.set(data);
    repConfig.onSetValue()(component, data);
  };
  var getValue$3 = function (component, repConfig, repState) {
    return repState.get();
  };
  var onLoad$4 = function (component, repConfig, repState) {
    repConfig.store().initialValue().each(function (initVal) {
      if (repState.isNotSet())
        repState.set(initVal);
    });
  };
  var onUnload$2 = function (component, repConfig, repState) {
    repState.clear();
  };
  var MemoryStore = [
    $_76kfpx1jcg89g86.option('initialValue'),
    $_czln55ysjcg89ggs.output('manager', {
      setValue: setValue$3,
      getValue: getValue$3,
      onLoad: onLoad$4,
      onUnload: onUnload$2,
      state: $_5uj57b112jcg89gvh.memory
    })
  ];

  var RepresentSchema = [
    $_76kfpx1jcg89g86.defaultedOf('store', { mode: 'memory' }, $_51tzzcxgjcg89gax.choose('mode', {
      memory: MemoryStore,
      manual: ManualStore,
      dataset: DatasetStore
    })),
    $_czln55ysjcg89ggs.onHandler('onSetValue'),
    $_76kfpx1jcg89g86.defaulted('resetOnDom', false)
  ];

  var me = $_eid12yw3jcg89g3y.create({
    fields: RepresentSchema,
    name: 'representing',
    active: $_dfkku310yjcg89gv8,
    apis: $_2u6up810zjcg89gv9,
    extra: {
      setValueFrom: function (component, source) {
        var value = me.getValue(source);
        me.setValue(component, value);
      }
    },
    state: $_5uj57b112jcg89gvh
  });

  var isTouch$2 = $_aoftmbwfjcg89g5y.detect().deviceType.isTouch();
  var SliderSchema = [
    $_76kfpx1jcg89g86.strict('min'),
    $_76kfpx1jcg89g86.strict('max'),
    $_76kfpx1jcg89g86.defaulted('stepSize', 1),
    $_76kfpx1jcg89g86.defaulted('onChange', $_9m9qz3wajcg89g5n.noop),
    $_76kfpx1jcg89g86.defaulted('onInit', $_9m9qz3wajcg89g5n.noop),
    $_76kfpx1jcg89g86.defaulted('onDragStart', $_9m9qz3wajcg89g5n.noop),
    $_76kfpx1jcg89g86.defaulted('onDragEnd', $_9m9qz3wajcg89g5n.noop),
    $_76kfpx1jcg89g86.defaulted('snapToGrid', false),
    $_76kfpx1jcg89g86.option('snapStart'),
    $_76kfpx1jcg89g86.strict('getInitialValue'),
    $_dltg8y10cjcg89gq4.field('sliderBehaviours', [
      Keying,
      me
    ]),
    $_76kfpx1jcg89g86.state('value', function (spec) {
      return Cell(spec.min);
    })
  ].concat(!isTouch$2 ? [$_76kfpx1jcg89g86.state('mouseIsDown', function () {
      return Cell(false);
    })] : []);

  var api$1 = Dimension('width', function (element) {
    return element.dom().offsetWidth;
  });
  var set$4 = function (element, h) {
    api$1.set(element, h);
  };
  var get$6 = function (element) {
    return api$1.get(element);
  };
  var getOuter$2 = function (element) {
    return api$1.getOuter(element);
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
    var absMax = api$1.max(element, value, inclusions);
    $_17fn7izrjcg89glz.set(element, 'max-width', absMax + 'px');
  };
  var $_bikzj9116jcg89gw3 = {
    set: set$4,
    get: get$6,
    getOuter: getOuter$2,
    setMax: setMax$1
  };

  var isTouch$3 = $_aoftmbwfjcg89g5y.detect().deviceType.isTouch();
  var sketch$2 = function (detail, components, spec, externals) {
    var range = detail.max() - detail.min();
    var getXCentre = function (component) {
      var rect = component.element().dom().getBoundingClientRect();
      return (rect.left + rect.right) / 2;
    };
    var getThumb = function (component) {
      return $_1ep1bp10hjcg89gr1.getPartOrDie(component, detail, 'thumb');
    };
    var getXOffset = function (slider, spectrumBounds, detail) {
      var v = detail.value().get();
      if (v < detail.min()) {
        return $_1ep1bp10hjcg89gr1.getPart(slider, detail, 'left-edge').fold(function () {
          return 0;
        }, function (ledge) {
          return getXCentre(ledge) - spectrumBounds.left;
        });
      } else if (v > detail.max()) {
        return $_1ep1bp10hjcg89gr1.getPart(slider, detail, 'right-edge').fold(function () {
          return spectrumBounds.width;
        }, function (redge) {
          return getXCentre(redge) - spectrumBounds.left;
        });
      } else {
        return (detail.value().get() - detail.min()) / range * spectrumBounds.width;
      }
    };
    var getXPos = function (slider) {
      var spectrum = $_1ep1bp10hjcg89gr1.getPartOrDie(slider, detail, 'spectrum');
      var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      var sliderBounds = slider.element().dom().getBoundingClientRect();
      var xOffset = getXOffset(slider, spectrumBounds, detail);
      return spectrumBounds.left - sliderBounds.left + xOffset;
    };
    var refresh = function (component) {
      var pos = getXPos(component);
      var thumb = getThumb(component);
      var thumbRadius = $_bikzj9116jcg89gw3.get(thumb.element()) / 2;
      $_17fn7izrjcg89glz.set(thumb.element(), 'left', pos - thumbRadius + 'px');
    };
    var changeValue = function (component, newValue) {
      var oldValue = detail.value().get();
      var thumb = getThumb(component);
      if (oldValue !== newValue || $_17fn7izrjcg89glz.getRaw(thumb.element(), 'left').isNone()) {
        detail.value().set(newValue);
        refresh(component);
        detail.onChange()(component, thumb, newValue);
        return $_en0sddw9jcg89g5j.some(true);
      } else {
        return $_en0sddw9jcg89g5j.none();
      }
    };
    var resetToMin = function (slider) {
      changeValue(slider, detail.min());
    };
    var resetToMax = function (slider) {
      changeValue(slider, detail.max());
    };
    var uiEventsArr = isTouch$3 ? [
      $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.touchstart(), function (slider, simulatedEvent) {
        detail.onDragStart()(slider, getThumb(slider));
      }),
      $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.touchend(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
      })
    ] : [
      $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.mousedown(), function (slider, simulatedEvent) {
        simulatedEvent.stop();
        detail.onDragStart()(slider, getThumb(slider));
        detail.mouseIsDown().set(true);
      }),
      $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.mouseup(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
        detail.mouseIsDown().set(false);
      })
    ];
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive($_89wx8cw8jcg89g5d.flatten([
        !isTouch$3 ? [Keying.config({
            mode: 'special',
            focusIn: function (slider) {
              return $_1ep1bp10hjcg89gr1.getPart(slider, detail, 'spectrum').map(Keying.focusIn).map($_9m9qz3wajcg89g5n.constant(true));
            }
          })] : [],
        [me.config({
            store: {
              mode: 'manual',
              getValue: function (_) {
                return detail.value().get();
              }
            }
          })]
      ])), $_dltg8y10cjcg89gq4.get(detail.sliderBehaviours())),
      events: $_1hggxlw5jcg89g4s.derive([
        $_1hggxlw5jcg89g4s.run($_1o5qt610ujcg89guj.changeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        $_1hggxlw5jcg89g4s.runOnAttached(function (slider, simulatedEvent) {
          detail.value().set(detail.getInitialValue()());
          var thumb = getThumb(slider);
          refresh(slider);
          detail.onInit()(slider, thumb, detail.value().get());
        })
      ].concat(uiEventsArr)),
      apis: {
        resetToMin: resetToMin,
        resetToMax: resetToMax,
        refresh: refresh
      },
      domModification: { styles: { position: 'relative' } }
    };
  };
  var $_atxqn8115jcg89gvr = { sketch: sketch$2 };

  var Slider = $_168cxl10djcg89gq9.composite({
    name: 'Slider',
    configFields: SliderSchema,
    partFields: SliderParts,
    factory: $_atxqn8115jcg89gvr.sketch,
    apis: {
      resetToMin: function (apis, slider) {
        apis.resetToMin(slider);
      },
      resetToMax: function (apis, slider) {
        apis.resetToMax(slider);
      },
      refresh: function (apis, slider) {
        apis.refresh(slider);
      }
    }
  });

  var button = function (realm, clazz, makeItems) {
    return $_5sd8nuz1jcg89gih.forToolbar(clazz, function () {
      var items = makeItems();
      realm.setContextToolbar([{
          label: clazz + ' group',
          items: items
        }]);
    }, {});
  };
  var $_bhmz1n117jcg89gw5 = { button: button };

  var BLACK = -1;
  var makeSlider = function (spec) {
    var getColor = function (hue) {
      if (hue < 0) {
        return 'black';
      } else if (hue > 360) {
        return 'white';
      } else {
        return 'hsl(' + hue + ', 100%, 50%)';
      }
    };
    var onInit = function (slider, thumb, value) {
      var color = getColor(value);
      $_17fn7izrjcg89glz.set(thumb.element(), 'background-color', color);
    };
    var onChange = function (slider, thumb, value) {
      var color = getColor(value);
      $_17fn7izrjcg89glz.set(thumb.element(), 'background-color', color);
      spec.onChange(slider, thumb, color);
    };
    return Slider.sketch({
      dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-slider ${prefix}-hue-slider-container"></div>'),
      components: [
        Slider.parts()['left-edge']($_7103f610pjcg89gtd.spec('<div class="${prefix}-hue-slider-black"></div>')),
        Slider.parts().spectrum({
          dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-slider-gradient-container"></div>'),
          components: [$_7103f610pjcg89gtd.spec('<div class="${prefix}-slider-gradient"></div>')],
          behaviours: $_eid12yw3jcg89g3y.derive([Toggling.config({ toggleClass: $_452cgoz0jcg89gid.resolve('thumb-active') })])
        }),
        Slider.parts()['right-edge']($_7103f610pjcg89gtd.spec('<div class="${prefix}-hue-slider-white"></div>')),
        Slider.parts().thumb({
          dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_eid12yw3jcg89g3y.derive([Toggling.config({ toggleClass: $_452cgoz0jcg89gid.resolve('thumb-active') })])
        })
      ],
      onChange: onChange,
      onDragStart: function (slider, thumb) {
        Toggling.on(thumb);
      },
      onDragEnd: function (slider, thumb) {
        Toggling.off(thumb);
      },
      onInit: onInit,
      stepSize: 10,
      min: 0,
      max: 360,
      getInitialValue: spec.getInitialValue,
      sliderBehaviours: $_eid12yw3jcg89g3y.derive([$_8qmhfpyzjcg89gi8.orientation(Slider.refresh)])
    });
  };
  var makeItems = function (spec) {
    return [makeSlider(spec)];
  };
  var sketch$1 = function (realm, editor) {
    var spec = {
      onChange: function (slider, thumb, color) {
        editor.undoManager.transact(function () {
          editor.formatter.apply('forecolor', { value: color });
          editor.nodeChanged();
        });
      },
      getInitialValue: function () {
        return BLACK;
      }
    };
    return $_bhmz1n117jcg89gw5.button(realm, 'color', function () {
      return makeItems(spec);
    });
  };
  var $_1fp4kf10rjcg89gu1 = {
    makeItems: makeItems,
    sketch: sketch$1
  };

  var schema$7 = $_51tzzcxgjcg89gax.objOfOnly([
    $_76kfpx1jcg89g86.strict('getInitialValue'),
    $_76kfpx1jcg89g86.strict('onChange'),
    $_76kfpx1jcg89g86.strict('category'),
    $_76kfpx1jcg89g86.strict('sizes')
  ]);
  var sketch$4 = function (rawSpec) {
    var spec = $_51tzzcxgjcg89gax.asRawOrDie('SizeSlider', schema$7, rawSpec);
    var isValidValue = function (valueIndex) {
      return valueIndex >= 0 && valueIndex < spec.sizes.length;
    };
    var onChange = function (slider, thumb, valueIndex) {
      if (isValidValue(valueIndex)) {
        spec.onChange(valueIndex);
      }
    };
    return Slider.sketch({
      dom: {
        tag: 'div',
        classes: [
          $_452cgoz0jcg89gid.resolve('slider-' + spec.category + '-size-container'),
          $_452cgoz0jcg89gid.resolve('slider'),
          $_452cgoz0jcg89gid.resolve('slider-size-container')
        ]
      },
      onChange: onChange,
      onDragStart: function (slider, thumb) {
        Toggling.on(thumb);
      },
      onDragEnd: function (slider, thumb) {
        Toggling.off(thumb);
      },
      min: 0,
      max: spec.sizes.length - 1,
      stepSize: 1,
      getInitialValue: spec.getInitialValue,
      snapToGrid: true,
      sliderBehaviours: $_eid12yw3jcg89g3y.derive([$_8qmhfpyzjcg89gi8.orientation(Slider.refresh)]),
      components: [
        Slider.parts().spectrum({
          dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-slider-size-container"></div>'),
          components: [$_7103f610pjcg89gtd.spec('<div class="${prefix}-slider-size-line"></div>')]
        }),
        Slider.parts().thumb({
          dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_eid12yw3jcg89g3y.derive([Toggling.config({ toggleClass: $_452cgoz0jcg89gid.resolve('thumb-active') })])
        })
      ]
    });
  };
  var $_4ngm3x119jcg89gw8 = { sketch: sketch$4 };

  var ancestor$3 = function (scope, transform, isRoot) {
    var element = scope.dom();
    var stop = $_405i8jwyjcg89g7l.isFunction(isRoot) ? isRoot : $_9m9qz3wajcg89g5n.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_a3ihziwsjcg89g6w.fromDom(element);
      var transformed = transform(el);
      if (transformed.isSome())
        return transformed;
      else if (stop(el))
        break;
    }
    return $_en0sddw9jcg89g5j.none();
  };
  var closest$3 = function (scope, transform, isRoot) {
    var current = transform(scope);
    return current.orThunk(function () {
      return isRoot(scope) ? $_en0sddw9jcg89g5j.none() : ancestor$3(scope, transform, isRoot);
    });
  };
  var $_fejm7l11bjcg89gwu = {
    ancestor: ancestor$3,
    closest: closest$3
  };

  var candidates = [
    '9px',
    '10px',
    '11px',
    '12px',
    '14px',
    '16px',
    '18px',
    '20px',
    '24px',
    '32px',
    '36px'
  ];
  var defaultSize = 'medium';
  var defaultIndex = 2;
  var indexToSize = function (index) {
    return $_en0sddw9jcg89g5j.from(candidates[index]);
  };
  var sizeToIndex = function (size) {
    return $_89wx8cw8jcg89g5d.findIndex(candidates, function (v) {
      return v === size;
    });
  };
  var getRawOrComputed = function (isRoot, rawStart) {
    var optStart = $_xqscexwjcg89gct.isElement(rawStart) ? $_en0sddw9jcg89g5j.some(rawStart) : $_3ndsgfy2jcg89gdr.parent(rawStart);
    return optStart.map(function (start) {
      var inline = $_fejm7l11bjcg89gwu.closest(start, function (elem) {
        return $_17fn7izrjcg89glz.getRaw(elem, 'font-size');
      }, isRoot);
      return inline.getOrThunk(function () {
        return $_17fn7izrjcg89glz.get(start, 'font-size');
      });
    }).getOr('');
  };
  var getSize = function (editor) {
    var node = editor.selection.getStart();
    var elem = $_a3ihziwsjcg89g6w.fromDom(node);
    var root = $_a3ihziwsjcg89g6w.fromDom(editor.getBody());
    var isRoot = function (e) {
      return $_n5s8aw7jcg89g53.eq(root, e);
    };
    var elemSize = getRawOrComputed(isRoot, elem);
    return $_89wx8cw8jcg89g5d.find(candidates, function (size) {
      return elemSize === size;
    }).getOr(defaultSize);
  };
  var applySize = function (editor, value) {
    var currentValue = getSize(editor);
    if (currentValue !== value) {
      editor.execCommand('fontSize', false, value);
    }
  };
  var get$7 = function (editor) {
    var size = getSize(editor);
    return sizeToIndex(size).getOr(defaultIndex);
  };
  var apply$1 = function (editor, index) {
    indexToSize(index).each(function (size) {
      applySize(editor, size);
    });
  };
  var $_9qzgph11ajcg89gwi = {
    candidates: $_9m9qz3wajcg89g5n.constant(candidates),
    get: get$7,
    apply: apply$1
  };

  var sizes = $_9qzgph11ajcg89gwi.candidates();
  var makeSlider$1 = function (spec) {
    return $_4ngm3x119jcg89gw8.sketch({
      onChange: spec.onChange,
      sizes: sizes,
      category: 'font',
      getInitialValue: spec.getInitialValue
    });
  };
  var makeItems$1 = function (spec) {
    return [
      $_7103f610pjcg89gtd.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-font ${prefix}-icon"></span>'),
      makeSlider$1(spec),
      $_7103f610pjcg89gtd.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-font ${prefix}-icon"></span>')
    ];
  };
  var sketch$3 = function (realm, editor) {
    var spec = {
      onChange: function (value) {
        $_9qzgph11ajcg89gwi.apply(editor, value);
      },
      getInitialValue: function () {
        return $_9qzgph11ajcg89gwi.get(editor);
      }
    };
    return $_bhmz1n117jcg89gw5.button(realm, 'font-size', function () {
      return makeItems$1(spec);
    });
  };
  var $_difehr118jcg89gw7 = {
    makeItems: makeItems$1,
    sketch: sketch$3
  };

  var record = function (spec) {
    var uid = $_b52oxhx5jcg89g9l.hasKey(spec, 'uid') ? spec.uid : $_fxeraw10ljcg89gsg.generate('memento');
    var get = function (any) {
      return any.getSystem().getByUid(uid).getOrDie();
    };
    var getOpt = function (any) {
      return any.getSystem().getByUid(uid).fold($_en0sddw9jcg89g5j.none, $_en0sddw9jcg89g5j.some);
    };
    var asSpec = function () {
      return $_5mo1ztwxjcg89g7j.deepMerge(spec, { uid: uid });
    };
    return {
      get: get,
      getOpt: getOpt,
      asSpec: asSpec
    };
  };
  var $_g1tn4l11djcg89gxd = { record: record };

  function create$3(width, height) {
    return resize(document.createElement('canvas'), width, height);
  }
  function clone$2(canvas) {
    var tCanvas, ctx;
    tCanvas = create$3(canvas.width, canvas.height);
    ctx = get2dContext(tCanvas);
    ctx.drawImage(canvas, 0, 0);
    return tCanvas;
  }
  function get2dContext(canvas) {
    return canvas.getContext('2d');
  }
  function get3dContext(canvas) {
    var gl = null;
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch (e) {
    }
    if (!gl) {
      gl = null;
    }
    return gl;
  }
  function resize(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  var $_5fe7yw11gjcg89gy3 = {
    create: create$3,
    clone: clone$2,
    resize: resize,
    get2dContext: get2dContext,
    get3dContext: get3dContext
  };

  function getWidth(image) {
    return image.naturalWidth || image.width;
  }
  function getHeight(image) {
    return image.naturalHeight || image.height;
  }
  var $_3no6g611hjcg89gy5 = {
    getWidth: getWidth,
    getHeight: getHeight
  };

  var promise = function () {
    var Promise = function (fn) {
      if (typeof this !== 'object')
        throw new TypeError('Promises must be constructed via new');
      if (typeof fn !== 'function')
        throw new TypeError('not a function');
      this._state = null;
      this._value = null;
      this._deferreds = [];
      doResolve(fn, bind(resolve, this), bind(reject, this));
    };
    var asap = Promise.immediateFn || typeof setImmediate === 'function' && setImmediate || function (fn) {
      setTimeout(fn, 1);
    };
    function bind(fn, thisArg) {
      return function () {
        fn.apply(thisArg, arguments);
      };
    }
    var isArray = Array.isArray || function (value) {
      return Object.prototype.toString.call(value) === '[object Array]';
    };
    function handle(deferred) {
      var me = this;
      if (this._state === null) {
        this._deferreds.push(deferred);
        return;
      }
      asap(function () {
        var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
          (me._state ? deferred.resolve : deferred.reject)(me._value);
          return;
        }
        var ret;
        try {
          ret = cb(me._value);
        } catch (e) {
          deferred.reject(e);
          return;
        }
        deferred.resolve(ret);
      });
    }
    function resolve(newValue) {
      try {
        if (newValue === this)
          throw new TypeError('A promise cannot be resolved with itself.');
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
          var then = newValue.then;
          if (typeof then === 'function') {
            doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
            return;
          }
        }
        this._state = true;
        this._value = newValue;
        finale.call(this);
      } catch (e) {
        reject.call(this, e);
      }
    }
    function reject(newValue) {
      this._state = false;
      this._value = newValue;
      finale.call(this);
    }
    function finale() {
      for (var i = 0, len = this._deferreds.length; i < len; i++) {
        handle.call(this, this._deferreds[i]);
      }
      this._deferreds = null;
    }
    function Handler(onFulfilled, onRejected, resolve, reject) {
      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
      this.onRejected = typeof onRejected === 'function' ? onRejected : null;
      this.resolve = resolve;
      this.reject = reject;
    }
    function doResolve(fn, onFulfilled, onRejected) {
      var done = false;
      try {
        fn(function (value) {
          if (done)
            return;
          done = true;
          onFulfilled(value);
        }, function (reason) {
          if (done)
            return;
          done = true;
          onRejected(reason);
        });
      } catch (ex) {
        if (done)
          return;
        done = true;
        onRejected(ex);
      }
    }
    Promise.prototype['catch'] = function (onRejected) {
      return this.then(null, onRejected);
    };
    Promise.prototype.then = function (onFulfilled, onRejected) {
      var me = this;
      return new Promise(function (resolve, reject) {
        handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
      });
    };
    Promise.all = function () {
      var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);
      return new Promise(function (resolve, reject) {
        if (args.length === 0)
          return resolve([]);
        var remaining = args.length;
        function res(i, val) {
          try {
            if (val && (typeof val === 'object' || typeof val === 'function')) {
              var then = val.then;
              if (typeof then === 'function') {
                then.call(val, function (val) {
                  res(i, val);
                }, reject);
                return;
              }
            }
            args[i] = val;
            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }
        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };
    Promise.resolve = function (value) {
      if (value && typeof value === 'object' && value.constructor === Promise) {
        return value;
      }
      return new Promise(function (resolve) {
        resolve(value);
      });
    };
    Promise.reject = function (value) {
      return new Promise(function (resolve, reject) {
        reject(value);
      });
    };
    Promise.race = function (values) {
      return new Promise(function (resolve, reject) {
        for (var i = 0, len = values.length; i < len; i++) {
          values[i].then(resolve, reject);
        }
      });
    };
    return Promise;
  };
  var Promise = window.Promise ? window.Promise : promise();

  var Blob = function (parts, properties) {
    var f = $_ujec4wcjcg89g5r.getOrDie('Blob');
    return new f(parts, properties);
  };

  var FileReader = function () {
    var f = $_ujec4wcjcg89g5r.getOrDie('FileReader');
    return new f();
  };

  var Uint8Array = function (arr) {
    var f = $_ujec4wcjcg89g5r.getOrDie('Uint8Array');
    return new f(arr);
  };

  var requestAnimationFrame = function (callback) {
    var f = $_ujec4wcjcg89g5r.getOrDie('requestAnimationFrame');
    f(callback);
  };
  var atob = function (base64) {
    var f = $_ujec4wcjcg89g5r.getOrDie('atob');
    return f(base64);
  };
  var $_2hajqy11mjcg89gye = {
    atob: atob,
    requestAnimationFrame: requestAnimationFrame
  };

  function loadImage(image) {
    return new Promise(function (resolve) {
      function loaded() {
        image.removeEventListener('load', loaded);
        resolve(image);
      }
      if (image.complete) {
        resolve(image);
      } else {
        image.addEventListener('load', loaded);
      }
    });
  }
  function imageToBlob$1(image) {
    return loadImage(image).then(function (image) {
      var src = image.src;
      if (src.indexOf('blob:') === 0) {
        return anyUriToBlob(src);
      }
      if (src.indexOf('data:') === 0) {
        return dataUriToBlob(src);
      }
      return anyUriToBlob(src);
    });
  }
  function blobToImage$1(blob) {
    return new Promise(function (resolve, reject) {
      var blobUrl = URL.createObjectURL(blob);
      var image = new Image();
      var removeListeners = function () {
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', error);
      };
      function loaded() {
        removeListeners();
        resolve(image);
      }
      function error() {
        removeListeners();
        reject('Unable to load data of type ' + blob.type + ': ' + blobUrl);
      }
      image.addEventListener('load', loaded);
      image.addEventListener('error', error);
      image.src = blobUrl;
      if (image.complete) {
        loaded();
      }
    });
  }
  function anyUriToBlob(url) {
    return new Promise(function (resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (this.status == 200) {
          resolve(this.response);
        }
      };
      xhr.send();
    });
  }
  function dataUriToBlobSync$1(uri) {
    var data = uri.split(',');
    var matches = /data:([^;]+)/.exec(data[0]);
    if (!matches)
      return $_en0sddw9jcg89g5j.none();
    var mimetype = matches[1];
    var base64 = data[1];
    var sliceSize = 1024;
    var byteCharacters = $_2hajqy11mjcg89gye.atob(base64);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);
    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);
      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = Uint8Array(bytes);
    }
    return $_en0sddw9jcg89g5j.some(Blob(byteArrays, { type: mimetype }));
  }
  function dataUriToBlob(uri) {
    return new Promise(function (resolve, reject) {
      dataUriToBlobSync$1(uri).fold(function () {
        reject('uri is not base64: ' + uri);
      }, resolve);
    });
  }
  function uriToBlob$1(url) {
    if (url.indexOf('blob:') === 0) {
      return anyUriToBlob(url);
    }
    if (url.indexOf('data:') === 0) {
      return dataUriToBlob(url);
    }
    return null;
  }
  function canvasToBlob(canvas, type, quality) {
    type = type || 'image/png';
    if (HTMLCanvasElement.prototype.toBlob) {
      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) {
          resolve(blob);
        }, type, quality);
      });
    } else {
      return dataUriToBlob(canvas.toDataURL(type, quality));
    }
  }
  function canvasToDataURL(getCanvas, type, quality) {
    type = type || 'image/png';
    return getCanvas.then(function (canvas) {
      return canvas.toDataURL(type, quality);
    });
  }
  function blobToCanvas(blob) {
    return blobToImage$1(blob).then(function (image) {
      revokeImageUrl(image);
      var context, canvas;
      canvas = $_5fe7yw11gjcg89gy3.create($_3no6g611hjcg89gy5.getWidth(image), $_3no6g611hjcg89gy5.getHeight(image));
      context = $_5fe7yw11gjcg89gy3.get2dContext(canvas);
      context.drawImage(image, 0, 0);
      return canvas;
    });
  }
  function blobToDataUri$1(blob) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }
  function blobToBase64$1(blob) {
    return blobToDataUri$1(blob).then(function (dataUri) {
      return dataUri.split(',')[1];
    });
  }
  function revokeImageUrl(image) {
    URL.revokeObjectURL(image.src);
  }
  var $_18p63y11fjcg89gxq = {
    blobToImage: blobToImage$1,
    imageToBlob: imageToBlob$1,
    blobToDataUri: blobToDataUri$1,
    blobToBase64: blobToBase64$1,
    dataUriToBlobSync: dataUriToBlobSync$1,
    canvasToBlob: canvasToBlob,
    canvasToDataURL: canvasToDataURL,
    blobToCanvas: blobToCanvas,
    uriToBlob: uriToBlob$1
  };

  var blobToImage = function (image) {
    return $_18p63y11fjcg89gxq.blobToImage(image);
  };
  var imageToBlob = function (blob) {
    return $_18p63y11fjcg89gxq.imageToBlob(blob);
  };
  var blobToDataUri = function (blob) {
    return $_18p63y11fjcg89gxq.blobToDataUri(blob);
  };
  var blobToBase64 = function (blob) {
    return $_18p63y11fjcg89gxq.blobToBase64(blob);
  };
  var dataUriToBlobSync = function (uri) {
    return $_18p63y11fjcg89gxq.dataUriToBlobSync(uri);
  };
  var uriToBlob = function (uri) {
    return $_en0sddw9jcg89g5j.from($_18p63y11fjcg89gxq.uriToBlob(uri));
  };
  var $_3a52rn11ejcg89gxl = {
    blobToImage: blobToImage,
    imageToBlob: imageToBlob,
    blobToDataUri: blobToDataUri,
    blobToBase64: blobToBase64,
    dataUriToBlobSync: dataUriToBlobSync,
    uriToBlob: uriToBlob
  };

  var addImage = function (editor, blob) {
    $_3a52rn11ejcg89gxl.blobToBase64(blob).then(function (base64) {
      editor.undoManager.transact(function () {
        var cache = editor.editorUpload.blobCache;
        var info = cache.create($_302rtc10fjcg89gqt.generate('mceu'), blob, base64);
        cache.add(info);
        var img = editor.dom.createHTML('img', { src: info.blobUri() });
        editor.insertContent(img);
      });
    });
  };
  var extractBlob = function (simulatedEvent) {
    var event = simulatedEvent.event();
    var files = event.raw().target.files || event.raw().dataTransfer.files;
    return $_en0sddw9jcg89g5j.from(files[0]);
  };
  var sketch$5 = function (editor) {
    var pickerDom = {
      tag: 'input',
      attributes: {
        accept: 'image/*',
        type: 'file',
        title: ''
      },
      styles: {
        visibility: 'hidden',
        position: 'absolute'
      }
    };
    var memPicker = $_g1tn4l11djcg89gxd.record({
      dom: pickerDom,
      events: $_1hggxlw5jcg89g4s.derive([
        $_1hggxlw5jcg89g4s.cutter($_3338ovwwjcg89g7g.click()),
        $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.change(), function (picker, simulatedEvent) {
          extractBlob(simulatedEvent).each(function (blob) {
            addImage(editor, blob);
          });
        })
      ])
    });
    return Button.sketch({
      dom: $_7103f610pjcg89gtd.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-image ${prefix}-icon"></span>'),
      components: [memPicker.asSpec()],
      action: function (button) {
        var picker = memPicker.get(button);
        picker.element().dom().click();
      }
    });
  };
  var $_aakudd11cjcg89gx1 = { sketch: sketch$5 };

  var get$8 = function (element) {
    return element.dom().textContent;
  };
  var set$5 = function (element, value) {
    element.dom().textContent = value;
  };
  var $_7zlozt11pjcg89gyp = {
    get: get$8,
    set: set$5
  };

  var isNotEmpty = function (val) {
    return val.length > 0;
  };
  var defaultToEmpty = function (str) {
    return str === undefined || str === null ? '' : str;
  };
  var noLink = function (editor) {
    var text = editor.selection.getContent({ format: 'text' });
    return {
      url: '',
      text: text,
      title: '',
      target: '',
      link: $_en0sddw9jcg89g5j.none()
    };
  };
  var fromLink = function (link) {
    var text = $_7zlozt11pjcg89gyp.get(link);
    var url = $_69krbwxvjcg89gck.get(link, 'href');
    var title = $_69krbwxvjcg89gck.get(link, 'title');
    var target = $_69krbwxvjcg89gck.get(link, 'target');
    return {
      url: defaultToEmpty(url),
      text: text !== url ? defaultToEmpty(text) : '',
      title: defaultToEmpty(title),
      target: defaultToEmpty(target),
      link: $_en0sddw9jcg89g5j.some(link)
    };
  };
  var getInfo = function (editor) {
    return query(editor).fold(function () {
      return noLink(editor);
    }, function (link) {
      return fromLink(link);
    });
  };
  var wasSimple = function (link) {
    var prevHref = $_69krbwxvjcg89gck.get(link, 'href');
    var prevText = $_7zlozt11pjcg89gyp.get(link);
    return prevHref === prevText;
  };
  var getTextToApply = function (link, url, info) {
    return info.text.filter(isNotEmpty).fold(function () {
      return wasSimple(link) ? $_en0sddw9jcg89g5j.some(url) : $_en0sddw9jcg89g5j.none();
    }, $_en0sddw9jcg89g5j.some);
  };
  var unlinkIfRequired = function (editor, info) {
    var activeLink = info.link.bind($_9m9qz3wajcg89g5n.identity);
    activeLink.each(function (link) {
      editor.execCommand('unlink');
    });
  };
  var getAttrs$1 = function (url, info) {
    var attrs = {};
    attrs.href = url;
    info.title.filter(isNotEmpty).each(function (title) {
      attrs.title = title;
    });
    info.target.filter(isNotEmpty).each(function (target) {
      attrs.target = target;
    });
    return attrs;
  };
  var applyInfo = function (editor, info) {
    info.url.filter(isNotEmpty).fold(function () {
      unlinkIfRequired(editor, info);
    }, function (url) {
      var attrs = getAttrs$1(url, info);
      var activeLink = info.link.bind($_9m9qz3wajcg89g5n.identity);
      activeLink.fold(function () {
        var text = info.text.filter(isNotEmpty).getOr(url);
        editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
      }, function (link) {
        var text = getTextToApply(link, url, info);
        $_69krbwxvjcg89gck.setAll(link, attrs);
        text.each(function (newText) {
          $_7zlozt11pjcg89gyp.set(link, newText);
        });
      });
    });
  };
  var query = function (editor) {
    var start = $_a3ihziwsjcg89g6w.fromDom(editor.selection.getStart());
    return $_5rph7vzljcg89gl5.closest(start, 'a');
  };
  var $_egsvp711ojcg89gyj = {
    getInfo: getInfo,
    applyInfo: applyInfo,
    query: query
  };

  var events$6 = function (name, eventHandlers) {
    var events = $_1hggxlw5jcg89g4s.derive(eventHandlers);
    return $_eid12yw3jcg89g3y.create({
      fields: [$_76kfpx1jcg89g86.strict('enabled')],
      name: name,
      active: { events: $_9m9qz3wajcg89g5n.constant(events) }
    });
  };
  var config = function (name, eventHandlers) {
    var me = events$6(name, eventHandlers);
    return {
      key: name,
      value: {
        config: {},
        me: me,
        configAsRaw: $_9m9qz3wajcg89g5n.constant({}),
        initialConfig: {},
        state: $_eid12yw3jcg89g3y.noState()
      }
    };
  };
  var $_fqydj611rjcg89gzb = {
    events: events$6,
    config: config
  };

  var getCurrent = function (component, composeConfig, composeState) {
    return composeConfig.find()(component);
  };
  var $_demqjz11tjcg89gzq = { getCurrent: getCurrent };

  var ComposeSchema = [$_76kfpx1jcg89g86.strict('find')];

  var Composing = $_eid12yw3jcg89g3y.create({
    fields: ComposeSchema,
    name: 'composing',
    apis: $_demqjz11tjcg89gzq
  });

  var factory$1 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_5mo1ztwxjcg89g7j.deepMerge({
        tag: 'div',
        attributes: { role: 'presentation' }
      }, detail.dom()),
      components: detail.components(),
      behaviours: $_dltg8y10cjcg89gq4.get(detail.containerBehaviours()),
      events: detail.events(),
      domModification: detail.domModification(),
      eventOrder: detail.eventOrder()
    };
  };
  var Container = $_168cxl10djcg89gq9.single({
    name: 'Container',
    factory: factory$1,
    configFields: [
      $_76kfpx1jcg89g86.defaulted('components', []),
      $_dltg8y10cjcg89gq4.field('containerBehaviours', []),
      $_76kfpx1jcg89g86.defaulted('events', {}),
      $_76kfpx1jcg89g86.defaulted('domModification', {}),
      $_76kfpx1jcg89g86.defaulted('eventOrder', {})
    ]
  });

  var factory$2 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: detail.getInitialValue()()
          }
        }),
        Composing.config({ find: $_en0sddw9jcg89g5j.some })
      ]), $_dltg8y10cjcg89gq4.get(detail.dataBehaviours())),
      events: $_1hggxlw5jcg89g4s.derive([$_1hggxlw5jcg89g4s.runOnAttached(function (component, simulatedEvent) {
          me.setValue(component, detail.getInitialValue()());
        })])
    };
  };
  var DataField = $_168cxl10djcg89gq9.single({
    name: 'DataField',
    factory: factory$2,
    configFields: [
      $_76kfpx1jcg89g86.strict('uid'),
      $_76kfpx1jcg89g86.strict('dom'),
      $_76kfpx1jcg89g86.strict('getInitialValue'),
      $_dltg8y10cjcg89gq4.field('dataBehaviours', [
        me,
        Composing
      ])
    ]
  });

  var get$9 = function (element) {
    return element.dom().value;
  };
  var set$6 = function (element, value) {
    if (value === undefined)
      throw new Error('Value.set was undefined');
    element.dom().value = value;
  };
  var $_et7q0h11zjcg89h0e = {
    set: set$6,
    get: get$9
  };

  var schema$8 = [
    $_76kfpx1jcg89g86.option('data'),
    $_76kfpx1jcg89g86.defaulted('inputAttributes', {}),
    $_76kfpx1jcg89g86.defaulted('inputStyles', {}),
    $_76kfpx1jcg89g86.defaulted('type', 'input'),
    $_76kfpx1jcg89g86.defaulted('tag', 'input'),
    $_76kfpx1jcg89g86.defaulted('inputClasses', []),
    $_czln55ysjcg89ggs.onHandler('onSetValue'),
    $_76kfpx1jcg89g86.defaulted('styles', {}),
    $_76kfpx1jcg89g86.option('placeholder'),
    $_76kfpx1jcg89g86.defaulted('eventOrder', {}),
    $_dltg8y10cjcg89gq4.field('inputBehaviours', [
      me,
      Focusing
    ]),
    $_76kfpx1jcg89g86.defaulted('selectOnFocus', true)
  ];
  var behaviours = function (detail) {
    return $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive([
      me.config({
        store: {
          mode: 'manual',
          initialValue: detail.data().getOr(undefined),
          getValue: function (input) {
            return $_et7q0h11zjcg89h0e.get(input.element());
          },
          setValue: function (input, data) {
            var current = $_et7q0h11zjcg89h0e.get(input.element());
            if (current !== data) {
              $_et7q0h11zjcg89h0e.set(input.element(), data);
            }
          }
        },
        onSetValue: detail.onSetValue()
      }),
      Focusing.config({
        onFocus: detail.selectOnFocus() === false ? $_9m9qz3wajcg89g5n.noop : function (component) {
          var input = component.element();
          var value = $_et7q0h11zjcg89h0e.get(input);
          input.dom().setSelectionRange(0, value.length);
        }
      })
    ]), $_dltg8y10cjcg89gq4.get(detail.inputBehaviours()));
  };
  var dom$2 = function (detail) {
    return {
      tag: detail.tag(),
      attributes: $_5mo1ztwxjcg89g7j.deepMerge($_b52oxhx5jcg89g9l.wrapAll([{
          key: 'type',
          value: detail.type()
        }].concat(detail.placeholder().map(function (pc) {
        return {
          key: 'placeholder',
          value: pc
        };
      }).toArray())), detail.inputAttributes()),
      styles: detail.inputStyles(),
      classes: detail.inputClasses()
    };
  };
  var $_6bnqpw11yjcg89h03 = {
    schema: $_9m9qz3wajcg89g5n.constant(schema$8),
    behaviours: behaviours,
    dom: dom$2
  };

  var factory$3 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_6bnqpw11yjcg89h03.dom(detail),
      components: [],
      behaviours: $_6bnqpw11yjcg89h03.behaviours(detail),
      eventOrder: detail.eventOrder()
    };
  };
  var Input = $_168cxl10djcg89gq9.single({
    name: 'Input',
    configFields: $_6bnqpw11yjcg89h03.schema(),
    factory: factory$3
  });

  var exhibit$3 = function (base, tabConfig) {
    return $_8qlllaxjjcg89gbk.nu({
      attributes: $_b52oxhx5jcg89g9l.wrapAll([{
          key: tabConfig.tabAttr(),
          value: 'true'
        }])
    });
  };
  var $_35k039121jcg89h0h = { exhibit: exhibit$3 };

  var TabstopSchema = [$_76kfpx1jcg89g86.defaulted('tabAttr', 'data-alloy-tabstop')];

  var Tabstopping = $_eid12yw3jcg89g3y.create({
    fields: TabstopSchema,
    name: 'tabstopping',
    active: $_35k039121jcg89h0h
  });

  var clearInputBehaviour = 'input-clearing';
  var field$2 = function (name, placeholder) {
    var inputSpec = $_g1tn4l11djcg89gxd.record(Input.sketch({
      placeholder: placeholder,
      onSetValue: function (input, data) {
        $_fpm2ctwujcg89g73.emit(input, $_3338ovwwjcg89g7g.input());
      },
      inputBehaviours: $_eid12yw3jcg89g3y.derive([
        Composing.config({ find: $_en0sddw9jcg89g5j.some }),
        Tabstopping.config({}),
        Keying.config({ mode: 'execution' })
      ]),
      selectOnFocus: false
    }));
    var buttonSpec = $_g1tn4l11djcg89gxd.record(Button.sketch({
      dom: $_7103f610pjcg89gtd.dom('<button class="${prefix}-input-container-x ${prefix}-icon-cancel-circle ${prefix}-icon"></button>'),
      action: function (button) {
        var input = inputSpec.get(button);
        me.setValue(input, '');
      }
    }));
    return {
      name: name,
      spec: Container.sketch({
        dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-input-container"></div>'),
        components: [
          inputSpec.asSpec(),
          buttonSpec.asSpec()
        ],
        containerBehaviours: $_eid12yw3jcg89g3y.derive([
          Toggling.config({ toggleClass: $_452cgoz0jcg89gid.resolve('input-container-empty') }),
          Composing.config({
            find: function (comp) {
              return $_en0sddw9jcg89g5j.some(inputSpec.get(comp));
            }
          }),
          $_fqydj611rjcg89gzb.config(clearInputBehaviour, [$_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.input(), function (iContainer) {
              var input = inputSpec.get(iContainer);
              var val = me.getValue(input);
              var f = val.length > 0 ? Toggling.off : Toggling.on;
              f(iContainer);
            })])
        ])
      })
    };
  };
  var hidden = function (name) {
    return {
      name: name,
      spec: DataField.sketch({
        dom: {
          tag: 'span',
          styles: { display: 'none' }
        },
        getInitialValue: function () {
          return $_en0sddw9jcg89g5j.none();
        }
      })
    };
  };
  var $_a6h3mi11qjcg89gyq = {
    field: field$2,
    hidden: hidden
  };

  var nativeDisabled = [
    'input',
    'button',
    'textarea'
  ];
  var onLoad$5 = function (component, disableConfig, disableState) {
    if (disableConfig.disabled())
      disable(component, disableConfig, disableState);
  };
  var hasNative = function (component) {
    return $_89wx8cw8jcg89g5d.contains(nativeDisabled, $_xqscexwjcg89gct.name(component.element()));
  };
  var nativeIsDisabled = function (component) {
    return $_69krbwxvjcg89gck.has(component.element(), 'disabled');
  };
  var nativeDisable = function (component) {
    $_69krbwxvjcg89gck.set(component.element(), 'disabled', 'disabled');
  };
  var nativeEnable = function (component) {
    $_69krbwxvjcg89gck.remove(component.element(), 'disabled');
  };
  var ariaIsDisabled = function (component) {
    return $_69krbwxvjcg89gck.get(component.element(), 'aria-disabled') === 'true';
  };
  var ariaDisable = function (component) {
    $_69krbwxvjcg89gck.set(component.element(), 'aria-disabled', 'true');
  };
  var ariaEnable = function (component) {
    $_69krbwxvjcg89gck.set(component.element(), 'aria-disabled', 'false');
  };
  var disable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_bhzm7gxtjcg89gcg.add(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeDisable : ariaDisable;
    f(component);
  };
  var enable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_bhzm7gxtjcg89gcg.remove(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeEnable : ariaEnable;
    f(component);
  };
  var isDisabled = function (component) {
    return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
  };
  var $_9cceai126jcg89h1j = {
    enable: enable,
    disable: disable,
    isDisabled: isDisabled,
    onLoad: onLoad$5
  };

  var exhibit$4 = function (base, disableConfig, disableState) {
    return $_8qlllaxjjcg89gbk.nu({ classes: disableConfig.disabled() ? disableConfig.disableClass().map($_89wx8cw8jcg89g5d.pure).getOr([]) : [] });
  };
  var events$7 = function (disableConfig, disableState) {
    return $_1hggxlw5jcg89g4s.derive([
      $_1hggxlw5jcg89g4s.abort($_f1ifvdwvjcg89g7a.execute(), function (component, simulatedEvent) {
        return $_9cceai126jcg89h1j.isDisabled(component, disableConfig, disableState);
      }),
      $_42if07w4jcg89g47.loadEvent(disableConfig, disableState, $_9cceai126jcg89h1j.onLoad)
    ]);
  };
  var $_8061mr125jcg89h1g = {
    exhibit: exhibit$4,
    events: events$7
  };

  var DisableSchema = [
    $_76kfpx1jcg89g86.defaulted('disabled', false),
    $_76kfpx1jcg89g86.option('disableClass')
  ];

  var Disabling = $_eid12yw3jcg89g3y.create({
    fields: DisableSchema,
    name: 'disabling',
    active: $_8061mr125jcg89h1g,
    apis: $_9cceai126jcg89h1j
  });

  var owner$1 = 'form';
  var schema$9 = [$_dltg8y10cjcg89gq4.field('formBehaviours', [me])];
  var getPartName = function (name) {
    return '<alloy.field.' + name + '>';
  };
  var sketch$8 = function (fSpec) {
    var parts = function () {
      var record = [];
      var field = function (name, config) {
        record.push(name);
        return $_1ep1bp10hjcg89gr1.generateOne(owner$1, getPartName(name), config);
      };
      return {
        field: field,
        record: function () {
          return record;
        }
      };
    }();
    var spec = fSpec(parts);
    var partNames = parts.record();
    var fieldParts = $_89wx8cw8jcg89g5d.map(partNames, function (n) {
      return $_7yfrc10jjcg89gro.required({
        name: n,
        pname: getPartName(n)
      });
    });
    return $_8k7tpq10gjcg89gqv.composite(owner$1, schema$9, fieldParts, make, spec);
  };
  var make = function (detail, components, spec) {
    return $_5mo1ztwxjcg89g7j.deepMerge({
      'debug.sketcher': { 'Form': spec },
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive([me.config({
          store: {
            mode: 'manual',
            getValue: function (form) {
              var optPs = $_1ep1bp10hjcg89gr1.getAllParts(form, detail);
              return $_gbrpaqwzjcg89g7p.map(optPs, function (optPThunk, pName) {
                return optPThunk().bind(Composing.getCurrent).map(me.getValue);
              });
            },
            setValue: function (form, values) {
              $_gbrpaqwzjcg89g7p.each(values, function (newValue, key) {
                $_1ep1bp10hjcg89gr1.getPart(form, detail, key).each(function (wrapper) {
                  Composing.getCurrent(wrapper).each(function (field) {
                    me.setValue(field, newValue);
                  });
                });
              });
            }
          }
        })]), $_dltg8y10cjcg89gq4.get(detail.formBehaviours())),
      apis: {
        getField: function (form, key) {
          return $_1ep1bp10hjcg89gr1.getPart(form, detail, key).bind(Composing.getCurrent);
        }
      }
    });
  };
  var $_2mghcr128jcg89h25 = {
    getField: $_73jsa510ejcg89gqn.makeApi(function (apis, component, key) {
      return apis.getField(component, key);
    }),
    sketch: sketch$8
  };

  var revocable = function (doRevoke) {
    var subject = Cell($_en0sddw9jcg89g5j.none());
    var revoke = function () {
      subject.get().each(doRevoke);
    };
    var clear = function () {
      revoke();
      subject.set($_en0sddw9jcg89g5j.none());
    };
    var set = function (s) {
      revoke();
      subject.set($_en0sddw9jcg89g5j.some(s));
    };
    var isSet = function () {
      return subject.get().isSome();
    };
    return {
      clear: clear,
      isSet: isSet,
      set: set
    };
  };
  var destroyable = function () {
    return revocable(function (s) {
      s.destroy();
    });
  };
  var unbindable = function () {
    return revocable(function (s) {
      s.unbind();
    });
  };
  var api$2 = function () {
    var subject = Cell($_en0sddw9jcg89g5j.none());
    var revoke = function () {
      subject.get().each(function (s) {
        s.destroy();
      });
    };
    var clear = function () {
      revoke();
      subject.set($_en0sddw9jcg89g5j.none());
    };
    var set = function (s) {
      revoke();
      subject.set($_en0sddw9jcg89g5j.some(s));
    };
    var run = function (f) {
      subject.get().each(f);
    };
    var isSet = function () {
      return subject.get().isSome();
    };
    return {
      clear: clear,
      isSet: isSet,
      set: set,
      run: run
    };
  };
  var value$3 = function () {
    var subject = Cell($_en0sddw9jcg89g5j.none());
    var clear = function () {
      subject.set($_en0sddw9jcg89g5j.none());
    };
    var set = function (s) {
      subject.set($_en0sddw9jcg89g5j.some(s));
    };
    var on = function (f) {
      subject.get().each(f);
    };
    var isSet = function () {
      return subject.get().isSome();
    };
    return {
      clear: clear,
      set: set,
      isSet: isSet,
      on: on
    };
  };
  var $_g2cejo129jcg89h2e = {
    destroyable: destroyable,
    unbindable: unbindable,
    api: api$2,
    value: value$3
  };

  var SWIPING_LEFT = 1;
  var SWIPING_RIGHT = -1;
  var SWIPING_NONE = 0;
  var init$3 = function (xValue) {
    return {
      xValue: xValue,
      points: []
    };
  };
  var move = function (model, xValue) {
    if (xValue === model.xValue) {
      return model;
    }
    var currentDirection = xValue - model.xValue > 0 ? SWIPING_LEFT : SWIPING_RIGHT;
    var newPoint = {
      direction: currentDirection,
      xValue: xValue
    };
    var priorPoints = function () {
      if (model.points.length === 0) {
        return [];
      } else {
        var prev = model.points[model.points.length - 1];
        return prev.direction === currentDirection ? model.points.slice(0, model.points.length - 1) : model.points;
      }
    }();
    return {
      xValue: xValue,
      points: priorPoints.concat([newPoint])
    };
  };
  var complete = function (model) {
    if (model.points.length === 0) {
      return SWIPING_NONE;
    } else {
      var firstDirection = model.points[0].direction;
      var lastDirection = model.points[model.points.length - 1].direction;
      return firstDirection === SWIPING_RIGHT && lastDirection === SWIPING_RIGHT ? SWIPING_RIGHT : firstDirection === SWIPING_LEFT && lastDirection === SWIPING_LEFT ? SWIPING_LEFT : SWIPING_NONE;
    }
  };
  var $_7d0axf12ajcg89h2h = {
    init: init$3,
    move: move,
    complete: complete
  };

  var sketch$7 = function (rawSpec) {
    var navigateEvent = 'navigateEvent';
    var wrapperAdhocEvents = 'serializer-wrapper-events';
    var formAdhocEvents = 'form-events';
    var schema = $_51tzzcxgjcg89gax.objOf([
      $_76kfpx1jcg89g86.strict('fields'),
      $_76kfpx1jcg89g86.defaulted('maxFieldIndex', rawSpec.fields.length - 1),
      $_76kfpx1jcg89g86.strict('onExecute'),
      $_76kfpx1jcg89g86.strict('getInitialValue'),
      $_76kfpx1jcg89g86.state('state', function () {
        return {
          dialogSwipeState: $_g2cejo129jcg89h2e.value(),
          currentScreen: Cell(0)
        };
      })
    ]);
    var spec = $_51tzzcxgjcg89gax.asRawOrDie('SerialisedDialog', schema, rawSpec);
    var navigationButton = function (direction, directionName, enabled) {
      return Button.sketch({
        dom: $_7103f610pjcg89gtd.dom('<span class="${prefix}-icon-' + directionName + ' ${prefix}-icon"></span>'),
        action: function (button) {
          $_fpm2ctwujcg89g73.emitWith(button, navigateEvent, { direction: direction });
        },
        buttonBehaviours: $_eid12yw3jcg89g3y.derive([Disabling.config({
            disableClass: $_452cgoz0jcg89gid.resolve('toolbar-navigation-disabled'),
            disabled: !enabled
          })])
      });
    };
    var reposition = function (dialog, message) {
      $_5rph7vzljcg89gl5.descendant(dialog.element(), '.' + $_452cgoz0jcg89gid.resolve('serialised-dialog-chain')).each(function (parent) {
        $_17fn7izrjcg89glz.set(parent, 'left', -spec.state.currentScreen.get() * message.width + 'px');
      });
    };
    var navigate = function (dialog, direction) {
      var screens = $_63rwmczjjcg89gkz.descendants(dialog.element(), '.' + $_452cgoz0jcg89gid.resolve('serialised-dialog-screen'));
      $_5rph7vzljcg89gl5.descendant(dialog.element(), '.' + $_452cgoz0jcg89gid.resolve('serialised-dialog-chain')).each(function (parent) {
        if (spec.state.currentScreen.get() + direction >= 0 && spec.state.currentScreen.get() + direction < screens.length) {
          $_17fn7izrjcg89glz.getRaw(parent, 'left').each(function (left) {
            var currentLeft = parseInt(left, 10);
            var w = $_bikzj9116jcg89gw3.get(screens[0]);
            $_17fn7izrjcg89glz.set(parent, 'left', currentLeft - direction * w + 'px');
          });
          spec.state.currentScreen.set(spec.state.currentScreen.get() + direction);
        }
      });
    };
    var focusInput = function (dialog) {
      var inputs = $_63rwmczjjcg89gkz.descendants(dialog.element(), 'input');
      var optInput = $_en0sddw9jcg89g5j.from(inputs[spec.state.currentScreen.get()]);
      optInput.each(function (input) {
        dialog.getSystem().getByDom(input).each(function (inputComp) {
          $_fpm2ctwujcg89g73.dispatchFocus(dialog, inputComp.element());
        });
      });
      var dotitems = memDots.get(dialog);
      Highlighting.highlightAt(dotitems, spec.state.currentScreen.get());
    };
    var resetState = function () {
      spec.state.currentScreen.set(0);
      spec.state.dialogSwipeState.clear();
    };
    var memForm = $_g1tn4l11djcg89gxd.record($_2mghcr128jcg89h25.sketch(function (parts) {
      return {
        dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-serialised-dialog"></div>'),
        components: [Container.sketch({
            dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-serialised-dialog-chain" style="left: 0px; position: absolute;"></div>'),
            components: $_89wx8cw8jcg89g5d.map(spec.fields, function (field, i) {
              return i <= spec.maxFieldIndex ? Container.sketch({
                dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-serialised-dialog-screen"></div>'),
                components: $_89wx8cw8jcg89g5d.flatten([
                  [navigationButton(-1, 'previous', i > 0)],
                  [parts.field(field.name, field.spec)],
                  [navigationButton(+1, 'next', i < spec.maxFieldIndex)]
                ])
              }) : parts.field(field.name, field.spec);
            })
          })],
        formBehaviours: $_eid12yw3jcg89g3y.derive([
          $_8qmhfpyzjcg89gi8.orientation(function (dialog, message) {
            reposition(dialog, message);
          }),
          Keying.config({
            mode: 'special',
            focusIn: function (dialog) {
              focusInput(dialog);
            },
            onTab: function (dialog) {
              navigate(dialog, +1);
              return $_en0sddw9jcg89g5j.some(true);
            },
            onShiftTab: function (dialog) {
              navigate(dialog, -1);
              return $_en0sddw9jcg89g5j.some(true);
            }
          }),
          $_fqydj611rjcg89gzb.config(formAdhocEvents, [
            $_1hggxlw5jcg89g4s.runOnAttached(function (dialog, simulatedEvent) {
              resetState();
              var dotitems = memDots.get(dialog);
              Highlighting.highlightFirst(dotitems);
              spec.getInitialValue(dialog).each(function (v) {
                me.setValue(dialog, v);
              });
            }),
            $_1hggxlw5jcg89g4s.runOnExecute(spec.onExecute),
            $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.transitionend(), function (dialog, simulatedEvent) {
              if (simulatedEvent.event().raw().propertyName === 'left') {
                focusInput(dialog);
              }
            }),
            $_1hggxlw5jcg89g4s.run(navigateEvent, function (dialog, simulatedEvent) {
              var direction = simulatedEvent.event().direction();
              navigate(dialog, direction);
            })
          ])
        ])
      };
    }));
    var memDots = $_g1tn4l11djcg89gxd.record({
      dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-dot-container"></div>'),
      behaviours: $_eid12yw3jcg89g3y.derive([Highlighting.config({
          highlightClass: $_452cgoz0jcg89gid.resolve('dot-active'),
          itemClass: $_452cgoz0jcg89gid.resolve('dot-item')
        })]),
      components: $_89wx8cw8jcg89g5d.bind(spec.fields, function (_f, i) {
        return i <= spec.maxFieldIndex ? [$_7103f610pjcg89gtd.spec('<div class="${prefix}-dot-item ${prefix}-icon-full-dot ${prefix}-icon"></div>')] : [];
      })
    });
    return {
      dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-serializer-wrapper"></div>'),
      components: [
        memForm.asSpec(),
        memDots.asSpec()
      ],
      behaviours: $_eid12yw3jcg89g3y.derive([
        Keying.config({
          mode: 'special',
          focusIn: function (wrapper) {
            var form = memForm.get(wrapper);
            Keying.focusIn(form);
          }
        }),
        $_fqydj611rjcg89gzb.config(wrapperAdhocEvents, [
          $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.touchstart(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.set($_7d0axf12ajcg89h2h.init(simulatedEvent.event().raw().touches[0].clientX));
          }),
          $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.touchmove(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.on(function (state) {
              simulatedEvent.event().prevent();
              spec.state.dialogSwipeState.set($_7d0axf12ajcg89h2h.move(state, simulatedEvent.event().raw().touches[0].clientX));
            });
          }),
          $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.touchend(), function (wrapper) {
            spec.state.dialogSwipeState.on(function (state) {
              var dialog = memForm.get(wrapper);
              var direction = -1 * $_7d0axf12ajcg89h2h.complete(state);
              navigate(dialog, direction);
            });
          })
        ])
      ])
    };
  };
  var $_1npvlv123jcg89h0n = { sketch: sketch$7 };

  var platform$1 = $_aoftmbwfjcg89g5y.detect();
  var preserve$1 = function (f, editor) {
    var rng = editor.selection.getRng();
    f();
    editor.selection.setRng(rng);
  };
  var forAndroid = function (editor, f) {
    var wrapper = platform$1.os.isAndroid() ? preserve$1 : $_9m9qz3wajcg89g5n.apply;
    wrapper(f, editor);
  };
  var $_c47jiz12bjcg89h2j = { forAndroid: forAndroid };

  var getGroups = $_4mkzmwgjcg89g60.cached(function (realm, editor) {
    return [{
        label: 'the link group',
        items: [$_1npvlv123jcg89h0n.sketch({
            fields: [
              $_a6h3mi11qjcg89gyq.field('url', 'Type or paste URL'),
              $_a6h3mi11qjcg89gyq.field('text', 'Link text'),
              $_a6h3mi11qjcg89gyq.field('title', 'Link title'),
              $_a6h3mi11qjcg89gyq.field('target', 'Link target'),
              $_a6h3mi11qjcg89gyq.hidden('link')
            ],
            maxFieldIndex: [
              'url',
              'text',
              'title',
              'target'
            ].length - 1,
            getInitialValue: function () {
              return $_en0sddw9jcg89g5j.some($_egsvp711ojcg89gyj.getInfo(editor));
            },
            onExecute: function (dialog) {
              var info = me.getValue(dialog);
              $_egsvp711ojcg89gyj.applyInfo(editor, info);
              realm.restoreToolbar();
              editor.focus();
            }
          })]
      }];
  });
  var sketch$6 = function (realm, editor) {
    return $_5sd8nuz1jcg89gih.forToolbarStateAction(editor, 'link', 'link', function () {
      var groups = getGroups(realm, editor);
      realm.setContextToolbar(groups);
      $_c47jiz12bjcg89h2j.forAndroid(editor, function () {
        realm.focusToolbar();
      });
      $_egsvp711ojcg89gyj.query(editor).each(function (link) {
        editor.selection.select(link.dom());
      });
    });
  };
  var $_f6oljf11njcg89gyf = { sketch: sketch$6 };

  var DefaultStyleFormats = [
    {
      title: 'Headings',
      items: [
        {
          title: 'Heading 1',
          format: 'h1'
        },
        {
          title: 'Heading 2',
          format: 'h2'
        },
        {
          title: 'Heading 3',
          format: 'h3'
        },
        {
          title: 'Heading 4',
          format: 'h4'
        },
        {
          title: 'Heading 5',
          format: 'h5'
        },
        {
          title: 'Heading 6',
          format: 'h6'
        }
      ]
    },
    {
      title: 'Inline',
      items: [
        {
          title: 'Bold',
          icon: 'bold',
          format: 'bold'
        },
        {
          title: 'Italic',
          icon: 'italic',
          format: 'italic'
        },
        {
          title: 'Underline',
          icon: 'underline',
          format: 'underline'
        },
        {
          title: 'Strikethrough',
          icon: 'strikethrough',
          format: 'strikethrough'
        },
        {
          title: 'Superscript',
          icon: 'superscript',
          format: 'superscript'
        },
        {
          title: 'Subscript',
          icon: 'subscript',
          format: 'subscript'
        },
        {
          title: 'Code',
          icon: 'code',
          format: 'code'
        }
      ]
    },
    {
      title: 'Blocks',
      items: [
        {
          title: 'Paragraph',
          format: 'p'
        },
        {
          title: 'Blockquote',
          format: 'blockquote'
        },
        {
          title: 'Div',
          format: 'div'
        },
        {
          title: 'Pre',
          format: 'pre'
        }
      ]
    },
    {
      title: 'Alignment',
      items: [
        {
          title: 'Left',
          icon: 'alignleft',
          format: 'alignleft'
        },
        {
          title: 'Center',
          icon: 'aligncenter',
          format: 'aligncenter'
        },
        {
          title: 'Right',
          icon: 'alignright',
          format: 'alignright'
        },
        {
          title: 'Justify',
          icon: 'alignjustify',
          format: 'alignjustify'
        }
      ]
    }
  ];

  var findRoute = function (component, transConfig, transState, route) {
    return $_b52oxhx5jcg89g9l.readOptFrom(transConfig.routes(), route.start()).map($_9m9qz3wajcg89g5n.apply).bind(function (sConfig) {
      return $_b52oxhx5jcg89g9l.readOptFrom(sConfig, route.destination()).map($_9m9qz3wajcg89g5n.apply);
    });
  };
  var getTransition = function (comp, transConfig, transState) {
    var route = getCurrentRoute(comp, transConfig, transState);
    return route.bind(function (r) {
      return getTransitionOf(comp, transConfig, transState, r);
    });
  };
  var getTransitionOf = function (comp, transConfig, transState, route) {
    return findRoute(comp, transConfig, transState, route).bind(function (r) {
      return r.transition().map(function (t) {
        return {
          transition: $_9m9qz3wajcg89g5n.constant(t),
          route: $_9m9qz3wajcg89g5n.constant(r)
        };
      });
    });
  };
  var disableTransition = function (comp, transConfig, transState) {
    getTransition(comp, transConfig, transState).each(function (routeTransition) {
      var t = routeTransition.transition();
      $_bhzm7gxtjcg89gcg.remove(comp.element(), t.transitionClass());
      $_69krbwxvjcg89gck.remove(comp.element(), transConfig.destinationAttr());
    });
  };
  var getNewRoute = function (comp, transConfig, transState, destination) {
    return {
      start: $_9m9qz3wajcg89g5n.constant($_69krbwxvjcg89gck.get(comp.element(), transConfig.stateAttr())),
      destination: $_9m9qz3wajcg89g5n.constant(destination)
    };
  };
  var getCurrentRoute = function (comp, transConfig, transState) {
    var el = comp.element();
    return $_69krbwxvjcg89gck.has(el, transConfig.destinationAttr()) ? $_en0sddw9jcg89g5j.some({
      start: $_9m9qz3wajcg89g5n.constant($_69krbwxvjcg89gck.get(comp.element(), transConfig.stateAttr())),
      destination: $_9m9qz3wajcg89g5n.constant($_69krbwxvjcg89gck.get(comp.element(), transConfig.destinationAttr()))
    }) : $_en0sddw9jcg89g5j.none();
  };
  var jumpTo = function (comp, transConfig, transState, destination) {
    disableTransition(comp, transConfig, transState);
    if ($_69krbwxvjcg89gck.has(comp.element(), transConfig.stateAttr()) && $_69krbwxvjcg89gck.get(comp.element(), transConfig.stateAttr()) !== destination)
      transConfig.onFinish()(comp, destination);
    $_69krbwxvjcg89gck.set(comp.element(), transConfig.stateAttr(), destination);
  };
  var fasttrack = function (comp, transConfig, transState, destination) {
    if ($_69krbwxvjcg89gck.has(comp.element(), transConfig.destinationAttr())) {
      $_69krbwxvjcg89gck.set(comp.element(), transConfig.stateAttr(), $_69krbwxvjcg89gck.get(comp.element(), transConfig.destinationAttr()));
      $_69krbwxvjcg89gck.remove(comp.element(), transConfig.destinationAttr());
    }
  };
  var progressTo = function (comp, transConfig, transState, destination) {
    fasttrack(comp, transConfig, transState, destination);
    var route = getNewRoute(comp, transConfig, transState, destination);
    getTransitionOf(comp, transConfig, transState, route).fold(function () {
      jumpTo(comp, transConfig, transState, destination);
    }, function (routeTransition) {
      disableTransition(comp, transConfig, transState);
      var t = routeTransition.transition();
      $_bhzm7gxtjcg89gcg.add(comp.element(), t.transitionClass());
      $_69krbwxvjcg89gck.set(comp.element(), transConfig.destinationAttr(), destination);
    });
  };
  var getState = function (comp, transConfig, transState) {
    var e = comp.element();
    return $_69krbwxvjcg89gck.has(e, transConfig.stateAttr()) ? $_en0sddw9jcg89g5j.some($_69krbwxvjcg89gck.get(e, transConfig.stateAttr())) : $_en0sddw9jcg89g5j.none();
  };
  var $_6zpzn412hjcg89h3p = {
    findRoute: findRoute,
    disableTransition: disableTransition,
    getCurrentRoute: getCurrentRoute,
    jumpTo: jumpTo,
    progressTo: progressTo,
    getState: getState
  };

  var events$8 = function (transConfig, transState) {
    return $_1hggxlw5jcg89g4s.derive([
      $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        $_6zpzn412hjcg89h3p.getCurrentRoute(component, transConfig, transState).each(function (route) {
          $_6zpzn412hjcg89h3p.findRoute(component, transConfig, transState, route).each(function (rInfo) {
            rInfo.transition().each(function (rTransition) {
              if (raw.propertyName === rTransition.property()) {
                $_6zpzn412hjcg89h3p.jumpTo(component, transConfig, transState, route.destination());
                transConfig.onTransition()(component, route);
              }
            });
          });
        });
      }),
      $_1hggxlw5jcg89g4s.runOnAttached(function (comp, se) {
        $_6zpzn412hjcg89h3p.jumpTo(comp, transConfig, transState, transConfig.initialState());
      })
    ]);
  };
  var $_fxsj7w12gjcg89h3n = { events: events$8 };

  var TransitionSchema = [
    $_76kfpx1jcg89g86.defaulted('destinationAttr', 'data-transitioning-destination'),
    $_76kfpx1jcg89g86.defaulted('stateAttr', 'data-transitioning-state'),
    $_76kfpx1jcg89g86.strict('initialState'),
    $_czln55ysjcg89ggs.onHandler('onTransition'),
    $_czln55ysjcg89ggs.onHandler('onFinish'),
    $_76kfpx1jcg89g86.strictOf('routes', $_51tzzcxgjcg89gax.setOf($_b8l9yux7jcg89g9z.value, $_51tzzcxgjcg89gax.setOf($_b8l9yux7jcg89g9z.value, $_51tzzcxgjcg89gax.objOfOnly([$_76kfpx1jcg89g86.optionObjOfOnly('transition', [
        $_76kfpx1jcg89g86.strict('property'),
        $_76kfpx1jcg89g86.strict('transitionClass')
      ])]))))
  ];

  var createRoutes = function (routes) {
    var r = {};
    $_gbrpaqwzjcg89g7p.each(routes, function (v, k) {
      var waypoints = k.split('<->');
      r[waypoints[0]] = $_b52oxhx5jcg89g9l.wrap(waypoints[1], v);
      r[waypoints[1]] = $_b52oxhx5jcg89g9l.wrap(waypoints[0], v);
    });
    return r;
  };
  var createBistate = function (first, second, transitions) {
    return $_b52oxhx5jcg89g9l.wrapAll([
      {
        key: first,
        value: $_b52oxhx5jcg89g9l.wrap(second, transitions)
      },
      {
        key: second,
        value: $_b52oxhx5jcg89g9l.wrap(first, transitions)
      }
    ]);
  };
  var createTristate = function (first, second, third, transitions) {
    return $_b52oxhx5jcg89g9l.wrapAll([
      {
        key: first,
        value: $_b52oxhx5jcg89g9l.wrapAll([
          {
            key: second,
            value: transitions
          },
          {
            key: third,
            value: transitions
          }
        ])
      },
      {
        key: second,
        value: $_b52oxhx5jcg89g9l.wrapAll([
          {
            key: first,
            value: transitions
          },
          {
            key: third,
            value: transitions
          }
        ])
      },
      {
        key: third,
        value: $_b52oxhx5jcg89g9l.wrapAll([
          {
            key: first,
            value: transitions
          },
          {
            key: second,
            value: transitions
          }
        ])
      }
    ]);
  };
  var Transitioning = $_eid12yw3jcg89g3y.create({
    fields: TransitionSchema,
    name: 'transitioning',
    active: $_fxsj7w12gjcg89h3n,
    apis: $_6zpzn412hjcg89h3p,
    extra: {
      createRoutes: createRoutes,
      createBistate: createBistate,
      createTristate: createTristate
    }
  });

  var generateFrom$1 = function (spec, all) {
    var schema = $_89wx8cw8jcg89g5d.map(all, function (a) {
      return $_76kfpx1jcg89g86.field(a.name(), a.name(), $_562y16x2jcg89g8j.asOption(), $_51tzzcxgjcg89gax.objOf([
        $_76kfpx1jcg89g86.strict('config'),
        $_76kfpx1jcg89g86.defaulted('state', $_960zyxxpjcg89gc9)
      ]));
    });
    var validated = $_51tzzcxgjcg89gax.asStruct('component.behaviours', $_51tzzcxgjcg89gax.objOf(schema), spec.behaviours).fold(function (errInfo) {
      throw new Error($_51tzzcxgjcg89gax.formatError(errInfo) + '\nComplete spec:\n' + $_3nrfsfxejcg89gat.stringify(spec, null, 2));
    }, $_9m9qz3wajcg89g5n.identity);
    return {
      list: all,
      data: $_gbrpaqwzjcg89g7p.map(validated, function (blobOptionThunk) {
        var blobOption = blobOptionThunk();
        return $_9m9qz3wajcg89g5n.constant(blobOption.map(function (blob) {
          return {
            config: blob.config(),
            state: blob.state().init(blob.config())
          };
        }));
      })
    };
  };
  var getBehaviours$1 = function (bData) {
    return bData.list;
  };
  var getData = function (bData) {
    return bData.data;
  };
  var $_ch6e5d12mjcg89h5d = {
    generateFrom: generateFrom$1,
    getBehaviours: getBehaviours$1,
    getData: getData
  };

  var getBehaviours = function (spec) {
    var behaviours = $_b52oxhx5jcg89g9l.readOptFrom(spec, 'behaviours').getOr({});
    var keys = $_89wx8cw8jcg89g5d.filter($_gbrpaqwzjcg89g7p.keys(behaviours), function (k) {
      return behaviours[k] !== undefined;
    });
    return $_89wx8cw8jcg89g5d.map(keys, function (k) {
      return spec.behaviours[k].me;
    });
  };
  var generateFrom = function (spec, all) {
    return $_ch6e5d12mjcg89h5d.generateFrom(spec, all);
  };
  var generate$4 = function (spec) {
    var all = getBehaviours(spec);
    return generateFrom(spec, all);
  };
  var $_2tkvm12ljcg89h53 = {
    generate: generate$4,
    generateFrom: generateFrom
  };

  var ComponentApi = $_g9rauexrjcg89gcc.exactly([
    'getSystem',
    'config',
    'hasConfigured',
    'spec',
    'connect',
    'disconnect',
    'element',
    'syncComponents',
    'readState',
    'components',
    'events'
  ]);

  var SystemApi = $_g9rauexrjcg89gcc.exactly([
    'debugInfo',
    'triggerFocus',
    'triggerEvent',
    'triggerEscape',
    'addToWorld',
    'removeFromWorld',
    'addToGui',
    'removeFromGui',
    'build',
    'getByUid',
    'getByDom',
    'broadcast',
    'broadcastOn'
  ]);

  var NoContextApi = function (getComp) {
    var fail = function (event) {
      return function () {
        throw new Error('The component must be in a context to send: ' + event + '\n' + $_8845a2y8jcg89ger.element(getComp().element()) + ' is not in context.');
      };
    };
    return SystemApi({
      debugInfo: $_9m9qz3wajcg89g5n.constant('fake'),
      triggerEvent: fail('triggerEvent'),
      triggerFocus: fail('triggerFocus'),
      triggerEscape: fail('triggerEscape'),
      build: fail('build'),
      addToWorld: fail('addToWorld'),
      removeFromWorld: fail('removeFromWorld'),
      addToGui: fail('addToGui'),
      removeFromGui: fail('removeFromGui'),
      getByUid: fail('getByUid'),
      getByDom: fail('getByDom'),
      broadcast: fail('broadcast'),
      broadcastOn: fail('broadcastOn')
    });
  };

  var byInnerKey = function (data, tuple) {
    var r = {};
    $_gbrpaqwzjcg89g7p.each(data, function (detail, key) {
      $_gbrpaqwzjcg89g7p.each(detail, function (value, indexKey) {
        var chain = $_b52oxhx5jcg89g9l.readOr(indexKey, [])(r);
        r[indexKey] = chain.concat([tuple(key, value)]);
      });
    });
    return r;
  };
  var $_dlr9po12rjcg89h6g = { byInnerKey: byInnerKey };

  var behaviourDom = function (name, modification) {
    return {
      name: $_9m9qz3wajcg89g5n.constant(name),
      modification: modification
    };
  };
  var concat = function (chain, aspect) {
    var values = $_89wx8cw8jcg89g5d.bind(chain, function (c) {
      return c.modification().getOr([]);
    });
    return $_b8l9yux7jcg89g9z.value($_b52oxhx5jcg89g9l.wrap(aspect, values));
  };
  var onlyOne = function (chain, aspect, order) {
    if (chain.length > 1)
      return $_b8l9yux7jcg89g9z.error('Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' + $_3nrfsfxejcg89gat.stringify($_89wx8cw8jcg89g5d.map(chain, function (b) {
        return b.name();
      })) + '. At this stage, this ' + 'is not supported. Future releases might provide strategies for resolving this.');
    else if (chain.length === 0)
      return $_b8l9yux7jcg89g9z.value({});
    else
      return $_b8l9yux7jcg89g9z.value(chain[0].modification().fold(function () {
        return {};
      }, function (m) {
        return $_b52oxhx5jcg89g9l.wrap(aspect, m);
      }));
  };
  var duplicate = function (aspect, k, obj, behaviours) {
    return $_b8l9yux7jcg89g9z.error('Mulitple behaviours have tried to change the _' + k + '_ "' + aspect + '"' + '. The guilty behaviours are: ' + $_3nrfsfxejcg89gat.stringify($_89wx8cw8jcg89g5d.bind(behaviours, function (b) {
      return b.modification().getOr({})[k] !== undefined ? [b.name()] : [];
    }), null, 2) + '. This is not currently supported.');
  };
  var safeMerge = function (chain, aspect) {
    var y = $_89wx8cw8jcg89g5d.foldl(chain, function (acc, c) {
      var obj = c.modification().getOr({});
      return acc.bind(function (accRest) {
        var parts = $_gbrpaqwzjcg89g7p.mapToArray(obj, function (v, k) {
          return accRest[k] !== undefined ? duplicate(aspect, k, obj, chain) : $_b8l9yux7jcg89g9z.value($_b52oxhx5jcg89g9l.wrap(k, v));
        });
        return $_b52oxhx5jcg89g9l.consolidate(parts, accRest);
      });
    }, $_b8l9yux7jcg89g9z.value({}));
    return y.map(function (yValue) {
      return $_b52oxhx5jcg89g9l.wrap(aspect, yValue);
    });
  };
  var mergeTypes = {
    classes: concat,
    attributes: safeMerge,
    styles: safeMerge,
    domChildren: onlyOne,
    defChildren: onlyOne,
    innerHtml: onlyOne,
    value: onlyOne
  };
  var combine$1 = function (info, baseMod, behaviours, base) {
    var behaviourDoms = $_5mo1ztwxjcg89g7j.deepMerge({}, baseMod);
    $_89wx8cw8jcg89g5d.each(behaviours, function (behaviour) {
      behaviourDoms[behaviour.name()] = behaviour.exhibit(info, base);
    });
    var byAspect = $_dlr9po12rjcg89h6g.byInnerKey(behaviourDoms, behaviourDom);
    var usedAspect = $_gbrpaqwzjcg89g7p.map(byAspect, function (values, aspect) {
      return $_89wx8cw8jcg89g5d.bind(values, function (value) {
        return value.modification().fold(function () {
          return [];
        }, function (v) {
          return [value];
        });
      });
    });
    var modifications = $_gbrpaqwzjcg89g7p.mapToArray(usedAspect, function (values, aspect) {
      return $_b52oxhx5jcg89g9l.readOptFrom(mergeTypes, aspect).fold(function () {
        return $_b8l9yux7jcg89g9z.error('Unknown field type: ' + aspect);
      }, function (merger) {
        return merger(values, aspect);
      });
    });
    var consolidated = $_b52oxhx5jcg89g9l.consolidate(modifications, {});
    return consolidated.map($_8qlllaxjjcg89gbk.nu);
  };
  var $_12g11d12qjcg89h5x = { combine: combine$1 };

  var sortKeys = function (label, keyName, array, order) {
    var sliced = array.slice(0);
    try {
      var sorted = sliced.sort(function (a, b) {
        var aKey = a[keyName]();
        var bKey = b[keyName]();
        var aIndex = order.indexOf(aKey);
        var bIndex = order.indexOf(bKey);
        if (aIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey + '.\nOrder specified: ' + $_3nrfsfxejcg89gat.stringify(order, null, 2));
        if (bIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey + '.\nOrder specified: ' + $_3nrfsfxejcg89gat.stringify(order, null, 2));
        if (aIndex < bIndex)
          return -1;
        else if (bIndex < aIndex)
          return 1;
        else
          return 0;
      });
      return $_b8l9yux7jcg89g9z.value(sorted);
    } catch (err) {
      return $_b8l9yux7jcg89g9z.error([err]);
    }
  };
  var $_7g2mw912tjcg89h6x = { sortKeys: sortKeys };

  var nu$7 = function (handler, purpose) {
    return {
      handler: handler,
      purpose: $_9m9qz3wajcg89g5n.constant(purpose)
    };
  };
  var curryArgs = function (descHandler, extraArgs) {
    return {
      handler: $_9m9qz3wajcg89g5n.curry.apply(undefined, [descHandler.handler].concat(extraArgs)),
      purpose: descHandler.purpose
    };
  };
  var getHandler = function (descHandler) {
    return descHandler.handler;
  };
  var $_gcmye512ujcg89h71 = {
    nu: nu$7,
    curryArgs: curryArgs,
    getHandler: getHandler
  };

  var behaviourTuple = function (name, handler) {
    return {
      name: $_9m9qz3wajcg89g5n.constant(name),
      handler: $_9m9qz3wajcg89g5n.constant(handler)
    };
  };
  var nameToHandlers = function (behaviours, info) {
    var r = {};
    $_89wx8cw8jcg89g5d.each(behaviours, function (behaviour) {
      r[behaviour.name()] = behaviour.handlers(info);
    });
    return r;
  };
  var groupByEvents = function (info, behaviours, base) {
    var behaviourEvents = $_5mo1ztwxjcg89g7j.deepMerge(base, nameToHandlers(behaviours, info));
    return $_dlr9po12rjcg89h6g.byInnerKey(behaviourEvents, behaviourTuple);
  };
  var combine$2 = function (info, eventOrder, behaviours, base) {
    var byEventName = groupByEvents(info, behaviours, base);
    return combineGroups(byEventName, eventOrder);
  };
  var assemble = function (rawHandler) {
    var handler = $_2mnikcx0jcg89g7t.read(rawHandler);
    return function (component, simulatedEvent) {
      var args = Array.prototype.slice.call(arguments, 0);
      if (handler.abort.apply(undefined, args)) {
        simulatedEvent.stop();
      } else if (handler.can.apply(undefined, args)) {
        handler.run.apply(undefined, args);
      }
    };
  };
  var missingOrderError = function (eventName, tuples) {
    return new $_b8l9yux7jcg89g9z.error(['The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 'can trigger it are: ' + $_3nrfsfxejcg89gat.stringify($_89wx8cw8jcg89g5d.map(tuples, function (c) {
        return c.name();
      }), null, 2)]);
  };
  var fuse$1 = function (tuples, eventOrder, eventName) {
    var order = eventOrder[eventName];
    if (!order)
      return missingOrderError(eventName, tuples);
    else
      return $_7g2mw912tjcg89h6x.sortKeys('Event: ' + eventName, 'name', tuples, order).map(function (sortedTuples) {
        var handlers = $_89wx8cw8jcg89g5d.map(sortedTuples, function (tuple) {
          return tuple.handler();
        });
        return $_2mnikcx0jcg89g7t.fuse(handlers);
      });
  };
  var combineGroups = function (byEventName, eventOrder) {
    var r = $_gbrpaqwzjcg89g7p.mapToArray(byEventName, function (tuples, eventName) {
      var combined = tuples.length === 1 ? $_b8l9yux7jcg89g9z.value(tuples[0].handler()) : fuse$1(tuples, eventOrder, eventName);
      return combined.map(function (handler) {
        var assembled = assemble(handler);
        var purpose = tuples.length > 1 ? $_89wx8cw8jcg89g5d.filter(eventOrder, function (o) {
          return $_89wx8cw8jcg89g5d.contains(tuples, function (t) {
            return t.name() === o;
          });
        }).join(' > ') : tuples[0].name();
        return $_b52oxhx5jcg89g9l.wrap(eventName, $_gcmye512ujcg89h71.nu(assembled, purpose));
      });
    });
    return $_b52oxhx5jcg89g9l.consolidate(r, {});
  };
  var $_bavihw12sjcg89h6n = { combine: combine$2 };

  var toInfo = function (spec) {
    return $_51tzzcxgjcg89gax.asStruct('custom.definition', $_51tzzcxgjcg89gax.objOfOnly([
      $_76kfpx1jcg89g86.field('dom', 'dom', $_562y16x2jcg89g8j.strict(), $_51tzzcxgjcg89gax.objOfOnly([
        $_76kfpx1jcg89g86.strict('tag'),
        $_76kfpx1jcg89g86.defaulted('styles', {}),
        $_76kfpx1jcg89g86.defaulted('classes', []),
        $_76kfpx1jcg89g86.defaulted('attributes', {}),
        $_76kfpx1jcg89g86.option('value'),
        $_76kfpx1jcg89g86.option('innerHtml')
      ])),
      $_76kfpx1jcg89g86.strict('components'),
      $_76kfpx1jcg89g86.strict('uid'),
      $_76kfpx1jcg89g86.defaulted('events', {}),
      $_76kfpx1jcg89g86.defaulted('apis', $_9m9qz3wajcg89g5n.constant({})),
      $_76kfpx1jcg89g86.field('eventOrder', 'eventOrder', $_562y16x2jcg89g8j.mergeWith({
        'alloy.execute': [
          'disabling',
          'alloy.base.behaviour',
          'toggling'
        ],
        'alloy.focus': [
          'alloy.base.behaviour',
          'focusing',
          'keying'
        ],
        'alloy.system.init': [
          'alloy.base.behaviour',
          'disabling',
          'toggling',
          'representing'
        ],
        'input': [
          'alloy.base.behaviour',
          'representing',
          'streaming',
          'invalidating'
        ],
        'alloy.system.detached': [
          'alloy.base.behaviour',
          'representing'
        ]
      }), $_51tzzcxgjcg89gax.anyValue()),
      $_76kfpx1jcg89g86.option('domModification'),
      $_czln55ysjcg89ggs.snapshot('originalSpec'),
      $_76kfpx1jcg89g86.defaulted('debug.sketcher', 'unknown')
    ]), spec);
  };
  var getUid = function (info) {
    return $_b52oxhx5jcg89g9l.wrap($_5sz1no10mjcg89gsu.idAttr(), info.uid());
  };
  var toDefinition = function (info) {
    var base = {
      tag: info.dom().tag(),
      classes: info.dom().classes(),
      attributes: $_5mo1ztwxjcg89g7j.deepMerge(getUid(info), info.dom().attributes()),
      styles: info.dom().styles(),
      domChildren: $_89wx8cw8jcg89g5d.map(info.components(), function (comp) {
        return comp.element();
      })
    };
    return $_h3tzjxkjcg89gbx.nu($_5mo1ztwxjcg89g7j.deepMerge(base, info.dom().innerHtml().map(function (h) {
      return $_b52oxhx5jcg89g9l.wrap('innerHtml', h);
    }).getOr({}), info.dom().value().map(function (h) {
      return $_b52oxhx5jcg89g9l.wrap('value', h);
    }).getOr({})));
  };
  var toModification = function (info) {
    return info.domModification().fold(function () {
      return $_8qlllaxjjcg89gbk.nu({});
    }, $_8qlllaxjjcg89gbk.nu);
  };
  var toApis = function (info) {
    return info.apis();
  };
  var toEvents = function (info) {
    return info.events();
  };
  var $_28nc0612vjcg89h74 = {
    toInfo: toInfo,
    toDefinition: toDefinition,
    toModification: toModification,
    toApis: toApis,
    toEvents: toEvents
  };

  var add$3 = function (element, classes) {
    $_89wx8cw8jcg89g5d.each(classes, function (x) {
      $_bhzm7gxtjcg89gcg.add(element, x);
    });
  };
  var remove$6 = function (element, classes) {
    $_89wx8cw8jcg89g5d.each(classes, function (x) {
      $_bhzm7gxtjcg89gcg.remove(element, x);
    });
  };
  var toggle$3 = function (element, classes) {
    $_89wx8cw8jcg89g5d.each(classes, function (x) {
      $_bhzm7gxtjcg89gcg.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return $_89wx8cw8jcg89g5d.forall(classes, function (clazz) {
      return $_bhzm7gxtjcg89gcg.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return $_89wx8cw8jcg89g5d.exists(classes, function (clazz) {
      return $_bhzm7gxtjcg89gcg.has(element, clazz);
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
  var get$10 = function (element) {
    return $_8hqfj3xxjcg89gcv.supports(element) ? getNative(element) : $_8hqfj3xxjcg89gcv.get(element);
  };
  var $_3a6uq212xjcg89h7v = {
    add: add$3,
    remove: remove$6,
    toggle: toggle$3,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$10
  };

  var getChildren = function (definition) {
    if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
      throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + $_h3tzjxkjcg89gbx.defToStr(definition));
    } else {
      return definition.domChildren().fold(function () {
        var defChildren = definition.defChildren().getOr([]);
        return $_89wx8cw8jcg89g5d.map(defChildren, renderDef);
      }, function (domChildren) {
        return domChildren;
      });
    }
  };
  var renderToDom = function (definition) {
    var subject = $_a3ihziwsjcg89g6w.fromTag(definition.tag());
    $_69krbwxvjcg89gck.setAll(subject, definition.attributes().getOr({}));
    $_3a6uq212xjcg89h7v.add(subject, definition.classes().getOr([]));
    $_17fn7izrjcg89glz.setAll(subject, definition.styles().getOr({}));
    $_6dv6zryajcg89gew.set(subject, definition.innerHtml().getOr(''));
    var children = getChildren(definition);
    $_6xk1mcy5jcg89ge8.append(subject, children);
    definition.value().each(function (value) {
      $_et7q0h11zjcg89h0e.set(subject, value);
    });
    return subject;
  };
  var renderDef = function (spec) {
    var definition = $_h3tzjxkjcg89gbx.nu(spec);
    return renderToDom(definition);
  };
  var $_5l1h8u12wjcg89h7j = { renderToDom: renderToDom };

  var build$1 = function (spec) {
    var getMe = function () {
      return me;
    };
    var systemApi = Cell(NoContextApi(getMe));
    var info = $_51tzzcxgjcg89gax.getOrDie($_28nc0612vjcg89h74.toInfo($_5mo1ztwxjcg89g7j.deepMerge(spec, { behaviours: undefined })));
    var bBlob = $_2tkvm12ljcg89h53.generate(spec);
    var bList = $_ch6e5d12mjcg89h5d.getBehaviours(bBlob);
    var bData = $_ch6e5d12mjcg89h5d.getData(bBlob);
    var definition = $_28nc0612vjcg89h74.toDefinition(info);
    var baseModification = { 'alloy.base.modification': $_28nc0612vjcg89h74.toModification(info) };
    var modification = $_12g11d12qjcg89h5x.combine(bData, baseModification, bList, definition).getOrDie();
    var modDefinition = $_8qlllaxjjcg89gbk.merge(definition, modification);
    var item = $_5l1h8u12wjcg89h7j.renderToDom(modDefinition);
    var baseEvents = { 'alloy.base.behaviour': $_28nc0612vjcg89h74.toEvents(info) };
    var events = $_bavihw12sjcg89h6n.combine(bData, info.eventOrder(), bList, baseEvents).getOrDie();
    var subcomponents = Cell(info.components());
    var connect = function (newApi) {
      systemApi.set(newApi);
    };
    var disconnect = function () {
      systemApi.set(NoContextApi(getMe));
    };
    var syncComponents = function () {
      var children = $_3ndsgfy2jcg89gdr.children(item);
      var subs = $_89wx8cw8jcg89g5d.bind(children, function (child) {
        return systemApi.get().getByDom(child).fold(function () {
          return [];
        }, function (c) {
          return [c];
        });
      });
      subcomponents.set(subs);
    };
    var config = function (behaviour) {
      if (behaviour === $_73jsa510ejcg89gqn.apiConfig())
        return info.apis();
      var b = bData;
      var f = $_405i8jwyjcg89g7l.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {
        throw new Error('Could not find ' + behaviour.name() + ' in ' + $_3nrfsfxejcg89gat.stringify(spec, null, 2));
      };
      return f();
    };
    var hasConfigured = function (behaviour) {
      return $_405i8jwyjcg89g7l.isFunction(bData[behaviour.name()]);
    };
    var readState = function (behaviourName) {
      return bData[behaviourName]().map(function (b) {
        return b.state.readState();
      }).getOr('not enabled');
    };
    var me = ComponentApi({
      getSystem: systemApi.get,
      config: config,
      hasConfigured: hasConfigured,
      spec: $_9m9qz3wajcg89g5n.constant(spec),
      readState: readState,
      connect: connect,
      disconnect: disconnect,
      element: $_9m9qz3wajcg89g5n.constant(item),
      syncComponents: syncComponents,
      components: subcomponents.get,
      events: $_9m9qz3wajcg89g5n.constant(events)
    });
    return me;
  };
  var $_7uvevp12kjcg89h4l = { build: build$1 };

  var isRecursive = function (component, originator, target) {
    return $_n5s8aw7jcg89g53.eq(originator, component.element()) && !$_n5s8aw7jcg89g53.eq(originator, target);
  };
  var $_c6irau12yjcg89h80 = {
    events: $_1hggxlw5jcg89g4s.derive([$_1hggxlw5jcg89g4s.can($_f1ifvdwvjcg89g7a.focus(), function (component, simulatedEvent) {
        var originator = simulatedEvent.event().originator();
        var target = simulatedEvent.event().target();
        if (isRecursive(component, originator, target)) {
          console.warn($_f1ifvdwvjcg89g7a.focus() + ' did not get interpreted by the desired target. ' + '\nOriginator: ' + $_8845a2y8jcg89ger.element(originator) + '\nTarget: ' + $_8845a2y8jcg89ger.element(target) + '\nCheck the ' + $_f1ifvdwvjcg89g7a.focus() + ' event handlers');
          return false;
        } else {
          return true;
        }
      })])
  };

  var make$1 = function (spec) {
    return spec;
  };
  var $_15vggh12zjcg89h83 = { make: make$1 };

  var buildSubcomponents = function (spec) {
    var components = $_b52oxhx5jcg89g9l.readOr('components', [])(spec);
    return $_89wx8cw8jcg89g5d.map(components, build);
  };
  var buildFromSpec = function (userSpec) {
    var spec = $_15vggh12zjcg89h83.make(userSpec);
    var components = buildSubcomponents(spec);
    var completeSpec = $_5mo1ztwxjcg89g7j.deepMerge($_c6irau12yjcg89h80, spec, $_b52oxhx5jcg89g9l.wrap('components', components));
    return $_b8l9yux7jcg89g9z.value($_7uvevp12kjcg89h4l.build(completeSpec));
  };
  var text = function (textContent) {
    var element = $_a3ihziwsjcg89g6w.fromText(textContent);
    return external({ element: element });
  };
  var external = function (spec) {
    var extSpec = $_51tzzcxgjcg89gax.asStructOrDie('external.component', $_51tzzcxgjcg89gax.objOfOnly([
      $_76kfpx1jcg89g86.strict('element'),
      $_76kfpx1jcg89g86.option('uid')
    ]), spec);
    var systemApi = Cell(NoContextApi());
    var connect = function (newApi) {
      systemApi.set(newApi);
    };
    var disconnect = function () {
      systemApi.set(NoContextApi(function () {
        return me;
      }));
    };
    extSpec.uid().each(function (uid) {
      $_fxeraw10ljcg89gsg.writeOnly(extSpec.element(), uid);
    });
    var me = ComponentApi({
      getSystem: systemApi.get,
      config: $_en0sddw9jcg89g5j.none,
      hasConfigured: $_9m9qz3wajcg89g5n.constant(false),
      connect: connect,
      disconnect: disconnect,
      element: $_9m9qz3wajcg89g5n.constant(extSpec.element()),
      spec: $_9m9qz3wajcg89g5n.constant(spec),
      readState: $_9m9qz3wajcg89g5n.constant('No state'),
      syncComponents: $_9m9qz3wajcg89g5n.noop,
      components: $_9m9qz3wajcg89g5n.constant([]),
      events: $_9m9qz3wajcg89g5n.constant({})
    });
    return $_73jsa510ejcg89gqn.premade(me);
  };
  var build = function (rawUserSpec) {
    return $_73jsa510ejcg89gqn.getPremade(rawUserSpec).fold(function () {
      var userSpecWithUid = $_5mo1ztwxjcg89g7j.deepMerge({ uid: $_fxeraw10ljcg89gsg.generate('') }, rawUserSpec);
      return buildFromSpec(userSpecWithUid).getOrDie();
    }, function (prebuilt) {
      return prebuilt;
    });
  };
  var $_at4sh212jjcg89h46 = {
    build: build,
    premade: $_73jsa510ejcg89gqn.premade,
    external: external,
    text: text
  };

  var hoverEvent = 'alloy.item-hover';
  var focusEvent = 'alloy.item-focus';
  var onHover = function (item) {
    if ($_72ito4yfjcg89gf5.search(item.element()).isNone() || Focusing.isFocused(item)) {
      if (!Focusing.isFocused(item))
        Focusing.focus(item);
      $_fpm2ctwujcg89g73.emitWith(item, hoverEvent, { item: item });
    }
  };
  var onFocus = function (item) {
    $_fpm2ctwujcg89g73.emitWith(item, focusEvent, { item: item });
  };
  var $_8eromn133jcg89h8o = {
    hover: $_9m9qz3wajcg89g5n.constant(hoverEvent),
    focus: $_9m9qz3wajcg89g5n.constant(focusEvent),
    onHover: onHover,
    onFocus: onFocus
  };

  var builder = function (info) {
    return {
      dom: $_5mo1ztwxjcg89g7j.deepMerge(info.dom(), { attributes: { role: info.toggling().isSome() ? 'menuitemcheckbox' : 'menuitem' } }),
      behaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive([
        info.toggling().fold(Toggling.revoke, function (tConfig) {
          return Toggling.config($_5mo1ztwxjcg89g7j.deepMerge({ aria: { mode: 'checked' } }, tConfig));
        }),
        Focusing.config({
          ignore: info.ignoreFocus(),
          onFocus: function (component) {
            $_8eromn133jcg89h8o.onFocus(component);
          }
        }),
        Keying.config({ mode: 'execution' }),
        me.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        })
      ]), info.itemBehaviours()),
      events: $_1hggxlw5jcg89g4s.derive([
        $_1hggxlw5jcg89g4s.runWithTarget($_f1ifvdwvjcg89g7a.tapOrClick(), $_fpm2ctwujcg89g73.emitExecute),
        $_1hggxlw5jcg89g4s.cutter($_3338ovwwjcg89g7g.mousedown()),
        $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.mouseover(), $_8eromn133jcg89h8o.onHover),
        $_1hggxlw5jcg89g4s.run($_f1ifvdwvjcg89g7a.focusItem(), Focusing.focus)
      ]),
      components: info.components(),
      domModification: info.domModification()
    };
  };
  var schema$11 = [
    $_76kfpx1jcg89g86.strict('data'),
    $_76kfpx1jcg89g86.strict('components'),
    $_76kfpx1jcg89g86.strict('dom'),
    $_76kfpx1jcg89g86.option('toggling'),
    $_76kfpx1jcg89g86.defaulted('itemBehaviours', {}),
    $_76kfpx1jcg89g86.defaulted('ignoreFocus', false),
    $_76kfpx1jcg89g86.defaulted('domModification', {}),
    $_czln55ysjcg89ggs.output('builder', builder)
  ];

  var builder$1 = function (detail) {
    return {
      dom: detail.dom(),
      components: detail.components(),
      events: $_1hggxlw5jcg89g4s.derive([$_1hggxlw5jcg89g4s.stopper($_f1ifvdwvjcg89g7a.focusItem())])
    };
  };
  var schema$12 = [
    $_76kfpx1jcg89g86.strict('dom'),
    $_76kfpx1jcg89g86.strict('components'),
    $_czln55ysjcg89ggs.output('builder', builder$1)
  ];

  var owner$2 = 'item-widget';
  var partTypes = [$_7yfrc10jjcg89gro.required({
      name: 'widget',
      overrides: function (detail) {
        return {
          behaviours: $_eid12yw3jcg89g3y.derive([me.config({
              store: {
                mode: 'manual',
                getValue: function (component) {
                  return detail.data();
                },
                setValue: function () {
                }
              }
            })])
        };
      }
    })];
  var $_647kpr136jcg89h98 = {
    owner: $_9m9qz3wajcg89g5n.constant(owner$2),
    parts: $_9m9qz3wajcg89g5n.constant(partTypes)
  };

  var builder$2 = function (info) {
    var subs = $_1ep1bp10hjcg89gr1.substitutes($_647kpr136jcg89h98.owner(), info, $_647kpr136jcg89h98.parts());
    var components = $_1ep1bp10hjcg89gr1.components($_647kpr136jcg89h98.owner(), info, subs.internals());
    var focusWidget = function (component) {
      return $_1ep1bp10hjcg89gr1.getPart(component, info, 'widget').map(function (widget) {
        Keying.focusIn(widget);
        return widget;
      });
    };
    var onHorizontalArrow = function (component, simulatedEvent) {
      return $_fkimqmzwjcg89gmv.inside(simulatedEvent.event().target()) ? $_en0sddw9jcg89g5j.none() : function () {
        if (info.autofocus()) {
          simulatedEvent.setSource(component.element());
          return $_en0sddw9jcg89g5j.none();
        } else {
          return $_en0sddw9jcg89g5j.none();
        }
      }();
    };
    return $_5mo1ztwxjcg89g7j.deepMerge({
      dom: info.dom(),
      components: components,
      domModification: info.domModification(),
      events: $_1hggxlw5jcg89g4s.derive([
        $_1hggxlw5jcg89g4s.runOnExecute(function (component, simulatedEvent) {
          focusWidget(component).each(function (widget) {
            simulatedEvent.stop();
          });
        }),
        $_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.mouseover(), $_8eromn133jcg89h8o.onHover),
        $_1hggxlw5jcg89g4s.run($_f1ifvdwvjcg89g7a.focusItem(), function (component, simulatedEvent) {
          if (info.autofocus())
            focusWidget(component);
          else
            Focusing.focus(component);
        })
      ]),
      behaviours: $_eid12yw3jcg89g3y.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        }),
        Focusing.config({
          onFocus: function (component) {
            $_8eromn133jcg89h8o.onFocus(component);
          }
        }),
        Keying.config({
          mode: 'special',
          onLeft: onHorizontalArrow,
          onRight: onHorizontalArrow,
          onEscape: function (component, simulatedEvent) {
            if (!Focusing.isFocused(component) && !info.autofocus()) {
              Focusing.focus(component);
              return $_en0sddw9jcg89g5j.some(true);
            } else if (info.autofocus()) {
              simulatedEvent.setSource(component.element());
              return $_en0sddw9jcg89g5j.none();
            } else {
              return $_en0sddw9jcg89g5j.none();
            }
          }
        })
      ])
    });
  };
  var schema$13 = [
    $_76kfpx1jcg89g86.strict('uid'),
    $_76kfpx1jcg89g86.strict('data'),
    $_76kfpx1jcg89g86.strict('components'),
    $_76kfpx1jcg89g86.strict('dom'),
    $_76kfpx1jcg89g86.defaulted('autofocus', false),
    $_76kfpx1jcg89g86.defaulted('domModification', {}),
    $_1ep1bp10hjcg89gr1.defaultUidsSchema($_647kpr136jcg89h98.parts()),
    $_czln55ysjcg89ggs.output('builder', builder$2)
  ];

  var itemSchema$1 = $_51tzzcxgjcg89gax.choose('type', {
    widget: schema$13,
    item: schema$11,
    separator: schema$12
  });
  var configureGrid = function (detail, movementInfo) {
    return {
      mode: 'flatgrid',
      selector: '.' + detail.markers().item(),
      initSize: {
        numColumns: movementInfo.initSize().numColumns(),
        numRows: movementInfo.initSize().numRows()
      },
      focusManager: detail.focusManager()
    };
  };
  var configureMenu = function (detail, movementInfo) {
    return {
      mode: 'menu',
      selector: '.' + detail.markers().item(),
      moveOnTab: movementInfo.moveOnTab(),
      focusManager: detail.focusManager()
    };
  };
  var parts = [$_7yfrc10jjcg89gro.group({
      factory: {
        sketch: function (spec) {
          var itemInfo = $_51tzzcxgjcg89gax.asStructOrDie('menu.spec item', itemSchema$1, spec);
          return itemInfo.builder()(itemInfo);
        }
      },
      name: 'items',
      unit: 'item',
      defaults: function (detail, u) {
        var fallbackUid = $_fxeraw10ljcg89gsg.generate('');
        return $_5mo1ztwxjcg89g7j.deepMerge({ uid: fallbackUid }, u);
      },
      overrides: function (detail, u) {
        return {
          type: u.type,
          ignoreFocus: detail.fakeFocus(),
          domModification: { classes: [detail.markers().item()] }
        };
      }
    })];
  var schema$10 = [
    $_76kfpx1jcg89g86.strict('value'),
    $_76kfpx1jcg89g86.strict('items'),
    $_76kfpx1jcg89g86.strict('dom'),
    $_76kfpx1jcg89g86.strict('components'),
    $_76kfpx1jcg89g86.defaulted('eventOrder', {}),
    $_dltg8y10cjcg89gq4.field('menuBehaviours', [
      Highlighting,
      me,
      Composing,
      Keying
    ]),
    $_76kfpx1jcg89g86.defaultedOf('movement', {
      mode: 'menu',
      moveOnTab: true
    }, $_51tzzcxgjcg89gax.choose('mode', {
      grid: [
        $_czln55ysjcg89ggs.initSize(),
        $_czln55ysjcg89ggs.output('config', configureGrid)
      ],
      menu: [
        $_76kfpx1jcg89g86.defaulted('moveOnTab', true),
        $_czln55ysjcg89ggs.output('config', configureMenu)
      ]
    })),
    $_czln55ysjcg89ggs.itemMarkers(),
    $_76kfpx1jcg89g86.defaulted('fakeFocus', false),
    $_76kfpx1jcg89g86.defaulted('focusManager', $_7j0m8dzfjcg89gkf.dom()),
    $_czln55ysjcg89ggs.onHandler('onHighlight')
  ];
  var $_ypzn7131jcg89h86 = {
    name: $_9m9qz3wajcg89g5n.constant('Menu'),
    schema: $_9m9qz3wajcg89g5n.constant(schema$10),
    parts: $_9m9qz3wajcg89g5n.constant(parts)
  };

  var focusEvent$1 = 'alloy.menu-focus';
  var $_eq8py0138jcg89h9j = { focus: $_9m9qz3wajcg89g5n.constant(focusEvent$1) };

  var make$2 = function (detail, components, spec, externals) {
    return $_5mo1ztwxjcg89g7j.deepMerge({
      dom: $_5mo1ztwxjcg89g7j.deepMerge(detail.dom(), { attributes: { role: 'menu' } }),
      uid: detail.uid(),
      behaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive([
        Highlighting.config({
          highlightClass: detail.markers().selectedItem(),
          itemClass: detail.markers().item(),
          onHighlight: detail.onHighlight()
        }),
        me.config({
          store: {
            mode: 'memory',
            initialValue: detail.value()
          }
        }),
        Composing.config({ find: $_9m9qz3wajcg89g5n.identity }),
        Keying.config(detail.movement().config()(detail, detail.movement()))
      ]), $_dltg8y10cjcg89gq4.get(detail.menuBehaviours())),
      events: $_1hggxlw5jcg89g4s.derive([
        $_1hggxlw5jcg89g4s.run($_8eromn133jcg89h8o.focus(), function (menu, simulatedEvent) {
          var event = simulatedEvent.event();
          menu.getSystem().getByDom(event.target()).each(function (item) {
            Highlighting.highlight(menu, item);
            simulatedEvent.stop();
            $_fpm2ctwujcg89g73.emitWith(menu, $_eq8py0138jcg89h9j.focus(), {
              menu: menu,
              item: item
            });
          });
        }),
        $_1hggxlw5jcg89g4s.run($_8eromn133jcg89h8o.hover(), function (menu, simulatedEvent) {
          var item = simulatedEvent.event().item();
          Highlighting.highlight(menu, item);
        })
      ]),
      components: components,
      eventOrder: detail.eventOrder()
    });
  };
  var $_e9o1gn137jcg89h9d = { make: make$2 };

  var Menu = $_168cxl10djcg89gq9.composite({
    name: 'Menu',
    configFields: $_ypzn7131jcg89h86.schema(),
    partFields: $_ypzn7131jcg89h86.parts(),
    factory: $_e9o1gn137jcg89h9d.make
  });

  var preserve$2 = function (f, container) {
    var ownerDoc = $_3ndsgfy2jcg89gdr.owner(container);
    var refocus = $_72ito4yfjcg89gf5.active(ownerDoc).bind(function (focused) {
      var hasFocus = function (elem) {
        return $_n5s8aw7jcg89g53.eq(focused, elem);
      };
      return hasFocus(container) ? $_en0sddw9jcg89g5j.some(container) : $_f4g77pyhjcg89gfa.descendant(container, hasFocus);
    });
    var result = f(container);
    refocus.each(function (oldFocus) {
      $_72ito4yfjcg89gf5.active(ownerDoc).filter(function (newFocus) {
        return $_n5s8aw7jcg89g53.eq(newFocus, oldFocus);
      }).orThunk(function () {
        $_72ito4yfjcg89gf5.focus(oldFocus);
      });
    });
    return result;
  };
  var $_41wwwt13cjcg89h9x = { preserve: preserve$2 };

  var set$7 = function (component, replaceConfig, replaceState, data) {
    $_d31i57y0jcg89gd5.detachChildren(component);
    $_41wwwt13cjcg89h9x.preserve(function () {
      var children = $_89wx8cw8jcg89g5d.map(data, component.getSystem().build);
      $_89wx8cw8jcg89g5d.each(children, function (l) {
        $_d31i57y0jcg89gd5.attach(component, l);
      });
    }, component.element());
  };
  var insert = function (component, replaceConfig, insertion, childSpec) {
    var child = component.getSystem().build(childSpec);
    $_d31i57y0jcg89gd5.attachWith(component, child, insertion);
  };
  var append$2 = function (component, replaceConfig, replaceState, appendee) {
    insert(component, replaceConfig, $_dhkjply1jcg89gdi.append, appendee);
  };
  var prepend$2 = function (component, replaceConfig, replaceState, prependee) {
    insert(component, replaceConfig, $_dhkjply1jcg89gdi.prepend, prependee);
  };
  var remove$7 = function (component, replaceConfig, replaceState, removee) {
    var children = contents(component, replaceConfig);
    var foundChild = $_89wx8cw8jcg89g5d.find(children, function (child) {
      return $_n5s8aw7jcg89g53.eq(removee.element(), child.element());
    });
    foundChild.each($_d31i57y0jcg89gd5.detach);
  };
  var contents = function (component, replaceConfig) {
    return component.components();
  };
  var $_c58ywk13bjcg89h9s = {
    append: append$2,
    prepend: prepend$2,
    remove: remove$7,
    set: set$7,
    contents: contents
  };

  var Replacing = $_eid12yw3jcg89g3y.create({
    fields: [],
    name: 'replacing',
    apis: $_c58ywk13bjcg89h9s
  });

  var transpose = function (obj) {
    return $_gbrpaqwzjcg89g7p.tupleMap(obj, function (v, k) {
      return {
        k: v,
        v: k
      };
    });
  };
  var trace = function (items, byItem, byMenu, finish) {
    return $_b52oxhx5jcg89g9l.readOptFrom(byMenu, finish).bind(function (triggerItem) {
      return $_b52oxhx5jcg89g9l.readOptFrom(items, triggerItem).bind(function (triggerMenu) {
        var rest = trace(items, byItem, byMenu, triggerMenu);
        return $_en0sddw9jcg89g5j.some([triggerMenu].concat(rest));
      });
    }).getOr([]);
  };
  var generate$5 = function (menus, expansions) {
    var items = {};
    $_gbrpaqwzjcg89g7p.each(menus, function (menuItems, menu) {
      $_89wx8cw8jcg89g5d.each(menuItems, function (item) {
        items[item] = menu;
      });
    });
    var byItem = expansions;
    var byMenu = transpose(expansions);
    var menuPaths = $_gbrpaqwzjcg89g7p.map(byMenu, function (triggerItem, submenu) {
      return [submenu].concat(trace(items, byItem, byMenu, submenu));
    });
    return $_gbrpaqwzjcg89g7p.map(items, function (path) {
      return $_b52oxhx5jcg89g9l.readOptFrom(menuPaths, path).getOr([path]);
    });
  };
  var $_20ddyc13fjcg89hbe = { generate: generate$5 };

  var LayeredState = function () {
    var expansions = Cell({});
    var menus = Cell({});
    var paths = Cell({});
    var primary = Cell($_en0sddw9jcg89g5j.none());
    var toItemValues = Cell($_9m9qz3wajcg89g5n.constant([]));
    var clear = function () {
      expansions.set({});
      menus.set({});
      paths.set({});
      primary.set($_en0sddw9jcg89g5j.none());
    };
    var isClear = function () {
      return primary.get().isNone();
    };
    var setContents = function (sPrimary, sMenus, sExpansions, sToItemValues) {
      primary.set($_en0sddw9jcg89g5j.some(sPrimary));
      expansions.set(sExpansions);
      menus.set(sMenus);
      toItemValues.set(sToItemValues);
      var menuValues = sToItemValues(sMenus);
      var sPaths = $_20ddyc13fjcg89hbe.generate(menuValues, sExpansions);
      paths.set(sPaths);
    };
    var expand = function (itemValue) {
      return $_b52oxhx5jcg89g9l.readOptFrom(expansions.get(), itemValue).map(function (menu) {
        var current = $_b52oxhx5jcg89g9l.readOptFrom(paths.get(), itemValue).getOr([]);
        return [menu].concat(current);
      });
    };
    var collapse = function (itemValue) {
      return $_b52oxhx5jcg89g9l.readOptFrom(paths.get(), itemValue).bind(function (path) {
        return path.length > 1 ? $_en0sddw9jcg89g5j.some(path.slice(1)) : $_en0sddw9jcg89g5j.none();
      });
    };
    var refresh = function (itemValue) {
      return $_b52oxhx5jcg89g9l.readOptFrom(paths.get(), itemValue);
    };
    var lookupMenu = function (menuValue) {
      return $_b52oxhx5jcg89g9l.readOptFrom(menus.get(), menuValue);
    };
    var otherMenus = function (path) {
      var menuValues = toItemValues.get()(menus.get());
      return $_89wx8cw8jcg89g5d.difference($_gbrpaqwzjcg89g7p.keys(menuValues), path);
    };
    var getPrimary = function () {
      return primary.get().bind(lookupMenu);
    };
    var getMenus = function () {
      return menus.get();
    };
    return {
      setContents: setContents,
      expand: expand,
      refresh: refresh,
      collapse: collapse,
      lookupMenu: lookupMenu,
      otherMenus: otherMenus,
      getPrimary: getPrimary,
      getMenus: getMenus,
      clear: clear,
      isClear: isClear
    };
  };

  var make$3 = function (detail, rawUiSpec) {
    var buildMenus = function (container, menus) {
      return $_gbrpaqwzjcg89g7p.map(menus, function (spec, name) {
        var data = Menu.sketch($_5mo1ztwxjcg89g7j.deepMerge(spec, {
          value: name,
          items: spec.items,
          markers: $_b52oxhx5jcg89g9l.narrow(rawUiSpec.markers, [
            'item',
            'selectedItem'
          ]),
          fakeFocus: detail.fakeFocus(),
          onHighlight: detail.onHighlight(),
          focusManager: detail.fakeFocus() ? $_7j0m8dzfjcg89gkf.highlights() : $_7j0m8dzfjcg89gkf.dom()
        }));
        return container.getSystem().build(data);
      });
    };
    var state = LayeredState();
    var setup = function (container) {
      var componentMap = buildMenus(container, detail.data().menus());
      state.setContents(detail.data().primary(), componentMap, detail.data().expansions(), function (sMenus) {
        return toMenuValues(container, sMenus);
      });
      return state.getPrimary();
    };
    var getItemValue = function (item) {
      return me.getValue(item).value;
    };
    var toMenuValues = function (container, sMenus) {
      return $_gbrpaqwzjcg89g7p.map(detail.data().menus(), function (data, menuName) {
        return $_89wx8cw8jcg89g5d.bind(data.items, function (item) {
          return item.type === 'separator' ? [] : [item.data.value];
        });
      });
    };
    var setActiveMenu = function (container, menu) {
      Highlighting.highlight(container, menu);
      Highlighting.getHighlighted(menu).orThunk(function () {
        return Highlighting.getFirst(menu);
      }).each(function (item) {
        $_fpm2ctwujcg89g73.dispatch(container, item.element(), $_f1ifvdwvjcg89g7a.focusItem());
      });
    };
    var getMenus = function (state, menuValues) {
      return $_crwoiuydjcg89gf3.cat($_89wx8cw8jcg89g5d.map(menuValues, state.lookupMenu));
    };
    var updateMenuPath = function (container, state, path) {
      return $_en0sddw9jcg89g5j.from(path[0]).bind(state.lookupMenu).map(function (activeMenu) {
        var rest = getMenus(state, path.slice(1));
        $_89wx8cw8jcg89g5d.each(rest, function (r) {
          $_bhzm7gxtjcg89gcg.add(r.element(), detail.markers().backgroundMenu());
        });
        if (!$_c2mv10y6jcg89gec.inBody(activeMenu.element())) {
          Replacing.append(container, $_at4sh212jjcg89h46.premade(activeMenu));
        }
        $_3a6uq212xjcg89h7v.remove(activeMenu.element(), [detail.markers().backgroundMenu()]);
        setActiveMenu(container, activeMenu);
        var others = getMenus(state, state.otherMenus(path));
        $_89wx8cw8jcg89g5d.each(others, function (o) {
          $_3a6uq212xjcg89h7v.remove(o.element(), [detail.markers().backgroundMenu()]);
          if (!detail.stayInDom())
            Replacing.remove(container, o);
        });
        return activeMenu;
      });
    };
    var expandRight = function (container, item) {
      var value = getItemValue(item);
      return state.expand(value).bind(function (path) {
        $_en0sddw9jcg89g5j.from(path[0]).bind(state.lookupMenu).each(function (activeMenu) {
          if (!$_c2mv10y6jcg89gec.inBody(activeMenu.element())) {
            Replacing.append(container, $_at4sh212jjcg89h46.premade(activeMenu));
          }
          detail.onOpenSubmenu()(container, item, activeMenu);
          Highlighting.highlightFirst(activeMenu);
        });
        return updateMenuPath(container, state, path);
      });
    };
    var collapseLeft = function (container, item) {
      var value = getItemValue(item);
      return state.collapse(value).bind(function (path) {
        return updateMenuPath(container, state, path).map(function (activeMenu) {
          detail.onCollapseMenu()(container, item, activeMenu);
          return activeMenu;
        });
      });
    };
    var updateView = function (container, item) {
      var value = getItemValue(item);
      return state.refresh(value).bind(function (path) {
        return updateMenuPath(container, state, path);
      });
    };
    var onRight = function (container, item) {
      return $_fkimqmzwjcg89gmv.inside(item.element()) ? $_en0sddw9jcg89g5j.none() : expandRight(container, item);
    };
    var onLeft = function (container, item) {
      return $_fkimqmzwjcg89gmv.inside(item.element()) ? $_en0sddw9jcg89g5j.none() : collapseLeft(container, item);
    };
    var onEscape = function (container, item) {
      return collapseLeft(container, item).orThunk(function () {
        return detail.onEscape()(container, item);
      });
    };
    var keyOnItem = function (f) {
      return function (container, simulatedEvent) {
        return $_5rph7vzljcg89gl5.closest(simulatedEvent.getSource(), '.' + detail.markers().item()).bind(function (target) {
          return container.getSystem().getByDom(target).bind(function (item) {
            return f(container, item);
          });
        });
      };
    };
    var events = $_1hggxlw5jcg89g4s.derive([
      $_1hggxlw5jcg89g4s.run($_eq8py0138jcg89h9j.focus(), function (sandbox, simulatedEvent) {
        var menu = simulatedEvent.event().menu();
        Highlighting.highlight(sandbox, menu);
      }),
      $_1hggxlw5jcg89g4s.runOnExecute(function (sandbox, simulatedEvent) {
        var target = simulatedEvent.event().target();
        return sandbox.getSystem().getByDom(target).bind(function (item) {
          var itemValue = getItemValue(item);
          if (itemValue.indexOf('collapse-item') === 0) {
            return collapseLeft(sandbox, item);
          }
          return expandRight(sandbox, item).orThunk(function () {
            return detail.onExecute()(sandbox, item);
          });
        });
      }),
      $_1hggxlw5jcg89g4s.runOnAttached(function (container, simulatedEvent) {
        setup(container).each(function (primary) {
          Replacing.append(container, $_at4sh212jjcg89h46.premade(primary));
          if (detail.openImmediately()) {
            setActiveMenu(container, primary);
            detail.onOpenMenu()(container, primary);
          }
        });
      })
    ].concat(detail.navigateOnHover() ? [$_1hggxlw5jcg89g4s.run($_8eromn133jcg89h8o.hover(), function (sandbox, simulatedEvent) {
        var item = simulatedEvent.event().item();
        updateView(sandbox, item);
        expandRight(sandbox, item);
        detail.onHover()(sandbox, item);
      })] : []));
    var collapseMenuApi = function (container) {
      Highlighting.getHighlighted(container).each(function (currentMenu) {
        Highlighting.getHighlighted(currentMenu).each(function (currentItem) {
          collapseLeft(container, currentItem);
        });
      });
    };
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive([
        Keying.config({
          mode: 'special',
          onRight: keyOnItem(onRight),
          onLeft: keyOnItem(onLeft),
          onEscape: keyOnItem(onEscape),
          focusIn: function (container, keyInfo) {
            state.getPrimary().each(function (primary) {
              $_fpm2ctwujcg89g73.dispatch(container, primary.element(), $_f1ifvdwvjcg89g7a.focusItem());
            });
          }
        }),
        Highlighting.config({
          highlightClass: detail.markers().selectedMenu(),
          itemClass: detail.markers().menu()
        }),
        Composing.config({
          find: function (container) {
            return Highlighting.getHighlighted(container);
          }
        }),
        Replacing.config({})
      ]), $_dltg8y10cjcg89gq4.get(detail.tmenuBehaviours())),
      eventOrder: detail.eventOrder(),
      apis: { collapseMenu: collapseMenuApi },
      events: events
    };
  };
  var $_82wflr13djcg89haa = {
    make: make$3,
    collapseItem: $_9m9qz3wajcg89g5n.constant('collapse-item')
  };

  var tieredData = function (primary, menus, expansions) {
    return {
      primary: primary,
      menus: menus,
      expansions: expansions
    };
  };
  var singleData = function (name, menu) {
    return {
      primary: name,
      menus: $_b52oxhx5jcg89g9l.wrap(name, menu),
      expansions: {}
    };
  };
  var collapseItem = function (text) {
    return {
      value: $_302rtc10fjcg89gqt.generate($_82wflr13djcg89haa.collapseItem()),
      text: text
    };
  };
  var TieredMenu = $_168cxl10djcg89gq9.single({
    name: 'TieredMenu',
    configFields: [
      $_czln55ysjcg89ggs.onStrictKeyboardHandler('onExecute'),
      $_czln55ysjcg89ggs.onStrictKeyboardHandler('onEscape'),
      $_czln55ysjcg89ggs.onStrictHandler('onOpenMenu'),
      $_czln55ysjcg89ggs.onStrictHandler('onOpenSubmenu'),
      $_czln55ysjcg89ggs.onHandler('onCollapseMenu'),
      $_76kfpx1jcg89g86.defaulted('openImmediately', true),
      $_76kfpx1jcg89g86.strictObjOf('data', [
        $_76kfpx1jcg89g86.strict('primary'),
        $_76kfpx1jcg89g86.strict('menus'),
        $_76kfpx1jcg89g86.strict('expansions')
      ]),
      $_76kfpx1jcg89g86.defaulted('fakeFocus', false),
      $_czln55ysjcg89ggs.onHandler('onHighlight'),
      $_czln55ysjcg89ggs.onHandler('onHover'),
      $_czln55ysjcg89ggs.tieredMenuMarkers(),
      $_76kfpx1jcg89g86.strict('dom'),
      $_76kfpx1jcg89g86.defaulted('navigateOnHover', true),
      $_76kfpx1jcg89g86.defaulted('stayInDom', false),
      $_dltg8y10cjcg89gq4.field('tmenuBehaviours', [
        Keying,
        Highlighting,
        Composing,
        Replacing
      ]),
      $_76kfpx1jcg89g86.defaulted('eventOrder', {})
    ],
    apis: {
      collapseMenu: function (apis, tmenu) {
        apis.collapseMenu(tmenu);
      }
    },
    factory: $_82wflr13djcg89haa.make,
    extraApis: {
      tieredData: tieredData,
      singleData: singleData,
      collapseItem: collapseItem
    }
  });

  var scrollable = $_452cgoz0jcg89gid.resolve('scrollable');
  var register$1 = function (element) {
    $_bhzm7gxtjcg89gcg.add(element, scrollable);
  };
  var deregister = function (element) {
    $_bhzm7gxtjcg89gcg.remove(element, scrollable);
  };
  var $_apsj7a13gjcg89hbq = {
    register: register$1,
    deregister: deregister,
    scrollable: $_9m9qz3wajcg89g5n.constant(scrollable)
  };

  var getValue$4 = function (item) {
    return $_b52oxhx5jcg89g9l.readOptFrom(item, 'format').getOr(item.title);
  };
  var convert$1 = function (formats, memMenuThunk) {
    var mainMenu = makeMenu('Styles', [].concat($_89wx8cw8jcg89g5d.map(formats.items, function (k) {
      return makeItem(getValue$4(k), k.title, k.isSelected(), k.getPreview(), $_b52oxhx5jcg89g9l.hasKey(formats.expansions, getValue$4(k)));
    })), memMenuThunk, false);
    var submenus = $_gbrpaqwzjcg89g7p.map(formats.menus, function (menuItems, menuName) {
      var items = $_89wx8cw8jcg89g5d.map(menuItems, function (item) {
        return makeItem(getValue$4(item), item.title, item.isSelected !== undefined ? item.isSelected() : false, item.getPreview !== undefined ? item.getPreview() : '', $_b52oxhx5jcg89g9l.hasKey(formats.expansions, getValue$4(item)));
      });
      return makeMenu(menuName, items, memMenuThunk, true);
    });
    var menus = $_5mo1ztwxjcg89g7j.deepMerge(submenus, $_b52oxhx5jcg89g9l.wrap('styles', mainMenu));
    var tmenu = TieredMenu.tieredData('styles', menus, formats.expansions);
    return { tmenu: tmenu };
  };
  var makeItem = function (value, text, selected, preview, isMenu) {
    return {
      data: {
        value: value,
        text: text
      },
      type: 'item',
      dom: {
        tag: 'div',
        classes: isMenu ? [$_452cgoz0jcg89gid.resolve('styles-item-is-menu')] : []
      },
      toggling: {
        toggleOnExecute: false,
        toggleClass: $_452cgoz0jcg89gid.resolve('format-matches'),
        selected: selected
      },
      itemBehaviours: $_eid12yw3jcg89g3y.derive(isMenu ? [] : [$_8qmhfpyzjcg89gi8.format(value, function (comp, status) {
          var toggle = status ? Toggling.on : Toggling.off;
          toggle(comp);
        })]),
      components: [{
          dom: {
            tag: 'div',
            attributes: { style: preview },
            innerHtml: text
          }
        }]
    };
  };
  var makeMenu = function (value, items, memMenuThunk, collapsable) {
    return {
      value: value,
      dom: { tag: 'div' },
      components: [
        Button.sketch({
          dom: {
            tag: 'div',
            classes: [$_452cgoz0jcg89gid.resolve('styles-collapser')]
          },
          components: collapsable ? [
            {
              dom: {
                tag: 'span',
                classes: [$_452cgoz0jcg89gid.resolve('styles-collapse-icon')]
              }
            },
            $_at4sh212jjcg89h46.text(value)
          ] : [$_at4sh212jjcg89h46.text(value)],
          action: function (item) {
            if (collapsable) {
              var comp = memMenuThunk().get(item);
              TieredMenu.collapseMenu(comp);
            }
          }
        }),
        {
          dom: {
            tag: 'div',
            classes: [$_452cgoz0jcg89gid.resolve('styles-menu-items-container')]
          },
          components: [Menu.parts().items({})],
          behaviours: $_eid12yw3jcg89g3y.derive([$_fqydj611rjcg89gzb.config('adhoc-scrollable-menu', [
              $_1hggxlw5jcg89g4s.runOnAttached(function (component, simulatedEvent) {
                $_17fn7izrjcg89glz.set(component.element(), 'overflow-y', 'auto');
                $_17fn7izrjcg89glz.set(component.element(), '-webkit-overflow-scrolling', 'touch');
                $_apsj7a13gjcg89hbq.register(component.element());
              }),
              $_1hggxlw5jcg89g4s.runOnDetached(function (component) {
                $_17fn7izrjcg89glz.remove(component.element(), 'overflow-y');
                $_17fn7izrjcg89glz.remove(component.element(), '-webkit-overflow-scrolling');
                $_apsj7a13gjcg89hbq.deregister(component.element());
              })
            ])])
        }
      ],
      items: items,
      menuBehaviours: $_eid12yw3jcg89g3y.derive([Transitioning.config({
          initialState: 'after',
          routes: Transitioning.createTristate('before', 'current', 'after', {
            transition: {
              property: 'transform',
              transitionClass: 'transitioning'
            }
          })
        })])
    };
  };
  var sketch$9 = function (settings) {
    var dataset = convert$1(settings.formats, function () {
      return memMenu;
    });
    var memMenu = $_g1tn4l11djcg89gxd.record(TieredMenu.sketch({
      dom: {
        tag: 'div',
        classes: [$_452cgoz0jcg89gid.resolve('styles-menu')]
      },
      components: [],
      fakeFocus: true,
      stayInDom: true,
      onExecute: function (tmenu, item) {
        var v = me.getValue(item);
        settings.handle(item, v.value);
      },
      onEscape: function () {
      },
      onOpenMenu: function (container, menu) {
        var w = $_bikzj9116jcg89gw3.get(container.element());
        $_bikzj9116jcg89gw3.set(menu.element(), w);
        Transitioning.jumpTo(menu, 'current');
      },
      onOpenSubmenu: function (container, item, submenu) {
        var w = $_bikzj9116jcg89gw3.get(container.element());
        var menu = $_5rph7vzljcg89gl5.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var menuComp = container.getSystem().getByDom(menu).getOrDie();
        $_bikzj9116jcg89gw3.set(submenu.element(), w);
        Transitioning.progressTo(menuComp, 'before');
        Transitioning.jumpTo(submenu, 'after');
        Transitioning.progressTo(submenu, 'current');
      },
      onCollapseMenu: function (container, item, menu) {
        var submenu = $_5rph7vzljcg89gl5.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var submenuComp = container.getSystem().getByDom(submenu).getOrDie();
        Transitioning.progressTo(submenuComp, 'after');
        Transitioning.progressTo(menu, 'current');
      },
      navigateOnHover: false,
      openImmediately: true,
      data: dataset.tmenu,
      markers: {
        backgroundMenu: $_452cgoz0jcg89gid.resolve('styles-background-menu'),
        menu: $_452cgoz0jcg89gid.resolve('styles-menu'),
        selectedMenu: $_452cgoz0jcg89gid.resolve('styles-selected-menu'),
        item: $_452cgoz0jcg89gid.resolve('styles-item'),
        selectedItem: $_452cgoz0jcg89gid.resolve('styles-selected-item')
      }
    }));
    return memMenu.asSpec();
  };
  var $_3dbsl012ejcg89h2u = { sketch: sketch$9 };

  var getFromExpandingItem = function (item) {
    var newItem = $_5mo1ztwxjcg89g7j.deepMerge($_b52oxhx5jcg89g9l.exclude(item, ['items']), { menu: true });
    var rest = expand(item.items);
    var newMenus = $_5mo1ztwxjcg89g7j.deepMerge(rest.menus, $_b52oxhx5jcg89g9l.wrap(item.title, rest.items));
    var newExpansions = $_5mo1ztwxjcg89g7j.deepMerge(rest.expansions, $_b52oxhx5jcg89g9l.wrap(item.title, item.title));
    return {
      item: newItem,
      menus: newMenus,
      expansions: newExpansions
    };
  };
  var getFromItem = function (item) {
    return $_b52oxhx5jcg89g9l.hasKey(item, 'items') ? getFromExpandingItem(item) : {
      item: item,
      menus: {},
      expansions: {}
    };
  };
  var expand = function (items) {
    return $_89wx8cw8jcg89g5d.foldr(items, function (acc, item) {
      var newData = getFromItem(item);
      return {
        menus: $_5mo1ztwxjcg89g7j.deepMerge(acc.menus, newData.menus),
        items: [newData.item].concat(acc.items),
        expansions: $_5mo1ztwxjcg89g7j.deepMerge(acc.expansions, newData.expansions)
      };
    }, {
      menus: {},
      expansions: {},
      items: []
    });
  };
  var $_dt1jw13hjcg89hbu = { expand: expand };

  var register = function (editor, settings) {
    var isSelectedFor = function (format) {
      return function () {
        return editor.formatter.match(format);
      };
    };
    var getPreview = function (format) {
      return function () {
        var styles = editor.formatter.getCssText(format);
        return styles;
      };
    };
    var enrichSupported = function (item) {
      return $_5mo1ztwxjcg89g7j.deepMerge(item, {
        isSelected: isSelectedFor(item.format),
        getPreview: getPreview(item.format)
      });
    };
    var enrichMenu = function (item) {
      return $_5mo1ztwxjcg89g7j.deepMerge(item, {
        isSelected: $_9m9qz3wajcg89g5n.constant(false),
        getPreview: $_9m9qz3wajcg89g5n.constant('')
      });
    };
    var enrichCustom = function (item) {
      var formatName = $_302rtc10fjcg89gqt.generate(item.title);
      var newItem = $_5mo1ztwxjcg89g7j.deepMerge(item, {
        format: formatName,
        isSelected: isSelectedFor(formatName),
        getPreview: getPreview(formatName)
      });
      editor.formatter.register(formatName, newItem);
      return newItem;
    };
    var formats = $_b52oxhx5jcg89g9l.readOptFrom(settings, 'style_formats').getOr(DefaultStyleFormats);
    var doEnrich = function (items) {
      return $_89wx8cw8jcg89g5d.map(items, function (item) {
        if ($_b52oxhx5jcg89g9l.hasKey(item, 'items')) {
          var newItems = doEnrich(item.items);
          return $_5mo1ztwxjcg89g7j.deepMerge(enrichMenu(item), { items: newItems });
        } else if ($_b52oxhx5jcg89g9l.hasKey(item, 'format')) {
          return enrichSupported(item);
        } else {
          return enrichCustom(item);
        }
      });
    };
    return doEnrich(formats);
  };
  var prune = function (editor, formats) {
    var doPrune = function (items) {
      return $_89wx8cw8jcg89g5d.bind(items, function (item) {
        if (item.items !== undefined) {
          var newItems = doPrune(item.items);
          return newItems.length > 0 ? [item] : [];
        } else {
          var keep = $_b52oxhx5jcg89g9l.hasKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
          return keep ? [item] : [];
        }
      });
    };
    var prunedItems = doPrune(formats);
    return $_dt1jw13hjcg89hbu.expand(prunedItems);
  };
  var ui = function (editor, formats, onDone) {
    var pruned = prune(editor, formats);
    return $_3dbsl012ejcg89h2u.sketch({
      formats: pruned,
      handle: function (item, value) {
        editor.undoManager.transact(function () {
          if (Toggling.isOn(item)) {
            editor.formatter.remove(value);
          } else {
            editor.formatter.apply(value);
          }
        });
        onDone();
      }
    });
  };
  var $_8peqff12cjcg89h2m = {
    register: register,
    ui: ui
  };

  var defaults = [
    'undo',
    'bold',
    'italic',
    'link',
    'image',
    'bullist',
    'styleselect'
  ];
  var extract$1 = function (rawToolbar) {
    var toolbar = rawToolbar.replace(/\|/g, ' ').trim();
    return toolbar.length > 0 ? toolbar.split(/\s+/) : [];
  };
  var identifyFromArray = function (toolbar) {
    return $_89wx8cw8jcg89g5d.bind(toolbar, function (item) {
      return $_405i8jwyjcg89g7l.isArray(item) ? identifyFromArray(item) : extract$1(item);
    });
  };
  var identify = function (settings) {
    var toolbar = settings.toolbar !== undefined ? settings.toolbar : defaults;
    return $_405i8jwyjcg89g7l.isArray(toolbar) ? identifyFromArray(toolbar) : extract$1(toolbar);
  };
  var setup = function (realm, editor) {
    var commandSketch = function (name) {
      return function () {
        return $_5sd8nuz1jcg89gih.forToolbarCommand(editor, name);
      };
    };
    var stateCommandSketch = function (name) {
      return function () {
        return $_5sd8nuz1jcg89gih.forToolbarStateCommand(editor, name);
      };
    };
    var actionSketch = function (name, query, action) {
      return function () {
        return $_5sd8nuz1jcg89gih.forToolbarStateAction(editor, name, query, action);
      };
    };
    var undo = commandSketch('undo');
    var redo = commandSketch('redo');
    var bold = stateCommandSketch('bold');
    var italic = stateCommandSketch('italic');
    var underline = stateCommandSketch('underline');
    var removeformat = commandSketch('removeformat');
    var link = function () {
      return $_f6oljf11njcg89gyf.sketch(realm, editor);
    };
    var unlink = actionSketch('unlink', 'link', function () {
      editor.execCommand('unlink', null, false);
    });
    var image = function () {
      return $_aakudd11cjcg89gx1.sketch(editor);
    };
    var bullist = actionSketch('unordered-list', 'ul', function () {
      editor.execCommand('InsertUnorderedList', null, false);
    });
    var numlist = actionSketch('ordered-list', 'ol', function () {
      editor.execCommand('InsertOrderedList', null, false);
    });
    var fontsizeselect = function () {
      return $_difehr118jcg89gw7.sketch(realm, editor);
    };
    var forecolor = function () {
      return $_1fp4kf10rjcg89gu1.sketch(realm, editor);
    };
    var styleFormats = $_8peqff12cjcg89h2m.register(editor, editor.settings);
    var styleFormatsMenu = function () {
      return $_8peqff12cjcg89h2m.ui(editor, styleFormats, function () {
        editor.fire('scrollIntoView');
      });
    };
    var styleselect = function () {
      return $_5sd8nuz1jcg89gih.forToolbar('style-formats', function (button) {
        editor.fire('toReading');
        realm.dropup().appear(styleFormatsMenu, Toggling.on, button);
      }, $_eid12yw3jcg89g3y.derive([
        Toggling.config({
          toggleClass: $_452cgoz0jcg89gid.resolve('toolbar-button-selected'),
          toggleOnExecute: false,
          aria: { mode: 'pressed' }
        }),
        Receiving.config({
          channels: $_b52oxhx5jcg89g9l.wrapAll([
            $_8qmhfpyzjcg89gi8.receive($_3fc8hyynjcg89gfx.orientationChanged(), Toggling.off),
            $_8qmhfpyzjcg89gi8.receive($_3fc8hyynjcg89gfx.dropupDismissed(), Toggling.off)
          ])
        })
      ]));
    };
    var feature = function (prereq, sketch) {
      return {
        isSupported: function () {
          return prereq.forall(function (p) {
            return $_b52oxhx5jcg89g9l.hasKey(editor.buttons, p);
          });
        },
        sketch: sketch
      };
    };
    return {
      undo: feature($_en0sddw9jcg89g5j.none(), undo),
      redo: feature($_en0sddw9jcg89g5j.none(), redo),
      bold: feature($_en0sddw9jcg89g5j.none(), bold),
      italic: feature($_en0sddw9jcg89g5j.none(), italic),
      underline: feature($_en0sddw9jcg89g5j.none(), underline),
      removeformat: feature($_en0sddw9jcg89g5j.none(), removeformat),
      link: feature($_en0sddw9jcg89g5j.none(), link),
      unlink: feature($_en0sddw9jcg89g5j.none(), unlink),
      image: feature($_en0sddw9jcg89g5j.none(), image),
      bullist: feature($_en0sddw9jcg89g5j.some('bullist'), bullist),
      numlist: feature($_en0sddw9jcg89g5j.some('numlist'), numlist),
      fontsizeselect: feature($_en0sddw9jcg89g5j.none(), fontsizeselect),
      forecolor: feature($_en0sddw9jcg89g5j.none(), forecolor),
      styleselect: feature($_en0sddw9jcg89g5j.none(), styleselect)
    };
  };
  var detect$4 = function (settings, features) {
    var itemNames = identify(settings);
    var present = {};
    return $_89wx8cw8jcg89g5d.bind(itemNames, function (iName) {
      var r = !$_b52oxhx5jcg89g9l.hasKey(present, iName) && $_b52oxhx5jcg89g9l.hasKey(features, iName) && features[iName].isSupported() ? [features[iName].sketch()] : [];
      present[iName] = true;
      return r;
    });
  };
  var $_3n6dgqyojcg89gg0 = {
    identify: identify,
    setup: setup,
    detect: detect$4
  };

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': $_9m9qz3wajcg89g5n.constant(target),
      'x': $_9m9qz3wajcg89g5n.constant(x),
      'y': $_9m9qz3wajcg89g5n.constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': $_9m9qz3wajcg89g5n.constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = $_a3ihziwsjcg89g6w.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = $_9m9qz3wajcg89g5n.compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: $_9m9qz3wajcg89g5n.curry(unbind, element, event, wrapped, useCapture) };
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
  var $_9vok0l13kjcg89hce = {
    bind: bind$2,
    capture: capture$1
  };

  var filter$1 = $_9m9qz3wajcg89g5n.constant(true);
  var bind$1 = function (element, event, handler) {
    return $_9vok0l13kjcg89hce.bind(element, event, filter$1, handler);
  };
  var capture = function (element, event, handler) {
    return $_9vok0l13kjcg89hce.capture(element, event, filter$1, handler);
  };
  var $_4df9s813jjcg89hcb = {
    bind: bind$1,
    capture: capture
  };

  var INTERVAL = 50;
  var INSURANCE = 1000 / INTERVAL;
  var get$11 = function (outerWindow) {
    var isPortrait = outerWindow.matchMedia('(orientation: portrait)').matches;
    return { isPortrait: $_9m9qz3wajcg89g5n.constant(isPortrait) };
  };
  var getActualWidth = function (outerWindow) {
    var isIos = $_aoftmbwfjcg89g5y.detect().os.isiOS();
    var isPortrait = get$11(outerWindow).isPortrait();
    return isIos && !isPortrait ? outerWindow.screen.height : outerWindow.screen.width;
  };
  var onChange = function (outerWindow, listeners) {
    var win = $_a3ihziwsjcg89g6w.fromDom(outerWindow);
    var poller = null;
    var change = function () {
      clearInterval(poller);
      var orientation = get$11(outerWindow);
      listeners.onChange(orientation);
      onAdjustment(function () {
        listeners.onReady(orientation);
      });
    };
    var orientationHandle = $_4df9s813jjcg89hcb.bind(win, 'orientationchange', change);
    var onAdjustment = function (f) {
      clearInterval(poller);
      var flag = outerWindow.innerHeight;
      var insurance = 0;
      poller = setInterval(function () {
        if (flag !== outerWindow.innerHeight) {
          clearInterval(poller);
          f($_en0sddw9jcg89g5j.some(outerWindow.innerHeight));
        } else if (insurance > INSURANCE) {
          clearInterval(poller);
          f($_en0sddw9jcg89g5j.none());
        }
        insurance++;
      }, INTERVAL);
    };
    var destroy = function () {
      orientationHandle.unbind();
    };
    return {
      onAdjustment: onAdjustment,
      destroy: destroy
    };
  };
  var $_ac8rkn13ijcg89hc3 = {
    get: get$11,
    onChange: onChange,
    getActualWidth: getActualWidth
  };

  var DelayedFunction = function (fun, delay) {
    var ref = null;
    var schedule = function () {
      var args = arguments;
      ref = setTimeout(function () {
        fun.apply(null, args);
        ref = null;
      }, delay);
    };
    var cancel = function () {
      if (ref !== null) {
        clearTimeout(ref);
        ref = null;
      }
    };
    return {
      cancel: cancel,
      schedule: schedule
    };
  };

  var SIGNIFICANT_MOVE = 5;
  var LONGPRESS_DELAY = 400;
  var getTouch = function (event) {
    if (event.raw().touches === undefined || event.raw().touches.length !== 1)
      return $_en0sddw9jcg89g5j.none();
    return $_en0sddw9jcg89g5j.some(event.raw().touches[0]);
  };
  var isFarEnough = function (touch, data) {
    var distX = Math.abs(touch.clientX - data.x());
    var distY = Math.abs(touch.clientY - data.y());
    return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
  };
  var monitor$1 = function (settings) {
    var startData = Cell($_en0sddw9jcg89g5j.none());
    var longpress = DelayedFunction(function (event) {
      startData.set($_en0sddw9jcg89g5j.none());
      settings.triggerEvent($_f1ifvdwvjcg89g7a.longpress(), event);
    }, LONGPRESS_DELAY);
    var handleTouchstart = function (event) {
      getTouch(event).each(function (touch) {
        longpress.cancel();
        var data = {
          x: $_9m9qz3wajcg89g5n.constant(touch.clientX),
          y: $_9m9qz3wajcg89g5n.constant(touch.clientY),
          target: event.target
        };
        longpress.schedule(data);
        startData.set($_en0sddw9jcg89g5j.some(data));
      });
      return $_en0sddw9jcg89g5j.none();
    };
    var handleTouchmove = function (event) {
      longpress.cancel();
      getTouch(event).each(function (touch) {
        startData.get().each(function (data) {
          if (isFarEnough(touch, data))
            startData.set($_en0sddw9jcg89g5j.none());
        });
      });
      return $_en0sddw9jcg89g5j.none();
    };
    var handleTouchend = function (event) {
      longpress.cancel();
      var isSame = function (data) {
        return $_n5s8aw7jcg89g53.eq(data.target(), event.target());
      };
      return startData.get().filter(isSame).map(function (data) {
        return settings.triggerEvent($_f1ifvdwvjcg89g7a.tap(), event);
      });
    };
    var handlers = $_b52oxhx5jcg89g9l.wrapAll([
      {
        key: $_3338ovwwjcg89g7g.touchstart(),
        value: handleTouchstart
      },
      {
        key: $_3338ovwwjcg89g7g.touchmove(),
        value: handleTouchmove
      },
      {
        key: $_3338ovwwjcg89g7g.touchend(),
        value: handleTouchend
      }
    ]);
    var fireIfReady = function (event, type) {
      return $_b52oxhx5jcg89g9l.readOptFrom(handlers, type).bind(function (handler) {
        return handler(event);
      });
    };
    return { fireIfReady: fireIfReady };
  };
  var $_5lsrgd13qjcg89hdq = { monitor: monitor$1 };

  var monitor = function (editorApi) {
    var tapEvent = $_5lsrgd13qjcg89hdq.monitor({
      triggerEvent: function (type, evt) {
        editorApi.onTapContent(evt);
      }
    });
    var onTouchend = function () {
      return $_4df9s813jjcg89hcb.bind(editorApi.body(), 'touchend', function (evt) {
        tapEvent.fireIfReady(evt, 'touchend');
      });
    };
    var onTouchmove = function () {
      return $_4df9s813jjcg89hcb.bind(editorApi.body(), 'touchmove', function (evt) {
        tapEvent.fireIfReady(evt, 'touchmove');
      });
    };
    var fireTouchstart = function (evt) {
      tapEvent.fireIfReady(evt, 'touchstart');
    };
    return {
      fireTouchstart: fireTouchstart,
      onTouchend: onTouchend,
      onTouchmove: onTouchmove
    };
  };
  var $_btaki413pjcg89hdm = { monitor: monitor };

  var isAndroid6 = $_aoftmbwfjcg89g5y.detect().os.version.major >= 6;
  var initEvents = function (editorApi, toolstrip, alloy) {
    var tapping = $_btaki413pjcg89hdm.monitor(editorApi);
    var outerDoc = $_3ndsgfy2jcg89gdr.owner(toolstrip);
    var isRanged = function (sel) {
      return !$_n5s8aw7jcg89g53.eq(sel.start(), sel.finish()) || sel.soffset() !== sel.foffset();
    };
    var hasRangeInUi = function () {
      return $_72ito4yfjcg89gf5.active(outerDoc).filter(function (input) {
        return $_xqscexwjcg89gct.name(input) === 'input';
      }).exists(function (input) {
        return input.dom().selectionStart !== input.dom().selectionEnd;
      });
    };
    var updateMargin = function () {
      var rangeInContent = editorApi.doc().dom().hasFocus() && editorApi.getSelection().exists(isRanged);
      alloy.getByDom(toolstrip).each((rangeInContent || hasRangeInUi()) === true ? Toggling.on : Toggling.off);
    };
    var listeners = [
      $_4df9s813jjcg89hcb.bind(editorApi.body(), 'touchstart', function (evt) {
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_4df9s813jjcg89hcb.bind(toolstrip, 'touchstart', function (evt) {
        editorApi.onTouchToolstrip();
      }),
      editorApi.onToReading(function () {
        $_72ito4yfjcg89gf5.blur(editorApi.body());
      }),
      editorApi.onToEditing($_9m9qz3wajcg89g5n.noop),
      editorApi.onScrollToCursor(function (tinyEvent) {
        tinyEvent.preventDefault();
        editorApi.getCursorBox().each(function (bounds) {
          var cWin = editorApi.win();
          var isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
          var cScrollBy = isOutside ? bounds.bottom() - cWin.innerHeight + 50 : 0;
          if (cScrollBy !== 0) {
            cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
          }
        });
      })
    ].concat(isAndroid6 === true ? [] : [
      $_4df9s813jjcg89hcb.bind($_a3ihziwsjcg89g6w.fromDom(editorApi.win()), 'blur', function () {
        alloy.getByDom(toolstrip).each(Toggling.off);
      }),
      $_4df9s813jjcg89hcb.bind(outerDoc, 'select', updateMargin),
      $_4df9s813jjcg89hcb.bind(editorApi.doc(), 'selectionchange', updateMargin)
    ]);
    var destroy = function () {
      $_89wx8cw8jcg89g5d.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_5v8kvp13ojcg89hd1 = { initEvents: initEvents };

  var autocompleteHack = function () {
    return function (f) {
      setTimeout(function () {
        f();
      }, 0);
    };
  };
  var resume = function (cWin) {
    cWin.focus();
    var iBody = $_a3ihziwsjcg89g6w.fromDom(cWin.document.body);
    var inInput = $_72ito4yfjcg89gf5.active().exists(function (elem) {
      return $_89wx8cw8jcg89g5d.contains([
        'input',
        'textarea'
      ], $_xqscexwjcg89gct.name(elem));
    });
    var transaction = inInput ? autocompleteHack() : $_9m9qz3wajcg89g5n.apply;
    transaction(function () {
      $_72ito4yfjcg89gf5.active().each($_72ito4yfjcg89gf5.blur);
      $_72ito4yfjcg89gf5.focus(iBody);
    });
  };
  var $_9z8ia613tjcg89he5 = { resume: resume };

  var safeParse = function (element, attribute) {
    var parsed = parseInt($_69krbwxvjcg89gck.get(element, attribute), 10);
    return isNaN(parsed) ? 0 : parsed;
  };
  var $_3grge613ujcg89hee = { safeParse: safeParse };

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
        return $_en0sddw9jcg89g5j.none();
      }
    };
    var getOptionSafe = function (element) {
      return is(element) ? $_en0sddw9jcg89g5j.from(element.dom().nodeValue) : $_en0sddw9jcg89g5j.none();
    };
    var browser = $_aoftmbwfjcg89g5y.detect().browser;
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

  var api$3 = NodeValue($_xqscexwjcg89gct.isText, 'text');
  var get$12 = function (element) {
    return api$3.get(element);
  };
  var getOption = function (element) {
    return api$3.getOption(element);
  };
  var set$8 = function (element, value) {
    api$3.set(element, value);
  };
  var $_8949mt13xjcg89het = {
    get: get$12,
    getOption: getOption,
    set: set$8
  };

  var getEnd = function (element) {
    return $_xqscexwjcg89gct.name(element) === 'img' ? 1 : $_8949mt13xjcg89het.getOption(element).fold(function () {
      return $_3ndsgfy2jcg89gdr.children(element).length;
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
    return $_8949mt13xjcg89het.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || $_89wx8cw8jcg89g5d.contains(elementsWithCursorPosition, $_xqscexwjcg89gct.name(elem));
  };
  var $_9gl41i13wjcg89heq = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var adt$4 = $_6nnct0x3jcg89g8q.generate([
    { 'before': ['element'] },
    {
      'on': [
        'element',
        'offset'
      ]
    },
    { after: ['element'] }
  ]);
  var cata = function (subject, onBefore, onOn, onAfter) {
    return subject.fold(onBefore, onOn, onAfter);
  };
  var getStart$1 = function (situ) {
    return situ.fold($_9m9qz3wajcg89g5n.identity, $_9m9qz3wajcg89g5n.identity, $_9m9qz3wajcg89g5n.identity);
  };
  var $_58fuiz140jcg89hf2 = {
    before: adt$4.before,
    on: adt$4.on,
    after: adt$4.after,
    cata: cata,
    getStart: getStart$1
  };

  var type$1 = $_6nnct0x3jcg89g8q.generate([
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
  var range$1 = $_4pc2ltxljcg89gc2.immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$1.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return $_a3ihziwsjcg89g6w.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_58fuiz140jcg89hf2.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart(selection);
    return $_3ndsgfy2jcg89gdr.defaultView(start);
  };
  var $_cups0m13zjcg89hey = {
    domRange: type$1.domRange,
    relative: type$1.relative,
    exact: type$1.exact,
    exactFromRange: exactFromRange,
    range: range$1,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_3ndsgfy2jcg89gdr.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return $_a3ihziwsjcg89g6w.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_n5s8aw7jcg89g53.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_3hckpc142jcg89hf9 = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    $_89wx8cw8jcg89g5d.each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return $_a3ihziwsjcg89g6w.fromDom(fragment);
  };
  var $_6dtmqe143jcg89hfa = { fromElements: fromElements };

  var selectNodeContents = function (win, element) {
    var rng = win.document.createRange();
    selectNodeContentsUsing(rng, element);
    return rng;
  };
  var selectNodeContentsUsing = function (rng, element) {
    rng.selectNodeContents(element.dom());
  };
  var isWithin = function (outerRange, innerRange) {
    return innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 && innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;
  };
  var create$5 = function (win) {
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
    return $_a3ihziwsjcg89g6w.fromDom(fragment);
  };
  var toRect$1 = function (rect) {
    return {
      left: $_9m9qz3wajcg89g5n.constant(rect.left),
      top: $_9m9qz3wajcg89g5n.constant(rect.top),
      right: $_9m9qz3wajcg89g5n.constant(rect.right),
      bottom: $_9m9qz3wajcg89g5n.constant(rect.bottom),
      width: $_9m9qz3wajcg89g5n.constant(rect.width),
      height: $_9m9qz3wajcg89g5n.constant(rect.height)
    };
  };
  var getFirstRect$1 = function (rng) {
    var rects = rng.getClientRects();
    var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? $_en0sddw9jcg89g5j.some(rect).map(toRect$1) : $_en0sddw9jcg89g5j.none();
  };
  var getBounds$2 = function (rng) {
    var rect = rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? $_en0sddw9jcg89g5j.some(rect).map(toRect$1) : $_en0sddw9jcg89g5j.none();
  };
  var toString$1 = function (rng) {
    return rng.toString();
  };
  var $_aw447e144jcg89hfd = {
    create: create$5,
    replaceWith: replaceWith,
    selectNodeContents: selectNodeContents,
    selectNodeContentsUsing: selectNodeContentsUsing,
    relativeToNative: relativeToNative,
    exactToNative: exactToNative,
    deleteContents: deleteContents,
    cloneFragment: cloneFragment,
    getFirstRect: getFirstRect$1,
    getBounds: getBounds$2,
    isWithin: isWithin,
    toString: toString$1
  };

  var adt$5 = $_6nnct0x3jcg89g8q.generate([
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
    return type($_a3ihziwsjcg89g6w.fromDom(range.startContainer), range.startOffset, $_a3ihziwsjcg89g6w.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: $_9m9qz3wajcg89g5n.constant(rng),
          rtl: $_en0sddw9jcg89g5j.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: $_4mkzmwgjcg89g60.cached(function () {
            return $_aw447e144jcg89hfd.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: $_4mkzmwgjcg89g60.cached(function () {
            return $_en0sddw9jcg89g5j.some($_aw447e144jcg89hfd.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: $_4mkzmwgjcg89g60.cached(function () {
            return $_aw447e144jcg89hfd.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: $_4mkzmwgjcg89g60.cached(function () {
            return $_en0sddw9jcg89g5j.some($_aw447e144jcg89hfd.exactToNative(win, finish, foffset, start, soffset));
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
        return adt$5.rtl($_a3ihziwsjcg89g6w.fromDom(rev.endContainer), rev.endOffset, $_a3ihziwsjcg89g6w.fromDom(rev.startContainer), rev.startOffset);
      }).getOrThunk(function () {
        return fromRange(win, adt$5.ltr, rng);
      });
    } else {
      return fromRange(win, adt$5.ltr, rng);
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
  var $_czb6qc145jcg89hfn = {
    ltr: adt$5.ltr,
    rtl: adt$5.rtl,
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
  var $_beflxz148jcg89hg4 = {
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
    var length = $_8949mt13xjcg89het.get(textnode).length;
    var offset = $_beflxz148jcg89hg4.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate$2 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = $_crwoiuydjcg89gf3.findMap(rects, function (rect) {
      return $_beflxz148jcg89hg4.inRect(rect, x, y) ? $_en0sddw9jcg89g5j.some(rect) : $_en0sddw9jcg89g5j.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_cwoz00149jcg89hg7 = { locate: locate$2 };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_3ndsgfy2jcg89gdr.children(node);
    return $_crwoiuydjcg89gf3.findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_beflxz148jcg89hg4.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : $_en0sddw9jcg89g5j.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_xqscexwjcg89gct.isText(node) ? $_cwoz00149jcg89hg7.locate : searchInChildren;
    return locator(doc, node, x, y);
  };
  var locate$1 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return locateNode(doc, node, boundedX, boundedY);
  };
  var $_7v0ork147jcg89hg0 = { locate: locate$1 };

  var first$3 = function (element) {
    return $_f4g77pyhjcg89gfa.descendant(element, $_9gl41i13wjcg89heq.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_9gl41i13wjcg89heq.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_3ndsgfy2jcg89gdr.children(element);
      for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (predicate(child))
          return $_en0sddw9jcg89g5j.some(child);
        var res = descend(child);
        if (res.isSome())
          return res;
      }
      return $_en0sddw9jcg89g5j.none();
    };
    return descend(scope);
  };
  var $_2pzfrm14bjcg89hgj = {
    first: first$3,
    last: last$2
  };

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
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_2pzfrm14bjcg89hgj.first : $_2pzfrm14bjcg89hgj.last;
    return f(node).map(function (target) {
      return createCollapsedNode(doc, target, collapseDirection);
    });
  };
  var locateInEmpty = function (doc, node, x) {
    var rect = node.dom().getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    return $_en0sddw9jcg89g5j.some(createCollapsedNode(doc, node, collapseDirection));
  };
  var search$1 = function (doc, node, x) {
    var f = $_3ndsgfy2jcg89gdr.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_57wtd14ajcg89hgf = { search: search$1 };

  var caretPositionFromPoint = function (doc, x, y) {
    return $_en0sddw9jcg89g5j.from(doc.dom().caretPositionFromPoint(x, y)).bind(function (pos) {
      if (pos.offsetNode === null)
        return $_en0sddw9jcg89g5j.none();
      var r = doc.dom().createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse();
      return $_en0sddw9jcg89g5j.some(r);
    });
  };
  var caretRangeFromPoint = function (doc, x, y) {
    return $_en0sddw9jcg89g5j.from(doc.dom().caretRangeFromPoint(x, y));
  };
  var searchTextNodes = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return $_7v0ork147jcg89hg0.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return $_a3ihziwsjcg89g6w.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_57wtd14ajcg89hgf.search(doc, elem, x);
      };
      return $_3ndsgfy2jcg89gdr.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = $_a3ihziwsjcg89g6w.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_cups0m13zjcg89hey.range($_a3ihziwsjcg89g6w.fromDom(rng.startContainer), rng.startOffset, $_a3ihziwsjcg89g6w.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_7ir25t146jcg89hfu = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_aw447e144jcg89hfd.create(win);
    var self = $_4cgirewrjcg89g6t.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_63rwmczjjcg89gkz.descendants(ancestor, selector));
    return $_89wx8cw8jcg89g5d.filter(elements, function (elem) {
      $_aw447e144jcg89hfd.selectNodeContentsUsing(innerRange, elem);
      return $_aw447e144jcg89hfd.isWithin(outerRange, innerRange);
    });
  };
  var find$4 = function (win, selection, selector) {
    var outerRange = $_czb6qc145jcg89hfn.asLtrRange(win, selection);
    var ancestor = $_a3ihziwsjcg89g6w.fromDom(outerRange.commonAncestorContainer);
    return $_xqscexwjcg89gct.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_98jxhz14cjcg89hgm = { find: find$4 };

  var beforeSpecial = function (element, offset) {
    var name = $_xqscexwjcg89gct.name(element);
    if ('input' === name)
      return $_58fuiz140jcg89hf2.after(element);
    else if (!$_89wx8cw8jcg89g5d.contains([
        'br',
        'img'
      ], name))
      return $_58fuiz140jcg89hf2.on(element, offset);
    else
      return offset === 0 ? $_58fuiz140jcg89hf2.before(element) : $_58fuiz140jcg89hf2.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_58fuiz140jcg89hf2.before, beforeSpecial, $_58fuiz140jcg89hf2.after);
    var finish = finishSitu.fold($_58fuiz140jcg89hf2.before, beforeSpecial, $_58fuiz140jcg89hf2.after);
    return $_cups0m13zjcg89hey.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_cups0m13zjcg89hey.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = $_a3ihziwsjcg89g6w.fromDom(rng.startContainer);
        var finish = $_a3ihziwsjcg89g6w.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_chvemh14djcg89hgr = {
    beforeSpecial: beforeSpecial,
    preprocess: preprocess,
    preprocessRelative: preprocessRelative,
    preprocessExact: preprocessExact
  };

  var doSetNativeRange = function (win, rng) {
    $_en0sddw9jcg89g5j.from(win.getSelection()).each(function (selection) {
      selection.removeAllRanges();
      selection.addRange(rng);
    });
  };
  var doSetRange = function (win, start, soffset, finish, foffset) {
    var rng = $_aw447e144jcg89hfd.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_98jxhz14cjcg89hgm.find(win, selection, selector);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_czb6qc145jcg89hfn.diagnose(win, relative).match({
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
    var relative = $_chvemh14djcg89hgr.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_chvemh14djcg89hgr.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_cups0m13zjcg89hey.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_aw447e144jcg89hfd.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_chvemh14djcg89hgr.preprocess(selection);
    return $_czb6qc145jcg89hfn.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return $_en0sddw9jcg89g5j.some($_cups0m13zjcg89hey.range($_a3ihziwsjcg89g6w.fromDom(firstRng.startContainer), firstRng.startOffset, $_a3ihziwsjcg89g6w.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return $_en0sddw9jcg89g5j.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = $_a3ihziwsjcg89g6w.fromDom(selection.anchorNode);
    var focusNode = $_a3ihziwsjcg89g6w.fromDom(selection.focusNode);
    return $_3hckpc142jcg89hf9.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? $_en0sddw9jcg89g5j.some($_cups0m13zjcg89hey.range($_a3ihziwsjcg89g6w.fromDom(selection.anchorNode), selection.anchorOffset, $_a3ihziwsjcg89g6w.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_aw447e144jcg89hfd.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_aw447e144jcg89hfd.selectNodeContents(win, element);
    return $_cups0m13zjcg89hey.range($_a3ihziwsjcg89g6w.fromDom(rng.startContainer), rng.startOffset, $_a3ihziwsjcg89g6w.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    var selection = win.getSelection();
    return selection.rangeCount > 0 ? doGetExact(selection) : $_en0sddw9jcg89g5j.none();
  };
  var get$13 = function (win) {
    return getExact(win).map(function (range) {
      return $_cups0m13zjcg89hey.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect = function (win, selection) {
    var rng = $_czb6qc145jcg89hfn.asLtrRange(win, selection);
    return $_aw447e144jcg89hfd.getFirstRect(rng);
  };
  var getBounds$1 = function (win, selection) {
    var rng = $_czb6qc145jcg89hfn.asLtrRange(win, selection);
    return $_aw447e144jcg89hfd.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_7ir25t146jcg89hfu.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_czb6qc145jcg89hfn.asLtrRange(win, selection);
    return $_aw447e144jcg89hfd.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$3 = function (win, selection) {
    var rng = $_czb6qc145jcg89hfn.asLtrRange(win, selection);
    return $_aw447e144jcg89hfd.cloneFragment(rng);
  };
  var replace = function (win, selection, elements) {
    var rng = $_czb6qc145jcg89hfn.asLtrRange(win, selection);
    var fragment = $_6dtmqe143jcg89hfa.fromElements(elements, win.document);
    $_aw447e144jcg89hfd.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_czb6qc145jcg89hfn.asLtrRange(win, selection);
    $_aw447e144jcg89hfd.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_n5s8aw7jcg89g53.eq(start, finish) && soffset === foffset;
  };
  var $_a5tk5l141jcg89hf5 = {
    setExact: setExact,
    getExact: getExact,
    get: get$13,
    setRelative: setRelative,
    toNative: toNative,
    setToElement: setToElement,
    clear: clear$1,
    clone: clone$3,
    replace: replace,
    deleteAt: deleteAt,
    forElement: forElement,
    getFirstRect: getFirstRect,
    getBounds: getBounds$1,
    getAtPoint: getAtPoint,
    findWithin: findWithin,
    getAsString: getAsString,
    isCollapsed: isCollapsed
  };

  var COLLAPSED_WIDTH = 2;
  var collapsedRect = function (rect) {
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: $_9m9qz3wajcg89g5n.constant(COLLAPSED_WIDTH),
      height: rect.height
    };
  };
  var toRect = function (rawRect) {
    return {
      left: $_9m9qz3wajcg89g5n.constant(rawRect.left),
      top: $_9m9qz3wajcg89g5n.constant(rawRect.top),
      right: $_9m9qz3wajcg89g5n.constant(rawRect.right),
      bottom: $_9m9qz3wajcg89g5n.constant(rawRect.bottom),
      width: $_9m9qz3wajcg89g5n.constant(rawRect.width),
      height: $_9m9qz3wajcg89g5n.constant(rawRect.height)
    };
  };
  var getRectsFromRange = function (range) {
    if (!range.collapsed) {
      return $_89wx8cw8jcg89g5d.map(range.getClientRects(), toRect);
    } else {
      var start_1 = $_a3ihziwsjcg89g6w.fromDom(range.startContainer);
      return $_3ndsgfy2jcg89gdr.parent(start_1).bind(function (parent) {
        var selection = $_cups0m13zjcg89hey.exact(start_1, range.startOffset, parent, $_9gl41i13wjcg89heq.getEnd(parent));
        var optRect = $_a5tk5l141jcg89hf5.getFirstRect(range.startContainer.ownerDocument.defaultView, selection);
        return optRect.map(collapsedRect).map($_89wx8cw8jcg89g5d.pure);
      }).getOr([]);
    }
  };
  var getRectangles = function (cWin) {
    var sel = cWin.getSelection();
    return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [];
  };
  var $_1qia313vjcg89heh = { getRectangles: getRectangles };

  var EXTRA_SPACING = 50;
  var data = 'data-' + $_452cgoz0jcg89gid.resolve('last-outer-height');
  var setLastHeight = function (cBody, value) {
    $_69krbwxvjcg89gck.set(cBody, data, value);
  };
  var getLastHeight = function (cBody) {
    return $_3grge613ujcg89hee.safeParse(cBody, data);
  };
  var getBoundsFrom = function (rect) {
    return {
      top: $_9m9qz3wajcg89g5n.constant(rect.top()),
      bottom: $_9m9qz3wajcg89g5n.constant(rect.top() + rect.height())
    };
  };
  var getBounds = function (cWin) {
    var rects = $_1qia313vjcg89heh.getRectangles(cWin);
    return rects.length > 0 ? $_en0sddw9jcg89g5j.some(rects[0]).map(getBoundsFrom) : $_en0sddw9jcg89g5j.none();
  };
  var findDelta = function (outerWindow, cBody) {
    var last = getLastHeight(cBody);
    var current = outerWindow.innerHeight;
    return last > current ? $_en0sddw9jcg89g5j.some(last - current) : $_en0sddw9jcg89g5j.none();
  };
  var calculate = function (cWin, bounds, delta) {
    var isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
    return isOutside ? Math.min(delta, bounds.bottom() - cWin.innerHeight + EXTRA_SPACING) : 0;
  };
  var setup$1 = function (outerWindow, cWin) {
    var cBody = $_a3ihziwsjcg89g6w.fromDom(cWin.document.body);
    var toEditing = function () {
      $_9z8ia613tjcg89he5.resume(cWin);
    };
    var onResize = $_4df9s813jjcg89hcb.bind($_a3ihziwsjcg89g6w.fromDom(outerWindow), 'resize', function () {
      findDelta(outerWindow, cBody).each(function (delta) {
        getBounds(cWin).each(function (bounds) {
          var cScrollBy = calculate(cWin, bounds, delta);
          if (cScrollBy !== 0) {
            cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
          }
        });
      });
      setLastHeight(cBody, outerWindow.innerHeight);
    });
    setLastHeight(cBody, outerWindow.innerHeight);
    var destroy = function () {
      onResize.unbind();
    };
    return {
      toEditing: toEditing,
      destroy: destroy
    };
  };
  var $_aeyctt13sjcg89hdy = { setup: setup$1 };

  var getBodyFromFrame = function (frame) {
    return $_en0sddw9jcg89g5j.some($_a3ihziwsjcg89g6w.fromDom(frame.dom().contentWindow.document.body));
  };
  var getDocFromFrame = function (frame) {
    return $_en0sddw9jcg89g5j.some($_a3ihziwsjcg89g6w.fromDom(frame.dom().contentWindow.document));
  };
  var getWinFromFrame = function (frame) {
    return $_en0sddw9jcg89g5j.from(frame.dom().contentWindow);
  };
  var getSelectionFromFrame = function (frame) {
    var optWin = getWinFromFrame(frame);
    return optWin.bind($_a5tk5l141jcg89hf5.getExact);
  };
  var getFrame = function (editor) {
    return editor.getFrame();
  };
  var getOrDerive = function (name, f) {
    return function (editor) {
      var g = editor[name].getOrThunk(function () {
        var frame = getFrame(editor);
        return function () {
          return f(frame);
        };
      });
      return g();
    };
  };
  var getOrListen = function (editor, doc, name, type) {
    return editor[name].getOrThunk(function () {
      return function (handler) {
        return $_4df9s813jjcg89hcb.bind(doc, type, handler);
      };
    });
  };
  var toRect$2 = function (rect) {
    return {
      left: $_9m9qz3wajcg89g5n.constant(rect.left),
      top: $_9m9qz3wajcg89g5n.constant(rect.top),
      right: $_9m9qz3wajcg89g5n.constant(rect.right),
      bottom: $_9m9qz3wajcg89g5n.constant(rect.bottom),
      width: $_9m9qz3wajcg89g5n.constant(rect.width),
      height: $_9m9qz3wajcg89g5n.constant(rect.height)
    };
  };
  var getActiveApi = function (editor) {
    var frame = getFrame(editor);
    var tryFallbackBox = function (win) {
      var isCollapsed = function (sel) {
        return $_n5s8aw7jcg89g53.eq(sel.start(), sel.finish()) && sel.soffset() === sel.foffset();
      };
      var toStartRect = function (sel) {
        var rect = sel.start().dom().getBoundingClientRect();
        return rect.width > 0 || rect.height > 0 ? $_en0sddw9jcg89g5j.some(rect).map(toRect$2) : $_en0sddw9jcg89g5j.none();
      };
      return $_a5tk5l141jcg89hf5.getExact(win).filter(isCollapsed).bind(toStartRect);
    };
    return getBodyFromFrame(frame).bind(function (body) {
      return getDocFromFrame(frame).bind(function (doc) {
        return getWinFromFrame(frame).map(function (win) {
          var html = $_a3ihziwsjcg89g6w.fromDom(doc.dom().documentElement);
          var getCursorBox = editor.getCursorBox.getOrThunk(function () {
            return function () {
              return $_a5tk5l141jcg89hf5.get(win).bind(function (sel) {
                return $_a5tk5l141jcg89hf5.getFirstRect(win, sel).orThunk(function () {
                  return tryFallbackBox(win);
                });
              });
            };
          });
          var setSelection = editor.setSelection.getOrThunk(function () {
            return function (start, soffset, finish, foffset) {
              $_a5tk5l141jcg89hf5.setExact(win, start, soffset, finish, foffset);
            };
          });
          var clearSelection = editor.clearSelection.getOrThunk(function () {
            return function () {
              $_a5tk5l141jcg89hf5.clear(win);
            };
          });
          return {
            body: $_9m9qz3wajcg89g5n.constant(body),
            doc: $_9m9qz3wajcg89g5n.constant(doc),
            win: $_9m9qz3wajcg89g5n.constant(win),
            html: $_9m9qz3wajcg89g5n.constant(html),
            getSelection: $_9m9qz3wajcg89g5n.curry(getSelectionFromFrame, frame),
            setSelection: setSelection,
            clearSelection: clearSelection,
            frame: $_9m9qz3wajcg89g5n.constant(frame),
            onKeyup: getOrListen(editor, doc, 'onKeyup', 'keyup'),
            onNodeChanged: getOrListen(editor, doc, 'onNodeChanged', 'selectionchange'),
            onDomChanged: editor.onDomChanged,
            onScrollToCursor: editor.onScrollToCursor,
            onScrollToElement: editor.onScrollToElement,
            onToReading: editor.onToReading,
            onToEditing: editor.onToEditing,
            onToolbarScrollStart: editor.onToolbarScrollStart,
            onTouchContent: editor.onTouchContent,
            onTapContent: editor.onTapContent,
            onTouchToolstrip: editor.onTouchToolstrip,
            getCursorBox: getCursorBox
          };
        });
      });
    });
  };
  var $_b1amh214ejcg89hgw = {
    getBody: getOrDerive('getBody', getBodyFromFrame),
    getDoc: getOrDerive('getDoc', getDocFromFrame),
    getWin: getOrDerive('getWin', getWinFromFrame),
    getSelection: getOrDerive('getSelection', getSelectionFromFrame),
    getFrame: getFrame,
    getActiveApi: getActiveApi
  };

  var attr = 'data-ephox-mobile-fullscreen-style';
  var siblingStyles = 'display:none!important;';
  var ancestorPosition = 'position:absolute!important;';
  var ancestorStyles = 'top:0!important;left:0!important;margin:0' + '!important;padding:0!important;width:100%!important;';
  var bgFallback = 'background-color:rgb(255,255,255)!important;';
  var isAndroid = $_aoftmbwfjcg89g5y.detect().os.isAndroid();
  var matchColor = function (editorBody) {
    var color = $_17fn7izrjcg89glz.get(editorBody, 'background-color');
    return color !== undefined && color !== '' ? 'background-color:' + color + '!important' : bgFallback;
  };
  var clobberStyles = function (container, editorBody) {
    var gatherSibilings = function (element) {
      var siblings = $_63rwmczjjcg89gkz.siblings(element, '*');
      return siblings;
    };
    var clobber = function (clobberStyle) {
      return function (element) {
        var styles = $_69krbwxvjcg89gck.get(element, 'style');
        var backup = styles === undefined ? 'no-styles' : styles.trim();
        if (backup === clobberStyle) {
          return;
        } else {
          $_69krbwxvjcg89gck.set(element, attr, backup);
          $_69krbwxvjcg89gck.set(element, 'style', clobberStyle);
        }
      };
    };
    var ancestors = $_63rwmczjjcg89gkz.ancestors(container, '*');
    var siblings = $_89wx8cw8jcg89g5d.bind(ancestors, gatherSibilings);
    var bgColor = matchColor(editorBody);
    $_89wx8cw8jcg89g5d.each(siblings, clobber(siblingStyles));
    $_89wx8cw8jcg89g5d.each(ancestors, clobber(ancestorPosition + ancestorStyles + bgColor));
    var containerStyles = isAndroid === true ? '' : ancestorPosition;
    clobber(containerStyles + ancestorStyles + bgColor)(container);
  };
  var restoreStyles = function () {
    var clobberedEls = $_63rwmczjjcg89gkz.all('[' + attr + ']');
    $_89wx8cw8jcg89g5d.each(clobberedEls, function (element) {
      var restore = $_69krbwxvjcg89gck.get(element, attr);
      if (restore !== 'no-styles') {
        $_69krbwxvjcg89gck.set(element, 'style', restore);
      } else {
        $_69krbwxvjcg89gck.remove(element, 'style');
      }
      $_69krbwxvjcg89gck.remove(element, attr);
    });
  };
  var $_70kwvh14fjcg89hh8 = {
    clobberStyles: clobberStyles,
    restoreStyles: restoreStyles
  };

  var tag = function () {
    var head = $_5rph7vzljcg89gl5.first('head').getOrDie();
    var nu = function () {
      var meta = $_a3ihziwsjcg89g6w.fromTag('meta');
      $_69krbwxvjcg89gck.set(meta, 'name', 'viewport');
      $_dhkjply1jcg89gdi.append(head, meta);
      return meta;
    };
    var element = $_5rph7vzljcg89gl5.first('meta[name="viewport"]').getOrThunk(nu);
    var backup = $_69krbwxvjcg89gck.get(element, 'content');
    var maximize = function () {
      $_69krbwxvjcg89gck.set(element, 'content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
    };
    var restore = function () {
      if (backup !== undefined && backup !== null && backup.length > 0) {
        $_69krbwxvjcg89gck.set(element, 'content', backup);
      } else {
        $_69krbwxvjcg89gck.set(element, 'content', 'user-scalable=yes');
      }
    };
    return {
      maximize: maximize,
      restore: restore
    };
  };
  var $_8771l714gjcg89hhg = { tag: tag };

  var create$4 = function (platform, mask) {
    var meta = $_8771l714gjcg89hhg.tag();
    var androidApi = $_g2cejo129jcg89h2e.api();
    var androidEvents = $_g2cejo129jcg89h2e.api();
    var enter = function () {
      mask.hide();
      $_bhzm7gxtjcg89gcg.add(platform.container, $_452cgoz0jcg89gid.resolve('fullscreen-maximized'));
      $_bhzm7gxtjcg89gcg.add(platform.container, $_452cgoz0jcg89gid.resolve('android-maximized'));
      meta.maximize();
      $_bhzm7gxtjcg89gcg.add(platform.body, $_452cgoz0jcg89gid.resolve('android-scroll-reload'));
      androidApi.set($_aeyctt13sjcg89hdy.setup(platform.win, $_b1amh214ejcg89hgw.getWin(platform.editor).getOrDie('no')));
      $_b1amh214ejcg89hgw.getActiveApi(platform.editor).each(function (editorApi) {
        $_70kwvh14fjcg89hh8.clobberStyles(platform.container, editorApi.body());
        androidEvents.set($_5v8kvp13ojcg89hd1.initEvents(editorApi, platform.toolstrip, platform.alloy));
      });
    };
    var exit = function () {
      meta.restore();
      mask.show();
      $_bhzm7gxtjcg89gcg.remove(platform.container, $_452cgoz0jcg89gid.resolve('fullscreen-maximized'));
      $_bhzm7gxtjcg89gcg.remove(platform.container, $_452cgoz0jcg89gid.resolve('android-maximized'));
      $_70kwvh14fjcg89hh8.restoreStyles();
      $_bhzm7gxtjcg89gcg.remove(platform.body, $_452cgoz0jcg89gid.resolve('android-scroll-reload'));
      androidEvents.clear();
      androidApi.clear();
    };
    return {
      enter: enter,
      exit: exit
    };
  };
  var $_2nwbmg13njcg89hcv = { create: create$4 };

  var MobileSchema = $_51tzzcxgjcg89gax.objOf([
    $_76kfpx1jcg89g86.strictObjOf('editor', [
      $_76kfpx1jcg89g86.strict('getFrame'),
      $_76kfpx1jcg89g86.option('getBody'),
      $_76kfpx1jcg89g86.option('getDoc'),
      $_76kfpx1jcg89g86.option('getWin'),
      $_76kfpx1jcg89g86.option('getSelection'),
      $_76kfpx1jcg89g86.option('setSelection'),
      $_76kfpx1jcg89g86.option('clearSelection'),
      $_76kfpx1jcg89g86.option('cursorSaver'),
      $_76kfpx1jcg89g86.option('onKeyup'),
      $_76kfpx1jcg89g86.option('onNodeChanged'),
      $_76kfpx1jcg89g86.option('getCursorBox'),
      $_76kfpx1jcg89g86.strict('onDomChanged'),
      $_76kfpx1jcg89g86.defaulted('onTouchContent', $_9m9qz3wajcg89g5n.noop),
      $_76kfpx1jcg89g86.defaulted('onTapContent', $_9m9qz3wajcg89g5n.noop),
      $_76kfpx1jcg89g86.defaulted('onTouchToolstrip', $_9m9qz3wajcg89g5n.noop),
      $_76kfpx1jcg89g86.defaulted('onScrollToCursor', $_9m9qz3wajcg89g5n.constant({ unbind: $_9m9qz3wajcg89g5n.noop })),
      $_76kfpx1jcg89g86.defaulted('onScrollToElement', $_9m9qz3wajcg89g5n.constant({ unbind: $_9m9qz3wajcg89g5n.noop })),
      $_76kfpx1jcg89g86.defaulted('onToEditing', $_9m9qz3wajcg89g5n.constant({ unbind: $_9m9qz3wajcg89g5n.noop })),
      $_76kfpx1jcg89g86.defaulted('onToReading', $_9m9qz3wajcg89g5n.constant({ unbind: $_9m9qz3wajcg89g5n.noop })),
      $_76kfpx1jcg89g86.defaulted('onToolbarScrollStart', $_9m9qz3wajcg89g5n.identity)
    ]),
    $_76kfpx1jcg89g86.strict('socket'),
    $_76kfpx1jcg89g86.strict('toolstrip'),
    $_76kfpx1jcg89g86.strict('dropup'),
    $_76kfpx1jcg89g86.strict('toolbar'),
    $_76kfpx1jcg89g86.strict('container'),
    $_76kfpx1jcg89g86.strict('alloy'),
    $_76kfpx1jcg89g86.state('win', function (spec) {
      return $_3ndsgfy2jcg89gdr.owner(spec.socket).dom().defaultView;
    }),
    $_76kfpx1jcg89g86.state('body', function (spec) {
      return $_a3ihziwsjcg89g6w.fromDom(spec.socket.dom().ownerDocument.body);
    }),
    $_76kfpx1jcg89g86.defaulted('translate', $_9m9qz3wajcg89g5n.identity),
    $_76kfpx1jcg89g86.defaulted('setReadOnly', $_9m9qz3wajcg89g5n.noop)
  ]);

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
  var $_6agf3k14jjcg89hi8 = {
    adaptable: adaptable,
    first: first$4,
    last: last$3
  };

  var sketch$10 = function (onView, translate) {
    var memIcon = $_g1tn4l11djcg89gxd.record(Container.sketch({
      dom: $_7103f610pjcg89gtd.dom('<div aria-hidden="true" class="${prefix}-mask-tap-icon"></div>'),
      containerBehaviours: $_eid12yw3jcg89g3y.derive([Toggling.config({
          toggleClass: $_452cgoz0jcg89gid.resolve('mask-tap-icon-selected'),
          toggleOnExecute: false
        })])
    }));
    var onViewThrottle = $_6agf3k14jjcg89hi8.first(onView, 200);
    return Container.sketch({
      dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-disabled-mask"></div>'),
      components: [Container.sketch({
          dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-content-container"></div>'),
          components: [Button.sketch({
              dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-content-tap-section"></div>'),
              components: [memIcon.asSpec()],
              action: function (button) {
                onViewThrottle.throttle();
              },
              buttonBehaviours: $_eid12yw3jcg89g3y.derive([Toggling.config({ toggleClass: $_452cgoz0jcg89gid.resolve('mask-tap-icon-selected') })])
            })]
        })]
    });
  };
  var $_99ca0p14ijcg89hi1 = { sketch: sketch$10 };

  var produce = function (raw) {
    var mobile = $_51tzzcxgjcg89gax.asRawOrDie('Getting AndroidWebapp schema', MobileSchema, raw);
    $_17fn7izrjcg89glz.set(mobile.toolstrip, 'width', '100%');
    var onTap = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_at4sh212jjcg89h46.build($_99ca0p14ijcg89hi1.sketch(onTap, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    $_dhkjply1jcg89gdi.append(mobile.container, mask.element());
    var mode = $_2nwbmg13njcg89hcv.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: $_9m9qz3wajcg89g5n.noop,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_9m9qz3wajcg89g5n.noop
    };
  };
  var $_7bkniz13mjcg89hcl = { produce: produce };

  var schema$14 = [
    $_76kfpx1jcg89g86.defaulted('shell', true),
    $_dltg8y10cjcg89gq4.field('toolbarBehaviours', [Replacing])
  ];
  var enhanceGroups = function (detail) {
    return { behaviours: $_eid12yw3jcg89g3y.derive([Replacing.config({})]) };
  };
  var partTypes$1 = [$_7yfrc10jjcg89gro.optional({
      name: 'groups',
      overrides: enhanceGroups
    })];
  var $_27oy1014mjcg89hj6 = {
    name: $_9m9qz3wajcg89g5n.constant('Toolbar'),
    schema: $_9m9qz3wajcg89g5n.constant(schema$14),
    parts: $_9m9qz3wajcg89g5n.constant(partTypes$1)
  };

  var factory$4 = function (detail, components, spec, _externals) {
    var setGroups = function (toolbar, groups) {
      getGroupContainer(toolbar).fold(function () {
        console.error('Toolbar was defined to not be a shell, but no groups container was specified in components');
        throw new Error('Toolbar was defined to not be a shell, but no groups container was specified in components');
      }, function (container) {
        Replacing.set(container, groups);
      });
    };
    var getGroupContainer = function (component) {
      return detail.shell() ? $_en0sddw9jcg89g5j.some(component) : $_1ep1bp10hjcg89gr1.getPart(component, detail, 'groups');
    };
    var extra = detail.shell() ? {
      behaviours: [Replacing.config({})],
      components: []
    } : {
      behaviours: [],
      components: components
    };
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: extra.components,
      behaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive(extra.behaviours), $_dltg8y10cjcg89gq4.get(detail.toolbarBehaviours())),
      apis: { setGroups: setGroups },
      domModification: { attributes: { role: 'group' } }
    };
  };
  var Toolbar = $_168cxl10djcg89gq9.composite({
    name: 'Toolbar',
    configFields: $_27oy1014mjcg89hj6.schema(),
    partFields: $_27oy1014mjcg89hj6.parts(),
    factory: factory$4,
    apis: {
      setGroups: function (apis, toolbar, groups) {
        apis.setGroups(toolbar, groups);
      }
    }
  });

  var schema$15 = [
    $_76kfpx1jcg89g86.strict('items'),
    $_czln55ysjcg89ggs.markers(['itemClass']),
    $_dltg8y10cjcg89gq4.field('tgroupBehaviours', [Keying])
  ];
  var partTypes$2 = [$_7yfrc10jjcg89gro.group({
      name: 'items',
      unit: 'item',
      overrides: function (detail) {
        return { domModification: { classes: [detail.markers().itemClass()] } };
      }
    })];
  var $_68jtq014ojcg89hje = {
    name: $_9m9qz3wajcg89g5n.constant('ToolbarGroup'),
    schema: $_9m9qz3wajcg89g5n.constant(schema$15),
    parts: $_9m9qz3wajcg89g5n.constant(partTypes$2)
  };

  var factory$5 = function (detail, components, spec, _externals) {
    return $_5mo1ztwxjcg89g7j.deepMerge({ dom: { attributes: { role: 'toolbar' } } }, {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_5mo1ztwxjcg89g7j.deepMerge($_eid12yw3jcg89g3y.derive([Keying.config({
          mode: 'flow',
          selector: '.' + detail.markers().itemClass()
        })]), $_dltg8y10cjcg89gq4.get(detail.tgroupBehaviours())),
      'debug.sketcher': spec['debug.sketcher']
    });
  };
  var ToolbarGroup = $_168cxl10djcg89gq9.composite({
    name: 'ToolbarGroup',
    configFields: $_68jtq014ojcg89hje.schema(),
    partFields: $_68jtq014ojcg89hje.parts(),
    factory: factory$5
  });

  var dataHorizontal = 'data-' + $_452cgoz0jcg89gid.resolve('horizontal-scroll');
  var canScrollVertically = function (container) {
    container.dom().scrollTop = 1;
    var result = container.dom().scrollTop !== 0;
    container.dom().scrollTop = 0;
    return result;
  };
  var canScrollHorizontally = function (container) {
    container.dom().scrollLeft = 1;
    var result = container.dom().scrollLeft !== 0;
    container.dom().scrollLeft = 0;
    return result;
  };
  var hasVerticalScroll = function (container) {
    return container.dom().scrollTop > 0 || canScrollVertically(container);
  };
  var hasHorizontalScroll = function (container) {
    return container.dom().scrollLeft > 0 || canScrollHorizontally(container);
  };
  var markAsHorizontal = function (container) {
    $_69krbwxvjcg89gck.set(container, dataHorizontal, 'true');
  };
  var hasScroll = function (container) {
    return $_69krbwxvjcg89gck.get(container, dataHorizontal) === 'true' ? hasHorizontalScroll : hasVerticalScroll;
  };
  var exclusive = function (scope, selector) {
    return $_4df9s813jjcg89hcb.bind(scope, 'touchmove', function (event) {
      $_5rph7vzljcg89gl5.closest(event.target(), selector).filter(hasScroll).fold(function () {
        event.raw().preventDefault();
      }, $_9m9qz3wajcg89g5n.noop);
    });
  };
  var $_2awuup14pjcg89hjj = {
    exclusive: exclusive,
    markAsHorizontal: markAsHorizontal
  };

  var ScrollingToolbar = function () {
    var makeGroup = function (gSpec) {
      var scrollClass = gSpec.scrollable === true ? '${prefix}-toolbar-scrollable-group' : '';
      return {
        dom: $_7103f610pjcg89gtd.dom('<div aria-label="' + gSpec.label + '" class="${prefix}-toolbar-group ' + scrollClass + '"></div>'),
        tgroupBehaviours: $_eid12yw3jcg89g3y.derive([$_fqydj611rjcg89gzb.config('adhoc-scrollable-toolbar', gSpec.scrollable === true ? [$_1hggxlw5jcg89g4s.runOnInit(function (component, simulatedEvent) {
              $_17fn7izrjcg89glz.set(component.element(), 'overflow-x', 'auto');
              $_2awuup14pjcg89hjj.markAsHorizontal(component.element());
              $_apsj7a13gjcg89hbq.register(component.element());
            })] : [])]),
        components: [Container.sketch({ components: [ToolbarGroup.parts().items({})] })],
        markers: { itemClass: $_452cgoz0jcg89gid.resolve('toolbar-group-item') },
        items: gSpec.items
      };
    };
    var toolbar = $_at4sh212jjcg89h46.build(Toolbar.sketch({
      dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-toolbar"></div>'),
      components: [Toolbar.parts().groups({})],
      toolbarBehaviours: $_eid12yw3jcg89g3y.derive([
        Toggling.config({
          toggleClass: $_452cgoz0jcg89gid.resolve('context-toolbar'),
          toggleOnExecute: false,
          aria: { mode: 'none' }
        }),
        Keying.config({ mode: 'cyclic' })
      ]),
      shell: true
    }));
    var wrapper = $_at4sh212jjcg89h46.build(Container.sketch({
      dom: { classes: [$_452cgoz0jcg89gid.resolve('toolstrip')] },
      components: [$_at4sh212jjcg89h46.premade(toolbar)],
      containerBehaviours: $_eid12yw3jcg89g3y.derive([Toggling.config({
          toggleClass: $_452cgoz0jcg89gid.resolve('android-selection-context-toolbar'),
          toggleOnExecute: false
        })])
    }));
    var resetGroups = function () {
      Toolbar.setGroups(toolbar, initGroups.get());
      Toggling.off(toolbar);
    };
    var initGroups = Cell([]);
    var setGroups = function (gs) {
      initGroups.set(gs);
      resetGroups();
    };
    var createGroups = function (gs) {
      return $_89wx8cw8jcg89g5d.map(gs, $_9m9qz3wajcg89g5n.compose(ToolbarGroup.sketch, makeGroup));
    };
    var refresh = function () {
      Toolbar.refresh(toolbar);
    };
    var setContextToolbar = function (gs) {
      Toggling.on(toolbar);
      Toolbar.setGroups(toolbar, gs);
    };
    var restoreToolbar = function () {
      if (Toggling.isOn(toolbar)) {
        resetGroups();
      }
    };
    var focus = function () {
      Keying.focusIn(toolbar);
    };
    return {
      wrapper: $_9m9qz3wajcg89g5n.constant(wrapper),
      toolbar: $_9m9qz3wajcg89g5n.constant(toolbar),
      createGroups: createGroups,
      setGroups: setGroups,
      setContextToolbar: setContextToolbar,
      restoreToolbar: restoreToolbar,
      refresh: refresh,
      focus: focus
    };
  };

  var makeEditSwitch = function (webapp) {
    return $_at4sh212jjcg89h46.build(Button.sketch({
      dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-mask-edit-icon ${prefix}-icon"></div>'),
      action: function () {
        webapp.run(function (w) {
          w.setReadOnly(false);
        });
      }
    }));
  };
  var makeSocket = function () {
    return $_at4sh212jjcg89h46.build(Container.sketch({
      dom: $_7103f610pjcg89gtd.dom('<div class="${prefix}-editor-socket"></div>'),
      components: [],
      containerBehaviours: $_eid12yw3jcg89g3y.derive([Replacing.config({})])
    }));
  };
  var showEdit = function (socket, switchToEdit) {
    Replacing.append(socket, $_at4sh212jjcg89h46.premade(switchToEdit));
  };
  var hideEdit = function (socket, switchToEdit) {
    Replacing.remove(socket, switchToEdit);
  };
  var updateMode = function (socket, switchToEdit, readOnly, root) {
    var swap = readOnly === true ? Swapping.toAlpha : Swapping.toOmega;
    swap(root);
    var f = readOnly ? showEdit : hideEdit;
    f(socket, switchToEdit);
  };
  var $_g43xo714qjcg89hjq = {
    makeEditSwitch: makeEditSwitch,
    makeSocket: makeSocket,
    updateMode: updateMode
  };

  var getAnimationRoot = function (component, slideConfig) {
    return slideConfig.getAnimationRoot().fold(function () {
      return component.element();
    }, function (get) {
      return get(component);
    });
  };
  var getDimensionProperty = function (slideConfig) {
    return slideConfig.dimension().property();
  };
  var getDimension = function (slideConfig, elem) {
    return slideConfig.dimension().getDimension()(elem);
  };
  var disableTransitions = function (component, slideConfig) {
    var root = getAnimationRoot(component, slideConfig);
    $_3a6uq212xjcg89h7v.remove(root, [
      slideConfig.shrinkingClass(),
      slideConfig.growingClass()
    ]);
  };
  var setShrunk = function (component, slideConfig) {
    $_bhzm7gxtjcg89gcg.remove(component.element(), slideConfig.openClass());
    $_bhzm7gxtjcg89gcg.add(component.element(), slideConfig.closedClass());
    $_17fn7izrjcg89glz.set(component.element(), getDimensionProperty(slideConfig), '0px');
    $_17fn7izrjcg89glz.reflow(component.element());
  };
  var measureTargetSize = function (component, slideConfig) {
    setGrown(component, slideConfig);
    var expanded = getDimension(slideConfig, component.element());
    setShrunk(component, slideConfig);
    return expanded;
  };
  var setGrown = function (component, slideConfig) {
    $_bhzm7gxtjcg89gcg.remove(component.element(), slideConfig.closedClass());
    $_bhzm7gxtjcg89gcg.add(component.element(), slideConfig.openClass());
    $_17fn7izrjcg89glz.remove(component.element(), getDimensionProperty(slideConfig));
  };
  var doImmediateShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_17fn7izrjcg89glz.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_17fn7izrjcg89glz.reflow(component.element());
    disableTransitions(component, slideConfig);
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
    slideConfig.onShrunk()(component);
  };
  var doStartShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_17fn7izrjcg89glz.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_17fn7izrjcg89glz.reflow(component.element());
    var root = getAnimationRoot(component, slideConfig);
    $_bhzm7gxtjcg89gcg.add(root, slideConfig.shrinkingClass());
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
  };
  var doStartGrow = function (component, slideConfig, slideState) {
    var fullSize = measureTargetSize(component, slideConfig);
    var root = getAnimationRoot(component, slideConfig);
    $_bhzm7gxtjcg89gcg.add(root, slideConfig.growingClass());
    setGrown(component, slideConfig);
    $_17fn7izrjcg89glz.set(component.element(), getDimensionProperty(slideConfig), fullSize);
    slideState.setExpanded();
    slideConfig.onStartGrow()(component);
  };
  var grow = function (component, slideConfig, slideState) {
    if (!slideState.isExpanded())
      doStartGrow(component, slideConfig, slideState);
  };
  var shrink = function (component, slideConfig, slideState) {
    if (slideState.isExpanded())
      doStartShrink(component, slideConfig, slideState);
  };
  var immediateShrink = function (component, slideConfig, slideState) {
    if (slideState.isExpanded())
      doImmediateShrink(component, slideConfig, slideState);
  };
  var hasGrown = function (component, slideConfig, slideState) {
    return slideState.isExpanded();
  };
  var hasShrunk = function (component, slideConfig, slideState) {
    return slideState.isCollapsed();
  };
  var isGrowing = function (component, slideConfig, slideState) {
    var root = getAnimationRoot(component, slideConfig);
    return $_bhzm7gxtjcg89gcg.has(root, slideConfig.growingClass()) === true;
  };
  var isShrinking = function (component, slideConfig, slideState) {
    var root = getAnimationRoot(component, slideConfig);
    return $_bhzm7gxtjcg89gcg.has(root, slideConfig.shrinkingClass()) === true;
  };
  var isTransitioning = function (component, slideConfig, slideState) {
    return isGrowing(component, slideConfig, slideState) === true || isShrinking(component, slideConfig, slideState) === true;
  };
  var toggleGrow = function (component, slideConfig, slideState) {
    var f = slideState.isExpanded() ? doStartShrink : doStartGrow;
    f(component, slideConfig, slideState);
  };
  var $_5xduhm14ujcg89hkq = {
    grow: grow,
    shrink: shrink,
    immediateShrink: immediateShrink,
    hasGrown: hasGrown,
    hasShrunk: hasShrunk,
    isGrowing: isGrowing,
    isShrinking: isShrinking,
    isTransitioning: isTransitioning,
    toggleGrow: toggleGrow,
    disableTransitions: disableTransitions
  };

  var exhibit$5 = function (base, slideConfig) {
    var expanded = slideConfig.expanded();
    return expanded ? $_8qlllaxjjcg89gbk.nu({
      classes: [slideConfig.openClass()],
      styles: {}
    }) : $_8qlllaxjjcg89gbk.nu({
      classes: [slideConfig.closedClass()],
      styles: $_b52oxhx5jcg89g9l.wrap(slideConfig.dimension().property(), '0px')
    });
  };
  var events$9 = function (slideConfig, slideState) {
    return $_1hggxlw5jcg89g4s.derive([$_1hggxlw5jcg89g4s.run($_3338ovwwjcg89g7g.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        if (raw.propertyName === slideConfig.dimension().property()) {
          $_5xduhm14ujcg89hkq.disableTransitions(component, slideConfig, slideState);
          if (slideState.isExpanded())
            $_17fn7izrjcg89glz.remove(component.element(), slideConfig.dimension().property());
          var notify = slideState.isExpanded() ? slideConfig.onGrown() : slideConfig.onShrunk();
          notify(component, simulatedEvent);
        }
      })]);
  };
  var $_7b9zjd14tjcg89hke = {
    exhibit: exhibit$5,
    events: events$9
  };

  var SlidingSchema = [
    $_76kfpx1jcg89g86.strict('closedClass'),
    $_76kfpx1jcg89g86.strict('openClass'),
    $_76kfpx1jcg89g86.strict('shrinkingClass'),
    $_76kfpx1jcg89g86.strict('growingClass'),
    $_76kfpx1jcg89g86.option('getAnimationRoot'),
    $_czln55ysjcg89ggs.onHandler('onShrunk'),
    $_czln55ysjcg89ggs.onHandler('onStartShrink'),
    $_czln55ysjcg89ggs.onHandler('onGrown'),
    $_czln55ysjcg89ggs.onHandler('onStartGrow'),
    $_76kfpx1jcg89g86.defaulted('expanded', false),
    $_76kfpx1jcg89g86.strictOf('dimension', $_51tzzcxgjcg89gax.choose('property', {
      width: [
        $_czln55ysjcg89ggs.output('property', 'width'),
        $_czln55ysjcg89ggs.output('getDimension', function (elem) {
          return $_bikzj9116jcg89gw3.get(elem) + 'px';
        })
      ],
      height: [
        $_czln55ysjcg89ggs.output('property', 'height'),
        $_czln55ysjcg89ggs.output('getDimension', function (elem) {
          return $_cpvhuyzqjcg89glx.get(elem) + 'px';
        })
      ]
    }))
  ];

  var init$4 = function (spec) {
    var state = Cell(spec.expanded());
    var readState = function () {
      return 'expanded: ' + state.get();
    };
    return BehaviourState({
      isExpanded: function () {
        return state.get() === true;
      },
      isCollapsed: function () {
        return state.get() === false;
      },
      setCollapsed: $_9m9qz3wajcg89g5n.curry(state.set, false),
      setExpanded: $_9m9qz3wajcg89g5n.curry(state.set, true),
      readState: readState
    });
  };
  var $_g7fsjb14wjcg89hl3 = { init: init$4 };

  var Sliding = $_eid12yw3jcg89g3y.create({
    fields: SlidingSchema,
    name: 'sliding',
    active: $_7b9zjd14tjcg89hke,
    apis: $_5xduhm14ujcg89hkq,
    state: $_g7fsjb14wjcg89hl3
  });

  var build$2 = function (refresh, scrollIntoView) {
    var dropup = $_at4sh212jjcg89h46.build(Container.sketch({
      dom: {
        tag: 'div',
        classes: $_452cgoz0jcg89gid.resolve('dropup')
      },
      components: [],
      containerBehaviours: $_eid12yw3jcg89g3y.derive([
        Replacing.config({}),
        Sliding.config({
          closedClass: $_452cgoz0jcg89gid.resolve('dropup-closed'),
          openClass: $_452cgoz0jcg89gid.resolve('dropup-open'),
          shrinkingClass: $_452cgoz0jcg89gid.resolve('dropup-shrinking'),
          growingClass: $_452cgoz0jcg89gid.resolve('dropup-growing'),
          dimension: { property: 'height' },
          onShrunk: function (component) {
            refresh();
            scrollIntoView();
            Replacing.set(component, []);
          },
          onGrown: function (component) {
            refresh();
            scrollIntoView();
          }
        }),
        $_8qmhfpyzjcg89gi8.orientation(function (component, data) {
          disappear($_9m9qz3wajcg89g5n.noop);
        })
      ])
    }));
    var appear = function (menu, update, component) {
      if (Sliding.hasShrunk(dropup) === true && Sliding.isTransitioning(dropup) === false) {
        window.requestAnimationFrame(function () {
          update(component);
          Replacing.set(dropup, [menu()]);
          Sliding.grow(dropup);
        });
      }
    };
    var disappear = function (onReadyToShrink) {
      window.requestAnimationFrame(function () {
        onReadyToShrink();
        Sliding.shrink(dropup);
      });
    };
    return {
      appear: appear,
      disappear: disappear,
      component: $_9m9qz3wajcg89g5n.constant(dropup),
      element: dropup.element
    };
  };
  var $_52d4wa14rjcg89hk0 = { build: build$2 };

  var isDangerous = function (event) {
    return event.raw().which === $_8mskkgzdjcg89gk3.BACKSPACE()[0] && !$_89wx8cw8jcg89g5d.contains([
      'input',
      'textarea'
    ], $_xqscexwjcg89gct.name(event.target()));
  };
  var isFirefox = $_aoftmbwfjcg89g5y.detect().browser.isFirefox();
  var settingsSchema = $_51tzzcxgjcg89gax.objOfOnly([
    $_76kfpx1jcg89g86.strictFunction('triggerEvent'),
    $_76kfpx1jcg89g86.strictFunction('broadcastEvent'),
    $_76kfpx1jcg89g86.defaulted('stopBackspace', true)
  ]);
  var bindFocus = function (container, handler) {
    if (isFirefox) {
      return $_4df9s813jjcg89hcb.capture(container, 'focus', handler);
    } else {
      return $_4df9s813jjcg89hcb.bind(container, 'focusin', handler);
    }
  };
  var bindBlur = function (container, handler) {
    if (isFirefox) {
      return $_4df9s813jjcg89hcb.capture(container, 'blur', handler);
    } else {
      return $_4df9s813jjcg89hcb.bind(container, 'focusout', handler);
    }
  };
  var setup$2 = function (container, rawSettings) {
    var settings = $_51tzzcxgjcg89gax.asRawOrDie('Getting GUI events settings', settingsSchema, rawSettings);
    var pointerEvents = $_aoftmbwfjcg89g5y.detect().deviceType.isTouch() ? [
      'touchstart',
      'touchmove',
      'touchend',
      'gesturestart'
    ] : [
      'mousedown',
      'mouseup',
      'mouseover',
      'mousemove',
      'mouseout',
      'click'
    ];
    var tapEvent = $_5lsrgd13qjcg89hdq.monitor(settings);
    var simpleEvents = $_89wx8cw8jcg89g5d.map(pointerEvents.concat([
      'selectstart',
      'input',
      'contextmenu',
      'change',
      'transitionend',
      'dragstart',
      'dragover',
      'drop'
    ]), function (type) {
      return $_4df9s813jjcg89hcb.bind(container, type, function (event) {
        tapEvent.fireIfReady(event, type).each(function (tapStopped) {
          if (tapStopped)
            event.kill();
        });
        var stopped = settings.triggerEvent(type, event);
        if (stopped)
          event.kill();
      });
    });
    var onKeydown = $_4df9s813jjcg89hcb.bind(container, 'keydown', function (event) {
      var stopped = settings.triggerEvent('keydown', event);
      if (stopped)
        event.kill();
      else if (settings.stopBackspace === true && isDangerous(event)) {
        event.prevent();
      }
    });
    var onFocusIn = bindFocus(container, function (event) {
      var stopped = settings.triggerEvent('focusin', event);
      if (stopped)
        event.kill();
    });
    var onFocusOut = bindBlur(container, function (event) {
      var stopped = settings.triggerEvent('focusout', event);
      if (stopped)
        event.kill();
      setTimeout(function () {
        settings.triggerEvent($_f1ifvdwvjcg89g7a.postBlur(), event);
      }, 0);
    });
    var defaultView = $_3ndsgfy2jcg89gdr.defaultView(container);
    var onWindowScroll = $_4df9s813jjcg89hcb.bind(defaultView, 'scroll', function (event) {
      var stopped = settings.broadcastEvent($_f1ifvdwvjcg89g7a.windowScroll(), event);
      if (stopped)
        event.kill();
    });
    var unbind = function () {
      $_89wx8cw8jcg89g5d.each(simpleEvents, function (e) {
        e.unbind();
      });
      onKeydown.unbind();
      onFocusIn.unbind();
      onFocusOut.unbind();
      onWindowScroll.unbind();
    };
    return { unbind: unbind };
  };
  var $_8r7k9k14zjcg89hm4 = { setup: setup$2 };

  var derive$3 = function (rawEvent, rawTarget) {
    var source = $_b52oxhx5jcg89g9l.readOptFrom(rawEvent, 'target').map(function (getTarget) {
      return getTarget();
    }).getOr(rawTarget);
    return Cell(source);
  };
  var $_4ipjum151jcg89hmq = { derive: derive$3 };

  var fromSource = function (event, source) {
    var stopper = Cell(false);
    var cutter = Cell(false);
    var stop = function () {
      stopper.set(true);
    };
    var cut = function () {
      cutter.set(true);
    };
    return {
      stop: stop,
      cut: cut,
      isStopped: stopper.get,
      isCut: cutter.get,
      event: $_9m9qz3wajcg89g5n.constant(event),
      setSource: source.set,
      getSource: source.get
    };
  };
  var fromExternal = function (event) {
    var stopper = Cell(false);
    var stop = function () {
      stopper.set(true);
    };
    return {
      stop: stop,
      cut: $_9m9qz3wajcg89g5n.noop,
      isStopped: stopper.get,
      isCut: $_9m9qz3wajcg89g5n.constant(false),
      event: $_9m9qz3wajcg89g5n.constant(event),
      setTarget: $_9m9qz3wajcg89g5n.die(new Error('Cannot set target of a broadcasted event')),
      getTarget: $_9m9qz3wajcg89g5n.die(new Error('Cannot get target of a broadcasted event'))
    };
  };
  var fromTarget = function (event, target) {
    var source = Cell(target);
    return fromSource(event, source);
  };
  var $_2bhupf152jcg89hmx = {
    fromSource: fromSource,
    fromExternal: fromExternal,
    fromTarget: fromTarget
  };

  var adt$6 = $_6nnct0x3jcg89g8q.generate([
    { stopped: [] },
    { resume: ['element'] },
    { complete: [] }
  ]);
  var doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
    var handler = lookup(eventType, target);
    var simulatedEvent = $_2bhupf152jcg89hmx.fromSource(rawEvent, source);
    return handler.fold(function () {
      logger.logEventNoHandlers(eventType, target);
      return adt$6.complete();
    }, function (handlerInfo) {
      var descHandler = handlerInfo.descHandler();
      var eventHandler = $_gcmye512ujcg89h71.getHandler(descHandler);
      eventHandler(simulatedEvent);
      if (simulatedEvent.isStopped()) {
        logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.stopped();
      } else if (simulatedEvent.isCut()) {
        logger.logEventCut(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.complete();
      } else
        return $_3ndsgfy2jcg89gdr.parent(handlerInfo.element()).fold(function () {
          logger.logNoParent(eventType, handlerInfo.element(), descHandler.purpose());
          return adt$6.complete();
        }, function (parent) {
          logger.logEventResponse(eventType, handlerInfo.element(), descHandler.purpose());
          return adt$6.resume(parent);
        });
    });
  };
  var doTriggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, source, logger) {
    return doTriggerHandler(lookup, eventType, rawEvent, rawTarget, source, logger).fold(function () {
      return true;
    }, function (parent) {
      return doTriggerOnUntilStopped(lookup, eventType, rawEvent, parent, source, logger);
    }, function () {
      return false;
    });
  };
  var triggerHandler = function (lookup, eventType, rawEvent, target, logger) {
    var source = $_4ipjum151jcg89hmq.derive(rawEvent, target);
    return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
  };
  var broadcast = function (listeners, rawEvent, logger) {
    var simulatedEvent = $_2bhupf152jcg89hmx.fromExternal(rawEvent);
    $_89wx8cw8jcg89g5d.each(listeners, function (listener) {
      var descHandler = listener.descHandler();
      var handler = $_gcmye512ujcg89h71.getHandler(descHandler);
      handler(simulatedEvent);
    });
    return simulatedEvent.isStopped();
  };
  var triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
    var rawTarget = rawEvent.target();
    return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
  };
  var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
    var source = $_4ipjum151jcg89hmq.derive(rawEvent, rawTarget);
    return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
  };
  var $_enhste150jcg89hmf = {
    triggerHandler: triggerHandler,
    triggerUntilStopped: triggerUntilStopped,
    triggerOnUntilStopped: triggerOnUntilStopped,
    broadcast: broadcast
  };

  var closest$4 = function (target, transform, isRoot) {
    var delegate = $_f4g77pyhjcg89gfa.closest(target, function (elem) {
      return transform(elem).isSome();
    }, isRoot);
    return delegate.bind(transform);
  };
  var $_cnztoe155jcg89hnl = { closest: closest$4 };

  var eventHandler = $_4pc2ltxljcg89gc2.immutable('element', 'descHandler');
  var messageHandler = function (id, handler) {
    return {
      id: $_9m9qz3wajcg89g5n.constant(id),
      descHandler: $_9m9qz3wajcg89g5n.constant(handler)
    };
  };
  var EventRegistry = function () {
    var registry = {};
    var registerId = function (extraArgs, id, events) {
      $_gbrpaqwzjcg89g7p.each(events, function (v, k) {
        var handlers = registry[k] !== undefined ? registry[k] : {};
        handlers[id] = $_gcmye512ujcg89h71.curryArgs(v, extraArgs);
        registry[k] = handlers;
      });
    };
    var findHandler = function (handlers, elem) {
      return $_fxeraw10ljcg89gsg.read(elem).fold(function (err) {
        return $_en0sddw9jcg89g5j.none();
      }, function (id) {
        var reader = $_b52oxhx5jcg89g9l.readOpt(id);
        return handlers.bind(reader).map(function (descHandler) {
          return eventHandler(elem, descHandler);
        });
      });
    };
    var filterByType = function (type) {
      return $_b52oxhx5jcg89g9l.readOptFrom(registry, type).map(function (handlers) {
        return $_gbrpaqwzjcg89g7p.mapToArray(handlers, function (f, id) {
          return messageHandler(id, f);
        });
      }).getOr([]);
    };
    var find = function (isAboveRoot, type, target) {
      var readType = $_b52oxhx5jcg89g9l.readOpt(type);
      var handlers = readType(registry);
      return $_cnztoe155jcg89hnl.closest(target, function (elem) {
        return findHandler(handlers, elem);
      }, isAboveRoot);
    };
    var unregisterId = function (id) {
      $_gbrpaqwzjcg89g7p.each(registry, function (handlersById, eventName) {
        if (handlersById.hasOwnProperty(id))
          delete handlersById[id];
      });
    };
    return {
      registerId: registerId,
      unregisterId: unregisterId,
      filterByType: filterByType,
      find: find
    };
  };

  var Registry = function () {
    var events = EventRegistry();
    var components = {};
    var readOrTag = function (component) {
      var elem = component.element();
      return $_fxeraw10ljcg89gsg.read(elem).fold(function () {
        return $_fxeraw10ljcg89gsg.write('uid-', component.element());
      }, function (uid) {
        return uid;
      });
    };
    var failOnDuplicate = function (component, tagId) {
      var conflict = components[tagId];
      if (conflict === component)
        unregister(component);
      else
        throw new Error('The tagId "' + tagId + '" is already used by: ' + $_8845a2y8jcg89ger.element(conflict.element()) + '\nCannot use it for: ' + $_8845a2y8jcg89ger.element(component.element()) + '\n' + 'The conflicting element is' + ($_c2mv10y6jcg89gec.inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM');
    };
    var register = function (component) {
      var tagId = readOrTag(component);
      if ($_b52oxhx5jcg89g9l.hasKey(components, tagId))
        failOnDuplicate(component, tagId);
      var extraArgs = [component];
      events.registerId(extraArgs, tagId, component.events());
      components[tagId] = component;
    };
    var unregister = function (component) {
      $_fxeraw10ljcg89gsg.read(component.element()).each(function (tagId) {
        components[tagId] = undefined;
        events.unregisterId(tagId);
      });
    };
    var filter = function (type) {
      return events.filterByType(type);
    };
    var find = function (isAboveRoot, type, target) {
      return events.find(isAboveRoot, type, target);
    };
    var getById = function (id) {
      return $_b52oxhx5jcg89g9l.readOpt(id)(components);
    };
    return {
      find: find,
      filter: filter,
      register: register,
      unregister: unregister,
      getById: getById
    };
  };

  var create$6 = function () {
    var root = $_at4sh212jjcg89h46.build(Container.sketch({ dom: { tag: 'div' } }));
    return takeover(root);
  };
  var takeover = function (root) {
    var isAboveRoot = function (el) {
      return $_3ndsgfy2jcg89gdr.parent(root.element()).fold(function () {
        return true;
      }, function (parent) {
        return $_n5s8aw7jcg89g53.eq(el, parent);
      });
    };
    var registry = Registry();
    var lookup = function (eventName, target) {
      return registry.find(isAboveRoot, eventName, target);
    };
    var domEvents = $_8r7k9k14zjcg89hm4.setup(root.element(), {
      triggerEvent: function (eventName, event) {
        return $_bj47tfy7jcg89geh.monitorEvent(eventName, event.target(), function (logger) {
          return $_enhste150jcg89hmf.triggerUntilStopped(lookup, eventName, event, logger);
        });
      },
      broadcastEvent: function (eventName, event) {
        var listeners = registry.filter(eventName);
        return $_enhste150jcg89hmf.broadcast(listeners, event);
      }
    });
    var systemApi = SystemApi({
      debugInfo: $_9m9qz3wajcg89g5n.constant('real'),
      triggerEvent: function (customType, target, data) {
        $_bj47tfy7jcg89geh.monitorEvent(customType, target, function (logger) {
          $_enhste150jcg89hmf.triggerOnUntilStopped(lookup, customType, data, target, logger);
        });
      },
      triggerFocus: function (target, originator) {
        $_fxeraw10ljcg89gsg.read(target).fold(function () {
          $_72ito4yfjcg89gf5.focus(target);
        }, function (_alloyId) {
          $_bj47tfy7jcg89geh.monitorEvent($_f1ifvdwvjcg89g7a.focus(), target, function (logger) {
            $_enhste150jcg89hmf.triggerHandler(lookup, $_f1ifvdwvjcg89g7a.focus(), {
              originator: $_9m9qz3wajcg89g5n.constant(originator),
              target: $_9m9qz3wajcg89g5n.constant(target)
            }, target, logger);
          });
        });
      },
      triggerEscape: function (comp, simulatedEvent) {
        systemApi.triggerEvent('keydown', comp.element(), simulatedEvent.event());
      },
      getByUid: function (uid) {
        return getByUid(uid);
      },
      getByDom: function (elem) {
        return getByDom(elem);
      },
      build: $_at4sh212jjcg89h46.build,
      addToGui: function (c) {
        add(c);
      },
      removeFromGui: function (c) {
        remove(c);
      },
      addToWorld: function (c) {
        addToWorld(c);
      },
      removeFromWorld: function (c) {
        removeFromWorld(c);
      },
      broadcast: function (message) {
        broadcast(message);
      },
      broadcastOn: function (channels, message) {
        broadcastOn(channels, message);
      }
    });
    var addToWorld = function (component) {
      component.connect(systemApi);
      if (!$_xqscexwjcg89gct.isText(component.element())) {
        registry.register(component);
        $_89wx8cw8jcg89g5d.each(component.components(), addToWorld);
        systemApi.triggerEvent($_f1ifvdwvjcg89g7a.systemInit(), component.element(), { target: $_9m9qz3wajcg89g5n.constant(component.element()) });
      }
    };
    var removeFromWorld = function (component) {
      if (!$_xqscexwjcg89gct.isText(component.element())) {
        $_89wx8cw8jcg89g5d.each(component.components(), removeFromWorld);
        registry.unregister(component);
      }
      component.disconnect();
    };
    var add = function (component) {
      $_d31i57y0jcg89gd5.attach(root, component);
    };
    var remove = function (component) {
      $_d31i57y0jcg89gd5.detach(component);
    };
    var destroy = function () {
      domEvents.unbind();
      $_cs3l5zy4jcg89ge4.remove(root.element());
    };
    var broadcastData = function (data) {
      var receivers = registry.filter($_f1ifvdwvjcg89g7a.receive());
      $_89wx8cw8jcg89g5d.each(receivers, function (receiver) {
        var descHandler = receiver.descHandler();
        var handler = $_gcmye512ujcg89h71.getHandler(descHandler);
        handler(data);
      });
    };
    var broadcast = function (message) {
      broadcastData({
        universal: $_9m9qz3wajcg89g5n.constant(true),
        data: $_9m9qz3wajcg89g5n.constant(message)
      });
    };
    var broadcastOn = function (channels, message) {
      broadcastData({
        universal: $_9m9qz3wajcg89g5n.constant(false),
        channels: $_9m9qz3wajcg89g5n.constant(channels),
        data: $_9m9qz3wajcg89g5n.constant(message)
      });
    };
    var getByUid = function (uid) {
      return registry.getById(uid).fold(function () {
        return $_b8l9yux7jcg89g9z.error(new Error('Could not find component with uid: "' + uid + '" in system.'));
      }, $_b8l9yux7jcg89g9z.value);
    };
    var getByDom = function (elem) {
      return $_fxeraw10ljcg89gsg.read(elem).bind(getByUid);
    };
    addToWorld(root);
    return {
      root: $_9m9qz3wajcg89g5n.constant(root),
      element: root.element,
      destroy: destroy,
      add: add,
      remove: remove,
      getByUid: getByUid,
      getByDom: getByDom,
      addToWorld: addToWorld,
      removeFromWorld: removeFromWorld,
      broadcast: broadcast,
      broadcastOn: broadcastOn
    };
  };
  var $_5z9s5614yjcg89hll = {
    create: create$6,
    takeover: takeover
  };

  var READ_ONLY_MODE_CLASS = $_9m9qz3wajcg89g5n.constant($_452cgoz0jcg89gid.resolve('readonly-mode'));
  var EDIT_MODE_CLASS = $_9m9qz3wajcg89g5n.constant($_452cgoz0jcg89gid.resolve('edit-mode'));
  var OuterContainer = function (spec) {
    var root = $_at4sh212jjcg89h46.build(Container.sketch({
      dom: { classes: [$_452cgoz0jcg89gid.resolve('outer-container')].concat(spec.classes) },
      containerBehaviours: $_eid12yw3jcg89g3y.derive([Swapping.config({
          alpha: READ_ONLY_MODE_CLASS(),
          omega: EDIT_MODE_CLASS()
        })])
    }));
    return $_5z9s5614yjcg89hll.takeover(root);
  };

  var AndroidRealm = function (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_452cgoz0jcg89gid.resolve('android-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_g2cejo129jcg89h2e.api();
    var switchToEdit = $_g43xo714qjcg89hjq.makeEditSwitch(webapp);
    var socket = $_g43xo714qjcg89hjq.makeSocket();
    var dropup = $_52d4wa14rjcg89hk0.build($_9m9qz3wajcg89g5n.noop, scrollIntoView);
    alloy.add(toolbar.wrapper());
    alloy.add(socket);
    alloy.add(dropup.component());
    var setToolbarGroups = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setGroups(groups);
    };
    var setContextToolbar = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setContextToolbar(groups);
    };
    var focusToolbar = function () {
      toolbar.focus();
    };
    var restoreToolbar = function () {
      toolbar.restoreToolbar();
    };
    var init = function (spec) {
      webapp.set($_7bkniz13mjcg89hcl.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        w.exit();
        Replacing.remove(socket, switchToEdit);
      });
    };
    var updateMode = function (readOnly) {
      $_g43xo714qjcg89hjq.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_9m9qz3wajcg89g5n.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_9m9qz3wajcg89g5n.constant(socket),
      dropup: $_9m9qz3wajcg89g5n.constant(dropup)
    };
  };

  var initEvents$1 = function (editorApi, iosApi, toolstrip, socket, dropup) {
    var saveSelectionFirst = function () {
      iosApi.run(function (api) {
        api.highlightSelection();
      });
    };
    var refreshIosSelection = function () {
      iosApi.run(function (api) {
        api.refreshSelection();
      });
    };
    var scrollToY = function (yTop, height) {
      var y = yTop - socket.dom().scrollTop;
      iosApi.run(function (api) {
        api.scrollIntoView(y, y + height);
      });
    };
    var scrollToElement = function (target) {
      scrollToY(iosApi, socket);
    };
    var scrollToCursor = function () {
      editorApi.getCursorBox().each(function (box) {
        scrollToY(box.top(), box.height());
      });
    };
    var clearSelection = function () {
      iosApi.run(function (api) {
        api.clearSelection();
      });
    };
    var clearAndRefresh = function () {
      clearSelection();
      refreshThrottle.throttle();
    };
    var refreshView = function () {
      scrollToCursor();
      iosApi.run(function (api) {
        api.syncHeight();
      });
    };
    var reposition = function () {
      var toolbarHeight = $_cpvhuyzqjcg89glx.get(toolstrip);
      iosApi.run(function (api) {
        api.setViewportOffset(toolbarHeight);
      });
      refreshIosSelection();
      refreshView();
    };
    var toEditing = function () {
      iosApi.run(function (api) {
        api.toEditing();
      });
    };
    var toReading = function () {
      iosApi.run(function (api) {
        api.toReading();
      });
    };
    var onToolbarTouch = function (event) {
      iosApi.run(function (api) {
        api.onToolbarTouch(event);
      });
    };
    var tapping = $_btaki413pjcg89hdm.monitor(editorApi);
    var refreshThrottle = $_6agf3k14jjcg89hi8.last(refreshView, 300);
    var listeners = [
      editorApi.onKeyup(clearAndRefresh),
      editorApi.onNodeChanged(refreshIosSelection),
      editorApi.onDomChanged(refreshThrottle.throttle),
      editorApi.onDomChanged(refreshIosSelection),
      editorApi.onScrollToCursor(function (tinyEvent) {
        tinyEvent.preventDefault();
        refreshThrottle.throttle();
      }),
      editorApi.onScrollToElement(function (event) {
        scrollToElement(event.element());
      }),
      editorApi.onToEditing(toEditing),
      editorApi.onToReading(toReading),
      $_4df9s813jjcg89hcb.bind(editorApi.doc(), 'touchend', function (touchEvent) {
        if ($_n5s8aw7jcg89g53.eq(editorApi.html(), touchEvent.target()) || $_n5s8aw7jcg89g53.eq(editorApi.body(), touchEvent.target())) {
        }
      }),
      $_4df9s813jjcg89hcb.bind(toolstrip, 'transitionend', function (transitionEvent) {
        if (transitionEvent.raw().propertyName === 'height') {
          reposition();
        }
      }),
      $_4df9s813jjcg89hcb.capture(toolstrip, 'touchstart', function (touchEvent) {
        saveSelectionFirst();
        onToolbarTouch(touchEvent);
        editorApi.onTouchToolstrip();
      }),
      $_4df9s813jjcg89hcb.bind(editorApi.body(), 'touchstart', function (evt) {
        clearSelection();
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_4df9s813jjcg89hcb.bind(editorApi.body(), 'click', function (event) {
        event.kill();
      }),
      $_4df9s813jjcg89hcb.bind(toolstrip, 'touchmove', function () {
        editorApi.onToolbarScrollStart();
      })
    ];
    var destroy = function () {
      $_89wx8cw8jcg89g5d.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_6m62rw159jcg89hog = { initEvents: initEvents$1 };

  var refreshInput = function (input) {
    var start = input.dom().selectionStart;
    var end = input.dom().selectionEnd;
    var dir = input.dom().selectionDirection;
    setTimeout(function () {
      input.dom().setSelectionRange(start, end, dir);
      $_72ito4yfjcg89gf5.focus(input);
    }, 50);
  };
  var refresh = function (winScope) {
    var sel = winScope.getSelection();
    if (sel.rangeCount > 0) {
      var br = sel.getRangeAt(0);
      var r = winScope.document.createRange();
      r.setStart(br.startContainer, br.startOffset);
      r.setEnd(br.endContainer, br.endOffset);
      sel.removeAllRanges();
      sel.addRange(r);
    }
  };
  var $_2ek5j215djcg89hpq = {
    refreshInput: refreshInput,
    refresh: refresh
  };

  var resume$1 = function (cWin, frame) {
    $_72ito4yfjcg89gf5.active().each(function (active) {
      if (!$_n5s8aw7jcg89g53.eq(active, frame)) {
        $_72ito4yfjcg89gf5.blur(active);
      }
    });
    cWin.focus();
    $_72ito4yfjcg89gf5.focus($_a3ihziwsjcg89g6w.fromDom(cWin.document.body));
    $_2ek5j215djcg89hpq.refresh(cWin);
  };
  var $_espege15cjcg89hpl = { resume: resume$1 };

  var FakeSelection = function (win, frame) {
    var doc = win.document;
    var container = $_a3ihziwsjcg89g6w.fromTag('div');
    $_bhzm7gxtjcg89gcg.add(container, $_452cgoz0jcg89gid.resolve('unfocused-selections'));
    $_dhkjply1jcg89gdi.append($_a3ihziwsjcg89g6w.fromDom(doc.documentElement), container);
    var onTouch = $_4df9s813jjcg89hcb.bind(container, 'touchstart', function (event) {
      event.prevent();
      $_espege15cjcg89hpl.resume(win, frame);
      clear();
    });
    var make = function (rectangle) {
      var span = $_a3ihziwsjcg89g6w.fromTag('span');
      $_3a6uq212xjcg89h7v.add(span, [
        $_452cgoz0jcg89gid.resolve('layer-editor'),
        $_452cgoz0jcg89gid.resolve('unfocused-selection')
      ]);
      $_17fn7izrjcg89glz.setAll(span, {
        left: rectangle.left() + 'px',
        top: rectangle.top() + 'px',
        width: rectangle.width() + 'px',
        height: rectangle.height() + 'px'
      });
      return span;
    };
    var update = function () {
      clear();
      var rectangles = $_1qia313vjcg89heh.getRectangles(win);
      var spans = $_89wx8cw8jcg89g5d.map(rectangles, make);
      $_6xk1mcy5jcg89ge8.append(container, spans);
    };
    var clear = function () {
      $_cs3l5zy4jcg89ge4.empty(container);
    };
    var destroy = function () {
      onTouch.unbind();
      $_cs3l5zy4jcg89ge4.remove(container);
    };
    var isActive = function () {
      return $_3ndsgfy2jcg89gdr.children(container).length > 0;
    };
    return {
      update: update,
      isActive: isActive,
      destroy: destroy,
      clear: clear
    };
  };

  var nu$9 = function (baseFn) {
    var data = $_en0sddw9jcg89g5j.none();
    var callbacks = [];
    var map = function (f) {
      return nu$9(function (nCallback) {
        get(function (data) {
          nCallback(f(data));
        });
      });
    };
    var get = function (nCallback) {
      if (isReady())
        call(nCallback);
      else
        callbacks.push(nCallback);
    };
    var set = function (x) {
      data = $_en0sddw9jcg89g5j.some(x);
      run(callbacks);
      callbacks = [];
    };
    var isReady = function () {
      return data.isSome();
    };
    var run = function (cbs) {
      $_89wx8cw8jcg89g5d.each(cbs, call);
    };
    var call = function (cb) {
      data.each(function (x) {
        setTimeout(function () {
          cb(x);
        }, 0);
      });
    };
    baseFn(set);
    return {
      get: get,
      map: map,
      isReady: isReady
    };
  };
  var pure$2 = function (a) {
    return nu$9(function (callback) {
      callback(a);
    });
  };
  var $_ala02a15gjcg89hq7 = {
    nu: nu$9,
    pure: pure$2
  };

  var bounce = function (f) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var me = this;
      setTimeout(function () {
        f.apply(me, args);
      }, 0);
    };
  };
  var $_bvhhxx15hjcg89hq9 = { bounce: bounce };

  var nu$8 = function (baseFn) {
    var get = function (callback) {
      baseFn($_bvhhxx15hjcg89hq9.bounce(callback));
    };
    var map = function (fab) {
      return nu$8(function (callback) {
        get(function (a) {
          var value = fab(a);
          callback(value);
        });
      });
    };
    var bind = function (aFutureB) {
      return nu$8(function (callback) {
        get(function (a) {
          aFutureB(a).get(callback);
        });
      });
    };
    var anonBind = function (futureB) {
      return nu$8(function (callback) {
        get(function (a) {
          futureB.get(callback);
        });
      });
    };
    var toLazy = function () {
      return $_ala02a15gjcg89hq7.nu(get);
    };
    return {
      map: map,
      bind: bind,
      anonBind: anonBind,
      toLazy: toLazy,
      get: get
    };
  };
  var pure$1 = function (a) {
    return nu$8(function (callback) {
      callback(a);
    });
  };
  var $_4en7ux15fjcg89hq6 = {
    nu: nu$8,
    pure: pure$1
  };

  var adjust = function (value, destination, amount) {
    if (Math.abs(value - destination) <= amount) {
      return $_en0sddw9jcg89g5j.none();
    } else if (value < destination) {
      return $_en0sddw9jcg89g5j.some(value + amount);
    } else {
      return $_en0sddw9jcg89g5j.some(value - amount);
    }
  };
  var create$8 = function () {
    var interval = null;
    var animate = function (getCurrent, destination, amount, increment, doFinish, rate) {
      var finished = false;
      var finish = function (v) {
        finished = true;
        doFinish(v);
      };
      clearInterval(interval);
      var abort = function (v) {
        clearInterval(interval);
        finish(v);
      };
      interval = setInterval(function () {
        var value = getCurrent();
        adjust(value, destination, amount).fold(function () {
          clearInterval(interval);
          finish(destination);
        }, function (s) {
          increment(s, abort);
          if (!finished) {
            var newValue = getCurrent();
            if (newValue !== s || Math.abs(newValue - destination) > Math.abs(value - destination)) {
              clearInterval(interval);
              finish(destination);
            }
          }
        });
      }, rate);
    };
    return { animate: animate };
  };
  var $_3iqjq515ijcg89hqa = {
    create: create$8,
    adjust: adjust
  };

  var findDevice = function (deviceWidth, deviceHeight) {
    var devices = [
      {
        width: 320,
        height: 480,
        keyboard: {
          portrait: 300,
          landscape: 240
        }
      },
      {
        width: 320,
        height: 568,
        keyboard: {
          portrait: 300,
          landscape: 240
        }
      },
      {
        width: 375,
        height: 667,
        keyboard: {
          portrait: 305,
          landscape: 240
        }
      },
      {
        width: 414,
        height: 736,
        keyboard: {
          portrait: 320,
          landscape: 240
        }
      },
      {
        width: 768,
        height: 1024,
        keyboard: {
          portrait: 320,
          landscape: 400
        }
      },
      {
        width: 1024,
        height: 1366,
        keyboard: {
          portrait: 380,
          landscape: 460
        }
      }
    ];
    return $_crwoiuydjcg89gf3.findMap(devices, function (device) {
      return deviceWidth <= device.width && deviceHeight <= device.height ? $_en0sddw9jcg89g5j.some(device.keyboard) : $_en0sddw9jcg89g5j.none();
    }).getOr({
      portrait: deviceHeight / 5,
      landscape: deviceWidth / 4
    });
  };
  var $_2gwvh815ljcg89hqv = { findDevice: findDevice };

  var softKeyboardLimits = function (outerWindow) {
    return $_2gwvh815ljcg89hqv.findDevice(outerWindow.screen.width, outerWindow.screen.height);
  };
  var accountableKeyboardHeight = function (outerWindow) {
    var portrait = $_ac8rkn13ijcg89hc3.get(outerWindow).isPortrait();
    var limits = softKeyboardLimits(outerWindow);
    var keyboard = portrait ? limits.portrait : limits.landscape;
    var visualScreenHeight = portrait ? outerWindow.screen.height : outerWindow.screen.width;
    return visualScreenHeight - outerWindow.innerHeight > keyboard ? 0 : keyboard;
  };
  var getGreenzone = function (socket, dropup) {
    var outerWindow = $_3ndsgfy2jcg89gdr.owner(socket).dom().defaultView;
    var viewportHeight = $_cpvhuyzqjcg89glx.get(socket) + $_cpvhuyzqjcg89glx.get(dropup);
    var acc = accountableKeyboardHeight(outerWindow);
    return viewportHeight - acc;
  };
  var updatePadding = function (contentBody, socket, dropup) {
    var greenzoneHeight = getGreenzone(socket, dropup);
    var deltaHeight = $_cpvhuyzqjcg89glx.get(socket) + $_cpvhuyzqjcg89glx.get(dropup) - greenzoneHeight;
    $_17fn7izrjcg89glz.set(contentBody, 'padding-bottom', deltaHeight + 'px');
  };
  var $_2np37o15kjcg89hqr = {
    getGreenzone: getGreenzone,
    updatePadding: updatePadding
  };

  var fixture = $_6nnct0x3jcg89g8q.generate([
    {
      fixed: [
        'element',
        'property',
        'offsetY'
      ]
    },
    {
      scroller: [
        'element',
        'offsetY'
      ]
    }
  ]);
  var yFixedData = 'data-' + $_452cgoz0jcg89gid.resolve('position-y-fixed');
  var yFixedProperty = 'data-' + $_452cgoz0jcg89gid.resolve('y-property');
  var yScrollingData = 'data-' + $_452cgoz0jcg89gid.resolve('scrolling');
  var windowSizeData = 'data-' + $_452cgoz0jcg89gid.resolve('last-window-height');
  var getYFixedData = function (element) {
    return $_3grge613ujcg89hee.safeParse(element, yFixedData);
  };
  var getYFixedProperty = function (element) {
    return $_69krbwxvjcg89gck.get(element, yFixedProperty);
  };
  var getLastWindowSize = function (element) {
    return $_3grge613ujcg89hee.safeParse(element, windowSizeData);
  };
  var classifyFixed = function (element, offsetY) {
    var prop = getYFixedProperty(element);
    return fixture.fixed(element, prop, offsetY);
  };
  var classifyScrolling = function (element, offsetY) {
    return fixture.scroller(element, offsetY);
  };
  var classify = function (element) {
    var offsetY = getYFixedData(element);
    var classifier = $_69krbwxvjcg89gck.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
    return classifier(element, offsetY);
  };
  var findFixtures = function (container) {
    var candidates = $_63rwmczjjcg89gkz.descendants(container, '[' + yFixedData + ']');
    return $_89wx8cw8jcg89g5d.map(candidates, classify);
  };
  var takeoverToolbar = function (toolbar) {
    var oldToolbarStyle = $_69krbwxvjcg89gck.get(toolbar, 'style');
    $_17fn7izrjcg89glz.setAll(toolbar, {
      position: 'absolute',
      top: '0px'
    });
    $_69krbwxvjcg89gck.set(toolbar, yFixedData, '0px');
    $_69krbwxvjcg89gck.set(toolbar, yFixedProperty, 'top');
    var restore = function () {
      $_69krbwxvjcg89gck.set(toolbar, 'style', oldToolbarStyle || '');
      $_69krbwxvjcg89gck.remove(toolbar, yFixedData);
      $_69krbwxvjcg89gck.remove(toolbar, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverViewport = function (toolbarHeight, height, viewport) {
    var oldViewportStyle = $_69krbwxvjcg89gck.get(viewport, 'style');
    $_apsj7a13gjcg89hbq.register(viewport);
    $_17fn7izrjcg89glz.setAll(viewport, {
      position: 'absolute',
      height: height + 'px',
      width: '100%',
      top: toolbarHeight + 'px'
    });
    $_69krbwxvjcg89gck.set(viewport, yFixedData, toolbarHeight + 'px');
    $_69krbwxvjcg89gck.set(viewport, yScrollingData, 'true');
    $_69krbwxvjcg89gck.set(viewport, yFixedProperty, 'top');
    var restore = function () {
      $_apsj7a13gjcg89hbq.deregister(viewport);
      $_69krbwxvjcg89gck.set(viewport, 'style', oldViewportStyle || '');
      $_69krbwxvjcg89gck.remove(viewport, yFixedData);
      $_69krbwxvjcg89gck.remove(viewport, yScrollingData);
      $_69krbwxvjcg89gck.remove(viewport, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverDropup = function (dropup, toolbarHeight, viewportHeight) {
    var oldDropupStyle = $_69krbwxvjcg89gck.get(dropup, 'style');
    $_17fn7izrjcg89glz.setAll(dropup, {
      position: 'absolute',
      bottom: '0px'
    });
    $_69krbwxvjcg89gck.set(dropup, yFixedData, '0px');
    $_69krbwxvjcg89gck.set(dropup, yFixedProperty, 'bottom');
    var restore = function () {
      $_69krbwxvjcg89gck.set(dropup, 'style', oldDropupStyle || '');
      $_69krbwxvjcg89gck.remove(dropup, yFixedData);
      $_69krbwxvjcg89gck.remove(dropup, yFixedProperty);
    };
    return { restore: restore };
  };
  var deriveViewportHeight = function (viewport, toolbarHeight, dropupHeight) {
    var outerWindow = $_3ndsgfy2jcg89gdr.owner(viewport).dom().defaultView;
    var winH = outerWindow.innerHeight;
    $_69krbwxvjcg89gck.set(viewport, windowSizeData, winH + 'px');
    return winH - toolbarHeight - dropupHeight;
  };
  var takeover$1 = function (viewport, contentBody, toolbar, dropup) {
    var outerWindow = $_3ndsgfy2jcg89gdr.owner(viewport).dom().defaultView;
    var toolbarSetup = takeoverToolbar(toolbar);
    var toolbarHeight = $_cpvhuyzqjcg89glx.get(toolbar);
    var dropupHeight = $_cpvhuyzqjcg89glx.get(dropup);
    var viewportHeight = deriveViewportHeight(viewport, toolbarHeight, dropupHeight);
    var viewportSetup = takeoverViewport(toolbarHeight, viewportHeight, viewport);
    var dropupSetup = takeoverDropup(dropup, toolbarHeight, viewportHeight);
    var isActive = true;
    var restore = function () {
      isActive = false;
      toolbarSetup.restore();
      viewportSetup.restore();
      dropupSetup.restore();
    };
    var isExpanding = function () {
      var currentWinHeight = outerWindow.innerHeight;
      var lastWinHeight = getLastWindowSize(viewport);
      return currentWinHeight > lastWinHeight;
    };
    var refresh = function () {
      if (isActive) {
        var newToolbarHeight = $_cpvhuyzqjcg89glx.get(toolbar);
        var dropupHeight_1 = $_cpvhuyzqjcg89glx.get(dropup);
        var newHeight = deriveViewportHeight(viewport, newToolbarHeight, dropupHeight_1);
        $_69krbwxvjcg89gck.set(viewport, yFixedData, newToolbarHeight + 'px');
        $_17fn7izrjcg89glz.set(viewport, 'height', newHeight + 'px');
        $_17fn7izrjcg89glz.set(dropup, 'bottom', -(newToolbarHeight + newHeight + dropupHeight_1) + 'px');
        $_2np37o15kjcg89hqr.updatePadding(contentBody, viewport, dropup);
      }
    };
    var setViewportOffset = function (newYOffset) {
      var offsetPx = newYOffset + 'px';
      $_69krbwxvjcg89gck.set(viewport, yFixedData, offsetPx);
      refresh();
    };
    $_2np37o15kjcg89hqr.updatePadding(contentBody, viewport, dropup);
    return {
      setViewportOffset: setViewportOffset,
      isExpanding: isExpanding,
      isShrinking: $_9m9qz3wajcg89g5n.not(isExpanding),
      refresh: refresh,
      restore: restore
    };
  };
  var $_5qqi715jjcg89hqe = {
    findFixtures: findFixtures,
    takeover: takeover$1,
    getYFixedData: getYFixedData
  };

  var animator = $_3iqjq515ijcg89hqa.create();
  var ANIMATION_STEP = 15;
  var NUM_TOP_ANIMATION_FRAMES = 10;
  var ANIMATION_RATE = 10;
  var lastScroll = 'data-' + $_452cgoz0jcg89gid.resolve('last-scroll-top');
  var getTop = function (element) {
    var raw = $_17fn7izrjcg89glz.getRaw(element, 'top').getOr(0);
    return parseInt(raw, 10);
  };
  var getScrollTop = function (element) {
    return parseInt(element.dom().scrollTop, 10);
  };
  var moveScrollAndTop = function (element, destination, finalTop) {
    return $_4en7ux15fjcg89hq6.nu(function (callback) {
      var getCurrent = $_9m9qz3wajcg89g5n.curry(getScrollTop, element);
      var update = function (newScroll) {
        element.dom().scrollTop = newScroll;
        $_17fn7izrjcg89glz.set(element, 'top', getTop(element) + ANIMATION_STEP + 'px');
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_17fn7izrjcg89glz.set(element, 'top', finalTop + 'px');
        callback(destination);
      };
      animator.animate(getCurrent, destination, ANIMATION_STEP, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyScroll = function (element, destination) {
    return $_4en7ux15fjcg89hq6.nu(function (callback) {
      var getCurrent = $_9m9qz3wajcg89g5n.curry(getScrollTop, element);
      $_69krbwxvjcg89gck.set(element, lastScroll, getCurrent());
      var update = function (newScroll, abort) {
        var previous = $_3grge613ujcg89hee.safeParse(element, lastScroll);
        if (previous !== element.dom().scrollTop) {
          abort(element.dom().scrollTop);
        } else {
          element.dom().scrollTop = newScroll;
          $_69krbwxvjcg89gck.set(element, lastScroll, newScroll);
        }
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_69krbwxvjcg89gck.set(element, lastScroll, destination);
        callback(destination);
      };
      var distance = Math.abs(destination - getCurrent());
      var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
      animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyTop = function (element, destination) {
    return $_4en7ux15fjcg89hq6.nu(function (callback) {
      var getCurrent = $_9m9qz3wajcg89g5n.curry(getTop, element);
      var update = function (newTop) {
        $_17fn7izrjcg89glz.set(element, 'top', newTop + 'px');
      };
      var finish = function () {
        update(destination);
        callback(destination);
      };
      var distance = Math.abs(destination - getCurrent());
      var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
      animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
    });
  };
  var updateTop = function (element, amount) {
    var newTop = amount + $_5qqi715jjcg89hqe.getYFixedData(element) + 'px';
    $_17fn7izrjcg89glz.set(element, 'top', newTop);
  };
  var moveWindowScroll = function (toolbar, viewport, destY) {
    var outerWindow = $_3ndsgfy2jcg89gdr.owner(toolbar).dom().defaultView;
    return $_4en7ux15fjcg89hq6.nu(function (callback) {
      updateTop(toolbar, destY);
      updateTop(viewport, destY);
      outerWindow.scrollTo(0, destY);
      callback(destY);
    });
  };
  var $_1jjap015ejcg89hpv = {
    moveScrollAndTop: moveScrollAndTop,
    moveOnlyScroll: moveOnlyScroll,
    moveOnlyTop: moveOnlyTop,
    moveWindowScroll: moveWindowScroll
  };

  var BackgroundActivity = function (doAction) {
    var action = Cell($_ala02a15gjcg89hq7.pure({}));
    var start = function (value) {
      var future = $_ala02a15gjcg89hq7.nu(function (callback) {
        return doAction(value).get(callback);
      });
      action.set(future);
    };
    var idle = function (g) {
      action.get().get(function () {
        g();
      });
    };
    return {
      start: start,
      idle: idle
    };
  };

  var scrollIntoView = function (cWin, socket, dropup, top, bottom) {
    var greenzone = $_2np37o15kjcg89hqr.getGreenzone(socket, dropup);
    var refreshCursor = $_9m9qz3wajcg89g5n.curry($_2ek5j215djcg89hpq.refresh, cWin);
    if (top > greenzone || bottom > greenzone) {
      $_1jjap015ejcg89hpv.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
    } else if (top < 0) {
      $_1jjap015ejcg89hpv.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
    } else {
    }
  };
  var $_c23t7915njcg89hr6 = { scrollIntoView: scrollIntoView };

  var par$1 = function (asyncValues, nu) {
    return nu(function (callback) {
      var r = [];
      var count = 0;
      var cb = function (i) {
        return function (value) {
          r[i] = value;
          count++;
          if (count >= asyncValues.length) {
            callback(r);
          }
        };
      };
      if (asyncValues.length === 0) {
        callback([]);
      } else {
        $_89wx8cw8jcg89g5d.each(asyncValues, function (asyncValue, i) {
          asyncValue.get(cb(i));
        });
      }
    });
  };
  var $_6tb76c15qjcg89hrk = { par: par$1 };

  var par = function (futures) {
    return $_6tb76c15qjcg89hrk.par(futures, $_4en7ux15fjcg89hq6.nu);
  };
  var mapM = function (array, fn) {
    var futures = $_89wx8cw8jcg89g5d.map(array, fn);
    return par(futures);
  };
  var compose$1 = function (f, g) {
    return function (a) {
      return g(a).bind(f);
    };
  };
  var $_9qv65g15pjcg89hrh = {
    par: par,
    mapM: mapM,
    compose: compose$1
  };

  var updateFixed = function (element, property, winY, offsetY) {
    var destination = winY + offsetY;
    $_17fn7izrjcg89glz.set(element, property, destination + 'px');
    return $_4en7ux15fjcg89hq6.pure(offsetY);
  };
  var updateScrollingFixed = function (element, winY, offsetY) {
    var destTop = winY + offsetY;
    var oldProp = $_17fn7izrjcg89glz.getRaw(element, 'top').getOr(offsetY);
    var delta = destTop - parseInt(oldProp, 10);
    var destScroll = element.dom().scrollTop + delta;
    return $_1jjap015ejcg89hpv.moveScrollAndTop(element, destScroll, destTop);
  };
  var updateFixture = function (fixture, winY) {
    return fixture.fold(function (element, property, offsetY) {
      return updateFixed(element, property, winY, offsetY);
    }, function (element, offsetY) {
      return updateScrollingFixed(element, winY, offsetY);
    });
  };
  var updatePositions = function (container, winY) {
    var fixtures = $_5qqi715jjcg89hqe.findFixtures(container);
    var updates = $_89wx8cw8jcg89g5d.map(fixtures, function (fixture) {
      return updateFixture(fixture, winY);
    });
    return $_9qv65g15pjcg89hrh.par(updates);
  };
  var $_fnpm315ojcg89hra = { updatePositions: updatePositions };

  var input = function (parent, operation) {
    var input = $_a3ihziwsjcg89g6w.fromTag('input');
    $_17fn7izrjcg89glz.setAll(input, {
      opacity: '0',
      position: 'absolute',
      top: '-1000px',
      left: '-1000px'
    });
    $_dhkjply1jcg89gdi.append(parent, input);
    $_72ito4yfjcg89gf5.focus(input);
    operation(input);
    $_cs3l5zy4jcg89ge4.remove(input);
  };
  var $_9vmjlz15rjcg89hrl = { input: input };

  var VIEW_MARGIN = 5;
  var register$2 = function (toolstrip, socket, container, outerWindow, structure, cWin) {
    var scroller = BackgroundActivity(function (y) {
      return $_1jjap015ejcg89hpv.moveWindowScroll(toolstrip, socket, y);
    });
    var scrollBounds = function () {
      var rects = $_1qia313vjcg89heh.getRectangles(cWin);
      return $_en0sddw9jcg89g5j.from(rects[0]).bind(function (rect) {
        var viewTop = rect.top() - socket.dom().scrollTop;
        var outside = viewTop > outerWindow.innerHeight + VIEW_MARGIN || viewTop < -VIEW_MARGIN;
        return outside ? $_en0sddw9jcg89g5j.some({
          top: $_9m9qz3wajcg89g5n.constant(viewTop),
          bottom: $_9m9qz3wajcg89g5n.constant(viewTop + rect.height())
        }) : $_en0sddw9jcg89g5j.none();
      });
    };
    var scrollThrottle = $_6agf3k14jjcg89hi8.last(function () {
      scroller.idle(function () {
        $_fnpm315ojcg89hra.updatePositions(container, outerWindow.pageYOffset).get(function () {
          var extraScroll = scrollBounds();
          extraScroll.each(function (extra) {
            socket.dom().scrollTop = socket.dom().scrollTop + extra.top();
          });
          scroller.start(0);
          structure.refresh();
        });
      });
    }, 1000);
    var onScroll = $_4df9s813jjcg89hcb.bind($_a3ihziwsjcg89g6w.fromDom(outerWindow), 'scroll', function () {
      if (outerWindow.pageYOffset < 0) {
        return;
      }
      scrollThrottle.throttle();
    });
    $_fnpm315ojcg89hra.updatePositions(container, outerWindow.pageYOffset).get($_9m9qz3wajcg89g5n.identity);
    return { unbind: onScroll.unbind };
  };
  var setup$3 = function (bag) {
    var cWin = bag.cWin();
    var ceBody = bag.ceBody();
    var socket = bag.socket();
    var toolstrip = bag.toolstrip();
    var toolbar = bag.toolbar();
    var contentElement = bag.contentElement();
    var keyboardType = bag.keyboardType();
    var outerWindow = bag.outerWindow();
    var dropup = bag.dropup();
    var structure = $_5qqi715jjcg89hqe.takeover(socket, ceBody, toolstrip, dropup);
    var keyboardModel = keyboardType(bag.outerBody(), cWin, $_c2mv10y6jcg89gec.body(), contentElement, toolstrip, toolbar);
    var toEditing = function () {
      keyboardModel.toEditing();
      clearSelection();
    };
    var toReading = function () {
      keyboardModel.toReading();
    };
    var onToolbarTouch = function (event) {
      keyboardModel.onToolbarTouch(event);
    };
    var onOrientation = $_ac8rkn13ijcg89hc3.onChange(outerWindow, {
      onChange: $_9m9qz3wajcg89g5n.noop,
      onReady: structure.refresh
    });
    onOrientation.onAdjustment(function () {
      structure.refresh();
    });
    var onResize = $_4df9s813jjcg89hcb.bind($_a3ihziwsjcg89g6w.fromDom(outerWindow), 'resize', function () {
      if (structure.isExpanding()) {
        structure.refresh();
      }
    });
    var onScroll = register$2(toolstrip, socket, bag.outerBody(), outerWindow, structure, cWin);
    var unfocusedSelection = FakeSelection(cWin, contentElement);
    var refreshSelection = function () {
      if (unfocusedSelection.isActive()) {
        unfocusedSelection.update();
      }
    };
    var highlightSelection = function () {
      unfocusedSelection.update();
    };
    var clearSelection = function () {
      unfocusedSelection.clear();
    };
    var scrollIntoView = function (top, bottom) {
      $_c23t7915njcg89hr6.scrollIntoView(cWin, socket, dropup, top, bottom);
    };
    var syncHeight = function () {
      $_17fn7izrjcg89glz.set(contentElement, 'height', contentElement.dom().contentWindow.document.body.scrollHeight + 'px');
    };
    var setViewportOffset = function (newYOffset) {
      structure.setViewportOffset(newYOffset);
      $_1jjap015ejcg89hpv.moveOnlyTop(socket, newYOffset).get($_9m9qz3wajcg89g5n.identity);
    };
    var destroy = function () {
      structure.restore();
      onOrientation.destroy();
      onScroll.unbind();
      onResize.unbind();
      keyboardModel.destroy();
      unfocusedSelection.destroy();
      $_9vmjlz15rjcg89hrl.input($_c2mv10y6jcg89gec.body(), $_72ito4yfjcg89gf5.blur);
    };
    return {
      toEditing: toEditing,
      toReading: toReading,
      onToolbarTouch: onToolbarTouch,
      refreshSelection: refreshSelection,
      clearSelection: clearSelection,
      highlightSelection: highlightSelection,
      scrollIntoView: scrollIntoView,
      updateToolbarPadding: $_9m9qz3wajcg89g5n.noop,
      setViewportOffset: setViewportOffset,
      syncHeight: syncHeight,
      refreshStructure: structure.refresh,
      destroy: destroy
    };
  };
  var $_1gvp3015ajcg89hot = { setup: setup$3 };

  var stubborn = function (outerBody, cWin, page, frame) {
    var toEditing = function () {
      $_espege15cjcg89hpl.resume(cWin, frame);
    };
    var toReading = function () {
      $_9vmjlz15rjcg89hrl.input(outerBody, $_72ito4yfjcg89gf5.blur);
    };
    var captureInput = $_4df9s813jjcg89hcb.bind(page, 'keydown', function (evt) {
      if (!$_89wx8cw8jcg89g5d.contains([
          'input',
          'textarea'
        ], $_xqscexwjcg89gct.name(evt.target()))) {
        toEditing();
      }
    });
    var onToolbarTouch = function () {
    };
    var destroy = function () {
      captureInput.unbind();
    };
    return {
      toReading: toReading,
      toEditing: toEditing,
      onToolbarTouch: onToolbarTouch,
      destroy: destroy
    };
  };
  var timid = function (outerBody, cWin, page, frame) {
    var dismissKeyboard = function () {
      $_72ito4yfjcg89gf5.blur(frame);
    };
    var onToolbarTouch = function () {
      dismissKeyboard();
    };
    var toReading = function () {
      dismissKeyboard();
    };
    var toEditing = function () {
      $_espege15cjcg89hpl.resume(cWin, frame);
    };
    return {
      toReading: toReading,
      toEditing: toEditing,
      onToolbarTouch: onToolbarTouch,
      destroy: $_9m9qz3wajcg89g5n.noop
    };
  };
  var $_2r3i115sjcg89hrq = {
    stubborn: stubborn,
    timid: timid
  };

  var create$7 = function (platform, mask) {
    var meta = $_8771l714gjcg89hhg.tag();
    var priorState = $_g2cejo129jcg89h2e.value();
    var scrollEvents = $_g2cejo129jcg89h2e.value();
    var iosApi = $_g2cejo129jcg89h2e.api();
    var iosEvents = $_g2cejo129jcg89h2e.api();
    var enter = function () {
      mask.hide();
      var doc = $_a3ihziwsjcg89g6w.fromDom(document);
      $_b1amh214ejcg89hgw.getActiveApi(platform.editor).each(function (editorApi) {
        priorState.set({
          socketHeight: $_17fn7izrjcg89glz.getRaw(platform.socket, 'height'),
          iframeHeight: $_17fn7izrjcg89glz.getRaw(editorApi.frame(), 'height'),
          outerScroll: document.body.scrollTop
        });
        scrollEvents.set({ exclusives: $_2awuup14pjcg89hjj.exclusive(doc, '.' + $_apsj7a13gjcg89hbq.scrollable()) });
        $_bhzm7gxtjcg89gcg.add(platform.container, $_452cgoz0jcg89gid.resolve('fullscreen-maximized'));
        $_70kwvh14fjcg89hh8.clobberStyles(platform.container, editorApi.body());
        meta.maximize();
        $_17fn7izrjcg89glz.set(platform.socket, 'overflow', 'scroll');
        $_17fn7izrjcg89glz.set(platform.socket, '-webkit-overflow-scrolling', 'touch');
        $_72ito4yfjcg89gf5.focus(editorApi.body());
        var setupBag = $_4pc2ltxljcg89gc2.immutableBag([
          'cWin',
          'ceBody',
          'socket',
          'toolstrip',
          'toolbar',
          'dropup',
          'contentElement',
          'cursor',
          'keyboardType',
          'isScrolling',
          'outerWindow',
          'outerBody'
        ], []);
        iosApi.set($_1gvp3015ajcg89hot.setup(setupBag({
          cWin: editorApi.win(),
          ceBody: editorApi.body(),
          socket: platform.socket,
          toolstrip: platform.toolstrip,
          toolbar: platform.toolbar,
          dropup: platform.dropup.element(),
          contentElement: editorApi.frame(),
          cursor: $_9m9qz3wajcg89g5n.noop,
          outerBody: platform.body,
          outerWindow: platform.win,
          keyboardType: $_2r3i115sjcg89hrq.stubborn,
          isScrolling: function () {
            return scrollEvents.get().exists(function (s) {
              return s.socket.isScrolling();
            });
          }
        })));
        iosApi.run(function (api) {
          api.syncHeight();
        });
        iosEvents.set($_6m62rw159jcg89hog.initEvents(editorApi, iosApi, platform.toolstrip, platform.socket, platform.dropup));
      });
    };
    var exit = function () {
      meta.restore();
      iosEvents.clear();
      iosApi.clear();
      mask.show();
      priorState.on(function (s) {
        s.socketHeight.each(function (h) {
          $_17fn7izrjcg89glz.set(platform.socket, 'height', h);
        });
        s.iframeHeight.each(function (h) {
          $_17fn7izrjcg89glz.set(platform.editor.getFrame(), 'height', h);
        });
        document.body.scrollTop = s.scrollTop;
      });
      priorState.clear();
      scrollEvents.on(function (s) {
        s.exclusives.unbind();
      });
      scrollEvents.clear();
      $_bhzm7gxtjcg89gcg.remove(platform.container, $_452cgoz0jcg89gid.resolve('fullscreen-maximized'));
      $_70kwvh14fjcg89hh8.restoreStyles();
      $_apsj7a13gjcg89hbq.deregister(platform.toolbar);
      $_17fn7izrjcg89glz.remove(platform.socket, 'overflow');
      $_17fn7izrjcg89glz.remove(platform.socket, '-webkit-overflow-scrolling');
      $_72ito4yfjcg89gf5.blur(platform.editor.getFrame());
      $_b1amh214ejcg89hgw.getActiveApi(platform.editor).each(function (editorApi) {
        editorApi.clearSelection();
      });
    };
    var refreshStructure = function () {
      iosApi.run(function (api) {
        api.refreshStructure();
      });
    };
    return {
      enter: enter,
      refreshStructure: refreshStructure,
      exit: exit
    };
  };
  var $_ekwvf9158jcg89ho2 = { create: create$7 };

  var produce$1 = function (raw) {
    var mobile = $_51tzzcxgjcg89gax.asRawOrDie('Getting IosWebapp schema', MobileSchema, raw);
    $_17fn7izrjcg89glz.set(mobile.toolstrip, 'width', '100%');
    $_17fn7izrjcg89glz.set(mobile.container, 'position', 'relative');
    var onView = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_at4sh212jjcg89h46.build($_99ca0p14ijcg89hi1.sketch(onView, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    var mode = $_ekwvf9158jcg89ho2.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: mode.refreshStructure,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_9m9qz3wajcg89g5n.noop
    };
  };
  var $_8voas5157jcg89hns = { produce: produce$1 };

  var IosRealm = function (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_452cgoz0jcg89gid.resolve('ios-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_g2cejo129jcg89h2e.api();
    var switchToEdit = $_g43xo714qjcg89hjq.makeEditSwitch(webapp);
    var socket = $_g43xo714qjcg89hjq.makeSocket();
    var dropup = $_52d4wa14rjcg89hk0.build(function () {
      webapp.run(function (w) {
        w.refreshStructure();
      });
    }, scrollIntoView);
    alloy.add(toolbar.wrapper());
    alloy.add(socket);
    alloy.add(dropup.component());
    var setToolbarGroups = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setGroups(groups);
    };
    var setContextToolbar = function (rawGroups) {
      var groups = toolbar.createGroups(rawGroups);
      toolbar.setContextToolbar(groups);
    };
    var focusToolbar = function () {
      toolbar.focus();
    };
    var restoreToolbar = function () {
      toolbar.restoreToolbar();
    };
    var init = function (spec) {
      webapp.set($_8voas5157jcg89hns.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        Replacing.remove(socket, switchToEdit);
        w.exit();
      });
    };
    var updateMode = function (readOnly) {
      $_g43xo714qjcg89hjq.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_9m9qz3wajcg89g5n.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_9m9qz3wajcg89g5n.constant(socket),
      dropup: $_9m9qz3wajcg89g5n.constant(dropup)
    };
  };

  var EditorManager = tinymce.util.Tools.resolve('tinymce.EditorManager');

  var derive$4 = function (editor) {
    var base = $_b52oxhx5jcg89g9l.readOptFrom(editor.settings, 'skin_url').fold(function () {
      return EditorManager.baseURL + '/skins/' + 'lightgray';
    }, function (url) {
      return url;
    });
    return {
      content: base + '/content.mobile.min.css',
      ui: base + '/skin.mobile.min.css'
    };
  };
  var $_esrqz115tjcg89hs2 = { derive: derive$4 };

  var fontSizes = [
    'x-small',
    'small',
    'medium',
    'large',
    'x-large'
  ];
  var fireChange$1 = function (realm, command, state) {
    realm.system().broadcastOn([$_3fc8hyynjcg89gfx.formatChanged()], {
      command: command,
      state: state
    });
  };
  var init$5 = function (realm, editor) {
    var allFormats = $_gbrpaqwzjcg89g7p.keys(editor.formatter.get());
    $_89wx8cw8jcg89g5d.each(allFormats, function (command) {
      editor.formatter.formatChanged(command, function (state) {
        fireChange$1(realm, command, state);
      });
    });
    $_89wx8cw8jcg89g5d.each([
      'ul',
      'ol'
    ], function (command) {
      editor.selection.selectorChanged(command, function (state, data) {
        fireChange$1(realm, command, state);
      });
    });
  };
  var $_81vr9i15vjcg89hs4 = {
    init: init$5,
    fontSizes: $_9m9qz3wajcg89g5n.constant(fontSizes)
  };

  var fireSkinLoaded = function (editor) {
    var done = function () {
      editor._skinLoaded = true;
      editor.fire('SkinLoaded');
    };
    return function () {
      if (editor.initialized) {
        done();
      } else {
        editor.on('init', done);
      }
    };
  };
  var $_1z91ga15wjcg89hs8 = { fireSkinLoaded: fireSkinLoaded };

  var READING = $_9m9qz3wajcg89g5n.constant('toReading');
  var EDITING = $_9m9qz3wajcg89g5n.constant('toEditing');
  ThemeManager.add('mobile', function (editor) {
    var renderUI = function (args) {
      var cssUrls = $_esrqz115tjcg89hs2.derive(editor);
      if ($_evcn8gymjcg89gfw.isSkinDisabled(editor) === false) {
        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, $_1z91ga15wjcg89hs8.fireSkinLoaded(editor));
      } else {
        $_1z91ga15wjcg89hs8.fireSkinLoaded(editor)();
      }
      var doScrollIntoView = function () {
        editor.fire('scrollIntoView');
      };
      var wrapper = $_a3ihziwsjcg89g6w.fromTag('div');
      var realm = $_aoftmbwfjcg89g5y.detect().os.isAndroid() ? AndroidRealm(doScrollIntoView) : IosRealm(doScrollIntoView);
      var original = $_a3ihziwsjcg89g6w.fromDom(args.targetNode);
      $_dhkjply1jcg89gdi.after(original, wrapper);
      $_d31i57y0jcg89gd5.attachSystem(wrapper, realm.system());
      var findFocusIn = function (elem) {
        return $_72ito4yfjcg89gf5.search(elem).bind(function (focused) {
          return realm.system().getByDom(focused).toOption();
        });
      };
      var outerWindow = args.targetNode.ownerDocument.defaultView;
      var orientation = $_ac8rkn13ijcg89hc3.onChange(outerWindow, {
        onChange: function () {
          var alloy = realm.system();
          alloy.broadcastOn([$_3fc8hyynjcg89gfx.orientationChanged()], { width: $_ac8rkn13ijcg89hc3.getActualWidth(outerWindow) });
        },
        onReady: $_9m9qz3wajcg89g5n.noop
      });
      var setReadOnly = function (readOnlyGroups, mainGroups, ro) {
        if (ro === false) {
          editor.selection.collapse();
        }
        realm.setToolbarGroups(ro ? readOnlyGroups.get() : mainGroups.get());
        editor.setMode(ro === true ? 'readonly' : 'design');
        editor.fire(ro === true ? READING() : EDITING());
        realm.updateMode(ro);
      };
      var bindHandler = function (label, handler) {
        editor.on(label, handler);
        return {
          unbind: function () {
            editor.off(label);
          }
        };
      };
      editor.on('init', function () {
        realm.init({
          editor: {
            getFrame: function () {
              return $_a3ihziwsjcg89g6w.fromDom(editor.contentAreaContainer.querySelector('iframe'));
            },
            onDomChanged: function () {
              return { unbind: $_9m9qz3wajcg89g5n.noop };
            },
            onToReading: function (handler) {
              return bindHandler(READING(), handler);
            },
            onToEditing: function (handler) {
              return bindHandler(EDITING(), handler);
            },
            onScrollToCursor: function (handler) {
              editor.on('scrollIntoView', function (tinyEvent) {
                handler(tinyEvent);
              });
              var unbind = function () {
                editor.off('scrollIntoView');
                orientation.destroy();
              };
              return { unbind: unbind };
            },
            onTouchToolstrip: function () {
              hideDropup();
            },
            onTouchContent: function () {
              var toolbar = $_a3ihziwsjcg89g6w.fromDom(editor.editorContainer.querySelector('.' + $_452cgoz0jcg89gid.resolve('toolbar')));
              findFocusIn(toolbar).each($_fpm2ctwujcg89g73.emitExecute);
              realm.restoreToolbar();
              hideDropup();
            },
            onTapContent: function (evt) {
              var target = evt.target();
              if ($_xqscexwjcg89gct.name(target) === 'img') {
                editor.selection.select(target.dom());
                evt.kill();
              } else if ($_xqscexwjcg89gct.name(target) === 'a') {
                var component = realm.system().getByDom($_a3ihziwsjcg89g6w.fromDom(editor.editorContainer));
                component.each(function (container) {
                  if (Swapping.isAlpha(container)) {
                    $_5hlo1nyljcg89gfv.openLink(target.dom());
                  }
                });
              }
            }
          },
          container: $_a3ihziwsjcg89g6w.fromDom(editor.editorContainer),
          socket: $_a3ihziwsjcg89g6w.fromDom(editor.contentAreaContainer),
          toolstrip: $_a3ihziwsjcg89g6w.fromDom(editor.editorContainer.querySelector('.' + $_452cgoz0jcg89gid.resolve('toolstrip'))),
          toolbar: $_a3ihziwsjcg89g6w.fromDom(editor.editorContainer.querySelector('.' + $_452cgoz0jcg89gid.resolve('toolbar'))),
          dropup: realm.dropup(),
          alloy: realm.system(),
          translate: $_9m9qz3wajcg89g5n.noop,
          setReadOnly: function (ro) {
            setReadOnly(readOnlyGroups, mainGroups, ro);
          }
        });
        var hideDropup = function () {
          realm.dropup().disappear(function () {
            realm.system().broadcastOn([$_3fc8hyynjcg89gfx.dropupDismissed()], {});
          });
        };
        $_bj47tfy7jcg89geh.registerInspector('remove this', realm.system());
        var backToMaskGroup = {
          label: 'The first group',
          scrollable: false,
          items: [$_5sd8nuz1jcg89gih.forToolbar('back', function () {
              editor.selection.collapse();
              realm.exit();
            }, {})]
        };
        var backToReadOnlyGroup = {
          label: 'Back to read only',
          scrollable: false,
          items: [$_5sd8nuz1jcg89gih.forToolbar('readonly-back', function () {
              setReadOnly(readOnlyGroups, mainGroups, true);
            }, {})]
        };
        var readOnlyGroup = {
          label: 'The read only mode group',
          scrollable: true,
          items: []
        };
        var features = $_3n6dgqyojcg89gg0.setup(realm, editor);
        var items = $_3n6dgqyojcg89gg0.detect(editor.settings, features);
        var actionGroup = {
          label: 'the action group',
          scrollable: true,
          items: items
        };
        var extraGroup = {
          label: 'The extra group',
          scrollable: false,
          items: []
        };
        var mainGroups = Cell([
          backToReadOnlyGroup,
          actionGroup,
          extraGroup
        ]);
        var readOnlyGroups = Cell([
          backToMaskGroup,
          readOnlyGroup,
          extraGroup
        ]);
        $_81vr9i15vjcg89hs4.init(realm, editor);
      });
      return {
        iframeContainer: realm.socket().element().dom(),
        editorContainer: realm.element().dom()
      };
    };
    return {
      getNotificationManagerImpl: function () {
        return {
          open: $_9m9qz3wajcg89g5n.identity,
          close: $_9m9qz3wajcg89g5n.noop,
          reposition: $_9m9qz3wajcg89g5n.noop,
          getArgs: $_9m9qz3wajcg89g5n.identity
        };
      },
      renderUI: renderUI
    };
  });
  var Theme = function () {
  };

  return Theme;

}());
})()
