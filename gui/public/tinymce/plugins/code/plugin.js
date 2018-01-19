(function () {
var code = (function () {
  'use strict';

  var PluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var DOMUtils = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

  var getMinWidth = function (editor) {
    return editor.getParam('code_dialog_width', 600);
  };
  var getMinHeight = function (editor) {
    return editor.getParam('code_dialog_height', Math.min(DOMUtils.DOM.getViewPort().h - 200, 500));
  };
  var $_dbpj4q90jcg89c2z = {
    getMinWidth: getMinWidth,
    getMinHeight: getMinHeight
  };

  var setContent = function (editor, html) {
    editor.focus();
    editor.undoManager.transact(function () {
      editor.setContent(html);
    });
    editor.selection.setCursorLocation();
    editor.nodeChanged();
  };
  var getContent = function (editor) {
    return editor.getContent({ source_view: true });
  };
  var $_fnot9m92jcg89c31 = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_dbpj4q90jcg89c2z.getMinWidth(editor);
    var minHeight = $_dbpj4q90jcg89c2z.getMinHeight(editor);
    var win = editor.windowManager.open({
      title: 'Source code',
      body: {
        type: 'textbox',
        name: 'code',
        multiline: true,
        minWidth: minWidth,
        minHeight: minHeight,
        spellcheck: false,
        style: 'direction: ltr; text-align: left'
      },
      onSubmit: function (e) {
        $_fnot9m92jcg89c31.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_fnot9m92jcg89c31.getContent(editor));
  };
  var $_b0n6uj8zjcg89c2x = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_b0n6uj8zjcg89c2x.open(editor);
    });
  };
  var $_3oy8x48yjcg89c2v = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_b0n6uj8zjcg89c2x.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_b0n6uj8zjcg89c2x.open(editor);
      }
    });
  };
  var $_4ueil893jcg89c3a = { register: register$1 };

  PluginManager.add('code', function (editor) {
    $_3oy8x48yjcg89c2v.register(editor);
    $_4ueil893jcg89c3a.register(editor);
    return {};
  });
  var Plugin = function () {
  };

  return Plugin;

}());
})()
