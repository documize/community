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

import Component from '@ember/component';

export default Component.extend({
    codeBody: "",
    codeSyntax: "htmlmixed",

    didReceiveAttrs() {
        this._super(...arguments);

        if (this.get('isDestroyed') || this.get('isDestroying')) {
            return;
        }

        let page = this.get('page');
        let rawBody = page.get('body');
        let cleanBody = rawBody.replace("</pre>", "").replace('<pre class="code-mirror cm-s-solarized cm-s-dark" data-lang="', "");
        let startPos = cleanBody.indexOf('">');

        if (startPos !== -1) {
            this.set('codeSyntax', cleanBody.substring(0, startPos));
            this.set('codeBody', cleanBody.substring(startPos + 2));
        }

        _.each(_.sortBy(CodeMirror.modeInfo, 'name'), (item) => {
            let i = { mode: item.mode, name: item.name };

            if (item.mode === this.get('codeSyntax')) {
                this.set('codeSyntax', i);
            }
        });
    },

    didInsertElement() {
        this._super(...arguments);

        if (this.get('isDestroyed') || this.get('isDestroying')) {
            return;
        }

        let page = this.get('page');
        let elem = `page-${page.id}-code`;

        var editor = CodeMirror.fromTextArea(document.getElementById(elem), {
            theme: "material",
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 4,
            tabSize: 4,
            value: "",
            dragDrop: false,
            readOnly: true
        });

        let syntax = this.get("codeSyntax");
        if (!_.isUndefined(syntax)) {
            CodeMirror.autoLoadMode(editor, syntax.mode);
            editor.setOption("mode", syntax.mode);
        }

        this.set('codeEditor', editor);
	},

    willDestroyElement() {
        this._super(...arguments);

		let editor = this.get('codeEditor');
		if (!_.isNull(editor)) {
			editor.toTextArea();
			editor = null;
        }

        this.set('codeEditor', null);
    }
});
