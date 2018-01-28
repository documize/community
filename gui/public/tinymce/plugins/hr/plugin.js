(function () {
var hr = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_6bjkyabjjcun3xxm = { register: register };

  var register$1 = function (editor) {
    editor.addButton('hr', {
      icon: 'hr',
      tooltip: 'Horizontal line',
      cmd: 'InsertHorizontalRule'
    });
    editor.addMenuItem('hr', {
      icon: 'hr',
      text: 'Horizontal line',
      cmd: 'InsertHorizontalRule',
      context: 'insert'
    });
  };
  var $_1k15zabkjcun3xxn = { register: register$1 };

  PluginManager.add('hr', function (editor) {
    $_6bjkyabjjcun3xxm.register(editor);
    $_1k15zabkjcun3xxn.register(editor);
  });
  var Plugin = function () {
  };

  return Plugin;

}());
})()
