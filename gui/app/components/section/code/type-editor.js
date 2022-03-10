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

import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
    isDirty: false,
    pageBody: "",
    codeSyntax: null,
	codeEditor: null,
	editorId: computed('page', function () {
		let page = this.get('page');
		return `code-editor-${page.id}`;
	}),
	syntaxId: computed('page', function () {
		let page = this.get('page');
		return `code-editor-syntax-${page.id}`;
	}),

	init() {
        this._super(...arguments);
        this.syntaxOptions = [];

        let self = this;
        let rawBody = this.get('meta.rawBody');
        let cleanBody = rawBody.replace("</pre>", "");

        cleanBody = cleanBody.replace('<pre class="code-mirror cm-s-solarized cm-s-dark" data-lang="', "");
        let startPos = cleanBody.indexOf('">');
        let syntax = {
            mode: "htmlmixed",
            name: "HTML"
        };

        if (startPos !== -1) {
            syntax = cleanBody.substring(0, startPos);
            cleanBody = cleanBody.substring(startPos + 2);
        }

        this.set('pageBody', cleanBody);

        let opts = [];

        _.each(_.sortBy(CodeMirror.modeInfo, 'name'), function(item) {
            let i = { mode: item.mode, name: item.name };
            opts.pushObject(i);

            if (item.mode === syntax) {
                self.set('codeSyntax', i);
            }
        });

        this.set('syntaxOptions', opts);

        // default check
        if (_.isNull(this.get("codeSyntax"))) {
            this.set("codeSyntax", opts.findBy("mode", "htmlmixed"));
        }
    },

    didInsertElement(...args) {
        this._super(...args);
        var editor = CodeMirror.fromTextArea(document.getElementById(this.get('editorId')), {
            theme: "material",
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 4,
            tabSize: 4,
            value: "",
            dragDrop: false
        });

		CodeMirror.commands.save = function(/*instance*/){
			Mousetrap.trigger('ctrl+s');
		};

        let syntax = this.get("codeSyntax");
        if (!_.isUndefined(syntax)) {
            CodeMirror.autoLoadMode(editor, syntax.mode);
            editor.setOption("mode", syntax.mode);
        }

		this.set('codeEditor', editor);
    },

    willDestroyElement(...args) {
        this._super(...args);
		let editor = this.get('codeEditor');

		if (!_.isNull(editor)) {
			editor.toTextArea();
			editor = null;
			this.set('codeEditor', null);
		}
    },

    // Wrap code in PRE tag with language identifier for subsequent rendering.
    getPRE() {
        let codeSyntax = this.get("codeSyntax.mode");
        let body = this.get('codeEditor').getDoc().getValue();

        return `<pre class="code-mirror cm-s-solarized cm-s-dark" data-lang="${codeSyntax}">${body}</pre>`;
    },

    actions: {
        onSyntaxChange(syntax) {
            let editor = this.get('codeEditor');
            CodeMirror.autoLoadMode(editor, syntax.mode);
            editor.setOption("mode", syntax.mode);

            this.set('isDirty', true);
            this.set('codeSyntax', syntax);
        },

        isDirty() {
            return this.get('isDirty') || (this.get('codeEditor').getDoc().isClean() === false);
        },

        onCancel() {
            let cb = this.get('onCancel');
            cb();
        },

        onAction(title) {
            let page = this.get('page');
            let meta = this.get('meta');
            meta.set('rawBody', this.getPRE());
            page.set('title', title);
            page.set('body', meta.get('rawBody'));

            let cb = this.get('onAction');
            cb(page, meta);
        }
    }
});
