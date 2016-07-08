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
	isDirty: false,
	pageBody: "",
	defaultTable: '<table class="wysiwyg-table" style="width: 100%;"><thead><tr><th><br></th><th><br></th><th><br></th><th><br></th></tr></thead><tbody><tr><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td></tr><tr><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td></tr><tr><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td></tr></tbody></table>',

	didReceiveAttrs() {
		this.set('pageBody', this.get('meta.rawBody'));

		if (is.empty(this.get('pageBody'))) {
			this.set('pageBody', this.get('defaultTable'));
		}
	},

	didInsertElement() {
		let self = this;

		$('#table-editor').froalaEditor({
			toolbarButtons: [],
			height: this.get('editorHeight') - 260,
			toolbarInline: true,
			tableResizerOffset: 10
		});

		$('#table-editor').on('froalaEditor.contentChanged', function () {
			self.set('isDirty', true);
		});
	},

	willDestroyElement() {
		$('#table-editor').froalaEditor('destroy');
		$('#table-editor').off('froalaEditor.contentChanged');
	},

	actions: {
		isDirty() {
			return this.get('isDirty');
		},

		onCancel() {
			this.attrs.onCancel();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');

			let body = $("#table-editor").froalaEditor('html.get', true);
			page.set('title', title);

			if (is.empty(body)) {
				body = this.get('defaultTable');
			}

			meta.set('rawBody', body);

			this.attrs.onAction(page, meta);
		}
	}
});