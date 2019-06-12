  // CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
	  mod(require("../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
	  define(["../lib/codemirror"], mod);
	else // Plain browser env
	  mod(CodeMirror);
  })(function(CodeMirror) {
	"use strict";

	CodeMirror.modeInfo = [
	  {name: "APL", mime: "text/apl", mode: "apl", ext: ["dyalog", "apl"]},
	  {name: "PGP", mimes: ["application/pgp", "application/pgp-encrypted", "application/pgp-keys", "application/pgp-signature"], mode: "asciiarmor", ext: ["asc", "pgp", "sig"]},
	  {name: "ASN.1", mime: "text/x-ttcn-asn", mode: "asn.1", ext: ["asn", "asn1"]},
	  {name: "Asterisk", mime: "text/x-asterisk", mode: "asterisk", file: /^extensions\.conf$/i},
	  {name: "Brainfuck", mime: "text/x-brainfuck", mode: "brainfuck", ext: ["b", "bf"]},
	  {name: "C", mime: "text/x-csrc", mode: "clike", ext: ["c", "h"]},
	  {name: "C++", mime: "text/x-c++src", mode: "clike", ext: ["cpp", "c++", "cc", "cxx", "hpp", "h++", "hh", "hxx"], alias: ["cpp"]},
	  {name: "Cobol", mime: "text/x-cobol", mode: "cobol", ext: ["cob", "cpy"]},
	  {name: "C#", mime: "text/x-csharp", mode: "clike", ext: ["cs"], alias: ["csharp"]},
	  {name: "Clojure", mime: "text/x-clojure", mode: "clojure", ext: ["clj", "cljc", "cljx"]},
	  {name: "ClojureScript", mime: "text/x-clojurescript", mode: "clojure", ext: ["cljs"]},
	  {name: "Closure Stylesheets (GSS)", mime: "text/x-gss", mode: "css", ext: ["gss"]},
	  {name: "CMake", mime: "text/x-cmake", mode: "cmake", ext: ["cmake", "cmake.in"], file: /^CMakeLists.txt$/},
	  {name: "CoffeeScript", mimes: ["application/vnd.coffeescript", "text/coffeescript", "text/x-coffeescript"], mode: "coffeescript", ext: ["coffee"], alias: ["coffee", "coffee-script"]},
	  {name: "Common Lisp", mime: "text/x-common-lisp", mode: "commonlisp", ext: ["cl", "lisp", "el"], alias: ["lisp"]},
	  {name: "Cypher", mime: "application/x-cypher-query", mode: "cypher", ext: ["cyp", "cypher"]},
	  {name: "Cython", mime: "text/x-cython", mode: "python", ext: ["pyx", "pxd", "pxi"]},
	  {name: "Crystal", mime: "text/x-crystal", mode: "crystal", ext: ["cr"]},
	  {name: "CSS", mime: "text/css", mode: "css", ext: ["css"]},
	  {name: "CQL", mime: "text/x-cassandra", mode: "sql", ext: ["cql"]},
	  {name: "D", mime: "text/x-d", mode: "d", ext: ["d"]},
	  {name: "Dart", mimes: ["application/dart", "text/x-dart"], mode: "dart", ext: ["dart"]},
	  {name: "diff", mime: "text/x-diff", mode: "diff", ext: ["diff", "patch"]},
	  {name: "Django", mime: "text/x-django", mode: "django"},
	  {name: "Dockerfile", mime: "text/x-dockerfile", mode: "dockerfile", file: /^Dockerfile$/},
	  {name: "DTD", mime: "application/xml-dtd", mode: "dtd", ext: ["dtd"]},
	  {name: "Dylan", mime: "text/x-dylan", mode: "dylan", ext: ["dylan", "dyl", "intr"]},
	  {name: "EBNF", mime: "text/x-ebnf", mode: "ebnf"},
	  {name: "ECL", mime: "text/x-ecl", mode: "ecl", ext: ["ecl"]},
	  {name: "edn", mime: "application/edn", mode: "clojure", ext: ["edn"]},
	  {name: "Eiffel", mime: "text/x-eiffel", mode: "eiffel", ext: ["e"]},
	  {name: "Elm", mime: "text/x-elm", mode: "elm", ext: ["elm"]},
	  {name: "Embedded Javascript", mime: "application/x-ejs", mode: "htmlembedded", ext: ["ejs"]},
	  {name: "Embedded Ruby", mime: "application/x-erb", mode: "htmlembedded", ext: ["erb"]},
	  {name: "Erlang", mime: "text/x-erlang", mode: "erlang", ext: ["erl"]},
	  {name: "Esper", mime: "text/x-esper", mode: "sql"},
	  {name: "Factor", mime: "text/x-factor", mode: "factor", ext: ["factor"]},
	  {name: "FCL", mime: "text/x-fcl", mode: "fcl"},
	  {name: "Forth", mime: "text/x-forth", mode: "forth", ext: ["forth", "fth", "4th"]},
	  {name: "Fortran", mime: "text/x-fortran", mode: "fortran", ext: ["f", "for", "f77", "f90"]},
	  {name: "F#", mime: "text/x-fsharp", mode: "mllike", ext: ["fs"], alias: ["fsharp"]},
	  {name: "Gas", mime: "text/x-gas", mode: "gas", ext: ["s"]},
	  {name: "Gherkin", mime: "text/x-feature", mode: "gherkin", ext: ["feature"]},
	  {name: "GitHub Flavored Markdown", mime: "text/x-gfm", mode: "gfm", file: /^(readme|contributing|history).md$/i},
	  {name: "Go", mime: "text/x-go", mode: "go", ext: ["go"]},
	  {name: "Groovy", mime: "text/x-groovy", mode: "groovy", ext: ["groovy", "gradle"], file: /^Jenkinsfile$/},
	  {name: "HAML", mime: "text/x-haml", mode: "haml", ext: ["haml"]},
	  {name: "Haskell", mime: "text/x-haskell", mode: "haskell", ext: ["hs"]},
	  {name: "Haskell (Literate)", mime: "text/x-literate-haskell", mode: "haskell-literate", ext: ["lhs"]},
	  {name: "Haxe", mime: "text/x-haxe", mode: "haxe", ext: ["hx"]},
	  {name: "HXML", mime: "text/x-hxml", mode: "haxe", ext: ["hxml"]},
	  {name: "ASP.NET", mime: "application/x-aspx", mode: "htmlembedded", ext: ["aspx"], alias: ["asp", "aspx"]},
	  {name: "HTML", mime: "text/html", mode: "htmlmixed", ext: ["html", "htm"], alias: ["xhtml"]},
	  {name: "HTTP", mime: "message/http", mode: "http"},
	  {name: "IDL", mime: "text/x-idl", mode: "idl", ext: ["pro"]},
	  {name: "Pug", mime: "text/x-pug", mode: "pug", ext: ["jade", "pug"], alias: ["jade"]},
	  {name: "Java", mime: "text/x-java", mode: "clike", ext: ["java"]},
	  {name: "Java Server Pages", mime: "application/x-jsp", mode: "htmlembedded", ext: ["jsp"], alias: ["jsp"]},
	  {name: "JavaScript", mimes: ["text/javascript", "text/ecmascript", "application/javascript", "application/x-javascript", "application/ecmascript"],
	   mode: "javascript", ext: ["js"], alias: ["ecmascript", "js", "node"]},
	  {name: "JSON", mimes: ["application/json", "application/x-json"], mode: "javascript", ext: ["json", "map"], alias: ["json5"]},
	  {name: "JSON-LD", mime: "application/ld+json", mode: "javascript", ext: ["jsonld"], alias: ["jsonld"]},
	  {name: "JSX", mime: "text/jsx", mode: "jsx", ext: ["jsx"]},
	  {name: "Jinja2", mime: "null", mode: "jinja2"},
	  {name: "Julia", mime: "text/x-julia", mode: "julia", ext: ["jl"]},
	  {name: "Kotlin", mime: "text/x-kotlin", mode: "clike", ext: ["kt"]},
	  {name: "LESS", mime: "text/x-less", mode: "css", ext: ["less"]},
	  {name: "LiveScript", mime: "text/x-livescript", mode: "livescript", ext: ["ls"], alias: ["ls"]},
	  {name: "Lua", mime: "text/x-lua", mode: "lua", ext: ["lua"]},
	  {name: "Markdown", mime: "text/x-markdown", mode: "markdown", ext: ["markdown", "md", "mkd"]},
	  {name: "mIRC", mime: "text/mirc", mode: "mirc"},
	  {name: "MariaDB SQL", mime: "text/x-mariadb", mode: "sql"},
	  {name: "Mathematica", mime: "text/x-mathematica", mode: "mathematica", ext: ["m", "nb"]},
	  {name: "Modelica", mime: "text/x-modelica", mode: "modelica", ext: ["mo"]},
	  {name: "MUMPS", mime: "text/x-mumps", mode: "mumps", ext: ["mps"]},
	  {name: "MS SQL", mime: "text/x-mssql", mode: "sql"},
	  {name: "mbox", mime: "application/mbox", mode: "mbox", ext: ["mbox"]},
	  {name: "MySQL", mime: "text/x-mysql", mode: "sql"},
	  {name: "Nginx", mime: "text/x-nginx-conf", mode: "nginx", file: /nginx.*\.conf$/i},
	  {name: "NSIS", mime: "text/x-nsis", mode: "nsis", ext: ["nsh", "nsi"]},
	  {name: "NTriples", mimes: ["application/n-triples", "application/n-quads", "text/n-triples"],
	   mode: "ntriples", ext: ["nt", "nq"]},
	  {name: "Objective C", mime: "text/x-objectivec", mode: "clike", ext: ["m", "mm"], alias: ["objective-c", "objc"]},
	  {name: "OCaml", mime: "text/x-ocaml", mode: "mllike", ext: ["ml", "mli", "mll", "mly"]},
	  {name: "Octave", mime: "text/x-octave", mode: "octave", ext: ["m"]},
	  {name: "Oz", mime: "text/x-oz", mode: "oz", ext: ["oz"]},
	  {name: "Pascal", mime: "text/x-pascal", mode: "pascal", ext: ["p", "pas"]},
	  {name: "PEG.js", mime: "null", mode: "pegjs", ext: ["jsonld"]},
	  {name: "Perl", mime: "text/x-perl", mode: "perl", ext: ["pl", "pm"]},
	  {name: "PHP", mime: ["application/x-httpd-php", "text/x-php"], mode: "php", ext: ["php", "php3", "php4", "php5", "php7", "phtml"]},
	  {name: "Pig", mime: "text/x-pig", mode: "pig", ext: ["pig"]},
	  {name: "Plain Text", mime: "text/plain", mode: "null", ext: ["txt", "text", "conf", "def", "list", "log"]},
	  {name: "PLSQL", mime: "text/x-plsql", mode: "sql", ext: ["pls"]},
	  {name: "PowerShell", mime: "application/x-powershell", mode: "powershell", ext: ["ps1", "psd1", "psm1"]},
	  {name: "Properties files", mime: "text/x-properties", mode: "properties", ext: ["properties", "ini", "in"], alias: ["ini", "properties"]},
	  {name: "ProtoBuf", mime: "text/x-protobuf", mode: "protobuf", ext: ["proto"]},
	  {name: "Python", mime: "text/x-python", mode: "python", ext: ["BUILD", "bzl", "py", "pyw"], file: /^(BUCK|BUILD)$/},
	  {name: "Puppet", mime: "text/x-puppet", mode: "puppet", ext: ["pp"]},
	  {name: "Q", mime: "text/x-q", mode: "q", ext: ["q"]},
	  {name: "R", mime: "text/x-rsrc", mode: "r", ext: ["r", "R"], alias: ["rscript"]},
	  {name: "reStructuredText", mime: "text/x-rst", mode: "rst", ext: ["rst"], alias: ["rst"]},
	  {name: "RPM Changes", mime: "text/x-rpm-changes", mode: "rpm"},
	  {name: "RPM Spec", mime: "text/x-rpm-spec", mode: "rpm", ext: ["spec"]},
	  {name: "Ruby", mime: "text/x-ruby", mode: "ruby", ext: ["rb"], alias: ["jruby", "macruby", "rake", "rb", "rbx"]},
	  {name: "Rust", mime: "text/x-rustsrc", mode: "rust", ext: ["rs"]},
	  {name: "SAS", mime: "text/x-sas", mode: "sas", ext: ["sas"]},
	  {name: "Sass", mime: "text/x-sass", mode: "sass", ext: ["sass"]},
	  {name: "Scala", mime: "text/x-scala", mode: "clike", ext: ["scala"]},
	  {name: "Scheme", mime: "text/x-scheme", mode: "scheme", ext: ["scm", "ss"]},
	  {name: "SCSS", mime: "text/x-scss", mode: "css", ext: ["scss"]},
	  {name: "Shell", mimes: ["text/x-sh", "application/x-sh"], mode: "shell", ext: ["sh", "ksh", "bash"], alias: ["bash", "sh", "zsh"], file: /^PKGBUILD$/},
	  {name: "Sieve", mime: "application/sieve", mode: "sieve", ext: ["siv", "sieve"]},
	  {name: "Slim", mimes: ["text/x-slim", "application/x-slim"], mode: "slim", ext: ["slim"]},
	  {name: "Smalltalk", mime: "text/x-stsrc", mode: "smalltalk", ext: ["st"]},
	  {name: "Smarty", mime: "text/x-smarty", mode: "smarty", ext: ["tpl"]},
	  {name: "Solr", mime: "text/x-solr", mode: "solr"},
	  {name: "Soy", mime: "text/x-soy", mode: "soy", ext: ["soy"], alias: ["closure template"]},
	  {name: "SPARQL", mime: "application/sparql-query", mode: "sparql", ext: ["rq", "sparql"], alias: ["sparul"]},
	  {name: "Spreadsheet", mime: "text/x-spreadsheet", mode: "spreadsheet", alias: ["excel", "formula"]},
	  {name: "SQL", mime: "text/x-sql", mode: "sql", ext: ["sql"]},
	  {name: "SQLite", mime: "text/x-sqlite", mode: "sql"},
	  {name: "Squirrel", mime: "text/x-squirrel", mode: "clike", ext: ["nut"]},
	  {name: "Stylus", mime: "text/x-styl", mode: "stylus", ext: ["styl"]},
	  {name: "Swift", mime: "text/x-swift", mode: "swift", ext: ["swift"]},
	  {name: "sTeX", mime: "text/x-stex", mode: "stex"},
	  {name: "LaTeX", mime: "text/x-latex", mode: "stex", ext: ["text", "ltx"], alias: ["tex"]},
	  {name: "SystemVerilog", mime: "text/x-systemverilog", mode: "verilog", ext: ["v", "sv", "svh"]},
	  {name: "Tcl", mime: "text/x-tcl", mode: "tcl", ext: ["tcl"]},
	  {name: "Textile", mime: "text/x-textile", mode: "textile", ext: ["textile"]},
	  {name: "TiddlyWiki ", mime: "text/x-tiddlywiki", mode: "tiddlywiki"},
	  {name: "Tiki wiki", mime: "text/tiki", mode: "tiki"},
	  {name: "TOML", mime: "text/x-toml", mode: "toml", ext: ["toml"]},
	  {name: "Tornado", mime: "text/x-tornado", mode: "tornado"},
	  {name: "troff", mime: "text/troff", mode: "troff", ext: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]},
	  {name: "TTCN", mime: "text/x-ttcn", mode: "ttcn", ext: ["ttcn", "ttcn3", "ttcnpp"]},
	  {name: "TTCN_CFG", mime: "text/x-ttcn-cfg", mode: "ttcn-cfg", ext: ["cfg"]},
	  {name: "Turtle", mime: "text/turtle", mode: "turtle", ext: ["ttl"]},
	  {name: "TypeScript", mime: "application/typescript", mode: "javascript", ext: ["ts"], alias: ["ts"]},
	  {name: "TypeScript-JSX", mime: "text/typescript-jsx", mode: "jsx", ext: ["tsx"], alias: ["tsx"]},
	  {name: "Twig", mime: "text/x-twig", mode: "twig"},
	  {name: "Web IDL", mime: "text/x-webidl", mode: "webidl", ext: ["webidl"]},
	  {name: "VB.NET", mime: "text/x-vb", mode: "vb", ext: ["vb"]},
	  {name: "VBScript", mime: "text/vbscript", mode: "vbscript", ext: ["vbs"]},
	  {name: "Velocity", mime: "text/velocity", mode: "velocity", ext: ["vtl"]},
	  {name: "Verilog", mime: "text/x-verilog", mode: "verilog", ext: ["v"]},
	  {name: "VHDL", mime: "text/x-vhdl", mode: "vhdl", ext: ["vhd", "vhdl"]},
	  {name: "Vue.js Component", mimes: ["script/x-vue", "text/x-vue"], mode: "vue", ext: ["vue"]},
	  {name: "XML", mimes: ["application/xml", "text/xml"], mode: "xml", ext: ["xml", "xsl", "xsd", "svg"], alias: ["rss", "wsdl", "xsd"]},
	  {name: "XQuery", mime: "application/xquery", mode: "xquery", ext: ["xy", "xquery"]},
	  {name: "Yacas", mime: "text/x-yacas", mode: "yacas", ext: ["ys"]},
	  {name: "YAML", mimes: ["text/x-yaml", "text/yaml"], mode: "yaml", ext: ["yaml", "yml"], alias: ["yml"]},
	  {name: "Z80", mime: "text/x-z80", mode: "z80", ext: ["z80"]},
	  {name: "mscgen", mime: "text/x-mscgen", mode: "mscgen", ext: ["mscgen", "mscin", "msc"]},
	  {name: "xu", mime: "text/x-xu", mode: "mscgen", ext: ["xu"]},
	  {name: "msgenny", mime: "text/x-msgenny", mode: "mscgen", ext: ["msgenny"]}
	];
	// Ensure all modes have a mime property for backwards compatibility
	for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
	  var info = CodeMirror.modeInfo[i];
	  if (info.mimes) info.mime = info.mimes[0];
	}

	CodeMirror.findModeByMIME = function(mime) {
	  mime = mime.toLowerCase();
	  for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
		var info = CodeMirror.modeInfo[i];
		if (info.mime == mime) return info;
		if (info.mimes) for (var j = 0; j < info.mimes.length; j++)
		  if (info.mimes[j] == mime) return info;
	  }
	  if (/\+xml$/.test(mime)) return CodeMirror.findModeByMIME("application/xml")
	  if (/\+json$/.test(mime)) return CodeMirror.findModeByMIME("application/json")
	};

	CodeMirror.findModeByExtension = function(ext) {
	  for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
		var info = CodeMirror.modeInfo[i];
		if (info.ext) for (var j = 0; j < info.ext.length; j++)
		  if (info.ext[j] == ext) return info;
	  }
	};

	CodeMirror.findModeByFileName = function(filename) {
	  for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
		var info = CodeMirror.modeInfo[i];
		if (info.file && info.file.test(filename)) return info;
	  }
	  var dot = filename.lastIndexOf(".");
	  var ext = dot > -1 && filename.substring(dot + 1, filename.length);
	  if (ext) return CodeMirror.findModeByExtension(ext);
	};

	CodeMirror.findModeByName = function(name) {
	  name = name.toLowerCase();
	  for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
		var info = CodeMirror.modeInfo[i];
		if (info.name.toLowerCase() == name) return info;
		if (info.alias) for (var j = 0; j < info.alias.length; j++)
		  if (info.alias[j].toLowerCase() == name) return info;
	  }
	};
  });
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
	  mod(require("../../lib/codemirror"), "cjs");
	else if (typeof define == "function" && define.amd) // AMD
	  define(["../../lib/codemirror"], function(CM) { mod(CM, "amd"); });
	else // Plain browser env
	  mod(CodeMirror, "plain");
  })(function(CodeMirror, env) {
	if (!CodeMirror.modeURL) CodeMirror.modeURL = "../mode/%N/%N.js";

	var loading = {};
	function splitCallback(cont, n) {
	  var countDown = n;
	  return function() { if (--countDown == 0) cont(); };
	}
	function ensureDeps(mode, cont) {
	  var deps = CodeMirror.modes[mode].dependencies;
	  if (!deps) return cont();
	  var missing = [];
	  for (var i = 0; i < deps.length; ++i) {
		if (!CodeMirror.modes.hasOwnProperty(deps[i]))
		  missing.push(deps[i]);
	  }
	  if (!missing.length) return cont();
	  var split = splitCallback(cont, missing.length);
	  for (var i = 0; i < missing.length; ++i)
		CodeMirror.requireMode(missing[i], split);
	}

	CodeMirror.requireMode = function(mode, cont) {
	  if (typeof mode != "string") mode = mode.name;
	  if (CodeMirror.modes.hasOwnProperty(mode)) return ensureDeps(mode, cont);
	  if (loading.hasOwnProperty(mode)) return loading[mode].push(cont);

	  var file = CodeMirror.modeURL.replace(/%N/g, mode);
	  if (env == "plain") {
		var script = document.createElement("script");
		script.src = file;
		var others = document.getElementsByTagName("script")[0];
		var list = loading[mode] = [cont];
		CodeMirror.on(script, "load", function() {
		  ensureDeps(mode, function() {
			for (var i = 0; i < list.length; ++i) list[i]();
		  });
		});
		others.parentNode.insertBefore(script, others);
	  } else if (env == "cjs") {
		require(file);
		cont();
	  } else if (env == "amd") {
		requirejs([file], cont);
	  }
	};

	CodeMirror.autoLoadMode = function(instance, mode) {
	  if (!CodeMirror.modes.hasOwnProperty(mode))
		CodeMirror.requireMode(mode, function() {
		  instance.setOption("mode", instance.getOption("mode"));
		});
	};
  });
  // CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Utility function that allows modes to be combined. The mode given
// as the base argument takes care of most of the normal mode
// functionality, but a second (typically simple) mode is used, which
// can override the style of text. Both modes get to parse all of the
// text, but when both assign a non-null style to a piece of code, the
// overlay wins, unless the combine argument was true and not overridden,
// or state.overlay.combineTokens was true, in which case the styles are
// combined.

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
	  mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
	  define(["../../lib/codemirror"], mod);
	else // Plain browser env
	  mod(CodeMirror);
  })(function(CodeMirror) {
  "use strict";

  CodeMirror.overlayMode = function(base, overlay, combine) {
	return {
	  startState: function() {
		return {
		  base: CodeMirror.startState(base),
		  overlay: CodeMirror.startState(overlay),
		  basePos: 0, baseCur: null,
		  overlayPos: 0, overlayCur: null,
		  streamSeen: null
		};
	  },
	  copyState: function(state) {
		return {
		  base: CodeMirror.copyState(base, state.base),
		  overlay: CodeMirror.copyState(overlay, state.overlay),
		  basePos: state.basePos, baseCur: null,
		  overlayPos: state.overlayPos, overlayCur: null
		};
	  },

	  token: function(stream, state) {
		if (stream != state.streamSeen ||
			Math.min(state.basePos, state.overlayPos) < stream.start) {
		  state.streamSeen = stream;
		  state.basePos = state.overlayPos = stream.start;
		}

		if (stream.start == state.basePos) {
		  state.baseCur = base.token(stream, state.base);
		  state.basePos = stream.pos;
		}
		if (stream.start == state.overlayPos) {
		  stream.pos = stream.start;
		  state.overlayCur = overlay.token(stream, state.overlay);
		  state.overlayPos = stream.pos;
		}
		stream.pos = Math.min(state.basePos, state.overlayPos);

		// state.overlay.combineTokens always takes precedence over combine,
		// unless set to null
		if (state.overlayCur == null) return state.baseCur;
		else if (state.baseCur != null &&
				 state.overlay.combineTokens ||
				 combine && state.overlay.combineTokens == null)
		  return state.baseCur + " " + state.overlayCur;
		else return state.overlayCur;
	  },

	  indent: base.indent && function(state, textAfter) {
		return base.indent(state.base, textAfter);
	  },
	  electricChars: base.electricChars,

	  innerMode: function(state) { return {state: state.base, mode: base}; },

	  blankLine: function(state) {
		var baseToken, overlayToken;
		if (base.blankLine) baseToken = base.blankLine(state.base);
		if (overlay.blankLine) overlayToken = overlay.blankLine(state.overlay);

		return overlayToken == null ?
		  baseToken :
		  (combine && baseToken != null ? baseToken + " " + overlayToken : overlayToken);
	  }
	};
  };

	});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineSimpleMode = function(name, states) {
    CodeMirror.defineMode(name, function(config) {
      return CodeMirror.simpleMode(config, states);
    });
  };

  CodeMirror.simpleMode = function(config, states) {
    ensureState(states, "start");
    var states_ = {}, meta = states.meta || {}, hasIndentation = false;
    for (var state in states) if (state != meta && states.hasOwnProperty(state)) {
      var list = states_[state] = [], orig = states[state];
      for (var i = 0; i < orig.length; i++) {
        var data = orig[i];
        list.push(new Rule(data, states));
        if (data.indent || data.dedent) hasIndentation = true;
      }
    }
    var mode = {
      startState: function() {
        return {state: "start", pending: null,
                local: null, localState: null,
                indent: hasIndentation ? [] : null};
      },
      copyState: function(state) {
        var s = {state: state.state, pending: state.pending,
                 local: state.local, localState: null,
                 indent: state.indent && state.indent.slice(0)};
        if (state.localState)
          s.localState = CodeMirror.copyState(state.local.mode, state.localState);
        if (state.stack)
          s.stack = state.stack.slice(0);
        for (var pers = state.persistentStates; pers; pers = pers.next)
          s.persistentStates = {mode: pers.mode,
                                spec: pers.spec,
                                state: pers.state == state.localState ? s.localState : CodeMirror.copyState(pers.mode, pers.state),
                                next: s.persistentStates};
        return s;
      },
      token: tokenFunction(states_, config),
      innerMode: function(state) { return state.local && {mode: state.local.mode, state: state.localState}; },
      indent: indentFunction(states_, meta)
    };
    if (meta) for (var prop in meta) if (meta.hasOwnProperty(prop))
      mode[prop] = meta[prop];
    return mode;
  };

  function ensureState(states, name) {
    if (!states.hasOwnProperty(name))
      throw new Error("Undefined state " + name + " in simple mode");
  }

  function toRegex(val, caret) {
    if (!val) return /(?:)/;
    var flags = "";
    if (val instanceof RegExp) {
      if (val.ignoreCase) flags = "i";
      val = val.source;
    } else {
      val = String(val);
    }
    return new RegExp((caret === false ? "" : "^") + "(?:" + val + ")", flags);
  }

  function asToken(val) {
    if (!val) return null;
    if (val.apply) return val
    if (typeof val == "string") return val.replace(/\./g, " ");
    var result = [];
    for (var i = 0; i < val.length; i++)
      result.push(val[i] && val[i].replace(/\./g, " "));
    return result;
  }

  function Rule(data, states) {
    if (data.next || data.push) ensureState(states, data.next || data.push);
    this.regex = toRegex(data.regex);
    this.token = asToken(data.token);
    this.data = data;
  }

  function tokenFunction(states, config) {
    return function(stream, state) {
      if (state.pending) {
        var pend = state.pending.shift();
        if (state.pending.length == 0) state.pending = null;
        stream.pos += pend.text.length;
        return pend.token;
      }

      if (state.local) {
        if (state.local.end && stream.match(state.local.end)) {
          var tok = state.local.endToken || null;
          state.local = state.localState = null;
          return tok;
        } else {
          var tok = state.local.mode.token(stream, state.localState), m;
          if (state.local.endScan && (m = state.local.endScan.exec(stream.current())))
            stream.pos = stream.start + m.index;
          return tok;
        }
      }

      var curState = states[state.state];
      for (var i = 0; i < curState.length; i++) {
        var rule = curState[i];
        var matches = (!rule.data.sol || stream.sol()) && stream.match(rule.regex);
        if (matches) {
          if (rule.data.next) {
            state.state = rule.data.next;
          } else if (rule.data.push) {
            (state.stack || (state.stack = [])).push(state.state);
            state.state = rule.data.push;
          } else if (rule.data.pop && state.stack && state.stack.length) {
            state.state = state.stack.pop();
          }

          if (rule.data.mode)
            enterLocalMode(config, state, rule.data.mode, rule.token);
          if (rule.data.indent)
            state.indent.push(stream.indentation() + config.indentUnit);
          if (rule.data.dedent)
            state.indent.pop();
          var token = rule.token
          if (token && token.apply) token = token(matches)
          if (matches.length > 2 && rule.token && typeof rule.token != "string") {
            state.pending = [];
            for (var j = 2; j < matches.length; j++)
              if (matches[j])
                state.pending.push({text: matches[j], token: rule.token[j - 1]});
            stream.backUp(matches[0].length - (matches[1] ? matches[1].length : 0));
            return token[0];
          } else if (token && token.join) {
            return token[0];
          } else {
            return token;
          }
        }
      }
      stream.next();
      return null;
    };
  }

  function cmp(a, b) {
    if (a === b) return true;
    if (!a || typeof a != "object" || !b || typeof b != "object") return false;
    var props = 0;
    for (var prop in a) if (a.hasOwnProperty(prop)) {
      if (!b.hasOwnProperty(prop) || !cmp(a[prop], b[prop])) return false;
      props++;
    }
    for (var prop in b) if (b.hasOwnProperty(prop)) props--;
    return props == 0;
  }

  function enterLocalMode(config, state, spec, token) {
    var pers;
    if (spec.persistent) for (var p = state.persistentStates; p && !pers; p = p.next)
      if (spec.spec ? cmp(spec.spec, p.spec) : spec.mode == p.mode) pers = p;
    var mode = pers ? pers.mode : spec.mode || CodeMirror.getMode(config, spec.spec);
    var lState = pers ? pers.state : CodeMirror.startState(mode);
    if (spec.persistent && !pers)
      state.persistentStates = {mode: mode, spec: spec.spec, state: lState, next: state.persistentStates};

    state.localState = lState;
    state.local = {mode: mode,
                   end: spec.end && toRegex(spec.end),
                   endScan: spec.end && spec.forceEnd !== false && toRegex(spec.end, false),
                   endToken: token && token.join ? token[token.length - 1] : token};
  }

  function indexOf(val, arr) {
    for (var i = 0; i < arr.length; i++) if (arr[i] === val) return true;
  }

  function indentFunction(states, meta) {
    return function(state, textAfter, line) {
      if (state.local && state.local.mode.indent)
        return state.local.mode.indent(state.localState, textAfter, line);
      if (state.indent == null || state.local || meta.dontIndentStates && indexOf(state.state, meta.dontIndentStates) > -1)
        return CodeMirror.Pass;

      var pos = state.indent.length - 1, rules = states[state.state];
      scan: for (;;) {
        for (var i = 0; i < rules.length; i++) {
          var rule = rules[i];
          if (rule.data.dedent && rule.data.dedentIfLineStart !== false) {
            var m = rule.regex.exec(textAfter);
            if (m && m[0]) {
              pos--;
              if (rule.next || rule.push) rules = states[rule.next || rule.push];
              textAfter = textAfter.slice(m[0].length);
              continue scan;
            }
          }
        }
        break;
      }
      return pos < 0 ? 0 : state.indent[pos];
    };
  }
});



// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
	  mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
	  define(["../../lib/codemirror"], mod);
	else // Plain browser env
	  mod(CodeMirror);
  })(function(CodeMirror) {
  "use strict";

  CodeMirror.runMode = function(string, modespec, callback, options) {
	var mode = CodeMirror.getMode(CodeMirror.defaults, modespec);
	var ie = /MSIE \d/.test(navigator.userAgent);
	var ie_lt9 = ie && (document.documentMode == null || document.documentMode < 9);

	if (callback.appendChild) {
	  var tabSize = (options && options.tabSize) || CodeMirror.defaults.tabSize;
	  var node = callback, col = 0;
	  node.innerHTML = "";
	  callback = function(text, style) {
		if (text == "\n") {
		  // Emitting LF or CRLF on IE8 or earlier results in an incorrect display.
		  // Emitting a carriage return makes everything ok.
		  node.appendChild(document.createTextNode(ie_lt9 ? '\r' : text));
		  col = 0;
		  return;
		}
		var content = "";
		// replace tabs
		for (var pos = 0;;) {
		  var idx = text.indexOf("\t", pos);
		  if (idx == -1) {
			content += text.slice(pos);
			col += text.length - pos;
			break;
		  } else {
			col += idx - pos;
			content += text.slice(pos, idx);
			var size = tabSize - col % tabSize;
			col += size;
			for (var i = 0; i < size; ++i) content += " ";
			pos = idx + 1;
		  }
		}

		if (style) {
		  var sp = node.appendChild(document.createElement("span"));
		  sp.className = "cm-" + style.replace(/ +/g, " cm-");
		  sp.appendChild(document.createTextNode(content));
		} else {
		  node.appendChild(document.createTextNode(content));
		}
	  };
	}

	var lines = CodeMirror.splitLines(string), state = (options && options.state) || CodeMirror.startState(mode);
	for (var i = 0, e = lines.length; i < e; ++i) {
	  if (i) callback("\n");
	  var stream = new CodeMirror.StringStream(lines[i]);
	  if (!stream.string && mode.blankLine) mode.blankLine(state);
	  while (!stream.eol()) {
		var style = mode.token(stream, state);
		callback(stream.current(), style, i, stream.start, state);
		stream.start = stream.pos;
	  }
	}
  };

  });

  // CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
	  mod(require("../../lib/codemirror"), require("./runmode"));
	else if (typeof define == "function" && define.amd) // AMD
	  define(["../../lib/codemirror", "./runmode"], mod);
	else // Plain browser env
	  mod(CodeMirror);
  })(function(CodeMirror) {
	"use strict";

	var isBlock = /^(p|li|div|h\\d|pre|blockquote|td)$/;

	function textContent(node, out) {
	  if (node.nodeType == 3) return out.push(node.nodeValue);
	  for (var ch = node.firstChild; ch; ch = ch.nextSibling) {
		textContent(ch, out);
		if (isBlock.test(node.nodeType)) out.push("\n");
	  }
	}

	CodeMirror.colorize = function(collection, defaultMode) {
	  if (!collection) collection = document.body.getElementsByTagName("pre");

	  for (var i = 0; i < collection.length; ++i) {
		var node = collection[i];
		var mode = node.getAttribute("data-lang") || defaultMode;
		if (!mode) continue;

		var text = [];
		textContent(node, text);
		node.innerHTML = "";
		CodeMirror.runMode(text.join(""), mode, node);

		node.className += " cm-s-default";
	  }
	};
  });

 CodeMirror.modeURL = "/codemirror/mode/%N/%N.js";
