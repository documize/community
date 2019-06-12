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

import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
	documentService: service('document'),
	sectionService: service('section'),
	editMode: false,
	editPage: null,
	editMeta: null,
	expanded: true,

	didReceiveAttrs() {
		this._super(...arguments);

		if (this.get('isDestroyed') || this.get('isDestroying')) return;

		let pageId = this.get('page.id');

		if (this.get('session.authenticated')) {
			this.workflow();
		}

		if (this.get('toEdit') === pageId && this.get('permissions.documentEdit')) this.send('onEdit');

		// Work out if this section is expanded by default (state stored in browser local storage).
		this.set('expanded', !_.includes(this.get('expandState'), pageId));
	},

	workflow() {
		this.set('editPage', this.get('page'));
        this.set('editMeta', this.get('meta'));
	},

	actions: {
		onSavePage(page, meta) {
			let constants = this.get('constants');

			if (this.get('document.protection') === constants.ProtectionType.Review) {
				if (this.get('page.status') === constants.ChangeState.Published) {
					page.set('relativeId', this.get('page.id'));
				}
				if (this.get('page.status') === constants.ChangeState.PendingNew) {
					page.set('relativeId', '');
				}
			}

			this.set('editMode', false);
			let cb = this.get('onSavePage');
			cb(page, meta);
		},

		onSavePageAsBlock(block) {
			let cb = this.get('onSavePageAsBlock');
			cb(block);
		},

		onCopyPage(documentId) {
			let cb = this.get('onCopyPage');
			cb(this.get('page.id'), documentId);
		},

		onMovePage(documentId) {
			let cb = this.get('onMovePage');
			cb(this.get('page.id'), documentId);
		},

		onDeletePage(deleteChildren) {
			let page = this.get('page');

			if (_.isUndefined(page)) {
				return;
			}

			let params = {
				id: page.get('id'),
				title: page.get('title'),
				children: deleteChildren
			};

			let cb = this.get('onDeletePage');
			cb(params);
		},

		// Calculate if user is editing page or a pending change as per approval process
		onEdit() {
			if (this.get('editMode')) return;
			this.get('toEdit', '');
			this.set('editMode', true);
		},

		onCancelEdit() {
			this.set('editMode', false);
		}
	}
});
