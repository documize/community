// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import Ember from 'ember';

export default Ember.Component.extend({
    codeBody: "",
    codeSyntax: "htmlmixed",

    didReceiveAttrs() {
		if (this.session.get('assetURL') === null) {
			CodeMirror.modeURL = "codemirror/mode/%N/%N.js";
		} else {
			CodeMirror.modeURL = "/codemirror/mode/%N/%N.js";
		}

        let page = this.get('page');
        let rawBody = page.get('body');
        let cleanBody = rawBody.replace("</pre>", "").replace('<pre class="code-mirror cm-s-solarized cm-s-dark" data-lang="', "");
        let startPos = cleanBody.indexOf('">');

        if (startPos !== -1) {
            this.set('codeSyntax', cleanBody.substring(0, startPos));
            this.set('codeBody', cleanBody.substring(startPos + 2));
        }
    },

    didRender() {
        let page = this.get('page');
        let elem = `page-${page.id}-code`;

        var editor = CodeMirror.fromTextArea(document.getElementById(elem), {
            theme: "solarized dark",
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 4,
            tabSize: 4,
            value: "",
            dragDrop: false,
            readOnly: true
        });

        let syntax = this.get("codeSyntax");
        CodeMirror.autoLoadMode(editor, syntax);
        editor.setOption("mode", syntax);

        this.set('codeEditor', editor);
    },

    willDestroyElement() {
        this.set('codeEditor', null);
    }
});
