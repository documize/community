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

import { schedule } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
	link: service(),
	pageBody: "",
	pagePreview: "",
	editMode: true,
	codeSyntax: null,
	codeEditor: null,
	editorId: computed('page', function () {
		let page = this.get('page');
		return `markdown-editor-${page.id}`;
	}),
	previewId: computed('page', function () {
		let page = this.get('page');
		return `markdown-preview-${page.id}`;
	}),

	init() {
		this._super(...arguments);
		let body = (!_.isUndefined(this.get('meta'))) ? this.get('meta.rawBody').trim() : '';
		this.set('pageBody', body);
    },

	didInsertElement(...args) {
		this._super(...args);
		this.attachEditor();
    },

    willDestroyElement(...args) {
		this._super(...args);
		let editor = this.get('codeEditor');

		if (this.get('editMode')) {
			editor.toTextArea();
			editor = null;
		}

		this.set('codeEditor', null);
    },

	getBody() {
		return this.get('codeEditor').getDoc().getValue().trim();
	},

	attachEditor() {
		var editor = CodeMirror.fromTextArea(document.getElementById(this.get('editorId')), {
            theme: "default",
			mode: "markdown",
            lineNumbers: false,
            lineWrapping: true,
            indentUnit: 4,
            tabSize: 4,
            value: "",
            dragDrop: false,
			extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
        });

		CodeMirror.commands.save = function(/*instance*/){
			Mousetrap.trigger('ctrl+s');
		};

        this.set('codeEditor', editor);

        let syntax = this.get("codeSyntax");

        if (!_.isUndefined(syntax)) {
            CodeMirror.autoLoadMode(editor, "markdown");
            editor.setOption("mode", "markdown");
        }
	},

	actions: {
		onPreview() {
			this.set('editMode', !this.get('editMode'));

			schedule('afterRender', () => {
				if (this.get('editMode')) {
					this.attachEditor();
				} else {
					this.set('pageBody',this.getBody());
					let md = window.markdownit({ linkify: true, html: true });
					let result = md.render(this.getBody());

					this.set('pagePreview', result);
				}
			});
		},

		onInsertLink(link) {
			let linkMarkdown = this.get('link').buildLink(link);
			this.get('codeEditor').getDoc().replaceSelection(linkMarkdown);

			return true;
		},

		isDirty() {
			return this.get('codeEditor').getDoc().isClean() === false;
		},

		onCancel() {
			let cb = this.get('onCancel');
			cb();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');
			page.set('title', title);
			meta.set('rawBody', this.getBody());

			let cb = this.get('onAction');
			cb(page, meta);
		}
	}
});
