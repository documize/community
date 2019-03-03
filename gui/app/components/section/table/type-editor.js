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

import $ from 'jquery';
import { schedule } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
	isDirty: false,
	pageBody: "",
	editorId: computed('page', function () {
		let page = this.get('page');
		return `table-editor-${page.id}`;
	}),
	defaultTable: '<table class="wysiwyg-table" style="width: 100%;"><thead><tr><th><br></th><th><br></th><th><br></th><th><br></th></tr></thead><tbody><tr><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td></tr><tr><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td></tr><tr><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td><td style="width: 25.0000%;"><br></td></tr></tbody></table>',

	didReceiveAttrs() {
		this._super(...arguments);

		this.set('pageBody', this.get('meta.rawBody'));

		if (_.isEmpty(this.get('pageBody'))) {
			this.set('pageBody', this.get('defaultTable'));
		}
	},

	didInsertElement() {
		this._super(...arguments);

		let id = '#' + this.get('editorId');

		$(id).froalaEditor({
			toolbarButtons: [],
			toolbarInline: true,
			tableResizerOffset: 10
		});

		schedule('afterRender', function() {
			$(id).on('froalaEditor.contentChanged', () => {
				this.set('isDirty', true);  // eslint-disable-line ember/jquery-ember-run
			});
		});
	},

	willDestroyElement() {
		this._super(...arguments);

		$('#' + this.get('editorId')).off('froalaEditor.contentChanged');
	},

	actions: {
		isDirty() {
			return this.get('isDirty');
		},

		onCancel() {
			let cb = this.get('onCancel');
			cb();
		},

		onAction(title) {
			let page = this.get('page');
			let meta = this.get('meta');

			let body = $('#' + this.get('editorId')).froalaEditor('html.get', true);
			page.set('title', title);

			if (_.isEmpty(body)) {
				body = this.get('defaultTable');
			}

			meta.set('rawBody', body);

			let cb = this.get('onAction');
			cb(page, meta);
		}
	}
});
