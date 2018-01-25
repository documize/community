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
  var $_b4h1biwbjcun41ml = {
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

  var never = $_b4h1biwbjcun41ml.never;
  var always = $_b4h1biwbjcun41ml.always;
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
      toString: $_b4h1biwbjcun41ml.constant('none()')
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
  var $_fseuruwajcun41mi = {
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
    return r === -1 ? $_fseuruwajcun41mi.none() : $_fseuruwajcun41mi.some(r);
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
        return $_fseuruwajcun41mi.some(x);
      }
    }
    return $_fseuruwajcun41mi.none();
  };
  var findIndex = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return $_fseuruwajcun41mi.some(i);
      }
    }
    return $_fseuruwajcun41mi.none();
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
    return xs.length === 0 ? $_fseuruwajcun41mi.none() : $_fseuruwajcun41mi.some(xs[0]);
  };
  var last = function (xs) {
    return xs.length === 0 ? $_fseuruwajcun41mi.none() : $_fseuruwajcun41mi.some(xs[xs.length - 1]);
  };
  var $_bjvqngw9jcun41mb = {
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
  var $_9z5nijwejcun41ms = {
    path: path,
    resolve: resolve,
    forge: forge,
    namespace: namespace
  };

  var unsafe = function (name, scope) {
    return $_9z5nijwejcun41ms.resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_89lxb8wdjcun41mo = { getOrDie: getOrDie };

  var node = function () {
    var f = $_89lxb8wdjcun41mo.getOrDie('Node');
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
  var $_5oy7xuwcjcun41mn = {
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
  var $_9r9hd7whjcun41mw = { cached: cached };

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
  var $_9k0w48wkjcun41n5 = {
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
      version: $_9k0w48wkjcun41n5.unknown()
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
  var $_eambawjjcun41my = {
    unknown: unknown,
    nu: nu,
    edge: $_b4h1biwbjcun41ml.constant(edge),
    chrome: $_b4h1biwbjcun41ml.constant(chrome),
    ie: $_b4h1biwbjcun41ml.constant(ie),
    opera: $_b4h1biwbjcun41ml.constant(opera),
    firefox: $_b4h1biwbjcun41ml.constant(firefox),
    safari: $_b4h1biwbjcun41ml.constant(safari)
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
      version: $_9k0w48wkjcun41n5.unknown()
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
  var $_4si1wgwljcun41n6 = {
    unknown: unknown$2,
    nu: nu$2,
    windows: $_b4h1biwbjcun41ml.constant(windows),
    ios: $_b4h1biwbjcun41ml.constant(ios),
    android: $_b4h1biwbjcun41ml.constant(android),
    linux: $_b4h1biwbjcun41ml.constant(linux),
    osx: $_b4h1biwbjcun41ml.constant(osx),
    solaris: $_b4h1biwbjcun41ml.constant(solaris),
    freebsd: $_b4h1biwbjcun41ml.constant(freebsd)
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
      isiPad: $_b4h1biwbjcun41ml.constant(isiPad),
      isiPhone: $_b4h1biwbjcun41ml.constant(isiPhone),
      isTablet: $_b4h1biwbjcun41ml.constant(isTablet),
      isPhone: $_b4h1biwbjcun41ml.constant(isPhone),
      isTouch: $_b4h1biwbjcun41ml.constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: $_b4h1biwbjcun41ml.constant(iOSwebview)
    };
  };

  var detect$3 = function (candidates, userAgent) {
    var agent = String(userAgent).toLowerCase();
    return $_bjvqngw9jcun41mb.find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$3(browsers, userAgent).map(function (browser) {
      var version = $_9k0w48wkjcun41n5.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$3(oses, userAgent).map(function (os) {
      var version = $_9k0w48wkjcun41n5.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_c2xijfwnjcun41nb = {
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
  var $_edu2svwqjcun41nj = {
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
    return str === '' ? $_fseuruwajcun41mi.none() : $_fseuruwajcun41mi.some(str.substr(0, 1));
  };
  var tail = function (str) {
    return str === '' ? $_fseuruwajcun41mi.none() : $_fseuruwajcun41mi.some(str.substring(1));
  };
  var $_1rflrgwrjcun41nk = {
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
    return startsWith(str, prefix) ? $_edu2svwqjcun41nj.removeFromStart(str, prefix.length) : str;
  };
  var removeTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? $_edu2svwqjcun41nj.removeFromEnd(str, prefix.length) : str;
  };
  var ensureLeading = function (str, prefix) {
    return startsWith(str, prefix) ? str : $_edu2svwqjcun41nj.addToStart(str, prefix);
  };
  var ensureTrailing = function (str, prefix) {
    return endsWith(str, prefix) ? str : $_edu2svwqjcun41nj.addToEnd(str, prefix);
  };
  var contains$2 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };
  var capitalize = function (str) {
    return $_1rflrgwrjcun41nk.head(str).bind(function (head) {
      return $_1rflrgwrjcun41nk.tail(str).map(function (tail) {
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
  var $_dzv179wpjcun41nh = {
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
      return $_dzv179wpjcun41nh.contains(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = $_dzv179wpjcun41nh.contains(uastring, 'edge/') && $_dzv179wpjcun41nh.contains(uastring, 'chrome') && $_dzv179wpjcun41nh.contains(uastring, 'safari') && $_dzv179wpjcun41nh.contains(uastring, 'applewebkit');
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
        return $_dzv179wpjcun41nh.contains(uastring, 'chrome') && !$_dzv179wpjcun41nh.contains(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return $_dzv179wpjcun41nh.contains(uastring, 'msie') || $_dzv179wpjcun41nh.contains(uastring, 'trident');
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
        return ($_dzv179wpjcun41nh.contains(uastring, 'safari') || $_dzv179wpjcun41nh.contains(uastring, 'mobile/')) && $_dzv179wpjcun41nh.contains(uastring, 'applewebkit');
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
        return $_dzv179wpjcun41nh.contains(uastring, 'iphone') || $_dzv179wpjcun41nh.contains(uastring, 'ipad');
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
  var $_4alg6jwojcun41ne = {
    browsers: $_b4h1biwbjcun41ml.constant(browsers),
    oses: $_b4h1biwbjcun41ml.constant(oses)
  };

  var detect$1 = function (userAgent) {
    var browsers = $_4alg6jwojcun41ne.browsers();
    var oses = $_4alg6jwojcun41ne.oses();
    var browser = $_c2xijfwnjcun41nb.detectBrowser(browsers, userAgent).fold($_eambawjjcun41my.unknown, $_eambawjjcun41my.nu);
    var os = $_c2xijfwnjcun41nb.detectOs(oses, userAgent).fold($_4si1wgwljcun41n6.unknown, $_4si1wgwljcun41n6.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_fp3aqcwijcun41mx = { detect: detect$1 };

  var detect = $_9r9hd7whjcun41mw.cached(function () {
    var userAgent = navigator.userAgent;
    return $_fp3aqcwijcun41mx.detect(userAgent);
  });
  var $_2lzqzhwgjcun41mu = { detect: detect };

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
    return { dom: $_b4h1biwbjcun41ml.constant(node) };
  };
  var fromPoint = function (doc, x, y) {
    return $_fseuruwajcun41mi.from(doc.dom().elementFromPoint(x, y)).map(fromDom);
  };
  var $_adhjdxwtjcun41nq = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_96feeswujcun41nt = {
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

  var ELEMENT = $_96feeswujcun41nt.ELEMENT;
  var DOCUMENT = $_96feeswujcun41nt.DOCUMENT;
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
    return bypassSelector(base) ? [] : $_bjvqngw9jcun41mb.map(base.querySelectorAll(selector), $_adhjdxwtjcun41nq.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? $_fseuruwajcun41mi.none() : $_fseuruwajcun41mi.from(base.querySelector(selector)).map($_adhjdxwtjcun41nq.fromDom);
  };
  var $_5if0vzwsjcun41nl = {
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
    return $_bjvqngw9jcun41mb.exists(elements, $_b4h1biwbjcun41ml.curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_5oy7xuwcjcun41mn.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_2lzqzhwgjcun41mu.detect().browser;
  var contains = browser.isIE() ? ieContains : regularContains;
  var $_6hi5odw8jcun41m3 = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains,
    is: $_5if0vzwsjcun41nl.is
  };

  var isSource = function (component, simulatedEvent) {
    return $_6hi5odw8jcun41m3.eq(component.element(), simulatedEvent.event().target());
  };
  var $_5jcz03w7jcun41m0 = { isSource: isSource };

  var $_ay8498wxjcun41o3 = {
    contextmenu: $_b4h1biwbjcun41ml.constant('contextmenu'),
    touchstart: $_b4h1biwbjcun41ml.constant('touchstart'),
    touchmove: $_b4h1biwbjcun41ml.constant('touchmove'),
    touchend: $_b4h1biwbjcun41ml.constant('touchend'),
    gesturestart: $_b4h1biwbjcun41ml.constant('gesturestart'),
    mousedown: $_b4h1biwbjcun41ml.constant('mousedown'),
    mousemove: $_b4h1biwbjcun41ml.constant('mousemove'),
    mouseout: $_b4h1biwbjcun41ml.constant('mouseout'),
    mouseup: $_b4h1biwbjcun41ml.constant('mouseup'),
    mouseover: $_b4h1biwbjcun41ml.constant('mouseover'),
    focusin: $_b4h1biwbjcun41ml.constant('focusin'),
    keydown: $_b4h1biwbjcun41ml.constant('keydown'),
    input: $_b4h1biwbjcun41ml.constant('input'),
    change: $_b4h1biwbjcun41ml.constant('change'),
    focus: $_b4h1biwbjcun41ml.constant('focus'),
    click: $_b4h1biwbjcun41ml.constant('click'),
    transitionend: $_b4h1biwbjcun41ml.constant('transitionend'),
    selectstart: $_b4h1biwbjcun41ml.constant('selectstart')
  };

  var alloy = { tap: $_b4h1biwbjcun41ml.constant('alloy.tap') };
  var $_8672kiwwjcun41o0 = {
    focus: $_b4h1biwbjcun41ml.constant('alloy.focus'),
    postBlur: $_b4h1biwbjcun41ml.constant('alloy.blur.post'),
    receive: $_b4h1biwbjcun41ml.constant('alloy.receive'),
    execute: $_b4h1biwbjcun41ml.constant('alloy.execute'),
    focusItem: $_b4h1biwbjcun41ml.constant('alloy.focus.item'),
    tap: alloy.tap,
    tapOrClick: $_2lzqzhwgjcun41mu.detect().deviceType.isTouch() ? alloy.tap : $_ay8498wxjcun41o3.click,
    longpress: $_b4h1biwbjcun41ml.constant('alloy.longpress'),
    sandboxClose: $_b4h1biwbjcun41ml.constant('alloy.sandbox.close'),
    systemInit: $_b4h1biwbjcun41ml.constant('alloy.system.init'),
    windowScroll: $_b4h1biwbjcun41ml.constant('alloy.system.scroll'),
    attachedToDom: $_b4h1biwbjcun41ml.constant('alloy.system.attached'),
    detachedFromDom: $_b4h1biwbjcun41ml.constant('alloy.system.detached'),
    changeTab: $_b4h1biwbjcun41ml.constant('alloy.change.tab'),
    dismissTab: $_b4h1biwbjcun41ml.constant('alloy.dismiss.tab')
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
  var $_bqe5v5wzjcun41o7 = {
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
    var bothObjects = $_bqe5v5wzjcun41o7.isObject(old) && $_bqe5v5wzjcun41o7.isObject(nu);
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
  var $_do57nmwyjcun41o6 = {
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
        return $_fseuruwajcun41mi.some(x);
      }
    }
    return $_fseuruwajcun41mi.none();
  };
  var values = function (obj) {
    return mapToArray(obj, function (v) {
      return v;
    });
  };
  var size = function (obj) {
    return values(obj).length;
  };
  var $_fwofm0x0jcun41o8 = {
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
    emit(component, $_8672kiwwjcun41o0.execute());
  };
  var dispatch = function (component, target, event) {
    dispatchWith(component, target, event, {});
  };
  var dispatchWith = function (component, target, event, properties) {
    var data = $_do57nmwyjcun41o6.deepMerge({ target: target }, properties);
    component.getSystem().triggerEvent(event, target, $_fwofm0x0jcun41o8.map(data, $_b4h1biwbjcun41ml.constant));
  };
  var dispatchEvent = function (component, target, event, simulatedEvent) {
    component.getSystem().triggerEvent(event, target, simulatedEvent.event());
  };
  var dispatchFocus = function (component, target) {
    component.getSystem().triggerFocus(target, component.element());
  };
  var $_ebat3swvjcun41nv = {
    emit: emit,
    emitWith: emitWith,
    emitExecute: emitExecute,
    dispatch: dispatch,
    dispatchWith: dispatchWith,
    dispatchEvent: dispatchEvent,
    dispatchFocus: dispatchFocus
  };

  var generate = function (cases) {
    if (!$_bqe5v5wzjcun41o7.isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    $_bjvqngw9jcun41mb.each(cases, function (acase, count) {
      var keys = $_fwofm0x0jcun41o8.keys(acase);
      if (keys.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!$_bqe5v5wzjcun41o7.isArray(value)) {
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
          var branchKeys = $_fwofm0x0jcun41o8.keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = $_bjvqngw9jcun41mb.forall(constructors, function (reqKey) {
            return $_bjvqngw9jcun41mb.contains(branchKeys, reqKey);
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
  var $_f19awjx4jcun41p6 = { generate: generate };

  var adt = $_f19awjx4jcun41p6.generate([
    { strict: [] },
    { defaultedThunk: ['fallbackThunk'] },
    { asOption: [] },
    { asDefaultedOptionThunk: ['fallbackThunk'] },
    { mergeWithThunk: ['baseThunk'] }
  ]);
  var defaulted$1 = function (fallback) {
    return adt.defaultedThunk($_b4h1biwbjcun41ml.constant(fallback));
  };
  var asDefaultedOption = function (fallback) {
    return adt.asDefaultedOptionThunk($_b4h1biwbjcun41ml.constant(fallback));
  };
  var mergeWith = function (base) {
    return adt.mergeWithThunk($_b4h1biwbjcun41ml.constant(base));
  };
  var $_3688l1x3jcun41p0 = {
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
      return $_fseuruwajcun41mi.some(o);
    };
    return {
      is: is,
      isValue: $_b4h1biwbjcun41ml.constant(true),
      isError: $_b4h1biwbjcun41ml.constant(false),
      getOr: $_b4h1biwbjcun41ml.constant(o),
      getOrThunk: $_b4h1biwbjcun41ml.constant(o),
      getOrDie: $_b4h1biwbjcun41ml.constant(o),
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
      return $_b4h1biwbjcun41ml.die(message)();
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
      is: $_b4h1biwbjcun41ml.constant(false),
      isValue: $_b4h1biwbjcun41ml.constant(false),
      isError: $_b4h1biwbjcun41ml.constant(true),
      getOr: $_b4h1biwbjcun41ml.identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: $_b4h1biwbjcun41ml.noop,
      bind: bind,
      exists: $_b4h1biwbjcun41ml.constant(false),
      forall: $_b4h1biwbjcun41ml.constant(true),
      toOption: $_fseuruwajcun41mi.none
    };
  };
  var $_8axt1mx8jcun41pw = {
    value: value$1,
    error: error
  };

  var comparison = $_f19awjx4jcun41p6.generate([
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
    $_bjvqngw9jcun41mb.each(results, function (result) {
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
  var $_85i7lox9jcun41py = {
    partition: partition$1,
    compare: compare
  };

  var mergeValues = function (values, base) {
    return $_8axt1mx8jcun41pw.value($_do57nmwyjcun41o6.deepMerge.apply(undefined, [base].concat(values)));
  };
  var mergeErrors = function (errors) {
    return $_b4h1biwbjcun41ml.compose($_8axt1mx8jcun41pw.error, $_bjvqngw9jcun41mb.flatten)(errors);
  };
  var consolidateObj = function (objects, base) {
    var partitions = $_85i7lox9jcun41py.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : mergeValues(partitions.values, base);
  };
  var consolidateArr = function (objects) {
    var partitions = $_85i7lox9jcun41py.partition(objects);
    return partitions.errors.length > 0 ? mergeErrors(partitions.errors) : $_8axt1mx8jcun41pw.value(partitions.values);
  };
  var $_2vyjqjx7jcun41pp = {
    consolidateObj: consolidateObj,
    consolidateArr: consolidateArr
  };

  var narrow$1 = function (obj, fields) {
    var r = {};
    $_bjvqngw9jcun41mb.each(fields, function (field) {
      if (obj[field] !== undefined && obj.hasOwnProperty(field))
        r[field] = obj[field];
    });
    return r;
  };
  var indexOnKey$1 = function (array, key) {
    var obj = {};
    $_bjvqngw9jcun41mb.each(array, function (a) {
      var keyValue = a[key];
      obj[keyValue] = a;
    });
    return obj;
  };
  var exclude$1 = function (obj, fields) {
    var r = {};
    $_fwofm0x0jcun41o8.each(obj, function (v, k) {
      if (!$_bjvqngw9jcun41mb.contains(fields, k)) {
        r[k] = v;
      }
    });
    return r;
  };
  var $_aig5jqxajcun41q0 = {
    narrow: narrow$1,
    exclude: exclude$1,
    indexOnKey: indexOnKey$1
  };

  var readOpt$1 = function (key) {
    return function (obj) {
      return obj.hasOwnProperty(key) ? $_fseuruwajcun41mi.from(obj[key]) : $_fseuruwajcun41mi.none();
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
  var $_chw4ruxbjcun41q4 = {
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
    $_bjvqngw9jcun41mb.each(keyvalues, function (kv) {
      r[kv.key] = kv.value;
    });
    return r;
  };
  var $_31cqt7xcjcun41q7 = {
    wrap: wrap$1,
    wrapAll: wrapAll$1
  };

  var narrow = function (obj, fields) {
    return $_aig5jqxajcun41q0.narrow(obj, fields);
  };
  var exclude = function (obj, fields) {
    return $_aig5jqxajcun41q0.exclude(obj, fields);
  };
  var readOpt = function (key) {
    return $_chw4ruxbjcun41q4.readOpt(key);
  };
  var readOr = function (key, fallback) {
    return $_chw4ruxbjcun41q4.readOr(key, fallback);
  };
  var readOptFrom = function (obj, key) {
    return $_chw4ruxbjcun41q4.readOptFrom(obj, key);
  };
  var wrap = function (key, value) {
    return $_31cqt7xcjcun41q7.wrap(key, value);
  };
  var wrapAll = function (keyvalues) {
    return $_31cqt7xcjcun41q7.wrapAll(keyvalues);
  };
  var indexOnKey = function (array, key) {
    return $_aig5jqxajcun41q0.indexOnKey(array, key);
  };
  var consolidate = function (objs, base) {
    return $_2vyjqjx7jcun41pp.consolidateObj(objs, base);
  };
  var hasKey = function (obj, key) {
    return $_chw4ruxbjcun41q4.hasKey(obj, key);
  };
  var $_dwtfyfx6jcun41po = {
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
    return $_89lxb8wdjcun41mo.getOrDie('JSON');
  };
  var parse = function (obj) {
    return json().parse(obj);
  };
  var stringify = function (obj, replacer, space) {
    return json().stringify(obj, replacer, space);
  };
  var $_48mdwnxfjcun41qi = {
    parse: parse,
    stringify: stringify
  };

  var formatObj = function (input) {
    return $_bqe5v5wzjcun41o7.isObject(input) && $_fwofm0x0jcun41o8.keys(input).length > 100 ? ' removed due to size' : $_48mdwnxfjcun41qi.stringify(input, null, 2);
  };
  var formatErrors = function (errors) {
    var es = errors.length > 10 ? errors.slice(0, 10).concat([{
        path: [],
        getErrorInfo: function () {
          return '... (only showing first ten failures)';
        }
      }]) : errors;
    return $_bjvqngw9jcun41mb.map(es, function (e) {
      return 'Failed path: (' + e.path.join(' > ') + ')\n' + e.getErrorInfo();
    });
  };
  var $_bjesc5xejcun41qd = {
    formatObj: formatObj,
    formatErrors: formatErrors
  };

  var nu$4 = function (path, getErrorInfo) {
    return $_8axt1mx8jcun41pw.error([{
        path: path,
        getErrorInfo: getErrorInfo
      }]);
  };
  var missingStrict = function (path, key, obj) {
    return nu$4(path, function () {
      return 'Could not find valid *strict* value for "' + key + '" in ' + $_bjesc5xejcun41qd.formatObj(obj);
    });
  };
  var missingKey = function (path, key) {
    return nu$4(path, function () {
      return 'Choice schema did not contain choice key: "' + key + '"';
    });
  };
  var missingBranch = function (path, branches, branch) {
    return nu$4(path, function () {
      return 'The chosen schema: "' + branch + '" did not exist in branches: ' + $_bjesc5xejcun41qd.formatObj(branches);
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
  var $_f8y9hzxdjcun41qa = {
    missingStrict: missingStrict,
    missingKey: missingKey,
    missingBranch: missingBranch,
    unsupportedFields: unsupportedFields,
    custom: custom,
    toString: toString
  };

  var typeAdt = $_f19awjx4jcun41p6.generate([
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
  var fieldAdt = $_f19awjx4jcun41p6.generate([
    {
      field: [
        'name',
        'presence',
        'type'
      ]
    },
    { state: ['name'] }
  ]);
  var $_4oyuc5xgjcun41qk = {
    typeAdt: typeAdt,
    fieldAdt: fieldAdt
  };

  var adt$1 = $_f19awjx4jcun41p6.generate([
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
    return adt$1.state(okey, $_b4h1biwbjcun41ml.constant(value));
  };
  var snapshot = function (okey) {
    return adt$1.state(okey, $_b4h1biwbjcun41ml.identity);
  };
  var strictAccess = function (path, obj, key) {
    return $_chw4ruxbjcun41q4.readOptFrom(obj, key).fold(function () {
      return $_f8y9hzxdjcun41qa.missingStrict(path, key, obj);
    }, $_8axt1mx8jcun41pw.value);
  };
  var fallbackAccess = function (obj, key, fallbackThunk) {
    var v = $_chw4ruxbjcun41q4.readOptFrom(obj, key).fold(function () {
      return fallbackThunk(obj);
    }, $_b4h1biwbjcun41ml.identity);
    return $_8axt1mx8jcun41pw.value(v);
  };
  var optionAccess = function (obj, key) {
    return $_8axt1mx8jcun41pw.value($_chw4ruxbjcun41q4.readOptFrom(obj, key));
  };
  var optionDefaultedAccess = function (obj, key, fallback) {
    var opt = $_chw4ruxbjcun41q4.readOptFrom(obj, key).map(function (val) {
      return val === true ? fallback(obj) : val;
    });
    return $_8axt1mx8jcun41pw.value(opt);
  };
  var cExtractOne = function (path, obj, field, strength) {
    return field.fold(function (key, okey, presence, prop) {
      var bundle = function (av) {
        return prop.extract(path.concat([key]), strength, av).map(function (res) {
          return $_31cqt7xcjcun41q7.wrap(okey, strength(res));
        });
      };
      var bundleAsOption = function (optValue) {
        return optValue.fold(function () {
          var outcome = $_31cqt7xcjcun41q7.wrap(okey, strength($_fseuruwajcun41mi.none()));
          return $_8axt1mx8jcun41pw.value(outcome);
        }, function (ov) {
          return prop.extract(path.concat([key]), strength, ov).map(function (res) {
            return $_31cqt7xcjcun41q7.wrap(okey, strength($_fseuruwajcun41mi.some(res)));
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
          return fallbackAccess(obj, key, $_b4h1biwbjcun41ml.constant({})).map(function (v) {
            return $_do57nmwyjcun41o6.deepMerge(base, v);
          }).bind(bundle);
        });
      }();
    }, function (okey, instantiator) {
      var state = instantiator(obj);
      return $_8axt1mx8jcun41pw.value($_31cqt7xcjcun41q7.wrap(okey, strength(state)));
    });
  };
  var cExtract = function (path, obj, fields, strength) {
    var results = $_bjvqngw9jcun41mb.map(fields, function (field) {
      return cExtractOne(path, obj, field, strength);
    });
    return $_2vyjqjx7jcun41pp.consolidateObj(results, {});
  };
  var value = function (validator) {
    var extract = function (path, strength, val) {
      return validator(val).fold(function (err) {
        return $_f8y9hzxdjcun41qa.custom(path, err);
      }, $_8axt1mx8jcun41pw.value);
    };
    var toString = function () {
      return 'val';
    };
    var toDsl = function () {
      return $_4oyuc5xgjcun41qk.typeAdt.itemOf(validator);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var getSetKeys = function (obj) {
    var keys = $_fwofm0x0jcun41o8.keys(obj);
    return $_bjvqngw9jcun41mb.filter(keys, function (k) {
      return $_dwtfyfx6jcun41po.hasKey(obj, k);
    });
  };
  var objOnly = function (fields) {
    var delegate = obj(fields);
    var fieldNames = $_bjvqngw9jcun41mb.foldr(fields, function (acc, f) {
      return f.fold(function (key) {
        return $_do57nmwyjcun41o6.deepMerge(acc, $_dwtfyfx6jcun41po.wrap(key, true));
      }, $_b4h1biwbjcun41ml.constant(acc));
    }, {});
    var extract = function (path, strength, o) {
      var keys = $_bqe5v5wzjcun41o7.isBoolean(o) ? [] : getSetKeys(o);
      var extra = $_bjvqngw9jcun41mb.filter(keys, function (k) {
        return !$_dwtfyfx6jcun41po.hasKey(fieldNames, k);
      });
      return extra.length === 0 ? delegate.extract(path, strength, o) : $_f8y9hzxdjcun41qa.unsupportedFields(path, extra);
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
      var fieldStrings = $_bjvqngw9jcun41mb.map(fields, function (field) {
        return field.fold(function (key, okey, presence, prop) {
          return key + ' -> ' + prop.toString();
        }, function (okey, instantiator) {
          return 'state(' + okey + ')';
        });
      });
      return 'obj{\n' + fieldStrings.join('\n') + '}';
    };
    var toDsl = function () {
      return $_4oyuc5xgjcun41qk.typeAdt.objOf($_bjvqngw9jcun41mb.map(fields, function (f) {
        return f.fold(function (key, okey, presence, prop) {
          return $_4oyuc5xgjcun41qk.fieldAdt.field(key, presence, prop);
        }, function (okey, instantiator) {
          return $_4oyuc5xgjcun41qk.fieldAdt.state(okey);
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
      var results = $_bjvqngw9jcun41mb.map(array, function (a, i) {
        return prop.extract(path.concat(['[' + i + ']']), strength, a);
      });
      return $_2vyjqjx7jcun41pp.consolidateArr(results);
    };
    var toString = function () {
      return 'array(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_4oyuc5xgjcun41qk.typeAdt.arrOf(prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var setOf = function (validator, prop) {
    var validateKeys = function (path, keys) {
      return arr(value(validator)).extract(path, $_b4h1biwbjcun41ml.identity, keys);
    };
    var extract = function (path, strength, o) {
      var keys = $_fwofm0x0jcun41o8.keys(o);
      return validateKeys(path, keys).bind(function (validKeys) {
        var schema = $_bjvqngw9jcun41mb.map(validKeys, function (vk) {
          return adt$1.field(vk, vk, $_3688l1x3jcun41p0.strict(), prop);
        });
        return obj(schema).extract(path, strength, o);
      });
    };
    var toString = function () {
      return 'setOf(' + prop.toString() + ')';
    };
    var toDsl = function () {
      return $_4oyuc5xgjcun41qk.typeAdt.setOf(validator, prop);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var anyValue = value($_8axt1mx8jcun41pw.value);
  var arrOfObj = $_b4h1biwbjcun41ml.compose(arr, obj);
  var $_evp26ax5jcun41pb = {
    anyValue: $_b4h1biwbjcun41ml.constant(anyValue),
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
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.strict(), $_evp26ax5jcun41pb.anyValue());
  };
  var strictOf = function (key, schema) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.strict(), schema);
  };
  var strictFunction = function (key) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.strict(), $_evp26ax5jcun41pb.value(function (f) {
      return $_bqe5v5wzjcun41o7.isFunction(f) ? $_8axt1mx8jcun41pw.value(f) : $_8axt1mx8jcun41pw.error('Not a function');
    }));
  };
  var forbid = function (key, message) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.asOption(), $_evp26ax5jcun41pb.value(function (v) {
      return $_8axt1mx8jcun41pw.error('The field: ' + key + ' is forbidden. ' + message);
    }));
  };
  var strictArrayOf = function (key, prop) {
    return strictOf(key, prop);
  };
  var strictObjOf = function (key, objSchema) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.strict(), $_evp26ax5jcun41pb.obj(objSchema));
  };
  var strictArrayOfObj = function (key, objFields) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.strict(), $_evp26ax5jcun41pb.arrOfObj(objFields));
  };
  var option = function (key) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.asOption(), $_evp26ax5jcun41pb.anyValue());
  };
  var optionOf = function (key, schema) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.asOption(), schema);
  };
  var optionObjOf = function (key, objSchema) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.asOption(), $_evp26ax5jcun41pb.obj(objSchema));
  };
  var optionObjOfOnly = function (key, objSchema) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.asOption(), $_evp26ax5jcun41pb.objOnly(objSchema));
  };
  var defaulted = function (key, fallback) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.defaulted(fallback), $_evp26ax5jcun41pb.anyValue());
  };
  var defaultedOf = function (key, fallback, schema) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.defaulted(fallback), schema);
  };
  var defaultedObjOf = function (key, fallback, objSchema) {
    return $_evp26ax5jcun41pb.field(key, key, $_3688l1x3jcun41p0.defaulted(fallback), $_evp26ax5jcun41pb.obj(objSchema));
  };
  var field = function (key, okey, presence, prop) {
    return $_evp26ax5jcun41pb.field(key, okey, presence, prop);
  };
  var state = function (okey, instantiator) {
    return $_evp26ax5jcun41pb.state(okey, instantiator);
  };
  var $_84yedrx2jcun41om = {
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
    var fields = $_dwtfyfx6jcun41po.readOptFrom(branches, ch);
    return fields.fold(function () {
      return $_f8y9hzxdjcun41qa.missingBranch(path, branches, ch);
    }, function (fs) {
      return $_evp26ax5jcun41pb.obj(fs).extract(path.concat(['branch: ' + ch]), strength, input);
    });
  };
  var choose$1 = function (key, branches) {
    var extract = function (path, strength, input) {
      var choice = $_dwtfyfx6jcun41po.readOptFrom(input, key);
      return choice.fold(function () {
        return $_f8y9hzxdjcun41qa.missingKey(path, key);
      }, function (chosen) {
        return chooseFrom(path, strength, input, branches, chosen);
      });
    };
    var toString = function () {
      return 'chooseOn(' + key + '). Possible values: ' + $_fwofm0x0jcun41o8.keys(branches);
    };
    var toDsl = function () {
      return $_4oyuc5xgjcun41qk.typeAdt.choiceOf(key, branches);
    };
    return {
      extract: extract,
      toString: toString,
      toDsl: toDsl
    };
  };
  var $_8eaermxijcun41qr = { choose: choose$1 };

  var anyValue$1 = $_evp26ax5jcun41pb.value($_8axt1mx8jcun41pw.value);
  var arrOfObj$1 = function (objFields) {
    return $_evp26ax5jcun41pb.arrOfObj(objFields);
  };
  var arrOfVal = function () {
    return $_evp26ax5jcun41pb.arr(anyValue$1);
  };
  var arrOf = $_evp26ax5jcun41pb.arr;
  var objOf = $_evp26ax5jcun41pb.obj;
  var objOfOnly = $_evp26ax5jcun41pb.objOnly;
  var setOf$1 = $_evp26ax5jcun41pb.setOf;
  var valueOf = function (validator) {
    return $_evp26ax5jcun41pb.value(validator);
  };
  var extract = function (label, prop, strength, obj) {
    return prop.extract([label], strength, obj).fold(function (errs) {
      return $_8axt1mx8jcun41pw.error({
        input: obj,
        errors: errs
      });
    }, $_8axt1mx8jcun41pw.value);
  };
  var asStruct = function (label, prop, obj) {
    return extract(label, prop, $_b4h1biwbjcun41ml.constant, obj);
  };
  var asRaw = function (label, prop, obj) {
    return extract(label, prop, $_b4h1biwbjcun41ml.identity, obj);
  };
  var getOrDie$1 = function (extraction) {
    return extraction.fold(function (errInfo) {
      throw new Error(formatError(errInfo));
    }, $_b4h1biwbjcun41ml.identity);
  };
  var asRawOrDie = function (label, prop, obj) {
    return getOrDie$1(asRaw(label, prop, obj));
  };
  var asStructOrDie = function (label, prop, obj) {
    return getOrDie$1(asStruct(label, prop, obj));
  };
  var formatError = function (errInfo) {
    return 'Errors: \n' + $_bjesc5xejcun41qd.formatErrors(errInfo.errors) + '\n\nInput object: ' + $_bjesc5xejcun41qd.formatObj(errInfo.input);
  };
  var choose = function (key, branches) {
    return $_8eaermxijcun41qr.choose(key, branches);
  };
  var $_a6j4ohxhjcun41qn = {
    anyValue: $_b4h1biwbjcun41ml.constant(anyValue$1),
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
    if (!$_dwtfyfx6jcun41po.hasKey(parts, 'can') && !$_dwtfyfx6jcun41po.hasKey(parts, 'abort') && !$_dwtfyfx6jcun41po.hasKey(parts, 'run'))
      throw new Error('EventHandler defined by: ' + $_48mdwnxfjcun41qi.stringify(parts, null, 2) + ' does not have can, abort, or run!');
    return $_a6j4ohxhjcun41qn.asRawOrDie('Extracting event.handler', $_a6j4ohxhjcun41qn.objOfOnly([
      $_84yedrx2jcun41om.defaulted('can', $_b4h1biwbjcun41ml.constant(true)),
      $_84yedrx2jcun41om.defaulted('abort', $_b4h1biwbjcun41ml.constant(false)),
      $_84yedrx2jcun41om.defaulted('run', $_b4h1biwbjcun41ml.noop)
    ]), parts);
  };
  var all$1 = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_bjvqngw9jcun41mb.foldl(handlers, function (acc, handler) {
        return acc && f(handler).apply(undefined, args);
      }, true);
    };
  };
  var any = function (handlers, f) {
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return $_bjvqngw9jcun41mb.foldl(handlers, function (acc, handler) {
        return acc || f(handler).apply(undefined, args);
      }, false);
    };
  };
  var read = function (handler) {
    return $_bqe5v5wzjcun41o7.isFunction(handler) ? {
      can: $_b4h1biwbjcun41ml.constant(true),
      abort: $_b4h1biwbjcun41ml.constant(false),
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
      $_bjvqngw9jcun41mb.each(handlers, function (handler) {
        handler.run.apply(undefined, args);
      });
    };
    return nu$3({
      can: can,
      abort: abort,
      run: run
    });
  };
  var $_bf3ojtx1jcun41ob = {
    read: read,
    fuse: fuse,
    nu: nu$3
  };

  var derive$1 = $_dwtfyfx6jcun41po.wrapAll;
  var abort = function (name, predicate) {
    return {
      key: name,
      value: $_bf3ojtx1jcun41ob.nu({ abort: predicate })
    };
  };
  var can = function (name, predicate) {
    return {
      key: name,
      value: $_bf3ojtx1jcun41ob.nu({ can: predicate })
    };
  };
  var preventDefault = function (name) {
    return {
      key: name,
      value: $_bf3ojtx1jcun41ob.nu({
        run: function (component, simulatedEvent) {
          simulatedEvent.event().prevent();
        }
      })
    };
  };
  var run = function (name, handler) {
    return {
      key: name,
      value: $_bf3ojtx1jcun41ob.nu({ run: handler })
    };
  };
  var runActionExtra = function (name, action, extra) {
    return {
      key: name,
      value: $_bf3ojtx1jcun41ob.nu({
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
        value: $_bf3ojtx1jcun41ob.nu({
          run: function (component, simulatedEvent) {
            if ($_5jcz03w7jcun41m0.isSource(component, simulatedEvent))
              handler(component, simulatedEvent);
          }
        })
      };
    };
  };
  var redirectToUid = function (name, uid) {
    return run(name, function (component, simulatedEvent) {
      component.getSystem().getByUid(uid).each(function (redirectee) {
        $_ebat3swvjcun41nv.dispatchEvent(redirectee, redirectee.element(), name, simulatedEvent);
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
  var $_d87qm6w6jcun41lv = {
    derive: derive$1,
    run: run,
    preventDefault: preventDefault,
    runActionExtra: runActionExtra,
    runOnAttached: runOnSourceName($_8672kiwwjcun41o0.attachedToDom()),
    runOnDetached: runOnSourceName($_8672kiwwjcun41o0.detachedFromDom()),
    runOnInit: runOnSourceName($_8672kiwwjcun41o0.systemInit()),
    runOnExecute: runOnName($_8672kiwwjcun41o0.execute()),
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
  var getAnnotation = $_fseuruwajcun41mi.none;
  var $_8y3v3cxjjcun41r3 = {
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
      $_bjvqngw9jcun41mb.each(fields, function (name, i) {
        struct[name] = $_b4h1biwbjcun41ml.constant(values[i]);
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
    if (!$_bqe5v5wzjcun41o7.isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    $_bjvqngw9jcun41mb.each(array, function (a) {
      if (!$_bqe5v5wzjcun41o7.isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = $_bjvqngw9jcun41mb.find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };
  var $_355plnxpjcun41rm = {
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
    $_355plnxpjcun41rm.validateStrArr('required', required);
    $_355plnxpjcun41rm.validateStrArr('optional', optional);
    $_355plnxpjcun41rm.checkDupes(everything);
    return function (obj) {
      var keys = $_fwofm0x0jcun41o8.keys(obj);
      var allReqd = $_bjvqngw9jcun41mb.forall(required, function (req) {
        return $_bjvqngw9jcun41mb.contains(keys, req);
      });
      if (!allReqd)
        $_355plnxpjcun41rm.reqMessage(required, keys);
      var unsupported = $_bjvqngw9jcun41mb.filter(keys, function (key) {
        return !$_bjvqngw9jcun41mb.contains(everything, key);
      });
      if (unsupported.length > 0)
        $_355plnxpjcun41rm.unsuppMessage(unsupported);
      var r = {};
      $_bjvqngw9jcun41mb.each(required, function (req) {
        r[req] = $_b4h1biwbjcun41ml.constant(obj[req]);
      });
      $_bjvqngw9jcun41mb.each(optional, function (opt) {
        r[opt] = $_b4h1biwbjcun41ml.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? $_fseuruwajcun41mi.some(obj[opt]) : $_fseuruwajcun41mi.none());
      });
      return r;
    };
  };

  var $_36fc2ixmjcun41ri = {
    immutable: Immutable,
    immutableBag: MixedBag
  };

  var nu$6 = $_36fc2ixmjcun41ri.immutableBag(['tag'], [
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
    return $_48mdwnxfjcun41qi.stringify(raw, null, 2);
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
  var $_fq0viixljcun41rf = {
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
  var nu$5 = $_36fc2ixmjcun41ri.immutableBag([], fields);
  var derive$2 = function (settings) {
    var r = {};
    var keys = $_fwofm0x0jcun41o8.keys(settings);
    $_bjvqngw9jcun41mb.each(keys, function (key) {
      settings[key].each(function (v) {
        r[key] = v;
      });
    });
    return nu$5(r);
  };
  var modToStr = function (mod) {
    var raw = modToRaw(mod);
    return $_48mdwnxfjcun41qi.stringify(raw, null, 2);
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
        return $_dwtfyfx6jcun41po.wrap(key, arr2);
      });
    }, function (arr1) {
      return oArr2.fold(function () {
        return $_dwtfyfx6jcun41po.wrap(key, arr1);
      }, function (arr2) {
        return $_dwtfyfx6jcun41po.wrap(key, arr2);
      });
    });
  };
  var merge$1 = function (defnA, mod) {
    var raw = $_do57nmwyjcun41o6.deepMerge({
      tag: defnA.tag(),
      classes: mod.classes().getOr([]).concat(defnA.classes().getOr([])),
      attributes: $_do57nmwyjcun41o6.merge(defnA.attributes().getOr({}), mod.attributes().getOr({})),
      styles: $_do57nmwyjcun41o6.merge(defnA.styles().getOr({}), mod.styles().getOr({}))
    }, mod.innerHtml().or(defnA.innerHtml()).map(function (innerHtml) {
      return $_dwtfyfx6jcun41po.wrap('innerHtml', innerHtml);
    }).getOr({}), clashingOptArrays('domChildren', mod.domChildren(), defnA.domChildren()), clashingOptArrays('defChildren', mod.defChildren(), defnA.defChildren()), mod.value().or(defnA.value()).map(function (value) {
      return $_dwtfyfx6jcun41po.wrap('value', value);
    }).getOr({}));
    return $_fq0viixljcun41rf.nu(raw);
  };
  var $_1tv7mlxkjcun41r6 = {
    nu: nu$5,
    derive: derive$2,
    merge: merge$1,
    modToStr: modToStr,
    modToRaw: modToRaw
  };

  var executeEvent = function (bConfig, bState, executor) {
    return $_d87qm6w6jcun41lv.runOnExecute(function (component) {
      executor(component, bConfig, bState);
    });
  };
  var loadEvent = function (bConfig, bState, f) {
    return $_d87qm6w6jcun41lv.runOnInit(function (component, simulatedEvent) {
      f(component, bConfig, bState);
    });
  };
  var create$1 = function (schema, name, active, apis, extra, state) {
    var configSchema = $_a6j4ohxhjcun41qn.objOfOnly(schema);
    var schemaSchema = $_84yedrx2jcun41om.optionObjOf(name, [$_84yedrx2jcun41om.optionObjOfOnly('config', schema)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var createModes$1 = function (modes, name, active, apis, extra, state) {
    var configSchema = modes;
    var schemaSchema = $_84yedrx2jcun41om.optionObjOf(name, [$_84yedrx2jcun41om.optionOf('config', modes)]);
    return doCreate(configSchema, schemaSchema, name, active, apis, extra, state);
  };
  var wrapApi = function (bName, apiFunction, apiName) {
    var f = function (component) {
      var args = arguments;
      return component.config({ name: $_b4h1biwbjcun41ml.constant(bName) }).fold(function () {
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
    return $_8y3v3cxjjcun41r3.markAsBehaviourApi(f, apiName, apiFunction);
  };
  var revokeBehaviour = function (name) {
    return {
      key: name,
      value: undefined
    };
  };
  var doCreate = function (configSchema, schemaSchema, name, active, apis, extra, state) {
    var getConfig = function (info) {
      return $_dwtfyfx6jcun41po.hasKey(info, name) ? info[name]() : $_fseuruwajcun41mi.none();
    };
    var wrappedApis = $_fwofm0x0jcun41o8.map(apis, function (apiF, apiName) {
      return wrapApi(name, apiF, apiName);
    });
    var wrappedExtra = $_fwofm0x0jcun41o8.map(extra, function (extraF, extraName) {
      return $_8y3v3cxjjcun41r3.markAsExtraApi(extraF, extraName);
    });
    var me = $_do57nmwyjcun41o6.deepMerge(wrappedExtra, wrappedApis, {
      revoke: $_b4h1biwbjcun41ml.curry(revokeBehaviour, name),
      config: function (spec) {
        var prepared = $_a6j4ohxhjcun41qn.asStructOrDie(name + '-config', configSchema, spec);
        return {
          key: name,
          value: {
            config: prepared,
            me: me,
            configAsRaw: $_9r9hd7whjcun41mw.cached(function () {
              return $_a6j4ohxhjcun41qn.asRawOrDie(name + '-config', configSchema, spec);
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
          return $_dwtfyfx6jcun41po.readOptFrom(active, 'exhibit').map(function (exhibitor) {
            return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr($_1tv7mlxkjcun41r6.nu({}));
      },
      name: function () {
        return name;
      },
      handlers: function (info) {
        return getConfig(info).bind(function (behaviourInfo) {
          return $_dwtfyfx6jcun41po.readOptFrom(active, 'events').map(function (events) {
            return events(behaviourInfo.config, behaviourInfo.state);
          });
        }).getOr({});
      }
    });
    return me;
  };
  var $_fga8psw5jcun41lc = {
    executeEvent: executeEvent,
    loadEvent: loadEvent,
    create: create$1,
    createModes: createModes$1
  };

  var base = function (handleUnsupported, required) {
    return baseWith(handleUnsupported, required, {
      validate: $_bqe5v5wzjcun41o7.isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    $_355plnxpjcun41rm.validateStrArr('required', required);
    $_355plnxpjcun41rm.checkDupes(required);
    return function (obj) {
      var keys = $_fwofm0x0jcun41o8.keys(obj);
      var allReqd = $_bjvqngw9jcun41mb.forall(required, function (req) {
        return $_bjvqngw9jcun41mb.contains(keys, req);
      });
      if (!allReqd)
        $_355plnxpjcun41rm.reqMessage(required, keys);
      handleUnsupported(required, keys);
      var invalidKeys = $_bjvqngw9jcun41mb.filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        $_355plnxpjcun41rm.invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys) {
    var unsupported = $_bjvqngw9jcun41mb.filter(keys, function (key) {
      return !$_bjvqngw9jcun41mb.contains(required, key);
    });
    if (unsupported.length > 0)
      $_355plnxpjcun41rm.unsuppMessage(unsupported);
  };
  var allowExtra = $_b4h1biwbjcun41ml.noop;
  var $_2nffbjxsjcun41rs = {
    exactly: $_b4h1biwbjcun41ml.curry(base, handleExact),
    ensure: $_b4h1biwbjcun41ml.curry(base, allowExtra),
    ensureWith: $_b4h1biwbjcun41ml.curry(baseWith, allowExtra)
  };

  var BehaviourState = $_2nffbjxsjcun41rs.ensure(['readState']);

  var init = function () {
    return BehaviourState({
      readState: function () {
        return 'No State required';
      }
    });
  };
  var $_gfn15dxqjcun41rp = { init: init };

  var derive = function (capabilities) {
    return $_dwtfyfx6jcun41po.wrapAll(capabilities);
  };
  var simpleSchema = $_a6j4ohxhjcun41qn.objOfOnly([
    $_84yedrx2jcun41om.strict('fields'),
    $_84yedrx2jcun41om.strict('name'),
    $_84yedrx2jcun41om.defaulted('active', {}),
    $_84yedrx2jcun41om.defaulted('apis', {}),
    $_84yedrx2jcun41om.defaulted('extra', {}),
    $_84yedrx2jcun41om.defaulted('state', $_gfn15dxqjcun41rp)
  ]);
  var create = function (data) {
    var value = $_a6j4ohxhjcun41qn.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
    return $_fga8psw5jcun41lc.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
  };
  var modeSchema = $_a6j4ohxhjcun41qn.objOfOnly([
    $_84yedrx2jcun41om.strict('branchKey'),
    $_84yedrx2jcun41om.strict('branches'),
    $_84yedrx2jcun41om.strict('name'),
    $_84yedrx2jcun41om.defaulted('active', {}),
    $_84yedrx2jcun41om.defaulted('apis', {}),
    $_84yedrx2jcun41om.defaulted('extra', {}),
    $_84yedrx2jcun41om.defaulted('state', $_gfn15dxqjcun41rp)
  ]);
  var createModes = function (data) {
    var value = $_a6j4ohxhjcun41qn.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
    return $_fga8psw5jcun41lc.createModes($_a6j4ohxhjcun41qn.choose(value.branchKey, value.branches), value.name, value.active, value.apis, value.extra, value.state);
  };
  var $_bv6ofew4jcun41l1 = {
    derive: derive,
    revoke: $_b4h1biwbjcun41ml.constant(undefined),
    noActive: $_b4h1biwbjcun41ml.constant({}),
    noApis: $_b4h1biwbjcun41ml.constant({}),
    noExtra: $_b4h1biwbjcun41ml.constant({}),
    noState: $_b4h1biwbjcun41ml.constant($_gfn15dxqjcun41rp),
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
    return type(element) === $_96feeswujcun41nt.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_96feeswujcun41nt.ELEMENT);
  var isText = isType$1($_96feeswujcun41nt.TEXT);
  var isDocument = isType$1($_96feeswujcun41nt.DOCUMENT);
  var $_cbjvosxxjcun41s5 = {
    name: name,
    type: type,
    value: value$2,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var rawSet = function (dom, key, value) {
    if ($_bqe5v5wzjcun41o7.isString(value) || $_bqe5v5wzjcun41o7.isBoolean(value) || $_bqe5v5wzjcun41o7.isNumber(value)) {
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
    $_fwofm0x0jcun41o8.each(attrs, function (v, k) {
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
    return $_bjvqngw9jcun41mb.foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has$1(source, attr) && !has$1(destination, attr))
      set(destination, attr, get(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_cbjvosxxjcun41s5.isElement(source) || !$_cbjvosxxjcun41s5.isElement(destination))
      return;
    $_bjvqngw9jcun41mb.each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_f8g4i8xwjcun41s0 = {
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
    var value = $_f8g4i8xwjcun41s0.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add$2 = function (element, attr, id) {
    var old = read$1(element, attr);
    var nu = old.concat([id]);
    $_f8g4i8xwjcun41s0.set(element, attr, nu.join(' '));
  };
  var remove$3 = function (element, attr, id) {
    var nu = $_bjvqngw9jcun41mb.filter(read$1(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_f8g4i8xwjcun41s0.set(element, attr, nu.join(' '));
    else
      $_f8g4i8xwjcun41s0.remove(element, attr);
  };
  var $_b6t7qjxzjcun41s8 = {
    read: read$1,
    add: add$2,
    remove: remove$3
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$1 = function (element) {
    return $_b6t7qjxzjcun41s8.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_b6t7qjxzjcun41s8.add(element, 'class', clazz);
  };
  var remove$2 = function (element, clazz) {
    return $_b6t7qjxzjcun41s8.remove(element, 'class', clazz);
  };
  var toggle$1 = function (element, clazz) {
    if ($_bjvqngw9jcun41mb.contains(get$1(element), clazz)) {
      remove$2(element, clazz);
    } else {
      add$1(element, clazz);
    }
  };
  var $_9cuprjxyjcun41s6 = {
    get: get$1,
    add: add$1,
    remove: remove$2,
    toggle: toggle$1,
    supports: supports
  };

  var add = function (element, clazz) {
    if ($_9cuprjxyjcun41s6.supports(element))
      element.dom().classList.add(clazz);
    else
      $_9cuprjxyjcun41s6.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_9cuprjxyjcun41s6.supports(element) ? element.dom().classList : $_9cuprjxyjcun41s6.get(element);
    if (classList.length === 0) {
      $_f8g4i8xwjcun41s0.remove(element, 'class');
    }
  };
  var remove = function (element, clazz) {
    if ($_9cuprjxyjcun41s6.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_9cuprjxyjcun41s6.remove(element, clazz);
    cleanClass(element);
  };
  var toggle = function (element, clazz) {
    return $_9cuprjxyjcun41s6.supports(element) ? element.dom().classList.toggle(clazz) : $_9cuprjxyjcun41s6.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_9cuprjxyjcun41s6.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_9cuprjxyjcun41s6.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_9cuprjxyjcun41s6.add(element, clazz);
    };
    return Toggler(off, on, has(element, clazz));
  };
  var has = function (element, clazz) {
    return $_9cuprjxyjcun41s6.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_f0wr0jxujcun41rx = {
    add: add,
    remove: remove,
    toggle: toggle,
    toggler: toggler,
    has: has
  };

  var swap = function (element, addCls, removeCls) {
    $_f0wr0jxujcun41rx.remove(element, removeCls);
    $_f0wr0jxujcun41rx.add(element, addCls);
  };
  var toAlpha = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.alpha(), swapConfig.omega());
  };
  var toOmega = function (component, swapConfig, swapState) {
    swap(component.element(), swapConfig.omega(), swapConfig.alpha());
  };
  var clear = function (component, swapConfig, swapState) {
    $_f0wr0jxujcun41rx.remove(component.element(), swapConfig.alpha());
    $_f0wr0jxujcun41rx.remove(component.element(), swapConfig.omega());
  };
  var isAlpha = function (component, swapConfig, swapState) {
    return $_f0wr0jxujcun41rx.has(component.element(), swapConfig.alpha());
  };
  var isOmega = function (component, swapConfig, swapState) {
    return $_f0wr0jxujcun41rx.has(component.element(), swapConfig.omega());
  };
  var $_fnorj2xtjcun41rv = {
    toAlpha: toAlpha,
    toOmega: toOmega,
    isAlpha: isAlpha,
    isOmega: isOmega,
    clear: clear
  };

  var SwapSchema = [
    $_84yedrx2jcun41om.strict('alpha'),
    $_84yedrx2jcun41om.strict('omega')
  ];

  var Swapping = $_bv6ofew4jcun41l1.create({
    fields: SwapSchema,
    name: 'swapping',
    apis: $_fnorj2xtjcun41rv
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
  var $_9rzy03y4jcun41t3 = { toArray: toArray };

  var owner = function (element) {
    return $_adhjdxwtjcun41nq.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    var doc = owner(element);
    return $_adhjdxwtjcun41nq.fromDom(doc.dom().documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return $_adhjdxwtjcun41nq.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return $_fseuruwajcun41mi.from(dom.parentNode).map($_adhjdxwtjcun41nq.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return $_bjvqngw9jcun41mb.findIndex(kin, function (elem) {
        return $_6hi5odw8jcun41m3.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = $_bqe5v5wzjcun41o7.isFunction(isRoot) ? isRoot : $_b4h1biwbjcun41ml.constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = $_adhjdxwtjcun41nq.fromDom(rawParent);
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
      return $_bjvqngw9jcun41mb.filter(elements, function (x) {
        return !$_6hi5odw8jcun41m3.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return $_fseuruwajcun41mi.from(dom.offsetParent).map($_adhjdxwtjcun41nq.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return $_fseuruwajcun41mi.from(dom.previousSibling).map($_adhjdxwtjcun41nq.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return $_fseuruwajcun41mi.from(dom.nextSibling).map($_adhjdxwtjcun41nq.fromDom);
  };
  var prevSiblings = function (element) {
    return $_bjvqngw9jcun41mb.reverse($_9rzy03y4jcun41t3.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_9rzy03y4jcun41t3.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return $_bjvqngw9jcun41mb.map(dom.childNodes, $_adhjdxwtjcun41nq.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return $_fseuruwajcun41mi.from(children[index]).map($_adhjdxwtjcun41nq.fromDom);
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
  var spot = $_36fc2ixmjcun41ri.immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_df5x8oy3jcun41sv = {
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
    var parent = $_df5x8oy3jcun41sv.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_df5x8oy3jcun41sv.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_df5x8oy3jcun41sv.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_df5x8oy3jcun41sv.firstChild(parent);
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
    $_df5x8oy3jcun41sv.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap$2 = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_4hb7l2y2jcun41sm = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap$2
  };

  var before$1 = function (marker, elements) {
    $_bjvqngw9jcun41mb.each(elements, function (x) {
      $_4hb7l2y2jcun41sm.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    $_bjvqngw9jcun41mb.each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_4hb7l2y2jcun41sm.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    $_bjvqngw9jcun41mb.each(elements.slice().reverse(), function (x) {
      $_4hb7l2y2jcun41sm.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    $_bjvqngw9jcun41mb.each(elements, function (x) {
      $_4hb7l2y2jcun41sm.append(parent, x);
    });
  };
  var $_1nu7q3y6jcun41t6 = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    $_bjvqngw9jcun41mb.each($_df5x8oy3jcun41sv.children(element), function (rogue) {
      remove$4(rogue);
    });
  };
  var remove$4 = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_df5x8oy3jcun41sv.children(wrapper);
    if (children.length > 0)
      $_1nu7q3y6jcun41t6.before(wrapper, children);
    remove$4(wrapper);
  };
  var $_12ttdty5jcun41t4 = {
    empty: empty,
    remove: remove$4,
    unwrap: unwrap
  };

  var inBody = function (element) {
    var dom = $_cbjvosxxjcun41s5.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = $_9r9hd7whjcun41mw.cached(function () {
    return getBody($_adhjdxwtjcun41nq.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return $_adhjdxwtjcun41nq.fromDom(body);
  };
  var $_9kacxy7jcun41ta = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var fireDetaching = function (component) {
    $_ebat3swvjcun41nv.emit(component, $_8672kiwwjcun41o0.detachedFromDom());
    var children = component.components();
    $_bjvqngw9jcun41mb.each(children, fireDetaching);
  };
  var fireAttaching = function (component) {
    var children = component.components();
    $_bjvqngw9jcun41mb.each(children, fireAttaching);
    $_ebat3swvjcun41nv.emit(component, $_8672kiwwjcun41o0.attachedToDom());
  };
  var attach = function (parent, child) {
    attachWith(parent, child, $_4hb7l2y2jcun41sm.append);
  };
  var attachWith = function (parent, child, insertion) {
    parent.getSystem().addToWorld(child);
    insertion(parent.element(), child.element());
    if ($_9kacxy7jcun41ta.inBody(parent.element()))
      fireAttaching(child);
    parent.syncComponents();
  };
  var doDetach = function (component) {
    fireDetaching(component);
    $_12ttdty5jcun41t4.remove(component.element());
    component.getSystem().removeFromWorld(component);
  };
  var detach = function (component) {
    var parent = $_df5x8oy3jcun41sv.parent(component.element()).bind(function (p) {
      return component.getSystem().getByDom(p).fold($_fseuruwajcun41mi.none, $_fseuruwajcun41mi.some);
    });
    doDetach(component);
    parent.each(function (p) {
      p.syncComponents();
    });
  };
  var detachChildren = function (component) {
    var subs = component.components();
    $_bjvqngw9jcun41mb.each(subs, doDetach);
    $_12ttdty5jcun41t4.empty(component.element());
    component.syncComponents();
  };
  var attachSystem = function (element, guiSystem) {
    $_4hb7l2y2jcun41sm.append(element, guiSystem.element());
    var children = $_df5x8oy3jcun41sv.children(guiSystem.element());
    $_bjvqngw9jcun41mb.each(children, function (child) {
      guiSystem.getByDom(child).each(fireAttaching);
    });
  };
  var detachSystem = function (guiSystem) {
    var children = $_df5x8oy3jcun41sv.children(guiSystem.element());
    $_bjvqngw9jcun41mb.each(children, function (child) {
      guiSystem.getByDom(child).each(fireDetaching);
    });
    $_12ttdty5jcun41t4.remove(guiSystem.element());
  };
  var $_f4d1ray1jcun41se = {
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
    return $_df5x8oy3jcun41sv.children($_adhjdxwtjcun41nq.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return $_bjvqngw9jcun41mb.map(tags, function (x) {
      return $_adhjdxwtjcun41nq.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return $_bjvqngw9jcun41mb.map(texts, function (x) {
      return $_adhjdxwtjcun41nq.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return $_bjvqngw9jcun41mb.map(nodes, $_adhjdxwtjcun41nq.fromDom);
  };
  var $_28ormyycjcun41tu = {
    fromHtml: fromHtml$1,
    fromTags: fromTags,
    fromText: fromText$1,
    fromDom: fromDom$1
  };

  var get$2 = function (element) {
    return element.dom().innerHTML;
  };
  var set$1 = function (element, content) {
    var owner = $_df5x8oy3jcun41sv.owner(element);
    var docDom = owner.dom();
    var fragment = $_adhjdxwtjcun41nq.fromDom(docDom.createDocumentFragment());
    var contentElements = $_28ormyycjcun41tu.fromHtml(content, docDom);
    $_1nu7q3y6jcun41t6.append(fragment, contentElements);
    $_12ttdty5jcun41t4.empty(element);
    $_4hb7l2y2jcun41sm.append(element, fragment);
  };
  var getOuter = function (element) {
    var container = $_adhjdxwtjcun41nq.fromTag('div');
    var clone = $_adhjdxwtjcun41nq.fromDom(element.dom().cloneNode(true));
    $_4hb7l2y2jcun41sm.append(container, clone);
    return get$2(container);
  };
  var $_613m7lybjcun41tt = {
    get: get$2,
    set: set$1,
    getOuter: getOuter
  };

  var clone$1 = function (original, deep) {
    return $_adhjdxwtjcun41nq.fromDom(original.dom().cloneNode(deep));
  };
  var shallow$1 = function (original) {
    return clone$1(original, false);
  };
  var deep$1 = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = $_adhjdxwtjcun41nq.fromTag(tag);
    var attributes = $_f8g4i8xwjcun41s0.clone(original);
    $_f8g4i8xwjcun41s0.setAll(nu, attributes);
    return nu;
  };
  var copy = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_df5x8oy3jcun41sv.children(deep$1(original));
    $_1nu7q3y6jcun41t6.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_4hb7l2y2jcun41sm.before(original, nu);
    var children = $_df5x8oy3jcun41sv.children(original);
    $_1nu7q3y6jcun41t6.append(nu, children);
    $_12ttdty5jcun41t4.remove(original);
    return nu;
  };
  var $_bao1cfydjcun41tx = {
    shallow: shallow$1,
    shallowAs: shallowAs,
    deep: deep$1,
    copy: copy,
    mutate: mutate
  };

  var getHtml = function (element) {
    var clone = $_bao1cfydjcun41tx.shallow(element);
    return $_613m7lybjcun41tt.getOuter(clone);
  };
  var $_3m05ieyajcun41tq = { getHtml: getHtml };

  var element = function (elem) {
    return $_3m05ieyajcun41tq.getHtml(elem);
  };
  var $_ljzuzy9jcun41to = { element: element };

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
    return $_fseuruwajcun41mi.none();
  };
  var liftN = function (arr, f) {
    var r = [];
    for (var i = 0; i < arr.length; i++) {
      var x = arr[i];
      if (x.isSome()) {
        r.push(x.getOrDie());
      } else {
        return $_fseuruwajcun41mi.none();
      }
    }
    return $_fseuruwajcun41mi.some(f.apply(null, r));
  };
  var $_2kprlnyejcun41ty = {
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
      return $_bjvqngw9jcun41mb.find(lines, function (line) {
        return line.indexOf('alloy') > 0 && !$_bjvqngw9jcun41mb.exists(path$1, function (p) {
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
    logEventCut: $_b4h1biwbjcun41ml.noop,
    logEventStopped: $_b4h1biwbjcun41ml.noop,
    logNoParent: $_b4h1biwbjcun41ml.noop,
    logEventNoHandlers: $_b4h1biwbjcun41ml.noop,
    logEventResponse: $_b4h1biwbjcun41ml.noop,
    write: $_b4h1biwbjcun41ml.noop
  };
  var monitorEvent = function (eventName, initialTarget, f) {
    var logger = debugging && (eventsMonitored === '*' || $_bjvqngw9jcun41mb.contains(eventsMonitored, eventName)) ? function () {
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
          if ($_bjvqngw9jcun41mb.contains([
              'mousemove',
              'mouseover',
              'mouseout',
              $_8672kiwwjcun41o0.systemInit()
            ], eventName))
            return;
          console.log(eventName, {
            event: eventName,
            target: initialTarget.dom(),
            sequence: $_bjvqngw9jcun41mb.map(sequence, function (s) {
              if (!$_bjvqngw9jcun41mb.contains([
                  'cut',
                  'stopped',
                  'response'
                ], s.outcome))
                return s.outcome;
              else
                return '{' + s.purpose + '} ' + s.outcome + ' at (' + $_ljzuzy9jcun41to.element(s.target) + ')';
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
        '(element)': $_ljzuzy9jcun41to.element(c.element()),
        '(initComponents)': $_bjvqngw9jcun41mb.map(cSpec.components !== undefined ? cSpec.components : [], go),
        '(components)': $_bjvqngw9jcun41mb.map(c.components(), go),
        '(bound.events)': $_fwofm0x0jcun41o8.mapToArray(c.events(), function (v, k) {
          return [k];
        }).join(', '),
        '(behaviours)': cSpec.behaviours !== undefined ? $_fwofm0x0jcun41o8.map(cSpec.behaviours, function (v, k) {
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
          var connections = $_fwofm0x0jcun41o8.keys(systems);
          return $_2kprlnyejcun41ty.findMap(connections, function (conn) {
            var connGui = systems[conn];
            return connGui.getByUid(uid).toOption().map(function (comp) {
              return $_dwtfyfx6jcun41po.wrap($_ljzuzy9jcun41to.element(comp.element()), inspectorInfo(comp));
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
  var $_b3329y8jcun41te = {
    logHandler: logHandler,
    noLogger: $_b4h1biwbjcun41ml.constant(ignoreEvent),
    getTrace: getTrace,
    monitorEvent: monitorEvent,
    isDebugging: $_b4h1biwbjcun41ml.constant(debugging),
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
    return is(scope, a) ? $_fseuruwajcun41mi.some(scope) : $_bqe5v5wzjcun41o7.isFunction(isRoot) && isRoot(scope) ? $_fseuruwajcun41mi.none() : ancestor(scope, a, isRoot);
  };

  var first$1 = function (predicate) {
    return descendant$1($_9kacxy7jcun41ta.body(), predicate);
  };
  var ancestor$1 = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = $_bqe5v5wzjcun41o7.isFunction(isRoot) ? isRoot : $_b4h1biwbjcun41ml.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_adhjdxwtjcun41nq.fromDom(element);
      if (predicate(el))
        return $_fseuruwajcun41mi.some(el);
      else if (stop(el))
        break;
    }
    return $_fseuruwajcun41mi.none();
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
      return $_fseuruwajcun41mi.none();
    return child$2($_adhjdxwtjcun41nq.fromDom(element.parentNode), function (x) {
      return !$_6hi5odw8jcun41m3.eq(scope, x) && predicate(x);
    });
  };
  var child$2 = function (scope, predicate) {
    var result = $_bjvqngw9jcun41mb.find(scope.dom().childNodes, $_b4h1biwbjcun41ml.compose(predicate, $_adhjdxwtjcun41nq.fromDom));
    return result.map($_adhjdxwtjcun41nq.fromDom);
  };
  var descendant$1 = function (scope, predicate) {
    var descend = function (element) {
      for (var i = 0; i < element.childNodes.length; i++) {
        if (predicate($_adhjdxwtjcun41nq.fromDom(element.childNodes[i])))
          return $_fseuruwajcun41mi.some($_adhjdxwtjcun41nq.fromDom(element.childNodes[i]));
        var res = descend(element.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return $_fseuruwajcun41mi.none();
    };
    return descend(scope.dom());
  };
  var $_2nwazgyijcun41u8 = {
    first: first$1,
    ancestor: ancestor$1,
    closest: closest$1,
    sibling: sibling$1,
    child: child$2,
    descendant: descendant$1
  };

  var any$1 = function (predicate) {
    return $_2nwazgyijcun41u8.first(predicate).isSome();
  };
  var ancestor = function (scope, predicate, isRoot) {
    return $_2nwazgyijcun41u8.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest = function (scope, predicate, isRoot) {
    return $_2nwazgyijcun41u8.closest(scope, predicate, isRoot).isSome();
  };
  var sibling = function (scope, predicate) {
    return $_2nwazgyijcun41u8.sibling(scope, predicate).isSome();
  };
  var child$1 = function (scope, predicate) {
    return $_2nwazgyijcun41u8.child(scope, predicate).isSome();
  };
  var descendant = function (scope, predicate) {
    return $_2nwazgyijcun41u8.descendant(scope, predicate).isSome();
  };
  var $_f7u5mkyhjcun41u6 = {
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
    var doc = $_df5x8oy3jcun41sv.owner(element).dom();
    return element.dom() === doc.activeElement;
  };
  var active = function (_doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    return $_fseuruwajcun41mi.from(doc.activeElement).map($_adhjdxwtjcun41nq.fromDom);
  };
  var focusInside = function (element) {
    var doc = $_df5x8oy3jcun41sv.owner(element);
    var inside = active(doc).filter(function (a) {
      return $_f7u5mkyhjcun41u6.closest(a, $_b4h1biwbjcun41ml.curry($_6hi5odw8jcun41m3.eq, element));
    });
    inside.fold(function () {
      focus(element);
    }, $_b4h1biwbjcun41ml.noop);
  };
  var search = function (element) {
    return active($_df5x8oy3jcun41sv.owner(element)).filter(function (e) {
      return element.dom().contains(e.dom());
    });
  };
  var $_5qyty2ygjcun41u1 = {
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
  var $_3s5q3fymjcun41uj = { openLink: openLink };

  var isSkinDisabled = function (editor) {
    return editor.settings.skin === false;
  };
  var $_5w9w0cynjcun41uk = { isSkinDisabled: isSkinDisabled };

  var formatChanged = 'formatChanged';
  var orientationChanged = 'orientationChanged';
  var dropupDismissed = 'dropupDismissed';
  var $_3wqehtyojcun41ul = {
    formatChanged: $_b4h1biwbjcun41ml.constant(formatChanged),
    orientationChanged: $_b4h1biwbjcun41ml.constant(orientationChanged),
    dropupDismissed: $_b4h1biwbjcun41ml.constant(dropupDismissed)
  };

  var chooseChannels = function (channels, message) {
    return message.universal() ? channels : $_bjvqngw9jcun41mb.filter(channels, function (ch) {
      return $_bjvqngw9jcun41mb.contains(message.channels(), ch);
    });
  };
  var events = function (receiveConfig) {
    return $_d87qm6w6jcun41lv.derive([$_d87qm6w6jcun41lv.run($_8672kiwwjcun41o0.receive(), function (component, message) {
        var channelMap = receiveConfig.channels();
        var channels = $_fwofm0x0jcun41o8.keys(channelMap);
        var targetChannels = chooseChannels(channels, message);
        $_bjvqngw9jcun41mb.each(targetChannels, function (ch) {
          var channelInfo = channelMap[ch]();
          var channelSchema = channelInfo.schema();
          var data = $_a6j4ohxhjcun41qn.asStructOrDie('channel[' + ch + '] data\nReceiver: ' + $_ljzuzy9jcun41to.element(component.element()), channelSchema, message.data());
          channelInfo.onReceive()(component, data);
        });
      })]);
  };
  var $_2imssbyrjcun41v6 = { events: events };

  var menuFields = [
    $_84yedrx2jcun41om.strict('menu'),
    $_84yedrx2jcun41om.strict('selectedMenu')
  ];
  var itemFields = [
    $_84yedrx2jcun41om.strict('item'),
    $_84yedrx2jcun41om.strict('selectedItem')
  ];
  var schema = $_a6j4ohxhjcun41qn.objOfOnly(itemFields.concat(menuFields));
  var itemSchema = $_a6j4ohxhjcun41qn.objOfOnly(itemFields);
  var $_bhrxi9yujcun41vt = {
    menuFields: $_b4h1biwbjcun41ml.constant(menuFields),
    itemFields: $_b4h1biwbjcun41ml.constant(itemFields),
    schema: $_b4h1biwbjcun41ml.constant(schema),
    itemSchema: $_b4h1biwbjcun41ml.constant(itemSchema)
  };

  var initSize = $_84yedrx2jcun41om.strictObjOf('initSize', [
    $_84yedrx2jcun41om.strict('numColumns'),
    $_84yedrx2jcun41om.strict('numRows')
  ]);
  var itemMarkers = function () {
    return $_84yedrx2jcun41om.strictOf('markers', $_bhrxi9yujcun41vt.itemSchema());
  };
  var menuMarkers = function () {
    return $_84yedrx2jcun41om.strictOf('markers', $_bhrxi9yujcun41vt.schema());
  };
  var tieredMenuMarkers = function () {
    return $_84yedrx2jcun41om.strictObjOf('markers', [$_84yedrx2jcun41om.strict('backgroundMenu')].concat($_bhrxi9yujcun41vt.menuFields()).concat($_bhrxi9yujcun41vt.itemFields()));
  };
  var markers = function (required) {
    return $_84yedrx2jcun41om.strictObjOf('markers', $_bjvqngw9jcun41mb.map(required, $_84yedrx2jcun41om.strict));
  };
  var onPresenceHandler = function (label, fieldName, presence) {
    var trace = $_b3329y8jcun41te.getTrace();
    return $_84yedrx2jcun41om.field(fieldName, fieldName, presence, $_a6j4ohxhjcun41qn.valueOf(function (f) {
      return $_8axt1mx8jcun41pw.value(function () {
        $_b3329y8jcun41te.logHandler(label, fieldName, trace);
        return f.apply(undefined, arguments);
      });
    }));
  };
  var onHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_3688l1x3jcun41p0.defaulted($_b4h1biwbjcun41ml.noop));
  };
  var onKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_3688l1x3jcun41p0.defaulted($_fseuruwajcun41mi.none));
  };
  var onStrictHandler = function (fieldName) {
    return onPresenceHandler('onHandler', fieldName, $_3688l1x3jcun41p0.strict());
  };
  var onStrictKeyboardHandler = function (fieldName) {
    return onPresenceHandler('onKeyboardHandler', fieldName, $_3688l1x3jcun41p0.strict());
  };
  var output$1 = function (name, value) {
    return $_84yedrx2jcun41om.state(name, $_b4h1biwbjcun41ml.constant(value));
  };
  var snapshot$1 = function (name) {
    return $_84yedrx2jcun41om.state(name, $_b4h1biwbjcun41ml.identity);
  };
  var $_f570ayytjcun41vk = {
    initSize: $_b4h1biwbjcun41ml.constant(initSize),
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

  var ReceivingSchema = [$_84yedrx2jcun41om.strictOf('channels', $_a6j4ohxhjcun41qn.setOf($_8axt1mx8jcun41pw.value, $_a6j4ohxhjcun41qn.objOfOnly([
      $_f570ayytjcun41vk.onStrictHandler('onReceive'),
      $_84yedrx2jcun41om.defaulted('schema', $_a6j4ohxhjcun41qn.anyValue())
    ])))];

  var Receiving = $_bv6ofew4jcun41l1.create({
    fields: ReceivingSchema,
    name: 'receiving',
    active: $_2imssbyrjcun41v6
  });

  var updateAriaState = function (component, toggleConfig) {
    var pressed = isOn(component, toggleConfig);
    var ariaInfo = toggleConfig.aria();
    ariaInfo.update()(component, ariaInfo, pressed);
  };
  var toggle$2 = function (component, toggleConfig, toggleState) {
    $_f0wr0jxujcun41rx.toggle(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var on = function (component, toggleConfig, toggleState) {
    $_f0wr0jxujcun41rx.add(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var off = function (component, toggleConfig, toggleState) {
    $_f0wr0jxujcun41rx.remove(component.element(), toggleConfig.toggleClass());
    updateAriaState(component, toggleConfig);
  };
  var isOn = function (component, toggleConfig) {
    return $_f0wr0jxujcun41rx.has(component.element(), toggleConfig.toggleClass());
  };
  var onLoad = function (component, toggleConfig, toggleState) {
    var api = toggleConfig.selected() ? on : off;
    api(component, toggleConfig, toggleState);
  };
  var $_2fpdzxyxjcun41w2 = {
    onLoad: onLoad,
    toggle: toggle$2,
    isOn: isOn,
    on: on,
    off: off
  };

  var exhibit = function (base, toggleConfig, toggleState) {
    return $_1tv7mlxkjcun41r6.nu({});
  };
  var events$1 = function (toggleConfig, toggleState) {
    var execute = $_fga8psw5jcun41lc.executeEvent(toggleConfig, toggleState, $_2fpdzxyxjcun41w2.toggle);
    var load = $_fga8psw5jcun41lc.loadEvent(toggleConfig, toggleState, $_2fpdzxyxjcun41w2.onLoad);
    return $_d87qm6w6jcun41lv.derive($_bjvqngw9jcun41mb.flatten([
      toggleConfig.toggleOnExecute() ? [execute] : [],
      [load]
    ]));
  };
  var $_bca8uiywjcun41vz = {
    exhibit: exhibit,
    events: events$1
  };

  var updatePressed = function (component, ariaInfo, status) {
    $_f8g4i8xwjcun41s0.set(component.element(), 'aria-pressed', status);
    if (ariaInfo.syncWithExpanded())
      updateExpanded(component, ariaInfo, status);
  };
  var updateSelected = function (component, ariaInfo, status) {
    $_f8g4i8xwjcun41s0.set(component.element(), 'aria-selected', status);
  };
  var updateChecked = function (component, ariaInfo, status) {
    $_f8g4i8xwjcun41s0.set(component.element(), 'aria-checked', status);
  };
  var updateExpanded = function (component, ariaInfo, status) {
    $_f8g4i8xwjcun41s0.set(component.element(), 'aria-expanded', status);
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
    var rawTag = $_cbjvosxxjcun41s5.name(elem);
    var suffix = rawTag === 'input' && $_f8g4i8xwjcun41s0.has(elem, 'type') ? ':' + $_f8g4i8xwjcun41s0.get(elem, 'type') : '';
    return $_dwtfyfx6jcun41po.readOptFrom(tagAttributes, rawTag + suffix);
  };
  var detectFromRole = function (component) {
    var elem = component.element();
    if (!$_f8g4i8xwjcun41s0.has(elem, 'role'))
      return $_fseuruwajcun41mi.none();
    else {
      var role = $_f8g4i8xwjcun41s0.get(elem, 'role');
      return $_dwtfyfx6jcun41po.readOptFrom(roleAttributes, role);
    }
  };
  var updateAuto = function (component, ariaInfo, status) {
    var attributes = detectFromRole(component).orThunk(function () {
      return detectFromTag(component);
    }).getOr([]);
    $_bjvqngw9jcun41mb.each(attributes, function (attr) {
      $_f8g4i8xwjcun41s0.set(component.element(), attr, status);
    });
  };
  var $_epg4hbyzjcun41wc = {
    updatePressed: updatePressed,
    updateSelected: updateSelected,
    updateChecked: updateChecked,
    updateExpanded: updateExpanded,
    updateAuto: updateAuto
  };

  var ToggleSchema = [
    $_84yedrx2jcun41om.defaulted('selected', false),
    $_84yedrx2jcun41om.strict('toggleClass'),
    $_84yedrx2jcun41om.defaulted('toggleOnExecute', true),
    $_84yedrx2jcun41om.defaultedOf('aria', { mode: 'none' }, $_a6j4ohxhjcun41qn.choose('mode', {
      'pressed': [
        $_84yedrx2jcun41om.defaulted('syncWithExpanded', false),
        $_f570ayytjcun41vk.output('update', $_epg4hbyzjcun41wc.updatePressed)
      ],
      'checked': [$_f570ayytjcun41vk.output('update', $_epg4hbyzjcun41wc.updateChecked)],
      'expanded': [$_f570ayytjcun41vk.output('update', $_epg4hbyzjcun41wc.updateExpanded)],
      'selected': [$_f570ayytjcun41vk.output('update', $_epg4hbyzjcun41wc.updateSelected)],
      'none': [$_f570ayytjcun41vk.output('update', $_b4h1biwbjcun41ml.noop)]
    }))
  ];

  var Toggling = $_bv6ofew4jcun41l1.create({
    fields: ToggleSchema,
    name: 'toggling',
    active: $_bca8uiywjcun41vz,
    apis: $_2fpdzxyxjcun41w2
  });

  var format = function (command, update) {
    return Receiving.config({
      channels: $_dwtfyfx6jcun41po.wrap($_3wqehtyojcun41ul.formatChanged(), {
        onReceive: function (button, data) {
          if (data.command === command) {
            update(button, data.state);
          }
        }
      })
    });
  };
  var orientation = function (onReceive) {
    return Receiving.config({ channels: $_dwtfyfx6jcun41po.wrap($_3wqehtyojcun41ul.orientationChanged(), { onReceive: onReceive }) });
  };
  var receive = function (channel, onReceive) {
    return {
      key: channel,
      value: { onReceive: onReceive }
    };
  };
  var $_4ps60kz0jcun41wl = {
    format: format,
    orientation: orientation,
    receive: receive
  };

  var prefix = 'tinymce-mobile';
  var resolve$1 = function (p) {
    return prefix + '-' + p;
  };
  var $_4tdysdz1jcun41wo = {
    resolve: resolve$1,
    prefix: $_b4h1biwbjcun41ml.constant(prefix)
  };

  var exhibit$1 = function (base, unselectConfig) {
    return $_1tv7mlxkjcun41r6.nu({
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
    return $_d87qm6w6jcun41lv.derive([$_d87qm6w6jcun41lv.abort($_ay8498wxjcun41o3.selectstart(), $_b4h1biwbjcun41ml.constant(true))]);
  };
  var $_3denvxz4jcun41x2 = {
    events: events$2,
    exhibit: exhibit$1
  };

  var Unselecting = $_bv6ofew4jcun41l1.create({
    fields: [],
    name: 'unselecting',
    active: $_3denvxz4jcun41x2
  });

  var focus$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_5qyty2ygjcun41u1.focus(component.element());
      focusConfig.onFocus()(component);
    }
  };
  var blur$1 = function (component, focusConfig) {
    if (!focusConfig.ignore()) {
      $_5qyty2ygjcun41u1.blur(component.element());
    }
  };
  var isFocused = function (component) {
    return $_5qyty2ygjcun41u1.hasFocus(component.element());
  };
  var $_46rgwkz8jcun41xe = {
    focus: focus$1,
    blur: blur$1,
    isFocused: isFocused
  };

  var exhibit$2 = function (base, focusConfig) {
    if (focusConfig.ignore())
      return $_1tv7mlxkjcun41r6.nu({});
    else
      return $_1tv7mlxkjcun41r6.nu({ attributes: { 'tabindex': '-1' } });
  };
  var events$3 = function (focusConfig) {
    return $_d87qm6w6jcun41lv.derive([$_d87qm6w6jcun41lv.run($_8672kiwwjcun41o0.focus(), function (component, simulatedEvent) {
        $_46rgwkz8jcun41xe.focus(component, focusConfig);
        simulatedEvent.stop();
      })]);
  };
  var $_2svze6z7jcun41xc = {
    exhibit: exhibit$2,
    events: events$3
  };

  var FocusSchema = [
    $_f570ayytjcun41vk.onHandler('onFocus'),
    $_84yedrx2jcun41om.defaulted('ignore', false)
  ];

  var Focusing = $_bv6ofew4jcun41l1.create({
    fields: FocusSchema,
    name: 'focusing',
    active: $_2svze6z7jcun41xc,
    apis: $_46rgwkz8jcun41xe
  });

  var $_dodgizejcun41y4 = {
    BACKSPACE: $_b4h1biwbjcun41ml.constant([8]),
    TAB: $_b4h1biwbjcun41ml.constant([9]),
    ENTER: $_b4h1biwbjcun41ml.constant([13]),
    SHIFT: $_b4h1biwbjcun41ml.constant([16]),
    CTRL: $_b4h1biwbjcun41ml.constant([17]),
    ALT: $_b4h1biwbjcun41ml.constant([18]),
    CAPSLOCK: $_b4h1biwbjcun41ml.constant([20]),
    ESCAPE: $_b4h1biwbjcun41ml.constant([27]),
    SPACE: $_b4h1biwbjcun41ml.constant([32]),
    PAGEUP: $_b4h1biwbjcun41ml.constant([33]),
    PAGEDOWN: $_b4h1biwbjcun41ml.constant([34]),
    END: $_b4h1biwbjcun41ml.constant([35]),
    HOME: $_b4h1biwbjcun41ml.constant([36]),
    LEFT: $_b4h1biwbjcun41ml.constant([37]),
    UP: $_b4h1biwbjcun41ml.constant([38]),
    RIGHT: $_b4h1biwbjcun41ml.constant([39]),
    DOWN: $_b4h1biwbjcun41ml.constant([40]),
    INSERT: $_b4h1biwbjcun41ml.constant([45]),
    DEL: $_b4h1biwbjcun41ml.constant([46]),
    META: $_b4h1biwbjcun41ml.constant([
      91,
      93,
      224
    ]),
    F10: $_b4h1biwbjcun41ml.constant([121])
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
  var $_ed1lcwzjjcun41yv = {
    cycleBy: cycleBy,
    cap: cap
  };

  var all$3 = function (predicate) {
    return descendants$1($_9kacxy7jcun41ta.body(), predicate);
  };
  var ancestors$1 = function (scope, predicate, isRoot) {
    return $_bjvqngw9jcun41mb.filter($_df5x8oy3jcun41sv.parents(scope, isRoot), predicate);
  };
  var siblings$2 = function (scope, predicate) {
    return $_bjvqngw9jcun41mb.filter($_df5x8oy3jcun41sv.siblings(scope), predicate);
  };
  var children$2 = function (scope, predicate) {
    return $_bjvqngw9jcun41mb.filter($_df5x8oy3jcun41sv.children(scope), predicate);
  };
  var descendants$1 = function (scope, predicate) {
    var result = [];
    $_bjvqngw9jcun41mb.each($_df5x8oy3jcun41sv.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants$1(x, predicate));
    });
    return result;
  };
  var $_c29fu9zljcun41yz = {
    all: all$3,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  var all$2 = function (selector) {
    return $_5if0vzwsjcun41nl.all(selector);
  };
  var ancestors = function (scope, selector, isRoot) {
    return $_c29fu9zljcun41yz.ancestors(scope, function (e) {
      return $_5if0vzwsjcun41nl.is(e, selector);
    }, isRoot);
  };
  var siblings$1 = function (scope, selector) {
    return $_c29fu9zljcun41yz.siblings(scope, function (e) {
      return $_5if0vzwsjcun41nl.is(e, selector);
    });
  };
  var children$1 = function (scope, selector) {
    return $_c29fu9zljcun41yz.children(scope, function (e) {
      return $_5if0vzwsjcun41nl.is(e, selector);
    });
  };
  var descendants = function (scope, selector) {
    return $_5if0vzwsjcun41nl.all(selector, scope);
  };
  var $_3299iyzkjcun41yx = {
    all: all$2,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var first$2 = function (selector) {
    return $_5if0vzwsjcun41nl.one(selector);
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_2nwazgyijcun41u8.ancestor(scope, function (e) {
      return $_5if0vzwsjcun41nl.is(e, selector);
    }, isRoot);
  };
  var sibling$2 = function (scope, selector) {
    return $_2nwazgyijcun41u8.sibling(scope, function (e) {
      return $_5if0vzwsjcun41nl.is(e, selector);
    });
  };
  var child$3 = function (scope, selector) {
    return $_2nwazgyijcun41u8.child(scope, function (e) {
      return $_5if0vzwsjcun41nl.is(e, selector);
    });
  };
  var descendant$2 = function (scope, selector) {
    return $_5if0vzwsjcun41nl.one(selector, scope);
  };
  var closest$2 = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_5if0vzwsjcun41nl.is, ancestor$2, scope, selector, isRoot);
  };
  var $_akwq9fzmjcun41z4 = {
    first: first$2,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var dehighlightAll = function (component, hConfig, hState) {
    var highlighted = $_3299iyzkjcun41yx.descendants(component.element(), '.' + hConfig.highlightClass());
    $_bjvqngw9jcun41mb.each(highlighted, function (h) {
      $_f0wr0jxujcun41rx.remove(h, hConfig.highlightClass());
      component.getSystem().getByDom(h).each(function (target) {
        hConfig.onDehighlight()(component, target);
      });
    });
  };
  var dehighlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    $_f0wr0jxujcun41rx.remove(target.element(), hConfig.highlightClass());
    if (wasHighlighted)
      hConfig.onDehighlight()(component, target);
  };
  var highlight = function (component, hConfig, hState, target) {
    var wasHighlighted = isHighlighted(component, hConfig, hState, target);
    dehighlightAll(component, hConfig, hState);
    $_f0wr0jxujcun41rx.add(target.element(), hConfig.highlightClass());
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
    var items = $_3299iyzkjcun41yx.descendants(component.element(), '.' + hConfig.itemClass());
    var itemComps = $_2kprlnyejcun41ty.cat($_bjvqngw9jcun41mb.map(items, function (i) {
      return component.getSystem().getByDom(i).toOption();
    }));
    var targetComp = $_bjvqngw9jcun41mb.find(itemComps, predicate);
    targetComp.each(function (c) {
      highlight(component, hConfig, hState, c);
    });
  };
  var isHighlighted = function (component, hConfig, hState, queryTarget) {
    return $_f0wr0jxujcun41rx.has(queryTarget.element(), hConfig.highlightClass());
  };
  var getHighlighted = function (component, hConfig, hState) {
    return $_akwq9fzmjcun41z4.descendant(component.element(), '.' + hConfig.highlightClass()).bind(component.getSystem().getByDom);
  };
  var getByIndex = function (component, hConfig, hState, index) {
    var items = $_3299iyzkjcun41yx.descendants(component.element(), '.' + hConfig.itemClass());
    return $_fseuruwajcun41mi.from(items[index]).fold(function () {
      return $_8axt1mx8jcun41pw.error('No element found with index ' + index);
    }, component.getSystem().getByDom);
  };
  var getFirst = function (component, hConfig, hState) {
    return $_akwq9fzmjcun41z4.descendant(component.element(), '.' + hConfig.itemClass()).bind(component.getSystem().getByDom);
  };
  var getLast = function (component, hConfig, hState) {
    var items = $_3299iyzkjcun41yx.descendants(component.element(), '.' + hConfig.itemClass());
    var last = items.length > 0 ? $_fseuruwajcun41mi.some(items[items.length - 1]) : $_fseuruwajcun41mi.none();
    return last.bind(component.getSystem().getByDom);
  };
  var getDelta = function (component, hConfig, hState, delta) {
    var items = $_3299iyzkjcun41yx.descendants(component.element(), '.' + hConfig.itemClass());
    var current = $_bjvqngw9jcun41mb.findIndex(items, function (item) {
      return $_f0wr0jxujcun41rx.has(item, hConfig.highlightClass());
    });
    return current.bind(function (selected) {
      var dest = $_ed1lcwzjjcun41yv.cycleBy(selected, delta, 0, items.length - 1);
      return component.getSystem().getByDom(items[dest]);
    });
  };
  var getPrevious = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, -1);
  };
  var getNext = function (component, hConfig, hState) {
    return getDelta(component, hConfig, hState, +1);
  };
  var $_517bv0zijcun41yj = {
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
    $_84yedrx2jcun41om.strict('highlightClass'),
    $_84yedrx2jcun41om.strict('itemClass'),
    $_f570ayytjcun41vk.onHandler('onHighlight'),
    $_f570ayytjcun41vk.onHandler('onDehighlight')
  ];

  var Highlighting = $_bv6ofew4jcun41l1.create({
    fields: HighlightSchema,
    name: 'highlighting',
    apis: $_517bv0zijcun41yj
  });

  var dom = function () {
    var get = function (component) {
      return $_5qyty2ygjcun41u1.search(component.element());
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
      component.getSystem().getByDom(element).fold($_b4h1biwbjcun41ml.noop, function (item) {
        Highlighting.highlight(component, item);
      });
    };
    return {
      get: get,
      set: set
    };
  };
  var $_8bwjp5zgjcun41yd = {
    dom: dom,
    highlights: highlights
  };

  var inSet = function (keys) {
    return function (event) {
      return $_bjvqngw9jcun41mb.contains(keys, event.raw().which);
    };
  };
  var and = function (preds) {
    return function (event) {
      return $_bjvqngw9jcun41mb.forall(preds, function (pred) {
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
  var $_bpva3tzpjcun41zi = {
    inSet: inSet,
    and: and,
    is: is$1,
    isShift: isShift,
    isNotShift: $_b4h1biwbjcun41ml.not(isShift),
    isControl: isControl,
    isNotControl: $_b4h1biwbjcun41ml.not(isControl)
  };

  var basic = function (key, action) {
    return {
      matches: $_bpva3tzpjcun41zi.is(key),
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
    var transition = $_bjvqngw9jcun41mb.find(transitions, function (t) {
      return t.matches(event);
    });
    return transition.map(function (t) {
      return t.classification;
    });
  };
  var $_5r85yvzojcun41ze = {
    basic: basic,
    rule: rule,
    choose: choose$2
  };

  var typical = function (infoSchema, stateInit, getRules, getEvents, getApis, optFocusIn) {
    var schema = function () {
      return infoSchema.concat([
        $_84yedrx2jcun41om.defaulted('focusManager', $_8bwjp5zgjcun41yd.dom()),
        $_f570ayytjcun41vk.output('handler', me),
        $_f570ayytjcun41vk.output('state', stateInit)
      ]);
    };
    var processKey = function (component, simulatedEvent, keyingConfig, keyingState) {
      var rules = getRules(component, simulatedEvent, keyingConfig, keyingState);
      return $_5r85yvzojcun41ze.choose(rules, simulatedEvent.event()).bind(function (rule) {
        return rule(component, simulatedEvent, keyingConfig, keyingState);
      });
    };
    var toEvents = function (keyingConfig, keyingState) {
      var otherEvents = getEvents(keyingConfig, keyingState);
      var keyEvents = $_d87qm6w6jcun41lv.derive(optFocusIn.map(function (focusIn) {
        return $_d87qm6w6jcun41lv.run($_8672kiwwjcun41o0.focus(), function (component, simulatedEvent) {
          focusIn(component, keyingConfig, keyingState, simulatedEvent);
          simulatedEvent.stop();
        });
      }).toArray().concat([$_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.keydown(), function (component, simulatedEvent) {
          processKey(component, simulatedEvent, keyingConfig, keyingState).each(function (_) {
            simulatedEvent.stop();
          });
        })]));
      return $_do57nmwyjcun41o6.deepMerge(otherEvents, keyEvents);
    };
    var me = {
      schema: schema,
      processKey: processKey,
      toEvents: toEvents,
      toApis: getApis
    };
    return me;
  };
  var $_6gyd88zfjcun41y7 = { typical: typical };

  var cyclePrev = function (values, index, predicate) {
    var before = $_bjvqngw9jcun41mb.reverse(values.slice(0, index));
    var after = $_bjvqngw9jcun41mb.reverse(values.slice(index + 1));
    return $_bjvqngw9jcun41mb.find(before.concat(after), predicate);
  };
  var tryPrev = function (values, index, predicate) {
    var before = $_bjvqngw9jcun41mb.reverse(values.slice(0, index));
    return $_bjvqngw9jcun41mb.find(before, predicate);
  };
  var cycleNext = function (values, index, predicate) {
    var before = values.slice(0, index);
    var after = values.slice(index + 1);
    return $_bjvqngw9jcun41mb.find(after.concat(before), predicate);
  };
  var tryNext = function (values, index, predicate) {
    var after = values.slice(index + 1);
    return $_bjvqngw9jcun41mb.find(after, predicate);
  };
  var $_9xhlzjzqjcun41zn = {
    cyclePrev: cyclePrev,
    cycleNext: cycleNext,
    tryPrev: tryPrev,
    tryNext: tryNext
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_cddva8ztjcun41zz = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!$_bqe5v5wzjcun41o7.isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_cddva8ztjcun41zz.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_cddva8ztjcun41zz.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$3 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    $_fwofm0x0jcun41o8.each(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    $_fwofm0x0jcun41o8.each(css, function (v, k) {
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
    var v = r === '' && !$_9kacxy7jcun41ta.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_cddva8ztjcun41zz.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
  };
  var getRaw = function (element, property) {
    var dom = element.dom();
    var raw = getUnsafeProperty(dom, property);
    return $_fseuruwajcun41mi.from(raw).filter(function (r) {
      return r.length > 0;
    });
  };
  var getAllRaw = function (element) {
    var css = {};
    var dom = element.dom();
    if ($_cddva8ztjcun41zz.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = $_adhjdxwtjcun41nq.fromTag(tag);
    set$3(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$5 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_f8g4i8xwjcun41s0.has(element, 'style') && $_dzv179wpjcun41nh.trim($_f8g4i8xwjcun41s0.get(element, 'style')) === '') {
      $_f8g4i8xwjcun41s0.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_f8g4i8xwjcun41s0.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_f8g4i8xwjcun41s0.remove : $_f8g4i8xwjcun41s0.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy$1 = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_cddva8ztjcun41zz.isSupported(sourceDom) && $_cddva8ztjcun41zz.isSupported(targetDom)) {
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
    if (!$_cbjvosxxjcun41s5.isElement(source) || !$_cbjvosxxjcun41s5.isElement(destination))
      return;
    $_bjvqngw9jcun41mb.each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_ebvjd9zsjcun41zr = {
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
      if (!$_bqe5v5wzjcun41o7.isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_cddva8ztjcun41zz.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_ebvjd9zsjcun41zr.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return $_bjvqngw9jcun41mb.foldl(properties, function (acc, property) {
        var val = $_ebvjd9zsjcun41zr.get(element, property);
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
    return $_9kacxy7jcun41ta.inBody(element) ? element.dom().getBoundingClientRect().height : element.dom().offsetHeight;
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
    $_ebvjd9zsjcun41zr.set(element, 'max-height', absMax + 'px');
  };
  var $_6famn1zrjcun41zq = {
    set: set$2,
    get: get$3,
    getOuter: getOuter$1,
    setMax: setMax
  };

  var create$2 = function (cyclicField) {
    var schema = [
      $_84yedrx2jcun41om.option('onEscape'),
      $_84yedrx2jcun41om.option('onEnter'),
      $_84yedrx2jcun41om.defaulted('selector', '[data-alloy-tabstop="true"]'),
      $_84yedrx2jcun41om.defaulted('firstTabstop', 0),
      $_84yedrx2jcun41om.defaulted('useTabstopAt', $_b4h1biwbjcun41ml.constant(true)),
      $_84yedrx2jcun41om.option('visibilitySelector')
    ].concat([cyclicField]);
    var isVisible = function (tabbingConfig, element) {
      var target = tabbingConfig.visibilitySelector().bind(function (sel) {
        return $_akwq9fzmjcun41z4.closest(element, sel);
      }).getOr(element);
      return $_6famn1zrjcun41zq.get(target) > 0;
    };
    var findInitial = function (component, tabbingConfig) {
      var tabstops = $_3299iyzkjcun41yx.descendants(component.element(), tabbingConfig.selector());
      var visibles = $_bjvqngw9jcun41mb.filter(tabstops, function (elem) {
        return isVisible(tabbingConfig, elem);
      });
      return $_fseuruwajcun41mi.from(visibles[tabbingConfig.firstTabstop()]);
    };
    var findCurrent = function (component, tabbingConfig) {
      return tabbingConfig.focusManager().get(component).bind(function (elem) {
        return $_akwq9fzmjcun41z4.closest(elem, tabbingConfig.selector());
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
        return tabbingConfig.cyclic() ? $_fseuruwajcun41mi.some(true) : $_fseuruwajcun41mi.none();
      }, function (target) {
        tabbingConfig.focusManager().set(component, target);
        return $_fseuruwajcun41mi.some(true);
      });
    };
    var go = function (component, simulatedEvent, tabbingConfig, cycle) {
      var tabstops = $_3299iyzkjcun41yx.descendants(component.element(), tabbingConfig.selector());
      return findCurrent(component, tabbingConfig).bind(function (tabstop) {
        var optStopIndex = $_bjvqngw9jcun41mb.findIndex(tabstops, $_b4h1biwbjcun41ml.curry($_6hi5odw8jcun41m3.eq, tabstop));
        return optStopIndex.bind(function (stopIndex) {
          return goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle);
        });
      });
    };
    var goBackwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_9xhlzjzqjcun41zn.cyclePrev : $_9xhlzjzqjcun41zn.tryPrev;
      return go(component, simulatedEvent, tabbingConfig, navigate);
    };
    var goForwards = function (component, simulatedEvent, tabbingConfig, tabbingState) {
      var navigate = tabbingConfig.cyclic() ? $_9xhlzjzqjcun41zn.cycleNext : $_9xhlzjzqjcun41zn.tryNext;
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
    var getRules = $_b4h1biwbjcun41ml.constant([
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
        $_bpva3tzpjcun41zi.isShift,
        $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.TAB())
      ]), goBackwards),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.TAB()), goForwards),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.ESCAPE()), exit),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
        $_bpva3tzpjcun41zi.isNotShift,
        $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.ENTER())
      ]), execute)
    ]);
    var getEvents = $_b4h1biwbjcun41ml.constant({});
    var getApis = $_b4h1biwbjcun41ml.constant({});
    return $_6gyd88zfjcun41y7.typical(schema, $_gfn15dxqjcun41rp.init, getRules, getEvents, getApis, $_fseuruwajcun41mi.some(focusIn));
  };
  var $_esgxo4zdjcun41xt = { create: create$2 };

  var AcyclicType = $_esgxo4zdjcun41xt.create($_84yedrx2jcun41om.state('cyclic', $_b4h1biwbjcun41ml.constant(false)));

  var CyclicType = $_esgxo4zdjcun41xt.create($_84yedrx2jcun41om.state('cyclic', $_b4h1biwbjcun41ml.constant(true)));

  var inside = function (target) {
    return $_cbjvosxxjcun41s5.name(target) === 'input' && $_f8g4i8xwjcun41s0.get(target, 'type') !== 'radio' || $_cbjvosxxjcun41s5.name(target) === 'textarea';
  };
  var $_tci11zxjcun420c = { inside: inside };

  var doDefaultExecute = function (component, simulatedEvent, focused) {
    $_ebat3swvjcun41nv.dispatch(component, focused, $_8672kiwwjcun41o0.execute());
    return $_fseuruwajcun41mi.some(true);
  };
  var defaultExecute = function (component, simulatedEvent, focused) {
    return $_tci11zxjcun420c.inside(focused) && $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.SPACE())(simulatedEvent.event()) ? $_fseuruwajcun41mi.none() : doDefaultExecute(component, simulatedEvent, focused);
  };
  var $_fwm9y6zyjcun420g = { defaultExecute: defaultExecute };

  var schema$1 = [
    $_84yedrx2jcun41om.defaulted('execute', $_fwm9y6zyjcun420g.defaultExecute),
    $_84yedrx2jcun41om.defaulted('useSpace', false),
    $_84yedrx2jcun41om.defaulted('useEnter', true),
    $_84yedrx2jcun41om.defaulted('useControlEnter', false),
    $_84yedrx2jcun41om.defaulted('useDown', false)
  ];
  var execute = function (component, simulatedEvent, executeConfig, executeState) {
    return executeConfig.execute()(component, simulatedEvent, component.element());
  };
  var getRules = function (component, simulatedEvent, executeConfig, executeState) {
    var spaceExec = executeConfig.useSpace() && !$_tci11zxjcun420c.inside(component.element()) ? $_dodgizejcun41y4.SPACE() : [];
    var enterExec = executeConfig.useEnter() ? $_dodgizejcun41y4.ENTER() : [];
    var downExec = executeConfig.useDown() ? $_dodgizejcun41y4.DOWN() : [];
    var execKeys = spaceExec.concat(enterExec).concat(downExec);
    return [$_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet(execKeys), execute)].concat(executeConfig.useControlEnter() ? [$_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
        $_bpva3tzpjcun41zi.isControl,
        $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.ENTER())
      ]), execute)] : []);
  };
  var getEvents = $_b4h1biwbjcun41ml.constant({});
  var getApis = $_b4h1biwbjcun41ml.constant({});
  var ExecutionType = $_6gyd88zfjcun41y7.typical(schema$1, $_gfn15dxqjcun41rp.init, getRules, getEvents, getApis, $_fseuruwajcun41mi.none());

  var flatgrid = function (spec) {
    var dimensions = Cell($_fseuruwajcun41mi.none());
    var setGridSize = function (numRows, numColumns) {
      dimensions.set($_fseuruwajcun41mi.some({
        numRows: $_b4h1biwbjcun41ml.constant(numRows),
        numColumns: $_b4h1biwbjcun41ml.constant(numColumns)
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
      readState: $_b4h1biwbjcun41ml.constant({}),
      setGridSize: setGridSize,
      getNumRows: getNumRows,
      getNumColumns: getNumColumns
    });
  };
  var init$1 = function (spec) {
    return spec.state()(spec);
  };
  var $_8xey1m100jcun420q = {
    flatgrid: flatgrid,
    init: init$1
  };

  var onDirection = function (isLtr, isRtl) {
    return function (element) {
      return getDirection(element) === 'rtl' ? isRtl : isLtr;
    };
  };
  var getDirection = function (element) {
    return $_ebvjd9zsjcun41zr.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_ebwonj102jcun420z = {
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
    var movement = $_ebwonj102jcun420z.onDirection(moveLeft, moveRight);
    return useH(movement);
  };
  var east = function (moveLeft, moveRight) {
    var movement = $_ebwonj102jcun420z.onDirection(moveRight, moveLeft);
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
  var $_75ocjh101jcun420v = {
    east: east,
    west: west,
    north: useV,
    south: useV,
    move: useV
  };

  var indexInfo = $_36fc2ixmjcun41ri.immutableBag([
    'index',
    'candidates'
  ], []);
  var locate = function (candidates, predicate) {
    return $_bjvqngw9jcun41mb.findIndex(candidates, predicate).map(function (index) {
      return indexInfo({
        index: index,
        candidates: candidates
      });
    });
  };
  var $_44e20e104jcun421f = { locate: locate };

  var visibilityToggler = function (element, property, hiddenValue, visibleValue) {
    var initial = $_ebvjd9zsjcun41zr.get(element, property);
    if (initial === undefined)
      initial = '';
    var value = initial === hiddenValue ? visibleValue : hiddenValue;
    var off = $_b4h1biwbjcun41ml.curry($_ebvjd9zsjcun41zr.set, element, property, initial);
    var on = $_b4h1biwbjcun41ml.curry($_ebvjd9zsjcun41zr.set, element, property, value);
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
  var $_5uyhrc105jcun421k = {
    toggler: toggler$1,
    displayToggler: displayToggler,
    isVisible: isVisible
  };

  var locateVisible = function (container, current, selector) {
    var filter = $_5uyhrc105jcun421k.isVisible;
    return locateIn(container, current, selector, filter);
  };
  var locateIn = function (container, current, selector, filter) {
    var predicate = $_b4h1biwbjcun41ml.curry($_6hi5odw8jcun41m3.eq, current);
    var candidates = $_3299iyzkjcun41yx.descendants(container, selector);
    var visible = $_bjvqngw9jcun41mb.filter(candidates, $_5uyhrc105jcun421k.isVisible);
    return $_44e20e104jcun421f.locate(visible, predicate);
  };
  var findIndex$2 = function (elements, target) {
    return $_bjvqngw9jcun41mb.findIndex(elements, function (elem) {
      return $_6hi5odw8jcun41m3.eq(target, elem);
    });
  };
  var $_ap9vz1103jcun4210 = {
    locateVisible: locateVisible,
    locateIn: locateIn,
    findIndex: findIndex$2
  };

  var withGrid = function (values, index, numCols, f) {
    var oldRow = Math.floor(index / numCols);
    var oldColumn = index % numCols;
    return f(oldRow, oldColumn).bind(function (address) {
      var newIndex = address.row() * numCols + address.column();
      return newIndex >= 0 && newIndex < values.length ? $_fseuruwajcun41mi.some(values[newIndex]) : $_fseuruwajcun41mi.none();
    });
  };
  var cycleHorizontal = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var onLastRow = oldRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - oldRow * numCols : numCols;
      var newColumn = $_ed1lcwzjjcun41yv.cycleBy(oldColumn, delta, 0, colsInRow - 1);
      return $_fseuruwajcun41mi.some({
        row: $_b4h1biwbjcun41ml.constant(oldRow),
        column: $_b4h1biwbjcun41ml.constant(newColumn)
      });
    });
  };
  var cycleVertical = function (values, index, numRows, numCols, delta) {
    return withGrid(values, index, numCols, function (oldRow, oldColumn) {
      var newRow = $_ed1lcwzjjcun41yv.cycleBy(oldRow, delta, 0, numRows - 1);
      var onLastRow = newRow === numRows - 1;
      var colsInRow = onLastRow ? values.length - newRow * numCols : numCols;
      var newCol = $_ed1lcwzjjcun41yv.cap(oldColumn, 0, colsInRow - 1);
      return $_fseuruwajcun41mi.some({
        row: $_b4h1biwbjcun41ml.constant(newRow),
        column: $_b4h1biwbjcun41ml.constant(newCol)
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
  var $_b437mk106jcun421n = {
    cycleDown: cycleDown,
    cycleUp: cycleUp,
    cycleLeft: cycleLeft,
    cycleRight: cycleRight
  };

  var schema$2 = [
    $_84yedrx2jcun41om.strict('selector'),
    $_84yedrx2jcun41om.defaulted('execute', $_fwm9y6zyjcun420g.defaultExecute),
    $_f570ayytjcun41vk.onKeyboardHandler('onEscape'),
    $_84yedrx2jcun41om.defaulted('captureTab', false),
    $_f570ayytjcun41vk.initSize()
  ];
  var focusIn = function (component, gridConfig, gridState) {
    $_akwq9fzmjcun41z4.descendant(component.element(), gridConfig.selector()).each(function (first) {
      gridConfig.focusManager().set(component, first);
    });
  };
  var findCurrent = function (component, gridConfig) {
    return gridConfig.focusManager().get(component).bind(function (elem) {
      return $_akwq9fzmjcun41z4.closest(elem, gridConfig.selector());
    });
  };
  var execute$1 = function (component, simulatedEvent, gridConfig, gridState) {
    return findCurrent(component, gridConfig).bind(function (focused) {
      return gridConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var doMove = function (cycle) {
    return function (element, focused, gridConfig, gridState) {
      return $_ap9vz1103jcun4210.locateVisible(element, focused, gridConfig.selector()).bind(function (identified) {
        return cycle(identified.candidates(), identified.index(), gridState.getNumRows().getOr(gridConfig.initSize().numRows()), gridState.getNumColumns().getOr(gridConfig.initSize().numColumns()));
      });
    };
  };
  var handleTab = function (component, simulatedEvent, gridConfig, gridState) {
    return gridConfig.captureTab() ? $_fseuruwajcun41mi.some(true) : $_fseuruwajcun41mi.none();
  };
  var doEscape = function (component, simulatedEvent, gridConfig, gridState) {
    return gridConfig.onEscape()(component, simulatedEvent);
  };
  var moveLeft = doMove($_b437mk106jcun421n.cycleLeft);
  var moveRight = doMove($_b437mk106jcun421n.cycleRight);
  var moveNorth = doMove($_b437mk106jcun421n.cycleUp);
  var moveSouth = doMove($_b437mk106jcun421n.cycleDown);
  var getRules$1 = $_b4h1biwbjcun41ml.constant([
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.LEFT()), $_75ocjh101jcun420v.west(moveLeft, moveRight)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.RIGHT()), $_75ocjh101jcun420v.east(moveLeft, moveRight)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.UP()), $_75ocjh101jcun420v.north(moveNorth)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.DOWN()), $_75ocjh101jcun420v.south(moveSouth)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
      $_bpva3tzpjcun41zi.isShift,
      $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.TAB())
    ]), handleTab),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
      $_bpva3tzpjcun41zi.isNotShift,
      $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.TAB())
    ]), handleTab),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.ESCAPE()), doEscape),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.SPACE().concat($_dodgizejcun41y4.ENTER())), execute$1)
  ]);
  var getEvents$1 = $_b4h1biwbjcun41ml.constant({});
  var getApis$1 = {};
  var FlatgridType = $_6gyd88zfjcun41y7.typical(schema$2, $_8xey1m100jcun420q.flatgrid, getRules$1, getEvents$1, getApis$1, $_fseuruwajcun41mi.some(focusIn));

  var horizontal = function (container, selector, current, delta) {
    return $_ap9vz1103jcun4210.locateVisible(container, current, selector, $_b4h1biwbjcun41ml.constant(true)).bind(function (identified) {
      var index = identified.index();
      var candidates = identified.candidates();
      var newIndex = $_ed1lcwzjjcun41yv.cycleBy(index, delta, 0, candidates.length - 1);
      return $_fseuruwajcun41mi.from(candidates[newIndex]);
    });
  };
  var $_4d9bha108jcun4220 = { horizontal: horizontal };

  var schema$3 = [
    $_84yedrx2jcun41om.strict('selector'),
    $_84yedrx2jcun41om.defaulted('getInitial', $_fseuruwajcun41mi.none),
    $_84yedrx2jcun41om.defaulted('execute', $_fwm9y6zyjcun420g.defaultExecute),
    $_84yedrx2jcun41om.defaulted('executeOnMove', false)
  ];
  var findCurrent$1 = function (component, flowConfig) {
    return flowConfig.focusManager().get(component).bind(function (elem) {
      return $_akwq9fzmjcun41z4.closest(elem, flowConfig.selector());
    });
  };
  var execute$2 = function (component, simulatedEvent, flowConfig) {
    return findCurrent$1(component, flowConfig).bind(function (focused) {
      return flowConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$1 = function (component, flowConfig) {
    flowConfig.getInitial()(component).or($_akwq9fzmjcun41z4.descendant(component.element(), flowConfig.selector())).each(function (first) {
      flowConfig.focusManager().set(component, first);
    });
  };
  var moveLeft$1 = function (element, focused, info) {
    return $_4d9bha108jcun4220.horizontal(element, info.selector(), focused, -1);
  };
  var moveRight$1 = function (element, focused, info) {
    return $_4d9bha108jcun4220.horizontal(element, info.selector(), focused, +1);
  };
  var doMove$1 = function (movement) {
    return function (component, simulatedEvent, flowConfig) {
      return movement(component, simulatedEvent, flowConfig).bind(function () {
        return flowConfig.executeOnMove() ? execute$2(component, simulatedEvent, flowConfig) : $_fseuruwajcun41mi.some(true);
      });
    };
  };
  var getRules$2 = function (_) {
    return [
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.LEFT().concat($_dodgizejcun41y4.UP())), doMove$1($_75ocjh101jcun420v.west(moveLeft$1, moveRight$1))),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.RIGHT().concat($_dodgizejcun41y4.DOWN())), doMove$1($_75ocjh101jcun420v.east(moveLeft$1, moveRight$1))),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.ENTER()), execute$2),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.SPACE()), execute$2)
    ];
  };
  var getEvents$2 = $_b4h1biwbjcun41ml.constant({});
  var getApis$2 = $_b4h1biwbjcun41ml.constant({});
  var FlowType = $_6gyd88zfjcun41y7.typical(schema$3, $_gfn15dxqjcun41rp.init, getRules$2, getEvents$2, getApis$2, $_fseuruwajcun41mi.some(focusIn$1));

  var outcome = $_36fc2ixmjcun41ri.immutableBag([
    'rowIndex',
    'columnIndex',
    'cell'
  ], []);
  var toCell = function (matrix, rowIndex, columnIndex) {
    return $_fseuruwajcun41mi.from(matrix[rowIndex]).bind(function (row) {
      return $_fseuruwajcun41mi.from(row[columnIndex]).map(function (cell) {
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
    var newColIndex = $_ed1lcwzjjcun41yv.cycleBy(startCol, deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var cycleVertical$1 = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_ed1lcwzjjcun41yv.cycleBy(startRow, deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_ed1lcwzjjcun41yv.cap(colIndex, 0, colsInNextRow - 1);
    return toCell(matrix, nextRowIndex, nextColIndex);
  };
  var moveHorizontal = function (matrix, rowIndex, startCol, deltaCol) {
    var row = matrix[rowIndex];
    var colsInRow = row.length;
    var newColIndex = $_ed1lcwzjjcun41yv.cap(startCol + deltaCol, 0, colsInRow - 1);
    return toCell(matrix, rowIndex, newColIndex);
  };
  var moveVertical = function (matrix, colIndex, startRow, deltaRow) {
    var nextRowIndex = $_ed1lcwzjjcun41yv.cap(startRow + deltaRow, 0, matrix.length - 1);
    var colsInNextRow = matrix[nextRowIndex].length;
    var nextColIndex = $_ed1lcwzjjcun41yv.cap(colIndex, 0, colsInNextRow - 1);
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
  var $_3297bb10ajcun422e = {
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
    $_84yedrx2jcun41om.strictObjOf('selectors', [
      $_84yedrx2jcun41om.strict('row'),
      $_84yedrx2jcun41om.strict('cell')
    ]),
    $_84yedrx2jcun41om.defaulted('cycles', true),
    $_84yedrx2jcun41om.defaulted('previousSelector', $_fseuruwajcun41mi.none),
    $_84yedrx2jcun41om.defaulted('execute', $_fwm9y6zyjcun420g.defaultExecute)
  ];
  var focusIn$2 = function (component, matrixConfig) {
    var focused = matrixConfig.previousSelector()(component).orThunk(function () {
      var selectors = matrixConfig.selectors();
      return $_akwq9fzmjcun41z4.descendant(component.element(), selectors.cell());
    });
    focused.each(function (cell) {
      matrixConfig.focusManager().set(component, cell);
    });
  };
  var execute$3 = function (component, simulatedEvent, matrixConfig) {
    return $_5qyty2ygjcun41u1.search(component.element()).bind(function (focused) {
      return matrixConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var toMatrix = function (rows, matrixConfig) {
    return $_bjvqngw9jcun41mb.map(rows, function (row) {
      return $_3299iyzkjcun41yx.descendants(row, matrixConfig.selectors().cell());
    });
  };
  var doMove$2 = function (ifCycle, ifMove) {
    return function (element, focused, matrixConfig) {
      var move = matrixConfig.cycles() ? ifCycle : ifMove;
      return $_akwq9fzmjcun41z4.closest(focused, matrixConfig.selectors().row()).bind(function (inRow) {
        var cellsInRow = $_3299iyzkjcun41yx.descendants(inRow, matrixConfig.selectors().cell());
        return $_ap9vz1103jcun4210.findIndex(cellsInRow, focused).bind(function (colIndex) {
          var allRows = $_3299iyzkjcun41yx.descendants(element, matrixConfig.selectors().row());
          return $_ap9vz1103jcun4210.findIndex(allRows, inRow).bind(function (rowIndex) {
            var matrix = toMatrix(allRows, matrixConfig);
            return move(matrix, rowIndex, colIndex).map(function (next) {
              return next.cell();
            });
          });
        });
      });
    };
  };
  var moveLeft$2 = doMove$2($_3297bb10ajcun422e.cycleLeft, $_3297bb10ajcun422e.moveLeft);
  var moveRight$2 = doMove$2($_3297bb10ajcun422e.cycleRight, $_3297bb10ajcun422e.moveRight);
  var moveNorth$1 = doMove$2($_3297bb10ajcun422e.cycleUp, $_3297bb10ajcun422e.moveUp);
  var moveSouth$1 = doMove$2($_3297bb10ajcun422e.cycleDown, $_3297bb10ajcun422e.moveDown);
  var getRules$3 = $_b4h1biwbjcun41ml.constant([
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.LEFT()), $_75ocjh101jcun420v.west(moveLeft$2, moveRight$2)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.RIGHT()), $_75ocjh101jcun420v.east(moveLeft$2, moveRight$2)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.UP()), $_75ocjh101jcun420v.north(moveNorth$1)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.DOWN()), $_75ocjh101jcun420v.south(moveSouth$1)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.SPACE().concat($_dodgizejcun41y4.ENTER())), execute$3)
  ]);
  var getEvents$3 = $_b4h1biwbjcun41ml.constant({});
  var getApis$3 = $_b4h1biwbjcun41ml.constant({});
  var MatrixType = $_6gyd88zfjcun41y7.typical(schema$4, $_gfn15dxqjcun41rp.init, getRules$3, getEvents$3, getApis$3, $_fseuruwajcun41mi.some(focusIn$2));

  var schema$5 = [
    $_84yedrx2jcun41om.strict('selector'),
    $_84yedrx2jcun41om.defaulted('execute', $_fwm9y6zyjcun420g.defaultExecute),
    $_84yedrx2jcun41om.defaulted('moveOnTab', false)
  ];
  var execute$4 = function (component, simulatedEvent, menuConfig) {
    return menuConfig.focusManager().get(component).bind(function (focused) {
      return menuConfig.execute()(component, simulatedEvent, focused);
    });
  };
  var focusIn$3 = function (component, menuConfig, simulatedEvent) {
    $_akwq9fzmjcun41z4.descendant(component.element(), menuConfig.selector()).each(function (first) {
      menuConfig.focusManager().set(component, first);
    });
  };
  var moveUp$1 = function (element, focused, info) {
    return $_4d9bha108jcun4220.horizontal(element, info.selector(), focused, -1);
  };
  var moveDown$1 = function (element, focused, info) {
    return $_4d9bha108jcun4220.horizontal(element, info.selector(), focused, +1);
  };
  var fireShiftTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_75ocjh101jcun420v.move(moveUp$1)(component, simulatedEvent, menuConfig) : $_fseuruwajcun41mi.none();
  };
  var fireTab = function (component, simulatedEvent, menuConfig) {
    return menuConfig.moveOnTab() ? $_75ocjh101jcun420v.move(moveDown$1)(component, simulatedEvent, menuConfig) : $_fseuruwajcun41mi.none();
  };
  var getRules$4 = $_b4h1biwbjcun41ml.constant([
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.UP()), $_75ocjh101jcun420v.move(moveUp$1)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.DOWN()), $_75ocjh101jcun420v.move(moveDown$1)),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
      $_bpva3tzpjcun41zi.isShift,
      $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.TAB())
    ]), fireShiftTab),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
      $_bpva3tzpjcun41zi.isNotShift,
      $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.TAB())
    ]), fireTab),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.ENTER()), execute$4),
    $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.SPACE()), execute$4)
  ]);
  var getEvents$4 = $_b4h1biwbjcun41ml.constant({});
  var getApis$4 = $_b4h1biwbjcun41ml.constant({});
  var MenuType = $_6gyd88zfjcun41y7.typical(schema$5, $_gfn15dxqjcun41rp.init, getRules$4, getEvents$4, getApis$4, $_fseuruwajcun41mi.some(focusIn$3));

  var schema$6 = [
    $_f570ayytjcun41vk.onKeyboardHandler('onSpace'),
    $_f570ayytjcun41vk.onKeyboardHandler('onEnter'),
    $_f570ayytjcun41vk.onKeyboardHandler('onShiftEnter'),
    $_f570ayytjcun41vk.onKeyboardHandler('onLeft'),
    $_f570ayytjcun41vk.onKeyboardHandler('onRight'),
    $_f570ayytjcun41vk.onKeyboardHandler('onTab'),
    $_f570ayytjcun41vk.onKeyboardHandler('onShiftTab'),
    $_f570ayytjcun41vk.onKeyboardHandler('onUp'),
    $_f570ayytjcun41vk.onKeyboardHandler('onDown'),
    $_f570ayytjcun41vk.onKeyboardHandler('onEscape'),
    $_84yedrx2jcun41om.option('focusIn')
  ];
  var getRules$5 = function (component, simulatedEvent, executeInfo) {
    return [
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.SPACE()), executeInfo.onSpace()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
        $_bpva3tzpjcun41zi.isNotShift,
        $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.ENTER())
      ]), executeInfo.onEnter()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
        $_bpva3tzpjcun41zi.isShift,
        $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.ENTER())
      ]), executeInfo.onShiftEnter()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
        $_bpva3tzpjcun41zi.isShift,
        $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.TAB())
      ]), executeInfo.onShiftTab()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.and([
        $_bpva3tzpjcun41zi.isNotShift,
        $_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.TAB())
      ]), executeInfo.onTab()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.UP()), executeInfo.onUp()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.DOWN()), executeInfo.onDown()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.LEFT()), executeInfo.onLeft()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.RIGHT()), executeInfo.onRight()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.SPACE()), executeInfo.onSpace()),
      $_5r85yvzojcun41ze.rule($_bpva3tzpjcun41zi.inSet($_dodgizejcun41y4.ESCAPE()), executeInfo.onEscape())
    ];
  };
  var focusIn$4 = function (component, executeInfo) {
    return executeInfo.focusIn().bind(function (f) {
      return f(component, executeInfo);
    });
  };
  var getEvents$5 = $_b4h1biwbjcun41ml.constant({});
  var getApis$5 = $_b4h1biwbjcun41ml.constant({});
  var SpecialType = $_6gyd88zfjcun41y7.typical(schema$6, $_gfn15dxqjcun41rp.init, getRules$5, getEvents$5, getApis$5, $_fseuruwajcun41mi.some(focusIn$4));

  var $_6hv986zbjcun41xn = {
    acyclic: AcyclicType.schema(),
    cyclic: CyclicType.schema(),
    flow: FlowType.schema(),
    flatgrid: FlatgridType.schema(),
    matrix: MatrixType.schema(),
    execution: ExecutionType.schema(),
    menu: MenuType.schema(),
    special: SpecialType.schema()
  };

  var Keying = $_bv6ofew4jcun41l1.createModes({
    branchKey: 'mode',
    branches: $_6hv986zbjcun41xn,
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
        if (!$_dwtfyfx6jcun41po.hasKey(keyState, 'setGridSize')) {
          console.error('Layout does not support setGridSize');
        } else {
          keyState.setGridSize(numRows, numColumns);
        }
      }
    },
    state: $_8xey1m100jcun420q
  });

  var field$1 = function (name, forbidden) {
    return $_84yedrx2jcun41om.defaultedObjOf(name, {}, $_bjvqngw9jcun41mb.map(forbidden, function (f) {
      return $_84yedrx2jcun41om.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
    }).concat([$_84yedrx2jcun41om.state('dump', $_b4h1biwbjcun41ml.identity)]));
  };
  var get$5 = function (data) {
    return data.dump();
  };
  var $_g2kwcr10djcun422w = {
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
  var $_4u02bb10gjcun423m = { generate: generate$1 };

  var premadeTag = $_4u02bb10gjcun423m.generate('alloy-premade');
  var apiConfig = $_4u02bb10gjcun423m.generate('api');
  var premade = function (comp) {
    return $_dwtfyfx6jcun41po.wrap(premadeTag, comp);
  };
  var getPremade = function (spec) {
    return $_dwtfyfx6jcun41po.readOptFrom(spec, premadeTag);
  };
  var makeApi = function (f) {
    return $_8y3v3cxjjcun41r3.markAsSketchApi(function (component) {
      var args = Array.prototype.slice.call(arguments, 0);
      var spi = component.config(apiConfig);
      return f.apply(undefined, [spi].concat(args));
    }, f);
  };
  var $_d2u2o810fjcun423g = {
    apiConfig: $_b4h1biwbjcun41ml.constant(apiConfig),
    makeApi: makeApi,
    premade: premade,
    getPremade: getPremade
  };

  var adt$2 = $_f19awjx4jcun41p6.generate([
    { required: ['data'] },
    { external: ['data'] },
    { optional: ['data'] },
    { group: ['data'] }
  ]);
  var fFactory = $_84yedrx2jcun41om.defaulted('factory', { sketch: $_b4h1biwbjcun41ml.identity });
  var fSchema = $_84yedrx2jcun41om.defaulted('schema', []);
  var fName = $_84yedrx2jcun41om.strict('name');
  var fPname = $_84yedrx2jcun41om.field('pname', 'pname', $_3688l1x3jcun41p0.defaultedThunk(function (typeSpec) {
    return '<alloy.' + $_4u02bb10gjcun423m.generate(typeSpec.name) + '>';
  }), $_a6j4ohxhjcun41qn.anyValue());
  var fDefaults = $_84yedrx2jcun41om.defaulted('defaults', $_b4h1biwbjcun41ml.constant({}));
  var fOverrides = $_84yedrx2jcun41om.defaulted('overrides', $_b4h1biwbjcun41ml.constant({}));
  var requiredSpec = $_a6j4ohxhjcun41qn.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var externalSpec = $_a6j4ohxhjcun41qn.objOf([
    fFactory,
    fSchema,
    fName,
    fDefaults,
    fOverrides
  ]);
  var optionalSpec = $_a6j4ohxhjcun41qn.objOf([
    fFactory,
    fSchema,
    fName,
    fPname,
    fDefaults,
    fOverrides
  ]);
  var groupSpec = $_a6j4ohxhjcun41qn.objOf([
    fFactory,
    fSchema,
    fName,
    $_84yedrx2jcun41om.strict('unit'),
    fPname,
    fDefaults,
    fOverrides
  ]);
  var asNamedPart = function (part) {
    return part.fold($_fseuruwajcun41mi.some, $_fseuruwajcun41mi.none, $_fseuruwajcun41mi.some, $_fseuruwajcun41mi.some);
  };
  var name$1 = function (part) {
    var get = function (data) {
      return data.name();
    };
    return part.fold(get, get, get, get);
  };
  var asCommon = function (part) {
    return part.fold($_b4h1biwbjcun41ml.identity, $_b4h1biwbjcun41ml.identity, $_b4h1biwbjcun41ml.identity, $_b4h1biwbjcun41ml.identity);
  };
  var convert = function (adtConstructor, partSpec) {
    return function (spec) {
      var data = $_a6j4ohxhjcun41qn.asStructOrDie('Converting part type', partSpec, spec);
      return adtConstructor(data);
    };
  };
  var $_c6iged10kjcun424e = {
    required: convert(adt$2.required, requiredSpec),
    external: convert(adt$2.external, externalSpec),
    optional: convert(adt$2.optional, optionalSpec),
    group: convert(adt$2.group, groupSpec),
    asNamedPart: asNamedPart,
    name: name$1,
    asCommon: asCommon,
    original: $_b4h1biwbjcun41ml.constant('entirety')
  };

  var placeholder = 'placeholder';
  var adt$3 = $_f19awjx4jcun41p6.generate([
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
    return $_bjvqngw9jcun41mb.contains([placeholder], uiType);
  };
  var subPlaceholder = function (owner, detail, compSpec, placeholders) {
    if (owner.exists(function (o) {
        return o !== compSpec.owner;
      }))
      return adt$3.single(true, $_b4h1biwbjcun41ml.constant(compSpec));
    return $_dwtfyfx6jcun41po.readOptFrom(placeholders, compSpec.name).fold(function () {
      throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + $_fwofm0x0jcun41o8.keys(placeholders) + ']\nNamespace: ' + owner.getOr('none') + '\nSpec: ' + $_48mdwnxfjcun41qi.stringify(compSpec, null, 2));
    }, function (newSpec) {
      return newSpec.replace();
    });
  };
  var scan = function (owner, detail, compSpec, placeholders) {
    if (compSpec.uiType === placeholder)
      return subPlaceholder(owner, detail, compSpec, placeholders);
    else
      return adt$3.single(false, $_b4h1biwbjcun41ml.constant(compSpec));
  };
  var substitute = function (owner, detail, compSpec, placeholders) {
    var base = scan(owner, detail, compSpec, placeholders);
    return base.fold(function (req, valueThunk) {
      var value = valueThunk(detail, compSpec.config, compSpec.validated);
      var childSpecs = $_dwtfyfx6jcun41po.readOptFrom(value, 'components').getOr([]);
      var substituted = $_bjvqngw9jcun41mb.bind(childSpecs, function (c) {
        return substitute(owner, detail, c, placeholders);
      });
      return [$_do57nmwyjcun41o6.deepMerge(value, { components: substituted })];
    }, function (req, valuesThunk) {
      var values = valuesThunk(detail, compSpec.config, compSpec.validated);
      return values;
    });
  };
  var substituteAll = function (owner, detail, components, placeholders) {
    return $_bjvqngw9jcun41mb.bind(components, function (c) {
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
      name: $_b4h1biwbjcun41ml.constant(label),
      required: required,
      used: used,
      replace: replace
    };
  };
  var substitutePlaces = function (owner, detail, components, placeholders) {
    var ps = $_fwofm0x0jcun41o8.map(placeholders, function (ph, name) {
      return oneReplace(name, ph);
    });
    var outcome = substituteAll(owner, detail, components, ps);
    $_fwofm0x0jcun41o8.each(ps, function (p) {
      if (p.used() === false && p.required()) {
        throw new Error('Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' + $_48mdwnxfjcun41qi.stringify(detail.components(), null, 2));
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
  var $_cpolyu10ljcun424o = {
    single: adt$3.single,
    multiple: adt$3.multiple,
    isSubstitute: isSubstitute,
    placeholder: $_b4h1biwbjcun41ml.constant(placeholder),
    substituteAll: substituteAll,
    substitutePlaces: substitutePlaces,
    singleReplace: singleReplace
  };

  var combine = function (detail, data, partSpec, partValidated) {
    var spec = partSpec;
    return $_do57nmwyjcun41o6.deepMerge(data.defaults()(detail, partSpec, partValidated), partSpec, { uid: detail.partUids()[data.name()] }, data.overrides()(detail, partSpec, partValidated), { 'debug.sketcher': $_dwtfyfx6jcun41po.wrap('part-' + data.name(), spec) });
  };
  var subs = function (owner, detail, parts) {
    var internals = {};
    var externals = {};
    $_bjvqngw9jcun41mb.each(parts, function (part) {
      part.fold(function (data) {
        internals[data.pname()] = $_cpolyu10ljcun424o.single(true, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        var partSpec = detail.parts()[data.name()]();
        externals[data.name()] = $_b4h1biwbjcun41ml.constant(combine(detail, data, partSpec[$_c6iged10kjcun424e.original()]()));
      }, function (data) {
        internals[data.pname()] = $_cpolyu10ljcun424o.single(false, function (detail, partSpec, partValidated) {
          return data.factory().sketch(combine(detail, data, partSpec, partValidated));
        });
      }, function (data) {
        internals[data.pname()] = $_cpolyu10ljcun424o.multiple(true, function (detail, _partSpec, _partValidated) {
          var units = detail[data.name()]();
          return $_bjvqngw9jcun41mb.map(units, function (u) {
            return data.factory().sketch($_do57nmwyjcun41o6.deepMerge(data.defaults()(detail, u), u, data.overrides()(detail, u)));
          });
        });
      });
    });
    return {
      internals: $_b4h1biwbjcun41ml.constant(internals),
      externals: $_b4h1biwbjcun41ml.constant(externals)
    };
  };
  var $_3sq4dy10jjcun4248 = { subs: subs };

  var generate$2 = function (owner, parts) {
    var r = {};
    $_bjvqngw9jcun41mb.each(parts, function (part) {
      $_c6iged10kjcun424e.asNamedPart(part).each(function (np) {
        var g = doGenerateOne(owner, np.pname());
        r[np.name()] = function (config) {
          var validated = $_a6j4ohxhjcun41qn.asRawOrDie('Part: ' + np.name() + ' in ' + owner, $_a6j4ohxhjcun41qn.objOf(np.schema()), config);
          return $_do57nmwyjcun41o6.deepMerge(g, {
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
      uiType: $_cpolyu10ljcun424o.placeholder(),
      owner: owner,
      name: pname
    };
  };
  var generateOne = function (owner, pname, config) {
    return {
      uiType: $_cpolyu10ljcun424o.placeholder(),
      owner: owner,
      name: pname,
      config: config,
      validated: {}
    };
  };
  var schemas = function (parts) {
    return $_bjvqngw9jcun41mb.bind(parts, function (part) {
      return part.fold($_fseuruwajcun41mi.none, $_fseuruwajcun41mi.some, $_fseuruwajcun41mi.none, $_fseuruwajcun41mi.none).map(function (data) {
        return $_84yedrx2jcun41om.strictObjOf(data.name(), data.schema().concat([$_f570ayytjcun41vk.snapshot($_c6iged10kjcun424e.original())]));
      }).toArray();
    });
  };
  var names = function (parts) {
    return $_bjvqngw9jcun41mb.map(parts, $_c6iged10kjcun424e.name);
  };
  var substitutes = function (owner, detail, parts) {
    return $_3sq4dy10jjcun4248.subs(owner, detail, parts);
  };
  var components = function (owner, detail, internals) {
    return $_cpolyu10ljcun424o.substitutePlaces($_fseuruwajcun41mi.some(owner), detail, detail.components(), internals);
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
    $_bjvqngw9jcun41mb.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]);
    });
    return $_fwofm0x0jcun41o8.map(r, $_b4h1biwbjcun41ml.constant);
  };
  var getAllParts = function (component, detail) {
    var system = component.getSystem();
    return $_fwofm0x0jcun41o8.map(detail.partUids(), function (pUid, k) {
      return $_b4h1biwbjcun41ml.constant(system.getByUid(pUid));
    });
  };
  var getPartsOrDie = function (component, detail, partKeys) {
    var r = {};
    var uids = detail.partUids();
    var system = component.getSystem();
    $_bjvqngw9jcun41mb.each(partKeys, function (pk) {
      r[pk] = system.getByUid(uids[pk]).getOrDie();
    });
    return $_fwofm0x0jcun41o8.map(r, $_b4h1biwbjcun41ml.constant);
  };
  var defaultUids = function (baseUid, partTypes) {
    var partNames = names(partTypes);
    return $_dwtfyfx6jcun41po.wrapAll($_bjvqngw9jcun41mb.map(partNames, function (pn) {
      return {
        key: pn,
        value: baseUid + '-' + pn
      };
    }));
  };
  var defaultUidsSchema = function (partTypes) {
    return $_84yedrx2jcun41om.field('partUids', 'partUids', $_3688l1x3jcun41p0.mergeWithThunk(function (spec) {
      return defaultUids(spec.uid, partTypes);
    }), $_a6j4ohxhjcun41qn.anyValue());
  };
  var $_ft7qt810ijcun423t = {
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
  var $_1ehco010njcun425b = {
    prefix: $_b4h1biwbjcun41ml.constant(prefix$2),
    idAttr: $_b4h1biwbjcun41ml.constant(idAttr$1)
  };

  var prefix$1 = $_1ehco010njcun425b.prefix();
  var idAttr = $_1ehco010njcun425b.idAttr();
  var write = function (label, elem) {
    var id = $_4u02bb10gjcun423m.generate(prefix$1 + label);
    $_f8g4i8xwjcun41s0.set(elem, idAttr, id);
    return id;
  };
  var writeOnly = function (elem, uid) {
    $_f8g4i8xwjcun41s0.set(elem, idAttr, uid);
  };
  var read$2 = function (elem) {
    var id = $_cbjvosxxjcun41s5.isElement(elem) ? $_f8g4i8xwjcun41s0.get(elem, idAttr) : null;
    return $_fseuruwajcun41mi.from(id);
  };
  var find$3 = function (container, id) {
    return $_akwq9fzmjcun41z4.descendant(container, id);
  };
  var generate$3 = function (prefix) {
    return $_4u02bb10gjcun423m.generate(prefix);
  };
  var revoke = function (elem) {
    $_f8g4i8xwjcun41s0.remove(elem, idAttr);
  };
  var $_37h05n10mjcun424y = {
    revoke: revoke,
    write: write,
    writeOnly: writeOnly,
    read: read$2,
    find: find$3,
    generate: generate$3,
    attribute: $_b4h1biwbjcun41ml.constant(idAttr)
  };

  var getPartsSchema = function (partNames, _optPartNames, _owner) {
    var owner = _owner !== undefined ? _owner : 'Unknown owner';
    var fallbackThunk = function () {
      return [$_f570ayytjcun41vk.output('partUids', {})];
    };
    var optPartNames = _optPartNames !== undefined ? _optPartNames : fallbackThunk();
    if (partNames.length === 0 && optPartNames.length === 0)
      return fallbackThunk();
    var partsSchema = $_84yedrx2jcun41om.strictObjOf('parts', $_bjvqngw9jcun41mb.flatten([
      $_bjvqngw9jcun41mb.map(partNames, $_84yedrx2jcun41om.strict),
      $_bjvqngw9jcun41mb.map(optPartNames, function (optPart) {
        return $_84yedrx2jcun41om.defaulted(optPart, $_cpolyu10ljcun424o.single(false, function () {
          throw new Error('The optional part: ' + optPart + ' was not specified in the config, but it was used in components');
        }));
      })
    ]));
    var partUidsSchema = $_84yedrx2jcun41om.state('partUids', function (spec) {
      if (!$_dwtfyfx6jcun41po.hasKey(spec, 'parts')) {
        throw new Error('Part uid definition for owner: ' + owner + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' + $_48mdwnxfjcun41qi.stringify(spec, null, 2));
      }
      var uids = $_fwofm0x0jcun41o8.map(spec.parts, function (v, k) {
        return $_dwtfyfx6jcun41po.readOptFrom(v, 'uid').getOrThunk(function () {
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
    var ps = partSchemas.length > 0 ? [$_84yedrx2jcun41om.strictObjOf('parts', partSchemas)] : [];
    return ps.concat([
      $_84yedrx2jcun41om.strict('uid'),
      $_84yedrx2jcun41om.defaulted('dom', {}),
      $_84yedrx2jcun41om.defaulted('components', []),
      $_f570ayytjcun41vk.snapshot('originalSpec'),
      $_84yedrx2jcun41om.defaulted('debug.sketcher', {})
    ]).concat(partUidsSchemas);
  };
  var asRawOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, spec, partUidsSchemas);
    return $_a6j4ohxhjcun41qn.asRawOrDie(label + ' [SpecSchema]', $_a6j4ohxhjcun41qn.objOfOnly(baseS.concat(schema)), spec);
  };
  var asStructOrDie$1 = function (label, schema, spec, partSchemas, partUidsSchemas) {
    var baseS = base$1(label, partSchemas, partUidsSchemas, spec);
    return $_a6j4ohxhjcun41qn.asStructOrDie(label + ' [SpecSchema]', $_a6j4ohxhjcun41qn.objOfOnly(baseS.concat(schema)), spec);
  };
  var extend = function (builder, original, nu) {
    var newSpec = $_do57nmwyjcun41o6.deepMerge(original, nu);
    return builder(newSpec);
  };
  var addBehaviours = function (original, behaviours) {
    return $_do57nmwyjcun41o6.deepMerge(original, behaviours);
  };
  var $_14l6km10ojcun425e = {
    asRawOrDie: asRawOrDie$1,
    asStructOrDie: asStructOrDie$1,
    addBehaviours: addBehaviours,
    getPartsSchema: getPartsSchema,
    extend: extend
  };

  var single$1 = function (owner, schema, factory, spec) {
    var specWithUid = supplyUid(spec);
    var detail = $_14l6km10ojcun425e.asStructOrDie(owner, schema, specWithUid, [], []);
    return $_do57nmwyjcun41o6.deepMerge(factory(detail, specWithUid), { 'debug.sketcher': $_dwtfyfx6jcun41po.wrap(owner, spec) });
  };
  var composite$1 = function (owner, schema, partTypes, factory, spec) {
    var specWithUid = supplyUid(spec);
    var partSchemas = $_ft7qt810ijcun423t.schemas(partTypes);
    var partUidsSchema = $_ft7qt810ijcun423t.defaultUidsSchema(partTypes);
    var detail = $_14l6km10ojcun425e.asStructOrDie(owner, schema, specWithUid, partSchemas, [partUidsSchema]);
    var subs = $_ft7qt810ijcun423t.substitutes(owner, detail, partTypes);
    var components = $_ft7qt810ijcun423t.components(owner, detail, subs.internals());
    return $_do57nmwyjcun41o6.deepMerge(factory(detail, components, specWithUid, subs.externals()), { 'debug.sketcher': $_dwtfyfx6jcun41po.wrap(owner, spec) });
  };
  var supplyUid = function (spec) {
    return $_do57nmwyjcun41o6.deepMerge({ uid: $_37h05n10mjcun424y.generate('uid') }, spec);
  };
  var $_2ul01z10hjcun423n = {
    supplyUid: supplyUid,
    single: single$1,
    composite: composite$1
  };

  var singleSchema = $_a6j4ohxhjcun41qn.objOfOnly([
    $_84yedrx2jcun41om.strict('name'),
    $_84yedrx2jcun41om.strict('factory'),
    $_84yedrx2jcun41om.strict('configFields'),
    $_84yedrx2jcun41om.defaulted('apis', {}),
    $_84yedrx2jcun41om.defaulted('extraApis', {})
  ]);
  var compositeSchema = $_a6j4ohxhjcun41qn.objOfOnly([
    $_84yedrx2jcun41om.strict('name'),
    $_84yedrx2jcun41om.strict('factory'),
    $_84yedrx2jcun41om.strict('configFields'),
    $_84yedrx2jcun41om.strict('partFields'),
    $_84yedrx2jcun41om.defaulted('apis', {}),
    $_84yedrx2jcun41om.defaulted('extraApis', {})
  ]);
  var single = function (rawConfig) {
    var config = $_a6j4ohxhjcun41qn.asRawOrDie('Sketcher for ' + rawConfig.name, singleSchema, rawConfig);
    var sketch = function (spec) {
      return $_2ul01z10hjcun423n.single(config.name, config.configFields, config.factory, spec);
    };
    var apis = $_fwofm0x0jcun41o8.map(config.apis, $_d2u2o810fjcun423g.makeApi);
    var extraApis = $_fwofm0x0jcun41o8.map(config.extraApis, function (f, k) {
      return $_8y3v3cxjjcun41r3.markAsExtraApi(f, k);
    });
    return $_do57nmwyjcun41o6.deepMerge({
      name: $_b4h1biwbjcun41ml.constant(config.name),
      partFields: $_b4h1biwbjcun41ml.constant([]),
      configFields: $_b4h1biwbjcun41ml.constant(config.configFields),
      sketch: sketch
    }, apis, extraApis);
  };
  var composite = function (rawConfig) {
    var config = $_a6j4ohxhjcun41qn.asRawOrDie('Sketcher for ' + rawConfig.name, compositeSchema, rawConfig);
    var sketch = function (spec) {
      return $_2ul01z10hjcun423n.composite(config.name, config.configFields, config.partFields, config.factory, spec);
    };
    var parts = $_ft7qt810ijcun423t.generate(config.name, config.partFields);
    var apis = $_fwofm0x0jcun41o8.map(config.apis, $_d2u2o810fjcun423g.makeApi);
    var extraApis = $_fwofm0x0jcun41o8.map(config.extraApis, function (f, k) {
      return $_8y3v3cxjjcun41r3.markAsExtraApi(f, k);
    });
    return $_do57nmwyjcun41o6.deepMerge({
      name: $_b4h1biwbjcun41ml.constant(config.name),
      partFields: $_b4h1biwbjcun41ml.constant(config.partFields),
      configFields: $_b4h1biwbjcun41ml.constant(config.configFields),
      sketch: sketch,
      parts: $_b4h1biwbjcun41ml.constant(parts)
    }, apis, extraApis);
  };
  var $_8ozmen10ejcun4231 = {
    single: single,
    composite: composite
  };

  var events$4 = function (optAction) {
    var executeHandler = function (action) {
      return $_d87qm6w6jcun41lv.run($_8672kiwwjcun41o0.execute(), function (component, simulatedEvent) {
        action(component);
        simulatedEvent.stop();
      });
    };
    var onClick = function (component, simulatedEvent) {
      simulatedEvent.stop();
      $_ebat3swvjcun41nv.emitExecute(component);
    };
    var onMousedown = function (component, simulatedEvent) {
      simulatedEvent.cut();
    };
    var pointerEvents = $_2lzqzhwgjcun41mu.detect().deviceType.isTouch() ? [$_d87qm6w6jcun41lv.run($_8672kiwwjcun41o0.tap(), onClick)] : [
      $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.click(), onClick),
      $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.mousedown(), onMousedown)
    ];
    return $_d87qm6w6jcun41lv.derive($_bjvqngw9jcun41mb.flatten([
      optAction.map(executeHandler).toArray(),
      pointerEvents
    ]));
  };
  var $_cussc410pjcun425p = { events: events$4 };

  var factory = function (detail, spec) {
    var events = $_cussc410pjcun425p.events(detail.action());
    var optType = $_dwtfyfx6jcun41po.readOptFrom(detail.dom(), 'attributes').bind($_dwtfyfx6jcun41po.readOpt('type'));
    var optTag = $_dwtfyfx6jcun41po.readOptFrom(detail.dom(), 'tag');
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: detail.components(),
      events: events,
      behaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive([
        Focusing.config({}),
        Keying.config({
          mode: 'execution',
          useSpace: true,
          useEnter: true
        })
      ]), $_g2kwcr10djcun422w.get(detail.buttonBehaviours())),
      domModification: {
        attributes: $_do57nmwyjcun41o6.deepMerge(optType.fold(function () {
          return optTag.is('button') ? { type: 'button' } : {};
        }, function (t) {
          return {};
        }), { role: detail.role().getOr('button') })
      },
      eventOrder: detail.eventOrder()
    };
  };
  var Button = $_8ozmen10ejcun4231.single({
    name: 'Button',
    factory: factory,
    configFields: [
      $_84yedrx2jcun41om.defaulted('uid', undefined),
      $_84yedrx2jcun41om.strict('dom'),
      $_84yedrx2jcun41om.defaulted('components', []),
      $_g2kwcr10djcun422w.field('buttonBehaviours', [
        Focusing,
        Keying
      ]),
      $_84yedrx2jcun41om.option('action'),
      $_84yedrx2jcun41om.option('role'),
      $_84yedrx2jcun41om.defaulted('eventOrder', {})
    ]
  });

  var getAttrs = function (elem) {
    var attributes = elem.dom().attributes !== undefined ? elem.dom().attributes : [];
    return $_bjvqngw9jcun41mb.foldl(attributes, function (b, attr) {
      if (attr.name === 'class')
        return b;
      else
        return $_do57nmwyjcun41o6.deepMerge(b, $_dwtfyfx6jcun41po.wrap(attr.name, attr.value));
    }, {});
  };
  var getClasses = function (elem) {
    return Array.prototype.slice.call(elem.dom().classList, 0);
  };
  var fromHtml$2 = function (html) {
    var elem = $_adhjdxwtjcun41nq.fromHtml(html);
    var children = $_df5x8oy3jcun41sv.children(elem);
    var attrs = getAttrs(elem);
    var classes = getClasses(elem);
    var contents = children.length === 0 ? {} : { innerHtml: $_613m7lybjcun41tt.get(elem) };
    return $_do57nmwyjcun41o6.deepMerge({
      tag: $_cbjvosxxjcun41s5.name(elem),
      classes: classes,
      attributes: attrs
    }, contents);
  };
  var sketch = function (sketcher, html, config) {
    return sketcher.sketch($_do57nmwyjcun41o6.deepMerge({ dom: fromHtml$2(html) }, config));
  };
  var $_aa7jr110rjcun425w = {
    fromHtml: fromHtml$2,
    sketch: sketch
  };

  var dom$1 = function (rawHtml) {
    var html = $_dzv179wpjcun41nh.supplant(rawHtml, { prefix: $_4tdysdz1jcun41wo.prefix() });
    return $_aa7jr110rjcun425w.fromHtml(html);
  };
  var spec = function (rawHtml) {
    var sDom = dom$1(rawHtml);
    return { dom: sDom };
  };
  var $_6p4heu10qjcun425t = {
    dom: dom$1,
    spec: spec
  };

  var forToolbarCommand = function (editor, command) {
    return forToolbar(command, function () {
      editor.execCommand(command);
    }, {});
  };
  var getToggleBehaviours = function (command) {
    return $_bv6ofew4jcun41l1.derive([
      Toggling.config({
        toggleClass: $_4tdysdz1jcun41wo.resolve('toolbar-button-selected'),
        toggleOnExecute: false,
        aria: { mode: 'pressed' }
      }),
      $_4ps60kz0jcun41wl.format(command, function (button, status) {
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
      dom: $_6p4heu10qjcun425t.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-' + clazz + ' ${prefix}-icon"></span>'),
      action: action,
      buttonBehaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive([Unselecting.config({})]), extraBehaviours)
    });
  };
  var $_62zzquz2jcun41wq = {
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
  var $_dh2mk610wjcun426s = {
    reduceBy: reduceBy,
    increaseBy: increaseBy,
    findValueOfX: findValueOfX
  };

  var changeEvent = 'slider.change.value';
  var isTouch$1 = $_2lzqzhwgjcun41mu.detect().deviceType.isTouch();
  var getEventSource = function (simulatedEvent) {
    var evt = simulatedEvent.event().raw();
    if (isTouch$1 && evt.touches !== undefined && evt.touches.length === 1)
      return $_fseuruwajcun41mi.some(evt.touches[0]);
    else if (isTouch$1 && evt.touches !== undefined)
      return $_fseuruwajcun41mi.none();
    else if (!isTouch$1 && evt.clientX !== undefined)
      return $_fseuruwajcun41mi.some(evt);
    else
      return $_fseuruwajcun41mi.none();
  };
  var getEventX = function (simulatedEvent) {
    var spot = getEventSource(simulatedEvent);
    return spot.map(function (s) {
      return s.clientX;
    });
  };
  var fireChange = function (component, value) {
    $_ebat3swvjcun41nv.emitWith(component, changeEvent, { value: value });
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
    var value = $_dh2mk610wjcun426s.findValueOfX(spectrumBounds, detail.min(), detail.max(), xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart());
    fireChange(spectrum, value);
  };
  var setXFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
    return getEventX(simulatedEvent).map(function (xValue) {
      setToX(spectrum, spectrumBounds, detail, xValue);
      return xValue;
    });
  };
  var moveLeft$4 = function (spectrum, detail) {
    var newValue = $_dh2mk610wjcun426s.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var moveRight$4 = function (spectrum, detail) {
    var newValue = $_dh2mk610wjcun426s.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
    fireChange(spectrum, newValue);
  };
  var $_6j38vj10vjcun426m = {
    setXFromEvent: setXFromEvent,
    setToLedge: setToLedge,
    setToRedge: setToRedge,
    moveLeftFromRedge: moveLeftFromRedge,
    moveRightFromLedge: moveRightFromLedge,
    moveLeft: moveLeft$4,
    moveRight: moveRight$4,
    changeEvent: $_b4h1biwbjcun41ml.constant(changeEvent)
  };

  var platform = $_2lzqzhwgjcun41mu.detect();
  var isTouch = platform.deviceType.isTouch();
  var edgePart = function (name, action) {
    return $_c6iged10kjcun424e.optional({
      name: '' + name + '-edge',
      overrides: function (detail) {
        var touchEvents = $_d87qm6w6jcun41lv.derive([$_d87qm6w6jcun41lv.runActionExtra($_ay8498wxjcun41o3.touchstart(), action, [detail])]);
        var mouseEvents = $_d87qm6w6jcun41lv.derive([
          $_d87qm6w6jcun41lv.runActionExtra($_ay8498wxjcun41o3.mousedown(), action, [detail]),
          $_d87qm6w6jcun41lv.runActionExtra($_ay8498wxjcun41o3.mousemove(), function (l, det) {
            if (det.mouseIsDown().get())
              action(l, det);
          }, [detail])
        ]);
        return { events: isTouch ? touchEvents : mouseEvents };
      }
    });
  };
  var ledgePart = edgePart('left', $_6j38vj10vjcun426m.setToLedge);
  var redgePart = edgePart('right', $_6j38vj10vjcun426m.setToRedge);
  var thumbPart = $_c6iged10kjcun424e.required({
    name: 'thumb',
    defaults: $_b4h1biwbjcun41ml.constant({ dom: { styles: { position: 'absolute' } } }),
    overrides: function (detail) {
      return {
        events: $_d87qm6w6jcun41lv.derive([
          $_d87qm6w6jcun41lv.redirectToPart($_ay8498wxjcun41o3.touchstart(), detail, 'spectrum'),
          $_d87qm6w6jcun41lv.redirectToPart($_ay8498wxjcun41o3.touchmove(), detail, 'spectrum'),
          $_d87qm6w6jcun41lv.redirectToPart($_ay8498wxjcun41o3.touchend(), detail, 'spectrum')
        ])
      };
    }
  });
  var spectrumPart = $_c6iged10kjcun424e.required({
    schema: [$_84yedrx2jcun41om.state('mouseIsDown', function () {
        return Cell(false);
      })],
    name: 'spectrum',
    overrides: function (detail) {
      var moveToX = function (spectrum, simulatedEvent) {
        var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
        $_6j38vj10vjcun426m.setXFromEvent(spectrum, detail, spectrumBounds, simulatedEvent);
      };
      var touchEvents = $_d87qm6w6jcun41lv.derive([
        $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.touchstart(), moveToX),
        $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.touchmove(), moveToX)
      ]);
      var mouseEvents = $_d87qm6w6jcun41lv.derive([
        $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.mousedown(), moveToX),
        $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.mousemove(), function (spectrum, se) {
          if (detail.mouseIsDown().get())
            moveToX(spectrum, se);
        })
      ]);
      return {
        behaviours: $_bv6ofew4jcun41l1.derive(isTouch ? [] : [
          Keying.config({
            mode: 'special',
            onLeft: function (spectrum) {
              $_6j38vj10vjcun426m.moveLeft(spectrum, detail);
              return $_fseuruwajcun41mi.some(true);
            },
            onRight: function (spectrum) {
              $_6j38vj10vjcun426m.moveRight(spectrum, detail);
              return $_fseuruwajcun41mi.some(true);
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
  var $_bpv2c0110jcun427a = {
    onLoad: onLoad$1,
    onUnload: onUnload,
    setValue: setValue,
    getValue: getValue
  };

  var events$5 = function (repConfig, repState) {
    var es = repConfig.resetOnDom() ? [
      $_d87qm6w6jcun41lv.runOnAttached(function (comp, se) {
        $_bpv2c0110jcun427a.onLoad(comp, repConfig, repState);
      }),
      $_d87qm6w6jcun41lv.runOnDetached(function (comp, se) {
        $_bpv2c0110jcun427a.onUnload(comp, repConfig, repState);
      })
    ] : [$_fga8psw5jcun41lc.loadEvent(repConfig, repState, $_bpv2c0110jcun427a.onLoad)];
    return $_d87qm6w6jcun41lv.derive(es);
  };
  var $_22vskh10zjcun4278 = { events: events$5 };

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
  var $_1e8tkg113jcun427j = {
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
    return $_dwtfyfx6jcun41po.readOptFrom(dataset, key).fold(function () {
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
    $_84yedrx2jcun41om.option('initialValue'),
    $_84yedrx2jcun41om.strict('getFallbackEntry'),
    $_84yedrx2jcun41om.strict('getDataKey'),
    $_84yedrx2jcun41om.strict('setData'),
    $_f570ayytjcun41vk.output('manager', {
      setValue: setValue$1,
      getValue: getValue$1,
      onLoad: onLoad$2,
      onUnload: onUnload$1,
      state: $_1e8tkg113jcun427j.dataset
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
    $_84yedrx2jcun41om.strict('getValue'),
    $_84yedrx2jcun41om.defaulted('setValue', $_b4h1biwbjcun41ml.noop),
    $_84yedrx2jcun41om.option('initialValue'),
    $_f570ayytjcun41vk.output('manager', {
      setValue: setValue$2,
      getValue: getValue$2,
      onLoad: onLoad$3,
      onUnload: $_b4h1biwbjcun41ml.noop,
      state: $_gfn15dxqjcun41rp.init
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
    $_84yedrx2jcun41om.option('initialValue'),
    $_f570ayytjcun41vk.output('manager', {
      setValue: setValue$3,
      getValue: getValue$3,
      onLoad: onLoad$4,
      onUnload: onUnload$2,
      state: $_1e8tkg113jcun427j.memory
    })
  ];

  var RepresentSchema = [
    $_84yedrx2jcun41om.defaultedOf('store', { mode: 'memory' }, $_a6j4ohxhjcun41qn.choose('mode', {
      memory: MemoryStore,
      manual: ManualStore,
      dataset: DatasetStore
    })),
    $_f570ayytjcun41vk.onHandler('onSetValue'),
    $_84yedrx2jcun41om.defaulted('resetOnDom', false)
  ];

  var me = $_bv6ofew4jcun41l1.create({
    fields: RepresentSchema,
    name: 'representing',
    active: $_22vskh10zjcun4278,
    apis: $_bpv2c0110jcun427a,
    extra: {
      setValueFrom: function (component, source) {
        var value = me.getValue(source);
        me.setValue(component, value);
      }
    },
    state: $_1e8tkg113jcun427j
  });

  var isTouch$2 = $_2lzqzhwgjcun41mu.detect().deviceType.isTouch();
  var SliderSchema = [
    $_84yedrx2jcun41om.strict('min'),
    $_84yedrx2jcun41om.strict('max'),
    $_84yedrx2jcun41om.defaulted('stepSize', 1),
    $_84yedrx2jcun41om.defaulted('onChange', $_b4h1biwbjcun41ml.noop),
    $_84yedrx2jcun41om.defaulted('onInit', $_b4h1biwbjcun41ml.noop),
    $_84yedrx2jcun41om.defaulted('onDragStart', $_b4h1biwbjcun41ml.noop),
    $_84yedrx2jcun41om.defaulted('onDragEnd', $_b4h1biwbjcun41ml.noop),
    $_84yedrx2jcun41om.defaulted('snapToGrid', false),
    $_84yedrx2jcun41om.option('snapStart'),
    $_84yedrx2jcun41om.strict('getInitialValue'),
    $_g2kwcr10djcun422w.field('sliderBehaviours', [
      Keying,
      me
    ]),
    $_84yedrx2jcun41om.state('value', function (spec) {
      return Cell(spec.min);
    })
  ].concat(!isTouch$2 ? [$_84yedrx2jcun41om.state('mouseIsDown', function () {
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
    $_ebvjd9zsjcun41zr.set(element, 'max-width', absMax + 'px');
  };
  var $_p9uj117jcun4285 = {
    set: set$4,
    get: get$6,
    getOuter: getOuter$2,
    setMax: setMax$1
  };

  var isTouch$3 = $_2lzqzhwgjcun41mu.detect().deviceType.isTouch();
  var sketch$2 = function (detail, components, spec, externals) {
    var range = detail.max() - detail.min();
    var getXCentre = function (component) {
      var rect = component.element().dom().getBoundingClientRect();
      return (rect.left + rect.right) / 2;
    };
    var getThumb = function (component) {
      return $_ft7qt810ijcun423t.getPartOrDie(component, detail, 'thumb');
    };
    var getXOffset = function (slider, spectrumBounds, detail) {
      var v = detail.value().get();
      if (v < detail.min()) {
        return $_ft7qt810ijcun423t.getPart(slider, detail, 'left-edge').fold(function () {
          return 0;
        }, function (ledge) {
          return getXCentre(ledge) - spectrumBounds.left;
        });
      } else if (v > detail.max()) {
        return $_ft7qt810ijcun423t.getPart(slider, detail, 'right-edge').fold(function () {
          return spectrumBounds.width;
        }, function (redge) {
          return getXCentre(redge) - spectrumBounds.left;
        });
      } else {
        return (detail.value().get() - detail.min()) / range * spectrumBounds.width;
      }
    };
    var getXPos = function (slider) {
      var spectrum = $_ft7qt810ijcun423t.getPartOrDie(slider, detail, 'spectrum');
      var spectrumBounds = spectrum.element().dom().getBoundingClientRect();
      var sliderBounds = slider.element().dom().getBoundingClientRect();
      var xOffset = getXOffset(slider, spectrumBounds, detail);
      return spectrumBounds.left - sliderBounds.left + xOffset;
    };
    var refresh = function (component) {
      var pos = getXPos(component);
      var thumb = getThumb(component);
      var thumbRadius = $_p9uj117jcun4285.get(thumb.element()) / 2;
      $_ebvjd9zsjcun41zr.set(thumb.element(), 'left', pos - thumbRadius + 'px');
    };
    var changeValue = function (component, newValue) {
      var oldValue = detail.value().get();
      var thumb = getThumb(component);
      if (oldValue !== newValue || $_ebvjd9zsjcun41zr.getRaw(thumb.element(), 'left').isNone()) {
        detail.value().set(newValue);
        refresh(component);
        detail.onChange()(component, thumb, newValue);
        return $_fseuruwajcun41mi.some(true);
      } else {
        return $_fseuruwajcun41mi.none();
      }
    };
    var resetToMin = function (slider) {
      changeValue(slider, detail.min());
    };
    var resetToMax = function (slider) {
      changeValue(slider, detail.max());
    };
    var uiEventsArr = isTouch$3 ? [
      $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.touchstart(), function (slider, simulatedEvent) {
        detail.onDragStart()(slider, getThumb(slider));
      }),
      $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.touchend(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
      })
    ] : [
      $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.mousedown(), function (slider, simulatedEvent) {
        simulatedEvent.stop();
        detail.onDragStart()(slider, getThumb(slider));
        detail.mouseIsDown().set(true);
      }),
      $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.mouseup(), function (slider, simulatedEvent) {
        detail.onDragEnd()(slider, getThumb(slider));
        detail.mouseIsDown().set(false);
      })
    ];
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive($_bjvqngw9jcun41mb.flatten([
        !isTouch$3 ? [Keying.config({
            mode: 'special',
            focusIn: function (slider) {
              return $_ft7qt810ijcun423t.getPart(slider, detail, 'spectrum').map(Keying.focusIn).map($_b4h1biwbjcun41ml.constant(true));
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
      ])), $_g2kwcr10djcun422w.get(detail.sliderBehaviours())),
      events: $_d87qm6w6jcun41lv.derive([
        $_d87qm6w6jcun41lv.run($_6j38vj10vjcun426m.changeEvent(), function (slider, simulatedEvent) {
          changeValue(slider, simulatedEvent.event().value());
        }),
        $_d87qm6w6jcun41lv.runOnAttached(function (slider, simulatedEvent) {
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
  var $_8snag116jcun427v = { sketch: sketch$2 };

  var Slider = $_8ozmen10ejcun4231.composite({
    name: 'Slider',
    configFields: SliderSchema,
    partFields: SliderParts,
    factory: $_8snag116jcun427v.sketch,
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
    return $_62zzquz2jcun41wq.forToolbar(clazz, function () {
      var items = makeItems();
      realm.setContextToolbar([{
          label: clazz + ' group',
          items: items
        }]);
    }, {});
  };
  var $_2oi2pl118jcun4287 = { button: button };

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
      $_ebvjd9zsjcun41zr.set(thumb.element(), 'background-color', color);
    };
    var onChange = function (slider, thumb, value) {
      var color = getColor(value);
      $_ebvjd9zsjcun41zr.set(thumb.element(), 'background-color', color);
      spec.onChange(slider, thumb, color);
    };
    return Slider.sketch({
      dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-slider ${prefix}-hue-slider-container"></div>'),
      components: [
        Slider.parts()['left-edge']($_6p4heu10qjcun425t.spec('<div class="${prefix}-hue-slider-black"></div>')),
        Slider.parts().spectrum({
          dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-slider-gradient-container"></div>'),
          components: [$_6p4heu10qjcun425t.spec('<div class="${prefix}-slider-gradient"></div>')],
          behaviours: $_bv6ofew4jcun41l1.derive([Toggling.config({ toggleClass: $_4tdysdz1jcun41wo.resolve('thumb-active') })])
        }),
        Slider.parts()['right-edge']($_6p4heu10qjcun425t.spec('<div class="${prefix}-hue-slider-white"></div>')),
        Slider.parts().thumb({
          dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_bv6ofew4jcun41l1.derive([Toggling.config({ toggleClass: $_4tdysdz1jcun41wo.resolve('thumb-active') })])
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
      sliderBehaviours: $_bv6ofew4jcun41l1.derive([$_4ps60kz0jcun41wl.orientation(Slider.refresh)])
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
    return $_2oi2pl118jcun4287.button(realm, 'color', function () {
      return makeItems(spec);
    });
  };
  var $_g9jbde10sjcun4267 = {
    makeItems: makeItems,
    sketch: sketch$1
  };

  var schema$7 = $_a6j4ohxhjcun41qn.objOfOnly([
    $_84yedrx2jcun41om.strict('getInitialValue'),
    $_84yedrx2jcun41om.strict('onChange'),
    $_84yedrx2jcun41om.strict('category'),
    $_84yedrx2jcun41om.strict('sizes')
  ]);
  var sketch$4 = function (rawSpec) {
    var spec = $_a6j4ohxhjcun41qn.asRawOrDie('SizeSlider', schema$7, rawSpec);
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
          $_4tdysdz1jcun41wo.resolve('slider-' + spec.category + '-size-container'),
          $_4tdysdz1jcun41wo.resolve('slider'),
          $_4tdysdz1jcun41wo.resolve('slider-size-container')
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
      sliderBehaviours: $_bv6ofew4jcun41l1.derive([$_4ps60kz0jcun41wl.orientation(Slider.refresh)]),
      components: [
        Slider.parts().spectrum({
          dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-slider-size-container"></div>'),
          components: [$_6p4heu10qjcun425t.spec('<div class="${prefix}-slider-size-line"></div>')]
        }),
        Slider.parts().thumb({
          dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-slider-thumb"></div>'),
          behaviours: $_bv6ofew4jcun41l1.derive([Toggling.config({ toggleClass: $_4tdysdz1jcun41wo.resolve('thumb-active') })])
        })
      ]
    });
  };
  var $_66amkw11ajcun428a = { sketch: sketch$4 };

  var ancestor$3 = function (scope, transform, isRoot) {
    var element = scope.dom();
    var stop = $_bqe5v5wzjcun41o7.isFunction(isRoot) ? isRoot : $_b4h1biwbjcun41ml.constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = $_adhjdxwtjcun41nq.fromDom(element);
      var transformed = transform(el);
      if (transformed.isSome())
        return transformed;
      else if (stop(el))
        break;
    }
    return $_fseuruwajcun41mi.none();
  };
  var closest$3 = function (scope, transform, isRoot) {
    var current = transform(scope);
    return current.orThunk(function () {
      return isRoot(scope) ? $_fseuruwajcun41mi.none() : ancestor$3(scope, transform, isRoot);
    });
  };
  var $_27jzj611cjcun428p = {
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
    return $_fseuruwajcun41mi.from(candidates[index]);
  };
  var sizeToIndex = function (size) {
    return $_bjvqngw9jcun41mb.findIndex(candidates, function (v) {
      return v === size;
    });
  };
  var getRawOrComputed = function (isRoot, rawStart) {
    var optStart = $_cbjvosxxjcun41s5.isElement(rawStart) ? $_fseuruwajcun41mi.some(rawStart) : $_df5x8oy3jcun41sv.parent(rawStart);
    return optStart.map(function (start) {
      var inline = $_27jzj611cjcun428p.closest(start, function (elem) {
        return $_ebvjd9zsjcun41zr.getRaw(elem, 'font-size');
      }, isRoot);
      return inline.getOrThunk(function () {
        return $_ebvjd9zsjcun41zr.get(start, 'font-size');
      });
    }).getOr('');
  };
  var getSize = function (editor) {
    var node = editor.selection.getStart();
    var elem = $_adhjdxwtjcun41nq.fromDom(node);
    var root = $_adhjdxwtjcun41nq.fromDom(editor.getBody());
    var isRoot = function (e) {
      return $_6hi5odw8jcun41m3.eq(root, e);
    };
    var elemSize = getRawOrComputed(isRoot, elem);
    return $_bjvqngw9jcun41mb.find(candidates, function (size) {
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
  var $_b0dig411bjcun428h = {
    candidates: $_b4h1biwbjcun41ml.constant(candidates),
    get: get$7,
    apply: apply$1
  };

  var sizes = $_b0dig411bjcun428h.candidates();
  var makeSlider$1 = function (spec) {
    return $_66amkw11ajcun428a.sketch({
      onChange: spec.onChange,
      sizes: sizes,
      category: 'font',
      getInitialValue: spec.getInitialValue
    });
  };
  var makeItems$1 = function (spec) {
    return [
      $_6p4heu10qjcun425t.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-small-font ${prefix}-icon"></span>'),
      makeSlider$1(spec),
      $_6p4heu10qjcun425t.spec('<span class="${prefix}-toolbar-button ${prefix}-icon-large-font ${prefix}-icon"></span>')
    ];
  };
  var sketch$3 = function (realm, editor) {
    var spec = {
      onChange: function (value) {
        $_b0dig411bjcun428h.apply(editor, value);
      },
      getInitialValue: function () {
        return $_b0dig411bjcun428h.get(editor);
      }
    };
    return $_2oi2pl118jcun4287.button(realm, 'font-size', function () {
      return makeItems$1(spec);
    });
  };
  var $_2atjdw119jcun4289 = {
    makeItems: makeItems$1,
    sketch: sketch$3
  };

  var record = function (spec) {
    var uid = $_dwtfyfx6jcun41po.hasKey(spec, 'uid') ? spec.uid : $_37h05n10mjcun424y.generate('memento');
    var get = function (any) {
      return any.getSystem().getByUid(uid).getOrDie();
    };
    var getOpt = function (any) {
      return any.getSystem().getByUid(uid).fold($_fseuruwajcun41mi.none, $_fseuruwajcun41mi.some);
    };
    var asSpec = function () {
      return $_do57nmwyjcun41o6.deepMerge(spec, { uid: uid });
    };
    return {
      get: get,
      getOpt: getOpt,
      asSpec: asSpec
    };
  };
  var $_66j02811ejcun4299 = { record: record };

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
  var $_6buo9o11hjcun429r = {
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
  var $_357m8111ijcun429s = {
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
    var f = $_89lxb8wdjcun41mo.getOrDie('Blob');
    return new f(parts, properties);
  };

  var FileReader = function () {
    var f = $_89lxb8wdjcun41mo.getOrDie('FileReader');
    return new f();
  };

  var Uint8Array = function (arr) {
    var f = $_89lxb8wdjcun41mo.getOrDie('Uint8Array');
    return new f(arr);
  };

  var requestAnimationFrame = function (callback) {
    var f = $_89lxb8wdjcun41mo.getOrDie('requestAnimationFrame');
    f(callback);
  };
  var atob = function (base64) {
    var f = $_89lxb8wdjcun41mo.getOrDie('atob');
    return f(base64);
  };
  var $_aro8ju11njcun429y = {
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
      return $_fseuruwajcun41mi.none();
    var mimetype = matches[1];
    var base64 = data[1];
    var sliceSize = 1024;
    var byteCharacters = $_aro8ju11njcun429y.atob(base64);
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
    return $_fseuruwajcun41mi.some(Blob(byteArrays, { type: mimetype }));
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
      canvas = $_6buo9o11hjcun429r.create($_357m8111ijcun429s.getWidth(image), $_357m8111ijcun429s.getHeight(image));
      context = $_6buo9o11hjcun429r.get2dContext(canvas);
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
  var $_fm923d11gjcun429i = {
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
    return $_fm923d11gjcun429i.blobToImage(image);
  };
  var imageToBlob = function (blob) {
    return $_fm923d11gjcun429i.imageToBlob(blob);
  };
  var blobToDataUri = function (blob) {
    return $_fm923d11gjcun429i.blobToDataUri(blob);
  };
  var blobToBase64 = function (blob) {
    return $_fm923d11gjcun429i.blobToBase64(blob);
  };
  var dataUriToBlobSync = function (uri) {
    return $_fm923d11gjcun429i.dataUriToBlobSync(uri);
  };
  var uriToBlob = function (uri) {
    return $_fseuruwajcun41mi.from($_fm923d11gjcun429i.uriToBlob(uri));
  };
  var $_4zthew11fjcun429f = {
    blobToImage: blobToImage,
    imageToBlob: imageToBlob,
    blobToDataUri: blobToDataUri,
    blobToBase64: blobToBase64,
    dataUriToBlobSync: dataUriToBlobSync,
    uriToBlob: uriToBlob
  };

  var addImage = function (editor, blob) {
    $_4zthew11fjcun429f.blobToBase64(blob).then(function (base64) {
      editor.undoManager.transact(function () {
        var cache = editor.editorUpload.blobCache;
        var info = cache.create($_4u02bb10gjcun423m.generate('mceu'), blob, base64);
        cache.add(info);
        var img = editor.dom.createHTML('img', { src: info.blobUri() });
        editor.insertContent(img);
      });
    });
  };
  var extractBlob = function (simulatedEvent) {
    var event = simulatedEvent.event();
    var files = event.raw().target.files || event.raw().dataTransfer.files;
    return $_fseuruwajcun41mi.from(files[0]);
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
    var memPicker = $_66j02811ejcun4299.record({
      dom: pickerDom,
      events: $_d87qm6w6jcun41lv.derive([
        $_d87qm6w6jcun41lv.cutter($_ay8498wxjcun41o3.click()),
        $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.change(), function (picker, simulatedEvent) {
          extractBlob(simulatedEvent).each(function (blob) {
            addImage(editor, blob);
          });
        })
      ])
    });
    return Button.sketch({
      dom: $_6p4heu10qjcun425t.dom('<span class="${prefix}-toolbar-button ${prefix}-icon-image ${prefix}-icon"></span>'),
      components: [memPicker.asSpec()],
      action: function (button) {
        var picker = memPicker.get(button);
        picker.element().dom().click();
      }
    });
  };
  var $_bs19yx11djcun428u = { sketch: sketch$5 };

  var get$8 = function (element) {
    return element.dom().textContent;
  };
  var set$5 = function (element, value) {
    element.dom().textContent = value;
  };
  var $_r9eom11qjcun42ah = {
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
      link: $_fseuruwajcun41mi.none()
    };
  };
  var fromLink = function (link) {
    var text = $_r9eom11qjcun42ah.get(link);
    var url = $_f8g4i8xwjcun41s0.get(link, 'href');
    var title = $_f8g4i8xwjcun41s0.get(link, 'title');
    var target = $_f8g4i8xwjcun41s0.get(link, 'target');
    return {
      url: defaultToEmpty(url),
      text: text !== url ? defaultToEmpty(text) : '',
      title: defaultToEmpty(title),
      target: defaultToEmpty(target),
      link: $_fseuruwajcun41mi.some(link)
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
    var prevHref = $_f8g4i8xwjcun41s0.get(link, 'href');
    var prevText = $_r9eom11qjcun42ah.get(link);
    return prevHref === prevText;
  };
  var getTextToApply = function (link, url, info) {
    return info.text.filter(isNotEmpty).fold(function () {
      return wasSimple(link) ? $_fseuruwajcun41mi.some(url) : $_fseuruwajcun41mi.none();
    }, $_fseuruwajcun41mi.some);
  };
  var unlinkIfRequired = function (editor, info) {
    var activeLink = info.link.bind($_b4h1biwbjcun41ml.identity);
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
      var activeLink = info.link.bind($_b4h1biwbjcun41ml.identity);
      activeLink.fold(function () {
        var text = info.text.filter(isNotEmpty).getOr(url);
        editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
      }, function (link) {
        var text = getTextToApply(link, url, info);
        $_f8g4i8xwjcun41s0.setAll(link, attrs);
        text.each(function (newText) {
          $_r9eom11qjcun42ah.set(link, newText);
        });
      });
    });
  };
  var query = function (editor) {
    var start = $_adhjdxwtjcun41nq.fromDom(editor.selection.getStart());
    return $_akwq9fzmjcun41z4.closest(start, 'a');
  };
  var $_4gragx11pjcun42a7 = {
    getInfo: getInfo,
    applyInfo: applyInfo,
    query: query
  };

  var events$6 = function (name, eventHandlers) {
    var events = $_d87qm6w6jcun41lv.derive(eventHandlers);
    return $_bv6ofew4jcun41l1.create({
      fields: [$_84yedrx2jcun41om.strict('enabled')],
      name: name,
      active: { events: $_b4h1biwbjcun41ml.constant(events) }
    });
  };
  var config = function (name, eventHandlers) {
    var me = events$6(name, eventHandlers);
    return {
      key: name,
      value: {
        config: {},
        me: me,
        configAsRaw: $_b4h1biwbjcun41ml.constant({}),
        initialConfig: {},
        state: $_bv6ofew4jcun41l1.noState()
      }
    };
  };
  var $_fl8lpl11sjcun42ay = {
    events: events$6,
    config: config
  };

  var getCurrent = function (component, composeConfig, composeState) {
    return composeConfig.find()(component);
  };
  var $_4fxrvz11ujcun42b9 = { getCurrent: getCurrent };

  var ComposeSchema = [$_84yedrx2jcun41om.strict('find')];

  var Composing = $_bv6ofew4jcun41l1.create({
    fields: ComposeSchema,
    name: 'composing',
    apis: $_4fxrvz11ujcun42b9
  });

  var factory$1 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_do57nmwyjcun41o6.deepMerge({
        tag: 'div',
        attributes: { role: 'presentation' }
      }, detail.dom()),
      components: detail.components(),
      behaviours: $_g2kwcr10djcun422w.get(detail.containerBehaviours()),
      events: detail.events(),
      domModification: detail.domModification(),
      eventOrder: detail.eventOrder()
    };
  };
  var Container = $_8ozmen10ejcun4231.single({
    name: 'Container',
    factory: factory$1,
    configFields: [
      $_84yedrx2jcun41om.defaulted('components', []),
      $_g2kwcr10djcun422w.field('containerBehaviours', []),
      $_84yedrx2jcun41om.defaulted('events', {}),
      $_84yedrx2jcun41om.defaulted('domModification', {}),
      $_84yedrx2jcun41om.defaulted('eventOrder', {})
    ]
  });

  var factory$2 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: detail.getInitialValue()()
          }
        }),
        Composing.config({ find: $_fseuruwajcun41mi.some })
      ]), $_g2kwcr10djcun422w.get(detail.dataBehaviours())),
      events: $_d87qm6w6jcun41lv.derive([$_d87qm6w6jcun41lv.runOnAttached(function (component, simulatedEvent) {
          me.setValue(component, detail.getInitialValue()());
        })])
    };
  };
  var DataField = $_8ozmen10ejcun4231.single({
    name: 'DataField',
    factory: factory$2,
    configFields: [
      $_84yedrx2jcun41om.strict('uid'),
      $_84yedrx2jcun41om.strict('dom'),
      $_84yedrx2jcun41om.strict('getInitialValue'),
      $_g2kwcr10djcun422w.field('dataBehaviours', [
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
  var $_78m1c5120jcun42bx = {
    set: set$6,
    get: get$9
  };

  var schema$8 = [
    $_84yedrx2jcun41om.option('data'),
    $_84yedrx2jcun41om.defaulted('inputAttributes', {}),
    $_84yedrx2jcun41om.defaulted('inputStyles', {}),
    $_84yedrx2jcun41om.defaulted('type', 'input'),
    $_84yedrx2jcun41om.defaulted('tag', 'input'),
    $_84yedrx2jcun41om.defaulted('inputClasses', []),
    $_f570ayytjcun41vk.onHandler('onSetValue'),
    $_84yedrx2jcun41om.defaulted('styles', {}),
    $_84yedrx2jcun41om.option('placeholder'),
    $_84yedrx2jcun41om.defaulted('eventOrder', {}),
    $_g2kwcr10djcun422w.field('inputBehaviours', [
      me,
      Focusing
    ]),
    $_84yedrx2jcun41om.defaulted('selectOnFocus', true)
  ];
  var behaviours = function (detail) {
    return $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive([
      me.config({
        store: {
          mode: 'manual',
          initialValue: detail.data().getOr(undefined),
          getValue: function (input) {
            return $_78m1c5120jcun42bx.get(input.element());
          },
          setValue: function (input, data) {
            var current = $_78m1c5120jcun42bx.get(input.element());
            if (current !== data) {
              $_78m1c5120jcun42bx.set(input.element(), data);
            }
          }
        },
        onSetValue: detail.onSetValue()
      }),
      Focusing.config({
        onFocus: detail.selectOnFocus() === false ? $_b4h1biwbjcun41ml.noop : function (component) {
          var input = component.element();
          var value = $_78m1c5120jcun42bx.get(input);
          input.dom().setSelectionRange(0, value.length);
        }
      })
    ]), $_g2kwcr10djcun422w.get(detail.inputBehaviours()));
  };
  var dom$2 = function (detail) {
    return {
      tag: detail.tag(),
      attributes: $_do57nmwyjcun41o6.deepMerge($_dwtfyfx6jcun41po.wrapAll([{
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
  var $_bk4h9111zjcun42bo = {
    schema: $_b4h1biwbjcun41ml.constant(schema$8),
    behaviours: behaviours,
    dom: dom$2
  };

  var factory$3 = function (detail, spec) {
    return {
      uid: detail.uid(),
      dom: $_bk4h9111zjcun42bo.dom(detail),
      components: [],
      behaviours: $_bk4h9111zjcun42bo.behaviours(detail),
      eventOrder: detail.eventOrder()
    };
  };
  var Input = $_8ozmen10ejcun4231.single({
    name: 'Input',
    configFields: $_bk4h9111zjcun42bo.schema(),
    factory: factory$3
  });

  var exhibit$3 = function (base, tabConfig) {
    return $_1tv7mlxkjcun41r6.nu({
      attributes: $_dwtfyfx6jcun41po.wrapAll([{
          key: tabConfig.tabAttr(),
          value: 'true'
        }])
    });
  };
  var $_eqrnw2122jcun42bz = { exhibit: exhibit$3 };

  var TabstopSchema = [$_84yedrx2jcun41om.defaulted('tabAttr', 'data-alloy-tabstop')];

  var Tabstopping = $_bv6ofew4jcun41l1.create({
    fields: TabstopSchema,
    name: 'tabstopping',
    active: $_eqrnw2122jcun42bz
  });

  var clearInputBehaviour = 'input-clearing';
  var field$2 = function (name, placeholder) {
    var inputSpec = $_66j02811ejcun4299.record(Input.sketch({
      placeholder: placeholder,
      onSetValue: function (input, data) {
        $_ebat3swvjcun41nv.emit(input, $_ay8498wxjcun41o3.input());
      },
      inputBehaviours: $_bv6ofew4jcun41l1.derive([
        Composing.config({ find: $_fseuruwajcun41mi.some }),
        Tabstopping.config({}),
        Keying.config({ mode: 'execution' })
      ]),
      selectOnFocus: false
    }));
    var buttonSpec = $_66j02811ejcun4299.record(Button.sketch({
      dom: $_6p4heu10qjcun425t.dom('<button class="${prefix}-input-container-x ${prefix}-icon-cancel-circle ${prefix}-icon"></button>'),
      action: function (button) {
        var input = inputSpec.get(button);
        me.setValue(input, '');
      }
    }));
    return {
      name: name,
      spec: Container.sketch({
        dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-input-container"></div>'),
        components: [
          inputSpec.asSpec(),
          buttonSpec.asSpec()
        ],
        containerBehaviours: $_bv6ofew4jcun41l1.derive([
          Toggling.config({ toggleClass: $_4tdysdz1jcun41wo.resolve('input-container-empty') }),
          Composing.config({
            find: function (comp) {
              return $_fseuruwajcun41mi.some(inputSpec.get(comp));
            }
          }),
          $_fl8lpl11sjcun42ay.config(clearInputBehaviour, [$_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.input(), function (iContainer) {
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
          return $_fseuruwajcun41mi.none();
        }
      })
    };
  };
  var $_isiwh11rjcun42aj = {
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
    return $_bjvqngw9jcun41mb.contains(nativeDisabled, $_cbjvosxxjcun41s5.name(component.element()));
  };
  var nativeIsDisabled = function (component) {
    return $_f8g4i8xwjcun41s0.has(component.element(), 'disabled');
  };
  var nativeDisable = function (component) {
    $_f8g4i8xwjcun41s0.set(component.element(), 'disabled', 'disabled');
  };
  var nativeEnable = function (component) {
    $_f8g4i8xwjcun41s0.remove(component.element(), 'disabled');
  };
  var ariaIsDisabled = function (component) {
    return $_f8g4i8xwjcun41s0.get(component.element(), 'aria-disabled') === 'true';
  };
  var ariaDisable = function (component) {
    $_f8g4i8xwjcun41s0.set(component.element(), 'aria-disabled', 'true');
  };
  var ariaEnable = function (component) {
    $_f8g4i8xwjcun41s0.set(component.element(), 'aria-disabled', 'false');
  };
  var disable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_f0wr0jxujcun41rx.add(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeDisable : ariaDisable;
    f(component);
  };
  var enable = function (component, disableConfig, disableState) {
    disableConfig.disableClass().each(function (disableClass) {
      $_f0wr0jxujcun41rx.remove(component.element(), disableClass);
    });
    var f = hasNative(component) ? nativeEnable : ariaEnable;
    f(component);
  };
  var isDisabled = function (component) {
    return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
  };
  var $_vkyhq127jcun42ct = {
    enable: enable,
    disable: disable,
    isDisabled: isDisabled,
    onLoad: onLoad$5
  };

  var exhibit$4 = function (base, disableConfig, disableState) {
    return $_1tv7mlxkjcun41r6.nu({ classes: disableConfig.disabled() ? disableConfig.disableClass().map($_bjvqngw9jcun41mb.pure).getOr([]) : [] });
  };
  var events$7 = function (disableConfig, disableState) {
    return $_d87qm6w6jcun41lv.derive([
      $_d87qm6w6jcun41lv.abort($_8672kiwwjcun41o0.execute(), function (component, simulatedEvent) {
        return $_vkyhq127jcun42ct.isDisabled(component, disableConfig, disableState);
      }),
      $_fga8psw5jcun41lc.loadEvent(disableConfig, disableState, $_vkyhq127jcun42ct.onLoad)
    ]);
  };
  var $_2vlqqb126jcun42cq = {
    exhibit: exhibit$4,
    events: events$7
  };

  var DisableSchema = [
    $_84yedrx2jcun41om.defaulted('disabled', false),
    $_84yedrx2jcun41om.option('disableClass')
  ];

  var Disabling = $_bv6ofew4jcun41l1.create({
    fields: DisableSchema,
    name: 'disabling',
    active: $_2vlqqb126jcun42cq,
    apis: $_vkyhq127jcun42ct
  });

  var owner$1 = 'form';
  var schema$9 = [$_g2kwcr10djcun422w.field('formBehaviours', [me])];
  var getPartName = function (name) {
    return '<alloy.field.' + name + '>';
  };
  var sketch$8 = function (fSpec) {
    var parts = function () {
      var record = [];
      var field = function (name, config) {
        record.push(name);
        return $_ft7qt810ijcun423t.generateOne(owner$1, getPartName(name), config);
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
    var fieldParts = $_bjvqngw9jcun41mb.map(partNames, function (n) {
      return $_c6iged10kjcun424e.required({
        name: n,
        pname: getPartName(n)
      });
    });
    return $_2ul01z10hjcun423n.composite(owner$1, schema$9, fieldParts, make, spec);
  };
  var make = function (detail, components, spec) {
    return $_do57nmwyjcun41o6.deepMerge({
      'debug.sketcher': { 'Form': spec },
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive([me.config({
          store: {
            mode: 'manual',
            getValue: function (form) {
              var optPs = $_ft7qt810ijcun423t.getAllParts(form, detail);
              return $_fwofm0x0jcun41o8.map(optPs, function (optPThunk, pName) {
                return optPThunk().bind(Composing.getCurrent).map(me.getValue);
              });
            },
            setValue: function (form, values) {
              $_fwofm0x0jcun41o8.each(values, function (newValue, key) {
                $_ft7qt810ijcun423t.getPart(form, detail, key).each(function (wrapper) {
                  Composing.getCurrent(wrapper).each(function (field) {
                    me.setValue(field, newValue);
                  });
                });
              });
            }
          }
        })]), $_g2kwcr10djcun422w.get(detail.formBehaviours())),
      apis: {
        getField: function (form, key) {
          return $_ft7qt810ijcun423t.getPart(form, detail, key).bind(Composing.getCurrent);
        }
      }
    });
  };
  var $_3l40xk129jcun42d8 = {
    getField: $_d2u2o810fjcun423g.makeApi(function (apis, component, key) {
      return apis.getField(component, key);
    }),
    sketch: sketch$8
  };

  var revocable = function (doRevoke) {
    var subject = Cell($_fseuruwajcun41mi.none());
    var revoke = function () {
      subject.get().each(doRevoke);
    };
    var clear = function () {
      revoke();
      subject.set($_fseuruwajcun41mi.none());
    };
    var set = function (s) {
      revoke();
      subject.set($_fseuruwajcun41mi.some(s));
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
    var subject = Cell($_fseuruwajcun41mi.none());
    var revoke = function () {
      subject.get().each(function (s) {
        s.destroy();
      });
    };
    var clear = function () {
      revoke();
      subject.set($_fseuruwajcun41mi.none());
    };
    var set = function (s) {
      revoke();
      subject.set($_fseuruwajcun41mi.some(s));
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
    var subject = Cell($_fseuruwajcun41mi.none());
    var clear = function () {
      subject.set($_fseuruwajcun41mi.none());
    };
    var set = function (s) {
      subject.set($_fseuruwajcun41mi.some(s));
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
  var $_gcub7o12ajcun42de = {
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
  var $_dbbv3a12bjcun42dh = {
    init: init$3,
    move: move,
    complete: complete
  };

  var sketch$7 = function (rawSpec) {
    var navigateEvent = 'navigateEvent';
    var wrapperAdhocEvents = 'serializer-wrapper-events';
    var formAdhocEvents = 'form-events';
    var schema = $_a6j4ohxhjcun41qn.objOf([
      $_84yedrx2jcun41om.strict('fields'),
      $_84yedrx2jcun41om.defaulted('maxFieldIndex', rawSpec.fields.length - 1),
      $_84yedrx2jcun41om.strict('onExecute'),
      $_84yedrx2jcun41om.strict('getInitialValue'),
      $_84yedrx2jcun41om.state('state', function () {
        return {
          dialogSwipeState: $_gcub7o12ajcun42de.value(),
          currentScreen: Cell(0)
        };
      })
    ]);
    var spec = $_a6j4ohxhjcun41qn.asRawOrDie('SerialisedDialog', schema, rawSpec);
    var navigationButton = function (direction, directionName, enabled) {
      return Button.sketch({
        dom: $_6p4heu10qjcun425t.dom('<span class="${prefix}-icon-' + directionName + ' ${prefix}-icon"></span>'),
        action: function (button) {
          $_ebat3swvjcun41nv.emitWith(button, navigateEvent, { direction: direction });
        },
        buttonBehaviours: $_bv6ofew4jcun41l1.derive([Disabling.config({
            disableClass: $_4tdysdz1jcun41wo.resolve('toolbar-navigation-disabled'),
            disabled: !enabled
          })])
      });
    };
    var reposition = function (dialog, message) {
      $_akwq9fzmjcun41z4.descendant(dialog.element(), '.' + $_4tdysdz1jcun41wo.resolve('serialised-dialog-chain')).each(function (parent) {
        $_ebvjd9zsjcun41zr.set(parent, 'left', -spec.state.currentScreen.get() * message.width + 'px');
      });
    };
    var navigate = function (dialog, direction) {
      var screens = $_3299iyzkjcun41yx.descendants(dialog.element(), '.' + $_4tdysdz1jcun41wo.resolve('serialised-dialog-screen'));
      $_akwq9fzmjcun41z4.descendant(dialog.element(), '.' + $_4tdysdz1jcun41wo.resolve('serialised-dialog-chain')).each(function (parent) {
        if (spec.state.currentScreen.get() + direction >= 0 && spec.state.currentScreen.get() + direction < screens.length) {
          $_ebvjd9zsjcun41zr.getRaw(parent, 'left').each(function (left) {
            var currentLeft = parseInt(left, 10);
            var w = $_p9uj117jcun4285.get(screens[0]);
            $_ebvjd9zsjcun41zr.set(parent, 'left', currentLeft - direction * w + 'px');
          });
          spec.state.currentScreen.set(spec.state.currentScreen.get() + direction);
        }
      });
    };
    var focusInput = function (dialog) {
      var inputs = $_3299iyzkjcun41yx.descendants(dialog.element(), 'input');
      var optInput = $_fseuruwajcun41mi.from(inputs[spec.state.currentScreen.get()]);
      optInput.each(function (input) {
        dialog.getSystem().getByDom(input).each(function (inputComp) {
          $_ebat3swvjcun41nv.dispatchFocus(dialog, inputComp.element());
        });
      });
      var dotitems = memDots.get(dialog);
      Highlighting.highlightAt(dotitems, spec.state.currentScreen.get());
    };
    var resetState = function () {
      spec.state.currentScreen.set(0);
      spec.state.dialogSwipeState.clear();
    };
    var memForm = $_66j02811ejcun4299.record($_3l40xk129jcun42d8.sketch(function (parts) {
      return {
        dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-serialised-dialog"></div>'),
        components: [Container.sketch({
            dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-serialised-dialog-chain" style="left: 0px; position: absolute;"></div>'),
            components: $_bjvqngw9jcun41mb.map(spec.fields, function (field, i) {
              return i <= spec.maxFieldIndex ? Container.sketch({
                dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-serialised-dialog-screen"></div>'),
                components: $_bjvqngw9jcun41mb.flatten([
                  [navigationButton(-1, 'previous', i > 0)],
                  [parts.field(field.name, field.spec)],
                  [navigationButton(+1, 'next', i < spec.maxFieldIndex)]
                ])
              }) : parts.field(field.name, field.spec);
            })
          })],
        formBehaviours: $_bv6ofew4jcun41l1.derive([
          $_4ps60kz0jcun41wl.orientation(function (dialog, message) {
            reposition(dialog, message);
          }),
          Keying.config({
            mode: 'special',
            focusIn: function (dialog) {
              focusInput(dialog);
            },
            onTab: function (dialog) {
              navigate(dialog, +1);
              return $_fseuruwajcun41mi.some(true);
            },
            onShiftTab: function (dialog) {
              navigate(dialog, -1);
              return $_fseuruwajcun41mi.some(true);
            }
          }),
          $_fl8lpl11sjcun42ay.config(formAdhocEvents, [
            $_d87qm6w6jcun41lv.runOnAttached(function (dialog, simulatedEvent) {
              resetState();
              var dotitems = memDots.get(dialog);
              Highlighting.highlightFirst(dotitems);
              spec.getInitialValue(dialog).each(function (v) {
                me.setValue(dialog, v);
              });
            }),
            $_d87qm6w6jcun41lv.runOnExecute(spec.onExecute),
            $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.transitionend(), function (dialog, simulatedEvent) {
              if (simulatedEvent.event().raw().propertyName === 'left') {
                focusInput(dialog);
              }
            }),
            $_d87qm6w6jcun41lv.run(navigateEvent, function (dialog, simulatedEvent) {
              var direction = simulatedEvent.event().direction();
              navigate(dialog, direction);
            })
          ])
        ])
      };
    }));
    var memDots = $_66j02811ejcun4299.record({
      dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-dot-container"></div>'),
      behaviours: $_bv6ofew4jcun41l1.derive([Highlighting.config({
          highlightClass: $_4tdysdz1jcun41wo.resolve('dot-active'),
          itemClass: $_4tdysdz1jcun41wo.resolve('dot-item')
        })]),
      components: $_bjvqngw9jcun41mb.bind(spec.fields, function (_f, i) {
        return i <= spec.maxFieldIndex ? [$_6p4heu10qjcun425t.spec('<div class="${prefix}-dot-item ${prefix}-icon-full-dot ${prefix}-icon"></div>')] : [];
      })
    });
    return {
      dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-serializer-wrapper"></div>'),
      components: [
        memForm.asSpec(),
        memDots.asSpec()
      ],
      behaviours: $_bv6ofew4jcun41l1.derive([
        Keying.config({
          mode: 'special',
          focusIn: function (wrapper) {
            var form = memForm.get(wrapper);
            Keying.focusIn(form);
          }
        }),
        $_fl8lpl11sjcun42ay.config(wrapperAdhocEvents, [
          $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.touchstart(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.set($_dbbv3a12bjcun42dh.init(simulatedEvent.event().raw().touches[0].clientX));
          }),
          $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.touchmove(), function (wrapper, simulatedEvent) {
            spec.state.dialogSwipeState.on(function (state) {
              simulatedEvent.event().prevent();
              spec.state.dialogSwipeState.set($_dbbv3a12bjcun42dh.move(state, simulatedEvent.event().raw().touches[0].clientX));
            });
          }),
          $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.touchend(), function (wrapper) {
            spec.state.dialogSwipeState.on(function (state) {
              var dialog = memForm.get(wrapper);
              var direction = -1 * $_dbbv3a12bjcun42dh.complete(state);
              navigate(dialog, direction);
            });
          })
        ])
      ])
    };
  };
  var $_939dmv124jcun42c5 = { sketch: sketch$7 };

  var platform$1 = $_2lzqzhwgjcun41mu.detect();
  var preserve$1 = function (f, editor) {
    var rng = editor.selection.getRng();
    f();
    editor.selection.setRng(rng);
  };
  var forAndroid = function (editor, f) {
    var wrapper = platform$1.os.isAndroid() ? preserve$1 : $_b4h1biwbjcun41ml.apply;
    wrapper(f, editor);
  };
  var $_b0izrx12cjcun42dj = { forAndroid: forAndroid };

  var getGroups = $_9r9hd7whjcun41mw.cached(function (realm, editor) {
    return [{
        label: 'the link group',
        items: [$_939dmv124jcun42c5.sketch({
            fields: [
              $_isiwh11rjcun42aj.field('url', 'Type or paste URL'),
              $_isiwh11rjcun42aj.field('text', 'Link text'),
              $_isiwh11rjcun42aj.field('title', 'Link title'),
              $_isiwh11rjcun42aj.field('target', 'Link target'),
              $_isiwh11rjcun42aj.hidden('link')
            ],
            maxFieldIndex: [
              'url',
              'text',
              'title',
              'target'
            ].length - 1,
            getInitialValue: function () {
              return $_fseuruwajcun41mi.some($_4gragx11pjcun42a7.getInfo(editor));
            },
            onExecute: function (dialog) {
              var info = me.getValue(dialog);
              $_4gragx11pjcun42a7.applyInfo(editor, info);
              realm.restoreToolbar();
              editor.focus();
            }
          })]
      }];
  });
  var sketch$6 = function (realm, editor) {
    return $_62zzquz2jcun41wq.forToolbarStateAction(editor, 'link', 'link', function () {
      var groups = getGroups(realm, editor);
      realm.setContextToolbar(groups);
      $_b0izrx12cjcun42dj.forAndroid(editor, function () {
        realm.focusToolbar();
      });
      $_4gragx11pjcun42a7.query(editor).each(function (link) {
        editor.selection.select(link.dom());
      });
    });
  };
  var $_e4t9jz11ojcun42a0 = { sketch: sketch$6 };

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
    return $_dwtfyfx6jcun41po.readOptFrom(transConfig.routes(), route.start()).map($_b4h1biwbjcun41ml.apply).bind(function (sConfig) {
      return $_dwtfyfx6jcun41po.readOptFrom(sConfig, route.destination()).map($_b4h1biwbjcun41ml.apply);
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
          transition: $_b4h1biwbjcun41ml.constant(t),
          route: $_b4h1biwbjcun41ml.constant(r)
        };
      });
    });
  };
  var disableTransition = function (comp, transConfig, transState) {
    getTransition(comp, transConfig, transState).each(function (routeTransition) {
      var t = routeTransition.transition();
      $_f0wr0jxujcun41rx.remove(comp.element(), t.transitionClass());
      $_f8g4i8xwjcun41s0.remove(comp.element(), transConfig.destinationAttr());
    });
  };
  var getNewRoute = function (comp, transConfig, transState, destination) {
    return {
      start: $_b4h1biwbjcun41ml.constant($_f8g4i8xwjcun41s0.get(comp.element(), transConfig.stateAttr())),
      destination: $_b4h1biwbjcun41ml.constant(destination)
    };
  };
  var getCurrentRoute = function (comp, transConfig, transState) {
    var el = comp.element();
    return $_f8g4i8xwjcun41s0.has(el, transConfig.destinationAttr()) ? $_fseuruwajcun41mi.some({
      start: $_b4h1biwbjcun41ml.constant($_f8g4i8xwjcun41s0.get(comp.element(), transConfig.stateAttr())),
      destination: $_b4h1biwbjcun41ml.constant($_f8g4i8xwjcun41s0.get(comp.element(), transConfig.destinationAttr()))
    }) : $_fseuruwajcun41mi.none();
  };
  var jumpTo = function (comp, transConfig, transState, destination) {
    disableTransition(comp, transConfig, transState);
    if ($_f8g4i8xwjcun41s0.has(comp.element(), transConfig.stateAttr()) && $_f8g4i8xwjcun41s0.get(comp.element(), transConfig.stateAttr()) !== destination)
      transConfig.onFinish()(comp, destination);
    $_f8g4i8xwjcun41s0.set(comp.element(), transConfig.stateAttr(), destination);
  };
  var fasttrack = function (comp, transConfig, transState, destination) {
    if ($_f8g4i8xwjcun41s0.has(comp.element(), transConfig.destinationAttr())) {
      $_f8g4i8xwjcun41s0.set(comp.element(), transConfig.stateAttr(), $_f8g4i8xwjcun41s0.get(comp.element(), transConfig.destinationAttr()));
      $_f8g4i8xwjcun41s0.remove(comp.element(), transConfig.destinationAttr());
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
      $_f0wr0jxujcun41rx.add(comp.element(), t.transitionClass());
      $_f8g4i8xwjcun41s0.set(comp.element(), transConfig.destinationAttr(), destination);
    });
  };
  var getState = function (comp, transConfig, transState) {
    var e = comp.element();
    return $_f8g4i8xwjcun41s0.has(e, transConfig.stateAttr()) ? $_fseuruwajcun41mi.some($_f8g4i8xwjcun41s0.get(e, transConfig.stateAttr())) : $_fseuruwajcun41mi.none();
  };
  var $_bo42k312ijcun42ek = {
    findRoute: findRoute,
    disableTransition: disableTransition,
    getCurrentRoute: getCurrentRoute,
    jumpTo: jumpTo,
    progressTo: progressTo,
    getState: getState
  };

  var events$8 = function (transConfig, transState) {
    return $_d87qm6w6jcun41lv.derive([
      $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        $_bo42k312ijcun42ek.getCurrentRoute(component, transConfig, transState).each(function (route) {
          $_bo42k312ijcun42ek.findRoute(component, transConfig, transState, route).each(function (rInfo) {
            rInfo.transition().each(function (rTransition) {
              if (raw.propertyName === rTransition.property()) {
                $_bo42k312ijcun42ek.jumpTo(component, transConfig, transState, route.destination());
                transConfig.onTransition()(component, route);
              }
            });
          });
        });
      }),
      $_d87qm6w6jcun41lv.runOnAttached(function (comp, se) {
        $_bo42k312ijcun42ek.jumpTo(comp, transConfig, transState, transConfig.initialState());
      })
    ]);
  };
  var $_3ftb1r12hjcun42ei = { events: events$8 };

  var TransitionSchema = [
    $_84yedrx2jcun41om.defaulted('destinationAttr', 'data-transitioning-destination'),
    $_84yedrx2jcun41om.defaulted('stateAttr', 'data-transitioning-state'),
    $_84yedrx2jcun41om.strict('initialState'),
    $_f570ayytjcun41vk.onHandler('onTransition'),
    $_f570ayytjcun41vk.onHandler('onFinish'),
    $_84yedrx2jcun41om.strictOf('routes', $_a6j4ohxhjcun41qn.setOf($_8axt1mx8jcun41pw.value, $_a6j4ohxhjcun41qn.setOf($_8axt1mx8jcun41pw.value, $_a6j4ohxhjcun41qn.objOfOnly([$_84yedrx2jcun41om.optionObjOfOnly('transition', [
        $_84yedrx2jcun41om.strict('property'),
        $_84yedrx2jcun41om.strict('transitionClass')
      ])]))))
  ];

  var createRoutes = function (routes) {
    var r = {};
    $_fwofm0x0jcun41o8.each(routes, function (v, k) {
      var waypoints = k.split('<->');
      r[waypoints[0]] = $_dwtfyfx6jcun41po.wrap(waypoints[1], v);
      r[waypoints[1]] = $_dwtfyfx6jcun41po.wrap(waypoints[0], v);
    });
    return r;
  };
  var createBistate = function (first, second, transitions) {
    return $_dwtfyfx6jcun41po.wrapAll([
      {
        key: first,
        value: $_dwtfyfx6jcun41po.wrap(second, transitions)
      },
      {
        key: second,
        value: $_dwtfyfx6jcun41po.wrap(first, transitions)
      }
    ]);
  };
  var createTristate = function (first, second, third, transitions) {
    return $_dwtfyfx6jcun41po.wrapAll([
      {
        key: first,
        value: $_dwtfyfx6jcun41po.wrapAll([
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
        value: $_dwtfyfx6jcun41po.wrapAll([
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
        value: $_dwtfyfx6jcun41po.wrapAll([
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
  var Transitioning = $_bv6ofew4jcun41l1.create({
    fields: TransitionSchema,
    name: 'transitioning',
    active: $_3ftb1r12hjcun42ei,
    apis: $_bo42k312ijcun42ek,
    extra: {
      createRoutes: createRoutes,
      createBistate: createBistate,
      createTristate: createTristate
    }
  });

  var generateFrom$1 = function (spec, all) {
    var schema = $_bjvqngw9jcun41mb.map(all, function (a) {
      return $_84yedrx2jcun41om.field(a.name(), a.name(), $_3688l1x3jcun41p0.asOption(), $_a6j4ohxhjcun41qn.objOf([
        $_84yedrx2jcun41om.strict('config'),
        $_84yedrx2jcun41om.defaulted('state', $_gfn15dxqjcun41rp)
      ]));
    });
    var validated = $_a6j4ohxhjcun41qn.asStruct('component.behaviours', $_a6j4ohxhjcun41qn.objOf(schema), spec.behaviours).fold(function (errInfo) {
      throw new Error($_a6j4ohxhjcun41qn.formatError(errInfo) + '\nComplete spec:\n' + $_48mdwnxfjcun41qi.stringify(spec, null, 2));
    }, $_b4h1biwbjcun41ml.identity);
    return {
      list: all,
      data: $_fwofm0x0jcun41o8.map(validated, function (blobOptionThunk) {
        var blobOption = blobOptionThunk();
        return $_b4h1biwbjcun41ml.constant(blobOption.map(function (blob) {
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
  var $_farr4p12njcun42g2 = {
    generateFrom: generateFrom$1,
    getBehaviours: getBehaviours$1,
    getData: getData
  };

  var getBehaviours = function (spec) {
    var behaviours = $_dwtfyfx6jcun41po.readOptFrom(spec, 'behaviours').getOr({});
    var keys = $_bjvqngw9jcun41mb.filter($_fwofm0x0jcun41o8.keys(behaviours), function (k) {
      return behaviours[k] !== undefined;
    });
    return $_bjvqngw9jcun41mb.map(keys, function (k) {
      return spec.behaviours[k].me;
    });
  };
  var generateFrom = function (spec, all) {
    return $_farr4p12njcun42g2.generateFrom(spec, all);
  };
  var generate$4 = function (spec) {
    var all = getBehaviours(spec);
    return generateFrom(spec, all);
  };
  var $_8rx32u12mjcun42ft = {
    generate: generate$4,
    generateFrom: generateFrom
  };

  var ComponentApi = $_2nffbjxsjcun41rs.exactly([
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

  var SystemApi = $_2nffbjxsjcun41rs.exactly([
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
        throw new Error('The component must be in a context to send: ' + event + '\n' + $_ljzuzy9jcun41to.element(getComp().element()) + ' is not in context.');
      };
    };
    return SystemApi({
      debugInfo: $_b4h1biwbjcun41ml.constant('fake'),
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
    $_fwofm0x0jcun41o8.each(data, function (detail, key) {
      $_fwofm0x0jcun41o8.each(detail, function (value, indexKey) {
        var chain = $_dwtfyfx6jcun41po.readOr(indexKey, [])(r);
        r[indexKey] = chain.concat([tuple(key, value)]);
      });
    });
    return r;
  };
  var $_83s9rc12sjcun42h4 = { byInnerKey: byInnerKey };

  var behaviourDom = function (name, modification) {
    return {
      name: $_b4h1biwbjcun41ml.constant(name),
      modification: modification
    };
  };
  var concat = function (chain, aspect) {
    var values = $_bjvqngw9jcun41mb.bind(chain, function (c) {
      return c.modification().getOr([]);
    });
    return $_8axt1mx8jcun41pw.value($_dwtfyfx6jcun41po.wrap(aspect, values));
  };
  var onlyOne = function (chain, aspect, order) {
    if (chain.length > 1)
      return $_8axt1mx8jcun41pw.error('Multiple behaviours have tried to change DOM "' + aspect + '". The guilty behaviours are: ' + $_48mdwnxfjcun41qi.stringify($_bjvqngw9jcun41mb.map(chain, function (b) {
        return b.name();
      })) + '. At this stage, this ' + 'is not supported. Future releases might provide strategies for resolving this.');
    else if (chain.length === 0)
      return $_8axt1mx8jcun41pw.value({});
    else
      return $_8axt1mx8jcun41pw.value(chain[0].modification().fold(function () {
        return {};
      }, function (m) {
        return $_dwtfyfx6jcun41po.wrap(aspect, m);
      }));
  };
  var duplicate = function (aspect, k, obj, behaviours) {
    return $_8axt1mx8jcun41pw.error('Mulitple behaviours have tried to change the _' + k + '_ "' + aspect + '"' + '. The guilty behaviours are: ' + $_48mdwnxfjcun41qi.stringify($_bjvqngw9jcun41mb.bind(behaviours, function (b) {
      return b.modification().getOr({})[k] !== undefined ? [b.name()] : [];
    }), null, 2) + '. This is not currently supported.');
  };
  var safeMerge = function (chain, aspect) {
    var y = $_bjvqngw9jcun41mb.foldl(chain, function (acc, c) {
      var obj = c.modification().getOr({});
      return acc.bind(function (accRest) {
        var parts = $_fwofm0x0jcun41o8.mapToArray(obj, function (v, k) {
          return accRest[k] !== undefined ? duplicate(aspect, k, obj, chain) : $_8axt1mx8jcun41pw.value($_dwtfyfx6jcun41po.wrap(k, v));
        });
        return $_dwtfyfx6jcun41po.consolidate(parts, accRest);
      });
    }, $_8axt1mx8jcun41pw.value({}));
    return y.map(function (yValue) {
      return $_dwtfyfx6jcun41po.wrap(aspect, yValue);
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
    var behaviourDoms = $_do57nmwyjcun41o6.deepMerge({}, baseMod);
    $_bjvqngw9jcun41mb.each(behaviours, function (behaviour) {
      behaviourDoms[behaviour.name()] = behaviour.exhibit(info, base);
    });
    var byAspect = $_83s9rc12sjcun42h4.byInnerKey(behaviourDoms, behaviourDom);
    var usedAspect = $_fwofm0x0jcun41o8.map(byAspect, function (values, aspect) {
      return $_bjvqngw9jcun41mb.bind(values, function (value) {
        return value.modification().fold(function () {
          return [];
        }, function (v) {
          return [value];
        });
      });
    });
    var modifications = $_fwofm0x0jcun41o8.mapToArray(usedAspect, function (values, aspect) {
      return $_dwtfyfx6jcun41po.readOptFrom(mergeTypes, aspect).fold(function () {
        return $_8axt1mx8jcun41pw.error('Unknown field type: ' + aspect);
      }, function (merger) {
        return merger(values, aspect);
      });
    });
    var consolidated = $_dwtfyfx6jcun41po.consolidate(modifications, {});
    return consolidated.map($_1tv7mlxkjcun41r6.nu);
  };
  var $_6y9q0i12rjcun42gn = { combine: combine$1 };

  var sortKeys = function (label, keyName, array, order) {
    var sliced = array.slice(0);
    try {
      var sorted = sliced.sort(function (a, b) {
        var aKey = a[keyName]();
        var bKey = b[keyName]();
        var aIndex = order.indexOf(aKey);
        var bIndex = order.indexOf(bKey);
        if (aIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + aKey + '.\nOrder specified: ' + $_48mdwnxfjcun41qi.stringify(order, null, 2));
        if (bIndex === -1)
          throw new Error('The ordering for ' + label + ' does not have an entry for ' + bKey + '.\nOrder specified: ' + $_48mdwnxfjcun41qi.stringify(order, null, 2));
        if (aIndex < bIndex)
          return -1;
        else if (bIndex < aIndex)
          return 1;
        else
          return 0;
      });
      return $_8axt1mx8jcun41pw.value(sorted);
    } catch (err) {
      return $_8axt1mx8jcun41pw.error([err]);
    }
  };
  var $_e493ww12ujcun42hm = { sortKeys: sortKeys };

  var nu$7 = function (handler, purpose) {
    return {
      handler: handler,
      purpose: $_b4h1biwbjcun41ml.constant(purpose)
    };
  };
  var curryArgs = function (descHandler, extraArgs) {
    return {
      handler: $_b4h1biwbjcun41ml.curry.apply(undefined, [descHandler.handler].concat(extraArgs)),
      purpose: descHandler.purpose
    };
  };
  var getHandler = function (descHandler) {
    return descHandler.handler;
  };
  var $_fzrvqg12vjcun42hq = {
    nu: nu$7,
    curryArgs: curryArgs,
    getHandler: getHandler
  };

  var behaviourTuple = function (name, handler) {
    return {
      name: $_b4h1biwbjcun41ml.constant(name),
      handler: $_b4h1biwbjcun41ml.constant(handler)
    };
  };
  var nameToHandlers = function (behaviours, info) {
    var r = {};
    $_bjvqngw9jcun41mb.each(behaviours, function (behaviour) {
      r[behaviour.name()] = behaviour.handlers(info);
    });
    return r;
  };
  var groupByEvents = function (info, behaviours, base) {
    var behaviourEvents = $_do57nmwyjcun41o6.deepMerge(base, nameToHandlers(behaviours, info));
    return $_83s9rc12sjcun42h4.byInnerKey(behaviourEvents, behaviourTuple);
  };
  var combine$2 = function (info, eventOrder, behaviours, base) {
    var byEventName = groupByEvents(info, behaviours, base);
    return combineGroups(byEventName, eventOrder);
  };
  var assemble = function (rawHandler) {
    var handler = $_bf3ojtx1jcun41ob.read(rawHandler);
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
    return new $_8axt1mx8jcun41pw.error(['The event (' + eventName + ') has more than one behaviour that listens to it.\nWhen this occurs, you must ' + 'specify an event ordering for the behaviours in your spec (e.g. [ "listing", "toggling" ]).\nThe behaviours that ' + 'can trigger it are: ' + $_48mdwnxfjcun41qi.stringify($_bjvqngw9jcun41mb.map(tuples, function (c) {
        return c.name();
      }), null, 2)]);
  };
  var fuse$1 = function (tuples, eventOrder, eventName) {
    var order = eventOrder[eventName];
    if (!order)
      return missingOrderError(eventName, tuples);
    else
      return $_e493ww12ujcun42hm.sortKeys('Event: ' + eventName, 'name', tuples, order).map(function (sortedTuples) {
        var handlers = $_bjvqngw9jcun41mb.map(sortedTuples, function (tuple) {
          return tuple.handler();
        });
        return $_bf3ojtx1jcun41ob.fuse(handlers);
      });
  };
  var combineGroups = function (byEventName, eventOrder) {
    var r = $_fwofm0x0jcun41o8.mapToArray(byEventName, function (tuples, eventName) {
      var combined = tuples.length === 1 ? $_8axt1mx8jcun41pw.value(tuples[0].handler()) : fuse$1(tuples, eventOrder, eventName);
      return combined.map(function (handler) {
        var assembled = assemble(handler);
        var purpose = tuples.length > 1 ? $_bjvqngw9jcun41mb.filter(eventOrder, function (o) {
          return $_bjvqngw9jcun41mb.contains(tuples, function (t) {
            return t.name() === o;
          });
        }).join(' > ') : tuples[0].name();
        return $_dwtfyfx6jcun41po.wrap(eventName, $_fzrvqg12vjcun42hq.nu(assembled, purpose));
      });
    });
    return $_dwtfyfx6jcun41po.consolidate(r, {});
  };
  var $_68h72412tjcun42ha = { combine: combine$2 };

  var toInfo = function (spec) {
    return $_a6j4ohxhjcun41qn.asStruct('custom.definition', $_a6j4ohxhjcun41qn.objOfOnly([
      $_84yedrx2jcun41om.field('dom', 'dom', $_3688l1x3jcun41p0.strict(), $_a6j4ohxhjcun41qn.objOfOnly([
        $_84yedrx2jcun41om.strict('tag'),
        $_84yedrx2jcun41om.defaulted('styles', {}),
        $_84yedrx2jcun41om.defaulted('classes', []),
        $_84yedrx2jcun41om.defaulted('attributes', {}),
        $_84yedrx2jcun41om.option('value'),
        $_84yedrx2jcun41om.option('innerHtml')
      ])),
      $_84yedrx2jcun41om.strict('components'),
      $_84yedrx2jcun41om.strict('uid'),
      $_84yedrx2jcun41om.defaulted('events', {}),
      $_84yedrx2jcun41om.defaulted('apis', $_b4h1biwbjcun41ml.constant({})),
      $_84yedrx2jcun41om.field('eventOrder', 'eventOrder', $_3688l1x3jcun41p0.mergeWith({
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
      }), $_a6j4ohxhjcun41qn.anyValue()),
      $_84yedrx2jcun41om.option('domModification'),
      $_f570ayytjcun41vk.snapshot('originalSpec'),
      $_84yedrx2jcun41om.defaulted('debug.sketcher', 'unknown')
    ]), spec);
  };
  var getUid = function (info) {
    return $_dwtfyfx6jcun41po.wrap($_1ehco010njcun425b.idAttr(), info.uid());
  };
  var toDefinition = function (info) {
    var base = {
      tag: info.dom().tag(),
      classes: info.dom().classes(),
      attributes: $_do57nmwyjcun41o6.deepMerge(getUid(info), info.dom().attributes()),
      styles: info.dom().styles(),
      domChildren: $_bjvqngw9jcun41mb.map(info.components(), function (comp) {
        return comp.element();
      })
    };
    return $_fq0viixljcun41rf.nu($_do57nmwyjcun41o6.deepMerge(base, info.dom().innerHtml().map(function (h) {
      return $_dwtfyfx6jcun41po.wrap('innerHtml', h);
    }).getOr({}), info.dom().value().map(function (h) {
      return $_dwtfyfx6jcun41po.wrap('value', h);
    }).getOr({})));
  };
  var toModification = function (info) {
    return info.domModification().fold(function () {
      return $_1tv7mlxkjcun41r6.nu({});
    }, $_1tv7mlxkjcun41r6.nu);
  };
  var toApis = function (info) {
    return info.apis();
  };
  var toEvents = function (info) {
    return info.events();
  };
  var $_8f0cvh12wjcun42ht = {
    toInfo: toInfo,
    toDefinition: toDefinition,
    toModification: toModification,
    toApis: toApis,
    toEvents: toEvents
  };

  var add$3 = function (element, classes) {
    $_bjvqngw9jcun41mb.each(classes, function (x) {
      $_f0wr0jxujcun41rx.add(element, x);
    });
  };
  var remove$6 = function (element, classes) {
    $_bjvqngw9jcun41mb.each(classes, function (x) {
      $_f0wr0jxujcun41rx.remove(element, x);
    });
  };
  var toggle$3 = function (element, classes) {
    $_bjvqngw9jcun41mb.each(classes, function (x) {
      $_f0wr0jxujcun41rx.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return $_bjvqngw9jcun41mb.forall(classes, function (clazz) {
      return $_f0wr0jxujcun41rx.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return $_bjvqngw9jcun41mb.exists(classes, function (clazz) {
      return $_f0wr0jxujcun41rx.has(element, clazz);
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
    return $_9cuprjxyjcun41s6.supports(element) ? getNative(element) : $_9cuprjxyjcun41s6.get(element);
  };
  var $_mwd8r12yjcun42ic = {
    add: add$3,
    remove: remove$6,
    toggle: toggle$3,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$10
  };

  var getChildren = function (definition) {
    if (definition.domChildren().isSome() && definition.defChildren().isSome()) {
      throw new Error('Cannot specify children and child specs! Must be one or the other.\nDef: ' + $_fq0viixljcun41rf.defToStr(definition));
    } else {
      return definition.domChildren().fold(function () {
        var defChildren = definition.defChildren().getOr([]);
        return $_bjvqngw9jcun41mb.map(defChildren, renderDef);
      }, function (domChildren) {
        return domChildren;
      });
    }
  };
  var renderToDom = function (definition) {
    var subject = $_adhjdxwtjcun41nq.fromTag(definition.tag());
    $_f8g4i8xwjcun41s0.setAll(subject, definition.attributes().getOr({}));
    $_mwd8r12yjcun42ic.add(subject, definition.classes().getOr([]));
    $_ebvjd9zsjcun41zr.setAll(subject, definition.styles().getOr({}));
    $_613m7lybjcun41tt.set(subject, definition.innerHtml().getOr(''));
    var children = getChildren(definition);
    $_1nu7q3y6jcun41t6.append(subject, children);
    definition.value().each(function (value) {
      $_78m1c5120jcun42bx.set(subject, value);
    });
    return subject;
  };
  var renderDef = function (spec) {
    var definition = $_fq0viixljcun41rf.nu(spec);
    return renderToDom(definition);
  };
  var $_ou6sj12xjcun42i3 = { renderToDom: renderToDom };

  var build$1 = function (spec) {
    var getMe = function () {
      return me;
    };
    var systemApi = Cell(NoContextApi(getMe));
    var info = $_a6j4ohxhjcun41qn.getOrDie($_8f0cvh12wjcun42ht.toInfo($_do57nmwyjcun41o6.deepMerge(spec, { behaviours: undefined })));
    var bBlob = $_8rx32u12mjcun42ft.generate(spec);
    var bList = $_farr4p12njcun42g2.getBehaviours(bBlob);
    var bData = $_farr4p12njcun42g2.getData(bBlob);
    var definition = $_8f0cvh12wjcun42ht.toDefinition(info);
    var baseModification = { 'alloy.base.modification': $_8f0cvh12wjcun42ht.toModification(info) };
    var modification = $_6y9q0i12rjcun42gn.combine(bData, baseModification, bList, definition).getOrDie();
    var modDefinition = $_1tv7mlxkjcun41r6.merge(definition, modification);
    var item = $_ou6sj12xjcun42i3.renderToDom(modDefinition);
    var baseEvents = { 'alloy.base.behaviour': $_8f0cvh12wjcun42ht.toEvents(info) };
    var events = $_68h72412tjcun42ha.combine(bData, info.eventOrder(), bList, baseEvents).getOrDie();
    var subcomponents = Cell(info.components());
    var connect = function (newApi) {
      systemApi.set(newApi);
    };
    var disconnect = function () {
      systemApi.set(NoContextApi(getMe));
    };
    var syncComponents = function () {
      var children = $_df5x8oy3jcun41sv.children(item);
      var subs = $_bjvqngw9jcun41mb.bind(children, function (child) {
        return systemApi.get().getByDom(child).fold(function () {
          return [];
        }, function (c) {
          return [c];
        });
      });
      subcomponents.set(subs);
    };
    var config = function (behaviour) {
      if (behaviour === $_d2u2o810fjcun423g.apiConfig())
        return info.apis();
      var b = bData;
      var f = $_bqe5v5wzjcun41o7.isFunction(b[behaviour.name()]) ? b[behaviour.name()] : function () {
        throw new Error('Could not find ' + behaviour.name() + ' in ' + $_48mdwnxfjcun41qi.stringify(spec, null, 2));
      };
      return f();
    };
    var hasConfigured = function (behaviour) {
      return $_bqe5v5wzjcun41o7.isFunction(bData[behaviour.name()]);
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
      spec: $_b4h1biwbjcun41ml.constant(spec),
      readState: readState,
      connect: connect,
      disconnect: disconnect,
      element: $_b4h1biwbjcun41ml.constant(item),
      syncComponents: syncComponents,
      components: subcomponents.get,
      events: $_b4h1biwbjcun41ml.constant(events)
    });
    return me;
  };
  var $_5joh8c12ljcun42fi = { build: build$1 };

  var isRecursive = function (component, originator, target) {
    return $_6hi5odw8jcun41m3.eq(originator, component.element()) && !$_6hi5odw8jcun41m3.eq(originator, target);
  };
  var $_4frxdu12zjcun42ii = {
    events: $_d87qm6w6jcun41lv.derive([$_d87qm6w6jcun41lv.can($_8672kiwwjcun41o0.focus(), function (component, simulatedEvent) {
        var originator = simulatedEvent.event().originator();
        var target = simulatedEvent.event().target();
        if (isRecursive(component, originator, target)) {
          console.warn($_8672kiwwjcun41o0.focus() + ' did not get interpreted by the desired target. ' + '\nOriginator: ' + $_ljzuzy9jcun41to.element(originator) + '\nTarget: ' + $_ljzuzy9jcun41to.element(target) + '\nCheck the ' + $_8672kiwwjcun41o0.focus() + ' event handlers');
          return false;
        } else {
          return true;
        }
      })])
  };

  var make$1 = function (spec) {
    return spec;
  };
  var $_diaxzh130jcun42il = { make: make$1 };

  var buildSubcomponents = function (spec) {
    var components = $_dwtfyfx6jcun41po.readOr('components', [])(spec);
    return $_bjvqngw9jcun41mb.map(components, build);
  };
  var buildFromSpec = function (userSpec) {
    var spec = $_diaxzh130jcun42il.make(userSpec);
    var components = buildSubcomponents(spec);
    var completeSpec = $_do57nmwyjcun41o6.deepMerge($_4frxdu12zjcun42ii, spec, $_dwtfyfx6jcun41po.wrap('components', components));
    return $_8axt1mx8jcun41pw.value($_5joh8c12ljcun42fi.build(completeSpec));
  };
  var text = function (textContent) {
    var element = $_adhjdxwtjcun41nq.fromText(textContent);
    return external({ element: element });
  };
  var external = function (spec) {
    var extSpec = $_a6j4ohxhjcun41qn.asStructOrDie('external.component', $_a6j4ohxhjcun41qn.objOfOnly([
      $_84yedrx2jcun41om.strict('element'),
      $_84yedrx2jcun41om.option('uid')
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
      $_37h05n10mjcun424y.writeOnly(extSpec.element(), uid);
    });
    var me = ComponentApi({
      getSystem: systemApi.get,
      config: $_fseuruwajcun41mi.none,
      hasConfigured: $_b4h1biwbjcun41ml.constant(false),
      connect: connect,
      disconnect: disconnect,
      element: $_b4h1biwbjcun41ml.constant(extSpec.element()),
      spec: $_b4h1biwbjcun41ml.constant(spec),
      readState: $_b4h1biwbjcun41ml.constant('No state'),
      syncComponents: $_b4h1biwbjcun41ml.noop,
      components: $_b4h1biwbjcun41ml.constant([]),
      events: $_b4h1biwbjcun41ml.constant({})
    });
    return $_d2u2o810fjcun423g.premade(me);
  };
  var build = function (rawUserSpec) {
    return $_d2u2o810fjcun423g.getPremade(rawUserSpec).fold(function () {
      var userSpecWithUid = $_do57nmwyjcun41o6.deepMerge({ uid: $_37h05n10mjcun424y.generate('') }, rawUserSpec);
      return buildFromSpec(userSpecWithUid).getOrDie();
    }, function (prebuilt) {
      return prebuilt;
    });
  };
  var $_5njsek12kjcun42f5 = {
    build: build,
    premade: $_d2u2o810fjcun423g.premade,
    external: external,
    text: text
  };

  var hoverEvent = 'alloy.item-hover';
  var focusEvent = 'alloy.item-focus';
  var onHover = function (item) {
    if ($_5qyty2ygjcun41u1.search(item.element()).isNone() || Focusing.isFocused(item)) {
      if (!Focusing.isFocused(item))
        Focusing.focus(item);
      $_ebat3swvjcun41nv.emitWith(item, hoverEvent, { item: item });
    }
  };
  var onFocus = function (item) {
    $_ebat3swvjcun41nv.emitWith(item, focusEvent, { item: item });
  };
  var $_2yv5v1134jcun42j6 = {
    hover: $_b4h1biwbjcun41ml.constant(hoverEvent),
    focus: $_b4h1biwbjcun41ml.constant(focusEvent),
    onHover: onHover,
    onFocus: onFocus
  };

  var builder = function (info) {
    return {
      dom: $_do57nmwyjcun41o6.deepMerge(info.dom(), { attributes: { role: info.toggling().isSome() ? 'menuitemcheckbox' : 'menuitem' } }),
      behaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive([
        info.toggling().fold(Toggling.revoke, function (tConfig) {
          return Toggling.config($_do57nmwyjcun41o6.deepMerge({ aria: { mode: 'checked' } }, tConfig));
        }),
        Focusing.config({
          ignore: info.ignoreFocus(),
          onFocus: function (component) {
            $_2yv5v1134jcun42j6.onFocus(component);
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
      events: $_d87qm6w6jcun41lv.derive([
        $_d87qm6w6jcun41lv.runWithTarget($_8672kiwwjcun41o0.tapOrClick(), $_ebat3swvjcun41nv.emitExecute),
        $_d87qm6w6jcun41lv.cutter($_ay8498wxjcun41o3.mousedown()),
        $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.mouseover(), $_2yv5v1134jcun42j6.onHover),
        $_d87qm6w6jcun41lv.run($_8672kiwwjcun41o0.focusItem(), Focusing.focus)
      ]),
      components: info.components(),
      domModification: info.domModification()
    };
  };
  var schema$11 = [
    $_84yedrx2jcun41om.strict('data'),
    $_84yedrx2jcun41om.strict('components'),
    $_84yedrx2jcun41om.strict('dom'),
    $_84yedrx2jcun41om.option('toggling'),
    $_84yedrx2jcun41om.defaulted('itemBehaviours', {}),
    $_84yedrx2jcun41om.defaulted('ignoreFocus', false),
    $_84yedrx2jcun41om.defaulted('domModification', {}),
    $_f570ayytjcun41vk.output('builder', builder)
  ];

  var builder$1 = function (detail) {
    return {
      dom: detail.dom(),
      components: detail.components(),
      events: $_d87qm6w6jcun41lv.derive([$_d87qm6w6jcun41lv.stopper($_8672kiwwjcun41o0.focusItem())])
    };
  };
  var schema$12 = [
    $_84yedrx2jcun41om.strict('dom'),
    $_84yedrx2jcun41om.strict('components'),
    $_f570ayytjcun41vk.output('builder', builder$1)
  ];

  var owner$2 = 'item-widget';
  var partTypes = [$_c6iged10kjcun424e.required({
      name: 'widget',
      overrides: function (detail) {
        return {
          behaviours: $_bv6ofew4jcun41l1.derive([me.config({
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
  var $_eigxrd137jcun42jk = {
    owner: $_b4h1biwbjcun41ml.constant(owner$2),
    parts: $_b4h1biwbjcun41ml.constant(partTypes)
  };

  var builder$2 = function (info) {
    var subs = $_ft7qt810ijcun423t.substitutes($_eigxrd137jcun42jk.owner(), info, $_eigxrd137jcun42jk.parts());
    var components = $_ft7qt810ijcun423t.components($_eigxrd137jcun42jk.owner(), info, subs.internals());
    var focusWidget = function (component) {
      return $_ft7qt810ijcun423t.getPart(component, info, 'widget').map(function (widget) {
        Keying.focusIn(widget);
        return widget;
      });
    };
    var onHorizontalArrow = function (component, simulatedEvent) {
      return $_tci11zxjcun420c.inside(simulatedEvent.event().target()) ? $_fseuruwajcun41mi.none() : function () {
        if (info.autofocus()) {
          simulatedEvent.setSource(component.element());
          return $_fseuruwajcun41mi.none();
        } else {
          return $_fseuruwajcun41mi.none();
        }
      }();
    };
    return $_do57nmwyjcun41o6.deepMerge({
      dom: info.dom(),
      components: components,
      domModification: info.domModification(),
      events: $_d87qm6w6jcun41lv.derive([
        $_d87qm6w6jcun41lv.runOnExecute(function (component, simulatedEvent) {
          focusWidget(component).each(function (widget) {
            simulatedEvent.stop();
          });
        }),
        $_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.mouseover(), $_2yv5v1134jcun42j6.onHover),
        $_d87qm6w6jcun41lv.run($_8672kiwwjcun41o0.focusItem(), function (component, simulatedEvent) {
          if (info.autofocus())
            focusWidget(component);
          else
            Focusing.focus(component);
        })
      ]),
      behaviours: $_bv6ofew4jcun41l1.derive([
        me.config({
          store: {
            mode: 'memory',
            initialValue: info.data()
          }
        }),
        Focusing.config({
          onFocus: function (component) {
            $_2yv5v1134jcun42j6.onFocus(component);
          }
        }),
        Keying.config({
          mode: 'special',
          onLeft: onHorizontalArrow,
          onRight: onHorizontalArrow,
          onEscape: function (component, simulatedEvent) {
            if (!Focusing.isFocused(component) && !info.autofocus()) {
              Focusing.focus(component);
              return $_fseuruwajcun41mi.some(true);
            } else if (info.autofocus()) {
              simulatedEvent.setSource(component.element());
              return $_fseuruwajcun41mi.none();
            } else {
              return $_fseuruwajcun41mi.none();
            }
          }
        })
      ])
    });
  };
  var schema$13 = [
    $_84yedrx2jcun41om.strict('uid'),
    $_84yedrx2jcun41om.strict('data'),
    $_84yedrx2jcun41om.strict('components'),
    $_84yedrx2jcun41om.strict('dom'),
    $_84yedrx2jcun41om.defaulted('autofocus', false),
    $_84yedrx2jcun41om.defaulted('domModification', {}),
    $_ft7qt810ijcun423t.defaultUidsSchema($_eigxrd137jcun42jk.parts()),
    $_f570ayytjcun41vk.output('builder', builder$2)
  ];

  var itemSchema$1 = $_a6j4ohxhjcun41qn.choose('type', {
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
  var parts = [$_c6iged10kjcun424e.group({
      factory: {
        sketch: function (spec) {
          var itemInfo = $_a6j4ohxhjcun41qn.asStructOrDie('menu.spec item', itemSchema$1, spec);
          return itemInfo.builder()(itemInfo);
        }
      },
      name: 'items',
      unit: 'item',
      defaults: function (detail, u) {
        var fallbackUid = $_37h05n10mjcun424y.generate('');
        return $_do57nmwyjcun41o6.deepMerge({ uid: fallbackUid }, u);
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
    $_84yedrx2jcun41om.strict('value'),
    $_84yedrx2jcun41om.strict('items'),
    $_84yedrx2jcun41om.strict('dom'),
    $_84yedrx2jcun41om.strict('components'),
    $_84yedrx2jcun41om.defaulted('eventOrder', {}),
    $_g2kwcr10djcun422w.field('menuBehaviours', [
      Highlighting,
      me,
      Composing,
      Keying
    ]),
    $_84yedrx2jcun41om.defaultedOf('movement', {
      mode: 'menu',
      moveOnTab: true
    }, $_a6j4ohxhjcun41qn.choose('mode', {
      grid: [
        $_f570ayytjcun41vk.initSize(),
        $_f570ayytjcun41vk.output('config', configureGrid)
      ],
      menu: [
        $_84yedrx2jcun41om.defaulted('moveOnTab', true),
        $_f570ayytjcun41vk.output('config', configureMenu)
      ]
    })),
    $_f570ayytjcun41vk.itemMarkers(),
    $_84yedrx2jcun41om.defaulted('fakeFocus', false),
    $_84yedrx2jcun41om.defaulted('focusManager', $_8bwjp5zgjcun41yd.dom()),
    $_f570ayytjcun41vk.onHandler('onHighlight')
  ];
  var $_26rprs132jcun42ip = {
    name: $_b4h1biwbjcun41ml.constant('Menu'),
    schema: $_b4h1biwbjcun41ml.constant(schema$10),
    parts: $_b4h1biwbjcun41ml.constant(parts)
  };

  var focusEvent$1 = 'alloy.menu-focus';
  var $_bg3m8q139jcun42ju = { focus: $_b4h1biwbjcun41ml.constant(focusEvent$1) };

  var make$2 = function (detail, components, spec, externals) {
    return $_do57nmwyjcun41o6.deepMerge({
      dom: $_do57nmwyjcun41o6.deepMerge(detail.dom(), { attributes: { role: 'menu' } }),
      uid: detail.uid(),
      behaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive([
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
        Composing.config({ find: $_b4h1biwbjcun41ml.identity }),
        Keying.config(detail.movement().config()(detail, detail.movement()))
      ]), $_g2kwcr10djcun422w.get(detail.menuBehaviours())),
      events: $_d87qm6w6jcun41lv.derive([
        $_d87qm6w6jcun41lv.run($_2yv5v1134jcun42j6.focus(), function (menu, simulatedEvent) {
          var event = simulatedEvent.event();
          menu.getSystem().getByDom(event.target()).each(function (item) {
            Highlighting.highlight(menu, item);
            simulatedEvent.stop();
            $_ebat3swvjcun41nv.emitWith(menu, $_bg3m8q139jcun42ju.focus(), {
              menu: menu,
              item: item
            });
          });
        }),
        $_d87qm6w6jcun41lv.run($_2yv5v1134jcun42j6.hover(), function (menu, simulatedEvent) {
          var item = simulatedEvent.event().item();
          Highlighting.highlight(menu, item);
        })
      ]),
      components: components,
      eventOrder: detail.eventOrder()
    });
  };
  var $_amxfcg138jcun42jo = { make: make$2 };

  var Menu = $_8ozmen10ejcun4231.composite({
    name: 'Menu',
    configFields: $_26rprs132jcun42ip.schema(),
    partFields: $_26rprs132jcun42ip.parts(),
    factory: $_amxfcg138jcun42jo.make
  });

  var preserve$2 = function (f, container) {
    var ownerDoc = $_df5x8oy3jcun41sv.owner(container);
    var refocus = $_5qyty2ygjcun41u1.active(ownerDoc).bind(function (focused) {
      var hasFocus = function (elem) {
        return $_6hi5odw8jcun41m3.eq(focused, elem);
      };
      return hasFocus(container) ? $_fseuruwajcun41mi.some(container) : $_2nwazgyijcun41u8.descendant(container, hasFocus);
    });
    var result = f(container);
    refocus.each(function (oldFocus) {
      $_5qyty2ygjcun41u1.active(ownerDoc).filter(function (newFocus) {
        return $_6hi5odw8jcun41m3.eq(newFocus, oldFocus);
      }).orThunk(function () {
        $_5qyty2ygjcun41u1.focus(oldFocus);
      });
    });
    return result;
  };
  var $_bsg8qu13djcun42kc = { preserve: preserve$2 };

  var set$7 = function (component, replaceConfig, replaceState, data) {
    $_f4d1ray1jcun41se.detachChildren(component);
    $_bsg8qu13djcun42kc.preserve(function () {
      var children = $_bjvqngw9jcun41mb.map(data, component.getSystem().build);
      $_bjvqngw9jcun41mb.each(children, function (l) {
        $_f4d1ray1jcun41se.attach(component, l);
      });
    }, component.element());
  };
  var insert = function (component, replaceConfig, insertion, childSpec) {
    var child = component.getSystem().build(childSpec);
    $_f4d1ray1jcun41se.attachWith(component, child, insertion);
  };
  var append$2 = function (component, replaceConfig, replaceState, appendee) {
    insert(component, replaceConfig, $_4hb7l2y2jcun41sm.append, appendee);
  };
  var prepend$2 = function (component, replaceConfig, replaceState, prependee) {
    insert(component, replaceConfig, $_4hb7l2y2jcun41sm.prepend, prependee);
  };
  var remove$7 = function (component, replaceConfig, replaceState, removee) {
    var children = contents(component, replaceConfig);
    var foundChild = $_bjvqngw9jcun41mb.find(children, function (child) {
      return $_6hi5odw8jcun41m3.eq(removee.element(), child.element());
    });
    foundChild.each($_f4d1ray1jcun41se.detach);
  };
  var contents = function (component, replaceConfig) {
    return component.components();
  };
  var $_8sstyf13cjcun42k3 = {
    append: append$2,
    prepend: prepend$2,
    remove: remove$7,
    set: set$7,
    contents: contents
  };

  var Replacing = $_bv6ofew4jcun41l1.create({
    fields: [],
    name: 'replacing',
    apis: $_8sstyf13cjcun42k3
  });

  var transpose = function (obj) {
    return $_fwofm0x0jcun41o8.tupleMap(obj, function (v, k) {
      return {
        k: v,
        v: k
      };
    });
  };
  var trace = function (items, byItem, byMenu, finish) {
    return $_dwtfyfx6jcun41po.readOptFrom(byMenu, finish).bind(function (triggerItem) {
      return $_dwtfyfx6jcun41po.readOptFrom(items, triggerItem).bind(function (triggerMenu) {
        var rest = trace(items, byItem, byMenu, triggerMenu);
        return $_fseuruwajcun41mi.some([triggerMenu].concat(rest));
      });
    }).getOr([]);
  };
  var generate$5 = function (menus, expansions) {
    var items = {};
    $_fwofm0x0jcun41o8.each(menus, function (menuItems, menu) {
      $_bjvqngw9jcun41mb.each(menuItems, function (item) {
        items[item] = menu;
      });
    });
    var byItem = expansions;
    var byMenu = transpose(expansions);
    var menuPaths = $_fwofm0x0jcun41o8.map(byMenu, function (triggerItem, submenu) {
      return [submenu].concat(trace(items, byItem, byMenu, submenu));
    });
    return $_fwofm0x0jcun41o8.map(items, function (path) {
      return $_dwtfyfx6jcun41po.readOptFrom(menuPaths, path).getOr([path]);
    });
  };
  var $_6txbry13gjcun42lg = { generate: generate$5 };

  var LayeredState = function () {
    var expansions = Cell({});
    var menus = Cell({});
    var paths = Cell({});
    var primary = Cell($_fseuruwajcun41mi.none());
    var toItemValues = Cell($_b4h1biwbjcun41ml.constant([]));
    var clear = function () {
      expansions.set({});
      menus.set({});
      paths.set({});
      primary.set($_fseuruwajcun41mi.none());
    };
    var isClear = function () {
      return primary.get().isNone();
    };
    var setContents = function (sPrimary, sMenus, sExpansions, sToItemValues) {
      primary.set($_fseuruwajcun41mi.some(sPrimary));
      expansions.set(sExpansions);
      menus.set(sMenus);
      toItemValues.set(sToItemValues);
      var menuValues = sToItemValues(sMenus);
      var sPaths = $_6txbry13gjcun42lg.generate(menuValues, sExpansions);
      paths.set(sPaths);
    };
    var expand = function (itemValue) {
      return $_dwtfyfx6jcun41po.readOptFrom(expansions.get(), itemValue).map(function (menu) {
        var current = $_dwtfyfx6jcun41po.readOptFrom(paths.get(), itemValue).getOr([]);
        return [menu].concat(current);
      });
    };
    var collapse = function (itemValue) {
      return $_dwtfyfx6jcun41po.readOptFrom(paths.get(), itemValue).bind(function (path) {
        return path.length > 1 ? $_fseuruwajcun41mi.some(path.slice(1)) : $_fseuruwajcun41mi.none();
      });
    };
    var refresh = function (itemValue) {
      return $_dwtfyfx6jcun41po.readOptFrom(paths.get(), itemValue);
    };
    var lookupMenu = function (menuValue) {
      return $_dwtfyfx6jcun41po.readOptFrom(menus.get(), menuValue);
    };
    var otherMenus = function (path) {
      var menuValues = toItemValues.get()(menus.get());
      return $_bjvqngw9jcun41mb.difference($_fwofm0x0jcun41o8.keys(menuValues), path);
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
      return $_fwofm0x0jcun41o8.map(menus, function (spec, name) {
        var data = Menu.sketch($_do57nmwyjcun41o6.deepMerge(spec, {
          value: name,
          items: spec.items,
          markers: $_dwtfyfx6jcun41po.narrow(rawUiSpec.markers, [
            'item',
            'selectedItem'
          ]),
          fakeFocus: detail.fakeFocus(),
          onHighlight: detail.onHighlight(),
          focusManager: detail.fakeFocus() ? $_8bwjp5zgjcun41yd.highlights() : $_8bwjp5zgjcun41yd.dom()
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
      return $_fwofm0x0jcun41o8.map(detail.data().menus(), function (data, menuName) {
        return $_bjvqngw9jcun41mb.bind(data.items, function (item) {
          return item.type === 'separator' ? [] : [item.data.value];
        });
      });
    };
    var setActiveMenu = function (container, menu) {
      Highlighting.highlight(container, menu);
      Highlighting.getHighlighted(menu).orThunk(function () {
        return Highlighting.getFirst(menu);
      }).each(function (item) {
        $_ebat3swvjcun41nv.dispatch(container, item.element(), $_8672kiwwjcun41o0.focusItem());
      });
    };
    var getMenus = function (state, menuValues) {
      return $_2kprlnyejcun41ty.cat($_bjvqngw9jcun41mb.map(menuValues, state.lookupMenu));
    };
    var updateMenuPath = function (container, state, path) {
      return $_fseuruwajcun41mi.from(path[0]).bind(state.lookupMenu).map(function (activeMenu) {
        var rest = getMenus(state, path.slice(1));
        $_bjvqngw9jcun41mb.each(rest, function (r) {
          $_f0wr0jxujcun41rx.add(r.element(), detail.markers().backgroundMenu());
        });
        if (!$_9kacxy7jcun41ta.inBody(activeMenu.element())) {
          Replacing.append(container, $_5njsek12kjcun42f5.premade(activeMenu));
        }
        $_mwd8r12yjcun42ic.remove(activeMenu.element(), [detail.markers().backgroundMenu()]);
        setActiveMenu(container, activeMenu);
        var others = getMenus(state, state.otherMenus(path));
        $_bjvqngw9jcun41mb.each(others, function (o) {
          $_mwd8r12yjcun42ic.remove(o.element(), [detail.markers().backgroundMenu()]);
          if (!detail.stayInDom())
            Replacing.remove(container, o);
        });
        return activeMenu;
      });
    };
    var expandRight = function (container, item) {
      var value = getItemValue(item);
      return state.expand(value).bind(function (path) {
        $_fseuruwajcun41mi.from(path[0]).bind(state.lookupMenu).each(function (activeMenu) {
          if (!$_9kacxy7jcun41ta.inBody(activeMenu.element())) {
            Replacing.append(container, $_5njsek12kjcun42f5.premade(activeMenu));
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
      return $_tci11zxjcun420c.inside(item.element()) ? $_fseuruwajcun41mi.none() : expandRight(container, item);
    };
    var onLeft = function (container, item) {
      return $_tci11zxjcun420c.inside(item.element()) ? $_fseuruwajcun41mi.none() : collapseLeft(container, item);
    };
    var onEscape = function (container, item) {
      return collapseLeft(container, item).orThunk(function () {
        return detail.onEscape()(container, item);
      });
    };
    var keyOnItem = function (f) {
      return function (container, simulatedEvent) {
        return $_akwq9fzmjcun41z4.closest(simulatedEvent.getSource(), '.' + detail.markers().item()).bind(function (target) {
          return container.getSystem().getByDom(target).bind(function (item) {
            return f(container, item);
          });
        });
      };
    };
    var events = $_d87qm6w6jcun41lv.derive([
      $_d87qm6w6jcun41lv.run($_bg3m8q139jcun42ju.focus(), function (sandbox, simulatedEvent) {
        var menu = simulatedEvent.event().menu();
        Highlighting.highlight(sandbox, menu);
      }),
      $_d87qm6w6jcun41lv.runOnExecute(function (sandbox, simulatedEvent) {
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
      $_d87qm6w6jcun41lv.runOnAttached(function (container, simulatedEvent) {
        setup(container).each(function (primary) {
          Replacing.append(container, $_5njsek12kjcun42f5.premade(primary));
          if (detail.openImmediately()) {
            setActiveMenu(container, primary);
            detail.onOpenMenu()(container, primary);
          }
        });
      })
    ].concat(detail.navigateOnHover() ? [$_d87qm6w6jcun41lv.run($_2yv5v1134jcun42j6.hover(), function (sandbox, simulatedEvent) {
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
      behaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive([
        Keying.config({
          mode: 'special',
          onRight: keyOnItem(onRight),
          onLeft: keyOnItem(onLeft),
          onEscape: keyOnItem(onEscape),
          focusIn: function (container, keyInfo) {
            state.getPrimary().each(function (primary) {
              $_ebat3swvjcun41nv.dispatch(container, primary.element(), $_8672kiwwjcun41o0.focusItem());
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
      ]), $_g2kwcr10djcun422w.get(detail.tmenuBehaviours())),
      eventOrder: detail.eventOrder(),
      apis: { collapseMenu: collapseMenuApi },
      events: events
    };
  };
  var $_lv2813ejcun42km = {
    make: make$3,
    collapseItem: $_b4h1biwbjcun41ml.constant('collapse-item')
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
      menus: $_dwtfyfx6jcun41po.wrap(name, menu),
      expansions: {}
    };
  };
  var collapseItem = function (text) {
    return {
      value: $_4u02bb10gjcun423m.generate($_lv2813ejcun42km.collapseItem()),
      text: text
    };
  };
  var TieredMenu = $_8ozmen10ejcun4231.single({
    name: 'TieredMenu',
    configFields: [
      $_f570ayytjcun41vk.onStrictKeyboardHandler('onExecute'),
      $_f570ayytjcun41vk.onStrictKeyboardHandler('onEscape'),
      $_f570ayytjcun41vk.onStrictHandler('onOpenMenu'),
      $_f570ayytjcun41vk.onStrictHandler('onOpenSubmenu'),
      $_f570ayytjcun41vk.onHandler('onCollapseMenu'),
      $_84yedrx2jcun41om.defaulted('openImmediately', true),
      $_84yedrx2jcun41om.strictObjOf('data', [
        $_84yedrx2jcun41om.strict('primary'),
        $_84yedrx2jcun41om.strict('menus'),
        $_84yedrx2jcun41om.strict('expansions')
      ]),
      $_84yedrx2jcun41om.defaulted('fakeFocus', false),
      $_f570ayytjcun41vk.onHandler('onHighlight'),
      $_f570ayytjcun41vk.onHandler('onHover'),
      $_f570ayytjcun41vk.tieredMenuMarkers(),
      $_84yedrx2jcun41om.strict('dom'),
      $_84yedrx2jcun41om.defaulted('navigateOnHover', true),
      $_84yedrx2jcun41om.defaulted('stayInDom', false),
      $_g2kwcr10djcun422w.field('tmenuBehaviours', [
        Keying,
        Highlighting,
        Composing,
        Replacing
      ]),
      $_84yedrx2jcun41om.defaulted('eventOrder', {})
    ],
    apis: {
      collapseMenu: function (apis, tmenu) {
        apis.collapseMenu(tmenu);
      }
    },
    factory: $_lv2813ejcun42km.make,
    extraApis: {
      tieredData: tieredData,
      singleData: singleData,
      collapseItem: collapseItem
    }
  });

  var scrollable = $_4tdysdz1jcun41wo.resolve('scrollable');
  var register$1 = function (element) {
    $_f0wr0jxujcun41rx.add(element, scrollable);
  };
  var deregister = function (element) {
    $_f0wr0jxujcun41rx.remove(element, scrollable);
  };
  var $_8cu4ie13hjcun42lo = {
    register: register$1,
    deregister: deregister,
    scrollable: $_b4h1biwbjcun41ml.constant(scrollable)
  };

  var getValue$4 = function (item) {
    return $_dwtfyfx6jcun41po.readOptFrom(item, 'format').getOr(item.title);
  };
  var convert$1 = function (formats, memMenuThunk) {
    var mainMenu = makeMenu('Styles', [].concat($_bjvqngw9jcun41mb.map(formats.items, function (k) {
      return makeItem(getValue$4(k), k.title, k.isSelected(), k.getPreview(), $_dwtfyfx6jcun41po.hasKey(formats.expansions, getValue$4(k)));
    })), memMenuThunk, false);
    var submenus = $_fwofm0x0jcun41o8.map(formats.menus, function (menuItems, menuName) {
      var items = $_bjvqngw9jcun41mb.map(menuItems, function (item) {
        return makeItem(getValue$4(item), item.title, item.isSelected !== undefined ? item.isSelected() : false, item.getPreview !== undefined ? item.getPreview() : '', $_dwtfyfx6jcun41po.hasKey(formats.expansions, getValue$4(item)));
      });
      return makeMenu(menuName, items, memMenuThunk, true);
    });
    var menus = $_do57nmwyjcun41o6.deepMerge(submenus, $_dwtfyfx6jcun41po.wrap('styles', mainMenu));
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
        classes: isMenu ? [$_4tdysdz1jcun41wo.resolve('styles-item-is-menu')] : []
      },
      toggling: {
        toggleOnExecute: false,
        toggleClass: $_4tdysdz1jcun41wo.resolve('format-matches'),
        selected: selected
      },
      itemBehaviours: $_bv6ofew4jcun41l1.derive(isMenu ? [] : [$_4ps60kz0jcun41wl.format(value, function (comp, status) {
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
            classes: [$_4tdysdz1jcun41wo.resolve('styles-collapser')]
          },
          components: collapsable ? [
            {
              dom: {
                tag: 'span',
                classes: [$_4tdysdz1jcun41wo.resolve('styles-collapse-icon')]
              }
            },
            $_5njsek12kjcun42f5.text(value)
          ] : [$_5njsek12kjcun42f5.text(value)],
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
            classes: [$_4tdysdz1jcun41wo.resolve('styles-menu-items-container')]
          },
          components: [Menu.parts().items({})],
          behaviours: $_bv6ofew4jcun41l1.derive([$_fl8lpl11sjcun42ay.config('adhoc-scrollable-menu', [
              $_d87qm6w6jcun41lv.runOnAttached(function (component, simulatedEvent) {
                $_ebvjd9zsjcun41zr.set(component.element(), 'overflow-y', 'auto');
                $_ebvjd9zsjcun41zr.set(component.element(), '-webkit-overflow-scrolling', 'touch');
                $_8cu4ie13hjcun42lo.register(component.element());
              }),
              $_d87qm6w6jcun41lv.runOnDetached(function (component) {
                $_ebvjd9zsjcun41zr.remove(component.element(), 'overflow-y');
                $_ebvjd9zsjcun41zr.remove(component.element(), '-webkit-overflow-scrolling');
                $_8cu4ie13hjcun42lo.deregister(component.element());
              })
            ])])
        }
      ],
      items: items,
      menuBehaviours: $_bv6ofew4jcun41l1.derive([Transitioning.config({
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
    var memMenu = $_66j02811ejcun4299.record(TieredMenu.sketch({
      dom: {
        tag: 'div',
        classes: [$_4tdysdz1jcun41wo.resolve('styles-menu')]
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
        var w = $_p9uj117jcun4285.get(container.element());
        $_p9uj117jcun4285.set(menu.element(), w);
        Transitioning.jumpTo(menu, 'current');
      },
      onOpenSubmenu: function (container, item, submenu) {
        var w = $_p9uj117jcun4285.get(container.element());
        var menu = $_akwq9fzmjcun41z4.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var menuComp = container.getSystem().getByDom(menu).getOrDie();
        $_p9uj117jcun4285.set(submenu.element(), w);
        Transitioning.progressTo(menuComp, 'before');
        Transitioning.jumpTo(submenu, 'after');
        Transitioning.progressTo(submenu, 'current');
      },
      onCollapseMenu: function (container, item, menu) {
        var submenu = $_akwq9fzmjcun41z4.ancestor(item.element(), '[role="menu"]').getOrDie('hacky');
        var submenuComp = container.getSystem().getByDom(submenu).getOrDie();
        Transitioning.progressTo(submenuComp, 'after');
        Transitioning.progressTo(menu, 'current');
      },
      navigateOnHover: false,
      openImmediately: true,
      data: dataset.tmenu,
      markers: {
        backgroundMenu: $_4tdysdz1jcun41wo.resolve('styles-background-menu'),
        menu: $_4tdysdz1jcun41wo.resolve('styles-menu'),
        selectedMenu: $_4tdysdz1jcun41wo.resolve('styles-selected-menu'),
        item: $_4tdysdz1jcun41wo.resolve('styles-item'),
        selectedItem: $_4tdysdz1jcun41wo.resolve('styles-selected-item')
      }
    }));
    return memMenu.asSpec();
  };
  var $_b70lmv12fjcun42dv = { sketch: sketch$9 };

  var getFromExpandingItem = function (item) {
    var newItem = $_do57nmwyjcun41o6.deepMerge($_dwtfyfx6jcun41po.exclude(item, ['items']), { menu: true });
    var rest = expand(item.items);
    var newMenus = $_do57nmwyjcun41o6.deepMerge(rest.menus, $_dwtfyfx6jcun41po.wrap(item.title, rest.items));
    var newExpansions = $_do57nmwyjcun41o6.deepMerge(rest.expansions, $_dwtfyfx6jcun41po.wrap(item.title, item.title));
    return {
      item: newItem,
      menus: newMenus,
      expansions: newExpansions
    };
  };
  var getFromItem = function (item) {
    return $_dwtfyfx6jcun41po.hasKey(item, 'items') ? getFromExpandingItem(item) : {
      item: item,
      menus: {},
      expansions: {}
    };
  };
  var expand = function (items) {
    return $_bjvqngw9jcun41mb.foldr(items, function (acc, item) {
      var newData = getFromItem(item);
      return {
        menus: $_do57nmwyjcun41o6.deepMerge(acc.menus, newData.menus),
        items: [newData.item].concat(acc.items),
        expansions: $_do57nmwyjcun41o6.deepMerge(acc.expansions, newData.expansions)
      };
    }, {
      menus: {},
      expansions: {},
      items: []
    });
  };
  var $_6jtyco13ijcun42lr = { expand: expand };

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
      return $_do57nmwyjcun41o6.deepMerge(item, {
        isSelected: isSelectedFor(item.format),
        getPreview: getPreview(item.format)
      });
    };
    var enrichMenu = function (item) {
      return $_do57nmwyjcun41o6.deepMerge(item, {
        isSelected: $_b4h1biwbjcun41ml.constant(false),
        getPreview: $_b4h1biwbjcun41ml.constant('')
      });
    };
    var enrichCustom = function (item) {
      var formatName = $_4u02bb10gjcun423m.generate(item.title);
      var newItem = $_do57nmwyjcun41o6.deepMerge(item, {
        format: formatName,
        isSelected: isSelectedFor(formatName),
        getPreview: getPreview(formatName)
      });
      editor.formatter.register(formatName, newItem);
      return newItem;
    };
    var formats = $_dwtfyfx6jcun41po.readOptFrom(settings, 'style_formats').getOr(DefaultStyleFormats);
    var doEnrich = function (items) {
      return $_bjvqngw9jcun41mb.map(items, function (item) {
        if ($_dwtfyfx6jcun41po.hasKey(item, 'items')) {
          var newItems = doEnrich(item.items);
          return $_do57nmwyjcun41o6.deepMerge(enrichMenu(item), { items: newItems });
        } else if ($_dwtfyfx6jcun41po.hasKey(item, 'format')) {
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
      return $_bjvqngw9jcun41mb.bind(items, function (item) {
        if (item.items !== undefined) {
          var newItems = doPrune(item.items);
          return newItems.length > 0 ? [item] : [];
        } else {
          var keep = $_dwtfyfx6jcun41po.hasKey(item, 'format') ? editor.formatter.canApply(item.format) : true;
          return keep ? [item] : [];
        }
      });
    };
    var prunedItems = doPrune(formats);
    return $_6jtyco13ijcun42lr.expand(prunedItems);
  };
  var ui = function (editor, formats, onDone) {
    var pruned = prune(editor, formats);
    return $_b70lmv12fjcun42dv.sketch({
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
  var $_72ftdi12djcun42dm = {
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
    return $_bjvqngw9jcun41mb.bind(toolbar, function (item) {
      return $_bqe5v5wzjcun41o7.isArray(item) ? identifyFromArray(item) : extract$1(item);
    });
  };
  var identify = function (settings) {
    var toolbar = settings.toolbar !== undefined ? settings.toolbar : defaults;
    return $_bqe5v5wzjcun41o7.isArray(toolbar) ? identifyFromArray(toolbar) : extract$1(toolbar);
  };
  var setup = function (realm, editor) {
    var commandSketch = function (name) {
      return function () {
        return $_62zzquz2jcun41wq.forToolbarCommand(editor, name);
      };
    };
    var stateCommandSketch = function (name) {
      return function () {
        return $_62zzquz2jcun41wq.forToolbarStateCommand(editor, name);
      };
    };
    var actionSketch = function (name, query, action) {
      return function () {
        return $_62zzquz2jcun41wq.forToolbarStateAction(editor, name, query, action);
      };
    };
    var undo = commandSketch('undo');
    var redo = commandSketch('redo');
    var bold = stateCommandSketch('bold');
    var italic = stateCommandSketch('italic');
    var underline = stateCommandSketch('underline');
    var removeformat = commandSketch('removeformat');
    var link = function () {
      return $_e4t9jz11ojcun42a0.sketch(realm, editor);
    };
    var unlink = actionSketch('unlink', 'link', function () {
      editor.execCommand('unlink', null, false);
    });
    var image = function () {
      return $_bs19yx11djcun428u.sketch(editor);
    };
    var bullist = actionSketch('unordered-list', 'ul', function () {
      editor.execCommand('InsertUnorderedList', null, false);
    });
    var numlist = actionSketch('ordered-list', 'ol', function () {
      editor.execCommand('InsertOrderedList', null, false);
    });
    var fontsizeselect = function () {
      return $_2atjdw119jcun4289.sketch(realm, editor);
    };
    var forecolor = function () {
      return $_g9jbde10sjcun4267.sketch(realm, editor);
    };
    var styleFormats = $_72ftdi12djcun42dm.register(editor, editor.settings);
    var styleFormatsMenu = function () {
      return $_72ftdi12djcun42dm.ui(editor, styleFormats, function () {
        editor.fire('scrollIntoView');
      });
    };
    var styleselect = function () {
      return $_62zzquz2jcun41wq.forToolbar('style-formats', function (button) {
        editor.fire('toReading');
        realm.dropup().appear(styleFormatsMenu, Toggling.on, button);
      }, $_bv6ofew4jcun41l1.derive([
        Toggling.config({
          toggleClass: $_4tdysdz1jcun41wo.resolve('toolbar-button-selected'),
          toggleOnExecute: false,
          aria: { mode: 'pressed' }
        }),
        Receiving.config({
          channels: $_dwtfyfx6jcun41po.wrapAll([
            $_4ps60kz0jcun41wl.receive($_3wqehtyojcun41ul.orientationChanged(), Toggling.off),
            $_4ps60kz0jcun41wl.receive($_3wqehtyojcun41ul.dropupDismissed(), Toggling.off)
          ])
        })
      ]));
    };
    var feature = function (prereq, sketch) {
      return {
        isSupported: function () {
          return prereq.forall(function (p) {
            return $_dwtfyfx6jcun41po.hasKey(editor.buttons, p);
          });
        },
        sketch: sketch
      };
    };
    return {
      undo: feature($_fseuruwajcun41mi.none(), undo),
      redo: feature($_fseuruwajcun41mi.none(), redo),
      bold: feature($_fseuruwajcun41mi.none(), bold),
      italic: feature($_fseuruwajcun41mi.none(), italic),
      underline: feature($_fseuruwajcun41mi.none(), underline),
      removeformat: feature($_fseuruwajcun41mi.none(), removeformat),
      link: feature($_fseuruwajcun41mi.none(), link),
      unlink: feature($_fseuruwajcun41mi.none(), unlink),
      image: feature($_fseuruwajcun41mi.none(), image),
      bullist: feature($_fseuruwajcun41mi.some('bullist'), bullist),
      numlist: feature($_fseuruwajcun41mi.some('numlist'), numlist),
      fontsizeselect: feature($_fseuruwajcun41mi.none(), fontsizeselect),
      forecolor: feature($_fseuruwajcun41mi.none(), forecolor),
      styleselect: feature($_fseuruwajcun41mi.none(), styleselect)
    };
  };
  var detect$4 = function (settings, features) {
    var itemNames = identify(settings);
    var present = {};
    return $_bjvqngw9jcun41mb.bind(itemNames, function (iName) {
      var r = !$_dwtfyfx6jcun41po.hasKey(present, iName) && $_dwtfyfx6jcun41po.hasKey(features, iName) && features[iName].isSupported() ? [features[iName].sketch()] : [];
      present[iName] = true;
      return r;
    });
  };
  var $_4fkzpmypjcun41uo = {
    identify: identify,
    setup: setup,
    detect: detect$4
  };

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': $_b4h1biwbjcun41ml.constant(target),
      'x': $_b4h1biwbjcun41ml.constant(x),
      'y': $_b4h1biwbjcun41ml.constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': $_b4h1biwbjcun41ml.constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = $_adhjdxwtjcun41nq.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = $_b4h1biwbjcun41ml.compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: $_b4h1biwbjcun41ml.curry(unbind, element, event, wrapped, useCapture) };
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
  var $_7q0w4v13ljcun42m3 = {
    bind: bind$2,
    capture: capture$1
  };

  var filter$1 = $_b4h1biwbjcun41ml.constant(true);
  var bind$1 = function (element, event, handler) {
    return $_7q0w4v13ljcun42m3.bind(element, event, filter$1, handler);
  };
  var capture = function (element, event, handler) {
    return $_7q0w4v13ljcun42m3.capture(element, event, filter$1, handler);
  };
  var $_dvvo4c13kjcun42m1 = {
    bind: bind$1,
    capture: capture
  };

  var INTERVAL = 50;
  var INSURANCE = 1000 / INTERVAL;
  var get$11 = function (outerWindow) {
    var isPortrait = outerWindow.matchMedia('(orientation: portrait)').matches;
    return { isPortrait: $_b4h1biwbjcun41ml.constant(isPortrait) };
  };
  var getActualWidth = function (outerWindow) {
    var isIos = $_2lzqzhwgjcun41mu.detect().os.isiOS();
    var isPortrait = get$11(outerWindow).isPortrait();
    return isIos && !isPortrait ? outerWindow.screen.height : outerWindow.screen.width;
  };
  var onChange = function (outerWindow, listeners) {
    var win = $_adhjdxwtjcun41nq.fromDom(outerWindow);
    var poller = null;
    var change = function () {
      clearInterval(poller);
      var orientation = get$11(outerWindow);
      listeners.onChange(orientation);
      onAdjustment(function () {
        listeners.onReady(orientation);
      });
    };
    var orientationHandle = $_dvvo4c13kjcun42m1.bind(win, 'orientationchange', change);
    var onAdjustment = function (f) {
      clearInterval(poller);
      var flag = outerWindow.innerHeight;
      var insurance = 0;
      poller = setInterval(function () {
        if (flag !== outerWindow.innerHeight) {
          clearInterval(poller);
          f($_fseuruwajcun41mi.some(outerWindow.innerHeight));
        } else if (insurance > INSURANCE) {
          clearInterval(poller);
          f($_fseuruwajcun41mi.none());
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
  var $_5icuhy13jjcun42lw = {
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
      return $_fseuruwajcun41mi.none();
    return $_fseuruwajcun41mi.some(event.raw().touches[0]);
  };
  var isFarEnough = function (touch, data) {
    var distX = Math.abs(touch.clientX - data.x());
    var distY = Math.abs(touch.clientY - data.y());
    return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
  };
  var monitor$1 = function (settings) {
    var startData = Cell($_fseuruwajcun41mi.none());
    var longpress = DelayedFunction(function (event) {
      startData.set($_fseuruwajcun41mi.none());
      settings.triggerEvent($_8672kiwwjcun41o0.longpress(), event);
    }, LONGPRESS_DELAY);
    var handleTouchstart = function (event) {
      getTouch(event).each(function (touch) {
        longpress.cancel();
        var data = {
          x: $_b4h1biwbjcun41ml.constant(touch.clientX),
          y: $_b4h1biwbjcun41ml.constant(touch.clientY),
          target: event.target
        };
        longpress.schedule(data);
        startData.set($_fseuruwajcun41mi.some(data));
      });
      return $_fseuruwajcun41mi.none();
    };
    var handleTouchmove = function (event) {
      longpress.cancel();
      getTouch(event).each(function (touch) {
        startData.get().each(function (data) {
          if (isFarEnough(touch, data))
            startData.set($_fseuruwajcun41mi.none());
        });
      });
      return $_fseuruwajcun41mi.none();
    };
    var handleTouchend = function (event) {
      longpress.cancel();
      var isSame = function (data) {
        return $_6hi5odw8jcun41m3.eq(data.target(), event.target());
      };
      return startData.get().filter(isSame).map(function (data) {
        return settings.triggerEvent($_8672kiwwjcun41o0.tap(), event);
      });
    };
    var handlers = $_dwtfyfx6jcun41po.wrapAll([
      {
        key: $_ay8498wxjcun41o3.touchstart(),
        value: handleTouchstart
      },
      {
        key: $_ay8498wxjcun41o3.touchmove(),
        value: handleTouchmove
      },
      {
        key: $_ay8498wxjcun41o3.touchend(),
        value: handleTouchend
      }
    ]);
    var fireIfReady = function (event, type) {
      return $_dwtfyfx6jcun41po.readOptFrom(handlers, type).bind(function (handler) {
        return handler(event);
      });
    };
    return { fireIfReady: fireIfReady };
  };
  var $_2tho5b13rjcun42n8 = { monitor: monitor$1 };

  var monitor = function (editorApi) {
    var tapEvent = $_2tho5b13rjcun42n8.monitor({
      triggerEvent: function (type, evt) {
        editorApi.onTapContent(evt);
      }
    });
    var onTouchend = function () {
      return $_dvvo4c13kjcun42m1.bind(editorApi.body(), 'touchend', function (evt) {
        tapEvent.fireIfReady(evt, 'touchend');
      });
    };
    var onTouchmove = function () {
      return $_dvvo4c13kjcun42m1.bind(editorApi.body(), 'touchmove', function (evt) {
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
  var $_ffe97x13qjcun42n3 = { monitor: monitor };

  var isAndroid6 = $_2lzqzhwgjcun41mu.detect().os.version.major >= 6;
  var initEvents = function (editorApi, toolstrip, alloy) {
    var tapping = $_ffe97x13qjcun42n3.monitor(editorApi);
    var outerDoc = $_df5x8oy3jcun41sv.owner(toolstrip);
    var isRanged = function (sel) {
      return !$_6hi5odw8jcun41m3.eq(sel.start(), sel.finish()) || sel.soffset() !== sel.foffset();
    };
    var hasRangeInUi = function () {
      return $_5qyty2ygjcun41u1.active(outerDoc).filter(function (input) {
        return $_cbjvosxxjcun41s5.name(input) === 'input';
      }).exists(function (input) {
        return input.dom().selectionStart !== input.dom().selectionEnd;
      });
    };
    var updateMargin = function () {
      var rangeInContent = editorApi.doc().dom().hasFocus() && editorApi.getSelection().exists(isRanged);
      alloy.getByDom(toolstrip).each((rangeInContent || hasRangeInUi()) === true ? Toggling.on : Toggling.off);
    };
    var listeners = [
      $_dvvo4c13kjcun42m1.bind(editorApi.body(), 'touchstart', function (evt) {
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_dvvo4c13kjcun42m1.bind(toolstrip, 'touchstart', function (evt) {
        editorApi.onTouchToolstrip();
      }),
      editorApi.onToReading(function () {
        $_5qyty2ygjcun41u1.blur(editorApi.body());
      }),
      editorApi.onToEditing($_b4h1biwbjcun41ml.noop),
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
      $_dvvo4c13kjcun42m1.bind($_adhjdxwtjcun41nq.fromDom(editorApi.win()), 'blur', function () {
        alloy.getByDom(toolstrip).each(Toggling.off);
      }),
      $_dvvo4c13kjcun42m1.bind(outerDoc, 'select', updateMargin),
      $_dvvo4c13kjcun42m1.bind(editorApi.doc(), 'selectionchange', updateMargin)
    ]);
    var destroy = function () {
      $_bjvqngw9jcun41mb.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_em1iwj13pjcun42mo = { initEvents: initEvents };

  var autocompleteHack = function () {
    return function (f) {
      setTimeout(function () {
        f();
      }, 0);
    };
  };
  var resume = function (cWin) {
    cWin.focus();
    var iBody = $_adhjdxwtjcun41nq.fromDom(cWin.document.body);
    var inInput = $_5qyty2ygjcun41u1.active().exists(function (elem) {
      return $_bjvqngw9jcun41mb.contains([
        'input',
        'textarea'
      ], $_cbjvosxxjcun41s5.name(elem));
    });
    var transaction = inInput ? autocompleteHack() : $_b4h1biwbjcun41ml.apply;
    transaction(function () {
      $_5qyty2ygjcun41u1.active().each($_5qyty2ygjcun41u1.blur);
      $_5qyty2ygjcun41u1.focus(iBody);
    });
  };
  var $_a70qpg13ujcun42ns = { resume: resume };

  var safeParse = function (element, attribute) {
    var parsed = parseInt($_f8g4i8xwjcun41s0.get(element, attribute), 10);
    return isNaN(parsed) ? 0 : parsed;
  };
  var $_5rse2g13vjcun42nz = { safeParse: safeParse };

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
        return $_fseuruwajcun41mi.none();
      }
    };
    var getOptionSafe = function (element) {
      return is(element) ? $_fseuruwajcun41mi.from(element.dom().nodeValue) : $_fseuruwajcun41mi.none();
    };
    var browser = $_2lzqzhwgjcun41mu.detect().browser;
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

  var api$3 = NodeValue($_cbjvosxxjcun41s5.isText, 'text');
  var get$12 = function (element) {
    return api$3.get(element);
  };
  var getOption = function (element) {
    return api$3.getOption(element);
  };
  var set$8 = function (element, value) {
    api$3.set(element, value);
  };
  var $_1t1trg13yjcun42oa = {
    get: get$12,
    getOption: getOption,
    set: set$8
  };

  var getEnd = function (element) {
    return $_cbjvosxxjcun41s5.name(element) === 'img' ? 1 : $_1t1trg13yjcun42oa.getOption(element).fold(function () {
      return $_df5x8oy3jcun41sv.children(element).length;
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
    return $_1t1trg13yjcun42oa.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || $_bjvqngw9jcun41mb.contains(elementsWithCursorPosition, $_cbjvosxxjcun41s5.name(elem));
  };
  var $_bah2ny13xjcun42o8 = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var adt$4 = $_f19awjx4jcun41p6.generate([
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
    return situ.fold($_b4h1biwbjcun41ml.identity, $_b4h1biwbjcun41ml.identity, $_b4h1biwbjcun41ml.identity);
  };
  var $_6ym7e2141jcun42oj = {
    before: adt$4.before,
    on: adt$4.on,
    after: adt$4.after,
    cata: cata,
    getStart: getStart$1
  };

  var type$1 = $_f19awjx4jcun41p6.generate([
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
  var range$1 = $_36fc2ixmjcun41ri.immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$1.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return $_adhjdxwtjcun41nq.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_6ym7e2141jcun42oj.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart(selection);
    return $_df5x8oy3jcun41sv.defaultView(start);
  };
  var $_eantq4140jcun42oe = {
    domRange: type$1.domRange,
    relative: type$1.relative,
    exact: type$1.exact,
    exactFromRange: exactFromRange,
    range: range$1,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_df5x8oy3jcun41sv.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return $_adhjdxwtjcun41nq.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_6hi5odw8jcun41m3.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_28cgyd143jcun42or = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    $_bjvqngw9jcun41mb.each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return $_adhjdxwtjcun41nq.fromDom(fragment);
  };
  var $_brqilv144jcun42os = { fromElements: fromElements };

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
    return $_adhjdxwtjcun41nq.fromDom(fragment);
  };
  var toRect$1 = function (rect) {
    return {
      left: $_b4h1biwbjcun41ml.constant(rect.left),
      top: $_b4h1biwbjcun41ml.constant(rect.top),
      right: $_b4h1biwbjcun41ml.constant(rect.right),
      bottom: $_b4h1biwbjcun41ml.constant(rect.bottom),
      width: $_b4h1biwbjcun41ml.constant(rect.width),
      height: $_b4h1biwbjcun41ml.constant(rect.height)
    };
  };
  var getFirstRect$1 = function (rng) {
    var rects = rng.getClientRects();
    var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? $_fseuruwajcun41mi.some(rect).map(toRect$1) : $_fseuruwajcun41mi.none();
  };
  var getBounds$2 = function (rng) {
    var rect = rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? $_fseuruwajcun41mi.some(rect).map(toRect$1) : $_fseuruwajcun41mi.none();
  };
  var toString$1 = function (rng) {
    return rng.toString();
  };
  var $_8thdmh145jcun42ov = {
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

  var adt$5 = $_f19awjx4jcun41p6.generate([
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
    return type($_adhjdxwtjcun41nq.fromDom(range.startContainer), range.startOffset, $_adhjdxwtjcun41nq.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: $_b4h1biwbjcun41ml.constant(rng),
          rtl: $_fseuruwajcun41mi.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: $_9r9hd7whjcun41mw.cached(function () {
            return $_8thdmh145jcun42ov.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: $_9r9hd7whjcun41mw.cached(function () {
            return $_fseuruwajcun41mi.some($_8thdmh145jcun42ov.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: $_9r9hd7whjcun41mw.cached(function () {
            return $_8thdmh145jcun42ov.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: $_9r9hd7whjcun41mw.cached(function () {
            return $_fseuruwajcun41mi.some($_8thdmh145jcun42ov.exactToNative(win, finish, foffset, start, soffset));
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
        return adt$5.rtl($_adhjdxwtjcun41nq.fromDom(rev.endContainer), rev.endOffset, $_adhjdxwtjcun41nq.fromDom(rev.startContainer), rev.startOffset);
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
  var $_ewj3x7146jcun42p5 = {
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
  var $_3ifh10149jcun42pi = {
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
    var length = $_1t1trg13yjcun42oa.get(textnode).length;
    var offset = $_3ifh10149jcun42pi.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate$2 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = $_2kprlnyejcun41ty.findMap(rects, function (rect) {
      return $_3ifh10149jcun42pi.inRect(rect, x, y) ? $_fseuruwajcun41mi.some(rect) : $_fseuruwajcun41mi.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_86sjpr14ajcun42pk = { locate: locate$2 };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_df5x8oy3jcun41sv.children(node);
    return $_2kprlnyejcun41ty.findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_3ifh10149jcun42pi.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : $_fseuruwajcun41mi.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_cbjvosxxjcun41s5.isText(node) ? $_86sjpr14ajcun42pk.locate : searchInChildren;
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
  var $_83twi4148jcun42pe = { locate: locate$1 };

  var first$3 = function (element) {
    return $_2nwazgyijcun41u8.descendant(element, $_bah2ny13xjcun42o8.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_bah2ny13xjcun42o8.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_df5x8oy3jcun41sv.children(element);
      for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (predicate(child))
          return $_fseuruwajcun41mi.some(child);
        var res = descend(child);
        if (res.isSome())
          return res;
      }
      return $_fseuruwajcun41mi.none();
    };
    return descend(scope);
  };
  var $_3knkdh14cjcun42pr = {
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
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_3knkdh14cjcun42pr.first : $_3knkdh14cjcun42pr.last;
    return f(node).map(function (target) {
      return createCollapsedNode(doc, target, collapseDirection);
    });
  };
  var locateInEmpty = function (doc, node, x) {
    var rect = node.dom().getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    return $_fseuruwajcun41mi.some(createCollapsedNode(doc, node, collapseDirection));
  };
  var search$1 = function (doc, node, x) {
    var f = $_df5x8oy3jcun41sv.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_e92x7114bjcun42po = { search: search$1 };

  var caretPositionFromPoint = function (doc, x, y) {
    return $_fseuruwajcun41mi.from(doc.dom().caretPositionFromPoint(x, y)).bind(function (pos) {
      if (pos.offsetNode === null)
        return $_fseuruwajcun41mi.none();
      var r = doc.dom().createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse();
      return $_fseuruwajcun41mi.some(r);
    });
  };
  var caretRangeFromPoint = function (doc, x, y) {
    return $_fseuruwajcun41mi.from(doc.dom().caretRangeFromPoint(x, y));
  };
  var searchTextNodes = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return $_83twi4148jcun42pe.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return $_adhjdxwtjcun41nq.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_e92x7114bjcun42po.search(doc, elem, x);
      };
      return $_df5x8oy3jcun41sv.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = $_adhjdxwtjcun41nq.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_eantq4140jcun42oe.range($_adhjdxwtjcun41nq.fromDom(rng.startContainer), rng.startOffset, $_adhjdxwtjcun41nq.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_ek7vf3147jcun42pb = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_8thdmh145jcun42ov.create(win);
    var self = $_5if0vzwsjcun41nl.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_3299iyzkjcun41yx.descendants(ancestor, selector));
    return $_bjvqngw9jcun41mb.filter(elements, function (elem) {
      $_8thdmh145jcun42ov.selectNodeContentsUsing(innerRange, elem);
      return $_8thdmh145jcun42ov.isWithin(outerRange, innerRange);
    });
  };
  var find$4 = function (win, selection, selector) {
    var outerRange = $_ewj3x7146jcun42p5.asLtrRange(win, selection);
    var ancestor = $_adhjdxwtjcun41nq.fromDom(outerRange.commonAncestorContainer);
    return $_cbjvosxxjcun41s5.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_e9qblp14djcun42pu = { find: find$4 };

  var beforeSpecial = function (element, offset) {
    var name = $_cbjvosxxjcun41s5.name(element);
    if ('input' === name)
      return $_6ym7e2141jcun42oj.after(element);
    else if (!$_bjvqngw9jcun41mb.contains([
        'br',
        'img'
      ], name))
      return $_6ym7e2141jcun42oj.on(element, offset);
    else
      return offset === 0 ? $_6ym7e2141jcun42oj.before(element) : $_6ym7e2141jcun42oj.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_6ym7e2141jcun42oj.before, beforeSpecial, $_6ym7e2141jcun42oj.after);
    var finish = finishSitu.fold($_6ym7e2141jcun42oj.before, beforeSpecial, $_6ym7e2141jcun42oj.after);
    return $_eantq4140jcun42oe.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_eantq4140jcun42oe.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = $_adhjdxwtjcun41nq.fromDom(rng.startContainer);
        var finish = $_adhjdxwtjcun41nq.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_13jutr14ejcun42pw = {
    beforeSpecial: beforeSpecial,
    preprocess: preprocess,
    preprocessRelative: preprocessRelative,
    preprocessExact: preprocessExact
  };

  var doSetNativeRange = function (win, rng) {
    $_fseuruwajcun41mi.from(win.getSelection()).each(function (selection) {
      selection.removeAllRanges();
      selection.addRange(rng);
    });
  };
  var doSetRange = function (win, start, soffset, finish, foffset) {
    var rng = $_8thdmh145jcun42ov.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_e9qblp14djcun42pu.find(win, selection, selector);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_ewj3x7146jcun42p5.diagnose(win, relative).match({
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
    var relative = $_13jutr14ejcun42pw.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_13jutr14ejcun42pw.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_eantq4140jcun42oe.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_8thdmh145jcun42ov.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_13jutr14ejcun42pw.preprocess(selection);
    return $_ewj3x7146jcun42p5.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return $_fseuruwajcun41mi.some($_eantq4140jcun42oe.range($_adhjdxwtjcun41nq.fromDom(firstRng.startContainer), firstRng.startOffset, $_adhjdxwtjcun41nq.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return $_fseuruwajcun41mi.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = $_adhjdxwtjcun41nq.fromDom(selection.anchorNode);
    var focusNode = $_adhjdxwtjcun41nq.fromDom(selection.focusNode);
    return $_28cgyd143jcun42or.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? $_fseuruwajcun41mi.some($_eantq4140jcun42oe.range($_adhjdxwtjcun41nq.fromDom(selection.anchorNode), selection.anchorOffset, $_adhjdxwtjcun41nq.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_8thdmh145jcun42ov.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_8thdmh145jcun42ov.selectNodeContents(win, element);
    return $_eantq4140jcun42oe.range($_adhjdxwtjcun41nq.fromDom(rng.startContainer), rng.startOffset, $_adhjdxwtjcun41nq.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    var selection = win.getSelection();
    return selection.rangeCount > 0 ? doGetExact(selection) : $_fseuruwajcun41mi.none();
  };
  var get$13 = function (win) {
    return getExact(win).map(function (range) {
      return $_eantq4140jcun42oe.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect = function (win, selection) {
    var rng = $_ewj3x7146jcun42p5.asLtrRange(win, selection);
    return $_8thdmh145jcun42ov.getFirstRect(rng);
  };
  var getBounds$1 = function (win, selection) {
    var rng = $_ewj3x7146jcun42p5.asLtrRange(win, selection);
    return $_8thdmh145jcun42ov.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_ek7vf3147jcun42pb.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_ewj3x7146jcun42p5.asLtrRange(win, selection);
    return $_8thdmh145jcun42ov.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$3 = function (win, selection) {
    var rng = $_ewj3x7146jcun42p5.asLtrRange(win, selection);
    return $_8thdmh145jcun42ov.cloneFragment(rng);
  };
  var replace = function (win, selection, elements) {
    var rng = $_ewj3x7146jcun42p5.asLtrRange(win, selection);
    var fragment = $_brqilv144jcun42os.fromElements(elements, win.document);
    $_8thdmh145jcun42ov.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_ewj3x7146jcun42p5.asLtrRange(win, selection);
    $_8thdmh145jcun42ov.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_6hi5odw8jcun41m3.eq(start, finish) && soffset === foffset;
  };
  var $_b9nc2z142jcun42on = {
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
      width: $_b4h1biwbjcun41ml.constant(COLLAPSED_WIDTH),
      height: rect.height
    };
  };
  var toRect = function (rawRect) {
    return {
      left: $_b4h1biwbjcun41ml.constant(rawRect.left),
      top: $_b4h1biwbjcun41ml.constant(rawRect.top),
      right: $_b4h1biwbjcun41ml.constant(rawRect.right),
      bottom: $_b4h1biwbjcun41ml.constant(rawRect.bottom),
      width: $_b4h1biwbjcun41ml.constant(rawRect.width),
      height: $_b4h1biwbjcun41ml.constant(rawRect.height)
    };
  };
  var getRectsFromRange = function (range) {
    if (!range.collapsed) {
      return $_bjvqngw9jcun41mb.map(range.getClientRects(), toRect);
    } else {
      var start_1 = $_adhjdxwtjcun41nq.fromDom(range.startContainer);
      return $_df5x8oy3jcun41sv.parent(start_1).bind(function (parent) {
        var selection = $_eantq4140jcun42oe.exact(start_1, range.startOffset, parent, $_bah2ny13xjcun42o8.getEnd(parent));
        var optRect = $_b9nc2z142jcun42on.getFirstRect(range.startContainer.ownerDocument.defaultView, selection);
        return optRect.map(collapsedRect).map($_bjvqngw9jcun41mb.pure);
      }).getOr([]);
    }
  };
  var getRectangles = function (cWin) {
    var sel = cWin.getSelection();
    return sel !== undefined && sel.rangeCount > 0 ? getRectsFromRange(sel.getRangeAt(0)) : [];
  };
  var $_3tdawo13wjcun42o1 = { getRectangles: getRectangles };

  var EXTRA_SPACING = 50;
  var data = 'data-' + $_4tdysdz1jcun41wo.resolve('last-outer-height');
  var setLastHeight = function (cBody, value) {
    $_f8g4i8xwjcun41s0.set(cBody, data, value);
  };
  var getLastHeight = function (cBody) {
    return $_5rse2g13vjcun42nz.safeParse(cBody, data);
  };
  var getBoundsFrom = function (rect) {
    return {
      top: $_b4h1biwbjcun41ml.constant(rect.top()),
      bottom: $_b4h1biwbjcun41ml.constant(rect.top() + rect.height())
    };
  };
  var getBounds = function (cWin) {
    var rects = $_3tdawo13wjcun42o1.getRectangles(cWin);
    return rects.length > 0 ? $_fseuruwajcun41mi.some(rects[0]).map(getBoundsFrom) : $_fseuruwajcun41mi.none();
  };
  var findDelta = function (outerWindow, cBody) {
    var last = getLastHeight(cBody);
    var current = outerWindow.innerHeight;
    return last > current ? $_fseuruwajcun41mi.some(last - current) : $_fseuruwajcun41mi.none();
  };
  var calculate = function (cWin, bounds, delta) {
    var isOutside = bounds.top() > cWin.innerHeight || bounds.bottom() > cWin.innerHeight;
    return isOutside ? Math.min(delta, bounds.bottom() - cWin.innerHeight + EXTRA_SPACING) : 0;
  };
  var setup$1 = function (outerWindow, cWin) {
    var cBody = $_adhjdxwtjcun41nq.fromDom(cWin.document.body);
    var toEditing = function () {
      $_a70qpg13ujcun42ns.resume(cWin);
    };
    var onResize = $_dvvo4c13kjcun42m1.bind($_adhjdxwtjcun41nq.fromDom(outerWindow), 'resize', function () {
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
  var $_1shs7o13tjcun42nk = { setup: setup$1 };

  var getBodyFromFrame = function (frame) {
    return $_fseuruwajcun41mi.some($_adhjdxwtjcun41nq.fromDom(frame.dom().contentWindow.document.body));
  };
  var getDocFromFrame = function (frame) {
    return $_fseuruwajcun41mi.some($_adhjdxwtjcun41nq.fromDom(frame.dom().contentWindow.document));
  };
  var getWinFromFrame = function (frame) {
    return $_fseuruwajcun41mi.from(frame.dom().contentWindow);
  };
  var getSelectionFromFrame = function (frame) {
    var optWin = getWinFromFrame(frame);
    return optWin.bind($_b9nc2z142jcun42on.getExact);
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
        return $_dvvo4c13kjcun42m1.bind(doc, type, handler);
      };
    });
  };
  var toRect$2 = function (rect) {
    return {
      left: $_b4h1biwbjcun41ml.constant(rect.left),
      top: $_b4h1biwbjcun41ml.constant(rect.top),
      right: $_b4h1biwbjcun41ml.constant(rect.right),
      bottom: $_b4h1biwbjcun41ml.constant(rect.bottom),
      width: $_b4h1biwbjcun41ml.constant(rect.width),
      height: $_b4h1biwbjcun41ml.constant(rect.height)
    };
  };
  var getActiveApi = function (editor) {
    var frame = getFrame(editor);
    var tryFallbackBox = function (win) {
      var isCollapsed = function (sel) {
        return $_6hi5odw8jcun41m3.eq(sel.start(), sel.finish()) && sel.soffset() === sel.foffset();
      };
      var toStartRect = function (sel) {
        var rect = sel.start().dom().getBoundingClientRect();
        return rect.width > 0 || rect.height > 0 ? $_fseuruwajcun41mi.some(rect).map(toRect$2) : $_fseuruwajcun41mi.none();
      };
      return $_b9nc2z142jcun42on.getExact(win).filter(isCollapsed).bind(toStartRect);
    };
    return getBodyFromFrame(frame).bind(function (body) {
      return getDocFromFrame(frame).bind(function (doc) {
        return getWinFromFrame(frame).map(function (win) {
          var html = $_adhjdxwtjcun41nq.fromDom(doc.dom().documentElement);
          var getCursorBox = editor.getCursorBox.getOrThunk(function () {
            return function () {
              return $_b9nc2z142jcun42on.get(win).bind(function (sel) {
                return $_b9nc2z142jcun42on.getFirstRect(win, sel).orThunk(function () {
                  return tryFallbackBox(win);
                });
              });
            };
          });
          var setSelection = editor.setSelection.getOrThunk(function () {
            return function (start, soffset, finish, foffset) {
              $_b9nc2z142jcun42on.setExact(win, start, soffset, finish, foffset);
            };
          });
          var clearSelection = editor.clearSelection.getOrThunk(function () {
            return function () {
              $_b9nc2z142jcun42on.clear(win);
            };
          });
          return {
            body: $_b4h1biwbjcun41ml.constant(body),
            doc: $_b4h1biwbjcun41ml.constant(doc),
            win: $_b4h1biwbjcun41ml.constant(win),
            html: $_b4h1biwbjcun41ml.constant(html),
            getSelection: $_b4h1biwbjcun41ml.curry(getSelectionFromFrame, frame),
            setSelection: setSelection,
            clearSelection: clearSelection,
            frame: $_b4h1biwbjcun41ml.constant(frame),
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
  var $_9adm1w14fjcun42q0 = {
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
  var isAndroid = $_2lzqzhwgjcun41mu.detect().os.isAndroid();
  var matchColor = function (editorBody) {
    var color = $_ebvjd9zsjcun41zr.get(editorBody, 'background-color');
    return color !== undefined && color !== '' ? 'background-color:' + color + '!important' : bgFallback;
  };
  var clobberStyles = function (container, editorBody) {
    var gatherSibilings = function (element) {
      var siblings = $_3299iyzkjcun41yx.siblings(element, '*');
      return siblings;
    };
    var clobber = function (clobberStyle) {
      return function (element) {
        var styles = $_f8g4i8xwjcun41s0.get(element, 'style');
        var backup = styles === undefined ? 'no-styles' : styles.trim();
        if (backup === clobberStyle) {
          return;
        } else {
          $_f8g4i8xwjcun41s0.set(element, attr, backup);
          $_f8g4i8xwjcun41s0.set(element, 'style', clobberStyle);
        }
      };
    };
    var ancestors = $_3299iyzkjcun41yx.ancestors(container, '*');
    var siblings = $_bjvqngw9jcun41mb.bind(ancestors, gatherSibilings);
    var bgColor = matchColor(editorBody);
    $_bjvqngw9jcun41mb.each(siblings, clobber(siblingStyles));
    $_bjvqngw9jcun41mb.each(ancestors, clobber(ancestorPosition + ancestorStyles + bgColor));
    var containerStyles = isAndroid === true ? '' : ancestorPosition;
    clobber(containerStyles + ancestorStyles + bgColor)(container);
  };
  var restoreStyles = function () {
    var clobberedEls = $_3299iyzkjcun41yx.all('[' + attr + ']');
    $_bjvqngw9jcun41mb.each(clobberedEls, function (element) {
      var restore = $_f8g4i8xwjcun41s0.get(element, attr);
      if (restore !== 'no-styles') {
        $_f8g4i8xwjcun41s0.set(element, 'style', restore);
      } else {
        $_f8g4i8xwjcun41s0.remove(element, 'style');
      }
      $_f8g4i8xwjcun41s0.remove(element, attr);
    });
  };
  var $_6j0y4g14gjcun42q9 = {
    clobberStyles: clobberStyles,
    restoreStyles: restoreStyles
  };

  var tag = function () {
    var head = $_akwq9fzmjcun41z4.first('head').getOrDie();
    var nu = function () {
      var meta = $_adhjdxwtjcun41nq.fromTag('meta');
      $_f8g4i8xwjcun41s0.set(meta, 'name', 'viewport');
      $_4hb7l2y2jcun41sm.append(head, meta);
      return meta;
    };
    var element = $_akwq9fzmjcun41z4.first('meta[name="viewport"]').getOrThunk(nu);
    var backup = $_f8g4i8xwjcun41s0.get(element, 'content');
    var maximize = function () {
      $_f8g4i8xwjcun41s0.set(element, 'content', 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0');
    };
    var restore = function () {
      if (backup !== undefined && backup !== null && backup.length > 0) {
        $_f8g4i8xwjcun41s0.set(element, 'content', backup);
      } else {
        $_f8g4i8xwjcun41s0.set(element, 'content', 'user-scalable=yes');
      }
    };
    return {
      maximize: maximize,
      restore: restore
    };
  };
  var $_411vb014hjcun42qg = { tag: tag };

  var create$4 = function (platform, mask) {
    var meta = $_411vb014hjcun42qg.tag();
    var androidApi = $_gcub7o12ajcun42de.api();
    var androidEvents = $_gcub7o12ajcun42de.api();
    var enter = function () {
      mask.hide();
      $_f0wr0jxujcun41rx.add(platform.container, $_4tdysdz1jcun41wo.resolve('fullscreen-maximized'));
      $_f0wr0jxujcun41rx.add(platform.container, $_4tdysdz1jcun41wo.resolve('android-maximized'));
      meta.maximize();
      $_f0wr0jxujcun41rx.add(platform.body, $_4tdysdz1jcun41wo.resolve('android-scroll-reload'));
      androidApi.set($_1shs7o13tjcun42nk.setup(platform.win, $_9adm1w14fjcun42q0.getWin(platform.editor).getOrDie('no')));
      $_9adm1w14fjcun42q0.getActiveApi(platform.editor).each(function (editorApi) {
        $_6j0y4g14gjcun42q9.clobberStyles(platform.container, editorApi.body());
        androidEvents.set($_em1iwj13pjcun42mo.initEvents(editorApi, platform.toolstrip, platform.alloy));
      });
    };
    var exit = function () {
      meta.restore();
      mask.show();
      $_f0wr0jxujcun41rx.remove(platform.container, $_4tdysdz1jcun41wo.resolve('fullscreen-maximized'));
      $_f0wr0jxujcun41rx.remove(platform.container, $_4tdysdz1jcun41wo.resolve('android-maximized'));
      $_6j0y4g14gjcun42q9.restoreStyles();
      $_f0wr0jxujcun41rx.remove(platform.body, $_4tdysdz1jcun41wo.resolve('android-scroll-reload'));
      androidEvents.clear();
      androidApi.clear();
    };
    return {
      enter: enter,
      exit: exit
    };
  };
  var $_2pn2ch13ojcun42mj = { create: create$4 };

  var MobileSchema = $_a6j4ohxhjcun41qn.objOf([
    $_84yedrx2jcun41om.strictObjOf('editor', [
      $_84yedrx2jcun41om.strict('getFrame'),
      $_84yedrx2jcun41om.option('getBody'),
      $_84yedrx2jcun41om.option('getDoc'),
      $_84yedrx2jcun41om.option('getWin'),
      $_84yedrx2jcun41om.option('getSelection'),
      $_84yedrx2jcun41om.option('setSelection'),
      $_84yedrx2jcun41om.option('clearSelection'),
      $_84yedrx2jcun41om.option('cursorSaver'),
      $_84yedrx2jcun41om.option('onKeyup'),
      $_84yedrx2jcun41om.option('onNodeChanged'),
      $_84yedrx2jcun41om.option('getCursorBox'),
      $_84yedrx2jcun41om.strict('onDomChanged'),
      $_84yedrx2jcun41om.defaulted('onTouchContent', $_b4h1biwbjcun41ml.noop),
      $_84yedrx2jcun41om.defaulted('onTapContent', $_b4h1biwbjcun41ml.noop),
      $_84yedrx2jcun41om.defaulted('onTouchToolstrip', $_b4h1biwbjcun41ml.noop),
      $_84yedrx2jcun41om.defaulted('onScrollToCursor', $_b4h1biwbjcun41ml.constant({ unbind: $_b4h1biwbjcun41ml.noop })),
      $_84yedrx2jcun41om.defaulted('onScrollToElement', $_b4h1biwbjcun41ml.constant({ unbind: $_b4h1biwbjcun41ml.noop })),
      $_84yedrx2jcun41om.defaulted('onToEditing', $_b4h1biwbjcun41ml.constant({ unbind: $_b4h1biwbjcun41ml.noop })),
      $_84yedrx2jcun41om.defaulted('onToReading', $_b4h1biwbjcun41ml.constant({ unbind: $_b4h1biwbjcun41ml.noop })),
      $_84yedrx2jcun41om.defaulted('onToolbarScrollStart', $_b4h1biwbjcun41ml.identity)
    ]),
    $_84yedrx2jcun41om.strict('socket'),
    $_84yedrx2jcun41om.strict('toolstrip'),
    $_84yedrx2jcun41om.strict('dropup'),
    $_84yedrx2jcun41om.strict('toolbar'),
    $_84yedrx2jcun41om.strict('container'),
    $_84yedrx2jcun41om.strict('alloy'),
    $_84yedrx2jcun41om.state('win', function (spec) {
      return $_df5x8oy3jcun41sv.owner(spec.socket).dom().defaultView;
    }),
    $_84yedrx2jcun41om.state('body', function (spec) {
      return $_adhjdxwtjcun41nq.fromDom(spec.socket.dom().ownerDocument.body);
    }),
    $_84yedrx2jcun41om.defaulted('translate', $_b4h1biwbjcun41ml.identity),
    $_84yedrx2jcun41om.defaulted('setReadOnly', $_b4h1biwbjcun41ml.noop)
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
  var $_d3y0wz14kjcun42r4 = {
    adaptable: adaptable,
    first: first$4,
    last: last$3
  };

  var sketch$10 = function (onView, translate) {
    var memIcon = $_66j02811ejcun4299.record(Container.sketch({
      dom: $_6p4heu10qjcun425t.dom('<div aria-hidden="true" class="${prefix}-mask-tap-icon"></div>'),
      containerBehaviours: $_bv6ofew4jcun41l1.derive([Toggling.config({
          toggleClass: $_4tdysdz1jcun41wo.resolve('mask-tap-icon-selected'),
          toggleOnExecute: false
        })])
    }));
    var onViewThrottle = $_d3y0wz14kjcun42r4.first(onView, 200);
    return Container.sketch({
      dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-disabled-mask"></div>'),
      components: [Container.sketch({
          dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-content-container"></div>'),
          components: [Button.sketch({
              dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-content-tap-section"></div>'),
              components: [memIcon.asSpec()],
              action: function (button) {
                onViewThrottle.throttle();
              },
              buttonBehaviours: $_bv6ofew4jcun41l1.derive([Toggling.config({ toggleClass: $_4tdysdz1jcun41wo.resolve('mask-tap-icon-selected') })])
            })]
        })]
    });
  };
  var $_dapweb14jjcun42qx = { sketch: sketch$10 };

  var produce = function (raw) {
    var mobile = $_a6j4ohxhjcun41qn.asRawOrDie('Getting AndroidWebapp schema', MobileSchema, raw);
    $_ebvjd9zsjcun41zr.set(mobile.toolstrip, 'width', '100%');
    var onTap = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_5njsek12kjcun42f5.build($_dapweb14jjcun42qx.sketch(onTap, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    $_4hb7l2y2jcun41sm.append(mobile.container, mask.element());
    var mode = $_2pn2ch13ojcun42mj.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: $_b4h1biwbjcun41ml.noop,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_b4h1biwbjcun41ml.noop
    };
  };
  var $_6mxk5n13njcun42md = { produce: produce };

  var schema$14 = [
    $_84yedrx2jcun41om.defaulted('shell', true),
    $_g2kwcr10djcun422w.field('toolbarBehaviours', [Replacing])
  ];
  var enhanceGroups = function (detail) {
    return { behaviours: $_bv6ofew4jcun41l1.derive([Replacing.config({})]) };
  };
  var partTypes$1 = [$_c6iged10kjcun424e.optional({
      name: 'groups',
      overrides: enhanceGroups
    })];
  var $_2dbxpe14njcun42ro = {
    name: $_b4h1biwbjcun41ml.constant('Toolbar'),
    schema: $_b4h1biwbjcun41ml.constant(schema$14),
    parts: $_b4h1biwbjcun41ml.constant(partTypes$1)
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
      return detail.shell() ? $_fseuruwajcun41mi.some(component) : $_ft7qt810ijcun423t.getPart(component, detail, 'groups');
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
      behaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive(extra.behaviours), $_g2kwcr10djcun422w.get(detail.toolbarBehaviours())),
      apis: { setGroups: setGroups },
      domModification: { attributes: { role: 'group' } }
    };
  };
  var Toolbar = $_8ozmen10ejcun4231.composite({
    name: 'Toolbar',
    configFields: $_2dbxpe14njcun42ro.schema(),
    partFields: $_2dbxpe14njcun42ro.parts(),
    factory: factory$4,
    apis: {
      setGroups: function (apis, toolbar, groups) {
        apis.setGroups(toolbar, groups);
      }
    }
  });

  var schema$15 = [
    $_84yedrx2jcun41om.strict('items'),
    $_f570ayytjcun41vk.markers(['itemClass']),
    $_g2kwcr10djcun422w.field('tgroupBehaviours', [Keying])
  ];
  var partTypes$2 = [$_c6iged10kjcun424e.group({
      name: 'items',
      unit: 'item',
      overrides: function (detail) {
        return { domModification: { classes: [detail.markers().itemClass()] } };
      }
    })];
  var $_153sy814pjcun42rw = {
    name: $_b4h1biwbjcun41ml.constant('ToolbarGroup'),
    schema: $_b4h1biwbjcun41ml.constant(schema$15),
    parts: $_b4h1biwbjcun41ml.constant(partTypes$2)
  };

  var factory$5 = function (detail, components, spec, _externals) {
    return $_do57nmwyjcun41o6.deepMerge({ dom: { attributes: { role: 'toolbar' } } }, {
      uid: detail.uid(),
      dom: detail.dom(),
      components: components,
      behaviours: $_do57nmwyjcun41o6.deepMerge($_bv6ofew4jcun41l1.derive([Keying.config({
          mode: 'flow',
          selector: '.' + detail.markers().itemClass()
        })]), $_g2kwcr10djcun422w.get(detail.tgroupBehaviours())),
      'debug.sketcher': spec['debug.sketcher']
    });
  };
  var ToolbarGroup = $_8ozmen10ejcun4231.composite({
    name: 'ToolbarGroup',
    configFields: $_153sy814pjcun42rw.schema(),
    partFields: $_153sy814pjcun42rw.parts(),
    factory: factory$5
  });

  var dataHorizontal = 'data-' + $_4tdysdz1jcun41wo.resolve('horizontal-scroll');
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
    $_f8g4i8xwjcun41s0.set(container, dataHorizontal, 'true');
  };
  var hasScroll = function (container) {
    return $_f8g4i8xwjcun41s0.get(container, dataHorizontal) === 'true' ? hasHorizontalScroll : hasVerticalScroll;
  };
  var exclusive = function (scope, selector) {
    return $_dvvo4c13kjcun42m1.bind(scope, 'touchmove', function (event) {
      $_akwq9fzmjcun41z4.closest(event.target(), selector).filter(hasScroll).fold(function () {
        event.raw().preventDefault();
      }, $_b4h1biwbjcun41ml.noop);
    });
  };
  var $_f4taln14qjcun42s1 = {
    exclusive: exclusive,
    markAsHorizontal: markAsHorizontal
  };

  var ScrollingToolbar = function () {
    var makeGroup = function (gSpec) {
      var scrollClass = gSpec.scrollable === true ? '${prefix}-toolbar-scrollable-group' : '';
      return {
        dom: $_6p4heu10qjcun425t.dom('<div aria-label="' + gSpec.label + '" class="${prefix}-toolbar-group ' + scrollClass + '"></div>'),
        tgroupBehaviours: $_bv6ofew4jcun41l1.derive([$_fl8lpl11sjcun42ay.config('adhoc-scrollable-toolbar', gSpec.scrollable === true ? [$_d87qm6w6jcun41lv.runOnInit(function (component, simulatedEvent) {
              $_ebvjd9zsjcun41zr.set(component.element(), 'overflow-x', 'auto');
              $_f4taln14qjcun42s1.markAsHorizontal(component.element());
              $_8cu4ie13hjcun42lo.register(component.element());
            })] : [])]),
        components: [Container.sketch({ components: [ToolbarGroup.parts().items({})] })],
        markers: { itemClass: $_4tdysdz1jcun41wo.resolve('toolbar-group-item') },
        items: gSpec.items
      };
    };
    var toolbar = $_5njsek12kjcun42f5.build(Toolbar.sketch({
      dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-toolbar"></div>'),
      components: [Toolbar.parts().groups({})],
      toolbarBehaviours: $_bv6ofew4jcun41l1.derive([
        Toggling.config({
          toggleClass: $_4tdysdz1jcun41wo.resolve('context-toolbar'),
          toggleOnExecute: false,
          aria: { mode: 'none' }
        }),
        Keying.config({ mode: 'cyclic' })
      ]),
      shell: true
    }));
    var wrapper = $_5njsek12kjcun42f5.build(Container.sketch({
      dom: { classes: [$_4tdysdz1jcun41wo.resolve('toolstrip')] },
      components: [$_5njsek12kjcun42f5.premade(toolbar)],
      containerBehaviours: $_bv6ofew4jcun41l1.derive([Toggling.config({
          toggleClass: $_4tdysdz1jcun41wo.resolve('android-selection-context-toolbar'),
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
      return $_bjvqngw9jcun41mb.map(gs, $_b4h1biwbjcun41ml.compose(ToolbarGroup.sketch, makeGroup));
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
      wrapper: $_b4h1biwbjcun41ml.constant(wrapper),
      toolbar: $_b4h1biwbjcun41ml.constant(toolbar),
      createGroups: createGroups,
      setGroups: setGroups,
      setContextToolbar: setContextToolbar,
      restoreToolbar: restoreToolbar,
      refresh: refresh,
      focus: focus
    };
  };

  var makeEditSwitch = function (webapp) {
    return $_5njsek12kjcun42f5.build(Button.sketch({
      dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-mask-edit-icon ${prefix}-icon"></div>'),
      action: function () {
        webapp.run(function (w) {
          w.setReadOnly(false);
        });
      }
    }));
  };
  var makeSocket = function () {
    return $_5njsek12kjcun42f5.build(Container.sketch({
      dom: $_6p4heu10qjcun425t.dom('<div class="${prefix}-editor-socket"></div>'),
      components: [],
      containerBehaviours: $_bv6ofew4jcun41l1.derive([Replacing.config({})])
    }));
  };
  var showEdit = function (socket, switchToEdit) {
    Replacing.append(socket, $_5njsek12kjcun42f5.premade(switchToEdit));
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
  var $_dlppy914rjcun42s6 = {
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
    $_mwd8r12yjcun42ic.remove(root, [
      slideConfig.shrinkingClass(),
      slideConfig.growingClass()
    ]);
  };
  var setShrunk = function (component, slideConfig) {
    $_f0wr0jxujcun41rx.remove(component.element(), slideConfig.openClass());
    $_f0wr0jxujcun41rx.add(component.element(), slideConfig.closedClass());
    $_ebvjd9zsjcun41zr.set(component.element(), getDimensionProperty(slideConfig), '0px');
    $_ebvjd9zsjcun41zr.reflow(component.element());
  };
  var measureTargetSize = function (component, slideConfig) {
    setGrown(component, slideConfig);
    var expanded = getDimension(slideConfig, component.element());
    setShrunk(component, slideConfig);
    return expanded;
  };
  var setGrown = function (component, slideConfig) {
    $_f0wr0jxujcun41rx.remove(component.element(), slideConfig.closedClass());
    $_f0wr0jxujcun41rx.add(component.element(), slideConfig.openClass());
    $_ebvjd9zsjcun41zr.remove(component.element(), getDimensionProperty(slideConfig));
  };
  var doImmediateShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_ebvjd9zsjcun41zr.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_ebvjd9zsjcun41zr.reflow(component.element());
    disableTransitions(component, slideConfig);
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
    slideConfig.onShrunk()(component);
  };
  var doStartShrink = function (component, slideConfig, slideState) {
    slideState.setCollapsed();
    $_ebvjd9zsjcun41zr.set(component.element(), getDimensionProperty(slideConfig), getDimension(slideConfig, component.element()));
    $_ebvjd9zsjcun41zr.reflow(component.element());
    var root = getAnimationRoot(component, slideConfig);
    $_f0wr0jxujcun41rx.add(root, slideConfig.shrinkingClass());
    setShrunk(component, slideConfig);
    slideConfig.onStartShrink()(component);
  };
  var doStartGrow = function (component, slideConfig, slideState) {
    var fullSize = measureTargetSize(component, slideConfig);
    var root = getAnimationRoot(component, slideConfig);
    $_f0wr0jxujcun41rx.add(root, slideConfig.growingClass());
    setGrown(component, slideConfig);
    $_ebvjd9zsjcun41zr.set(component.element(), getDimensionProperty(slideConfig), fullSize);
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
    return $_f0wr0jxujcun41rx.has(root, slideConfig.growingClass()) === true;
  };
  var isShrinking = function (component, slideConfig, slideState) {
    var root = getAnimationRoot(component, slideConfig);
    return $_f0wr0jxujcun41rx.has(root, slideConfig.shrinkingClass()) === true;
  };
  var isTransitioning = function (component, slideConfig, slideState) {
    return isGrowing(component, slideConfig, slideState) === true || isShrinking(component, slideConfig, slideState) === true;
  };
  var toggleGrow = function (component, slideConfig, slideState) {
    var f = slideState.isExpanded() ? doStartShrink : doStartGrow;
    f(component, slideConfig, slideState);
  };
  var $_9u3pjn14vjcun42sz = {
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
    return expanded ? $_1tv7mlxkjcun41r6.nu({
      classes: [slideConfig.openClass()],
      styles: {}
    }) : $_1tv7mlxkjcun41r6.nu({
      classes: [slideConfig.closedClass()],
      styles: $_dwtfyfx6jcun41po.wrap(slideConfig.dimension().property(), '0px')
    });
  };
  var events$9 = function (slideConfig, slideState) {
    return $_d87qm6w6jcun41lv.derive([$_d87qm6w6jcun41lv.run($_ay8498wxjcun41o3.transitionend(), function (component, simulatedEvent) {
        var raw = simulatedEvent.event().raw();
        if (raw.propertyName === slideConfig.dimension().property()) {
          $_9u3pjn14vjcun42sz.disableTransitions(component, slideConfig, slideState);
          if (slideState.isExpanded())
            $_ebvjd9zsjcun41zr.remove(component.element(), slideConfig.dimension().property());
          var notify = slideState.isExpanded() ? slideConfig.onGrown() : slideConfig.onShrunk();
          notify(component, simulatedEvent);
        }
      })]);
  };
  var $_1351gz14ujcun42so = {
    exhibit: exhibit$5,
    events: events$9
  };

  var SlidingSchema = [
    $_84yedrx2jcun41om.strict('closedClass'),
    $_84yedrx2jcun41om.strict('openClass'),
    $_84yedrx2jcun41om.strict('shrinkingClass'),
    $_84yedrx2jcun41om.strict('growingClass'),
    $_84yedrx2jcun41om.option('getAnimationRoot'),
    $_f570ayytjcun41vk.onHandler('onShrunk'),
    $_f570ayytjcun41vk.onHandler('onStartShrink'),
    $_f570ayytjcun41vk.onHandler('onGrown'),
    $_f570ayytjcun41vk.onHandler('onStartGrow'),
    $_84yedrx2jcun41om.defaulted('expanded', false),
    $_84yedrx2jcun41om.strictOf('dimension', $_a6j4ohxhjcun41qn.choose('property', {
      width: [
        $_f570ayytjcun41vk.output('property', 'width'),
        $_f570ayytjcun41vk.output('getDimension', function (elem) {
          return $_p9uj117jcun4285.get(elem) + 'px';
        })
      ],
      height: [
        $_f570ayytjcun41vk.output('property', 'height'),
        $_f570ayytjcun41vk.output('getDimension', function (elem) {
          return $_6famn1zrjcun41zq.get(elem) + 'px';
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
      setCollapsed: $_b4h1biwbjcun41ml.curry(state.set, false),
      setExpanded: $_b4h1biwbjcun41ml.curry(state.set, true),
      readState: readState
    });
  };
  var $_2v509514xjcun42tc = { init: init$4 };

  var Sliding = $_bv6ofew4jcun41l1.create({
    fields: SlidingSchema,
    name: 'sliding',
    active: $_1351gz14ujcun42so,
    apis: $_9u3pjn14vjcun42sz,
    state: $_2v509514xjcun42tc
  });

  var build$2 = function (refresh, scrollIntoView) {
    var dropup = $_5njsek12kjcun42f5.build(Container.sketch({
      dom: {
        tag: 'div',
        classes: $_4tdysdz1jcun41wo.resolve('dropup')
      },
      components: [],
      containerBehaviours: $_bv6ofew4jcun41l1.derive([
        Replacing.config({}),
        Sliding.config({
          closedClass: $_4tdysdz1jcun41wo.resolve('dropup-closed'),
          openClass: $_4tdysdz1jcun41wo.resolve('dropup-open'),
          shrinkingClass: $_4tdysdz1jcun41wo.resolve('dropup-shrinking'),
          growingClass: $_4tdysdz1jcun41wo.resolve('dropup-growing'),
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
        $_4ps60kz0jcun41wl.orientation(function (component, data) {
          disappear($_b4h1biwbjcun41ml.noop);
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
      component: $_b4h1biwbjcun41ml.constant(dropup),
      element: dropup.element
    };
  };
  var $_327o6p14sjcun42sd = { build: build$2 };

  var isDangerous = function (event) {
    return event.raw().which === $_dodgizejcun41y4.BACKSPACE()[0] && !$_bjvqngw9jcun41mb.contains([
      'input',
      'textarea'
    ], $_cbjvosxxjcun41s5.name(event.target()));
  };
  var isFirefox = $_2lzqzhwgjcun41mu.detect().browser.isFirefox();
  var settingsSchema = $_a6j4ohxhjcun41qn.objOfOnly([
    $_84yedrx2jcun41om.strictFunction('triggerEvent'),
    $_84yedrx2jcun41om.strictFunction('broadcastEvent'),
    $_84yedrx2jcun41om.defaulted('stopBackspace', true)
  ]);
  var bindFocus = function (container, handler) {
    if (isFirefox) {
      return $_dvvo4c13kjcun42m1.capture(container, 'focus', handler);
    } else {
      return $_dvvo4c13kjcun42m1.bind(container, 'focusin', handler);
    }
  };
  var bindBlur = function (container, handler) {
    if (isFirefox) {
      return $_dvvo4c13kjcun42m1.capture(container, 'blur', handler);
    } else {
      return $_dvvo4c13kjcun42m1.bind(container, 'focusout', handler);
    }
  };
  var setup$2 = function (container, rawSettings) {
    var settings = $_a6j4ohxhjcun41qn.asRawOrDie('Getting GUI events settings', settingsSchema, rawSettings);
    var pointerEvents = $_2lzqzhwgjcun41mu.detect().deviceType.isTouch() ? [
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
    var tapEvent = $_2tho5b13rjcun42n8.monitor(settings);
    var simpleEvents = $_bjvqngw9jcun41mb.map(pointerEvents.concat([
      'selectstart',
      'input',
      'contextmenu',
      'change',
      'transitionend',
      'dragstart',
      'dragover',
      'drop'
    ]), function (type) {
      return $_dvvo4c13kjcun42m1.bind(container, type, function (event) {
        tapEvent.fireIfReady(event, type).each(function (tapStopped) {
          if (tapStopped)
            event.kill();
        });
        var stopped = settings.triggerEvent(type, event);
        if (stopped)
          event.kill();
      });
    });
    var onKeydown = $_dvvo4c13kjcun42m1.bind(container, 'keydown', function (event) {
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
        settings.triggerEvent($_8672kiwwjcun41o0.postBlur(), event);
      }, 0);
    });
    var defaultView = $_df5x8oy3jcun41sv.defaultView(container);
    var onWindowScroll = $_dvvo4c13kjcun42m1.bind(defaultView, 'scroll', function (event) {
      var stopped = settings.broadcastEvent($_8672kiwwjcun41o0.windowScroll(), event);
      if (stopped)
        event.kill();
    });
    var unbind = function () {
      $_bjvqngw9jcun41mb.each(simpleEvents, function (e) {
        e.unbind();
      });
      onKeydown.unbind();
      onFocusIn.unbind();
      onFocusOut.unbind();
      onWindowScroll.unbind();
    };
    return { unbind: unbind };
  };
  var $_2sjme150jcun42u4 = { setup: setup$2 };

  var derive$3 = function (rawEvent, rawTarget) {
    var source = $_dwtfyfx6jcun41po.readOptFrom(rawEvent, 'target').map(function (getTarget) {
      return getTarget();
    }).getOr(rawTarget);
    return Cell(source);
  };
  var $_fwbw1w152jcun42ul = { derive: derive$3 };

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
      event: $_b4h1biwbjcun41ml.constant(event),
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
      cut: $_b4h1biwbjcun41ml.noop,
      isStopped: stopper.get,
      isCut: $_b4h1biwbjcun41ml.constant(false),
      event: $_b4h1biwbjcun41ml.constant(event),
      setTarget: $_b4h1biwbjcun41ml.die(new Error('Cannot set target of a broadcasted event')),
      getTarget: $_b4h1biwbjcun41ml.die(new Error('Cannot get target of a broadcasted event'))
    };
  };
  var fromTarget = function (event, target) {
    var source = Cell(target);
    return fromSource(event, source);
  };
  var $_ekhp37153jcun42up = {
    fromSource: fromSource,
    fromExternal: fromExternal,
    fromTarget: fromTarget
  };

  var adt$6 = $_f19awjx4jcun41p6.generate([
    { stopped: [] },
    { resume: ['element'] },
    { complete: [] }
  ]);
  var doTriggerHandler = function (lookup, eventType, rawEvent, target, source, logger) {
    var handler = lookup(eventType, target);
    var simulatedEvent = $_ekhp37153jcun42up.fromSource(rawEvent, source);
    return handler.fold(function () {
      logger.logEventNoHandlers(eventType, target);
      return adt$6.complete();
    }, function (handlerInfo) {
      var descHandler = handlerInfo.descHandler();
      var eventHandler = $_fzrvqg12vjcun42hq.getHandler(descHandler);
      eventHandler(simulatedEvent);
      if (simulatedEvent.isStopped()) {
        logger.logEventStopped(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.stopped();
      } else if (simulatedEvent.isCut()) {
        logger.logEventCut(eventType, handlerInfo.element(), descHandler.purpose());
        return adt$6.complete();
      } else
        return $_df5x8oy3jcun41sv.parent(handlerInfo.element()).fold(function () {
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
    var source = $_fwbw1w152jcun42ul.derive(rawEvent, target);
    return doTriggerHandler(lookup, eventType, rawEvent, target, source, logger);
  };
  var broadcast = function (listeners, rawEvent, logger) {
    var simulatedEvent = $_ekhp37153jcun42up.fromExternal(rawEvent);
    $_bjvqngw9jcun41mb.each(listeners, function (listener) {
      var descHandler = listener.descHandler();
      var handler = $_fzrvqg12vjcun42hq.getHandler(descHandler);
      handler(simulatedEvent);
    });
    return simulatedEvent.isStopped();
  };
  var triggerUntilStopped = function (lookup, eventType, rawEvent, logger) {
    var rawTarget = rawEvent.target();
    return triggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, logger);
  };
  var triggerOnUntilStopped = function (lookup, eventType, rawEvent, rawTarget, logger) {
    var source = $_fwbw1w152jcun42ul.derive(rawEvent, rawTarget);
    return doTriggerOnUntilStopped(lookup, eventType, rawEvent, rawTarget, source, logger);
  };
  var $_al2q8r151jcun42ug = {
    triggerHandler: triggerHandler,
    triggerUntilStopped: triggerUntilStopped,
    triggerOnUntilStopped: triggerOnUntilStopped,
    broadcast: broadcast
  };

  var closest$4 = function (target, transform, isRoot) {
    var delegate = $_2nwazgyijcun41u8.closest(target, function (elem) {
      return transform(elem).isSome();
    }, isRoot);
    return delegate.bind(transform);
  };
  var $_ep5wv3156jcun42va = { closest: closest$4 };

  var eventHandler = $_36fc2ixmjcun41ri.immutable('element', 'descHandler');
  var messageHandler = function (id, handler) {
    return {
      id: $_b4h1biwbjcun41ml.constant(id),
      descHandler: $_b4h1biwbjcun41ml.constant(handler)
    };
  };
  var EventRegistry = function () {
    var registry = {};
    var registerId = function (extraArgs, id, events) {
      $_fwofm0x0jcun41o8.each(events, function (v, k) {
        var handlers = registry[k] !== undefined ? registry[k] : {};
        handlers[id] = $_fzrvqg12vjcun42hq.curryArgs(v, extraArgs);
        registry[k] = handlers;
      });
    };
    var findHandler = function (handlers, elem) {
      return $_37h05n10mjcun424y.read(elem).fold(function (err) {
        return $_fseuruwajcun41mi.none();
      }, function (id) {
        var reader = $_dwtfyfx6jcun41po.readOpt(id);
        return handlers.bind(reader).map(function (descHandler) {
          return eventHandler(elem, descHandler);
        });
      });
    };
    var filterByType = function (type) {
      return $_dwtfyfx6jcun41po.readOptFrom(registry, type).map(function (handlers) {
        return $_fwofm0x0jcun41o8.mapToArray(handlers, function (f, id) {
          return messageHandler(id, f);
        });
      }).getOr([]);
    };
    var find = function (isAboveRoot, type, target) {
      var readType = $_dwtfyfx6jcun41po.readOpt(type);
      var handlers = readType(registry);
      return $_ep5wv3156jcun42va.closest(target, function (elem) {
        return findHandler(handlers, elem);
      }, isAboveRoot);
    };
    var unregisterId = function (id) {
      $_fwofm0x0jcun41o8.each(registry, function (handlersById, eventName) {
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
      return $_37h05n10mjcun424y.read(elem).fold(function () {
        return $_37h05n10mjcun424y.write('uid-', component.element());
      }, function (uid) {
        return uid;
      });
    };
    var failOnDuplicate = function (component, tagId) {
      var conflict = components[tagId];
      if (conflict === component)
        unregister(component);
      else
        throw new Error('The tagId "' + tagId + '" is already used by: ' + $_ljzuzy9jcun41to.element(conflict.element()) + '\nCannot use it for: ' + $_ljzuzy9jcun41to.element(component.element()) + '\n' + 'The conflicting element is' + ($_9kacxy7jcun41ta.inBody(conflict.element()) ? ' ' : ' not ') + 'already in the DOM');
    };
    var register = function (component) {
      var tagId = readOrTag(component);
      if ($_dwtfyfx6jcun41po.hasKey(components, tagId))
        failOnDuplicate(component, tagId);
      var extraArgs = [component];
      events.registerId(extraArgs, tagId, component.events());
      components[tagId] = component;
    };
    var unregister = function (component) {
      $_37h05n10mjcun424y.read(component.element()).each(function (tagId) {
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
      return $_dwtfyfx6jcun41po.readOpt(id)(components);
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
    var root = $_5njsek12kjcun42f5.build(Container.sketch({ dom: { tag: 'div' } }));
    return takeover(root);
  };
  var takeover = function (root) {
    var isAboveRoot = function (el) {
      return $_df5x8oy3jcun41sv.parent(root.element()).fold(function () {
        return true;
      }, function (parent) {
        return $_6hi5odw8jcun41m3.eq(el, parent);
      });
    };
    var registry = Registry();
    var lookup = function (eventName, target) {
      return registry.find(isAboveRoot, eventName, target);
    };
    var domEvents = $_2sjme150jcun42u4.setup(root.element(), {
      triggerEvent: function (eventName, event) {
        return $_b3329y8jcun41te.monitorEvent(eventName, event.target(), function (logger) {
          return $_al2q8r151jcun42ug.triggerUntilStopped(lookup, eventName, event, logger);
        });
      },
      broadcastEvent: function (eventName, event) {
        var listeners = registry.filter(eventName);
        return $_al2q8r151jcun42ug.broadcast(listeners, event);
      }
    });
    var systemApi = SystemApi({
      debugInfo: $_b4h1biwbjcun41ml.constant('real'),
      triggerEvent: function (customType, target, data) {
        $_b3329y8jcun41te.monitorEvent(customType, target, function (logger) {
          $_al2q8r151jcun42ug.triggerOnUntilStopped(lookup, customType, data, target, logger);
        });
      },
      triggerFocus: function (target, originator) {
        $_37h05n10mjcun424y.read(target).fold(function () {
          $_5qyty2ygjcun41u1.focus(target);
        }, function (_alloyId) {
          $_b3329y8jcun41te.monitorEvent($_8672kiwwjcun41o0.focus(), target, function (logger) {
            $_al2q8r151jcun42ug.triggerHandler(lookup, $_8672kiwwjcun41o0.focus(), {
              originator: $_b4h1biwbjcun41ml.constant(originator),
              target: $_b4h1biwbjcun41ml.constant(target)
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
      build: $_5njsek12kjcun42f5.build,
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
      if (!$_cbjvosxxjcun41s5.isText(component.element())) {
        registry.register(component);
        $_bjvqngw9jcun41mb.each(component.components(), addToWorld);
        systemApi.triggerEvent($_8672kiwwjcun41o0.systemInit(), component.element(), { target: $_b4h1biwbjcun41ml.constant(component.element()) });
      }
    };
    var removeFromWorld = function (component) {
      if (!$_cbjvosxxjcun41s5.isText(component.element())) {
        $_bjvqngw9jcun41mb.each(component.components(), removeFromWorld);
        registry.unregister(component);
      }
      component.disconnect();
    };
    var add = function (component) {
      $_f4d1ray1jcun41se.attach(root, component);
    };
    var remove = function (component) {
      $_f4d1ray1jcun41se.detach(component);
    };
    var destroy = function () {
      domEvents.unbind();
      $_12ttdty5jcun41t4.remove(root.element());
    };
    var broadcastData = function (data) {
      var receivers = registry.filter($_8672kiwwjcun41o0.receive());
      $_bjvqngw9jcun41mb.each(receivers, function (receiver) {
        var descHandler = receiver.descHandler();
        var handler = $_fzrvqg12vjcun42hq.getHandler(descHandler);
        handler(data);
      });
    };
    var broadcast = function (message) {
      broadcastData({
        universal: $_b4h1biwbjcun41ml.constant(true),
        data: $_b4h1biwbjcun41ml.constant(message)
      });
    };
    var broadcastOn = function (channels, message) {
      broadcastData({
        universal: $_b4h1biwbjcun41ml.constant(false),
        channels: $_b4h1biwbjcun41ml.constant(channels),
        data: $_b4h1biwbjcun41ml.constant(message)
      });
    };
    var getByUid = function (uid) {
      return registry.getById(uid).fold(function () {
        return $_8axt1mx8jcun41pw.error(new Error('Could not find component with uid: "' + uid + '" in system.'));
      }, $_8axt1mx8jcun41pw.value);
    };
    var getByDom = function (elem) {
      return $_37h05n10mjcun424y.read(elem).bind(getByUid);
    };
    addToWorld(root);
    return {
      root: $_b4h1biwbjcun41ml.constant(root),
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
  var $_bw84lh14zjcun42tn = {
    create: create$6,
    takeover: takeover
  };

  var READ_ONLY_MODE_CLASS = $_b4h1biwbjcun41ml.constant($_4tdysdz1jcun41wo.resolve('readonly-mode'));
  var EDIT_MODE_CLASS = $_b4h1biwbjcun41ml.constant($_4tdysdz1jcun41wo.resolve('edit-mode'));
  var OuterContainer = function (spec) {
    var root = $_5njsek12kjcun42f5.build(Container.sketch({
      dom: { classes: [$_4tdysdz1jcun41wo.resolve('outer-container')].concat(spec.classes) },
      containerBehaviours: $_bv6ofew4jcun41l1.derive([Swapping.config({
          alpha: READ_ONLY_MODE_CLASS(),
          omega: EDIT_MODE_CLASS()
        })])
    }));
    return $_bw84lh14zjcun42tn.takeover(root);
  };

  var AndroidRealm = function (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_4tdysdz1jcun41wo.resolve('android-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_gcub7o12ajcun42de.api();
    var switchToEdit = $_dlppy914rjcun42s6.makeEditSwitch(webapp);
    var socket = $_dlppy914rjcun42s6.makeSocket();
    var dropup = $_327o6p14sjcun42sd.build($_b4h1biwbjcun41ml.noop, scrollIntoView);
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
      webapp.set($_6mxk5n13njcun42md.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        w.exit();
        Replacing.remove(socket, switchToEdit);
      });
    };
    var updateMode = function (readOnly) {
      $_dlppy914rjcun42s6.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_b4h1biwbjcun41ml.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_b4h1biwbjcun41ml.constant(socket),
      dropup: $_b4h1biwbjcun41ml.constant(dropup)
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
      var toolbarHeight = $_6famn1zrjcun41zq.get(toolstrip);
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
    var tapping = $_ffe97x13qjcun42n3.monitor(editorApi);
    var refreshThrottle = $_d3y0wz14kjcun42r4.last(refreshView, 300);
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
      $_dvvo4c13kjcun42m1.bind(editorApi.doc(), 'touchend', function (touchEvent) {
        if ($_6hi5odw8jcun41m3.eq(editorApi.html(), touchEvent.target()) || $_6hi5odw8jcun41m3.eq(editorApi.body(), touchEvent.target())) {
        }
      }),
      $_dvvo4c13kjcun42m1.bind(toolstrip, 'transitionend', function (transitionEvent) {
        if (transitionEvent.raw().propertyName === 'height') {
          reposition();
        }
      }),
      $_dvvo4c13kjcun42m1.capture(toolstrip, 'touchstart', function (touchEvent) {
        saveSelectionFirst();
        onToolbarTouch(touchEvent);
        editorApi.onTouchToolstrip();
      }),
      $_dvvo4c13kjcun42m1.bind(editorApi.body(), 'touchstart', function (evt) {
        clearSelection();
        editorApi.onTouchContent();
        tapping.fireTouchstart(evt);
      }),
      tapping.onTouchmove(),
      tapping.onTouchend(),
      $_dvvo4c13kjcun42m1.bind(editorApi.body(), 'click', function (event) {
        event.kill();
      }),
      $_dvvo4c13kjcun42m1.bind(toolstrip, 'touchmove', function () {
        editorApi.onToolbarScrollStart();
      })
    ];
    var destroy = function () {
      $_bjvqngw9jcun41mb.each(listeners, function (l) {
        l.unbind();
      });
    };
    return { destroy: destroy };
  };
  var $_9gu7a315ajcun42w0 = { initEvents: initEvents$1 };

  var refreshInput = function (input) {
    var start = input.dom().selectionStart;
    var end = input.dom().selectionEnd;
    var dir = input.dom().selectionDirection;
    setTimeout(function () {
      input.dom().setSelectionRange(start, end, dir);
      $_5qyty2ygjcun41u1.focus(input);
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
  var $_9nr7a415ejcun42x3 = {
    refreshInput: refreshInput,
    refresh: refresh
  };

  var resume$1 = function (cWin, frame) {
    $_5qyty2ygjcun41u1.active().each(function (active) {
      if (!$_6hi5odw8jcun41m3.eq(active, frame)) {
        $_5qyty2ygjcun41u1.blur(active);
      }
    });
    cWin.focus();
    $_5qyty2ygjcun41u1.focus($_adhjdxwtjcun41nq.fromDom(cWin.document.body));
    $_9nr7a415ejcun42x3.refresh(cWin);
  };
  var $_94jc4515djcun42wy = { resume: resume$1 };

  var FakeSelection = function (win, frame) {
    var doc = win.document;
    var container = $_adhjdxwtjcun41nq.fromTag('div');
    $_f0wr0jxujcun41rx.add(container, $_4tdysdz1jcun41wo.resolve('unfocused-selections'));
    $_4hb7l2y2jcun41sm.append($_adhjdxwtjcun41nq.fromDom(doc.documentElement), container);
    var onTouch = $_dvvo4c13kjcun42m1.bind(container, 'touchstart', function (event) {
      event.prevent();
      $_94jc4515djcun42wy.resume(win, frame);
      clear();
    });
    var make = function (rectangle) {
      var span = $_adhjdxwtjcun41nq.fromTag('span');
      $_mwd8r12yjcun42ic.add(span, [
        $_4tdysdz1jcun41wo.resolve('layer-editor'),
        $_4tdysdz1jcun41wo.resolve('unfocused-selection')
      ]);
      $_ebvjd9zsjcun41zr.setAll(span, {
        left: rectangle.left() + 'px',
        top: rectangle.top() + 'px',
        width: rectangle.width() + 'px',
        height: rectangle.height() + 'px'
      });
      return span;
    };
    var update = function () {
      clear();
      var rectangles = $_3tdawo13wjcun42o1.getRectangles(win);
      var spans = $_bjvqngw9jcun41mb.map(rectangles, make);
      $_1nu7q3y6jcun41t6.append(container, spans);
    };
    var clear = function () {
      $_12ttdty5jcun41t4.empty(container);
    };
    var destroy = function () {
      onTouch.unbind();
      $_12ttdty5jcun41t4.remove(container);
    };
    var isActive = function () {
      return $_df5x8oy3jcun41sv.children(container).length > 0;
    };
    return {
      update: update,
      isActive: isActive,
      destroy: destroy,
      clear: clear
    };
  };

  var nu$9 = function (baseFn) {
    var data = $_fseuruwajcun41mi.none();
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
      data = $_fseuruwajcun41mi.some(x);
      run(callbacks);
      callbacks = [];
    };
    var isReady = function () {
      return data.isSome();
    };
    var run = function (cbs) {
      $_bjvqngw9jcun41mb.each(cbs, call);
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
  var $_3ut73y15hjcun42xf = {
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
  var $_am10c115ijcun42xh = { bounce: bounce };

  var nu$8 = function (baseFn) {
    var get = function (callback) {
      baseFn($_am10c115ijcun42xh.bounce(callback));
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
      return $_3ut73y15hjcun42xf.nu(get);
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
  var $_3de4ca15gjcun42xe = {
    nu: nu$8,
    pure: pure$1
  };

  var adjust = function (value, destination, amount) {
    if (Math.abs(value - destination) <= amount) {
      return $_fseuruwajcun41mi.none();
    } else if (value < destination) {
      return $_fseuruwajcun41mi.some(value + amount);
    } else {
      return $_fseuruwajcun41mi.some(value - amount);
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
  var $_cy7nm115jjcun42xj = {
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
    return $_2kprlnyejcun41ty.findMap(devices, function (device) {
      return deviceWidth <= device.width && deviceHeight <= device.height ? $_fseuruwajcun41mi.some(device.keyboard) : $_fseuruwajcun41mi.none();
    }).getOr({
      portrait: deviceHeight / 5,
      landscape: deviceWidth / 4
    });
  };
  var $_fhv58l15mjcun42y3 = { findDevice: findDevice };

  var softKeyboardLimits = function (outerWindow) {
    return $_fhv58l15mjcun42y3.findDevice(outerWindow.screen.width, outerWindow.screen.height);
  };
  var accountableKeyboardHeight = function (outerWindow) {
    var portrait = $_5icuhy13jjcun42lw.get(outerWindow).isPortrait();
    var limits = softKeyboardLimits(outerWindow);
    var keyboard = portrait ? limits.portrait : limits.landscape;
    var visualScreenHeight = portrait ? outerWindow.screen.height : outerWindow.screen.width;
    return visualScreenHeight - outerWindow.innerHeight > keyboard ? 0 : keyboard;
  };
  var getGreenzone = function (socket, dropup) {
    var outerWindow = $_df5x8oy3jcun41sv.owner(socket).dom().defaultView;
    var viewportHeight = $_6famn1zrjcun41zq.get(socket) + $_6famn1zrjcun41zq.get(dropup);
    var acc = accountableKeyboardHeight(outerWindow);
    return viewportHeight - acc;
  };
  var updatePadding = function (contentBody, socket, dropup) {
    var greenzoneHeight = getGreenzone(socket, dropup);
    var deltaHeight = $_6famn1zrjcun41zq.get(socket) + $_6famn1zrjcun41zq.get(dropup) - greenzoneHeight;
    $_ebvjd9zsjcun41zr.set(contentBody, 'padding-bottom', deltaHeight + 'px');
  };
  var $_19511u15ljcun42xz = {
    getGreenzone: getGreenzone,
    updatePadding: updatePadding
  };

  var fixture = $_f19awjx4jcun41p6.generate([
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
  var yFixedData = 'data-' + $_4tdysdz1jcun41wo.resolve('position-y-fixed');
  var yFixedProperty = 'data-' + $_4tdysdz1jcun41wo.resolve('y-property');
  var yScrollingData = 'data-' + $_4tdysdz1jcun41wo.resolve('scrolling');
  var windowSizeData = 'data-' + $_4tdysdz1jcun41wo.resolve('last-window-height');
  var getYFixedData = function (element) {
    return $_5rse2g13vjcun42nz.safeParse(element, yFixedData);
  };
  var getYFixedProperty = function (element) {
    return $_f8g4i8xwjcun41s0.get(element, yFixedProperty);
  };
  var getLastWindowSize = function (element) {
    return $_5rse2g13vjcun42nz.safeParse(element, windowSizeData);
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
    var classifier = $_f8g4i8xwjcun41s0.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
    return classifier(element, offsetY);
  };
  var findFixtures = function (container) {
    var candidates = $_3299iyzkjcun41yx.descendants(container, '[' + yFixedData + ']');
    return $_bjvqngw9jcun41mb.map(candidates, classify);
  };
  var takeoverToolbar = function (toolbar) {
    var oldToolbarStyle = $_f8g4i8xwjcun41s0.get(toolbar, 'style');
    $_ebvjd9zsjcun41zr.setAll(toolbar, {
      position: 'absolute',
      top: '0px'
    });
    $_f8g4i8xwjcun41s0.set(toolbar, yFixedData, '0px');
    $_f8g4i8xwjcun41s0.set(toolbar, yFixedProperty, 'top');
    var restore = function () {
      $_f8g4i8xwjcun41s0.set(toolbar, 'style', oldToolbarStyle || '');
      $_f8g4i8xwjcun41s0.remove(toolbar, yFixedData);
      $_f8g4i8xwjcun41s0.remove(toolbar, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverViewport = function (toolbarHeight, height, viewport) {
    var oldViewportStyle = $_f8g4i8xwjcun41s0.get(viewport, 'style');
    $_8cu4ie13hjcun42lo.register(viewport);
    $_ebvjd9zsjcun41zr.setAll(viewport, {
      position: 'absolute',
      height: height + 'px',
      width: '100%',
      top: toolbarHeight + 'px'
    });
    $_f8g4i8xwjcun41s0.set(viewport, yFixedData, toolbarHeight + 'px');
    $_f8g4i8xwjcun41s0.set(viewport, yScrollingData, 'true');
    $_f8g4i8xwjcun41s0.set(viewport, yFixedProperty, 'top');
    var restore = function () {
      $_8cu4ie13hjcun42lo.deregister(viewport);
      $_f8g4i8xwjcun41s0.set(viewport, 'style', oldViewportStyle || '');
      $_f8g4i8xwjcun41s0.remove(viewport, yFixedData);
      $_f8g4i8xwjcun41s0.remove(viewport, yScrollingData);
      $_f8g4i8xwjcun41s0.remove(viewport, yFixedProperty);
    };
    return { restore: restore };
  };
  var takeoverDropup = function (dropup, toolbarHeight, viewportHeight) {
    var oldDropupStyle = $_f8g4i8xwjcun41s0.get(dropup, 'style');
    $_ebvjd9zsjcun41zr.setAll(dropup, {
      position: 'absolute',
      bottom: '0px'
    });
    $_f8g4i8xwjcun41s0.set(dropup, yFixedData, '0px');
    $_f8g4i8xwjcun41s0.set(dropup, yFixedProperty, 'bottom');
    var restore = function () {
      $_f8g4i8xwjcun41s0.set(dropup, 'style', oldDropupStyle || '');
      $_f8g4i8xwjcun41s0.remove(dropup, yFixedData);
      $_f8g4i8xwjcun41s0.remove(dropup, yFixedProperty);
    };
    return { restore: restore };
  };
  var deriveViewportHeight = function (viewport, toolbarHeight, dropupHeight) {
    var outerWindow = $_df5x8oy3jcun41sv.owner(viewport).dom().defaultView;
    var winH = outerWindow.innerHeight;
    $_f8g4i8xwjcun41s0.set(viewport, windowSizeData, winH + 'px');
    return winH - toolbarHeight - dropupHeight;
  };
  var takeover$1 = function (viewport, contentBody, toolbar, dropup) {
    var outerWindow = $_df5x8oy3jcun41sv.owner(viewport).dom().defaultView;
    var toolbarSetup = takeoverToolbar(toolbar);
    var toolbarHeight = $_6famn1zrjcun41zq.get(toolbar);
    var dropupHeight = $_6famn1zrjcun41zq.get(dropup);
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
        var newToolbarHeight = $_6famn1zrjcun41zq.get(toolbar);
        var dropupHeight_1 = $_6famn1zrjcun41zq.get(dropup);
        var newHeight = deriveViewportHeight(viewport, newToolbarHeight, dropupHeight_1);
        $_f8g4i8xwjcun41s0.set(viewport, yFixedData, newToolbarHeight + 'px');
        $_ebvjd9zsjcun41zr.set(viewport, 'height', newHeight + 'px');
        $_ebvjd9zsjcun41zr.set(dropup, 'bottom', -(newToolbarHeight + newHeight + dropupHeight_1) + 'px');
        $_19511u15ljcun42xz.updatePadding(contentBody, viewport, dropup);
      }
    };
    var setViewportOffset = function (newYOffset) {
      var offsetPx = newYOffset + 'px';
      $_f8g4i8xwjcun41s0.set(viewport, yFixedData, offsetPx);
      refresh();
    };
    $_19511u15ljcun42xz.updatePadding(contentBody, viewport, dropup);
    return {
      setViewportOffset: setViewportOffset,
      isExpanding: isExpanding,
      isShrinking: $_b4h1biwbjcun41ml.not(isExpanding),
      refresh: refresh,
      restore: restore
    };
  };
  var $_5nwtk915kjcun42xn = {
    findFixtures: findFixtures,
    takeover: takeover$1,
    getYFixedData: getYFixedData
  };

  var animator = $_cy7nm115jjcun42xj.create();
  var ANIMATION_STEP = 15;
  var NUM_TOP_ANIMATION_FRAMES = 10;
  var ANIMATION_RATE = 10;
  var lastScroll = 'data-' + $_4tdysdz1jcun41wo.resolve('last-scroll-top');
  var getTop = function (element) {
    var raw = $_ebvjd9zsjcun41zr.getRaw(element, 'top').getOr(0);
    return parseInt(raw, 10);
  };
  var getScrollTop = function (element) {
    return parseInt(element.dom().scrollTop, 10);
  };
  var moveScrollAndTop = function (element, destination, finalTop) {
    return $_3de4ca15gjcun42xe.nu(function (callback) {
      var getCurrent = $_b4h1biwbjcun41ml.curry(getScrollTop, element);
      var update = function (newScroll) {
        element.dom().scrollTop = newScroll;
        $_ebvjd9zsjcun41zr.set(element, 'top', getTop(element) + ANIMATION_STEP + 'px');
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_ebvjd9zsjcun41zr.set(element, 'top', finalTop + 'px');
        callback(destination);
      };
      animator.animate(getCurrent, destination, ANIMATION_STEP, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyScroll = function (element, destination) {
    return $_3de4ca15gjcun42xe.nu(function (callback) {
      var getCurrent = $_b4h1biwbjcun41ml.curry(getScrollTop, element);
      $_f8g4i8xwjcun41s0.set(element, lastScroll, getCurrent());
      var update = function (newScroll, abort) {
        var previous = $_5rse2g13vjcun42nz.safeParse(element, lastScroll);
        if (previous !== element.dom().scrollTop) {
          abort(element.dom().scrollTop);
        } else {
          element.dom().scrollTop = newScroll;
          $_f8g4i8xwjcun41s0.set(element, lastScroll, newScroll);
        }
      };
      var finish = function () {
        element.dom().scrollTop = destination;
        $_f8g4i8xwjcun41s0.set(element, lastScroll, destination);
        callback(destination);
      };
      var distance = Math.abs(destination - getCurrent());
      var step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
      animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
    });
  };
  var moveOnlyTop = function (element, destination) {
    return $_3de4ca15gjcun42xe.nu(function (callback) {
      var getCurrent = $_b4h1biwbjcun41ml.curry(getTop, element);
      var update = function (newTop) {
        $_ebvjd9zsjcun41zr.set(element, 'top', newTop + 'px');
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
    var newTop = amount + $_5nwtk915kjcun42xn.getYFixedData(element) + 'px';
    $_ebvjd9zsjcun41zr.set(element, 'top', newTop);
  };
  var moveWindowScroll = function (toolbar, viewport, destY) {
    var outerWindow = $_df5x8oy3jcun41sv.owner(toolbar).dom().defaultView;
    return $_3de4ca15gjcun42xe.nu(function (callback) {
      updateTop(toolbar, destY);
      updateTop(viewport, destY);
      outerWindow.scrollTo(0, destY);
      callback(destY);
    });
  };
  var $_8aikuf15fjcun42x6 = {
    moveScrollAndTop: moveScrollAndTop,
    moveOnlyScroll: moveOnlyScroll,
    moveOnlyTop: moveOnlyTop,
    moveWindowScroll: moveWindowScroll
  };

  var BackgroundActivity = function (doAction) {
    var action = Cell($_3ut73y15hjcun42xf.pure({}));
    var start = function (value) {
      var future = $_3ut73y15hjcun42xf.nu(function (callback) {
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
    var greenzone = $_19511u15ljcun42xz.getGreenzone(socket, dropup);
    var refreshCursor = $_b4h1biwbjcun41ml.curry($_9nr7a415ejcun42x3.refresh, cWin);
    if (top > greenzone || bottom > greenzone) {
      $_8aikuf15fjcun42x6.moveOnlyScroll(socket, socket.dom().scrollTop - greenzone + bottom).get(refreshCursor);
    } else if (top < 0) {
      $_8aikuf15fjcun42x6.moveOnlyScroll(socket, socket.dom().scrollTop + top).get(refreshCursor);
    } else {
    }
  };
  var $_7imk8l15ojcun42yb = { scrollIntoView: scrollIntoView };

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
        $_bjvqngw9jcun41mb.each(asyncValues, function (asyncValue, i) {
          asyncValue.get(cb(i));
        });
      }
    });
  };
  var $_acqwae15rjcun42yn = { par: par$1 };

  var par = function (futures) {
    return $_acqwae15rjcun42yn.par(futures, $_3de4ca15gjcun42xe.nu);
  };
  var mapM = function (array, fn) {
    var futures = $_bjvqngw9jcun41mb.map(array, fn);
    return par(futures);
  };
  var compose$1 = function (f, g) {
    return function (a) {
      return g(a).bind(f);
    };
  };
  var $_feeo2p15qjcun42yl = {
    par: par,
    mapM: mapM,
    compose: compose$1
  };

  var updateFixed = function (element, property, winY, offsetY) {
    var destination = winY + offsetY;
    $_ebvjd9zsjcun41zr.set(element, property, destination + 'px');
    return $_3de4ca15gjcun42xe.pure(offsetY);
  };
  var updateScrollingFixed = function (element, winY, offsetY) {
    var destTop = winY + offsetY;
    var oldProp = $_ebvjd9zsjcun41zr.getRaw(element, 'top').getOr(offsetY);
    var delta = destTop - parseInt(oldProp, 10);
    var destScroll = element.dom().scrollTop + delta;
    return $_8aikuf15fjcun42x6.moveScrollAndTop(element, destScroll, destTop);
  };
  var updateFixture = function (fixture, winY) {
    return fixture.fold(function (element, property, offsetY) {
      return updateFixed(element, property, winY, offsetY);
    }, function (element, offsetY) {
      return updateScrollingFixed(element, winY, offsetY);
    });
  };
  var updatePositions = function (container, winY) {
    var fixtures = $_5nwtk915kjcun42xn.findFixtures(container);
    var updates = $_bjvqngw9jcun41mb.map(fixtures, function (fixture) {
      return updateFixture(fixture, winY);
    });
    return $_feeo2p15qjcun42yl.par(updates);
  };
  var $_amkqci15pjcun42yf = { updatePositions: updatePositions };

  var input = function (parent, operation) {
    var input = $_adhjdxwtjcun41nq.fromTag('input');
    $_ebvjd9zsjcun41zr.setAll(input, {
      opacity: '0',
      position: 'absolute',
      top: '-1000px',
      left: '-1000px'
    });
    $_4hb7l2y2jcun41sm.append(parent, input);
    $_5qyty2ygjcun41u1.focus(input);
    operation(input);
    $_12ttdty5jcun41t4.remove(input);
  };
  var $_6na55h15sjcun42yp = { input: input };

  var VIEW_MARGIN = 5;
  var register$2 = function (toolstrip, socket, container, outerWindow, structure, cWin) {
    var scroller = BackgroundActivity(function (y) {
      return $_8aikuf15fjcun42x6.moveWindowScroll(toolstrip, socket, y);
    });
    var scrollBounds = function () {
      var rects = $_3tdawo13wjcun42o1.getRectangles(cWin);
      return $_fseuruwajcun41mi.from(rects[0]).bind(function (rect) {
        var viewTop = rect.top() - socket.dom().scrollTop;
        var outside = viewTop > outerWindow.innerHeight + VIEW_MARGIN || viewTop < -VIEW_MARGIN;
        return outside ? $_fseuruwajcun41mi.some({
          top: $_b4h1biwbjcun41ml.constant(viewTop),
          bottom: $_b4h1biwbjcun41ml.constant(viewTop + rect.height())
        }) : $_fseuruwajcun41mi.none();
      });
    };
    var scrollThrottle = $_d3y0wz14kjcun42r4.last(function () {
      scroller.idle(function () {
        $_amkqci15pjcun42yf.updatePositions(container, outerWindow.pageYOffset).get(function () {
          var extraScroll = scrollBounds();
          extraScroll.each(function (extra) {
            socket.dom().scrollTop = socket.dom().scrollTop + extra.top();
          });
          scroller.start(0);
          structure.refresh();
        });
      });
    }, 1000);
    var onScroll = $_dvvo4c13kjcun42m1.bind($_adhjdxwtjcun41nq.fromDom(outerWindow), 'scroll', function () {
      if (outerWindow.pageYOffset < 0) {
        return;
      }
      scrollThrottle.throttle();
    });
    $_amkqci15pjcun42yf.updatePositions(container, outerWindow.pageYOffset).get($_b4h1biwbjcun41ml.identity);
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
    var structure = $_5nwtk915kjcun42xn.takeover(socket, ceBody, toolstrip, dropup);
    var keyboardModel = keyboardType(bag.outerBody(), cWin, $_9kacxy7jcun41ta.body(), contentElement, toolstrip, toolbar);
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
    var onOrientation = $_5icuhy13jjcun42lw.onChange(outerWindow, {
      onChange: $_b4h1biwbjcun41ml.noop,
      onReady: structure.refresh
    });
    onOrientation.onAdjustment(function () {
      structure.refresh();
    });
    var onResize = $_dvvo4c13kjcun42m1.bind($_adhjdxwtjcun41nq.fromDom(outerWindow), 'resize', function () {
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
      $_7imk8l15ojcun42yb.scrollIntoView(cWin, socket, dropup, top, bottom);
    };
    var syncHeight = function () {
      $_ebvjd9zsjcun41zr.set(contentElement, 'height', contentElement.dom().contentWindow.document.body.scrollHeight + 'px');
    };
    var setViewportOffset = function (newYOffset) {
      structure.setViewportOffset(newYOffset);
      $_8aikuf15fjcun42x6.moveOnlyTop(socket, newYOffset).get($_b4h1biwbjcun41ml.identity);
    };
    var destroy = function () {
      structure.restore();
      onOrientation.destroy();
      onScroll.unbind();
      onResize.unbind();
      keyboardModel.destroy();
      unfocusedSelection.destroy();
      $_6na55h15sjcun42yp.input($_9kacxy7jcun41ta.body(), $_5qyty2ygjcun41u1.blur);
    };
    return {
      toEditing: toEditing,
      toReading: toReading,
      onToolbarTouch: onToolbarTouch,
      refreshSelection: refreshSelection,
      clearSelection: clearSelection,
      highlightSelection: highlightSelection,
      scrollIntoView: scrollIntoView,
      updateToolbarPadding: $_b4h1biwbjcun41ml.noop,
      setViewportOffset: setViewportOffset,
      syncHeight: syncHeight,
      refreshStructure: structure.refresh,
      destroy: destroy
    };
  };
  var $_ajks0m15bjcun42w7 = { setup: setup$3 };

  var stubborn = function (outerBody, cWin, page, frame) {
    var toEditing = function () {
      $_94jc4515djcun42wy.resume(cWin, frame);
    };
    var toReading = function () {
      $_6na55h15sjcun42yp.input(outerBody, $_5qyty2ygjcun41u1.blur);
    };
    var captureInput = $_dvvo4c13kjcun42m1.bind(page, 'keydown', function (evt) {
      if (!$_bjvqngw9jcun41mb.contains([
          'input',
          'textarea'
        ], $_cbjvosxxjcun41s5.name(evt.target()))) {
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
      $_5qyty2ygjcun41u1.blur(frame);
    };
    var onToolbarTouch = function () {
      dismissKeyboard();
    };
    var toReading = function () {
      dismissKeyboard();
    };
    var toEditing = function () {
      $_94jc4515djcun42wy.resume(cWin, frame);
    };
    return {
      toReading: toReading,
      toEditing: toEditing,
      onToolbarTouch: onToolbarTouch,
      destroy: $_b4h1biwbjcun41ml.noop
    };
  };
  var $_d2akrj15tjcun42yv = {
    stubborn: stubborn,
    timid: timid
  };

  var create$7 = function (platform, mask) {
    var meta = $_411vb014hjcun42qg.tag();
    var priorState = $_gcub7o12ajcun42de.value();
    var scrollEvents = $_gcub7o12ajcun42de.value();
    var iosApi = $_gcub7o12ajcun42de.api();
    var iosEvents = $_gcub7o12ajcun42de.api();
    var enter = function () {
      mask.hide();
      var doc = $_adhjdxwtjcun41nq.fromDom(document);
      $_9adm1w14fjcun42q0.getActiveApi(platform.editor).each(function (editorApi) {
        priorState.set({
          socketHeight: $_ebvjd9zsjcun41zr.getRaw(platform.socket, 'height'),
          iframeHeight: $_ebvjd9zsjcun41zr.getRaw(editorApi.frame(), 'height'),
          outerScroll: document.body.scrollTop
        });
        scrollEvents.set({ exclusives: $_f4taln14qjcun42s1.exclusive(doc, '.' + $_8cu4ie13hjcun42lo.scrollable()) });
        $_f0wr0jxujcun41rx.add(platform.container, $_4tdysdz1jcun41wo.resolve('fullscreen-maximized'));
        $_6j0y4g14gjcun42q9.clobberStyles(platform.container, editorApi.body());
        meta.maximize();
        $_ebvjd9zsjcun41zr.set(platform.socket, 'overflow', 'scroll');
        $_ebvjd9zsjcun41zr.set(platform.socket, '-webkit-overflow-scrolling', 'touch');
        $_5qyty2ygjcun41u1.focus(editorApi.body());
        var setupBag = $_36fc2ixmjcun41ri.immutableBag([
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
        iosApi.set($_ajks0m15bjcun42w7.setup(setupBag({
          cWin: editorApi.win(),
          ceBody: editorApi.body(),
          socket: platform.socket,
          toolstrip: platform.toolstrip,
          toolbar: platform.toolbar,
          dropup: platform.dropup.element(),
          contentElement: editorApi.frame(),
          cursor: $_b4h1biwbjcun41ml.noop,
          outerBody: platform.body,
          outerWindow: platform.win,
          keyboardType: $_d2akrj15tjcun42yv.stubborn,
          isScrolling: function () {
            return scrollEvents.get().exists(function (s) {
              return s.socket.isScrolling();
            });
          }
        })));
        iosApi.run(function (api) {
          api.syncHeight();
        });
        iosEvents.set($_9gu7a315ajcun42w0.initEvents(editorApi, iosApi, platform.toolstrip, platform.socket, platform.dropup));
      });
    };
    var exit = function () {
      meta.restore();
      iosEvents.clear();
      iosApi.clear();
      mask.show();
      priorState.on(function (s) {
        s.socketHeight.each(function (h) {
          $_ebvjd9zsjcun41zr.set(platform.socket, 'height', h);
        });
        s.iframeHeight.each(function (h) {
          $_ebvjd9zsjcun41zr.set(platform.editor.getFrame(), 'height', h);
        });
        document.body.scrollTop = s.scrollTop;
      });
      priorState.clear();
      scrollEvents.on(function (s) {
        s.exclusives.unbind();
      });
      scrollEvents.clear();
      $_f0wr0jxujcun41rx.remove(platform.container, $_4tdysdz1jcun41wo.resolve('fullscreen-maximized'));
      $_6j0y4g14gjcun42q9.restoreStyles();
      $_8cu4ie13hjcun42lo.deregister(platform.toolbar);
      $_ebvjd9zsjcun41zr.remove(platform.socket, 'overflow');
      $_ebvjd9zsjcun41zr.remove(platform.socket, '-webkit-overflow-scrolling');
      $_5qyty2ygjcun41u1.blur(platform.editor.getFrame());
      $_9adm1w14fjcun42q0.getActiveApi(platform.editor).each(function (editorApi) {
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
  var $_avnrce159jcun42vr = { create: create$7 };

  var produce$1 = function (raw) {
    var mobile = $_a6j4ohxhjcun41qn.asRawOrDie('Getting IosWebapp schema', MobileSchema, raw);
    $_ebvjd9zsjcun41zr.set(mobile.toolstrip, 'width', '100%');
    $_ebvjd9zsjcun41zr.set(mobile.container, 'position', 'relative');
    var onView = function () {
      mobile.setReadOnly(true);
      mode.enter();
    };
    var mask = $_5njsek12kjcun42f5.build($_dapweb14jjcun42qx.sketch(onView, mobile.translate));
    mobile.alloy.add(mask);
    var maskApi = {
      show: function () {
        mobile.alloy.add(mask);
      },
      hide: function () {
        mobile.alloy.remove(mask);
      }
    };
    var mode = $_avnrce159jcun42vr.create(mobile, maskApi);
    return {
      setReadOnly: mobile.setReadOnly,
      refreshStructure: mode.refreshStructure,
      enter: mode.enter,
      exit: mode.exit,
      destroy: $_b4h1biwbjcun41ml.noop
    };
  };
  var $_ab39tl158jcun42vm = { produce: produce$1 };

  var IosRealm = function (scrollIntoView) {
    var alloy = OuterContainer({ classes: [$_4tdysdz1jcun41wo.resolve('ios-container')] });
    var toolbar = ScrollingToolbar();
    var webapp = $_gcub7o12ajcun42de.api();
    var switchToEdit = $_dlppy914rjcun42s6.makeEditSwitch(webapp);
    var socket = $_dlppy914rjcun42s6.makeSocket();
    var dropup = $_327o6p14sjcun42sd.build(function () {
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
      webapp.set($_ab39tl158jcun42vm.produce(spec));
    };
    var exit = function () {
      webapp.run(function (w) {
        Replacing.remove(socket, switchToEdit);
        w.exit();
      });
    };
    var updateMode = function (readOnly) {
      $_dlppy914rjcun42s6.updateMode(socket, switchToEdit, readOnly, alloy.root());
    };
    return {
      system: $_b4h1biwbjcun41ml.constant(alloy),
      element: alloy.element,
      init: init,
      exit: exit,
      setToolbarGroups: setToolbarGroups,
      setContextToolbar: setContextToolbar,
      focusToolbar: focusToolbar,
      restoreToolbar: restoreToolbar,
      updateMode: updateMode,
      socket: $_b4h1biwbjcun41ml.constant(socket),
      dropup: $_b4h1biwbjcun41ml.constant(dropup)
    };
  };

  var EditorManager = tinymce.util.Tools.resolve('tinymce.EditorManager');

  var derive$4 = function (editor) {
    var base = $_dwtfyfx6jcun41po.readOptFrom(editor.settings, 'skin_url').fold(function () {
      return EditorManager.baseURL + '/skins/' + 'lightgray';
    }, function (url) {
      return url;
    });
    return {
      content: base + '/content.mobile.min.css',
      ui: base + '/skin.mobile.min.css'
    };
  };
  var $_deo3uh15ujcun42z8 = { derive: derive$4 };

  var fontSizes = [
    'x-small',
    'small',
    'medium',
    'large',
    'x-large'
  ];
  var fireChange$1 = function (realm, command, state) {
    realm.system().broadcastOn([$_3wqehtyojcun41ul.formatChanged()], {
      command: command,
      state: state
    });
  };
  var init$5 = function (realm, editor) {
    var allFormats = $_fwofm0x0jcun41o8.keys(editor.formatter.get());
    $_bjvqngw9jcun41mb.each(allFormats, function (command) {
      editor.formatter.formatChanged(command, function (state) {
        fireChange$1(realm, command, state);
      });
    });
    $_bjvqngw9jcun41mb.each([
      'ul',
      'ol'
    ], function (command) {
      editor.selection.selectorChanged(command, function (state, data) {
        fireChange$1(realm, command, state);
      });
    });
  };
  var $_tk4gp15wjcun42zb = {
    init: init$5,
    fontSizes: $_b4h1biwbjcun41ml.constant(fontSizes)
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
  var $_ezmyfb15xjcun42ze = { fireSkinLoaded: fireSkinLoaded };

  var READING = $_b4h1biwbjcun41ml.constant('toReading');
  var EDITING = $_b4h1biwbjcun41ml.constant('toEditing');
  ThemeManager.add('mobile', function (editor) {
    var renderUI = function (args) {
      var cssUrls = $_deo3uh15ujcun42z8.derive(editor);
      if ($_5w9w0cynjcun41uk.isSkinDisabled(editor) === false) {
        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, $_ezmyfb15xjcun42ze.fireSkinLoaded(editor));
      } else {
        $_ezmyfb15xjcun42ze.fireSkinLoaded(editor)();
      }
      var doScrollIntoView = function () {
        editor.fire('scrollIntoView');
      };
      var wrapper = $_adhjdxwtjcun41nq.fromTag('div');
      var realm = $_2lzqzhwgjcun41mu.detect().os.isAndroid() ? AndroidRealm(doScrollIntoView) : IosRealm(doScrollIntoView);
      var original = $_adhjdxwtjcun41nq.fromDom(args.targetNode);
      $_4hb7l2y2jcun41sm.after(original, wrapper);
      $_f4d1ray1jcun41se.attachSystem(wrapper, realm.system());
      var findFocusIn = function (elem) {
        return $_5qyty2ygjcun41u1.search(elem).bind(function (focused) {
          return realm.system().getByDom(focused).toOption();
        });
      };
      var outerWindow = args.targetNode.ownerDocument.defaultView;
      var orientation = $_5icuhy13jjcun42lw.onChange(outerWindow, {
        onChange: function () {
          var alloy = realm.system();
          alloy.broadcastOn([$_3wqehtyojcun41ul.orientationChanged()], { width: $_5icuhy13jjcun42lw.getActualWidth(outerWindow) });
        },
        onReady: $_b4h1biwbjcun41ml.noop
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
              return $_adhjdxwtjcun41nq.fromDom(editor.contentAreaContainer.querySelector('iframe'));
            },
            onDomChanged: function () {
              return { unbind: $_b4h1biwbjcun41ml.noop };
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
              var toolbar = $_adhjdxwtjcun41nq.fromDom(editor.editorContainer.querySelector('.' + $_4tdysdz1jcun41wo.resolve('toolbar')));
              findFocusIn(toolbar).each($_ebat3swvjcun41nv.emitExecute);
              realm.restoreToolbar();
              hideDropup();
            },
            onTapContent: function (evt) {
              var target = evt.target();
              if ($_cbjvosxxjcun41s5.name(target) === 'img') {
                editor.selection.select(target.dom());
                evt.kill();
              } else if ($_cbjvosxxjcun41s5.name(target) === 'a') {
                var component = realm.system().getByDom($_adhjdxwtjcun41nq.fromDom(editor.editorContainer));
                component.each(function (container) {
                  if (Swapping.isAlpha(container)) {
                    $_3s5q3fymjcun41uj.openLink(target.dom());
                  }
                });
              }
            }
          },
          container: $_adhjdxwtjcun41nq.fromDom(editor.editorContainer),
          socket: $_adhjdxwtjcun41nq.fromDom(editor.contentAreaContainer),
          toolstrip: $_adhjdxwtjcun41nq.fromDom(editor.editorContainer.querySelector('.' + $_4tdysdz1jcun41wo.resolve('toolstrip'))),
          toolbar: $_adhjdxwtjcun41nq.fromDom(editor.editorContainer.querySelector('.' + $_4tdysdz1jcun41wo.resolve('toolbar'))),
          dropup: realm.dropup(),
          alloy: realm.system(),
          translate: $_b4h1biwbjcun41ml.noop,
          setReadOnly: function (ro) {
            setReadOnly(readOnlyGroups, mainGroups, ro);
          }
        });
        var hideDropup = function () {
          realm.dropup().disappear(function () {
            realm.system().broadcastOn([$_3wqehtyojcun41ul.dropupDismissed()], {});
          });
        };
        $_b3329y8jcun41te.registerInspector('remove this', realm.system());
        var backToMaskGroup = {
          label: 'The first group',
          scrollable: false,
          items: [$_62zzquz2jcun41wq.forToolbar('back', function () {
              editor.selection.collapse();
              realm.exit();
            }, {})]
        };
        var backToReadOnlyGroup = {
          label: 'Back to read only',
          scrollable: false,
          items: [$_62zzquz2jcun41wq.forToolbar('readonly-back', function () {
              setReadOnly(readOnlyGroups, mainGroups, true);
            }, {})]
        };
        var readOnlyGroup = {
          label: 'The read only mode group',
          scrollable: true,
          items: []
        };
        var features = $_4fkzpmypjcun41uo.setup(realm, editor);
        var items = $_4fkzpmypjcun41uo.detect(editor.settings, features);
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
        $_tk4gp15wjcun42zb.init(realm, editor);
      });
      return {
        iframeContainer: realm.socket().element().dom(),
        editorContainer: realm.element().dom()
      };
    };
    return {
      getNotificationManagerImpl: function () {
        return {
          open: $_b4h1biwbjcun41ml.identity,
          close: $_b4h1biwbjcun41ml.noop,
          reposition: $_b4h1biwbjcun41ml.noop,
          getArgs: $_b4h1biwbjcun41ml.identity
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
