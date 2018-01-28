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
  var $_86a2me91jcun3xjq = {
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
  var $_fket7y93jcun3xjs = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_86a2me91jcun3xjq.getMinWidth(editor);
    var minHeight = $_86a2me91jcun3xjq.getMinHeight(editor);
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
        $_fket7y93jcun3xjs.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_fket7y93jcun3xjs.getContent(editor));
  };
  var $_bsh5at90jcun3xjo = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_bsh5at90jcun3xjo.open(editor);
    });
  };
  var $_ddolia8zjcun3xjn = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_bsh5at90jcun3xjo.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_bsh5at90jcun3xjo.open(editor);
      }
    });
  };
  var $_bach9a94jcun3xju = { register: register$1 };

  PluginManager.add('code', function (editor) {
    $_ddolia8zjcun3xjn.register(editor);
    $_bach9a94jcun3xju.register(editor);
    return {};
  });
  var Plugin = function () {
  };

  return Plugin;

}());
})()
