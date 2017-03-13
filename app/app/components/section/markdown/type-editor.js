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
import TooltipMixin from '../../../mixins/tooltip';

const {
	inject: { service }
} = Ember;

export default Ember.Component.extend(TooltipMixin, {
	link: service(),
	pageBody: "",
	pagePreview: "",
	editMode: true,
	codeSyntax: null,
	codeEditor: null,
	editorId: Ember.computed('page', function () {
		let page = this.get('page');
		return `markdown-editor-${page.id}`;
	}),
	previewId: Ember.computed('page', function () {
		let page = this.get('page');
		return `markdown-preview-${page.id}`;
	}),

	init() {
		this._super(...arguments);

        // let self = this;
        CodeMirror.modeURL = "/codemirror/mode/%N/%N.js";

        this.set('pageBody', this.get('meta.rawBody').trim());

		// let opts = [];
        // let syntax = {
        //     mode: "markdown",
        //     name: "Markdown"
        // };

		// _.each(_.sortBy(CodeMirror.modeInfo, 'name'), function(item) {
		// 	let i = {
		// 		mode: item.mode,
		// 		name: item.name
		// 	};
		// 	opts.pushObject(i);

		// 	if (item.mode === syntax) {
		// 		self.set('codeSyntax', i);
		// 	}
		// });

		// this.set('syntaxOptions', opts);

        // // default check
        // if (is.null(this.get("codeSyntax"))) {
        //     this.set("codeSyntax", opts.findBy("mode", "markdown"));
        // }
    },

	didInsertElement() {
		this.attachEditor();
		this.addTooltip(document.getElementById(this.get('tooltipId')));
    },

    willDestroyElement() {
		let editor = this.get('codeEditor');

		if (this.get('editMode')) {
			editor.toTextArea();
			editor = null;
		}

		this.set('codeEditor', null);
		this.destroyTooltips();
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

        if (is.not.undefined(syntax)) {
            CodeMirror.autoLoadMode(editor, "markdown");
            editor.setOption("mode", "markdown");
        }
	},

	actions: {
		onPreview() {
			this.set('editMode', !this.get('editMode'));

			Ember.run.schedule('afterRender', () => {
				if (this.get('editMode')) {
					this.attachEditor();
				} else {
					this.set('pageBody',this.getBody());
					let md = window.markdownit({ linkify: true });
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
			this.attrs.onCancel();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');
			page.set('title', title);
			meta.set('rawBody', this.getBody());

			this.attrs.onAction(page, meta);
		}
	}
});
